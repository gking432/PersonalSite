// A short river with real queues. Overflow and bridge collisions eject boats.
export class BridgeTraffic {
  constructor(random = Math.random) {
    this.random = random;
    this.reset();
  }
  reset() {
    this.requestedOpen = false;
    this.lift = 0;
    this.phase = "closed";
    this.boats = [];
    this.nextBoat = 3;
    this.nextId = 1;
    this.passed = 0;
    this.overflowed = 0;
    this.crashes = 0;
  }
  get gated() {
    return this.requestedOpen || this.lift > 0;
  }
  toggle() {
    this.requestedOpen = !this.requestedOpen;
  }
  drop(boat, reason, events) {
    if (boat.remove) return;
    boat.remove = true;
    this[reason === "crash" ? "crashes" : "overflowed"]++;
    events.push({
      kind: "boat-fall",
      reason,
      boat: { ...boat },
      x: boat.x,
      z: boat.direction * boat.p,
      yaw: boat.direction === 1 ? 0 : Math.PI,
    });
    if (reason === "crash")
      events.push({ kind: "crash", x: boat.x, z: boat.direction * boat.p });
  }
  spawn(events) {
    const direction = this.nextId % 2 ? -1 : 1;
    for (const tail of this.boats)
      if (tail.direction === direction && tail.p < -4.6)
        this.drop(tail, "overflow", events);
    this.boats = this.boats.filter((b) => !b.remove);
    this.boats.push({
      id: this.nextId++,
      p: -6.2,
      direction,
      x: -5.94 + direction * 0.35,
      waited: 0,
      nextToot: 7,
    });
  }
  tick(dt, cars, events) {
    this.nextBoat -= dt;
    if (this.nextBoat <= 0) {
      this.spawn(events);
      this.nextBoat = 5.5 + this.random() * 1.5;
    }
    const roadOccupied = cars.some(
      (c) =>
        Math.abs(c.z) < 1.2 &&
        c.x + c.length / 2 > -7.05 &&
        c.x - c.length / 2 < -4.9,
    );
    if (this.requestedOpen) {
      if (roadOccupied && this.lift === 0) this.phase = "clearing";
      else {
        this.lift = Math.min(1, this.lift + dt / 2.3);
        this.phase = this.lift === 1 ? "open" : "opening";
      }
    } else {
      this.lift = Math.max(0, this.lift - dt / 2.3);
      this.phase = this.lift === 0 ? "closed" : "closing";
    }
    for (const boat of this.boats) {
      if (boat.remove) continue;
      if (boat.committed && Math.abs(boat.p) < 1.95 && this.lift < 0.82) {
        this.drop(boat, "crash", events);
        continue;
      }
      let limit = this.lift < 0.98 && !boat.committed ? -2.3 : Infinity;
      for (const ahead of this.boats)
        if (
          ahead !== boat &&
          !ahead.remove &&
          ahead.direction === boat.direction &&
          ahead.p > boat.p
        )
          limit = Math.min(limit, ahead.p - 1.6);
      const step = Math.min(0.95 * dt, Math.max(0, limit - boat.p));
      boat.p += step;
      if (this.lift >= 0.98 && boat.p > -2.3) boat.committed = true;
      boat.waited = step < dt * 0.01 ? boat.waited + dt : 0;
      if (boat.waited > boat.nextToot) {
        events.push({ kind: "toot", x: boat.x, z: boat.direction * boat.p });
        boat.nextToot = boat.waited + 9;
      }
    }
    this.boats = this.boats.filter((b) => {
      if (b.remove) return false;
      if (b.p > 6.9) {
        this.passed++;
        return false;
      }
      return true;
    });
  }
  snapshot() {
    return {
      phase: this.phase,
      requestedOpen: this.requestedOpen,
      lift: this.lift,
      waiting: this.boats.filter((b) => b.waited > 0.3).length,
      boats: this.boats.length,
      passed: this.passed,
      overflowed: this.overflowed,
      crashes: this.crashes,
    };
  }
}
