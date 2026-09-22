import { BridgeTraffic } from "./cityChallenges.js";
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
export const MAX_CARS = 120;

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
    x: lane.dz * x + lane.dx * z,
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

// The homepage is an endless toy. The level-based game lives in games/milwaukee-traffic.
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
    this.arrivalIndex = 0;
    this.signals = {
      water: { color: "green", left: 0 },
      wisconsin: { color: "red", left: 0 },
    };
    this.bridge = new BridgeTraffic(this.random);
  }
  get interval() {
    return 3.5;
  }
  start() {
    this.started = true;
  }
  signalsAt() {
    return this.signals;
  }
  toggle(axis) {
    const signal = this.signals[axis];
    if (!signal) return;
    this.start();
    if (signal.color === "green") {
      signal.color = "amber";
      signal.left = 0.65;
    } else if (signal.color === "red") {
      signal.color = "green";
    }
  }
  toggleBridge() {
    this.start();
    this.bridge.toggle();
  }
  drop(car, reason) {
    if (car.remove) return;
    car.remove = true;
    if (reason === "overflow") this.overflowed++;
    this.events.push({
      kind: "overflow",
      reason,
      car: { ...car },
      ...carPose(car),
    });
  }
  spawn(lane) {
    if (!APPROACHES[lane]) return false;
    const bus = this.random() < 0.09,
      length = bus ? 1.08 : 0.72;
    for (const tail of this.cars)
      if (
        tail.lane === lane &&
        tail.p < -TURN_START &&
        Math.abs(tail.p - ENTRY) < (tail.length + length) / 2 + 0.2
      )
        this.drop(tail, "overflow");
    this.cars = this.cars.filter((c) => !c.remove);
    if (this.cars.length >= MAX_CARS) return false;
    const turnRoll = this.random();
    this.cars.push({
      id: this.nextId++,
      lane,
      junction: 0,
      p: ENTRY,
      speed: 2.4,
      stopped: 0,
      length,
      bus,
      color: Math.floor(this.random() * 6),
      turn: turnRoll < 0.27 ? "left" : turnRoll > 0.73 ? "right" : "straight",
      committed: false,
      nextHonk: 4.5 + this.random() * 2,
    });
    return true;
  }
  tick(dt) {
    if (!this.started) return;
    this.time += dt;
    this.honkCooldown -= dt;
    this.bridge.tick(
      dt,
      this.cars.map((c) => ({ ...c, ...carPose(c) })),
      this.events,
    );
    for (const signal of Object.values(this.signals))
      if (signal.color === "amber") {
        signal.left -= dt;
        if (signal.left <= 0) signal.color = "red";
      }
    this.nextArrival -= dt;
    if (this.nextArrival <= 0) {
      this.spawn(this.arrivalIndex++ % 4);
      this.nextArrival += this.interval;
    }
    const poses = new Map(this.cars.map((c) => [c.id, carPose(c)]));
    for (const car of this.cars) {
      if (car.remove) continue;
      const pose = poses.get(car.id),
        green = this.signals[APPROACHES[car.lane].axis].color === "green";
      let gap = Infinity;
      if (this.bridge.gated && Math.abs(pose.z) < 1) {
        if (pose.x + car.length / 2 < -7.05 && Math.sin(pose.yaw) > 0.99)
          gap = Math.min(gap, -7.15 - car.length / 2 - pose.x);
        if (pose.x - car.length / 2 > -4.9 && Math.sin(pose.yaw) < -0.99)
          gap = Math.min(gap, pose.x - (-4.8 + car.length / 2));
      }
      for (const other of this.cars) {
        if (other === car || other.remove) continue;
        const op = poses.get(other.id),
          clearance = (other.length + car.length) / 2 + 0.2;
        const shared =
          car.lane === other.lane &&
          (car.turn === other.turn || other.p < -TURN_START + other.length / 2);
        if (shared && other.p > car.p)
          gap = Math.min(gap, other.p - car.p - clearance);
        if (
          pose.out !== null &&
          op.out !== null &&
          pose.exitLane === op.exitLane &&
          op.out > pose.out
        )
          gap = Math.min(gap, op.out - pose.out - clearance);
        if (Math.cos(pose.yaw - op.yaw) > 0.999) {
          const dx = op.x - pose.x,
            dz = op.z - pose.z;
          const lateral = dx * Math.cos(pose.yaw) - dz * Math.sin(pose.yaw);
          const ahead = dx * Math.sin(pose.yaw) + dz * Math.cos(pose.yaw);
          if (Math.abs(lateral) < 0.15 && ahead > 0)
            gap = Math.min(gap, ahead - clearance);
        }
        if (
          car.p <= -TURN_START &&
          other.turn === "left" &&
          other.lane === (car.lane + 2) % 4 &&
          other.p > -TURN_START &&
          (op.out === null || op.out < 2.4)
        )
          gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
        if (
          car.turn === "left" &&
          car.p <= -TURN_START &&
          other.lane === (car.lane + 2) % 4 &&
          other.p > -3.8 &&
          (op.out === null || op.out < 2.4) &&
          (other.committed ||
            this.signals[APPROACHES[other.lane].axis].color === "green") &&
          (other.turn !== "left" ||
            other.p > -TURN_START ||
            other.id < car.id) &&
          !this.cars.some(
            (front) =>
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
      const target = Math.min(2.4, Math.sqrt(2 * 5.5 * gap)),
        change = (target > car.speed ? 3.1 : 7) * dt;
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
      if (a.remove || Math.max(Math.abs(pa.x), Math.abs(pa.z)) > 2.4) continue;
      for (let j = i + 1; j < this.cars.length; j++) {
        const b = this.cars[j],
          pb = carPose(b);
        if (b.remove || Math.max(Math.abs(pb.x), Math.abs(pb.z)) > 2.4)
          continue;
        if (overlaps(a, pa, b, pb)) {
          this.crashes++;
          this.events.push({
            kind: "crash",
            x: (pa.x + pb.x) / 2,
            z: (pa.z + pb.z) / 2,
          });
          this.drop(a, "crash");
          this.drop(b, "crash");
          break;
        }
      }
    }
    this.cars = this.cars.filter((c) => {
      if (c.remove) return false;
      if (carPose(c).out > EXIT) {
        this.passed++;
        return false;
      }
      return true;
    });
  }
  snapshot() {
    return {
      started: this.started,
      time: this.time,
      cars: this.cars.length,
      passed: this.passed,
      crashes: this.crashes,
      overflowed: this.overflowed,
      honks: this.honks,
      interval: this.interval,
      signals: Object.fromEntries(
        Object.entries(this.signals).map(([k, v]) => [k, v.color]),
      ),
      bridge: this.bridge.snapshot(),
    };
  }
}
