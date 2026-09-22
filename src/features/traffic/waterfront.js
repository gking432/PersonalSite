import { STUMBLE_DURATION } from "./pedestrianMotion.js";
// The river's distance coordinate passes through zero at the original bridge.
export const RIVER_RADIUS = 2.8;
export const RIVER_BEND = 5.4;
export const RIVER_ARC_END = RIVER_BEND + (RIVER_RADIUS * Math.PI) / 2;
export const RIVER_NORTH_END = RIVER_ARC_END + 28.54;
export const RIVER_SOUTH_END = 10.9;
export function riverPoint(s, offset = 0) {
  let x = -5.94,
    z = s,
    dx = 0,
    dz = 1;
  if (s < -RIVER_BEND && s >= -RIVER_ARC_END) {
    const a = Math.PI + (-s - RIVER_BEND) / RIVER_RADIUS;
    x = -3.14 + Math.cos(a) * RIVER_RADIUS;
    z = -RIVER_BEND + Math.sin(a) * RIVER_RADIUS;
    dx = Math.sin(a);
    dz = -Math.cos(a);
  } else if (s < -RIVER_ARC_END) {
    x = -3.14 - s - RIVER_ARC_END;
    z = -8.2;
    dx = -1;
    dz = 0;
  }
  return { x: x + dz * offset, z: z - dx * offset, dx, dz };
}
export function riverBoatPose(boat) {
  const p = riverPoint(boat.direction * boat.p, boat.direction * 0.35);
  return {
    x: p.x,
    z: p.z,
    yaw: Math.atan2(p.dx * boat.direction, p.dz * boat.direction),
  };
}
export const boatEntry = (direction) =>
  direction === 1 ? -RIVER_NORTH_END + 0.7 : -RIVER_SOUTH_END + 0.7;
export const boatExit = (direction) =>
  direction === 1 ? RIVER_SOUTH_END : RIVER_NORTH_END;
export const RIVER_BRIDGE_START = -12.7;
export const RIVER_BRIDGE_END = -4.8;
export function riverBridgeHeight(x, z) {
  if (Math.min(Math.abs(x), Math.abs(x - 14.4)) > 1.5) return 0;
  // Long easing ramps, a level span above both boat lanes, and zero slope at
  // all joins. Cars and the continuous bridge deck use the identical profile.
  return (
    1.05 *
    smooth(RIVER_BRIDGE_START, -8.8, z) *
    (1 - smooth(-7.6, RIVER_BRIDGE_END, z))
  );
}
const smooth = (a, b, value) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export function lakeOpacity(x, z) {
  // An irregular translucent wash: the texture is fully clear at every edge.
  const shore = 10.9 + 0.09 * Math.sin(x * 0.6);
  // Keep a crisp shoreline against land, but soften its continuation beyond
  // the city so it does not draw a straight seam across the page background.
  const alongLand = smooth(-11, -9, x) * (1 - smooth(20.6, 23, x));
  const shoreline =
    smooth(shore - 0.09, shore + 0.15, z) * alongLand +
    smooth(9.7, 11.15, z) * (1 - alongLand);
  return (
    0.83 *
    shoreline *
    (1 - smooth(12.1, 21.5, z)) *
    smooth(-15, -9, x) *
    (1 - smooth(22, 32, x))
  );
}
export const WATERFRONT_WALKS = [
  {
    id: "lakeWalk",
    label: "Surprise the lakewalk pedestrian",
    point: [6, 1, 10.35],
    duration: STUMBLE_DURATION,
    loopDuration: 30,
    path: [
      [6, 10.35],
      [11.6, 10.35],
      [1.8, 10.35],
      [6, 10.35],
    ],
  },
  {
    id: "museumWalk",
    label: "Surprise the museum pedestrian",
    point: [20.8, 1, 7.1],
    duration: STUMBLE_DURATION,
    loopDuration: 26,
    path: [
      [20.8, 7.1],
      [20.8, 9.85],
      [16.3, 9.85],
      [16.3, 7.1],
      [20.8, 7.1],
    ],
  },
  {
    id: "apartmentWalk",
    label: "Surprise the apartment riverwalk pedestrian",
    point: [7.5, 1, -9.5],
    duration: STUMBLE_DURATION,
    loopDuration: 26,
    path: [
      [7.5, -9.5],
      [12.45, -9.5],
      [2, -9.5],
      [7.5, -9.5],
    ],
  },
  {
    id: "cityWalk",
    label: "Surprise the city pedestrian",
    point: [5.1, 1, 3.5],
    duration: STUMBLE_DURATION,
    loopDuration: 22,
    path: [
      [5.1, 3.5],
      [5.1, 5.35],
      [1.95, 5.35],
      [1.95, 1.95],
      [5.1, 1.95],
      [5.1, 3.5],
    ],
  },
  {
    id: "lakeBench",
    label: "Invite the lakefront sitter for a walk",
    point: [7.85, 1, 9.78],
    duration: 20,
    seated: true,
    path: [
      [7.85, 9.78],
      [7.85, 10.35],
      [10.8, 10.35],
      [7.85, 10.35],
      [7.85, 9.78],
    ],
  },
  {
    id: "parkBench",
    label: "Invite the park sitter for a walk",
    point: [18.4, 1, 5.8],
    duration: 18,
    seated: true,
    path: [
      [18.4, 5.8],
      [20, 5.8],
      [20, 4.5],
      [18.4, 4.5],
      [18.4, 5.8],
    ],
  },
];
