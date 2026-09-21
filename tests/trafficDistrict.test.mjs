import test from "node:test";
import assert from "node:assert/strict";
import {
  TrafficSimulation,
  carPose,
  STOP_LINE,
  EXIT,
} from "../src/features/traffic/trafficSimulation.js";
import {
  JUNCTION_X,
  EMERGENCY_LIMIT,
  JUNCTION_Z,
} from "../src/features/traffic/cityChallenges.js";
import {
  LOTS,
  StadiumDistrict,
} from "../src/features/traffic/stadiumDistrict.js";
import {
  DISTRICT_GRID,
  RAMP_IN,
  RAMP_OUT,
  FREEWAY,
} from "../src/features/traffic/districtLayout.js";
const run = (s, t) => {
  for (let i = 0; i < Math.round(t * 120); i++) s.tick(1 / 120);
};
function setup(level = 1) {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  s.passed = (level - 1) * 20;
  if (level >= 9) s.acknowledgeExpansion();
  s.nextArrival = 10000;
  s.nextAmbulance = Infinity;
  s.district.nextArrival = s.district.nextShop = 10000;
  return s;
}
function ambulance(s, lane = 1) {
  s.spawn(lane, 0, true);
  const c = s.cars.at(-1);
  Object.assign(c, { p: STOP_LINE - 0.1, speed: 0, turn: "straight" });
  return c;
}
test("emergency countdown starts on stopping, crosses twenty seconds, freezes the round and resets", () => {
  const s = setup(2),
    a = ambulance(s);
  run(s, 4);
  assert.ok(Math.abs(s.emergencySnapshot().remaining - 16) < 0.11);
  run(s, 15.99);
  assert.equal(s.gameOver, null);
  run(s, 0.03);
  assert.equal(s.gameOver.vehicle, a.id);
  const t = s.time,
    p = a.p;
  run(s, 5);
  assert.equal(s.time, t);
  assert.equal(a.p, p);
  s.reset();
  assert.equal(s.gameOver, null);
  assert.equal(s.emergencySnapshot(), null);
});
test("a light toggle cannot erase waiting time; movement does, and the longest-waiting ambulance owns the bar", () => {
  const s = setup(2),
    a = ambulance(s);
  run(s, 4);
  s.signals.water.color = "red";
  const b = ambulance(s, 0);
  run(s, 2);
  assert.equal(s.emergencySnapshot().id, a.id);
  s.toggle("wisconsin");
  assert.ok(a.emergencyWait > 5.9);
  run(s, 0.4);
  assert.equal(a.emergencyWait, 0);
  assert.equal(s.emergencySnapshot().id, b.id);
  assert.ok(s.emergencySnapshot().remaining < 18);
});
test("moving and crashed ambulances do not consume the emergency timer", () => {
  const s = setup(2);
  s.spawn(0, 0, true);
  run(s, 1);
  assert.equal(s.emergencySnapshot(), null);
  s.cars[0].crashed = true;
  run(s, 25);
  assert.equal(s.gameOver, null);
});
test("timers unlock at six and safely alternate greens through amber and clearance", () => {
  const s = setup(5);
  assert.equal(s.configureProgram(0, { mode: "timer", seconds: 4 }), false);
  s.passed = 100;
  assert.equal(s.configureProgram(0, { mode: "timer", seconds: 4 }), true);
  let ew = false,
    amber = false;
  for (let i = 0; i < 1600; i++) {
    s.tick(1 / 120);
    const q = s.signals;
    assert.ok(!(q.water.color === "green" && q.wisconsin.color === "green"));
    if (q.wisconsin.color === "green") ew = true;
    if (q.water.color === "amber") amber = true;
  }
  assert.ok(ew && amber);
  s.toggle("water");
  assert.equal(s.programs.rules[0].mode, "manual");
});
test("linked lights support green-wave offsets and opposite phases, reject loops and locked sources", () => {
  const s = setup(6);
  assert.equal(s.configureProgram(1, { mode: "linked", source: 0 }), false);
  s.passed = 120;
  s.configureProgram(0, { mode: "timer", seconds: 6 });
  assert.ok(
    s.configureProgram(1, {
      mode: "linked",
      source: 0,
      offset: 2,
      inverted: true,
    }),
  );
  run(s, 3);
  assert.equal(s.signals.water.color, "green");
  assert.equal(s.signals2.wisconsin.color, "green");
  assert.equal(s.configureProgram(0, { mode: "linked", source: 1 }), false);
  assert.equal(s.configureProgram(2, { mode: "linked", source: 5 }), false);
  run(s, 5);
  assert.equal(s.programs.rules[1].desired, "water");
});
test("queue sensors choose the busier approach, and ambulance priority can preempt a cycle", () => {
  const s = setup(8);
  for (let i = 0; i < 3; i++) {
    s.spawn(1);
    Object.assign(s.cars.at(-1), { p: -2.16 - i * 0.92, speed: 0 });
  }
  assert.ok(s.configureProgram(0, { mode: "sensor", seconds: 4 }));
  run(s, 5);
  assert.equal(s.signals.wisconsin.color, "green");
  s.cars = [];
  s.signals.water.color = "red";
  s.signals.wisconsin.color = "green";
  ambulance(s, 0);
  assert.ok(
    s.configureProgram(0, { mode: "timer", seconds: 16, emergency: true }),
  );
  run(s, 1);
  assert.equal(s.signals.water.color, "green");
  assert.equal(s.signals.wisconsin.color, "red");
  assert.equal(s.gameOver, null);
});
test("expansion pauses before activation, acknowledges once, and resets for a new round", () => {
  const s = setup(8);
  s.passed = 159;
  const a = ambulance(s);
  run(s, 3);
  s.complete({ lane: 0, junction: 0, p: 10 });
  assert.ok(s.expansionPending);
  assert.equal(s.districtReady, false);
  assert.equal(s.neighbor(1, 2), null);
  const before = s.snapshot();
  run(s, 40);
  assert.deepEqual(s.snapshot(), before);
  assert.ok(s.acknowledgeExpansion());
  assert.equal(s.acknowledgeExpansion(), false);
  assert.equal(s.expansionPending, false);
  assert.ok(s.districtReady);
  assert.equal(s.neighbor(1, 2), 3);
  run(s, 1);
  assert.ok(a.emergencyWait > 3.9 && a.emergencyWait < 4.1);
  s.reset();
  s.passed = 160;
  assert.ok(s.expansionPending);
});
test("an emergency failure on the expansion milestone keeps restart available", () => {
  const s = setup(8);
  s.passed = 159;
  const a = ambulance(s);
  a.emergencyWait = EMERGENCY_LIMIT;
  s.spawn(0);
  Object.assign(s.cars.at(-1), { p: 10, committed: true, turn: "straight" });
  s.tick(1 / 120);
  assert.ok(s.gameOver);
  assert.equal(s.level, 9);
  assert.equal(s.expansionPending, false);
  assert.equal(s.districtReady, false);
});
test("nine terrain cells contain four stadium cells, one shop and the four connected street blocks", () => {
  const cells = DISTRICT_GRID.cells.flat();
  assert.equal(cells.length, 9);
  assert.equal(cells.filter((c) => c === "stadium").length, 4);
  assert.equal(cells.filter((c) => c === "shop").length, 1);
  assert.equal(cells.filter((c) => c === "street").length, JUNCTION_X.length);
  for (const down of [false, true]) {
    const s = setup(9),
      from = down ? 3 : 1,
      to = down ? 1 : 3;
    s.spawn(down ? 0 : 2, from);
    const c = s.cars[0];
    Object.assign(c, {
      turn: "straight",
      p: 6.49,
      committed: true,
      speed: 2.4,
    });
    const before = carPose(c);
    s.tick(1 / 120);
    assert.equal(c.junction, to);
    assert.ok(
      Math.hypot(carPose(c).x - before.x, carPose(c).z - before.z) < 0.03,
    );
    assert.equal(s.progress, 0);
  }
  const before = setup(8);
  assert.equal(before.neighbor(1, 2), null);
});
test("the ramp stays in the grid, rises over an existing street, and joins without a jump", () => {
  const bounds = DISTRICT_GRID.bounds;
  for (const p of [...RAMP_IN, ...RAMP_OUT]) {
    assert.ok(p.x >= bounds.minX && p.x <= bounds.maxX);
    assert.ok(p.z >= bounds.minZ && p.z <= bounds.maxZ);
  }
  for (const route of [RAMP_IN, RAMP_OUT]) {
    const crossing = route.filter((p) => Math.abs(p.x - 11) < 0.6);
    assert.ok(crossing.length > 0);
    assert.ok(crossing.every((p) => p.y > 3 && p.z < -16 && p.z > -21));
  }
  const s = setup(9);
  s.spawn(0, FREEWAY.junction, false, "freeway");
  const c = s.cars[0];
  s.signalsAt(3).wisconsin.color = "green";
  let before;
  for (let i = 0; i < 2000 && s.cars.includes(c); i++) {
    before = carPose(c);
    s.tick(1 / 120);
  }
  assert.ok(s.district.ramps.some((r) => r.kind === "out"));
  const v = s.district.visualCars()[0];
  assert.ok(Math.hypot(v.x - before.x, v.z - before.z) < 0.03);
  run(s, 3);
  assert.ok(s.district.visualCars()[0].y > 2);
});
test("backed-up ramp arrivals wait on the deck without evicting the surface queue", () => {
  const s = setup(9);
  s.district.nextArrival = 0;
  s.spawn(1, 3);
  const tail = s.cars[0];
  Object.assign(tail, { p: -3.2, crashed: true, speed: 0 });
  run(s, 20);
  assert.ok(s.cars.includes(tail));
  assert.equal(s.overflowed, 0);
  const arrivals = s.district.ramps
    .filter((r) => r.kind === "in")
    .sort((a, b) => b.travel - a.travel);
  assert.equal(arrivals.length, 5);
  for (let i = 1; i < arrivals.length; i++)
    assert.ok(arrivals[i - 1].travel - arrivals[i].travel >= 1.04);
});
test("destination routes get freeway arrivals into the stadium and shop, then return them to the freeway", () => {
  for (const [lane, junction, destination] of [
    [1, 3, "stadium"],
    [1, 3, "shop"],
    [0, 2, "freeway"],
    [0, 3, "freeway"],
  ]) {
    const s = setup(9);
    for (let j = 0; j < JUNCTION_X.length; j++)
      s.signalsAt(j).water.color = s.signalsAt(j).wisconsin.color = "green";
    s.spawn(lane, junction, false, destination);
    run(s, 60);
    assert.ok(!s.cars.some((c) => c.id === 1), `${destination} route failed`);
    assert.ok(s.passed > 160);
    if (destination !== "freeway") assert.ok(s.district.arrivals > 0);
  }
});
test("parking capacity is real, shop visitors return, and stadium departures wait for the event", () => {
  const d = new StadiumDistrict(() => 0.5),
    sim = setup(9);
  d.nextArrival = d.nextShop = 10000;
  const car = { id: 1, color: 2, length: 0.72 };
  for (let i = 0; i < 24; i++) {
    assert.ok(d.park("stadium", car));
    for (let t = 0; t < 1000; t++) d.tick(1 / 120, sim);
    d.time = 20;
  }
  assert.equal(d.canPark("stadium"), false);
  assert.equal(d.parking.length, 24);
  d.time = 50;
  for (let i = 0; i < 1200; i++) d.tick(1 / 120, sim);
  assert.equal(d.departures, 0);
  d.time = 85;
  for (let i = 0; i < 2400; i++) {
    sim.cars = [];
    d.tick(1 / 120, sim);
  }
  assert.ok(d.departures > 0);
  assert.ok(d.parking.length < 24);
  const shop = new StadiumDistrict(() => 0.5);
  shop.nextArrival = shop.nextShop = 10000;
  shop.park("shop", car);
  for (let i = 0; i < 6000; i++) {
    sim.cars = [];
    shop.tick(1 / 120, sim);
  }
  assert.equal(shop.parking.length, 0);
  assert.equal(shop.departures, 1);
});
test("stadium wave traffic is bounded, transitions through game and exit rush, and queues when parking is full", () => {
  const s = setup(9);
  s.district.nextArrival = 0;
  run(s, 10);
  assert.ok(s.cars.some((c) => c.destination === "stadium"));
  assert.ok(s.district.ramps.length <= 5);
  s.district.time = 51;
  assert.equal(s.district.phase, "game");
  s.district.time = 86;
  assert.equal(s.district.phase, "departures");
  s.cars = [];
  s.district.nextArrival = s.district.nextShop = 10000;
  s.district.canPark = () => false;
  s.spawn(3, 2, false, "stadium");
  const c = s.cars[0];
  run(s, 20);
  assert.ok(s.cars.includes(c));
  assert.ok(carPose(c).out <= EXIT - 0.39);
});
test("one roundabout can be placed on an empty eligible crossing and cars follow all twelve curved movements", () => {
  for (let lane = 0; lane < 4; lane++)
    for (const turn of ["left", "straight", "right"]) {
      const s = setup(9);
      assert.ok(s.placeRoundabout(3));
      assert.equal(s.placeRoundabout(1), false);
      s.spawn(lane, 3);
      const c = s.cars[0];
      c.turn = turn;
      c.p = -2.17;
      let prev = carPose(c);
      for (let i = 0; i < 800 && c.junction === 3 && s.cars.includes(c); i++) {
        s.tick(1 / 120);
        const p = carPose(c);
        assert.ok(Math.hypot(p.x - prev.x, p.z - prev.z) < 0.03);
        const r = Math.hypot(p.x - JUNCTION_X[3], p.z - JUNCTION_Z[3]);
        assert.ok(r > 1.1, "drove through central island");
        prev = p;
      }
      assert.ok(c.p > 0 || c.junction !== 3 || !s.cars.includes(c));
      assert.equal(s.crashes, 0);
    }
  const s = setup(8);
  assert.equal(s.placeRoundabout(0), false);
  s.passed = 160;
  s.spawn(0);
  s.cars[0].p = 0;
  assert.equal(s.placeRoundabout(0), false);
});
test("roundabout yields to circulating cars and clears competing arrivals without a red light", () => {
  const s = setup(9);
  s.placeRoundabout(0);
  s.signals.water.color = s.signals.wisconsin.color = "red";
  for (let lane = 0; lane < 4; lane++) {
    s.spawn(lane);
    Object.assign(s.cars.at(-1), { p: -2.3, turn: "left", speed: 0 });
  }
  const ids = s.cars.map((c) => c.id);
  run(s, 22);
  assert.equal(s.crashes, 0);
  assert.ok(
    s.cars.filter((c) => ids.includes(c.id) && c.junction === 0).length === 0,
  );
});

test("roundabout admission leaves clearance for buses under sustained mixed arrivals", () => {
  for (const seed of [1, 5, 18]) {
    let n = seed;
    const s = setup(9);
    s.random = () =>
      (n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296;
    s.placeRoundabout(0);
    let transferred = 0;
    for (let f = 0; f < 90 * 120; f++) {
      if (f < 20 * 120 && f % 240 === 0)
        for (let lane = 0; lane < 4; lane++) s.spawn(lane);
      s.tick(1 / 120);
      transferred += s.cars.filter((c) => c.junction !== 0).length;
      s.cars = s.cars.filter((c) => c.junction === 0);
      s.events = [];
    }
    assert.equal(s.crashes, 0, `seed ${seed}`);
    assert.equal(s.cars.length, 0, `seed ${seed} stopped circulating`);
    assert.equal(transferred + s.passed - 160 + s.overflowed, 40);
  }
});

test("ambulances at either bridge bank, including committed cars and queues, share the 20-second deadline", () => {
  for (const bank of ["west", "east", "queue"]) {
    const s = setup(5);
    s.bridge.requestedOpen = true;
    s.bridge.nextBoat = Infinity;
    s.signals.wisconsin.color = "green";
    if (bank === "queue") {
      s.spawn(3);
      Object.assign(s.cars[0], { p: -7.51, speed: 0, turn: "straight" });
    }
    s.spawn(bank === "east" ? 1 : 3, 0, true);
    const a = s.cars.at(-1);
    Object.assign(a, {
      p: bank === "east" ? 4.34 : bank === "queue" ? -8.6 : -7.61,
      speed: 0,
      turn: "straight",
      committed: bank === "east",
    });
    run(s, 12);
    assert.equal(s.gameOver, null);
    assert.ok(a.emergencyWait > 11, bank);
    assert.ok(s.emergencySnapshot().remaining <= 9, bank);
    run(s, 10);
    assert.equal(s.gameOver.vehicle, a.id, bank);
  }
});
test("closing the bridge keeps its timer until traffic moves, then clears it", () => {
  const s = setup(5);
  s.bridge.requestedOpen = true;
  s.bridge.nextBoat = Infinity;
  s.spawn(1, 0, true);
  const a = s.cars[0];
  Object.assign(a, { p: 4.34, speed: 0, committed: true, turn: "straight" });
  run(s, 12);
  s.toggleBridge();
  assert.ok(a.emergencyWait > 11.9);
  run(s, 1);
  assert.ok(a.emergencyWait > 12.9);
  run(s, 2);
  assert.equal(a.emergencyWait, 0);
  assert.equal(s.gameOver, null);
  assert.equal(EMERGENCY_LIMIT, 20);
});
