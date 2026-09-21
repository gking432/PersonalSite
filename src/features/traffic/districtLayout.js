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
export const RIVER = { x: -5.92, width: 1.62, minZ: -33, maxZ: 10 };
export const FIXED_BRIDGES = [-13, -26].map((z) => ({
  z,
  minX: -9.75,
  maxX: -2.9,
  height: 1.4,
}));
const smooth = (t) => t * t * (3 - 2 * t);
export function bridgeHeight(x, bridge) {
  const leftBank = RIVER.x - 1.2,
    rightBank = RIVER.x + 1.2;
  if (x <= bridge.minX || x >= bridge.maxX) return 0;
  if (x < leftBank)
    return bridge.height * smooth((x - bridge.minX) / (leftBank - bridge.minX));
  if (x > rightBank)
    return (
      bridge.height * smooth((bridge.maxX - x) / (bridge.maxX - rightBank))
    );
  return bridge.height;
}
export function roadElevation(x, z, yaw = 0) {
  const bridge = FIXED_BRIDGES.find(
    (b) => Math.abs(z - b.z) < 1.5 && x >= b.minX && x <= b.maxX,
  );
  if (!bridge) return { y: 0, pitch: 0 };
  const dx = Math.sin(yaw) * 0.01;
  return {
    y: bridgeHeight(x, bridge),
    pitch: Math.atan2(
      bridgeHeight(x + dx, bridge) - bridgeHeight(x - dx, bridge),
      0.02,
    ),
  };
}
// Separate slip road from East Market. It leaves the surface street at ground
// level, then climbs along the eastern edge before crossing Lakefront overhead.
export const FREEWAY = { junction: 3, exitLane: 3, returnLane: 1, branch: 3.2 };
const rampHeight = (z) =>
  3.4 * smooth(Math.max(0, Math.min(1, (-z - 15.7) / 7.8)));
export const RAMP_CENTER = [
  ...Array.from({ length: 33 }, (_, i) => {
    const angle = ((i / 32) * Math.PI) / 2;
    const z = -17 + 4 * Math.cos(angle);
    return {
      x: 14.2 + 4 * Math.sin(angle),
      z,
      y: rampHeight(z),
      nx: Math.sin(angle),
      nz: Math.cos(angle),
    };
  }),
  ...Array.from({ length: 64 }, (_, i) => {
    const z = -17 - ((i + 1) / 64) * 16;
    return { x: 18.2, z, y: rampHeight(z), nx: 1, nz: 0 };
  }),
];
export function rampOffset(index, offset) {
  const p = RAMP_CENTER[index];
  return { x: p.x + p.nx * offset, z: p.z + p.nz * offset, y: p.y };
}
export const RAMP_OUT = RAMP_CENTER.map((_, i) => rampOffset(i, 0.57));
export const RAMP_IN = RAMP_CENTER.map((_, i) =>
  rampOffset(i, -0.57),
).reverse();
export const FREEWAY_SUPPORTS = [-20.5, -23.5, -29.5, -32].map((z) => ({
  x: 18.2,
  z,
  y: rampHeight(z),
}));
