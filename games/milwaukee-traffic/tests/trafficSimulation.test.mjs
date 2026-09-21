import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  STOP_LINE,
  carPosition,
  carPose,
  ENTRY,
  EXIT,
  TURN_START,
  LANE_OFFSET,
  MAX_CARS,
} from "../src/features/traffic/trafficSimulation.js";
const run = (sim, seconds) => {
  for (let i = 0; i < seconds * 120; i++) sim.tick(1 / 120);
};
function isolated() {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  s.nextArrival = 10000;
  return s;
}

test("idle until activated; arrivals build and are bounded", () => {
  const s = new TrafficSimulation(() => 0.5);
  run(s, 10);
  assert.equal(s.cars.length, 0);
  assert.equal(s.time, 0);
  s.start();
  run(s, 3);
  assert.ok(s.cars.length > 0);
  run(s, 150);
  assert.ok(s.cars.length <= MAX_CARS);
  assert.ok(s.interval >= 0.7 - 1e-10);
});
test("red lights stop queues before the crossing with separation", () => {
  for (const random of [0, 0.5]) {
    const s = new TrafficSimulation(() => random);
    s.start();
    s.nextArrival = 10000;
    s.spawn(1);
    run(s, 1);
    s.spawn(1);
    run(s, 7);
    assert.equal(s.cars.length, 2);
    const [front, back] = s.cars;
    assert.ok(
      Math.abs(front.p - (STOP_LINE - (front.length - 0.72) / 2)) < 0.03,
    );
    assert.ok(front.p - back.p >= (front.length + back.length) / 2 + 0.19);
    assert.equal(s.passed, 0);
  }
});
test("green releases traffic and scores once after it exits", () => {
  const s = isolated();
  s.spawn(1);
  run(s, 4);
  s.toggle("wisconsin");
  run(s, 6);
  assert.equal(s.passed, 1);
  assert.equal(s.score, 1);
  assert.equal(s.cars.length, 0);
  run(s, 10);
  assert.equal(s.score, 1);
});
test("amber transitions to red but committed cars finish crossing", () => {
  const s = isolated();
  s.spawn(0);
  run(s, 3.3);
  assert.equal(s.cars[0].committed, true);
  s.toggle("water");
  assert.equal(s.signals.water.color, "amber");
  run(s, 0.7);
  assert.equal(s.signals.water.color, "red");
  run(s, 5);
  assert.equal(s.passed, 1);
});
test("crashes block the road until a requested helicopter pickup", () => {
  const s = isolated();
  s.passed = 60;
  while (s.expansionPending) s.acknowledgeExpansion();
  s.toggle("wisconsin");
  s.spawn(0);
  s.spawn(1);
  s.cars[0].p = 0.57;
  s.cars[1].p = 0.57;
  s.cars.forEach((c) => {
    c.committed = true;
    c.speed = 0;
  });
  assert.deepEqual(carPosition(s.cars[0]), { x: -0.57, z: 0.57 });
  // Northbound/eastbound lane crossing is x=-.57,z=-.57 for these approaches.
  s.cars[0].p = -0.57;
  s.tick(1 / 120);
  assert.equal(s.crashes, 1);
  assert.equal(s.progress, 0);
  run(s, 4);
  assert.equal(s.crashes, 1);
  assert.equal(s.cars.length, 2);
  const incident = s.incidents[0].id;
  assert.equal(s.dispatchRescue(incident), true);
  assert.equal(s.dispatchRescue(incident), false);
  run(s, 4.5);
  assert.ok(s.cars.every((c) => c.lifted));
  run(s, 2.6);
  assert.equal(s.cars.length, 0);
  assert.equal(s.incidents.length, 0);
  assert.ok(s.rescue.cooldown > 19);
  assert.equal(s.progress, 0);
  run(s, 20);
  assert.equal(s.rescue.cooldown, 0);
});
test("opposing cars on the same street pass without colliding", () => {
  const s = isolated();
  s.spawn(0);
  s.spawn(2);
  run(s, 10);
  assert.equal(s.crashes, 0);
  assert.equal(s.passed, 2);
});
test("longer approaches hold eight cars; overflow spills the tail and traffic keeps running", () => {
  const s = isolated();
  for (let i = 0; i < 8; i++) {
    s.spawn(1);
    s.cars.at(-1).p = STOP_LINE - i * 0.92;
    s.cars.at(-1).speed = 0;
  }
  assert.equal(s.cars.length, 8);
  assert.equal(s.overflowed, 0);
  const tail = s.cars.at(-1).id;
  s.spawn(1);
  assert.equal(s.overflowed, 1);
  assert.equal(s.events.find((e) => e.kind === "overflow").car.id, tail);
  assert.equal(s.cars.length, 8);
  assert.equal(s.cars.at(-1).p, ENTRY);
  const before = s.time;
  run(s, 15);
  assert.ok(s.time > before + 14);
  s.toggle("wisconsin");
  run(s, 18);
  assert.equal(s.passed, 8);
  s.reset();
  assert.equal(s.started, false);
  assert.equal(s.score, 0);
  assert.equal(s.overflowed, 0);
  assert.equal(s.honks, 0);
  assert.equal(s.cars.length, 0);
  assert.equal(s.events.length, 0);
});
test("waiting cars honk after a delay, repeat sparingly, and stop when moving", () => {
  const s = isolated();
  s.spawn(1);
  s.cars[0].p = STOP_LINE;
  s.cars[0].speed = 0;
  run(s, 4);
  assert.equal(s.honks, 0);
  run(s, 4);
  assert.ok(s.honks > 0);
  const first = s.honks;
  run(s, 8);
  assert.ok(s.honks > first && s.honks <= 4);
  const honks = s.honks;
  s.toggle("wisconsin");
  run(s, 10);
  assert.equal(s.honks, honks);
  assert.equal(s.passed, 1);
});
test("all twelve routes are continuous, stay on the road, and enter the correct exit lane", () => {
  for (let lane = 0; lane < 4; lane++)
    for (const turn of ["left", "right", "straight"]) {
      const car = { lane, turn, p: ENTRY };
      let last = carPose(car);
      for (let p = ENTRY + 0.01; p < 16; p += 0.01) {
        car.p = p;
        const pose = carPose(car);
        const distance = Math.hypot(pose.x - last.x, pose.z - last.z);
        assert.ok(
          Math.abs(distance - 0.01) < 0.0001,
          `${lane}/${turn} position jump at ${p}`,
        );
        assert.ok(Math.min(Math.abs(pose.x), Math.abs(pose.z)) <= 1.36);
        last = pose;
      }
      assert.equal(
        last.exitLane,
        (lane + (turn === "right" ? 1 : turn === "left" ? 3 : 0)) % 4,
      );
      assert.ok(last.out > EXIT);
      assert.ok(
        Math.abs(Math.min(Math.abs(last.x), Math.abs(last.z)) - LANE_OFFSET) <
          1e-8,
      );
    }
});
test("turn choice varies per arrival and all routes score once at their own exit", () => {
  for (const [random, turn] of [
    [0.2, "left"],
    [0.5, "straight"],
    [0.9, "right"],
  ]) {
    for (let lane = 0; lane < 4; lane++) {
      const s = new TrafficSimulation(() => random);
      s.start();
      s.nextArrival = 10000;
      s.signals.wisconsin.color = "green";
      s.spawn(lane);
      assert.equal(s.cars[0].turn, turn);
      run(s, 11);
      assert.equal(s.passed, 1, `${lane}/${turn}`);
      assert.equal(s.cars.length, 0);
    }
  }
});
test("left turns yield to oncoming straight cars and opposing left turns", () => {
  for (const oncomingTurn of ["straight", "left", "right"]) {
    const s = isolated();
    s.spawn(0);
    s.spawn(2);
    s.cars[0].turn = "left";
    s.cars[1].turn = oncomingTurn;
    s.cars.forEach((c) => {
      c.p = -3.6;
      c.speed = 2.4;
    });
    run(s, 12);
    assert.equal(s.crashes, 0, oncomingTurn);
    assert.equal(s.passed, 2, oncomingTurn);
  }
});
test("a turning follower keeps its distance after joining an outgoing lane", () => {
  const s = isolated();
  s.spawn(0);
  s.spawn(1);
  const [turner, leader] = s.cars;
  turner.turn = "right";
  turner.p = -TURN_START + ((TURN_START - LANE_OFFSET) * Math.PI) / 2;
  turner.committed = true;
  leader.p = 2.5;
  leader.speed = 0;
  leader.committed = true;
  for (let i = 0; i < 120; i++) {
    s.tick(1 / 120);
    assert.ok(carPose(leader).out - carPose(turner).out >= 0.91);
  }
  assert.equal(s.crashes, 0);
});
test("mixed civilian traffic remains recoverable across levels using signals and rescue", () => {
  for (const seed of [5, 8]) {
    let n = seed;
    const s = new TrafficSimulation(
      () => (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296,
    );
    s.start();
    for (let frame = 0; frame < 300 * 120; frame++) {
      s.nextAmbulance = Infinity; // Emergency deadlines have dedicated countdown/priority tests.
      const phase = (frame / 120) % 30;
      for (const signals of [
        s.signals,
        s.signals2,
        s.signals3,
        ...s.extraSignals,
      ]) {
        signals.water.color = phase < 10 ? "green" : "red";
        signals.wisconsin.color = phase >= 15 && phase < 25 ? "green" : "red";
      }
      for (const incident of s.incidents) {
        if (incident.assigned) continue;
        if (!s.dispatchRescue(incident.id)) s.dispatchTow(incident.id);
      }
      s.acknowledgeExpansion();
      s.tick(1 / 120);
      s.events.length = 0;
    }
    assert.ok(s.level >= 8, `seed ${seed} stopped progressing`);
    assert.ok(
      s.passed > 180,
      `traffic deadlock at seed ${seed}: ${s.passed} passed`,
    );
    assert.ok(s.cars.length <= MAX_CARS);
  }
});
test("a bus arriving at a packed edge has room for its longer body", () => {
  const s = isolated();
  s.spawn(1);
  s.cars[0].p = ENTRY + 0.98;
  s.spawn(1);
  s.random = () => 0;
  s.spawn(1);
  assert.equal(s.cars.length, 1);
  assert.equal(s.cars[0].bus, true);
  assert.equal(s.overflowed, 2);
});
