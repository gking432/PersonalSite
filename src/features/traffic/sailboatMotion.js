// A click produces a short, heeling tack and returns to the ambient sailing loop.
export function sailboatPose(index, clock, time) {
  const t = clock * 0.055 + index * 2;
  const base = {
    x: -2 + index * 8.5 + Math.sin(t) * 0.85,
    z: 13 + (index % 2) * 2.7 + Math.cos(t) * 0.65,
    yaw: Math.atan2(0.85 * Math.cos(t), -0.65 * Math.sin(t)),
    heel: Math.sin(clock + index) * 0.045,
    sail: 0,
    wake: 0,
  };
  if (time === undefined) return base;
  const f = Math.max(0, Math.min(1, time / 8)),
    e = f * f * (3 - 2 * f),
    angle = e * Math.PI * 2,
    power = Math.sin(Math.PI * f);
  base.x += Math.sin(angle) * 1.75;
  base.z += (1 - Math.cos(angle)) * 0.55;
  base.yaw += Math.sin(angle) * 1.05;
  base.heel += Math.sin(angle) * 0.2;
  base.sail = Math.sin(angle) * 0.5;
  base.wake = power;
  return base;
}
