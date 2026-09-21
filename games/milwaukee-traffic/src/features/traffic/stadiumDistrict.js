import { FREEWAY, RAMP_IN, RAMP_OUT } from "./districtLayout.js";
export { FREEWAY } from "./districtLayout.js";
// Both the stadium and all 24 spaces fit inside its single 14.4 × 13.8 unit.
export const LOTS = {
  stadium: {
    junction: 5,
    exitLane: 2,
    returnLane: 0,
    capacity: 24,
    branch: 6,
    entry: { x: -14.43, z: -19 },
    exit: { x: -15.57, z: -19 },
    bounds: { x: -15, z: -26, w: 14.4, d: 13.8 },
  },
  shop: {
    junction: 4,
    exitLane: 1,
    returnLane: 3,
    capacity: 3,
    branch: 2.5,
    entry: { x: -2.5, z: -13.57 },
    exit: { x: -2.5, z: -12.43 },
    bounds: { x: -3.48, z: -17.07, w: 3.65, d: 4.7 },
  },
};
export function parkingSpace(lot, slot) {
  if (lot === "shop") return { x: -4.5 + slot * 1.02, z: -15.3 };
  const side = Math.floor(slot / 6),
    i = slot % 6;
  const across = [-4.25, -2.95, -1.65, 1.65, 2.95, 4.25][i];
  const along =
    side === 1 ? [-5.25, -3.75, -2.25, 2.25, 3.75, 5.25][i] : -3.75 + i * 1.5;
  return side === 0
    ? { x: -15 + across, z: -19.9 }
    : side === 1
      ? { x: -8.7, z: -26 + along }
      : side === 2
        ? { x: -15 + across, z: -32.1 }
        : { x: -21.3, z: -26 + along };
}
const RING_SIDE = 10.5;
function ringPoint(distance) {
  const s = ((distance % 42) + 42) % 42;
  return s < 10.5
    ? { x: -20.25 + s, z: -20.75 }
    : s < 21
      ? { x: -9.75, z: -20.75 - (s - 10.5) }
      : s < 31.5
        ? { x: -9.75 - (s - 21), z: -31.25 }
        : { x: -20.25, z: -31.25 + (s - 31.5) };
}
function ringPath(from, to) {
  if (to < from) to += 42;
  const path = [ringPoint(from)];
  for (
    let s = (Math.floor(from / RING_SIDE) + 1) * RING_SIDE;
    s < to;
    s += RING_SIDE
  )
    path.push(ringPoint(s));
  path.push(ringPoint(to));
  return path;
}
export function parkingPath(lot, slot, leaving = false) {
  const data = LOTS[lot],
    spot = parkingSpace(lot, slot);
  if (lot === "shop") {
    const path = [
      leaving ? data.exit : data.entry,
      { x: (leaving ? data.exit : data.entry).x, z: -14.85, y: 0.12 },
      { x: spot.x, z: -14.85, y: 0.12 },
      { ...spot, y: 0.12 },
    ];
    return leaving ? path.reverse() : path;
  }
  const side = Math.floor(slot / 6),
    x = spot.x + 15,
    z = spot.z + 26;
  const position =
    side === 0
      ? x + 5.25
      : side === 1
        ? 15.75 - z
        : side === 2
          ? 26.25 - x
          : 36.75 + z;
  // One-way circulation follows the perimeter; no shortcut crosses the field.
  return leaving
    ? [spot, ...ringPath(position, 4.68), data.exit]
    : [data.entry, ...ringPath(5.82, position), spot];
}
function motion(points) {
  let length = 0;
  const path = points.map((p, i) => {
    if (i)
      length += Math.hypot(
        p.x - points[i - 1].x,
        p.z - points[i - 1].z,
        (p.y || 0) - (points[i - 1].y || 0),
      );
    return { ...p, d: length };
  });
  return { path, length, travel: 0 };
}
function position(move) {
  const distance = Math.min(move.length, move.travel);
  let i = 1;
  while (i < move.path.length - 1 && move.path[i].d < distance) i++;
  const a = move.path[i - 1],
    b = move.path[i],
    t = (distance - a.d) / (b.d - a.d || 1);
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    y: (a.y || 0) + ((b.y || 0) - (a.y || 0)) * t,
    pitch: Math.atan2(
      (b.y || 0) - (a.y || 0),
      Math.hypot(b.x - a.x, b.z - a.z),
    ),
    yaw: Math.atan2(b.x - a.x, b.z - a.z),
  };
}
export class StadiumDistrict {
  constructor(random) {
    this.random = random;
    this.time = 0;
    this.parking = [];
    this.ramps = [];
    this.nextArrival = 2;
    this.nextShop = 7;
    this.nextDeparture = 0;
    this.nextId = 1;
    this.arrivals = 0;
    this.departures = 0;
  }
  get phase() {
    const t = this.time % 130;
    return t < 50 ? "arrivals" : t < 85 ? "game" : "departures";
  }
  get remaining() {
    const t = this.time % 130;
    return Math.ceil((t < 50 ? 50 : t < 85 ? 85 : 130) - t);
  }
  canPark(lot) {
    return (
      this.parking.filter((p) => p.lot === lot).length < LOTS[lot].capacity &&
      this.parking.filter((p) => p.lot === lot && p.stage === "entering")
        .length < 2
    );
  }
  park(lot, car) {
    if (!this.canPark(lot)) return false;
    const used = new Set(
      this.parking.filter((p) => p.lot === lot).map((p) => p.slot),
    );
    let slot = 0;
    while (used.has(slot)) slot++;
    this.parking.push({
      id: this.nextId++,
      lot,
      slot,
      car: { ...car, ambulance: false, bus: false, length: 0.72 },
      stage: "entering",
      stay: 18 + this.random() * 18,
      ...motion(parkingPath(lot, slot)),
    });
    this.arrivals++;
    return true;
  }
  freewayExit(car) {
    this.ramps.push({
      id: this.nextId++,
      kind: "out",
      car: { ...car },
      ...motion(RAMP_OUT),
    });
  }
  tick(dt, sim) {
    this.time += dt;
    this.nextArrival -= dt;
    this.nextShop -= dt;
    this.nextDeparture -= dt;
    if (
      this.nextArrival <= 0 &&
      this.ramps.filter((r) => r.kind === "in").length < 5
    ) {
      const arrival = this.phase === "arrivals";
      const car = {
        id: -this.nextId,
        color: Math.floor(this.random() * 6),
        length: 0.72,
        turn: "straight",
      };
      this.ramps.push({
        id: this.nextId++,
        kind: "in",
        car,
        ...motion(RAMP_IN),
      });
      this.nextArrival = arrival ? (this.time % 9 < 4 ? 0.9 : 3.5) : 7;
    }
    if (this.nextShop <= 0) {
      sim.spawn(1, 3, false, "shop");
      this.nextShop = 10 + this.random() * 8;
    }
    for (const r of this.ramps) {
      // Ramp queues remain on the deck and merge only when the surface lane
      // has space. Arrivals never evict a car waiting at the nearby light.
      let limit = r.length;
      for (const ahead of this.ramps)
        if (ahead !== r && ahead.kind === r.kind && ahead.travel > r.travel)
          limit = Math.min(limit, ahead.travel - 1.05);
      r.travel = Math.max(
        r.travel,
        Math.min(limit, r.travel + dt * (r.kind === "in" ? 4 : 5)),
      );
      if (r.travel >= r.length) {
        if (r.kind === "out") {
          r.done = true;
          continue;
        }
        const blocked = sim.cars.some(
          (c) =>
            c.junction === FREEWAY.junction &&
            c.lane === FREEWAY.returnLane &&
            Math.abs(c.p + FREEWAY.branch) < 1.15,
        );
        if (
          !blocked &&
          sim.spawn(
            FREEWAY.returnLane,
            FREEWAY.junction,
            false,
            this.phase === "arrivals" ? "stadium" : "shop",
            -FREEWAY.branch,
          )
        ) {
          sim.cars.at(-1).color = r.car.color;
          r.done = true;
        }
      }
    }
    this.ramps = this.ramps.filter((r) => !r.done);
    for (const p of this.parking) {
      if (p.stage === "parked") {
        p.stay -= dt;
        if (
          (p.lot === "stadium" ? this.phase === "departures" : p.stay <= 0) &&
          this.nextDeparture <= 0
        ) {
          Object.assign(
            p,
            { stage: "leaving" },
            motion(parkingPath(p.lot, p.slot, true)),
          );
          this.nextDeparture = 1.4;
        }
      } else {
        p.travel = Math.min(p.length, p.travel + dt * 2.1);
        if (p.travel >= p.length) {
          if (p.stage === "entering") p.stage = "parked";
          else {
            const data = LOTS[p.lot];
            // Returning cars merge into the real lane; a backed-up exit holds them in the lot.
            const blocked = sim.cars.some(
              (c) =>
                c.junction === data.junction &&
                c.lane === data.returnLane &&
                Math.abs(c.p + (data.branch ?? 9.5)) < 1.15,
            );
            if (
              !blocked &&
              sim.spawn(
                data.returnLane,
                data.junction,
                false,
                "freeway",
                -(data.branch ?? 9.5),
              )
            ) {
              const car = sim.cars.at(-1);
              car.color = p.car.color;
              p.done = true;
              this.departures++;
            }
          }
        }
      }
    }
    this.parking = this.parking.filter((p) => !p.done);
  }
  visualCars() {
    return [...this.parking, ...this.ramps].map((p) => ({
      id: `district-${p.id}`,
      car: p.car,
      ...position(p),
    }));
  }
  snapshot() {
    return {
      phase: this.phase,
      remaining: this.remaining,
      stadium: this.parking.filter((p) => p.lot === "stadium").length,
      shop: this.parking.filter((p) => p.lot === "shop").length,
      arrivals: this.arrivals,
      departures: this.departures,
      nextWave: Math.max(0, Math.ceil(this.nextArrival)),
    };
  }
}
