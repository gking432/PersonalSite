import { CatmullRomCurve3, Vector3 as V } from "three";

export const FLYWHEEL_CENTER = [-1.42, 1.47, 0.72];
export const FLYWHEEL_RADIUS = 0.64;

// The left branch swings outside the flywheel, leaving room for both rails
// and the marble instead of passing through its rim or rotating spokes.
export function createMachineTracks() {
  const leadPoints = [
    [-1.8, 4.46, -0.65],
    [-1.8, 4.02, -0.65],
    [-1.8, 3.82, -0.65],
    [-1.6, 3.61, -0.69],
    [-0.92, 3.41, -0.85],
    [0, 3.28, -1.13],
  ];
  const lead = new CatmullRomCurve3(leadPoints.map((p) => new V(...p)));
  const spiralPoints = [];
  for (let i = 0; i <= 140; i++) {
    const t = i / 140,
      a = -Math.PI / 2 + t * Math.PI * 2 * 1.25;
    spiralPoints.push(
      new V(Math.cos(a) * 1.13, 3.28 - t * 1.79, Math.sin(a) * 1.13),
    );
  }
  const spiral = new CatmullRomCurve3(spiralPoints);
  const exit = new CatmullRomCurve3(
    [
      [1.13, 1.49, 0],
      [1.25, 1.22, 0.8],
      [0.75, 1.02, 1.9],
      [0.4, 0.94, 2.2],
    ].map((p) => new V(...p)),
  );
  const short = new CatmullRomCurve3(
    [
      [0, 3.28, -1.13],
      [0.92, 3.19, -1.35],
      [1.82, 2.94, -1.03],
      [2.02, 2.64, -0.26],
      [2.25, 2.12, -0.36],
      [2.68, 1.5, -0.56],
      [3.05, 1.12, -0.4],
    ].map((p) => new V(...p)),
  );
  const left = new CatmullRomCurve3(
    [
      [0, 3.28, -1.13],
      [-0.95, 3.04, -1.45],
      [-1.8, 2.72, -1.12],
      [-2.35, 2.4, -0.9],
      [-2.6, 2.1, -0.35],
      [-2.72, 1.65, 0.35],
      [-2.92, 1.23, 0.95],
      [-3.02, 0.94, 1.22],
    ].map((p) => new V(...p)),
  );
  const routes = [
    [lead, left],
    [lead, spiral, exit],
    [lead, short],
  ];
  return { lead, spiral, exit, short, left, routes };
}
