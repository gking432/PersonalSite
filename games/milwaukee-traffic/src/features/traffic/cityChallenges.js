import { RIVER } from "./districtLayout.js";
export const BLOCK_SPACING = 11;
// Existing intersections retain their positions. The small two-plot hall ends
// East Market's north arm; a pedestrian plaza ends Lakefront's south arm.
export const JUNCTION_X = [0, BLOCK_SPACING, -15, BLOCK_SPACING, 0, -15, 0, 11];
export const JUNCTION_LEVEL = [1, 2, 5, 8, 8, 8, 11, 11];
export const JUNCTION_Z = [0, 0, 0, -13, -13, -13, -26, -26];
export const JUNCTION_NAMES = [
  "Water Street",
  "Broadway",
  "Plankinton",
  "East Market",
  "Civic Square",
  "Ballpark Way",
  "Market Street",
  "Lakefront",
];
export const JUNCTION_APPROACHES = [
  [0, 1, 2, 3],
  [0, 1, 2, 3],
  [0, 1, 2, 3],
  [1, 2, 3],
  [0, 1, 2, 3],
  [0, 1, 2, 3],
  [0, 1, 2, 3],
  [0, 1, 3],
];
// Short outer arms keep the rear streets inside the nine-unit footprint.
export function roadReach(junction, approach) {
  if (junction >= 6 && approach === 0) return 6.8;
  if (junction === 6 && approach === 3) return 9.75;
  if (junction === 5 && approach === 0) return 6;
  if (junction === 2 && approach === 1) return 8;
  return 10;
}
export const exitAvailable = (junction, lane) =>
  JUNCTION_APPROACHES[junction]?.includes((lane + 2) % 4) ?? false;
export const EMERGENCY_LIMIT = 20;
export const LEVEL_SIZE = 20;
export const RESCUE_DURATION = 7;
export const RESCUE_RELOAD = 20;

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
  tick(dt, cars, events, expanded = false) {
    const minZ = typeof expanded === "number" ? expanded : RIVER.minZ;
    this.nextBoat -= dt;
    if (this.nextBoat <= 0) {
      if (this.boats.length < 4) {
        const direction = this.nextId % 2 ? -1 : 1;
        this.boats.push({
          id: this.nextId++,
          p: expanded
            ? direction === 1
              ? minZ + 0.7
              : -RIVER.maxZ + 0.7
            : -6.2,
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
      if (
        b.p >
        (expanded ? (b.direction === 1 ? RIVER.maxZ - 0.4 : -minZ - 0.4) : 6.9)
      ) {
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
      fuel: Math.floor((1 - this.cooldown / RESCUE_RELOAD) * 100),
      incident: this.active?.id ?? null,
    };
  }
}

// A local recovery truck comes down the north shoulder. Its dedicated service
// path clears the stopped lane, but entering the crossing still requires green.
export class TowRescue {
  constructor() {
    this.active = null;
  }
  dispatch(incident) {
    if (!incident || incident.assigned || this.active) return false;
    incident.assigned = true;
    this.active = {
      id: incident.id,
      junction: incident.junction || 0,
      targetX: incident.x,
      targetZ: incident.z,
      x:
        JUNCTION_X[incident.junction || 0] +
        (JUNCTION_APPROACHES[incident.junction || 0].includes(0)
          ? -1.12
          : 1.12),
      z:
        JUNCTION_Z[incident.junction || 0] +
        (JUNCTION_APPROACHES[incident.junction || 0].includes(0)
          ? -roadReach(incident.junction || 0, 0) + 0.5
          : 9.5),
      yaw: JUNCTION_APPROACHES[incident.junction || 0].includes(0)
        ? 0
        : Math.PI,
      phase: "approach",
      elapsed: 0,
      committed: false,
      loaded: false,
      waiting: false,
    };
    return true;
  }
  tick(dt, cars, incidents, signals) {
    const t = this.active;
    if (!t) return;
    const direction = JUNCTION_APPROACHES[t.junction].includes(0) ? -1 : 1,
      shoulder = JUNCTION_X[t.junction] + direction * 1.12,
      originZ = JUNCTION_Z[t.junction];
    t.waiting = false;
    function drive(x, z) {
      const dx = x - t.x,
        dz = z - t.z;
      const distance = Math.hypot(dx, dz),
        step = Math.min(distance, 2.8 * dt);
      if (distance > 0.001) {
        t.yaw = Math.atan2(dx, dz);
        t.x += (dx / distance) * step;
        t.z += (dz / distance) * step;
      }
      return distance <= step + 0.001;
    }
    if (t.phase === "approach") {
      if (!t.committed) {
        if (drive(shoulder, originZ + direction * 2.65)) {
          if (signals.water.color === "green") t.committed = true;
          else t.waiting = true;
        }
      } else if (drive(shoulder, originZ + direction * 1.55))
        t.phase = "arriving";
    } else if (t.phase === "arriving") {
      // Stop alongside the wreck; the boom draws it onto the recovery bed.
      if (drive(t.targetX - 0.65, t.targetZ)) t.phase = "pickup";
    } else if (t.phase === "pickup") {
      t.elapsed += dt;
      if (t.elapsed >= 2) {
        t.loaded = true;
        for (const c of cars) if (c.incident === t.id) c.remove = true;
        const index = incidents.findIndex((i) => i.id === t.id);
        if (index >= 0) incidents.splice(index, 1);
        t.phase = "leaving";
      }
    } else if (t.phase === "leaving") {
      if (drive(shoulder, originZ + direction * 1.55)) t.phase = "returning";
    } else if (
      drive(
        shoulder,
        originZ +
          direction * (roadReach(t.junction, direction < 0 ? 0 : 2) + 0.4),
      )
    )
      this.active = null;
  }
  snapshot() {
    return {
      busy: !!this.active,
      phase: this.active?.phase ?? "ready",
      waiting: !!this.active?.waiting,
      incident: this.active?.id ?? null,
    };
  }
}
