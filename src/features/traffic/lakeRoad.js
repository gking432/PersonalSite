// A two-way lakefront connection between the two southern street ends.
export const LAKE_ROAD_START = 6.2;
export const LAKE_ROAD_RADIUS = 2.1;
export const LAKE_ROAD_SPAN = 14.4;
export const LAKE_ROAD_Z = LAKE_ROAD_START + LAKE_ROAD_RADIUS;
const straight = LAKE_ROAD_SPAN - 2 * LAKE_ROAD_RADIUS;
export const lakeRoadLength = (offset = 0) =>
  straight + Math.PI * (LAKE_ROAD_RADIUS + offset);
export function lakeRoadPoint(distance, offset = 0) {
  const r = LAKE_ROAD_RADIUS + offset,
    arc = (Math.PI * r) / 2;
  if (distance < arc) {
    const a = Math.max(0, distance) / r;
    return {
      x: LAKE_ROAD_RADIUS - r * Math.cos(a),
      z: LAKE_ROAD_START + r * Math.sin(a),
      dx: Math.sin(a),
      dz: Math.cos(a),
    };
  }
  if (distance < arc + straight)
    return {
      x: LAKE_ROAD_RADIUS + distance - arc,
      z: LAKE_ROAD_START + r,
      dx: 1,
      dz: 0,
    };
  const a = Math.min(Math.PI / 2, (distance - arc - straight) / r);
  return {
    x: LAKE_ROAD_SPAN - LAKE_ROAD_RADIUS + r * Math.sin(a),
    z: LAKE_ROAD_START + r * Math.cos(a),
    dx: Math.cos(a),
    dz: -Math.sin(a),
  };
}
export const lakeRouteLength = (from) =>
  lakeRoadLength(from === 0 ? 0.57 : -0.57);
export function lakeCarPose(distance, from) {
  const offset = from === 0 ? 0.57 : -0.57,
    direction = from === 0 ? 1 : -1;
  const p = lakeRoadPoint(
    from === 0 ? distance : lakeRoadLength(offset) - distance,
    offset,
  );
  return {
    x: p.x,
    z: p.z,
    yaw: Math.atan2(p.dx * direction, p.dz * direction),
    exitLane: 2,
    out: null,
  };
}
