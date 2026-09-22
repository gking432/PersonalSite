import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  carPose,
  STOP_LINE,
  BLOCK_SPACING,
} from "../src/features/traffic/trafficSimulation.js";
import {
  DISCOVERIES,
  Discoveries,
} from "../src/features/traffic/littleMilwaukee.js";
const run = (s, seconds) => {
  for (let i = 0; i < Math.round(seconds * 120); i++) s.tick(1 / 120);
};
function setup() {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  s.nextArrival = 10000;
  s.bridge.nextBoat = 10000;
  return s;
}
test("homepage stays idle until activation and keeps two fixed junctions without increasing traffic difficulty", () => {
  const s = new TrafficSimulation(() => 0.5);
  run(s, 30);
  assert.equal(s.cars.length, 0);
  assert.equal(s.bridge.boats.length, 0);
  s.start();
  s.passed = 10000;
  run(s, 180);
  assert.equal(s.interval, 3.5);
  assert.ok(s.passed > 10000);
  assert.ok(s.cars.every((c) => [0, 1].includes(c.junction)));
  assert.ok(s.roundaboutPassed > 0);
  assert.equal(s.level, undefined);
  assert.equal(s.gameOver, undefined);
  assert.equal(s.district, undefined);
  assert.ok(s.cars.length < 40);
  assert.ok(s.bridge.boats.length <= 6);
});
test("all roundabout routes stay continuous, go around the fountain and join the correct exit", () => {
  for (let lane = 0; lane < 4; lane++)
    for (const turn of ["left", "straight", "right"]) {
      let before = carPose({ junction: 1, lane, turn, p: -9.5 });
      for (let p = -9.49; p < 21; p += 0.01) {
        const pose = carPose({ junction: 1, lane, turn, p });
        assert.ok(Math.hypot(pose.x - before.x, pose.z - before.z) < 0.011);
        assert.ok(Math.hypot(pose.x - BLOCK_SPACING, pose.z) > 1.4);
        before = pose;
      }
      assert.equal(
        before.exitLane,
        (lane + (turn === "left" ? 3 : turn === "right" ? 1 : 0)) % 4,
      );
      assert.ok(before.out > 9.75);
    }
});
test("cars move continuously between the original intersection and the fountain square in both directions", () => {
  for (const [junction, lane] of [
    [0, 3],
    [1, 1],
  ]) {
    const s = setup();
    s.signals.wisconsin.color = "green";
    s.spawn(lane, junction);
    const car = s.cars[0];
    car.turn = "straight";
    let before = carPose(car),
      transferred = false;
    for (let i = 0; i < 3000 && s.cars.includes(car); i++) {
      s.tick(1 / 120);
      const pose = carPose(car);
      assert.ok(Math.hypot(pose.x - before.x, pose.z - before.z) < 0.021);
      if (car.junction !== junction) transferred = true;
      before = pose;
    }
    assert.ok(transferred);
    assert.ok(s.passed > 0);
  }
});
test("roundabout yields without lights, overlapping vehicles or starving an approach", () => {
  const s = setup();
  s.signals.water.color = s.signals.wisconsin.color = "red";
  for (let wave = 0; wave < 3; wave++) {
    for (let lane = 0; lane < 4; lane++) {
      s.spawn(lane, 1);
      Object.assign(s.cars.at(-1), {
        p: -3 - wave * 1.3,
        turn: ["left", "straight", "right"][wave],
        length: wave === 0 ? 1.08 : 0.72,
      });
    }
  }
  for (let step = 0; step < 120 * 100; step++) {
    s.tick(1 / 120);
    const inRing = s.cars.filter(
      (car) =>
        car.junction === 1 &&
        car.lakeFrom === undefined &&
        car.committed &&
        (carPose(car).out === null || carPose(car).out < 2.68),
    );
    assert.ok(inRing.length <= 1, "only admit a car when the ring has cleared");
    const ringCars = s.cars.filter((car) => car.junction === 1);
    for (let i = 0; i < ringCars.length; i++)
      for (let j = i + 1; j < ringCars.length; j++) {
        const a = carPose(ringCars[i]),
          b = carPose(ringCars[j]);
        assert.ok(
          Math.hypot(a.x - b.x, a.z - b.z) > 0.38,
          "car centers must not overlap",
        );
      }
  }
  assert.equal(s.roundaboutPassed, 12);
  assert.equal(s.crashes, 0);
  assert.equal(s.overflowed, 0);
  assert.deepEqual(s.snapshot().signals, { water: "red", wisconsin: "red" });
});
test("discoveries run once per click, return to rest, connect helicopter to birds and reset", () => {
  const d = new Discoveries();
  assert.equal(d.trigger("missing"), false);
  assert.equal(d.trigger("helicopter"), true);
  assert.equal(d.trigger("helicopter"), false);
  assert.ok("pigeons" in d.active);
  for (const item of DISCOVERIES) d.trigger(item.id);
  assert.equal(d.windows, true);
  d.tick(30);
  assert.deepEqual(d.snapshot().busy, []);
  assert.equal(d.trigger("musician"), true);
  d.tick(2.99);
  assert.ok("musician" in d.active);
  d.tick(0.02);
  assert.ok(!("musician" in d.active));
  d.trigger("windows");
  assert.equal(d.windows, false);
  const s = setup();
  s.discoveries.trigger("helicopter");
  s.discoveries.trigger("windows");
  s.reset();
  assert.deepEqual(s.discoveries.snapshot(), {
    busy: [],
    windows: false,
    counts: {},
    heist: { plays: 0, running: false, phase: "idle" },
  });
});
test("the homepage spaces car arrivals without slowing cars along their paths", () => {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  run(s, 0.1);
  assert.equal(s.nextId, 2);
  assert.equal(s.cars[0].speed, 2.4);
  run(s, 3.8);
  assert.equal(s.nextId, 2);
  run(s, 0.2);
  assert.equal(s.nextId, 3);
});
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
test("natural randomized arrivals can collide with both roads green, without injecting cars into the intersection", () => {
  const crashes = [];
  for (const seed of [1, 3, 5, 8]) {
    const s = new TrafficSimulation(seededRandom(seed));
    s.start();
    s.toggle("wisconsin");
    run(s, 180);
    crashes.push(s.crashes);
    assert.ok(
      s.nextId > 40 && s.nextId < 75,
      "random bunches keep the overall arrival rate modest",
    );
    assert.ok(s.events.some((event) => event.reason === "crash"));
  }
  assert.ok(crashes.every((count) => count > 0));
  const stopped = new TrafficSimulation(seededRandom(1));
  stopped.start();
  stopped.toggle("water");
  run(stopped, 180);
  assert.equal(stopped.crashes, 0);
});
test("arrival timing and approaches vary, with both quiet gaps and occasional groups", () => {
  const s = new TrafficSimulation(seededRandom(1));
  s.start();
  let before = 0;
  const arrivals = [];
  for (let i = 0; i < 120 * 120; i++) {
    s.tick(1 / 120);
    if (s.nextId !== before) {
      if (before)
        arrivals.push({
          time: s.time,
          lane: s.cars.at(-1).lane,
          junction: s.cars.at(-1).junction,
        });
      before = s.nextId;
    }
  }
  const gaps = arrivals
    .slice(1)
    .map((entry, i) => entry.time - arrivals[i].time);
  assert.ok(gaps.some((gap) => gap < 0.7));
  assert.ok(gaps.some((gap) => gap > 4.5));
  assert.ok(new Set(gaps.map((gap) => gap.toFixed(2))).size > 10);
  assert.equal(
    new Set(arrivals.map(({ lane, junction }) => `${junction}:${lane}`)).size,
    4,
  );
});
test("the original discoveries remain in the original city footprint", () => {
  for (const item of DISCOVERIES.filter(
    (item) =>
      ![
        "fountain",
        "clockTower",
        "hop",
        "sailboat0",
        "sailboat1",
        "sailboat2",
        "lakeWalk",
        "museumWalk",
        "apartmentWalk",
        "cityWalk",
        "lakeBench",
        "parkBench",
        "balconyResident",
      ].includes(item.id),
  )) {
    assert.ok(Math.abs(item.point[0]) < 7.2, item.id);
    assert.ok(Math.abs(item.point[2]) < 6.9, item.id);
  }
});
test("boats wait eighteen seconds to arrive, then leave thirty-five to fifty seconds between arrivals", () => {
  for (const random of [0, 0.5, 1]) {
    const s = new TrafficSimulation(() => random);
    s.start();
    s.nextArrival = Infinity;
    run(s, 17.9);
    assert.equal(s.bridge.nextId, 1);
    run(s, 0.2);
    assert.equal(s.bridge.nextId, 2);
    const delay = 35 + random * 15;
    run(s, delay - 0.2);
    assert.equal(s.bridge.nextId, 2);
    run(s, 0.3);
    assert.equal(s.bridge.nextId, 3);
  }
});
test("each road changes only on its own click, including amber, repeated clicks and long waits", () => {
  const s = setup();
  s.toggle("water");
  assert.equal(s.signals.water.color, "amber");
  assert.equal(s.signals.wisconsin.color, "red");
  s.toggle("water");
  run(s, 0.7);
  assert.equal(s.signals.water.color, "red");
  assert.equal(s.signals.wisconsin.color, "red");
  run(s, 60);
  assert.equal(s.signals.water.color, "red");
  assert.equal(s.signals.wisconsin.color, "red");
  s.toggle("wisconsin");
  assert.equal(s.signals.water.color, "red");
  assert.equal(s.signals.wisconsin.color, "green");
  s.toggle("water");
  run(s, 60);
  assert.equal(s.signals.water.color, "green");
  assert.equal(s.signals.wisconsin.color, "green");
  s.toggle("wisconsin");
  run(s, 0.7);
  assert.equal(s.signals.water.color, "green");
  assert.equal(s.signals.wisconsin.color, "red");
});
test("red-light queues overflow off the edge and resume when the light changes", () => {
  const s = setup();
  for (let i = 0; i < 12; i++) {
    s.spawn(1);
    run(s, 2);
  }
  assert.ok(s.overflowed > 0);
  assert.ok(
    s.events.some((e) => e.kind === "overflow" && e.reason === "overflow"),
  );
  assert.ok(s.cars.every((c) => c.p <= STOP_LINE + 0.01));
  s.toggle("wisconsin");
  run(s, 15);
  assert.ok(s.passed > 0);
});
test("crashes eject both cars immediately and leave no persistent wreck or cleanup state", () => {
  const s = setup();
  s.spawn(0);
  s.spawn(1);
  s.cars.forEach((c, i) =>
    Object.assign(c, {
      p: i ? 0.57 : -0.57,
      turn: "straight",
      committed: true,
      speed: 0,
    }),
  );
  s.tick(1 / 120);
  assert.equal(s.crashes, 1);
  assert.equal(s.cars.length, 0);
  assert.equal(
    s.events.filter((e) => e.kind === "overflow" && e.reason === "crash")
      .length,
    2,
  );
  assert.equal(s.incidents, undefined);
  s.spawn(0);
  run(s, 35);
  assert.ok(s.passed > 0);
});
test("boat queues overflow from either river edge while the bridge is closed", () => {
  const s = setup();
  s.bridge.nextBoat = Infinity;
  for (let i = 0; i < 60; i++) {
    s.bridge.spawn(s.events);
    run(s, 2.5);
  }
  assert.ok(s.bridge.overflowed > 0);
  assert.ok(s.bridge.boats.length <= 30);
  const falls = s.events.filter((e) => e.kind === "boat-fall");
  assert.ok(falls.some((e) => e.boat.direction === 1));
  assert.ok(falls.some((e) => e.boat.direction === -1));
});
test("opening a loaded bridge ejects its cars immediately and boats then pass through", () => {
  const s = setup();
  s.spawn(1);
  Object.assign(s.cars[0], { p: 5.9, turn: "straight", committed: true });
  s.bridge.spawn(s.events);
  s.bridge.boats[0].p = -2.3;
  s.toggleBridge();
  s.tick(1 / 120);
  assert.equal(s.bridge.phase, "opening");
  assert.ok(s.bridge.lift > 0);
  s.cars = [];
  run(s, 55);
  assert.ok(s.bridge.passed > 0);
  assert.equal(s.bridge.phase, "open");
});
test("closing onto a crossing boat ejects it, and river traffic remains playable", () => {
  const s = setup();
  s.bridge.lift = 1;
  s.bridge.requestedOpen = true;
  s.bridge.spawn(s.events);
  Object.assign(s.bridge.boats[0], { p: 0, committed: true });
  s.toggleBridge();
  run(s, 0.5);
  assert.equal(s.bridge.crashes, 1);
  assert.equal(s.bridge.boats.length, 0);
  assert.ok(
    s.events.some((e) => e.kind === "boat-fall" && e.reason === "crash"),
  );
  s.toggleBridge();
  s.bridge.spawn(s.events);
  run(s, 55);
  assert.ok(s.bridge.passed > 0);
});
test("all twelve turning routes stay continuous on the single intersection", () => {
  for (let lane = 0; lane < 4; lane++)
    for (const turn of ["left", "straight", "right"]) {
      let before = carPose({ lane, turn, p: -9.5 });
      for (let p = -9.49; p < 14; p += 0.01) {
        const next = carPose({ lane, turn, p });
        assert.ok(Math.hypot(next.x - before.x, next.z - before.z) < 0.011);
        before = next;
      }
    }
});
test("reset clears car and boat falls and returns to idle", () => {
  const s = setup();
  s.nextArrival = 0;
  s.bridge.nextBoat = 0;
  run(s, 60);
  s.reset();
  assert.equal(s.started, false);
  assert.equal(s.cars.length, 0);
  assert.equal(s.bridge.boats.length, 0);
  assert.equal(s.events.length, 0);
  assert.equal(s.bridge.overflowed, 0);
  assert.equal(s.crashes, 0);
});

test("river boats follow the continuous bend in separate opposing lanes", async () => {
  const {
    riverPoint,
    riverBoatPose,
    RIVER_ARC_END,
    RIVER_BEND,
    boatEntry,
    boatExit,
  } = await import("../src/features/traffic/waterfront.js");
  for (const joint of [-RIVER_ARC_END, -RIVER_BEND]) {
    const a = riverPoint(joint - 0.0001),
      b = riverPoint(joint + 0.0001);
    assert.ok(Math.hypot(a.x - b.x, a.z - b.z) < 0.0003);
    assert.ok(Math.hypot(a.dx - b.dx, a.dz - b.dz) < 0.0001);
  }
  for (const direction of [-1, 1]) {
    let before = riverBoatPose({ direction, p: boatEntry(direction) });
    for (
      let p = boatEntry(direction) + 0.01;
      p <= boatExit(direction);
      p += 0.01
    ) {
      const next = riverBoatPose({ direction, p });
      assert.ok(Math.hypot(next.x - before.x, next.z - before.z) < 0.012);
      const other = riverBoatPose({ direction: -direction, p: -p });
      assert.ok(
        Math.abs(Math.hypot(next.x - other.x, next.z - other.z) - 0.7) <
          0.000001,
      );
      before = next;
    }
  }
});
test("lake occupies the long edge opposite apartments and fades completely at its outer boundaries", async () => {
  const { lakeOpacity, WATERFRONT_WALKS } = await import(
    "../src/features/traffic/waterfront.js"
  );
  for (const x of [-5, 0, 10, 20]) {
    assert.ok(lakeOpacity(x, 11.8) > 0.8);
    assert.equal(lakeOpacity(x, 9.7), 0);
    assert.equal(lakeOpacity(x, 22), 0);
    assert.ok(lakeOpacity(x, 19) < lakeOpacity(x, 15));
  }
  for (const z of [11, 15, 20]) {
    assert.equal(lakeOpacity(-15, z), 0);
    assert.equal(lakeOpacity(32, z), 0);
  }
  assert.ok(WATERFRONT_WALKS.find((w) => w.id === "lakeWalk").point[2] > 10);
  assert.ok(
    WATERFRONT_WALKS.find((w) => w.id === "apartmentWalk").point[2] < -8,
  );
});
test("fixed river bridges clear boat masts and their road ramps meet street level", async () => {
  const { riverBridgeHeight, RIVER_BRIDGE_START, RIVER_BRIDGE_END } =
    await import("../src/features/traffic/waterfront.js");
  for (const x of [0, 14.4]) {
    assert.equal(riverBridgeHeight(x, RIVER_BRIDGE_START), 0);
    assert.equal(riverBridgeHeight(x, RIVER_BRIDGE_END), 0);
    for (const z of [-8.55, -7.85])
      assert.ok(0.175 + riverBridgeHeight(x, z) > 1.16);
  }
});
test("helicopter lifts vertically, follows its nose during circuits, then lands back on its pad", async () => {
  const { helicopterFlight: flight, FLIGHT_DURATION } = await import(
    "../src/features/traffic/helicopterFlight.js"
  );
  const idle = flight();
  for (const t of [1.3, 2, 3.7]) {
    const p = flight(t);
    assert.equal(p.x, idle.x);
    assert.equal(p.z, idle.z);
    assert.ok(p.y > idle.y);
  }
  for (let t = 5; t < 17; t += 0.15) {
    const p = flight(t),
      next = flight(t + 0.0001),
      dx = next.x - p.x,
      dz = next.z - p.z;
    assert.ok(
      (dx * Math.sin(p.yaw) + dz * Math.cos(p.yaw)) / Math.hypot(dx, dz) >
        0.999,
    );
    assert.ok(Math.abs(p.bank) < 0.15);
  }
  const landed = flight(FLIGHT_DURATION);
  for (const key of ["x", "y", "z", "yaw", "pitch", "bank", "power"])
    assert.equal(landed[key], idle[key]);
});
test("secret heist requires the ordered clues, expires partial attempts and ignores repeats while running", async () => {
  const { SecretHeist, HEIST_SEQUENCE } = await import(
    "../src/features/traffic/secretHeist.js"
  );
  const h = new SecretHeist();
  for (const id of ["payphone", "bankClock", "manhole"]) h.click(id);
  assert.equal(h.time, null);
  h.click("bankClock");
  h.tick(21);
  h.click("payphone");
  h.click("manhole");
  assert.equal(h.time, null);
  HEIST_SEQUENCE.forEach((id) => h.click(id));
  assert.equal(h.time, 0);
  assert.equal(h.plays, 1);
  h.tick(5);
  HEIST_SEQUENCE.forEach((id) => h.click(id));
  assert.equal(h.time, 5);
  assert.equal(h.plays, 1);
  h.tick(14);
  assert.equal(h.snapshot().phase, "response");
  h.tick(60);
  assert.equal(h.time, 19);
  h.responseReady = true;
  assert.equal(h.snapshot().phase, "investigation");
  h.tick(14.9);
  assert.equal(h.snapshot().phase, "investigation");
  h.tick(0.2);
  assert.equal(h.snapshot().phase, "departure");
  h.tick(9);
  assert.equal(h.snapshot().phase, "departure");
  h.responseComplete = true;
  h.tick(0.01);
  assert.equal(h.snapshot().phase, "idle");
  HEIST_SEQUENCE.forEach((id) => h.click(id));
  assert.equal(h.plays, 2);
});
test("heist and separate walkers leave manual lights unchanged and reset with the miniature", () => {
  const s = setup(),
    before = structuredClone(s.signals);
  for (const id of ["bankClock", "payphone", "manhole", "lakeWalk"])
    s.discoveries.trigger(id);
  run(s, 12);
  assert.equal(s.discoveries.heist.snapshot().phase, "escape");
  assert.ok(s.discoveries.walkClocks.lakeWalk > 8);
  assert.equal(s.discoveries.active.lakeWalk, undefined);
  assert.equal(s.discoveries.active.apartmentWalk, undefined);
  assert.deepEqual(s.signals, before);
  s.reset();
  assert.equal(s.discoveries.heist.time, null);
  assert.equal(s.discoveries.heist.plays, 0);
  assert.deepEqual(s.discoveries.active, {});
});

test("cars follow the lake road in both directions and join the other southern approach continuously", () => {
  for (const from of [0, 1]) {
    const s = setup();
    s.spawn(0, from);
    const car = s.cars[0];
    car.turn = "straight";
    let before = carPose(car),
      onLake = false,
      transferred = false;
    for (let i = 0; i < 120 * 40 && s.cars.includes(car); i++) {
      s.tick(1 / 120);
      const p = carPose(car);
      assert.ok(Math.hypot(p.x - before.x, p.z - before.z) < 0.021);
      if (car.lakeFrom !== undefined) {
        onLake = true;
        assert.ok(p.z >= 6.19 && p.z < 9);
      }
      if (onLake && car.lakeFrom === undefined) {
        transferred = true;
        assert.equal(car.junction, 1 - from);
        assert.equal(car.lane, 2);
        break;
      }
      before = p;
    }
    assert.ok(onLake);
    assert.ok(transferred);
    run(s, 30);
    assert.equal(s.cars.length, 0);
    assert.equal(s.passed, 1);
  }
});
test("lakefront traffic queues around the bend behind a red light and drains when released", () => {
  const s = setup();
  s.signals.water.color = "red";
  for (let i = 0; i < 16; i++) {
    s.spawn(0, 1);
    s.cars.at(-1).turn = "straight";
    run(s, 2);
  }
  run(s, 20);
  assert.ok(s.cars.some((c) => c.lakeFrom === 1 && c.stopped > 1));
  assert.ok(
    s.cars.some(
      (c) => c.junction === 0 && c.lane === 2 && c.lakeFrom === undefined,
    ),
  );
  for (let i = 0; i < s.cars.length; i++)
    for (let j = i + 1; j < s.cars.length; j++) {
      const a = carPose(s.cars[i]),
        b = carPose(s.cars[j]);
      assert.ok(
        Math.hypot(a.x - b.x, a.z - b.z) > 0.65,
        `cars ${s.cars[i].id} and ${s.cars[j].id} overlap`,
      );
    }
  s.toggle("water");
  run(s, 100);
  assert.equal(s.cars.length, 0);
  assert.equal(s.passed, 16);
  assert.equal(s.crashes, 0);
});

test("walkers stroll before traffic starts, pause to shrug, and resume without starting cars", () => {
  const s = new TrafficSimulation(() => 0.5);
  run(s, 2);
  assert.equal(s.started, false);
  assert.equal(s.cars.length, 0);
  assert.equal(s.time, 0);
  const before = s.discoveries.walkClocks.lakeWalk;
  s.discoveries.trigger("lakeWalk");
  run(s, 1.5);
  assert.equal(s.discoveries.walkClocks.lakeWalk, before);
  assert.ok(s.discoveries.walkClocks.apartmentWalk > before);
  run(s, 3);
  assert.ok(s.discoveries.walkClocks.lakeWalk > before);
  assert.equal(s.discoveries.active.lakeWalk, undefined);
});
test("seated people stand, take a walk, and return to the same bench", async () => {
  const { pedestrianPose } = await import(
    "../src/features/traffic/pedestrianMotion.js"
  );
  for (const definition of DISCOVERIES.filter((d) => d.seated)) {
    assert.equal(pedestrianPose(definition, 0).seated, true);
    const standing = pedestrianPose(definition, 0, 0.35);
    assert.ok(standing.sit > 0 && standing.sit < 1);
    const walking = pedestrianPose(definition, 0, 5);
    assert.ok(walking.moving);
    assert.ok(
      Math.hypot(
        walking.x - definition.point[0],
        walking.z - definition.point[2],
      ) > 0.5,
    );
    const home = pedestrianPose(definition, 0, definition.duration);
    assert.equal(home.x, definition.point[0]);
    assert.equal(home.z, definition.point[2]);
  }
});
test("fisherman casts into the river before reeling and visibly lifting a fish", async () => {
  const { fishingPose } = await import(
    "../src/features/traffic/fishingMotion.js"
  );
  assert.equal(fishingPose(0.5).phase, "casting");
  assert.equal(fishingPose(2).fish, false);
  assert.equal(fishingPose(2).phase, "waiting");
  assert.equal(fishingPose(4.5).phase, "reeling");
  assert.ok(fishingPose(6.5).fish);
  assert.ok(fishingPose(6.5).bobY > fishingPose(2).bobY + 1);
  assert.equal(fishingPose().phase, "ready");
});
test("river bridge ramps have gentle slopes and the heist escape finishes before police arrive", async () => {
  const { riverBridgeHeight, RIVER_BRIDGE_START, RIVER_BRIDGE_END } =
    await import("../src/features/traffic/waterfront.js");
  for (let z = RIVER_BRIDGE_START; z < RIVER_BRIDGE_END; z += 0.01)
    assert.ok(
      Math.abs(riverBridgeHeight(0, z + 0.01) - riverBridgeHeight(0, z)) /
        0.01 <
        0.57,
    );
  const { HEIST_TIMING: t, HEIST_PLACES: p } = await import(
    "../src/features/traffic/secretHeist.js"
  );
  assert.ok(t.getawayGone < t.police);
  assert.equal(t.departure - t.investigation, 15);
  assert.ok(p.phone[0] < -4.5 && p.phone[1] < -5);
  assert.deepEqual(p.manhole, [0, 0]);
});

test("pedestrians escalate through two shrugs, anger and escape before taking any damage", () => {
  const d = new Discoveries();
  const states = d.pedestrians.states;
  for (let level = 1; level <= 4; level++) {
    assert.ok(d.trigger("lakeWalk"));
    assert.equal(states.lakeWalk.level, level);
    assert.equal(states.lakeWalk.hits, 0);
    assert.equal(states.lakeWalk.phase, "reacting");
    if (level < 4) {
      d.tick(2.7);
      assert.equal(states.lakeWalk.phase, "walking");
    }
  }
  d.tick(1.7);
  assert.equal(states.lakeWalk.phase, "running");
  const position = states.lakeWalk.x;
  d.tick(0.5);
  assert.notEqual(states.lakeWalk.x, position);
  d.trigger("lakeWalk");
  assert.equal(states.lakeWalk.phase, "stumbled");
  assert.equal(states.lakeWalk.hits, 1);
  const stopped = states.lakeWalk.distance;
  d.tick(0.5);
  assert.equal(states.lakeWalk.distance, stopped);
  d.tick(0.7);
  assert.equal(states.lakeWalk.phase, "running");
});
const until = (sim, predicate, timeout = 180) => {
  for (let i = 0; i < timeout * 120 && !predicate(); i++) sim.tick(1 / 120);
  assert.ok(predicate(), "traffic did not reach the expected destination");
};
function knockDown(sim, id) {
  const d = sim.discoveries;
  for (let i = 0; i < 4; i++) d.trigger(id);
  d.tick(1.7);
  for (let i = 0; i < 4; i++) d.trigger(id);
  sim.tick(1 / 120);
}
test("ambulances queue behind ordinary cars at red lights and only collect patients after parking", () => {
  const s = setup(),
    d = s.discoveries;
  s.signals.water.color = "red";
  s.spawn(0);
  const front = s.cars[0];
  Object.assign(front, { p: -3, speed: 0, turn: "straight" });
  knockDown(s, "cityWalk");
  run(s, 20);
  const ambulance = s.cars.find((c) => c.ambulance);
  assert.ok(ambulance);
  assert.ok(
    front.p - ambulance.p >= (front.length + ambulance.length) / 2 + 0.19,
  );
  assert.equal(ambulance.speed, 0);
  assert.equal(d.pedestrians.rescue.time, 0);
  assert.equal(d.pedestrians.states.cityWalk.phase, "down");
  s.signals.water.color = "green";
  until(s, () => d.pedestrians.rescue.arrived);
  assert.equal(ambulance.service.phase, "parked");
  assert.equal(ambulance.service.curb, 0.58);
  until(s, () => d.pedestrians.states.cityWalk.phase === "carried");
  until(s, () => d.pedestrians.pickups === 1);
  assert.equal(d.pedestrians.rescue, null);
  assert.equal(
    s.cars.some((c) => c.ambulance),
    false,
  );
  s.reset();
  assert.deepEqual(s.discoveries.pedestrians.states, {});
  assert.equal(s.services.snapshot().ambulance, null);
});
test("an unimpeded pedestrian escapes and multiple traffic-controlled ambulance calls finish in order", () => {
  const s = setup(),
    d = s.discoveries;
  for (let i = 0; i < 4; i++) d.trigger("apartmentWalk");
  run(s, 45);
  assert.equal(d.pedestrians.states.apartmentWalk, undefined);
  knockDown(s, "pedestrians");
  knockDown(s, "museumWalk");
  until(s, () => d.pedestrians.pickups === 2);
  assert.equal(s.crashes, 0);
});
test("police stop at lights, travel continuously, park for fifteen seconds and wait at the bridge on departure", () => {
  const s = setup();
  s.signals.water.color = s.signals.wisconsin.color = "red";
  for (const id of ["bankClock", "payphone", "manhole"])
    s.discoveries.trigger(id);
  run(s, 55);
  const h = s.discoveries.heist;
  assert.equal(h.time, 19);
  assert.equal(h.snapshot().phase, "response");
  const north = s.cars.find((c) => c.police && c.service.route.length === 1);
  assert.equal(north.speed, 0);
  assert.ok(north.p <= STOP_LINE + 0.001);
  const before = new Map();
  let elapsed = 0;
  while (!h.responseReady && elapsed < 120) {
    const stage = elapsed % 24;
    s.signals.water.color = stage < 10 ? "green" : "red";
    s.signals.wisconsin.color = stage >= 12 && stage < 22 ? "green" : "red";
    s.tick(1 / 120);
    for (const c of s.cars.filter((c) => c.service)) {
      const p = carPose(c),
        old = before.get(c.id);
      if (old)
        assert.ok(
          Math.hypot(p.x - old.x, p.z - old.z) <
            (c.police ? Math.hypot(4.5, 0.85) / 120 + 0.002 : 0.03),
          "response car exceeded its travel and lateral merge speed",
        );
      before.set(c.id, p);
    }
    elapsed += 1 / 120;
  }
  assert.ok(h.responseReady);
  assert.equal(s.services.response.filter((u) => u.arrived).length, 4);
  assert.equal(s.crashes, 0);
  s.toggleBridge();
  run(s, 14.9);
  assert.ok(
    s.services.response.every(
      (u) => s.services.vehicle(u)?.service.phase === "parked",
    ),
  );
  run(s, 8);
  const held = s.services.vehicle(s.services.response[0]);
  assert.ok(held);
  assert.equal(held.speed, 0);
  assert.ok(carPose(held).x - held.length / 2 >= -4.91);
  s.toggleBridge();
  s.signals.water.color = "green";
  s.signals.wisconsin.color = "red";
  until(s, () => h.time === null);
  assert.ok(s.services.response.every((u) => u.done));
  assert.equal(s.crashes, 0);
});
test("response vehicles share normal collision footprints and do not displace traffic when dispatched", () => {
  const s = setup();
  s.spawn(0);
  const service = {
    kind: "police",
    route: [{ junction: 0, lane: 1, turn: "straight" }],
    index: 0,
    phase: "driving",
    curb: 0,
    stop: { out: 4 },
  };
  assert.equal(s.spawn(0, 0, service), false);
  assert.equal(s.overflowed, 0);
  s.spawn(1, 0, service);
  s.signals.water.color = s.signals.wisconsin.color = "green";
  s.cars.forEach((c, i) =>
    Object.assign(c, {
      p: i ? 0.57 : -0.57,
      turn: "straight",
      committed: true,
      speed: 0,
    }),
  );
  s.tick(1 / 120);
  assert.equal(s.crashes, 1);
  assert.ok(s.events.some((e) => e.reason === "crash" && e.car.police));
});
test("responders wait for an occupied curb instead of parking through another vehicle", () => {
  const s = setup();
  const service = () => ({
    kind: "police",
    route: [{ junction: 0, lane: 0, turn: "straight" }],
    index: 0,
    phase: "driving",
    curb: 0,
    stop: { p: -4 },
  });
  s.spawn(0, 0, service());
  const parked = s.cars[0];
  parked.p = -4;
  parked.service.phase = "parked";
  parked.service.curb = 0.58;
  s.spawn(0, 0, service());
  const arriving = s.cars[1];
  run(s, 8);
  assert.equal(arriving.service.phase, "driving");
  assert.equal(arriving.speed, 0);
  assert.equal(arriving.service.curb, 0);
  s.cars = s.cars.filter((c) => c !== parked);
  run(s, 0.1);
  assert.equal(arriving.service.phase, "parking");
});
test("opening the bridge ejects cars on both leaves without ejecting cars waiting at its ends", () => {
  const s = setup();
  for (let i = 0; i < 4; i++) {
    s.spawn(i % 2 ? 1 : 3);
    s.cars.at(-1).turn = "straight";
  }
  for (const [i, c] of s.cars.entries())
    c.p = (i % 2 ? -1 : 1) * [-6.45, -5.55, -8.2, -3.5][i];
  const onDeck = s.cars
    .filter((c) => {
      const p = carPose(c);
      return (
        Math.abs(p.z) < 1.2 &&
        p.x + c.length / 2 > -7.05 &&
        p.x - c.length / 2 < -4.9
      );
    })
    .map((c) => c.id);
  s.toggleBridge();
  assert.equal(onDeck.length, 2);
  assert.deepEqual(
    s.events.filter((e) => e.reason === "bridge").map((e) => e.car.id),
    onDeck,
  );
  assert.equal(s.cars.filter((c) => c.remove).length, 2);
  s.tick(0.1);
  assert.equal(s.bridge.phase, "opening");
  assert.ok(s.bridge.lift > 0);
});

test("medics take a clear route around buildings and stationary path endpoints stay finite", async () => {
  const { walkRoute } = await import(
    "../src/features/traffic/pedestrianNavigation.js"
  );
  const { pathPose } = await import(
    "../src/features/traffic/pedestrianMotion.js"
  );
  const route = walkRoute([-3, 0], [3, 0], [[-1, -1, 1, 1]]);
  assert.deepEqual(route[0], [-3, 0]);
  assert.deepEqual(route.at(-1), [3, 0]);
  assert.ok(route.length > 2);
  for (let i = 0; i <= 100; i++) {
    const point = pathPose(route, i / 100);
    assert.ok(Math.abs(point.x) >= 1.14 || Math.abs(point.z) >= 1.14);
  }
  assert.deepEqual(walkRoute([0, 2], [3, 2], [[-1, -1, 1, 1]]), [
    [0, 2],
    [3, 2],
  ]);
  assert.deepEqual(
    pathPose(
      [
        [0, 0],
        [0, 0],
      ],
      0.5,
    ),
    { x: 0, z: 0, yaw: 0 },
  );
});

test("police overtake slower cars on a clear straight and merge before the next junction", () => {
  const s = setup();
  s.signals.wisconsin.color = "green";
  s.spawn(3);
  const front = s.cars[0];
  Object.assign(front, {
    p: 5.5,
    turn: "straight",
    speed: 2.4,
    committed: true,
  });
  s.spawn(3, 0, {
    kind: "police",
    route: [
      { junction: 0, lane: 3, turn: "straight" },
      { junction: 1, lane: 3, turn: "straight" },
    ],
    index: 0,
    phase: "leaving",
    curb: 0,
    stop: { out: 4 },
  });
  const cop = s.cars[1];
  Object.assign(cop, { p: 4, speed: 2.4, committed: true });
  let fastest = 0,
    overtook = false,
    merged = false;
  for (let i = 0; i < 4 * 120; i++) {
    s.tick(1 / 120);
    const a = carPose(front),
      b = carPose(cop);
    fastest = Math.max(fastest, cop.speed);
    if (a.x < b.x && cop.passing > 0.4) overtook = true;
    if (overtook && b.x > a.x + 0.72 && cop.passing < 0.01) merged = true;
    if (Math.abs(a.yaw - b.yaw) < 0.001) {
      assert.ok(
        Math.abs(a.x - b.x) >= 0.72 || Math.abs(a.z - b.z) >= 0.38,
        "passing car bodies must never overlap",
      );
    }
    if (cop.junction === 1 && cop.p > -2.65) assert.ok(cop.passing < 0.01);
  }
  assert.equal(fastest, 4.5);
  assert.ok(overtook && merged);
  assert.equal(s.crashes, 0);
});

test("police abandoning a pass do not trap the car beside them or cut through its body", () => {
  const s = setup();
  s.signals.water.color = "green";
  s.spawn(0);
  const front = s.cars[0];
  Object.assign(front, { p: -7, turn: "straight", speed: 1 });
  s.spawn(0, 0, {
    kind: "police",
    route: [{ junction: 0, lane: 0, turn: "straight" }],
    index: 0,
    phase: "leaving",
    curb: 0,
    stop: { out: 4 },
  });
  const cop = s.cars[1];
  for (let i = 0; i < 5 * 120; i++) {
    s.tick(1 / 120);
    const a = carPose(front),
      b = carPose(cop);
    assert.ok(
      Math.abs(a.z - b.z) >= 0.72 || Math.abs(a.x - b.x) >= 0.38,
      "a merge must wait for space between cars",
    );
  }
  assert.ok(cop.p > 3);
  assert.equal(s.crashes, 0);
});
