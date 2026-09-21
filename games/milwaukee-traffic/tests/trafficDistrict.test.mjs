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
  JUNCTION_APPROACHES,
  exitAvailable,
  EMERGENCY_LIMIT,
  JUNCTION_Z,
} from "../src/features/traffic/cityChallenges.js";
import {
  LOTS,
  StadiumDistrict,
  parkingPath,
  parkingSpace,
} from "../src/features/traffic/stadiumDistrict.js";
import {
  DISTRICT_GRID,
  RAMP_IN,
  RAMP_OUT,
  FREEWAY,
  RAMP_CENTER,
  rampOffset,
  RIVER,
  FIXED_BRIDGES,
  FREEWAY_SUPPORTS,
  bridgeHeight,
  roadElevation,
} from "../src/features/traffic/districtLayout.js";
const run = (s, t) => {
  for (let i = 0; i < Math.round(t * 120); i++) s.tick(1 / 120);
};
function setup(level = 1) {
  const s = new TrafficSimulation(() => 0.5);
  s.start();
  s.passed = (level - 1) * 20;
  while (s.expansionPending) s.acknowledgeExpansion();
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
function wreck(s, lane, junction, p) {
  s.spawn(lane, junction);
  const car = s.cars.at(-1);
  Object.assign(car, {
    p,
    turn: "straight",
    speed: 0,
    committed: true,
    crashed: true,
    incident: 90,
  });
  s.incidents.push({ id: 90, junction, ...carPose(car), assigned: false });
  return car;
}
test("committed ambulances behind a wreck, its queue, or the next crossing's queue reach the deadline", () => {
  for (const scenario of ["crossing", "exit queue", "next junction"]) {
    const s = setup(2);
    s.bridge.nextBoat = Infinity;
    const lane = scenario === "next junction" ? 3 : 0;
    wreck(
      s,
      lane,
      scenario === "next junction" ? 1 : 0,
      scenario === "next junction" ? -7 : scenario === "exit queue" ? 4 : 2.2,
    );
    if (scenario === "exit queue") {
      s.spawn(lane);
      Object.assign(s.cars.at(-1), {
        p: 3.08,
        turn: "straight",
        speed: 0,
        committed: true,
      });
    }
    s.spawn(lane, 0, true);
    const a = s.cars.at(-1);
    Object.assign(a, {
      p:
        scenario === "next junction"
          ? 2.98
          : scenario === "exit queue"
            ? 2.06
            : 1.18,
      turn: "straight",
      speed: 0,
      committed: true,
    });
    run(s, 8);
    assert.equal(a.crashed, 0, scenario);
    assert.ok(a.emergencyWait > 7.9, scenario);
    assert.ok(s.emergencySnapshot().remaining < 12.1, scenario);
    s.toggle("wisconsin");
    run(s, 2);
    assert.ok(
      a.emergencyWait > 9.9,
      "flipping a light must not reset a blocked ambulance",
    );
    run(s, 10.02);
    assert.equal(s.gameOver?.vehicle, a.id, scenario);
  }
});
test("rescue dispatch does not clear an ambulance's crash wait; actual movement does", () => {
  const s = setup(4),
    blocked = wreck(s, 0, 0, 2.2);
  s.spawn(0, 0, true);
  const a = s.cars.at(-1);
  Object.assign(a, { p: 1.18, turn: "straight", speed: 0, committed: true });
  run(s, 6);
  assert.ok(s.dispatchRescue(blocked.incident));
  run(s, 3);
  assert.ok(a.emergencyWait > 8.9);
  run(s, 4);
  assert.ok(a.p > 2);
  assert.equal(a.emergencyWait, 0);
  assert.equal(s.emergencySnapshot(), null);
  assert.equal(s.gameOver, null);
});
test("the bridge introduction freezes an existing ambulance countdown until dismissed", () => {
  const s = setup(2),
    a = ambulance(s);
  run(s, 7);
  const waiting = a.emergencyWait;
  s.passed = 40;
  assert.equal(s.tutorial.id, "bridge");
  run(s, 30);
  assert.equal(a.emergencyWait, waiting);
  assert.equal(s.gameOver, null);
  s.acknowledgeExpansion();
  run(s, 1);
  assert.ok(a.emergencyWait > waiting + 0.99);
});
test("timers unlock at two and safely alternate greens through amber and clearance", () => {
  const s = setup(1);
  assert.equal(s.configureProgram(0, { mode: "timer", seconds: 4 }), false);
  s.passed = 20;
  s.acknowledgeExpansion();
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
test("one fixed ten-second timer moves between crossings and locked modes are rejected", () => {
  const s = setup(2);
  assert.ok(s.configureProgram(0, { mode: "timer", seconds: 4 }));
  assert.equal(s.programs.rules[0].seconds, 10);
  run(s, 9.9);
  assert.equal(s.signals.water.color, "green");
  run(s, 1);
  assert.equal(s.signals.wisconsin.color, "green");
  assert.ok(s.configureProgram(1, { mode: "timer" }));
  assert.equal(s.programs.rules[0].mode, "manual");
  assert.equal(s.programs.rules.filter((r) => r.mode === "timer").length, 1);
  assert.equal(s.configureProgram(3, { mode: "timer" }), false);
  assert.equal(s.configureProgram(1, { mode: "sensor" }), false);
  assert.equal(s.configureProgram(1, { mode: "linked" }), false);
});
test("one linked street changes all its lights safely and leaves other streets alone", () => {
  const locked = setup(8);
  assert.equal(locked.linkStreet("row-0"), false);
  const s = setup(9);
  assert.ok(s.linkStreet("row-0"));
  assert.deepEqual(s.linkedStreet.junctions, [0, 1, 2]);
  s.configureProgram(0, { mode: "timer" });
  s.toggle("wisconsin", 1);
  for (let frame = 0; frame < 120; frame++) {
    s.tick(1 / 120);
    for (const j of [0, 1, 2])
      assert.ok(
        !(
          s.signalsAt(j).water.color === "green" &&
          s.signalsAt(j).wisconsin.color === "green"
        ),
      );
  }
  for (const j of [0, 1, 2])
    assert.equal(s.signalsAt(j).wisconsin.color, "green");
  assert.equal(s.signalsAt(4).water.color, "green");
  assert.equal(s.programs.rules[0].mode, "street");
  s.toggle("water", 2);
  run(s, 1);
  for (const j of [0, 1, 2]) assert.equal(s.signalsAt(j).water.color, "green");
  assert.ok(s.linkStreet("column-1"));
  assert.deepEqual(s.linkedStreet.junctions, [0, 4]);
  assert.equal(s.programs.rules[1].mode, "manual");
  assert.equal(s.linkStreet("row-2"), false);
  assert.ok(s.linkStreet(null));
  assert.equal(s.linkedStreet, null);
});
test("each unlock pauses clocks before activation, appears once, and resets with the run", () => {
  const s = setup(1);
  for (const [level, id] of [
    [2, "timer"],
    [3, "bridge"],
    [8, "roundabout"],
    [9, "street"],
    [11, "stadium"],
  ]) {
    s.passed = (level - 1) * 20 - 1;
    s.complete({ lane: 0, junction: 0, p: 10 });
    assert.equal(s.tutorial.id, id);
    const before = s.snapshot(),
      time = s.time;
    run(s, 40);
    assert.deepEqual(s.snapshot(), before);
    assert.equal(s.time, time);
    assert.equal(s.configureProgram(0, { mode: "timer" }), false);
    if (level === 8) {
      assert.equal(s.neighborhoodReady, false);
      assert.equal(s.neighbor(1, 2), null);
    }
    if (level === 11) assert.equal(s.districtReady, false);
    assert.ok(s.acknowledgeExpansion());
    assert.equal(s.acknowledgeExpansion(), false);
    if (level === 8) {
      assert.equal(s.neighborhoodReady, true);
      assert.equal(s.districtReady, false);
      assert.equal(s.neighbor(1, 2), 3);
    }
    if (level === 11) assert.equal(s.districtReady, true);
  }
  s.reset();
  s.passed = 100;
  assert.equal(s.tutorial.id, "timer");
  assert.equal(s.linkedStreet, null);
});
test("street changes wait for crossing traffic and leave a timer on another street running", () => {
  const s = setup(9);
  s.configureProgram(4, { mode: "timer" });
  s.placeRoundabout(2);
  s.linkStreet("row-0");
  assert.deepEqual(s.linkedStreet.junctions, [0, 1]);
  s.spawn(0, 0);
  const crossing = s.cars[0];
  Object.assign(crossing, { p: 0, committed: true });
  s.toggle("wisconsin", 1);
  // Hold the crossing occupied without advancing vehicle motion.
  s.signals.water.color = "red";
  s.programs.tick(1, s);
  assert.equal(s.signals.wisconsin.color, "red");
  assert.equal(s.programs.rules[4].mode, "timer");
  s.cars = [];
  s.programs.tick(0, s);
  assert.equal(s.signals.wisconsin.color, "green");
  assert.equal(s.roundabout, 2);
});
test("an emergency failure on the expansion milestone keeps restart available", () => {
  const s = setup(10);
  s.passed = 199;
  const a = ambulance(s);
  a.emergencyWait = EMERGENCY_LIMIT;
  s.spawn(0);
  Object.assign(s.cars.at(-1), { p: 10, committed: true, turn: "straight" });
  s.tick(1 / 120);
  assert.ok(s.gameOver);
  assert.equal(s.level, 11);
  assert.equal(s.expansionPending, false);
  assert.equal(s.districtReady, false);
});
test("the six-unit neighborhood has six crossings, no stadium traffic, and a continuous river", () => {
  const s = setup(8);
  assert.deepEqual(s.snapshot().activeJunctions, [0, 1, 2, 3, 4, 5]);
  assert.equal(s.neighbor(4, 2), null);
  assert.equal(s.neighbor(5, 3), 4);
  assert.equal(s.districtReady, false);
  s.district.nextArrival = 0;
  s.bridge.nextBoat = 0;
  run(s, 0.1);
  s.bridge.nextBoat = 0;
  run(s, 0.1);
  assert.equal(s.district.ramps.length, 0);
  assert.ok(s.bridge.boats.find((b) => b.direction === 1).p > -23);
  assert.ok(s.placeRoundabout(4));
  assert.equal(s.placeRoundabout(0), false);
});
test("nine units keep the stadium and parking together while preserving continuous street handoffs", () => {
  const cells = DISTRICT_GRID.cells.flat();
  assert.equal(cells.length, 9);
  assert.equal(cells.filter((c) => c === "stadium-and-parking").length, 1);
  assert.equal(cells.filter((c) => c === "shop-and-parking").length, 1);
  assert.equal(cells.filter((c) => c === "civic-hall").length, 1);
  for (const down of [false, true]) {
    const s = setup(11),
      from = down ? 3 : 1,
      to = down ? 1 : 3;
    s.spawn(down ? 1 : 2, from);
    const c = s.cars[0];
    Object.assign(c, {
      turn: down ? "left" : "straight",
      p: down ? 6.49 - 3.1 + (2.12 * Math.PI) / 2 : 6.49,
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
  const before = setup(7);
  assert.equal(before.neighbor(1, 2), null);
});
test("the ramp stays in the grid, rises over an existing street, and joins without a jump", () => {
  const bounds = DISTRICT_GRID.bounds;
  for (const p of [...RAMP_IN, ...RAMP_OUT]) {
    assert.ok(p.x >= bounds.minX && p.x <= bounds.maxX);
    assert.ok(p.z >= bounds.minZ && p.z <= bounds.maxZ);
  }
  for (const route of [RAMP_IN, RAMP_OUT]) {
    const crossing = route.filter((p) => Math.abs(p.z + 26) < 1.4);
    assert.ok(crossing.length > 0);
    assert.ok(crossing.every((p) => p.y > 3 && p.x > 16.5));
  }
  const s = setup(11);
  s.spawn(3, FREEWAY.junction, false, "freeway");
  const c = s.cars[0];
  s.signalsAt(FREEWAY.junction).wisconsin.color = "green";
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
  const s = setup(11);
  s.district.nextArrival = 0;
  s.spawn(1, FREEWAY.junction);
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
    [1, FREEWAY.junction, "stadium"],
    [1, FREEWAY.junction, "shop"],
    [LOTS.stadium.returnLane, LOTS.stadium.junction, "freeway"],
    [LOTS.shop.returnLane, LOTS.shop.junction, "freeway"],
    [1, 3, "shop"],
  ]) {
    const s = setup(11);
    for (let j = 0; j < JUNCTION_X.length; j++)
      s.signalsAt(j).water.color = s.signalsAt(j).wisconsin.color = "green";
    s.spawn(lane, junction, false, destination);
    run(s, 60);
    assert.ok(!s.cars.some((c) => c.id === 1), `${destination} route failed`);
    assert.ok(s.passed > 200);
    if (destination !== "freeway") assert.ok(s.district.arrivals > 0);
  }
});
test("parking capacity is real, shop visitors return, and stadium departures wait for the event", () => {
  const d = new StadiumDistrict(() => 0.5),
    sim = setup(11);
  d.nextArrival = d.nextShop = 10000;
  const car = { id: 1, color: 2, length: 0.72 };
  for (let i = 0; i < 24; i++) {
    assert.ok(d.park("stadium", car));
    for (let t = 0; t < 2700; t++) d.tick(1 / 120, sim);
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
  const s = setup(11);
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
  s.spawn(2, LOTS.stadium.junction, false, "stadium");
  const c = s.cars[0];
  run(s, 20);
  assert.ok(s.cars.includes(c));
  assert.ok(carPose(c).out <= EXIT - 0.39);
});
test("one roundabout can be placed on an empty eligible crossing and cars follow all twelve curved movements", () => {
  for (let lane = 0; lane < 4; lane++)
    for (const turn of ["left", "straight", "right"]) {
      const s = setup(11);
      assert.ok(s.placeRoundabout(2));
      assert.equal(s.placeRoundabout(1), false);
      s.spawn(lane, 2);
      const c = s.cars[0];
      c.turn = turn;
      c.p = -2.17;
      let prev = carPose(c);
      for (let i = 0; i < 800 && c.junction === 2 && s.cars.includes(c); i++) {
        s.tick(1 / 120);
        const p = carPose(c);
        assert.ok(Math.hypot(p.x - prev.x, p.z - prev.z) < 0.03);
        const r = Math.hypot(p.x - JUNCTION_X[2], p.z - JUNCTION_Z[2]);
        assert.ok(r > 1.1, "drove through central island");
        prev = p;
      }
      assert.ok(c.p > 0 || c.junction !== 2 || !s.cars.includes(c));
      assert.equal(s.crashes, 0);
    }
  const s = setup(7);
  assert.equal(s.placeRoundabout(0), false);
  s.passed = 140;
  s.acknowledgeExpansion();
  s.spawn(0);
  s.cars[0].p = 0;
  assert.equal(s.placeRoundabout(0), false);
});
test("roundabout yields to circulating cars and clears competing arrivals without a red light", () => {
  const s = setup(11);
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
    const s = setup(11);
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
    assert.equal(transferred + s.passed - 200 + s.overflowed, 40);
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

test("T junctions reject their closed arms, force legal turns, and cannot become a roundabout", () => {
  for (const j of [3, 7]) {
    for (const lane of JUNCTION_APPROACHES[j])
      for (const random of [0, 0.5, 0.99]) {
        const s = setup(11);
        s.random = () => random;
        assert.equal(s.spawn(j === 3 ? 0 : 2, j), false);
        assert.equal(s.placeRoundabout(j), false);
        assert.ok(s.spawn(lane, j));
        const c = s.cars[0],
          exit =
            (lane + (c.turn === "left" ? 3 : c.turn === "right" ? 1 : 0)) % 4;
        assert.ok(exitAvailable(j, exit));
        s.signalsAt(j).water.color = s.signalsAt(j).wisconsin.color = "green";
        for (
          let i = 0;
          i < 900 && s.cars.includes(c) && c.junction === j;
          i++
        ) {
          s.tick(1 / 120);
          assert.ok(
            j === 3
              ? carPose(c).z > JUNCTION_Z[j] - 1.4
              : carPose(c).z < JUNCTION_Z[j] + 1.4,
            "entered the closed arm",
          );
        }
      }
  }
});
test("destination routing can loop around a unit when a shop approach would require a U-turn", () => {
  const s = setup(11);
  s.spawn(3, 4, false, "shop");
  for (let j = 0; j < JUNCTION_X.length; j++)
    s.signalsAt(j).water.color = s.signalsAt(j).wisconsin.color = "green";
  run(s, 45);
  assert.ok(s.district.arrivals > 0);
  assert.equal(s.crashes, 0);
});
test("parking returns at the same driveway position and all stall paths stay inside the grid", () => {
  for (const [name, lot] of Object.entries(LOTS)) {
    const s = setup(11);
    s.spawn(
      lot.returnLane,
      lot.junction,
      false,
      "freeway",
      -(lot.branch ?? 9.5),
    );
    const pose = carPose(s.cars[0]);
    assert.ok(Math.hypot(pose.x - lot.exit.x, pose.z - lot.exit.z) < 1e-8);
    for (let slot = 0; slot < lot.capacity; slot++)
      for (const leaving of [false, true]) {
        const path = parkingPath(name, slot, leaving);
        for (const p of path) {
          assert.ok(
            p.x >= DISTRICT_GRID.bounds.minX &&
              p.x <= DISTRICT_GRID.bounds.maxX,
          );
          assert.ok(
            p.z >= DISTRICT_GRID.bounds.minZ &&
              p.z <= DISTRICT_GRID.bounds.maxZ,
          );
        }
      }
  }
});
test("tow trucks use each T junction’s open street and recover the wreck", () => {
  for (const j of [3, 7]) {
    const s = setup(11),
      incident = {
        id: 1,
        junction: j,
        x: JUNCTION_X[j],
        z: JUNCTION_Z[j],
        assigned: false,
      };
    s.incidents = [incident];
    s.cars = [
      {
        id: 1,
        incident: 1,
        junction: j,
        lane: 2,
        p: 0,
        turn: "straight",
        crashed: true,
        length: 0.72,
      },
    ];
    s.signalsAt(j).water.color = "red";
    assert.ok(s.dispatchTow(1));
    const direction = j === 3 ? 1 : -1;
    assert.ok((s.tow.active.z - JUNCTION_Z[j]) * direction > 0);
    run(s, 5);
    assert.ok(s.tow.active.waiting);
    assert.ok(
      Math.abs(s.tow.active.z - (JUNCTION_Z[j] + direction * 2.65)) < 0.01,
    );
    s.signalsAt(j).water.color = "green";
    run(s, 12);
    assert.equal(s.tow.active, null);
    assert.equal(s.incidents.length, 0);
  }
});

test("stadium stalls fit one unit and every driveway segment avoids the stadium", () => {
  const bounds = LOTS.stadium.bounds;
  for (let slot = 0; slot < 24; slot++) {
    const spot = parkingSpace("stadium", slot);
    assert.ok(Math.abs(spot.x - bounds.x) + 0.55 < bounds.w / 2);
    assert.ok(Math.abs(spot.z - bounds.z) + 0.55 < bounds.d / 2);
    for (const leaving of [false, true]) {
      const path = parkingPath("stadium", slot, leaving);
      for (let i = 1; i < path.length; i++)
        for (let step = 0; step <= 20; step++) {
          const t = step / 20,
            x = path[i - 1].x + (path[i].x - path[i - 1].x) * t,
            z = path[i - 1].z + (path[i].z - path[i - 1].z) * t;
          assert.ok(
            Math.hypot(x + 15, z + 26) > 4.9,
            "driveway crossed stadium",
          );
        }
    }
  }
});
test("the two closed streets do not route traffic through the hall or plaza", () => {
  const s = setup(11);
  assert.equal(s.neighbor(3, 2), null);
  assert.equal(s.neighbor(7, 0), null);
  assert.equal(s.neighbor(5, 3), 4);
  assert.equal(s.neighbor(4, 2), 6);
  assert.equal(s.neighbor(6, 3), 7);
});

test("the freeway incline leaves the surface street clear and its piers avoid the crossing", () => {
  for (let i = 0; i < RAMP_CENTER.length; i++) {
    const p = RAMP_CENTER[i];
    for (const side of [-1, 1]) {
      const edge = rampOffset(i, side * 1.15);
      if (p.y > 0.01 && p.y < 3)
        assert.ok(
          edge.z < -14.375 || edge.z > -11.625,
          "incline blocks East Market",
        );
      if (Math.abs(edge.z + 26) < 1.375)
        assert.ok(p.y > 3, "insufficient clearance above Lakefront");
    }
  }
  for (const p of FREEWAY_SUPPORTS) assert.ok(Math.abs(p.z + 26) > 1.6);
});
test("fixed bridges clear the full river channel and traffic follows their slopes continuously", () => {
  for (const bridge of FIXED_BRIDGES) {
    for (const x of [
      RIVER.x - RIVER.width / 2,
      RIVER.x,
      RIVER.x + RIVER.width / 2,
    ])
      assert.ok(bridgeHeight(x, bridge) > 1.3, "boat clearance");
    for (const yaw of [Math.PI / 2, -Math.PI / 2]) {
      let previous = roadElevation(bridge.minX, bridge.z, yaw);
      for (let x = bridge.minX + 0.01; x <= bridge.maxX; x += 0.01) {
        const p = roadElevation(x, bridge.z + 0.57, yaw);
        assert.ok(Math.abs(p.y - previous.y) < 0.02);
        assert.ok(Number.isFinite(p.pitch));
        previous = p;
      }
    }
    assert.equal(bridgeHeight(bridge.minX, bridge), 0);
    assert.equal(bridgeHeight(bridge.maxX, bridge), 0);
  }
  const s = setup(11);
  s.spawn(3, 5);
  const car = s.cars[0];
  Object.assign(car, {
    p: 7.49,
    committed: true,
    turn: "straight",
    speed: 2.4,
  });
  const p = carPose(car),
    before = roadElevation(p.x, p.z, p.yaw);
  s.tick(1 / 120);
  assert.equal(car.junction, 4);
  const next = carPose(car),
    after = roadElevation(next.x, next.z, next.yaw);
  assert.ok(Math.abs(after.y - before.y) < 0.02);
});
test("expanded river boats enter from both map edges and pass under fixed bridges", () => {
  const s = setup(11);
  s.bridge.nextBoat = 0;
  s.tick(1 / 120);
  assert.ok(
    Math.abs(s.bridge.boats[0].direction * s.bridge.boats[0].p - RIVER.maxZ) <
      1,
  );
  s.bridge.nextBoat = 0;
  s.tick(1 / 120);
  const north = s.bridge.boats.find((b) => b.direction === 1);
  assert.ok(Math.abs(north.p - RIVER.minZ) < 1);
  const start = north.p;
  run(s, 24);
  assert.ok(
    north.p > start + 22 && north.p > -13,
    "fixed spans must not gate boat movement",
  );
});
