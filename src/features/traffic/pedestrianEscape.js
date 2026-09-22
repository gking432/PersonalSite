import { walkRoute } from "./pedestrianNavigation.js";
import { pathPose } from "./pedestrianMotion.js";

export const WINDOW_NPC = "cityWalk";
export const REFUGE_DOOR = [5.08, 3.58];
export const REFUGE_WINDOWS = [3.055, 3.58, 4.105];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const length = (path) =>
  path.slice(1).reduce((n, b, i) => n + distance(path[i], b), 0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Camera-to-person sightlines include building height, not just map distance.
export function hiddenFromCamera(point, camera, buildings) {
  return buildings.some((box) => {
    let lo = 0,
      hi = 0.995;
    for (let i = 0; i < 3; i++) {
      const delta = point[i] - camera[i];
      if (Math.abs(delta) < 1e-8) {
        if (camera[i] < box[i] || camera[i] > box[i + 3]) return false;
      } else {
        const a = (box[i] - camera[i]) / delta,
          b = (box[i + 3] - camera[i]) / delta;
        lo = Math.max(lo, Math.min(a, b));
        hi = Math.min(hi, Math.max(a, b));
        if (lo > hi) return false;
      }
    }
    return lo <= hi && hi > 0;
  });
}

// Water is not a walking shortcut. Leave gaps at the real street bridges.
export const WATER_BARRIERS = [
  [-6.94, 1.42, -4.94, 10.9],
  [-6.94, -5.4, -4.94, -1.42],
  [-3.14, -9.2, -1.55, -7.2],
  [1.55, -9.2, 12.85, -7.2],
  [15.95, -9.2, 25.7, -7.2],
  [-6.85, -6.3, -4.75, -5.4],
  [-6.35, -7.2, -4.25, -6.3],
  [-5.4, -8.25, -3.14, -7.2],
];
function routeTo(s, goal, world) {
  return walkRoute(
    [s.x, s.z],
    goal,
    [...world.obstacles, ...(world.water || [])],
    { strict: true },
  );
}
function takeRoute(s, path, destination) {
  if (path.length < 2) return false;
  s.path = path;
  s.length = Math.max(0.00001, length(path));
  s.distance = 0;
  s.destination = destination;
  s.needsPlan = false;
  s.phase = "running";
  s.time = 0;
  s.replans = (s.replans || 0) + 1;
  return true;
}
export function findCover(s, world, allowExposed = false) {
  const candidates = [];
  for (const [x1, , z1, x2, , z2] of world.buildings) {
    const mx = (x1 + x2) / 2,
      mz = (z1 + z2) / 2,
      p = 0.3;
    for (const point of [
      [x1 - p, z1 - p],
      [mx, z1 - p],
      [x2 + p, z1 - p],
      [x2 + p, mz],
      [x2 + p, z2 + p],
      [mx, z2 + p],
      [x1 - p, z2 + p],
      [x1 - p, mz],
    ]) {
      const d = distance([s.x, s.z], point);
      if (
        d > (allowExposed ? 1.5 : 0.25) &&
        d < 15 &&
        (allowExposed ||
          hiddenFromCamera(
            [point[0], 0.92, point[1]],
            world.camera,
            world.buildings,
          ))
      )
        candidates.push({ point, d });
    }
  }
  candidates.sort((a, b) => a.d - b.d);
  for (const candidate of candidates.slice(0, 8)) {
    const path = routeTo(s, candidate.point, world);
    if (path.length > 1) return path;
  }
  return null;
}
function plan(s, id, world) {
  if (id === WINDOW_NPC && world.lightsOn && !s.windowBroken) {
    const path = routeTo(s, REFUGE_DOOR, world);
    if (takeRoute(s, path, { kind: "interior" })) return;
  }
  if ((s.replans || 0) >= 2) {
    const cars = world.cars.filter(
      (c) =>
        c.speed < 0.12 && !c.service && distance([s.x, s.z], [c.x, c.z]) < 4,
    );
    for (const car of cars) {
      const door = [
        car.x - Math.cos(car.yaw) * 0.48,
        car.z + Math.sin(car.yaw) * 0.48,
      ];
      if (takeRoute(s, routeTo(s, door, world), { kind: "car", id: car.id }))
        return;
    }
    for (const boat of world.boats) {
      if (distance([s.x, s.z], [boat.x, boat.z]) > 5) continue;
      const shore =
        boat.z < -6.7
          ? [boat.x, s.z < boat.z ? -9.48 : -6.93]
          : [s.x < boat.x ? -7.25 : -4.62, boat.z];
      if (takeRoute(s, routeTo(s, shore, world), { kind: "boat", id: boat.id }))
        return;
    }
    if (id === "pedestrians" && !world.bridgeOpen) {
      if (takeRoute(s, routeTo(s, [-4.42, 1.14], world), { kind: "bridge" }))
        return;
    }
    if (["lakeWalk", "museumWalk"].includes(id)) {
      if (
        takeRoute(s, routeTo(s, [clamp(s.x, 1.8, 20.8), 10.5], world), {
          kind: "water",
        })
      )
        return;
    }
  }
  const cover = findCover(s, world);
  if (cover && takeRoute(s, cover, { kind: "cover" })) return;
  const fallback = findCover(s, world, true);
  if (fallback && takeRoute(s, fallback, { kind: "cover" })) return;
  // Never teleport onto an old route or walk through a wall when enclosed.
  s.phase = "hiding";
  s.exposure = -0.8;
  s.needsPlan = false;
}
function beginJump(s, kind, target) {
  s.phase = "boarding";
  s.time = 0;
  s.jumpFrom = [s.x, s.z];
  s.jumpTarget = target;
  s.jumpKind = kind;
}
function arrival(s, world) {
  const goal = s.destination;
  if (!goal || goal.kind === "cover") {
    s.phase = "hiding";
    s.time = s.exposure = 0;
    return;
  }
  if (goal.kind === "interior") {
    s.phase = "entering";
    s.time = 0;
    return;
  }
  if (goal.kind === "water") {
    beginJump(s, "water", [s.x, 11.35]);
    return;
  }
  if (goal.kind === "bridge") {
    beginJump(s, "bridge", [-5.15, 0.75]);
    return;
  }
  const carrier = (goal.kind === "car" ? world.cars : world.boats).find(
    (c) => c.id === goal.id,
  );
  if (
    carrier &&
    distance([s.x, s.z], [carrier.x, carrier.z]) <
      (goal.kind === "car" ? 0.9 : 2)
  ) {
    s.carrier = { kind: goal.kind, id: goal.id };
    beginJump(s, goal.kind, [carrier.x, carrier.z]);
  } else {
    s.needsPlan = true;
    s.destination = null;
  }
}
export function updateEscape(s, id, dt, world) {
  if (s.phase === "retired") return;
  if (s.phase === "window-hit") {
    if (s.time > 2) s.phase = "retired";
    return;
  }
  if (s.phase === "entering") {
    s.x = REFUGE_DOOR[0] - Math.min(1, s.time) * 0.4;
    s.z = REFUGE_DOOR[1];
    s.yaw = -Math.PI / 2;
    if (!world.lightsOn && s.time < 0.3) {
      s.phase = "running";
      s.needsPlan = true;
    } else if (s.time >= 1) {
      s.phase = "inside";
      s.time = 0;
      s.windowZ = 3.58;
      s.windowPane = 1;
    }
    return;
  }
  if (s.phase === "inside") {
    s.windowZ = 3.58 + Math.sin(s.time * 0.65) * 0.7;
    s.windowPane = REFUGE_WINDOWS.reduce(
      (best, z, i) =>
        Math.abs(z - s.windowZ) < Math.abs(REFUGE_WINDOWS[best] - s.windowZ)
          ? i
          : best,
      0,
    );
    return;
  }
  if (s.phase === "boarding") {
    const carrier =
      s.carrier &&
      (s.carrier.kind === "car" ? world.cars : world.boats).find(
        (c) => c.id === s.carrier.id,
      );
    const target = carrier ? [carrier.x, carrier.z] : s.jumpTarget,
      f = clamp(s.time / 0.65, 0, 1);
    s.x = s.jumpFrom[0] + (target[0] - s.jumpFrom[0]) * f;
    s.z = s.jumpFrom[1] + (target[1] - s.jumpFrom[1]) * f;
    s.y = 0.42 + Math.sin(f * Math.PI) * 0.5;
    s.yaw = Math.atan2(target[0] - s.jumpFrom[0], target[1] - s.jumpFrom[1]);
    if (f === 1) {
      s.time = 0;
      s.phase =
        s.jumpKind === "bridge"
          ? "underbridge"
          : s.jumpKind === "water"
            ? "swimming"
            : "riding";
      s.waterKind = s.jumpKind === "bridge" ? "river" : "lake";
    }
    return;
  }
  if (s.phase === "riding") {
    const carrier = (s.carrier.kind === "car" ? world.cars : world.boats).find(
      (c) => c.id === s.carrier.id,
    );
    if (!carrier) {
      s.phase = "away";
      s.time = 0;
    } else {
      s.x = carrier.x;
      s.z = carrier.z;
      s.yaw = carrier.yaw;
      s.y = s.carrier.kind === "boat" ? 0.55 : 0.42;
    }
    return;
  }
  if (s.phase === "underbridge") {
    s.y = -0.32;
    if (world.bridgeOpen) {
      s.phase = "swimming";
      s.time = 0;
      s.waterKind = "river";
    }
    return;
  }
  if (s.phase === "swimming") {
    s.y = -0.25 + Math.sin(s.time * 5) * 0.025;
    s.z += dt * 0.8;
    if (s.waterKind === "river") s.x += (-5.7 - s.x) * Math.min(1, dt * 2);
    s.yaw = 0;
    if (s.time > 12) {
      s.phase = "away";
      s.time = 0;
    }
    return;
  }
  if (s.phase === "hiding") {
    const hidden = hiddenFromCamera(
      [s.x, 0.82, s.z],
      world.camera,
      world.buildings,
    );
    s.exposure = hidden ? 0 : (s.exposure || 0) + dt;
    if (s.exposure > 0.28) {
      s.phase = "running";
      s.needsPlan = true;
      s.exposure = 0;
    }
    return;
  }
  if (s.phase !== "running") return;
  s.y = 0.42;
  s.lookTime = (s.lookTime || 0) + dt;
  if (s.destination?.kind === "cover" && s.lookTime > 0.7) {
    s.lookTime = 0;
    const goal = s.path.at(-1);
    if (
      !hiddenFromCamera([goal[0], 0.92, goal[1]], world.camera, world.buildings)
    )
      s.needsPlan = true;
  }
  if (s.needsPlan || !s.destination) plan(s, id, world);
  if (s.phase !== "running") return;
  s.distance = Math.min(
    s.length,
    s.distance + dt * (3.05 + Math.min(s.replans || 0, 4) * 0.12),
  );
  Object.assign(s, pathPose(s.path, s.length ? s.distance / s.length : 1));
  if (s.distance >= s.length) arrival(s, world);
}
