// One streetcar shares the same lane geometry, signals, queues and collisions
// as the other vehicles. Only its route and station stops are prescribed.
export class HopTraffic {
  constructor(sim, pose) {
    this.sim = sim;
    this.pose = pose;
    this.enabled = false;
    this.carId = null;
    this.next = 8;
    this.stops = 0;
    this.dwell = 0;
    this.doors = 0;
    this.served = null;
    this.segment = null;
  }
  car() {
    return this.sim.cars.find((c) => c.id === this.carId && !c.remove);
  }
  station(car) {
    if (!car || car.lakeFrom !== undefined) return null;
    const offset = 100 - this.pose({ ...car, p: 100 }).out;
    if (car.junction === 1 && car.lane === 2)
      return { name: "Broadway", p: 6.1 + offset };
    if (car.junction === 0 && [0, 1].includes(car.lane))
      return { name: "Public Market", p: 3.55 + offset };
    return null;
  }
  limit(car) {
    if (!car.hop) return Infinity;
    if (this.dwell > 0) return 0;
    const stop = this.station(car);
    return !stop || this.served === stop.name
      ? Infinity
      : Math.max(0, stop.p - car.p);
  }
  tick(dt) {
    if (!this.enabled || !this.sim.started) return;
    let car = this.car();
    if (!car) {
      if (this.carId !== null) {
        this.carId = null;
        this.next = 18;
        this.dwell = this.doors = 0;
      }
      this.next -= dt;
      if (this.next > 0 || !this.sim.spawn(0, 0, null, { hop: true })) return;
      car = this.sim.cars.at(-1);
      this.carId = car.id;
      this.segment = null;
    }
    const segment =
      car.lakeFrom !== undefined
        ? `lake-${car.lakeFrom}`
        : `${car.junction}-${car.lane}`;
    if (segment !== this.segment) {
      this.segment = segment;
      this.served = null;
    }
    this.dwell = Math.max(0, this.dwell - dt);
    const limit = this.limit(car);
    if (this.dwell === 0 && limit < 0.002) {
      const station = this.station(car);
      this.served = station.name;
      this.dwell = 4.8;
      this.stops++;
      car.speed = 0;
    }
    const open = this.dwell > 0.65 && this.dwell < 4.45;
    this.doors += Math.max(
      -dt * 3,
      Math.min(dt * 3, (open ? 1 : 0) - this.doors),
    );
    car.hopDoors = this.doors;
  }
  snapshot() {
    const car = this.car();
    return {
      enabled: this.enabled,
      carId: this.carId,
      stops: this.stops,
      doors: this.doors,
      dwell: this.dwell,
      position: car ? this.pose(car) : null,
    };
  }
}
