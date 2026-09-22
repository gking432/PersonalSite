// Visibility graph around the actual building footprints. Medics use the
// shortest clear route instead of walking straight through an apartment.
export function walkRoute(start, end, buildings = [], { strict = false } = {}) {
  const obstacles = buildings.map(([x1, z1, x2, z2]) => [
    x1 - 0.14,
    z1 - 0.14,
    x2 + 0.14,
    z2 + 0.14,
  ]);
  const intersects = (a, b, r) => {
    let lo = 0.00001,
      hi = 0.99999;
    for (let i = 0; i < 2; i++) {
      const delta = b[i] - a[i],
        min = r[i],
        max = r[i + 2];
      if (Math.abs(delta) < 1e-8) {
        if (a[i] <= min || a[i] >= max) return false;
        continue;
      }
      const t1 = (min - a[i]) / delta,
        t2 = (max - a[i]) / delta;
      lo = Math.max(lo, Math.min(t1, t2));
      hi = Math.min(hi, Math.max(t1, t2));
      if (lo >= hi) return false;
    }
    return true;
  };
  const clear = (a, b) => !obstacles.some((r) => intersects(a, b, r));
  if (clear(start, end)) return [start, end];
  const nodes = [
    start,
    end,
    ...obstacles.flatMap(([x1, z1, x2, z2]) => [
      [x1 - 0.02, z1 - 0.02],
      [x1 - 0.02, z2 + 0.02],
      [x2 + 0.02, z1 - 0.02],
      [x2 + 0.02, z2 + 0.02],
    ]),
  ];
  const cost = nodes.map(() => Infinity),
    previous = [],
    visited = new Set();
  cost[0] = 0;
  while (visited.size < nodes.length) {
    let current = -1;
    for (let i = 0; i < nodes.length; i++)
      if (!visited.has(i) && (current < 0 || cost[i] < cost[current]))
        current = i;
    if (!Number.isFinite(cost[current])) break;
    if (current === 1) {
      const route = [];
      for (let at = 1; at !== undefined; at = previous[at])
        route.unshift(nodes[at]);
      return route;
    }
    visited.add(current);
    for (let i = 0; i < nodes.length; i++)
      if (!visited.has(i) && clear(nodes[current], nodes[i])) {
        const next =
          cost[current] +
          Math.hypot(
            nodes[i][0] - nodes[current][0],
            nodes[i][1] - nodes[current][1],
          );
        if (next < cost[i]) {
          cost[i] = next;
          previous[i] = current;
        }
      }
  }
  return strict ? [] : [start, end];
}
