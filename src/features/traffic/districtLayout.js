// A unit is a whole terrain tile; a block is one small building plot.
// The stadium and its surrounding parking share the rear-west unit.
export const DISTRICT_GRID = {
  columns: [-15, 0, 11],
  rows: [0, -13, -26],
  cells: [
    ["street", "street", "street"],
    ["street", "shop-and-parking", "civic-hall"],
    ["stadium-and-parking", "street", "plaza"],
  ],
  bounds: { minX: -25, maxX: 21, minZ: -33, maxZ: 10 },
};
export const STADIUM_SCALE = 0.5;
export const FREEWAY = { junction: 0, exitLane: 3, returnLane: 1, branch: 3.2 };
// A straight ramp from Water Street over Broadway, with a gentle vertical
// transition. Traffic and deck share this path; there are no horizontal curves.
export const RAMP_CENTER = Array.from({ length: 73 }, (_, i) => {
  const x = 3.2 + ((21 - 3.2) * i) / 72;
  const t = Math.max(0, Math.min(1, (x - 3.2) / 6.5));
  return { x, y: 3.4 * t * t * (3 - 2 * t), z: 0 };
});
export function rampOffset(index, offset) {
  return { ...RAMP_CENTER[index], z: offset };
}
export const RAMP_OUT = RAMP_CENTER.map((_, i) => rampOffset(i, 0.57));
export const RAMP_IN = RAMP_CENTER.map((_, i) =>
  rampOffset(i, -0.57),
).reverse();
