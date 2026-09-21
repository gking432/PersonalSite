import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  STOP_LINE,
  carPosition,
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
  assert.ok(s.cars.length <= 32);
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
  run(s, 2.2);
  assert.equal(s.cars[0].committed, true);
  s.toggle("water");
  assert.equal(s.signals.water.color, "amber");
  run(s, 0.7);
  assert.equal(s.signals.water.color, "red");
  run(s, 5);
  assert.equal(s.passed, 1);
});
test("conflicting greens can crash; one penalty per incident and wrecks clear", () => {
  const s = isolated();
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
  assert.equal(s.score, -3);
  run(s, 2);
  assert.equal(s.crashes, 1);
  assert.equal(s.cars.length, 0);
});
test("opposing cars on the same street pass without colliding", () => {
  const s = isolated();
  s.spawn(0);
  s.spawn(2);
  run(s, 7);
  assert.equal(s.crashes, 0);
  assert.equal(s.passed, 2);
});
test("full stopped queues eventually gridlock; reset gives a clean round", () => {
  const s = isolated();
  for (let i = 0; i < 6; i++) {
    s.spawn(1);
    s.cars.at(-1).p = STOP_LINE - i * 0.92;
    s.cars.at(-1).speed = 0;
  }
  run(s, 13);
  assert.equal(s.jammed, true);
  const time = s.time;
  run(s, 4);
  assert.equal(s.time, time);
  s.reset();
  assert.equal(s.started, false);
  assert.equal(s.jammed, false);
  assert.equal(s.score, 0);
  assert.equal(s.cars.length, 0);
});
