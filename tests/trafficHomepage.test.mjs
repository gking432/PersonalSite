import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  carPose,
  STOP_LINE,
} from "../src/features/traffic/trafficSimulation.js";
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
test("homepage stays idle until activation and remains one constant-pace intersection indefinitely", () => {
  const s = new TrafficSimulation(() => 0.5);
  run(s, 30);
  assert.equal(s.cars.length, 0);
  assert.equal(s.bridge.boats.length, 0);
  s.start();
  s.passed = 10000;
  run(s, 180);
  assert.equal(s.interval, 1.2);
  assert.ok(s.passed > 10000);
  assert.ok(s.cars.every((c) => c.junction === 0));
  assert.equal(s.level, undefined);
  assert.equal(s.gameOver, undefined);
  assert.equal(s.district, undefined);
  assert.ok(s.cars.length < 40);
  assert.ok(s.bridge.boats.length <= 6);
});
test("one light control switches the two directions and keeps the amber transition", () => {
  const s = setup();
  s.toggle();
  assert.equal(s.signals.water.color, "amber");
  assert.equal(s.signals.wisconsin.color, "green");
  run(s, 0.7);
  assert.equal(s.signals.water.color, "red");
  s.toggle();
  assert.equal(s.signals.water.color, "green");
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
  s.toggle();
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
  run(s, 10);
  assert.ok(s.passed > 0);
});
test("boat queues overflow from either river edge while the bridge is closed", () => {
  const s = setup();
  s.bridge.nextBoat = 0;
  run(s, 100);
  assert.ok(s.bridge.overflowed > 0);
  assert.ok(s.bridge.boats.length <= 6);
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
  run(s, 14);
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
  run(s, 18);
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
