import { walkRoute } from "./pedestrianNavigation.js";
import { pathLength } from "./pedestrianReactions.js";
import { HEIST_TIMING } from "./secretHeist.js";

const step = (junction, lane, turn = "straight") => ({ junction, lane, turn });
const ease = (t) => {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
};

// A destination is on a real lane, with a curb beside it. Response vehicles
// use the same approach/turn/lake-road handoffs as every other vehicle.
function ambulancePlan(patient) {
  const junction = patient.x > 7 ? 1 : 0;
  const cx = junction * 14.4;
  if (patient.z > 6.5)
    return { route: [step(junction, 0)], stop: { out: 5.25 } };
  if (patient.z < -2.7)
    return {
      route: [step(junction, 0)],
      stop: { p: Math.max(-8.2, Math.min(-3.2, patient.z)) },
    };
  if (Math.abs(patient.x - cx) > 2.7) {
    const west = patient.x < cx;
    return {
      route: [step(junction, 0, west ? "right" : "left")],
      stop: {
        out: Math.max(
          3.2,
          Math.min(west && !junction ? 4.25 : 5.5, Math.abs(patient.x - cx)),
        ),
      },
    };
  }
  return { route: [step(junction, 0)], stop: { out: 4.6 } };
}
const responsePlans = [
  {
    kind: "police",
    approach: "north",
    route: [step(0, 0, "right")],
    stop: { out: 4.45 },
  },
  {
    kind: "police",
    approach: "east",
    route: [step(1, 1), step(0, 1)],
    stop: { out: 3.15 },
  },
  {
    kind: "police",
    approach: "lakefront",
    route: [step(1, 0), step(0, 2)],
    stop: { out: 3.9 },
  },
  { kind: "news", approach: "north", route: [step(0, 0)], stop: { p: -5.5 } },
];

export class ServiceTraffic {
  constructor(sim, pose) {
    this.sim = sim;
    this.pose = pose;
    this.rescue = null;
    this.response = [];
    this.heistPlay = 0;
  }
  unit(kind, plan) {
    return {
      kind,
      ...plan,
      carId: null,
      arrived: false,
      release: false,
      done: false,
    };
  }
  vehicle(unit) {
    return this.sim.cars.find((c) => c.id === unit?.carId && !c.remove);
  }
  tickUnit(unit, dt) {
    if (unit.done) return;
    let car = this.vehicle(unit);
    if (!car && unit.carId !== null) {
      if (unit.release) {
        unit.done = true;
        return;
      }
      unit.carId = null;
      unit.arrived = false;
    }
    if (!car) {
      const first = unit.route[0];
      if (
        !this.sim.spawn(first.lane, first.junction, {
          kind: unit.kind,
          route: unit.route,
          index: 0,
          stop: unit.stop,
          phase: "driving",
          curb: 0,
          time: 0,
        })
      )
        return;
      car = this.sim.cars.at(-1);
      unit.carId = car.id;
    }
    const service = car.service;
    if (service.phase === "parking") {
      service.time += dt;
      service.curb = 0.58 * ease(service.time / 1.1);
      if (service.time >= 1.1) service.phase = "parked";
    }
    if (service.phase === "parked") {
      unit.arrived = true;
      if (unit.release && this.canMerge(car)) {
        service.phase = "merging";
        service.time = 0;
      }
    }
    if (service.phase === "merging") {
      service.time += dt;
      service.curb = 0.58 * (1 - ease(service.time / 1.1));
      if (service.time >= 1.1) {
        service.phase = "leaving";
        service.curb = 0;
      }
    }
  }
  canMerge(car) {
    const p = this.pose({ ...car, service: { ...car.service, curb: 0 } });
    return !this.sim.cars.some((other) => {
      if (other === car || other.remove || other.service?.phase === "parked")
        return false;
      const q = this.pose(other),
        dx = q.x - p.x,
        dz = q.z - p.z;
      const ahead = dx * Math.sin(p.yaw) + dz * Math.cos(p.yaw);
      const lateral = dx * Math.cos(p.yaw) - dz * Math.sin(p.yaw);
      return (
        Math.abs(lateral) < 0.4 &&
        Math.abs(ahead) < (car.length + other.length) / 2 + 0.2
      );
    });
  }
  tick(dt) {
    const pedestrians = this.sim.discoveries.pedestrians;
    const job = pedestrians.rescue;
    if (job && this.rescue?.job !== job)
      this.rescue = {
        job,
        unit: this.unit("ambulance", ambulancePlan(pedestrians.states[job.id])),
      };
    if (job) {
      this.sim.start();
      const unit = this.rescue.unit;
      unit.release = job.readyToLeave;
      this.tickUnit(unit, dt);
      if (unit.arrived && !job.arrived) {
        const p = this.pose(this.vehicle(unit));
        job.stop = [p.x, p.z];
        job.medicPath = walkRoute(job.stop, job.patient, pedestrians.obstacles);
        job.walk = Math.max(1.2, pathLength(job.medicPath) / 2.2);
        job.pickup = 4.5 + job.walk + 0.8;
        job.depart = 4.5 + job.walk * 2 + 1.6;
        job.time = 4.5;
        job.arrived = true;
      }
      job.departed = unit.done;
    }
    const heist = this.sim.discoveries.heist;
    if (heist.time !== null && heist.plays !== this.heistPlay) {
      this.heistPlay = heist.plays;
      this.response = responsePlans.map((plan) => this.unit(plan.kind, plan));
    }
    if (heist.time !== null && heist.time >= HEIST_TIMING.police) {
      this.sim.start();
      for (const unit of this.response) {
        if (unit.kind === "news" && heist.time < 15.5) continue;
        unit.release = heist.time >= HEIST_TIMING.departure;
        this.tickUnit(unit, dt);
      }
      if (this.response.every((unit) => unit.arrived))
        heist.responseReady = true;
      heist.responseComplete = this.response.every((unit) => unit.done);
    }
  }
  snapshot() {
    const snapshot = (unit) => {
      const car = this.vehicle(unit);
      return {
        kind: unit.kind,
        approach: unit.approach,
        carId: unit.carId,
        phase: unit.done ? "done" : car?.service.phase || "dispatching",
        position: car ? this.pose(car) : null,
      };
    };
    return {
      ambulance:
        this.sim.discoveries.pedestrians.rescue && this.rescue
          ? snapshot(this.rescue.unit)
          : null,
      response: this.response.map(snapshot),
    };
  }
}
