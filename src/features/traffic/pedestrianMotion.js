export const STUMBLE_DURATION = 3.2;
const ease = (v) => {
  const t = Math.max(0, Math.min(1, v));
  return t * t * (3 - 2 * t);
};
export function pathPose(path, progress) {
  const lengths = path
    .slice(1)
    .map((b, i) => Math.hypot(b[0] - path[i][0], b[1] - path[i][1]));
  let d =
      Math.max(0, Math.min(1, progress)) * lengths.reduce((a, b) => a + b, 0),
    i = 0;
  while (i < lengths.length - 1 && d > lengths[i]) d -= lengths[i++];
  const a = path[i],
    b = path[i + 1],
    f = d / lengths[i];
  return {
    x: a[0] + (b[0] - a[0]) * f,
    z: a[1] + (b[1] - a[1]) * f,
    yaw: Math.atan2(b[0] - a[0], b[1] - a[1]),
  };
}
export function pedestrianPose(definition, clock = 0, reaction) {
  if (definition.seated) {
    const t = reaction;
    const walking = t !== undefined && t > 0.7 && t < definition.duration - 0.7;
    const progress =
      t === undefined
        ? 0
        : Math.max(0, Math.min(1, (t - 0.7) / (definition.duration - 1.4)));
    return {
      ...pathPose(definition.path, progress),
      moving: walking,
      seated: t === undefined,
      sit:
        t === undefined
          ? 1
          : t < 0.7
            ? 1 - ease(t / 0.7)
            : ease((t - (definition.duration - 0.7)) / 0.7),
      fall: 0,
      phase: t === undefined ? "seated" : walking ? "walking" : "standing",
    };
  }
  const fall =
    reaction === undefined
      ? 0
      : 1.48 * ease(reaction / 0.45) * (1 - ease((reaction - 1.7) / 1.3));
  return {
    ...pathPose(
      definition.path,
      (clock % definition.loopDuration) / definition.loopDuration,
    ),
    moving: reaction === undefined,
    seated: false,
    fall,
    phase:
      reaction === undefined
        ? "walking"
        : reaction < 1.7
          ? "stumbled"
          : "recovering",
  };
}
export function movePedestrian(actor, definition, clock, reaction) {
  const p = pedestrianPose(definition, clock, reaction);
  actor.g.position.set(p.x, 0.42, p.z);
  actor.g.rotation.set(p.fall, p.yaw, 0, "YXZ");
  actor.animate(clock, p.moving);
  if (p.sit > 0) {
    actor.g.rotation.y = 0;
    actor.legs.forEach((leg) => (leg.rotation.x = -1.35 * p.sit));
  }
  if (p.fall) {
    actor.arms.forEach((arm) => (arm.rotation.x = -0.9));
  }
  return p;
}
export const CITY_WALKERS = [
  {
    id: "pedestrians",
    label: "Surprise the riverwalk pedestrian",
    point: [-1.95, 1, 3.05],
    duration: STUMBLE_DURATION,
    loopDuration: 27,
    path: [
      [-1.95, 3.05],
      [-1.95, 5.3],
      [-4.7, 5.3],
      [-4.7, 1.95],
      [-1.95, 1.95],
      [-1.95, 3.05],
    ],
  },
  {
    id: "pedestrianFriend",
    label: "Surprise the second riverwalk pedestrian",
    point: [-1.97, 1, 3.48],
    duration: STUMBLE_DURATION,
    loopDuration: 31,
    path: [
      [-1.97, 3.48],
      [-1.97, 1.95],
      [-4.7, 1.95],
      [-4.7, 5.3],
      [-1.97, 5.3],
      [-1.97, 3.48],
    ],
  },
];
