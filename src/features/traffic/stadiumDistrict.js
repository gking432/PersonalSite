export const LOTS = {
  stadium: {
    junction: 5,
    exitLane: 1,
    returnLane: 3,
    capacity: 24,
    aisle: -27.9,
    entry: { x: -24.75, z: -13.57 },
    exit: { x: -24.5, z: -12.43 },
  },
  shop: {
    junction: 4,
    exitLane: 3,
    returnLane: 1,
    capacity: 6,
    aisle: 23.8,
    entry: { x: 20.75, z: -12.43 },
    exit: { x: 20.5, z: -13.57 },
  },
};
export function parkingSpace(lot, slot) {
  return lot === "stadium"
    ? { x: slot % 2 ? -26.8 : -29, z: -18.5 + Math.floor(slot / 2) * 0.95 }
    : { x: slot % 2 ? 25 : 22.6, z: -16 + Math.floor(slot / 2) * 1.45 };
}
function motion(points) {
  let length = 0;
  const path = points.map((p, i) => {
    if (i) length += Math.hypot(p.x - points[i - 1].x, p.z - points[i - 1].z);
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
        { x: data.aisle, z: data.entry.z },
        { x: data.aisle, z: spot.z },
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
      ...motion([
        { x: -14.43, z: -22.75 },
        { x: -13.8, z: -24.1 },
        { x: -10, z: -25.3 },
        { x: 21, z: -25.3 },
      ]),
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
        ...motion([
          { x: -42, z: -26.4 },
          { x: -21, z: -26.4 },
          { x: -16, z: -25 },
          { x: -15.57, z: -22.5 },
        ]),
      });
      this.nextArrival = arrival ? (this.time % 9 < 4 ? 0.9 : 3.5) : 7;
    }
    if (this.nextShop <= 0) {
      sim.spawn(0, 4, false, "shop");
      this.nextShop = 10 + this.random() * 8;
    }
    for (const r of this.ramps) {
      r.travel = Math.min(r.length, r.travel + dt * (r.kind === "in" ? 6 : 7));
      if (r.travel >= r.length) {
        if (r.kind === "out") {
          r.done = true;
          continue;
        }
        if (
          sim.spawn(0, 5, false, this.phase === "arrivals" ? "stadium" : "shop")
        )
          r.done = true;
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
              { x: data.aisle, z: spot.z },
              { x: data.aisle, z: data.exit.z },
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
