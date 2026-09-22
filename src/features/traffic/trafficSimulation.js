import {
  updatePolicePassing,
  sameTrafficTrack,
  policeStep,
} from "./policeDriving.js";
import { HopTraffic } from "./hopTraffic.js";
import { LAKE_ROAD_START, lakeCarPose, lakeRouteLength } from "./lakeRoad.js";
import { BridgeTraffic } from "./cityChallenges.js";
import { roundaboutPose } from "./roundabout.js";
import { Discoveries } from "./littleMilwaukee.js";
import { ServiceTraffic } from "./serviceTraffic.js";
export const BLOCK_SPACING = 14.4;
export const APPROACHES = [
  { id: "north", axis: "water", dx: 0, dz: 1 },
  { id: "east", axis: "wisconsin", dx: -1, dz: 0 },
  { id: "south", axis: "water", dx: 0, dz: -1 },
  { id: "west", axis: "wisconsin", dx: 1, dz: 0 },
];
export const STOP_LINE = -2.16;
export const ENTRY = -9.5;
export const EXIT = 9.75;
export const LANE_OFFSET = 0.57;
export const TURN_START = 1.55;
export const MAX_CARS = 120;

// p measures distance travelled from the approach, including the arc. Each turn
// meets its outgoing lane tangentially, so neither position nor speed jumps.
export function carPose(car) {
  const atCurb = (pose) => ({
    ...pose,
    x:
      pose.x -
      Math.cos(pose.yaw) * ((car.service?.curb || 0) + (car.passing || 0)),
    z:
      pose.z +
      Math.sin(pose.yaw) * ((car.service?.curb || 0) + (car.passing || 0)),
  });
  if (car.lakeFrom !== undefined)
    return atCurb(lakeCarPose(car.p, car.lakeFrom));
  const lane = APPROACHES[car.lane];
  let x = -LANE_OFFSET,
    z = car.p,
    dx = 0,
    dz = 1;
  let exitLane = car.lane,
    out = car.p;
  if (car.turn && car.turn !== "straight" && car.p > -TURN_START) {
    const sign = car.turn === "left" ? 1 : -1;
    const radius = TURN_START + sign * LANE_OFFSET;
    const distance = car.p + TURN_START;
    const arc = (radius * Math.PI) / 2;
    const theta = Math.min(Math.PI / 2, distance / radius);
    x = sign * (TURN_START - radius * Math.cos(theta));
    z = -TURN_START + radius * Math.sin(theta);
    dx = sign * Math.sin(theta);
    dz = Math.cos(theta);
    out = distance - arc + TURN_START;
    exitLane = (car.lane + (sign === 1 ? 3 : 1)) % 4;
    if (distance >= arc) {
      x = sign * out;
      z = sign * LANE_OFFSET;
    } else out = null;
  } else if (car.p < TURN_START) out = null;
  if (car.junction === 1) {
    const ring = roundaboutPose(car.p, car.turn);
    ({ x, z, dx, dz, out } = ring);
    exitLane =
      (car.lane + (car.turn === "left" ? 3 : car.turn === "right" ? 1 : 0)) % 4;
  }
  return atCurb({
    x: lane.dz * x + lane.dx * z + (car.junction || 0) * BLOCK_SPACING,
    z: -lane.dx * x + lane.dz * z,
    yaw: Math.atan2(lane.dz * dx + lane.dx * dz, -lane.dx * dx + lane.dz * dz),
    exitLane,
    out,
  });
}
export function carPosition(car) {
  const { x, z } = carPose(car);
  return { x, z };
}

// Separating-axis test for the actual rotated car footprints (including buses).
function overlaps(a, pa, b, pb) {
  const axes = (p) => [
    { x: Math.sin(p.yaw), z: Math.cos(p.yaw) },
    { x: Math.cos(p.yaw), z: -Math.sin(p.yaw) },
  ];
  const aa = axes(pa),
    bb = axes(pb);
  const dot = (u, v) => u.x * v.x + u.z * v.z;
  const delta = { x: pb.x - pa.x, z: pb.z - pa.z };
  return [...aa, ...bb].every((axis) => {
    const extent = (car, basis) =>
      (Math.abs(dot(axis, basis[0])) * car.length) / 2 +
      Math.abs(dot(axis, basis[1])) * 0.19;
    return Math.abs(dot(delta, axis)) < extent(a, aa) + extent(b, bb);
  });
}

// The homepage is an endless toy. The level-based game lives in games/milwaukee-traffic.
export class TrafficSimulation {
  constructor(random = Math.random) {
    this.random = random;
    this.reset();
  }
  reset() {
    this.started = false;
    this.time = 0;
    this.ambientTime = 0;
    this.passed = 0;
    this.crashes = 0;
    this.overflowed = 0;
    this.honks = 0;
    this.honkCooldown = 0;
    this.cars = [];
    this.events = [];
    this.nextId = 1;
    this.nextArrival = 0;
    this.arrivalIndex = 0;
    this.pendingArrival = null;
    this.signals = {
      water: { color: "green", left: 0 },
      wisconsin: { color: "red", left: 0 },
    };
    this.bridge = new BridgeTraffic(this.random);
    this.discoveries = new Discoveries();
    this.services = new ServiceTraffic(this, carPose);
    this.hop = new HopTraffic(this, carPose);
    this.roundaboutPassed = 0;
  }
  get interval() {
    return 3.5;
  }
  start() {
    this.started = true;
  }
  signalsAt() {
    return this.signals;
  }
  toggle(axis) {
    const signal = this.signals[axis];
    if (!signal) return;
    this.start();
    if (signal.color === "green") {
      signal.color = "amber";
      signal.left = 0.65;
    } else if (signal.color === "red") {
      signal.color = "green";
    }
  }
  toggleBridge() {
    this.start();
    this.bridge.toggle();
    if (this.bridge.requestedOpen)
      for (const car of this.cars) {
        const pose = carPose(car);
        if (
          Math.abs(pose.z) < 1.2 &&
          pose.x + car.length / 2 > -7.05 &&
          pose.x - car.length / 2 < -4.9
        )
          this.drop(car, "bridge");
      }
  }
  drop(car, reason) {
    if (car.remove) return;
    car.remove = true;
    if (reason === "overflow") this.overflowed++;
    this.events.push({
      kind: "overflow",
      reason,
      car: { ...car },
      ...carPose(car),
    });
  }
  spawn(lane, junction = 0, service = null, { hop = false } = {}) {
    if (!APPROACHES[lane] || ![0, 1].includes(junction)) return false;
    const bus =
        hop || (service ? service.kind === "news" : this.random() < 0.09),
      length = hop ? 1.65 : bus || service?.kind === "ambulance" ? 1.08 : 0.72;
    for (const tail of this.cars)
      if (
        tail.lakeFrom === undefined &&
        tail.junction === junction &&
        tail.lane === lane &&
        tail.p < -TURN_START &&
        Math.abs(tail.p - ENTRY) < (tail.length + length) / 2 + 0.2
      ) {
        if (service || tail.service || hop || tail.hop) return false;
        this.drop(tail, "overflow");
      }
    this.cars = this.cars.filter((c) => !c.remove);
    if (this.cars.length >= MAX_CARS) return false;
    const turnRoll = this.random();
    this.cars.push({
      id: this.nextId++,
      lane,
      junction,
      p: ENTRY,
      speed: 2.4,
      stopped: 0,
      length,
      bus,
      hop,
      color: Math.floor(this.random() * 6),
      turn:
        (hop ? "straight" : service?.route[0].turn) ||
        (turnRoll < 0.27 ? "left" : turnRoll > 0.73 ? "right" : "straight"),
      service,
      ambulance: service?.kind === "ambulance",
      police: service?.kind === "police",
      news: service?.kind === "news",
      committed: false,
      nextHonk: 4.5 + this.random() * 2,
    });
    return true;
  }
  tick(dt) {
    this.ambientTime += dt;
    this.discoveries.tick(dt);
    this.services.tick(dt);
    if (!this.started) return;
    this.hop.tick(dt);
    this.time += dt;
    this.honkCooldown -= dt;
    this.bridge.tick(
      dt,
      this.cars.map((c) => ({ ...c, ...carPose(c) })),
      this.events,
    );
    for (const signal of Object.values(this.signals))
      if (signal.color === "amber") {
        signal.left -= dt;
        if (signal.left <= 0) signal.color = "red";
      }
    this.nextArrival -= dt;
    if (this.nextArrival <= 0) {
      const entries = [
        [0, 0],
        [1, 1],
        [1, 0],
        [0, 3],
      ];
      // Random approaches and occasional small bunches create real conflicts
      // when both roads are green. Collisions still depend on physical paths.
      const grouped = this.pendingArrival !== null;
      const index =
        this.arrivalIndex++ === 0
          ? 0
          : Math.min(
              entries.length - 1,
              Math.floor(this.random() * entries.length),
            );
      const [junction, lane] = this.pendingArrival || entries[index];
      this.pendingArrival = null;
      this.spawn(lane, junction);
      if (
        !grouped &&
        this.arrivalIndex > 1 &&
        junction === 0 &&
        this.random() < 0.35
      ) {
        this.pendingArrival = [0, lane === 3 ? 0 : 3];
        this.nextArrival += 0.18 + this.random() * 0.48;
      } else this.nextArrival += 2.5 + this.random() * 3;
    }
    updatePolicePassing(this.cars, dt, carPose, overlaps);
    const poses = new Map(this.cars.map((c) => [c.id, carPose(c)]));
    const ringCars = this.cars.filter(
      (car) => car.junction === 1 && car.lakeFrom === undefined && !car.remove,
    );
    const ringBusy = ringCars.some(
      (car) =>
        car.committed &&
        (poses.get(car.id).out === null || poses.get(car.id).out < 2.7),
    );
    const nextRingCar = ringBusy
      ? null
      : ringCars
          .filter(
            (car) =>
              !car.committed &&
              !ringCars.some(
                (front) =>
                  !front.committed &&
                  front.lane === car.lane &&
                  front.p > car.p,
              ),
          )
          .sort((a, b) => b.stopped - a.stopped || b.p - a.p || a.id - b.id)[0];
    for (const car of this.cars) {
      if (car.remove) continue;
      if (["parking", "parked", "merging"].includes(car.service?.phase)) {
        car.speed = car.stopped = 0;
        continue;
      }
      const pose = poses.get(car.id),
        green =
          car.lakeFrom !== undefined ||
          car.junction === 1 ||
          this.signals[APPROACHES[car.lane].axis].color === "green";
      let gap =
        car.lakeFrom === undefined &&
        car.junction === 1 &&
        !car.committed &&
        car !== nextRingCar
          ? -2.65 - (car.length - 0.72) / 2 - car.p
          : Infinity;
      if (this.bridge.gated && Math.abs(pose.z) < 1) {
        if (pose.x + car.length / 2 < -7.05 && Math.sin(pose.yaw) > 0.99)
          gap = Math.min(gap, -7.15 - car.length / 2 - pose.x);
        if (pose.x - car.length / 2 > -4.9 && Math.sin(pose.yaw) < -0.99)
          gap = Math.min(gap, pose.x - (-4.8 + car.length / 2));
      }
      for (const other of this.cars) {
        if (other === car || other.remove || other.service?.phase === "parked")
          continue;
        const op = poses.get(other.id),
          clearance = (other.length + car.length) / 2 + 0.2;
        // Cars share distance along the lake bends; look across both handoffs
        // so queues can back up around the shore without overlapping.
        if (car.lakeFrom !== undefined) {
          if (other.lakeFrom === car.lakeFrom && other.p > car.p)
            gap = Math.min(gap, other.p - car.p - clearance);
          if (
            other.lakeFrom === undefined &&
            other.junction === 1 - car.lakeFrom &&
            other.lane === 2 &&
            other.p < -TURN_START
          )
            gap = Math.min(
              gap,
              lakeRouteLength(car.lakeFrom) -
                car.p +
                other.p +
                LAKE_ROAD_START -
                clearance,
            );
        } else if (
          pose.out !== null &&
          pose.exitLane === 0 &&
          other.lakeFrom === car.junction
        ) {
          gap = Math.min(gap, LAKE_ROAD_START - pose.out + other.p - clearance);
        }
        const shared =
          car.lakeFrom === undefined &&
          other.lakeFrom === undefined &&
          car.junction === other.junction &&
          car.lane === other.lane &&
          (car.turn === other.turn || other.p < -TURN_START + other.length / 2);
        if (shared && sameTrafficTrack(car, other) && other.p > car.p)
          gap = Math.min(gap, other.p - car.p - clearance);
        if (
          car.junction === other.junction &&
          pose.out !== null &&
          op.out !== null &&
          pose.exitLane === op.exitLane &&
          sameTrafficTrack(car, other) &&
          op.out > pose.out
        )
          gap = Math.min(gap, op.out - pose.out - clearance);
        if (Math.cos(pose.yaw - op.yaw) > 0.999) {
          const dx = op.x - pose.x,
            dz = op.z - pose.z;
          const lateral = dx * Math.cos(pose.yaw) - dz * Math.sin(pose.yaw);
          const ahead = dx * Math.sin(pose.yaw) + dz * Math.cos(pose.yaw);
          if (Math.abs(lateral) < 0.15 && ahead > 0)
            gap = Math.min(gap, ahead - clearance);
        }
        if (
          car.lakeFrom === undefined &&
          other.lakeFrom === undefined &&
          car.junction === 0 &&
          other.junction === 0 &&
          car.p <= -TURN_START &&
          other.turn === "left" &&
          other.lane === (car.lane + 2) % 4 &&
          other.p > -TURN_START &&
          (op.out === null || op.out < 2.4)
        )
          gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
        if (
          car.lakeFrom === undefined &&
          other.lakeFrom === undefined &&
          car.junction === 0 &&
          other.junction === 0 &&
          car.turn === "left" &&
          car.p <= -TURN_START &&
          other.lane === (car.lane + 2) % 4 &&
          other.p > -3.8 &&
          (op.out === null || op.out < 2.4) &&
          (other.committed ||
            this.signals[APPROACHES[other.lane].axis].color === "green") &&
          (other.turn !== "left" ||
            other.p > -TURN_START ||
            other.id < car.id) &&
          !this.cars.some(
            (front) =>
              front.lakeFrom === undefined &&
              front.junction === other.junction &&
              front.lane === other.lane &&
              front.p > other.p &&
              front.p <= -TURN_START,
          )
        )
          gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
      }
      if (!car.committed && !green)
        gap = Math.min(gap, STOP_LINE - (car.length - 0.72) / 2 - car.p);
      let parkingDistance = Infinity;
      if (
        car.service?.phase === "driving" &&
        car.lakeFrom === undefined &&
        car.service.index === car.service.route.length - 1
      ) {
        const stop = car.service.stop;
        const end = stop.p ?? stop.out + 100 - carPose({ ...car, p: 100 }).out;
        parkingDistance = end - car.p;
        gap = Math.min(gap, parkingDistance);
      }
      gap = Math.max(
        0,
        Math.min(gap, this.hop.limit(car), car.mergeBlocked ? 0 : Infinity),
      );
      const target = Math.min(
          car.police ? 4.5 : 2.4,
          Math.sqrt(2 * (car.police ? 8 : 5.5) * gap),
        ),
        change =
          (target > car.speed ? (car.police ? 5 : 3.1) : car.police ? 10 : 7) *
          dt;
      car.speed +=
        Math.sign(target - car.speed) *
        Math.min(change, Math.abs(target - car.speed));
      const step = policeStep(
        car,
        Math.min(car.speed * dt, gap),
        this.cars,
        carPose,
        overlaps,
        dt,
      );
      car.p += step;
      if (car.police && step < car.speed * dt * 0.9) car.speed = step / dt;
      if (parkingDistance - step <= 0.001 && this.canPark(car)) {
        car.service.phase = "parking";
        car.service.time = 0;
        car.speed = 0;
      }
      if (green && car.p > (car.junction === 1 ? -2.65 : STOP_LINE) + 0.02)
        car.committed = true;
      car.stopped = car.speed < 0.1 ? car.stopped + dt : 0;
      if (!car.stopped) car.nextHonk = 4.5 + (car.id % 6) * 0.43;
      if (car.stopped > car.nextHonk && this.honkCooldown <= 0) {
        this.events.push({ kind: "honk", ...carPosition(car) });
        this.honks++;
        this.honkCooldown = 0.65;
        car.nextHonk = car.stopped + 4 + this.random() * 4;
      }
    }
    for (let i = 0; i < this.cars.length; i++) {
      const a = this.cars[i],
        pa = carPose(a);
      if (
        a.junction === 1 ||
        a.remove ||
        Math.max(Math.abs(pa.x), Math.abs(pa.z)) > 2.4
      )
        continue;
      for (let j = i + 1; j < this.cars.length; j++) {
        const b = this.cars[j],
          pb = carPose(b);
        if (
          b.junction === 1 ||
          b.remove ||
          Math.max(Math.abs(pb.x), Math.abs(pb.z)) > 2.4
        )
          continue;
        if (overlaps(a, pa, b, pb)) {
          this.crashes++;
          this.events.push({
            kind: "crash",
            x: (pa.x + pb.x) / 2,
            z: (pa.z + pb.z) / 2,
          });
          this.drop(a, "crash");
          this.drop(b, "crash");
          break;
        }
      }
    }
    this.cars = this.cars.filter((c) => {
      if (c.remove) return false;
      if (c.lakeFrom !== undefined) {
        const length = lakeRouteLength(c.lakeFrom);
        if (c.p >= length) {
          Object.assign(c, {
            junction: 1 - c.lakeFrom,
            lane: 2,
            p: c.p - length - LAKE_ROAD_START,
            turn: this.nextTurn(c),
            committed: false,
          });
          delete c.lakeFrom;
        }
        return true;
      }
      const pose = carPose(c);
      if (pose.exitLane === 0 && pose.out >= LAKE_ROAD_START) {
        if (c.junction === 1) this.roundaboutPassed++;
        Object.assign(c, {
          lakeFrom: c.junction,
          p: pose.out - LAKE_ROAD_START,
          committed: true,
        });
        return true;
      }
      const connected =
        c.junction === 0 && pose.exitLane === 3
          ? 1
          : c.junction === 1 && pose.exitLane === 1
            ? 0
            : null;
      if (
        pose.out !== null &&
        connected !== null &&
        pose.out >= BLOCK_SPACING / 2
      ) {
        if (c.junction === 1) this.roundaboutPassed++;
        Object.assign(c, {
          junction: connected,
          lane: pose.exitLane,
          p: pose.out - BLOCK_SPACING,
          turn: this.nextTurn(c),
          committed: false,
        });
      } else if (pose.out > EXIT) {
        if (c.junction === 1) this.roundaboutPassed++;
        this.passed++;
        return false;
      }
      return true;
    });
  }
  canPark(car) {
    const parked = (c) =>
      carPose({ ...c, service: { ...c.service, curb: 0.58 } });
    const destination = parked(car);
    return !this.cars.some(
      (other) =>
        other !== car &&
        !other.remove &&
        ["parking", "parked", "merging"].includes(other.service?.phase) &&
        overlaps(car, destination, other, parked(other)),
    );
  }
  nextTurn(car) {
    if (car.hop) return "left";
    if (car.service) {
      car.service.index++;
      return car.service.route[car.service.index]?.turn || "straight";
    }
    return ["left", "straight", "right"][Math.floor(this.random() * 3) % 3];
  }
  snapshot() {
    return {
      started: this.started,
      roundaboutPassed: this.roundaboutPassed,
      hop: this.hop.snapshot(),
      discoveries: this.discoveries.snapshot(),
      time: this.time,
      cars: this.cars.length,
      passed: this.passed,
      crashes: this.crashes,
      overflowed: this.overflowed,
      honks: this.honks,
      interval: this.interval,
      signals: Object.fromEntries(
        Object.entries(this.signals).map(([k, v]) => [k, v.color]),
      ),
      bridge: this.bridge.snapshot(),
      services: this.services.snapshot(),
    };
  }
}
