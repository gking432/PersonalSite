// Nine terrain cells: the original street row, four stadium cells, one market,
// and one more ordinary street block. Coordinates preserve the river crossing.
export const DISTRICT_GRID = {
  columns: [-15, 0, 11],
  rows: [0, -13, -26],
  cells: [
    ["street", "street", "street"],
    ["stadium", "stadium", "street"],
    ["stadium", "stadium", "shop"],
  ],
  bounds: { minX: -25, maxX: 21, minZ: -33, maxZ: 10 },
};
export const FREEWAY = { junction: 3, exitLane: 3, returnLane: 1, branch: 3.2 };

// Shared geometry for the deck and traffic: the ramp joins East Market, climbs
// over its north/south street, and leaves at the back edge of the same grid.
const knots = [
  [14.2, 0, -13],
  [16.9, 0.3, -13.2],
  [18.2, 3, -15.6],
  [14, 3.5, -19.2],
  [9.8, 3.5, -18.7],
  [6.8, 3.5, -22],
  [6.8, 3.5, -33],
];
const curve = (a, b, c, d, t) =>
  0.5 *
  (2 * b +
    (-a + c) * t +
    (2 * a - 5 * b + 4 * c - d) * t * t +
    (-a + 3 * b - 3 * c + d) * t * t * t);
export const RAMP_CENTER = [];
for (let segment = 0; segment < knots.length - 1; segment++) {
  for (let step = 0; step < 12; step++) {
    const t = step / 12;
    const p = [0, 1, 2].map((axis) =>
      curve(
        knots[Math.max(0, segment - 1)][axis],
        knots[segment][axis],
        knots[segment + 1][axis],
        knots[Math.min(knots.length - 1, segment + 2)][axis],
        t,
      ),
    );
    RAMP_CENTER.push({ x: p[0], y: Math.max(0, p[1]), z: p[2] });
  }
}
RAMP_CENTER.push({ x: 6.8, y: 3.5, z: -33 });
export function rampOffset(index, offset) {
  const a = RAMP_CENTER[Math.max(0, index - 1)],
    b = RAMP_CENTER[Math.min(RAMP_CENTER.length - 1, index + 1)],
    dx = index === RAMP_CENTER.length - 1 ? 0 : b.x - a.x,
    dz = b.z - a.z,
    d = Math.hypot(dx, dz),
    p = RAMP_CENTER[index];
  return { x: p.x - (dz / d) * offset, y: p.y, z: p.z + (dx / d) * offset };
}
export const RAMP_OUT = RAMP_CENTER.map((_, i) => rampOffset(i, 0.57));
export const RAMP_IN = RAMP_CENTER.map((_, i) =>
  rampOffset(i, -0.57),
).reverse();
// Meet the surface street's lane centers exactly, without a lateral jump.
RAMP_OUT[0] = { x: 14.2, y: 0, z: -12.43 };
RAMP_IN[RAMP_IN.length - 1] = { x: 14.2, y: 0, z: -13.57 };
