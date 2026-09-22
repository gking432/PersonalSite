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
        "lakeWalk",
        "museumWalk",
        "apartmentWalk",
        "cityWalk",
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
test("bridge clears road traffic before opening, and boats then pass through", () => {
  const s = setup();
  s.spawn(1);
  Object.assign(s.cars[0], { p: 5.9, turn: "straight", committed: true });
  s.bridge.spawn(s.events);
  s.bridge.boats[0].p = -2.3;
  s.toggleBridge();
  s.tick(1 / 120);
  assert.equal(s.bridge.phase, "clearing");
  assert.equal(s.bridge.lift, 0);
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
  const { riverBridgeHeight } = await import(
    "../src/features/traffic/waterfront.js"
  );
  for (const x of [0, 14.4]) {
    assert.equal(riverBridgeHeight(x, -10), 0);
    assert.equal(riverBridgeHeight(x, -6.6), 0);
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
  h.tick(13);
  assert.equal(h.snapshot().phase, "investigation");
  h.tick(14.9);
  assert.equal(h.snapshot().phase, "investigation");
  h.tick(0.2);
  assert.equal(h.snapshot().phase, "departure");
  h.tick(9);
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
  assert.ok("lakeWalk" in s.discoveries.active);
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
