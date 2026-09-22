import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  carPose,
} from "../src/features/traffic/trafficSimulation.js";
import { Discoveries } from "../src/features/traffic/littleMilwaukee.js";
import { sailboatPose } from "../src/features/traffic/sailboatMotion.js";
const run = (sim, seconds) => {
  for (let i = 0; i < Math.round(seconds * 120); i++) sim.tick(1 / 120);
};
function setup() {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  s.nextArrival = s.bridge.nextBoat = Infinity;
  s.hop.enabled = true;
  s.hop.next = 0;
  return s;
}
test("The Hop waits behind a car at a red light and releases only with traffic", () => {
  const s = setup();
  s.signals.water.color = "red";
  s.spawn(0);
  Object.assign(s.cars[0], { p: -2.16, speed: 0, turn: "straight" });
  run(s, 8);
  const tram = s.hop.car();
  assert.ok(tram?.hop);
  assert.equal(s.hop.doors, 0);
  assert.ok(
    carPose(tram).z <
      carPose(s.cars[0]).z - (tram.length + s.cars[0].length) / 2 - 0.19,
  );
  assert.ok(tram.speed < 0.01);
  s.signals.water.color = "green";
  run(s, 6);
  assert.ok(carPose(tram).z > 0);
});
test("The Hop completes repeated continuous circuits, dwells at both stops, and closes its doors before moving", () => {
  const s = setup();
  s.signals.water.color = s.signals.wisconsin.color = "green";
  let last = null,
    doorFrames = 0;
  const visited = new Set();
  for (let i = 0; i < 180 * 120; i++) {
    s.tick(1 / 120);
    const tram = s.hop.car();
    if (!tram) continue;
    const p = carPose(tram);
    if (last) assert.ok(Math.hypot(p.x - last.x, p.z - last.z) < 0.021);
    if (s.hop.doors > 0.01) {
      assert.equal(tram.speed, 0);
      doorFrames++;
      visited.add(s.hop.served);
    }
    last = p;
  }
  assert.ok(s.hop.stops >= 8);
  assert.ok(doorFrames > 1000);
  assert.deepEqual([...visited].sort(), ["Broadway", "Public Market"]);
  assert.equal(s.cars.length, 1);
  assert.equal(s.crashes, 0);
});
test("a lost streetcar returns from a real entry after a delay and reset clears its service", () => {
  const s = setup();
  run(s, 1);
  const original = s.hop.carId;
  s.drop(s.hop.car(), "crash");
  run(s, 5);
  assert.equal(s.hop.car(), undefined);
  run(s, 14);
  assert.notEqual(s.hop.carId, original);
  assert.ok(s.hop.car());
  s.reset();
  assert.equal(s.hop.enabled, false);
  assert.equal(s.hop.carId, null);
  assert.equal(s.hop.doors, 0);
});
test("landmark interactions finish and reset without touching traffic signals", () => {
  const d = new Discoveries();
  for (const id of [
    "clockTower",
    "fonz",
    "gertie",
    "sailboat0",
    "sailboat1",
    "sailboat2",
  ])
    assert.ok(d.trigger(id));
  run(d, 13);
  assert.deepEqual(d.snapshot().busy, []);
  d.reset();
  assert.deepEqual(d.counts, {});
});
test("sailboat clicks heel and tack in the lake, then join the ambient route continuously", () => {
  for (let i = 0; i < 3; i++) {
    const idle = sailboatPose(i, 20),
      start = sailboatPose(i, 20, 0),
      end = sailboatPose(i, 20, 8);
    for (const key of ["x", "z", "yaw", "heel"]) {
      assert.ok(Math.abs(start[key] - idle[key]) < 1e-8);
      assert.ok(Math.abs(end[key] - idle[key]) < 1e-8);
    }
    let last = start;
    for (let t = 0.01; t <= 8; t += 0.01) {
      const p = sailboatPose(i, 20, t);
      assert.ok(p.z > 11.7);
      assert.ok(Math.hypot(p.x - last.x, p.z - last.z) < 0.03);
      last = p;
    }
    assert.ok(sailboatPose(i, 20, 2).wake > 0.6);
    assert.notEqual(sailboatPose(i, 20, 2).sail, 0);
  }
});
