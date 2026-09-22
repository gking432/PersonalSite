import { pathPose } from "./pedestrianMotion.js";

const distance = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
export const pathLength = (path) =>
  path.slice(1).reduce((sum, b, i) => sum + distance(path[i], b), 0);
export const RUN_SPEED = 2.25;
export const SHRUG_DURATION = 2.6;

// Join the existing sidewalk loop before ducking behind the buildings and
// leaving by a real street/walk. Nobody takes a shortcut through a building.
const exits = {
  pedestrians: {
    join: [-4.7, 1.95],
    tail: [
      [-4.7, 1.25],
      [-7.5, 1.25],
      [-12, 1.25],
    ],
  },
  pedestrianFriend: {
    join: [-4.7, 1.95],
    tail: [
      [-4.7, 1.25],
      [-7.5, 1.25],
      [-12, 1.25],
    ],
  },
  cityWalk: {
    join: [5.1, 1.95],
    tail: [
      [5.1, -1.95],
      [5.1, -5.4],
      [1.92, -5.4],
      [1.92, -12.8],
    ],
  },
  lakeWalk: {
    join: [11.6, 10.35],
    tail: [
      [16.3, 10.35],
      [20.8, 10.35],
      [23.4, 10.35],
    ],
  },
  museumWalk: {
    join: [20.8, 7.1],
    tail: [
      [20.8, 5.5],
      [20.8, 1.8],
      [25.8, 1.8],
    ],
  },
  apartmentWalk: {
    join: [12.45, -9.5],
    tail: [
      [12.45, -13.05],
      [8.3, -13.05],
      [4.6, -13.05],
      [1.9, -13.05],
      [-1.8, -13.05],
    ],
  },
};
export function escapePath(definition, clock) {
  const progress = (clock % definition.loopDuration) / definition.loopDuration;
  const pose = pathPose(definition.path, progress);
  let remaining = progress * pathLength(definition.path),
    segment = 0;
  while (
    segment < definition.path.length - 2 &&
    remaining > distance(definition.path[segment], definition.path[segment + 1])
  ) {
    remaining -= distance(
      definition.path[segment],
      definition.path[segment + 1],
    );
    segment++;
  }
  const exit = exits[definition.id];
  const path = [[pose.x, pose.z]];
  const loop = definition.path.slice(0, -1);
  for (let i = 1; i <= loop.length; i++) {
    const point = loop[(segment + i) % loop.length];
    path.push(point);
    if (distance(point, exit.join) < 0.01) break;
  }
  path.push(...exit.tail);
  return path.filter((point, i) => !i || distance(point, path[i - 1]) > 0.001);
}
export class PedestrianReactions {
  constructor() {
    this.states = {};
    this.rescue = null;
    this.pickups = 0;
    this.obstacles = [];
  }
  click(definition, clock) {
    const s = (this.states[definition.id] ||= {
      level: 0,
      phase: "walking",
      time: 0,
      hits: 0,
      clock,
    });
    if (["down", "carried", "away"].includes(s.phase)) return false;
    if (s.phase === "running" || s.phase === "stumbled") {
      s.hits++;
      s.time = 0;
      s.phase = s.hits >= 4 ? "down" : "stumbled";
    } else if (s.level < 4) {
      s.level++;
      s.phase = "reacting";
      s.time = 0;
      s.clock = clock;
      const pose = pathPose(
        definition.path,
        (clock % definition.loopDuration) / definition.loopDuration,
      );
      Object.assign(s, pose);
      if (s.level === 4) {
        s.path = escapePath(definition, clock);
        s.length = pathLength(s.path);
        s.distance = 0;
      }
    } else return false;
    return true;
  }
  tick(dt) {
    for (const s of Object.values(this.states)) {
      s.time += dt;
      if (
        s.phase === "reacting" &&
        s.time >= (s.level === 4 ? 1.6 : SHRUG_DURATION)
      ) {
        s.phase = s.level === 4 ? "running" : "walking";
        s.time = 0;
      }
      if (s.phase === "stumbled" && s.time >= 1.15) {
        s.phase = "running";
        s.time = 0;
      }
      if (s.phase === "running") {
        s.distance = Math.min(s.length, s.distance + RUN_SPEED * dt);
        Object.assign(s, pathPose(s.path, s.distance / s.length));
        if (s.distance >= s.length) {
          s.phase = "away";
          s.time = 0;
        }
      }
    }
    if (!this.rescue) {
      const patient = Object.entries(this.states).find(
        ([, s]) => s.phase === "down",
      );
      if (patient) {
        const [id, s] = patient;
        this.rescue = {
          id,
          time: 0,
          patient: [s.x, s.z],
          arrived: false,
          readyToLeave: false,
          departed: false,
          pickup: Infinity,
          depart: Infinity,
        };
      }
    }
    if (this.rescue) {
      const job = this.rescue,
        s = this.states[job.id];
      if (job.arrived) job.time += dt;
      if (job.time >= job.pickup) s.phase = "carried";
      if (job.time >= job.depart) job.readyToLeave = true;
      if (job.departed) {
        s.phase = "away";
        s.time = 0;
        this.pickups++;
        this.rescue = null;
      }
    }
    for (const [id, s] of Object.entries(this.states))
      if (s.phase === "away" && s.time > 12) delete this.states[id];
  }
}
