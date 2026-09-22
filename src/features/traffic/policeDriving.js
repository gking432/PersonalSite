const offset = (car) => (car.passing || 0) + (car.service?.curb || 0);
export const sameTrafficTrack = (a, b) =>
  Math.abs(offset(a) - offset(b)) < 0.43;
export function straightForPassing(car, pose) {
  if (car.lakeFrom !== undefined) return false;
  const p = pose(car);
  return (
    (car.p < -3.65 || p.out > 3.65) &&
    Math.cos(p.yaw - pose({ ...car, p: car.p + 0.75 }).yaw) > 0.998
  );
}
export function updatePolicePassing(cars, dt, pose, overlaps) {
  for (const car of cars) {
    if (!car.police || car.remove) continue;
    const phase = car.service?.phase;
    if (["parking", "parked", "merging"].includes(phase)) {
      car.passing = 0;
      continue;
    }
    const normal = pose({ ...car, passing: 0 }),
      p = pose(car);
    let straight = straightForPassing(car, pose);
    if (
      phase === "driving" &&
      car.service.index === car.service.route.length - 1
    ) {
      const stop = car.service.stop,
        end =
          stop.p ?? stop.out + 100 - pose({ ...car, p: 100, passing: 0 }).out;
      if (end - car.p < 2.7) straight = false;
    }
    const front = cars.some((other) => {
      if (other === car || other.remove || other.speed > 3.5) return false;
      const q = pose(other),
        dx = q.x - normal.x,
        dz = q.z - normal.z;
      const ahead = dx * Math.sin(p.yaw) + dz * Math.cos(p.yaw),
        across = dx * Math.cos(p.yaw) - dz * Math.sin(p.yaw);
      return (
        Math.cos(q.yaw - p.yaw) > 0.995 &&
        ahead > 0 &&
        ahead < 4 &&
        Math.abs(across) < 0.24
      );
    });
    const clear = (passing) => {
      const candidate = { ...car, passing, length: car.length + 0.24 },
        q = pose(candidate);
      return !cars.some(
        (other) =>
          other !== car &&
          !other.remove &&
          overlaps(candidate, q, other, pose(other)),
      );
    };
    const current = car.passing || 0;
    // Do not squeeze halfway into an occupied lane: that would make its
    // queued car stop too, leaving neither vehicle able to finish the merge.
    const wanted = straight && front ? 0.55 : clear(0) ? 0 : current;
    const change = Math.max(-dt * 0.85, Math.min(dt * 0.85, wanted - current));
    if (clear(current + change)) car.passing = current + change;
    // Finish merging before a corner or a curbside response stop.
    car.mergeBlocked = !straight && (car.passing || 0) > 0.035;
  }
}
export function policeStep(car, step, cars, pose, overlaps, dt) {
  if (!car.police || step <= 0) return step;
  const safe = (distance) => {
    const next = { ...car, p: car.p + distance, length: car.length + 0.06 },
      q = pose(next);
    return !cars.some(
      (other) =>
        other !== car &&
        !other.remove &&
        overlaps(
          next,
          q,
          other,
          pose({ ...other, p: other.p + Math.max(0, other.speed || 0) * dt }),
        ),
    );
  };
  if (safe(step)) return step;
  let lo = 0,
    hi = step;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    if (safe(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}
