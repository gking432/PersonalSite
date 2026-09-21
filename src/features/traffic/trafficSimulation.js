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
export const MAX_CARS = 48;

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
    this.arrivalIndex = 0;
    this.signals = {
      water: { color: "green", left: 0 },
      wisconsin: { color: "red", left: 0 },
    };
  }
  get score() {
    return this.passed - this.crashes * 3;
  }
  get interval() {
    return 2.5 - Math.min(1, this.time / 75) * 1.8;
  }
  start() {
    this.started = true;
  }
  toggle(axis) {
    const signal = this.signals[axis];
    if (!signal) return;
    this.start();
    if (signal.color === "green") {
      signal.color = "amber";
      signal.left = 0.65;
    } else if (signal.color === "red") signal.color = "green";
  }
  spawn(lane) {
    const bus = this.random() < 0.09;
    const length = bus ? 1.08 : 0.72;
    const displaced = this.cars.filter(
      (c) =>
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
    const choice = this.random();
    this.cars.push({
      id: this.nextId++,
      lane,
      p: ENTRY,
      speed: 1.4,
      length,
      bus,
      turn: choice < 0.27 ? "left" : choice > 0.73 ? "right" : "straight",
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
    for (const signal of Object.values(this.signals)) {
      if (signal.color === "amber") {
        signal.left -= dt;
        if (signal.left <= 0) signal.color = "red";
      }
    }
    this.nextArrival -= dt;
    if (this.nextArrival <= 0) {
      this.spawn(this.arrivalIndex++ % 4);
      this.nextArrival += this.interval * (0.83 + this.random() * 0.34);
    }
    const poses = new Map(this.cars.map((c) => [c.id, carPose(c)]));
    // Read positions from the start of the step: update order cannot give one
    // approach priority or let a merging follower overlap its leader.
    for (const car of this.cars) {
      if (car.crashed) {
        car.crashed -= dt;
        if (car.crashed <= 0) car.remove = true;
        continue;
      }
      const pose = poses.get(car.id);
      const green = this.signals[APPROACHES[car.lane].axis].color === "green";
      let gap = Infinity;
      for (const other of this.cars) {
        if (other === car || other.remove) continue;
        const op = poses.get(other.id);
        const clearance = (other.length + car.length) / 2 + 0.2;
        const sharedApproach =
          car.lane === other.lane &&
          (car.turn === other.turn || other.p < -TURN_START + other.length / 2);
        if (sharedApproach && other.p > car.p)
          gap = Math.min(gap, other.p - car.p - clearance);
        if (
          pose.out !== null &&
          op.out !== null &&
          pose.exitLane === op.exitLane &&
          op.out > pose.out
        )
          gap = Math.min(gap, op.out - pose.out - clearance);
        // Once a left turn occupies the crossing, the next oncoming car waits
        // for it to finish rather than driving into its rear or its exit merge.
        if (
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
          // A car trapped behind a waiting left turn cannot cross first.
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
      const target = Math.min(2.4, Math.sqrt(2 * 5.5 * gap));
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
        Math.max(Math.abs(pa.x), Math.abs(pa.z)) > 2.4
      )
        continue;
      for (let j = i + 1; j < this.cars.length; j++) {
        const b = this.cars[j],
          pb = carPose(b);
        if (
          b.crashed ||
          b.remove ||
          Math.max(Math.abs(pb.x), Math.abs(pb.z)) > 2.4
        )
          continue;
        if (overlaps(a, pa, b, pb)) {
          a.crashed = b.crashed = 1.7;
          a.speed = b.speed = 0;
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
      if (pose.out !== null && pose.out > EXIT) {
        this.passed++;
        this.events.push({ kind: "passed", ...pose });
        return false;
      }
      return true;
    });
  }
  snapshot() {
    return {
      started: this.started,
      score: this.score,
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
