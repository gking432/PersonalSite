import { FREEWAY, RAMP_IN, RAMP_OUT } from "./districtLayout.js";
export { FREEWAY } from "./districtLayout.js";
export const LOTS = {
  stadium: {
    junction: 2,
    exitLane: 2,
    returnLane: 0,
    capacity: 24,
    aisle: -9.1,
    entry: { x: -14.43, z: -9.75 },
    exit: { x: -15.57, z: -9.5 },
  },
  shop: {
    junction: 3,
    exitLane: 2,
    returnLane: 0,
    capacity: 6,
    aisle: -24.9,
    entry: { x: 11.57, z: -22.75 },
    exit: { x: 10.43, z: -22.5 },
  },
};
export function parkingSpace(lot, slot) {
  return lot === "stadium"
    ? { x: -20 + Math.floor(slot / 2) * 1.7, z: slot % 2 ? -10.3 : -7.9 }
    : { x: 9 + Math.floor(slot / 2) * 1.9, z: slot % 2 ? -26.1 : -23.7 };
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
    const data = LOTS[lot],
      used = new Set(
        this.parking.filter((p) => p.lot === lot).map((p) => p.slot),
      );
    let slot = 0;
    while (used.has(slot)) slot++;
    const spot = parkingSpace(lot, slot);
    this.parking.push({
      id: this.nextId++,
      lot,
      slot,
      car: { ...car, ambulance: false, bus: false, length: 0.72 },
      stage: "entering",
      stay: 18 + this.random() * 18,
      ...motion([
        data.entry,
        { x: data.entry.x, z: data.aisle },
        { x: spot.x, z: data.aisle },
        spot,
      ]),
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
          const data = LOTS[p.lot],
            spot = parkingSpace(p.lot, p.slot);
          Object.assign(
            p,
            { stage: "leaving" },
            motion([
              spot,
              { x: spot.x, z: data.aisle },
              { x: data.exit.x, z: data.aisle },
              data.exit,
            ]),
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
                c.p < -8.45,
            );
            if (
              !blocked &&
              sim.spawn(data.returnLane, data.junction, false, "freeway")
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
