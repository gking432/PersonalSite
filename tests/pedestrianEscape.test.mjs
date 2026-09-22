import test from "node:test";
import assert from "node:assert/strict";
import {
  hiddenFromCamera,
  updateEscape,
} from "../src/features/traffic/pedestrianEscape.js";
import { PedestrianReactions } from "../src/features/traffic/pedestrianReactions.js";
import {
  DISCOVERIES,
  Discoveries,
} from "../src/features/traffic/littleMilwaukee.js";
import { helicopterFlight } from "../src/features/traffic/helicopterFlight.js";
import { walkRoute } from "../src/features/traffic/pedestrianNavigation.js";

const world = (extra = {}) => ({
  camera: [10, 4, 0],
  buildings: [[-1, 0.4, -1, 1, 4, 1]],
  obstacles: [[-1, -1, 1, 1]],
  water: [],
  cars: [],
  boats: [],
  lightsOn: false,
  bridgeOpen: false,
  ...extra,
});
const runner = (x = 2, z = 0) => ({
  phase: "running",
  x,
  z,
  yaw: 0,
  time: 0,
  needsPlan: true,
  replans: 0,
});
function advance(s, id, w, seconds) {
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    s.time += 1 / 60;
    updateEscape(s, id, 1 / 60, w);
  }
}
test("pedestrians use camera height and buildings to hide, then move when the camera finds them", () => {
  const w = world(),
    s = runner();
  assert.ok(hiddenFromCamera([-1.3, 0.82, 0], w.camera, w.buildings));
  assert.equal(
    hiddenFromCamera([-1.3, 0.82, 0], [10, 200, 0], w.buildings),
    false,
  );
  advance(s, "apartmentWalk", w, 5);
  assert.equal(s.phase, "hiding");
  const stop = [s.x, s.z];
  advance(s, "apartmentWalk", w, 30);
  assert.deepEqual([s.x, s.z], stop);
  w.camera = [-10, 4, 0];
  advance(s, "apartmentWalk", w, 0.5);
  assert.equal(s.phase, "running");
  advance(s, "apartmentWalk", w, 5);
  assert.equal(s.phase, "hiding");
  assert.ok(hiddenFromCamera([s.x, 0.82, s.z], w.camera, w.buildings));
  assert.notDeepEqual([s.x, s.z], stop);
});
test("strict pedestrian routes go around obstacles and refuse enclosed endpoints", () => {
  const route = walkRoute([-3, 0], [3, 0], [[-1, -1, 1, 1]], { strict: true });
  assert.ok(route.length > 2);
  for (let i = 1; i < route.length; i++)
    for (let t = 0; t <= 1; t += 0.01) {
      const x = route[i - 1][0] + (route[i][0] - route[i - 1][0]) * t;
      const z = route[i - 1][1] + (route[i][1] - route[i - 1][1]) * t;
      assert.ok(Math.abs(x) > 1.13 || Math.abs(z) > 1.13);
    }
  assert.deepEqual(
    walkRoute([-3, 0], [0, 0], [[-1, -1, 1, 1]], { strict: true }),
    [],
  );
});
test("an enclosed pedestrian waits safely instead of teleporting to an old path", () => {
  const s = runner(0, 0);
  advance(s, "apartmentWalk", world(), 2);
  assert.equal(s.phase, "hiding");
  assert.deepEqual([s.x, s.z], [0, 0]);
});
test("exactly one resident can enter the lit building and trigger its single window event", () => {
  const w = world({ lightsOn: true }),
    s = runner(5.1, 3.58);
  advance(s, "cityWalk", w, 2);
  assert.equal(s.phase, "inside");
  const before = s.windowZ;
  advance(s, "cityWalk", w, 1);
  assert.notEqual(s.windowZ, before);
  const p = new PedestrianReactions();
  p.environment = w;
  p.lightsOn = true;
  p.states.cityWalk = s;
  const definition = DISCOVERIES.find((d) => d.id === "cityWalk");
  assert.ok(p.click(definition, 0));
  assert.equal(s.phase, "window-hit");
  assert.ok(s.windowBroken);
  p.tick(2.1);
  assert.equal(s.phase, "retired");
  assert.equal(p.click(definition, 0), false);
  for (const d of DISCOVERIES.filter(
    (d) => d.loopDuration && d.id !== "cityWalk",
  )) {
    const other = runner(5.1, 3.58);
    advance(other, d.id, w, 0.02);
    assert.notEqual(other.destination?.kind, "interior");
    p.states[d.id] = { ...s, phase: "inside" };
    assert.equal(p.click(d, 0), false);
  }
  const dark = runner(5.1, 3.58);
  advance(dark, "cityWalk", world(), 0.02);
  assert.notEqual(dark.destination?.kind, "interior");
});
test("a chased resident enters a stopped ordinary car and travels with that car", () => {
  const w = world({
      cars: [
        { id: 1, x: 3, z: 0, yaw: 0, speed: 0, service: true },
        { id: 2, x: 3, z: 0, yaw: 0, speed: 0 },
      ],
    }),
    s = { ...runner(2.5, 0), replans: 2 };
  advance(s, "apartmentWalk", w, 1);
  assert.equal(s.phase, "riding");
  assert.equal(s.carrier.id, 2);
  w.cars[1].x = 4.2;
  advance(s, "apartmentWalk", w, 0.1);
  assert.equal(s.x, 4.2);
  w.cars.pop();
  advance(s, "apartmentWalk", w, 0.1);
  assert.equal(s.phase, "away");
});
test("residents board nearby boats and follow them, but never teleport onto departed boats", () => {
  const w = world({ boats: [{ id: 9, x: -5.8, z: 3, yaw: 0 }] }),
    s = { ...runner(-4.6, 3), replans: 2 };
  advance(s, "apartmentWalk", w, 1);
  assert.equal(s.phase, "riding");
  assert.equal(s.carrier.kind, "boat");
  w.boats[0].z = 3.5;
  advance(s, "apartmentWalk", w, 0.1);
  assert.equal(s.z, 3.5);
  const late = { ...runner(-3, 3), replans: 2 };
  advance(late, "apartmentWalk", w, 0.02);
  w.boats = [];
  advance(late, "apartmentWalk", w, 2);
  assert.notEqual(late.phase, "riding");
});
test("bridge shelter gives way to swimming when opened, and lake walkers can jump into the lake", () => {
  const w = world(),
    s = { ...runner(-4.42, 1.14), replans: 2 };
  advance(s, "pedestrians", w, 1);
  assert.equal(s.phase, "underbridge");
  advance(s, "pedestrians", w, 20);
  assert.equal(s.phase, "underbridge");
  w.bridgeOpen = true;
  advance(s, "pedestrians", w, 0.1);
  assert.equal(s.phase, "swimming");
  const z = s.z;
  advance(s, "pedestrians", w, 1);
  assert.ok(s.z > z);
  const lake = { ...runner(3, 10.4), replans: 2 };
  advance(lake, "lakeWalk", w, 1);
  assert.equal(lake.phase, "swimming");
  assert.ok(lake.z > 11.3);
});
test("the helicopter patrol stays airborne through a held heist response and lands afterward", () => {
  const d = new Discoveries();
  for (const id of ["bankClock", "payphone", "manhole"]) d.trigger(id);
  for (let i = 0; i < 60 * 80; i++) d.tick(1 / 60);
  assert.ok(d.heistFlight);
  assert.notEqual(d.heist.time, null);
  const before = helicopterFlight(d.helicopterTime());
  d.tick(1);
  const after = helicopterFlight(d.helicopterTime());
  assert.ok(before.y > 6 && after.y > 6);
  assert.notEqual(before.x, after.x);
  d.heist.time = null;
  for (let i = 0; i < 60 * 20; i++) d.tick(1 / 60);
  assert.equal(d.heistFlight, null);
  assert.equal(helicopterFlight(d.helicopterTime()).phase, "parked");
});
test("triggering a heist while the helicopter is landing finishes the landing before relaunching", () => {
  const d = new Discoveries();
  d.trigger("helicopter");
  d.tick(19);
  const before = helicopterFlight(d.helicopterTime());
  for (const id of ["bankClock", "payphone", "manhole"]) d.trigger(id);
  assert.deepEqual(helicopterFlight(d.helicopterTime()), before);
  for (let i = 0; i < 60 * 10; i++) d.tick(1 / 60);
  assert.equal(d.heistFlight.returning, null);
  assert.ok(helicopterFlight(d.helicopterTime()).y > 6);
});
