import {
  BLOCK_SPACING,
  LEVEL_SIZE,
  BridgeTraffic,
  HelicopterRescue,
} from "./cityChallenges.js";
export const APPROACHES = [
  { id: "north", axis: "water", dx: 0, dz: 1 },
  { id: "east", axis: "wisconsin", dx: -1, dz: 0 },
  { id: "south", axis: "water", dx: 0, dz: -1 },
  { id: "west", axis: "wisconsin", dx: 1, dz: 0 },
];
export const STOP_LINE = -2.16;
export const ENTRY = -9.5;
export const EXIT = 9.75;
export const LANE_OFFSET = 0.57;
export const TURN_START = 1.55;
export const MAX_CARS = 80;

// p measures distance travelled from the approach, including the arc. Each turn
// meets its outgoing lane tangentially, so neither position nor speed jumps.
export function carPose(car) {
  const lane = APPROACHES[car.lane];
  let x = -LANE_OFFSET,
    z = car.p,
    dx = 0,
    dz = 1;
  let exitLane = car.lane,
    out = car.p;
  if (car.turn && car.turn !== "straight" && car.p > -TURN_START) {
    const sign = car.turn === "left" ? 1 : -1;
    const radius = TURN_START + sign * LANE_OFFSET;
    const distance = car.p + TURN_START;
    const arc = (radius * Math.PI) / 2;
    const theta = Math.min(Math.PI / 2, distance / radius);
    x = sign * (TURN_START - radius * Math.cos(theta));
    z = -TURN_START + radius * Math.sin(theta);
    dx = sign * Math.sin(theta);
    dz = Math.cos(theta);
    out = distance - arc + TURN_START;
    exitLane = (car.lane + (sign === 1 ? 3 : 1)) % 4;
    if (distance >= arc) {
      x = sign * out;
      z = sign * LANE_OFFSET;
    } else out = null;
  } else if (car.p < TURN_START) out = null;
  return {
    x: lane.dz * x + lane.dx * z + (car.junction || 0) * BLOCK_SPACING,
    z: -lane.dx * x + lane.dz * z,
    yaw: Math.atan2(lane.dz * dx + lane.dx * dz, -lane.dx * dx + lane.dz * dz),
    exitLane,
    out,
  };
}
export function carPosition(car) {
  const { x, z } = carPose(car);
  return { x, z };
}

// Separating-axis test for the actual rotated car footprints (including buses).
function overlaps(a, pa, b, pb) {
  const axes = (p) => [
    { x: Math.sin(p.yaw), z: Math.cos(p.yaw) },
    { x: Math.cos(p.yaw), z: -Math.sin(p.yaw) },
  ];
  const aa = axes(pa),
    bb = axes(pb);
  const dot = (u, v) => u.x * v.x + u.z * v.z;
  const delta = { x: pb.x - pa.x, z: pb.z - pa.z };
  return [...aa, ...bb].every((axis) => {
    const extent = (car, basis) =>
      (Math.abs(dot(axis, basis[0])) * car.length) / 2 +
      Math.abs(dot(axis, basis[1])) * 0.19;
    return Math.abs(dot(delta, axis)) < extent(a, aa) + extent(b, bb);
  });
}

// World units and seconds. Rendering and browser lifecycles stay outside this model.
export class TrafficSimulation {
  constructor(random = Math.random) {
    this.random = random;
    this.reset();
  }
  reset() {
    this.started = false;
    this.time = 0;
    this.passed = 0;
    this.crashes = 0;
    this.overflowed = 0;
    this.honks = 0;
    this.honkCooldown = 0;
    this.cars = [];
    this.events = [];
    this.nextId = 1;
    this.nextArrival = 0;
    this.nextAmbulance = Infinity;
    this.incidents = [];
    this.nextIncident = 1;
    this.bridge = new BridgeTraffic(this.random);
    this.rescue = new HelicopterRescue();
    this.signals2 = {
      water: { color: "green", left: 0 },
      wisconsin: { color: "red", left: 0 },
    };
    this.arrivalIndex = 0;
    this.signals = {
      water: { color: "green", left: 0 },
      wisconsin: { color: "red", left: 0 },
    };
  }
  get level() {
    return 1 + Math.floor(this.passed / LEVEL_SIZE);
  }
  get progress() {
    return this.passed % LEVEL_SIZE;
  }
  get score() {
    return this.passed;
  }
  signalsAt(junction = 0) {
    return junction ? this.signals2 : this.signals;
  }
  chooseTurn() {
    const v = this.random();
    return v < 0.27 ? "left" : v > 0.73 ? "right" : "straight";
  }
  dispatchRescue(id) {
    return this.rescue.dispatch(this.incidents.find((i) => i.id === id));
  }
  toggleBridge() {
    if (this.level >= 3) this.bridge.toggle();
  }
  complete(car) {
    const previous = this.level;
    this.passed++;
    if (car.ambulance) this.events.push({ kind: "thanks", ...carPose(car) });
    if (this.level > previous) {
      this.events.push({ kind: "level", level: this.level });
      this.nextArrival = Math.max(this.nextArrival, 2.5);
      if (this.level === 2) this.nextAmbulance = this.time + 3;
    }
  }
  get interval() {
    const pace = Math.max(0.7, 1.65 - (this.level - 1) * 0.16);
    return this.time % 18 < 12 ? pace : pace * 1.8;
  }
  start() {
    this.started = true;
  }
  toggle(axis, junction = 0) {
    if (junction && this.level < 2) return;
    const signal = this.signalsAt(junction)[axis];
    if (!signal) return;
    this.start();
    if (signal.color === "green") {
      signal.color = "amber";
      signal.left = 0.65;
    } else if (signal.color === "red") signal.color = "green";
  }
  spawn(lane, junction = 0, ambulance = false) {
    const bus = !ambulance && this.random() < 0.09;
    const length = bus ? 1.08 : ambulance ? 0.92 : 0.72;
    const displaced = this.cars.filter(
      (c) =>
        (c.junction || 0) === junction &&
        c.lane === lane &&
        c.p < -TURN_START &&
        c.p - ENTRY < (c.length + length) / 2 + 0.2,
    );
    for (const tail of displaced) {
      // The newest arrival shoves the back of an overflowing queue over the edge.
      this.events.push({
        kind: "overflow",
        car: { ...tail },
        ...carPose(tail),
      });
      this.cars = this.cars.filter((c) => c !== tail);
      this.overflowed++;
    }
    if (this.cars.length >= MAX_CARS) return false;
    const turn = this.chooseTurn();
    this.cars.push({
      id: this.nextId++,
      lane,
      junction,
      ambulance,
      p: ENTRY,
      speed: 1.4,
      length,
      bus,
      turn,
      color: Math.floor(this.random() * 6),
      committed: false,
      stopped: 0,
      crashed: 0,
      nextHonk: 4.5 + this.random() * 2.5,
    });
    return true;
  }
  tick(dt) {
    if (!this.started) return;
    this.time += dt;
    this.honkCooldown -= dt;
    this.rescue.tick(dt, this.cars, this.incidents);
    if (this.level >= 3)
      this.bridge.tick(
        dt,
        this.cars.map((c) => ({ ...c, ...carPose(c) })),
        this.events,
      );
    for (const signal of [
      ...Object.values(this.signals),
      ...Object.values(this.signals2),
    ]) {
      if (signal.color === "amber") {
        signal.left -= dt;
        if (signal.left <= 0) signal.color = "red";
      }
    }
    this.nextArrival -= dt;
    if (this.nextArrival <= 0) {
      const entries =
        this.level < 2
          ? [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ]
          : [
              [0, 0],
              [1, 1],
              [0, 2],
              [1, 0],
              [0, 3],
              [1, 2],
            ];
      const index = this.arrivalIndex++;
      const [junction, lane] =
        entries[
          index % 3 === 0
            ? Math.floor(this.time / 12) % entries.length
            : index % entries.length
        ];
      const ambulance = this.level >= 2 && this.time >= this.nextAmbulance;
      this.spawn(lane, junction, ambulance);
      if (ambulance) this.nextAmbulance = this.time + 18 + this.random() * 12;
      this.nextArrival += this.interval * (0.83 + this.random() * 0.34);
    }
    const poses = new Map(this.cars.map((c) => [c.id, carPose(c)]));
    // Read positions from the start of the step: update order cannot give one
    // approach priority or let a merging follower overlap its leader.
    for (const car of this.cars) {
      if (car.crashed || car.remove) continue;
      const pose = poses.get(car.id);
      const green =
        this.signalsAt(car.junction)[APPROACHES[car.lane].axis].color ===
        "green";
      let gap = Infinity;
      if (
        this.incidents.some(
          (i) =>
            i.junction === (car.junction || 0) &&
            this.cars.some((c) => c.incident === i.id && !c.lifted),
        ) &&
        car.p < -TURN_START
      )
        gap = STOP_LINE - (car.length - 0.72) / 2 - car.p;
      if (this.level >= 3 && this.bridge.gated && Math.abs(pose.z) < 1) {
        if (pose.x + car.length / 2 < -7.05 && Math.sin(pose.yaw) > 0.99)
          gap = Math.min(gap, -7.15 - car.length / 2 - pose.x);
        if (pose.x - car.length / 2 > -4.9 && Math.sin(pose.yaw) < -0.99)
          gap = Math.min(gap, pose.x - (-4.8 + car.length / 2));
      }
      for (const other of this.cars) {
        if (other === car || other.remove || other.lifted) continue;
        const op = poses.get(other.id);
        const clearance = (other.length + car.length) / 2 + 0.2;
        // A driver already inside the crossing still brakes for a new wreck.
        if (
          other.crashed &&
          (car.junction || 0) === (other.junction || 0) &&
          car.p > -TURN_START &&
          pose.out === null
        ) {
          for (let distance = 0; distance < 2.5; distance += 0.12) {
            if (
              overlaps(car, carPose({ ...car, p: car.p + distance }), other, op)
            ) {
              gap = Math.min(gap, Math.max(0, distance - 0.18));
              break;
            }
          }
        }
        const sharedApproach =
          (car.junction || 0) === (other.junction || 0) &&
          car.lane === other.lane &&
          (car.turn === other.turn || other.p < -TURN_START + other.length / 2);
        if (sharedApproach && other.p > car.p)
          gap = Math.min(gap, other.p - car.p - clearance);
        if (
          pose.out !== null &&
          op.out !== null &&
          (car.junction || 0) === (other.junction || 0) &&
          pose.exitLane === op.exitLane &&
          op.out > pose.out
        )
          gap = Math.min(gap, op.out - pose.out - clearance);
        // Following on the road connecting the blocks also sees cars owned by
        // the next junction, so its queue can back up into this one.
        if (
          Math.abs(Math.sin(pose.yaw)) > 0.99 &&
          Math.cos(pose.yaw - op.yaw) > 0.99 &&
          Math.abs(pose.z - op.z) < 0.15
        ) {
          const ahead = (op.x - pose.x) * Math.sin(pose.yaw);
          if (ahead > 0) gap = Math.min(gap, ahead - clearance);
        }
        // Once a left turn occupies the crossing, the next oncoming car waits
        // for it to finish rather than driving into its rear or its exit merge.
        if (
          (car.junction || 0) === (other.junction || 0) &&
          car.p <= -TURN_START &&
          other.turn === "left" &&
          other.lane === (car.lane + 2) % 4 &&
          other.p > -TURN_START &&
          (op.out === null || op.out < 2.4)
        )
          gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
        // Left turns yield to oncoming traffic. Opposing left turns take turns
        // through the small crossing; the older car breaks a simultaneous tie.
        if (
          (car.junction || 0) === (other.junction || 0) &&
          car.turn === "left" &&
          car.p <= -TURN_START &&
          other.lane === (car.lane + 2) % 4 &&
          other.p > -3.8 &&
          (op.out === null || op.out < 2.4) &&
          (other.committed ||
            this.signalsAt(other.junction)[APPROACHES[other.lane].axis]
              .color === "green") &&
          (other.turn !== "left" ||
            other.p > -TURN_START ||
            other.id < car.id) &&
          // A car trapped behind a waiting left turn cannot cross first.
          !this.cars.some(
            (front) =>
              (front.junction || 0) === (other.junction || 0) &&
              front.lane === other.lane &&
              front.p > other.p &&
              front.p <= -TURN_START,
          )
        )
          gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
      }
      if (!car.committed && !green)
        gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
      gap = Math.max(0, gap);
      const target = Math.min(
        car.ambulance ? 2.8 : 2.4,
        Math.sqrt(2 * 5.5 * gap),
      );
      const change = (target > car.speed ? 3.1 : 7) * dt;
      car.speed +=
        Math.sign(target - car.speed) *
        Math.min(change, Math.abs(target - car.speed));
      car.p += Math.min(car.speed * dt, gap);
      if (green && car.p > STOP_LINE + 0.02) car.committed = true;
      car.stopped = car.speed < 0.1 ? car.stopped + dt : 0;
      if (!car.stopped) car.nextHonk = 4.5 + (car.id % 6) * 0.43;
      if (car.stopped > car.nextHonk && this.honkCooldown <= 0) {
        this.events.push({ kind: "honk", ...carPosition(car) });
        this.honks++;
        this.honkCooldown = 0.65;
        car.nextHonk = car.stopped + 4 + this.random() * 4;
      }
    }
    for (let i = 0; i < this.cars.length; i++) {
      const a = this.cars[i],
        pa = carPose(a);
      if (
        a.crashed ||
        a.remove ||
        Math.max(
          Math.abs(pa.x - (a.junction || 0) * BLOCK_SPACING),
          Math.abs(pa.z),
        ) > 2.4
      )
        continue;
      for (let j = i + 1; j < this.cars.length; j++) {
        const b = this.cars[j],
          pb = carPose(b);
        if (
          b.crashed ||
          b.remove ||
          Math.max(
            Math.abs(pb.x - (b.junction || 0) * BLOCK_SPACING),
            Math.abs(pb.z),
          ) > 2.4
        )
          continue;
        if (overlaps(a, pa, b, pb)) {
          a.crashed = b.crashed = true;
          a.speed = b.speed = 0;
          a.incident = b.incident = this.nextIncident++;
          this.incidents.push({
            id: a.incident,
            junction: a.junction || 0,
            x: (pa.x + pb.x) / 2,
            z: (pa.z + pb.z) / 2,
            assigned: false,
          });
          this.crashes++;
          this.events.push({
            kind: "crash",
            x: (pa.x + pb.x) / 2,
            z: (pa.z + pb.z) / 2,
          });
          break;
        }
      }
    }
    this.cars = this.cars.filter((car) => {
      if (car.remove) return false;
      const pose = carPose(car);
      if (car.crashed) return true;
      const junction = car.junction || 0;
      const connects =
        this.level >= 2 &&
        ((junction === 0 && pose.exitLane === 3) ||
          (junction === 1 && pose.exitLane === 1));
      if (connects && pose.out !== null && pose.out >= BLOCK_SPACING / 2) {
        car.junction = 1 - junction;
        car.lane = pose.exitLane;
        car.p = pose.out - BLOCK_SPACING;
        car.turn = car.p > -TURN_START ? "straight" : this.chooseTurn();
        car.committed = car.p > STOP_LINE + 0.02;
      } else if (pose.out !== null && pose.out > EXIT) {
        this.complete(car);
        return false;
      }
      return true;
    });
  }
  snapshot() {
    return {
      started: this.started,
      score: this.score,
      level: this.level,
      progress: this.progress,
      incidents: this.incidents.map((i) => ({ ...i })),
      rescue: this.rescue.snapshot(),
      bridge: this.bridge.snapshot(),
      signals2: {
        water: this.signals2.water.color,
        wisconsin: this.signals2.wisconsin.color,
      },
      passed: this.passed,
      crashes: this.crashes,
      overflowed: this.overflowed,
      honks: this.honks,
      time: this.time,
      interval: this.interval,
      cars: this.cars.length,
      waiting: this.cars.filter((c) => c.stopped > 0.3).length,
      signals: {
        water: this.signals.water.color,
        wisconsin: this.signals.wisconsin.color,
      },
    };
  }
}
