export const FLIGHT_DURATION = 22.5;
const ease = (t) => {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
};
export function helicopterFlight(time) {
  const t = Math.max(0, Math.min(FLIGHT_DURATION, time ?? 0));
  const pose = {
    x: 3.5,
    y: 3.38,
    z: -3.7,
    yaw: 0,
    pitch: 0,
    bank: 0,
    rotor: 0,
    power: 0,
    phase: "parked",
  };
  if (time === undefined) return pose;
  pose.power = Math.min(ease(t / 1.2), 1 - ease((t - 21) / 1.5));
  pose.rotor =
    48 * (t < 1.2 ? (t * t) / 2.4 : t - 0.6) -
    (t > 21 ? 16 * (t - 21) ** 2 : 0);
  const lift = t < 18.2 ? ease((t - 1.2) / 2.6) : 1 - ease((t - 18.2) / 2.8);
  pose.y += lift * 3.5;
  pose.phase =
    t < 1.2
      ? "spooling"
      : t < 3.8
        ? "takeoff"
        : t < 4.8
          ? "hover"
          : t < 17.2
            ? "cruising"
            : t < 18.2
              ? "hover"
              : t < 21
                ? "landing"
                : "spooling-down";
  if (t < 4.8) pose.yaw = (Math.PI / 2) * ease((t - 3.8) / 1);
  else if (t <= 17.2) {
    const u = (t - 4.8) / 12.4,
      angle = Math.PI * 4 * ease(u),
      moving = Math.sin(Math.PI * u);
    pose.x += Math.sin(angle) * 4.2;
    pose.z += (1 - Math.cos(angle)) * 3.1;
    // Point the nose along the flight tangent, rather than spinning opposite it.
    pose.yaw = Math.atan2(4.2 * Math.cos(angle), 3.1 * Math.sin(angle));
    pose.pitch = 0.085 * moving;
    pose.bank = -0.14 * moving;
    pose.y += Math.sin(angle * 2) * 0.055 * moving;
  } else pose.yaw = (Math.PI / 2) * (1 - ease((t - 17.2) / 1));
  return pose;
}
