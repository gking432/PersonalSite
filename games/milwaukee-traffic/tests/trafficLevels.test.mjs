import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  carPose,
  EXIT,
  STOP_LINE,
} from "../src/features/traffic/trafficSimulation.js";
import {
  BridgeTraffic,
  HelicopterRescue,
  BLOCK_SPACING,
} from "../src/features/traffic/cityChallenges.js";
const run = (s, seconds) => {
  for (let i = 0; i < seconds * 120; i++) s.tick(1 / 120);
};
const setup = () => {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  s.nextArrival = 10000;
  return s;
};

test("every successful exit adds 5%; milestones reset progress and unlock levels", () => {
  const s = setup();
  for (let i = 1; i <= 40; i++) {
    s.spawn(0);
    const c = s.cars.at(-1);
    c.p = EXIT - 0.01;
    c.speed = 2.4;
    c.committed = true;
    run(s, 0.02);
    assert.equal(s.progress, i % 20);
    assert.equal(s.level, 1 + Math.floor(i / 20));
  }
  assert.equal(s.level, 3);
  assert.equal(s.progress, 0);
  s.reset();
  assert.equal(s.level, 1);
  assert.equal(s.progress, 0);
  assert.equal(s.bridge.lift, 0);
});
test("handoff between intersections is continuous and only the final exit counts", () => {
  for (const junction of [0, 1]) {
    const s = setup();
    s.passed = 20;
    s.spawn(junction === 0 ? 3 : 1, junction);
    const c = s.cars[0];
    c.turn = "straight";
    c.p = BLOCK_SPACING / 2 - 0.005;
    c.committed = true;
    c.speed = 2.4;
    const before = carPose(c);
    s.tick(1 / 120);
    const after = carPose(c);
    assert.equal(c.junction, 1 - junction);
    assert.ok(Math.hypot(after.x - before.x, after.z - before.z) < 0.03);
    assert.equal(s.progress, 0);
    run(s, 3);
    assert.ok(Math.abs(c.p - STOP_LINE) < 0.05);
    s.signalsAt(c.junction).wisconsin.color = "green";
    run(s, 7);
    assert.equal(s.progress, 1);
    assert.equal(s.cars.length, 0);
  }
});
test("downstream queues hold cars on the connecting road without overlapping", () => {
  const s = setup();
  s.passed = 20;
  s.spawn(3, 0);
  s.spawn(3, 1);
  const [back, front] = s.cars;
  back.p = 4.55;
  back.turn = "straight";
  back.committed = true;
  front.p = -5.5;
  front.turn = "straight";
  front.speed = 0;
  for (let i = 0; i < 250; i++) {
    s.tick(1 / 120);
    const a = carPose(back),
      b = carPose(front);
    assert.ok(b.x - a.x >= 0.91);
  }
});
test("ambulances unlock at level two and obey lights with normal progress credit", () => {
  const s = setup();
  s.passed = 19;
  s.complete({ lane: 0, p: EXIT });
  assert.equal(s.level, 2);
  s.nextArrival = 0;
  run(s, 5);
  assert.ok(s.cars.some((c) => c.ambulance));
  const a = s.cars.find((c) => c.ambulance);
  s.cars = [a];
  s.nextArrival = 10000;
  a.junction = 0;
  a.lane = 1;
  a.p = STOP_LINE;
  a.speed = 0;
  a.turn = "straight";
  a.committed = false;
  run(s, 2);
  assert.ok(a.p <= STOP_LINE + 0.001);
  s.toggle("wisconsin");
  run(s, 6);
  assert.equal(s.progress, 1);
});
test("bridge waits for road traffic and blocks new cars until fully closed", () => {
  const s = setup();
  s.passed = 40;
  s.spawn(3);
  const c = s.cars[0];
  c.p = -6;
  c.turn = "straight";
  c.speed = 2.4;
  s.toggleBridge();
  run(s, 0.1);
  assert.equal(s.bridge.phase, "clearing");
  assert.equal(s.bridge.lift, 0);
  run(s, 2);
  assert.ok(s.bridge.lift > 0);
  s.spawn(3);
  const waiting = s.cars.at(-1);
  waiting.turn = "straight";
  run(s, 4);
  assert.ok(carPose(waiting).x <= -7.15 - waiting.length / 2 + 0.01);
  s.bridge.boats = [];
  s.bridge.nextBoat = 1000;
  s.toggleBridge();
  run(s, 2.4);
  assert.equal(s.bridge.lift, 0);
  run(s, 2);
  assert.ok(carPose(waiting).x > -7);
});
test("cars already entering the bridge can clear the gate instead of deadlocking", () => {
  for (const lane of [1, 3]) {
    const s = setup();
    s.passed = 40;
    s.spawn(lane);
    const c = s.cars[0];
    c.turn = "straight";
    c.committed = true;
    c.p = lane === 3 ? -7.2 : 4.7;
    c.speed = 2.4;
    s.toggleBridge();
    run(s, 4);
    assert.ok(s.bridge.lift > 0, `lane ${lane} never cleared`);
  }
});
test("boats wait for an open bridge; closing waits for a boat already underneath", () => {
  const bridge = new BridgeTraffic(() => 0.5),
    events = [];
  const tick = (seconds) => {
    for (let i = 0; i < seconds * 120; i++) bridge.tick(1 / 120, [], events);
  };
  tick(10);
  assert.equal(bridge.boats.length, 1);
  const boat = bridge.boats[0];
  assert.ok(Math.abs(boat.p + 2.3) < 0.01);
  tick(5);
  assert.ok(Math.abs(boat.p + 2.3) < 0.01);
  assert.ok(events.some((e) => e.kind === "toot"));
  bridge.toggle();
  tick(3);
  assert.equal(bridge.lift, 1);
  assert.equal(boat.committed, true);
  bridge.toggle();
  tick(0.5);
  assert.equal(bridge.phase, "boat crossing");
  assert.equal(bridge.lift, 1);
  tick(9);
  assert.equal(bridge.lift, 0);
  assert.equal(bridge.passed, 1);
});
test("canceling a partial opening with waiting boats does not deadlock the bridge", () => {
  const b = new BridgeTraffic(() => 0.5);
  b.boats = [{ id: 1, p: -2.3, direction: 1, waited: 0, nextToot: 7, x: -5.6 }];
  b.nextBoat = 1000;
  b.toggle();
  b.tick(0.8, [], []);
  b.toggle();
  for (let i = 0; i < 360; i++) b.tick(1 / 120, [], []);
  assert.equal(b.lift, 0);
  assert.equal(b.boats[0].p, -2.3);
});
test("helicopter cannot accept another accident until its 20-second refuel ends", () => {
  const h = new HelicopterRescue();
  const incidents = [
    { id: 1, x: 0, z: 0 },
    { id: 2, x: 11, z: 0 },
  ];
  const cars = [{ incident: 1 }];
  assert.ok(h.dispatch(incidents[0]));
  assert.equal(h.dispatch(incidents[1]), false);
  h.tick(7, cars, incidents);
  assert.equal(h.cooldown, 20);
  assert.equal(h.snapshot().fuel, 0);
  h.tick(10, cars, incidents);
  assert.equal(h.snapshot().fuel, 50);
  assert.equal(h.dispatch(incidents[0]), false);
  h.tick(9.9, cars, incidents);
  assert.equal(h.dispatch(incidents[0]), false);
  h.tick(0.11, cars, incidents);
  assert.ok(h.dispatch(incidents[0]));
});
test("traffic waits behind an accident until the helicopter lifts the wrecks", () => {
  const s = setup();
  s.passed = 60;
  s.spawn(0);
  s.spawn(1);
  s.cars.forEach((c, i) => {
    c.turn = "straight";
    c.p = i ? 0.57 : -0.57;
    c.speed = 0;
    c.committed = true;
  });
  s.tick(1 / 120);
  const id = s.incidents[0].id;
  s.spawn(0);
  const follower = s.cars.at(-1);
  follower.turn = "straight";
  run(s, 8);
  assert.ok(follower.p <= STOP_LINE + 0.01);
  s.dispatchRescue(id);
  run(s, 4);
  assert.ok(follower.p <= STOP_LINE + 0.01);
  run(s, 2);
  assert.ok(follower.p > STOP_LINE + 0.2);
});

function crash(s, junction = 0) {
  s.spawn(0, junction);
  s.spawn(1, junction);
  s.cars.slice(-2).forEach((c, i) =>
    Object.assign(c, {
      p: i ? 0.57 : -0.57,
      turn: "straight",
      speed: 0,
      committed: true,
    }),
  );
  s.tick(1 / 120);
  return s.incidents.at(-1).id;
}
test("helicopter unlocks at level four, while towing is available from level one", () => {
  const s = setup(),
    id = crash(s);
  for (const passed of [0, 20, 40, 59]) {
    s.passed = passed;
    assert.equal(s.dispatchRescue(id), false);
    assert.equal(s.incidents[0].assigned, false);
  }
  s.passed = 60;
  assert.equal(s.dispatchRescue(id), true);
  assert.equal(s.dispatchTow(id), false);
  s.reset();
  s.start();
  s.nextArrival = 10000;
  assert.equal(s.dispatchTow(crash(s)), true);
});
test("tow truck bypasses a full queue, waits for green, recovers the wreck, and returns without scoring", () => {
  for (const junction of [0, 1, 2]) {
    const s = setup();
    s.passed = junction === 2 ? 80 : junction === 1 ? 20 : 0;
    const before = s.passed,
      id = crash(s, junction);
    s.signalsAt(junction).water.color = "red";
    for (let i = 0; i < 8; i++) {
      s.spawn(0, junction);
      Object.assign(s.cars.at(-1), {
        p: STOP_LINE - i * 0.92,
        speed: 0,
        turn: "straight",
      });
    }
    assert.equal(s.dispatchTow(id), true);
    assert.equal(s.dispatchTow(id), false);
    run(s, 4);
    assert.equal(s.tow.active.waiting, true);
    assert.equal(s.tow.active.z, -2.65);
    const truck = s.tow.active;
    for (const c of s.cars.filter((c) => !c.crashed))
      assert.ok(
        Math.abs(truck.x - carPose(c).x) > 0.5,
        "truck occupies the shoulder, clear of the queue",
      );
    run(s, 2);
    assert.equal(truck.z, -2.65);
    s.toggle("water", junction);
    run(s, 2);
    assert.equal(truck.phase, "pickup");
    assert.equal(s.incidents.length, 1);
    run(s, 2);
    assert.equal(s.incidents.length, 0);
    assert.equal(truck.loaded, true);
    assert.equal(s.passed, before);
    run(s, 5);
    assert.equal(s.tow.active, null);
    s.reset();
    assert.equal(s.tow.snapshot().busy, false);
  }
});
test("tow and helicopter can recover separate accidents concurrently", () => {
  const s = setup();
  s.passed = 60;
  const first = crash(s, 0),
    second = crash(s, 1);
  assert.equal(s.dispatchTow(first), true);
  assert.equal(s.dispatchRescue(first), false);
  assert.equal(s.dispatchRescue(second), true);
  run(s, 12);
  assert.equal(s.incidents.length, 0);
  assert.equal(s.tow.active, null);
  assert.equal(s.rescue.active, null);
});
test("level five connects the west intersection continuously across the bridge in both directions", () => {
  for (const junction of [0, 2]) {
    const s = setup();
    s.passed = 80;
    s.spawn(junction === 0 ? 1 : 3, junction);
    const c = s.cars[0];
    Object.assign(c, {
      p: 7.49,
      turn: "straight",
      speed: 2.4,
      committed: true,
    });
    const before = carPose(c);
    s.tick(1 / 120);
    assert.equal(c.junction, junction === 0 ? 2 : 0);
    assert.ok(
      Math.hypot(carPose(c).x - before.x, carPose(c).z - before.z) < 0.03,
    );
    assert.equal(s.passed, 80);
    run(s, 6);
    assert.ok(Math.abs(c.p - STOP_LINE) < 0.02);
    s.signalsAt(c.junction).wisconsin.color = "green";
    // A car headed east travels through the original and Broadway blocks.
    s.signals2.wisconsin.color = "green";
    run(s, 16);
    assert.equal(s.passed, 81);
    assert.equal(s.cars.length, 0);
  }
});
test("west lights stay locked through level four and new arrivals use exterior roads", () => {
  const s = setup();
  s.passed = 79;
  s.toggle("wisconsin", 2);
  assert.equal(s.signals3.wisconsin.color, "red");
  s.complete({ lane: 0, p: EXIT });
  s.toggle("wisconsin", 2);
  assert.equal(s.signals3.wisconsin.color, "green");
  const entries = [];
  for (let i = 0; i < 24; i++) {
    s.cars = [];
    s.nextArrival = 0;
    s.tick(1 / 120);
    entries.push([s.cars[0].junction, s.cars[0].lane]);
  }
  assert.ok(entries.some(([j]) => j === 2));
  assert.ok(
    entries.every(
      ([j, l]) =>
        !(
          (j === 0 && [1, 3].includes(l)) ||
          (j === 1 && l === 3) ||
          (j === 2 && l === 1)
        ),
    ),
  );
});

test("the open bridge holds cars coming from both sides of the level-five road", () => {
  const s = setup();
  s.passed = 80;
  s.spawn(3, 2);
  s.spawn(1, 0);
  Object.assign(s.cars[0], { p: 5.5, turn: "straight", committed: true });
  Object.assign(s.cars[1], { p: 3.5, turn: "straight", committed: true });
  s.toggleBridge();
  run(s, 3);
  assert.equal(s.bridge.lift, 1);
  const [east, west] = s.cars;
  assert.ok(carPose(east).x < -7.5);
  assert.ok(carPose(west).x > -4.5);
  s.bridge.boats = [];
  s.bridge.nextBoat = 1000;
  s.toggleBridge();
  run(s, 5);
  assert.equal(s.bridge.lift, 0);
  assert.ok(carPose(east).x > -6.5);
  assert.ok(carPose(west).x < -5.5);
});
