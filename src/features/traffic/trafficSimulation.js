export const APPROACHES = [
  { id: "north", axis: "water", dx: 0, dz: 1 },
  { id: "east", axis: "wisconsin", dx: -1, dz: 0 },
  { id: "south", axis: "water", dx: 0, dz: -1 },
  { id: "west", axis: "wisconsin", dx: 1, dz: 0 },
];
export const STOP_LINE = -2.16;
export const ENTRY = -6.8;
export const EXIT = 7;
export const LANE_OFFSET = 0.57;

export function carPosition(car) {
  const lane = APPROACHES[car.lane];
  return {
    x: lane.dx * car.p - lane.dz * LANE_OFFSET,
    z: lane.dz * car.p + lane.dx * LANE_OFFSET,
  };
}

// World units and seconds. Rendering and browser lifecycles stay outside this model.
export class TrafficSimulation {
  constructor(random = Math.random) {
    this.random = random;
    this.reset();
  }
  reset() {
    this.started = false;
    this.jammed = false;
    this.time = 0;
    this.passed = 0;
    this.crashes = 0;
    this.cars = [];
    this.events = [];
    this.nextId = 1;
    this.nextArrival = 0;
    this.arrivalIndex = 0;
    this.blocked = [0, 0, 0, 0];
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
    if (!signal || this.jammed) return;
    this.start();
    if (signal.color === "green") {
      signal.color = "amber";
      signal.left = 0.65;
    } else if (signal.color === "red") signal.color = "green";
  }
  spawn(lane) {
    const bus = this.random() < 0.09;
    const length = bus ? 1.08 : 0.72;
    if (
      this.cars.length >= 32 ||
      this.cars.some(
        (c) => c.lane === lane && c.p - ENTRY < (c.length + length) / 2 + 0.2,
      )
    )
      return false;
    this.cars.push({
      id: this.nextId++,
      lane,
      p: ENTRY,
      speed: 1.4,
      length: bus ? 1.08 : 0.72,
      bus,
      color: Math.floor(this.random() * 6),
      committed: false,
      stopped: 0,
      crashed: 0,
    });
    return true;
  }
  tick(dt) {
    if (!this.started || this.jammed) return;
    this.time += dt;
    for (const signal of Object.values(this.signals)) {
      if (signal.color === "amber") {
        signal.left -= dt;
        if (signal.left <= 0) signal.color = "red";
      }
    }
    this.nextArrival -= dt;
    if (this.nextArrival <= 0) {
      // Rotate approaches so every street gets traffic; jitter changes its rhythm.
      const lane = this.arrivalIndex++ % 4;
      this.spawn(lane);
      this.nextArrival += this.interval * (0.83 + this.random() * 0.34);
    }
    for (let lane = 0; lane < 4; lane++) {
      const cars = this.cars
        .filter((c) => c.lane === lane)
        .sort((a, b) => b.p - a.p);
      let leader = null;
      for (const car of cars) {
        if (car.crashed) {
          car.crashed -= dt;
          if (car.crashed <= 0) car.remove = true;
          leader = car;
          continue;
        }
        let limit = leader
          ? leader.p - (leader.length + car.length) / 2 - 0.2
          : Infinity;
        const green = this.signals[APPROACHES[lane].axis].color === "green";
        if (!car.committed && !green)
          limit = Math.min(limit, STOP_LINE - (car.length - 0.72) / 2);
        const gap = Math.max(0, limit - car.p);
        const target = Math.min(2.4, Math.sqrt(2 * 5.5 * gap));
        const change = (target > car.speed ? 3.1 : 7) * dt;
        car.speed +=
          Math.sign(target - car.speed) *
          Math.min(change, Math.abs(target - car.speed));
        car.p += Math.min(car.speed * dt, gap);
        if (green && car.p > STOP_LINE + 0.02) car.committed = true;
        car.stopped = car.speed < 0.1 ? car.stopped + dt : 0;
        leader = car;
      }
      const full =
        cars.length >= 4 && cars.at(-1).p < ENTRY + 1 && cars[0].speed < 0.1;
      this.blocked[lane] = full ? this.blocked[lane] + dt : 0;
      if (this.blocked[lane] > 12) this.jammed = true;
    }
    for (let i = 0; i < this.cars.length; i++) {
      const a = this.cars[i];
      if (a.crashed || a.remove || Math.abs(a.p) > 1.6) continue;
      for (let j = i + 1; j < this.cars.length; j++) {
        const b = this.cars[j];
        if (
          b.crashed ||
          b.remove ||
          Math.abs(b.p) > 1.6 ||
          APPROACHES[a.lane].axis === APPROACHES[b.lane].axis
        )
          continue;
        const pa = carPosition(a),
          pb = carPosition(b);
        const ax = APPROACHES[a.lane].dx ? a.length / 2 : 0.19;
        const az = APPROACHES[a.lane].dz ? a.length / 2 : 0.19;
        const bx = APPROACHES[b.lane].dx ? b.length / 2 : 0.19;
        const bz = APPROACHES[b.lane].dz ? b.length / 2 : 0.19;
        if (
          Math.abs(pa.x - pb.x) < ax + bx &&
          Math.abs(pa.z - pb.z) < az + bz
        ) {
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
      if (car.p > EXIT) {
        this.passed++;
        this.events.push({ kind: "passed", ...carPosition(car) });
        return false;
      }
      return true;
    });
  }
  snapshot() {
    return {
      started: this.started,
      jammed: this.jammed,
      score: this.score,
      passed: this.passed,
      crashes: this.crashes,
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
