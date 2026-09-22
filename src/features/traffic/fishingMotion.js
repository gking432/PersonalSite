export const FISHERMAN = [-7.12, 4.85];
export const FISHING_DURATION = 9;
const ease = (v) => {
  const t = Math.max(0, Math.min(1, v));
  return t * t * (3 - 2 * t);
};
export function fishingPose(t) {
  if (t === undefined)
    return { angle: 0.45, bobX: 0.8, bobY: -0.72, fish: false, phase: "ready" };
  let angle = 0.45,
    bobX = 0.8,
    bobY = -0.72;
  if (t < 0.7) angle = 0.45 + 1.35 * ease(t / 0.7);
  else if (t < 1.4) angle = 1.8 - 1.55 * ease((t - 0.7) / 0.7);
  else if (t < 4) angle = 0.25;
  else if (t < 6.2) angle = 0.25 + 0.7 * ease((t - 4) / 2.2);
  else if (t < 7.8) angle = 0.95;
  else angle = 0.95 - 0.5 * ease((t - 7.8) / 1.2);
  if (t < 1.4) {
    const f = ease((t - 0.7) / 0.7);
    bobX = 0.25 + f * 0.84;
    bobY = 0.2 + Math.sin(f * Math.PI) * 0.8 - f * 0.92;
  } else if (t < 4) {
    bobX = 1.09;
    bobY = -0.72 + Math.sin(t * 6) * 0.025;
  } else {
    const f = ease((t - 4) / 2.2);
    bobX = 1.09 - 0.43 * f;
    bobY = -0.72 + 1.25 * f;
  }
  return {
    angle,
    bobX,
    bobY,
    fish: t >= 4.7 && t < 8.35,
    phase:
      t < 1.4
        ? "casting"
        : t < 4
          ? "waiting"
          : t < 6.2
            ? "reeling"
            : t < 8.35
              ? "caught"
              : "ready",
  };
}
