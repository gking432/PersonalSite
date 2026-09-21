export const BLOCK_SPACING = 11;
export const LEVEL_SIZE = 20;
export const RESCUE_DURATION = 7;
export const RESCUE_RELOAD = 15;

export class BridgeTraffic {
  constructor(random) {
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
  }
  get gated() {
    return this.requestedOpen || this.lift > 0;
  }
  toggle() {
    this.requestedOpen = !this.requestedOpen;
  }
  tick(dt, cars, events) {
    this.nextBoat -= dt;
    if (this.nextBoat <= 0) {
      if (this.boats.length < 4) {
        const direction = this.nextId % 2 ? -1 : 1;
        this.boats.push({
          id: this.nextId++,
          p: -6.2,
          direction,
          x: -5.94 + direction * 0.35,
          waited: 0,
          nextToot: 7,
        });
      }
      this.nextBoat = 18 + this.random() * 8;
    }
    const roadOccupied = cars.some(
      (c) =>
        !c.lifted &&
        Math.abs(c.z) < 1.2 &&
        c.x + c.length / 2 > -7.05 &&
        c.x - c.length / 2 < -4.9,
    );
    const boatOccupied = this.boats.some((b) => b.committed && b.p < 2.7);
    if (this.requestedOpen) {
      if (roadOccupied && this.lift === 0) this.phase = "clearing";
      else {
        this.lift = Math.min(1, this.lift + dt / 2.3);
        this.phase = this.lift === 1 ? "open" : "opening";
      }
    } else if (boatOccupied && this.lift > 0) this.phase = "boat crossing";
    else {
      this.lift = Math.max(0, this.lift - dt / 2.3);
      this.phase = this.lift === 0 ? "closed" : "closing";
    }
    for (const boat of this.boats) {
      let limit = this.lift < 0.98 && !boat.committed ? -2.3 : Infinity;
      for (const ahead of this.boats)
        if (
          ahead !== boat &&
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
      passed: this.passed,
    };
  }
}

export class HelicopterRescue {
  reset() {
    this.active = null;
    this.cooldown = 0;
  }
  constructor() {
    this.reset();
  }
  dispatch(incident) {
    if (!incident || incident.assigned || this.active || this.cooldown > 0)
      return false;
    incident.assigned = true;
    this.active = { id: incident.id, x: incident.x, z: incident.z, elapsed: 0 };
    return true;
  }
  tick(dt, cars, incidents) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (!this.active) return;
    this.active.elapsed += dt;
    if (this.active.elapsed >= 4.4)
      for (const car of cars)
        if (car.incident === this.active.id) car.lifted = true;
    if (this.active.elapsed >= RESCUE_DURATION) {
      for (const car of cars)
        if (car.incident === this.active.id) car.remove = true;
      const index = incidents.findIndex((i) => i.id === this.active.id);
      if (index >= 0) incidents.splice(index, 1);
      this.active = null;
      this.cooldown = RESCUE_RELOAD;
    }
  }
  snapshot() {
    return {
      busy: !!this.active,
      cooldown: Math.ceil(this.cooldown),
      incident: this.active?.id ?? null,
    };
  }
}
