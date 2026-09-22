import * as THREE from "three";
import { carPose } from "./trafficSimulation.js";
import { lakeRouteLength, LAKE_ROAD_START } from "./lakeRoad.js";
import { riverBridgeHeight } from "./waterfront.js";

export function createHopTracks({ mesh, material }) {
  const paths = [];
  const sample = (car, start, end) => {
    const path = [];
    for (let p = start; p <= end + 0.001; p += 0.075)
      path.push(carPose({ ...car, p }));
    paths.push(path);
  };
  sample({ junction: 0, lane: 0, turn: "straight" }, -12.2, LAKE_ROAD_START);
  sample({ lakeFrom: 0 }, 0, lakeRouteLength(0));
  for (const [junction, lane, limit] of [
    [1, 2, 7.2],
    [0, 1, LAKE_ROAD_START],
  ]) {
    const car = { junction, lane, turn: "left" };
    const end = limit + 100 - carPose({ ...car, p: 100 }).out;
    sample(car, junction === 1 ? -LAKE_ROAD_START : -7.2, end);
  }
  const vertices = [];
  for (const path of paths)
    for (const offset of [-0.135, 0.135])
      for (let i = 1; i < path.length; i++) {
        const point = (p, side) => [
          p.x + Math.cos(p.yaw) * (offset + side * 0.008),
          0.315 + riverBridgeHeight(p.x, p.z),
          p.z - Math.sin(p.yaw) * (offset + side * 0.008),
        ];
        const a = point(path[i - 1], -1),
          b = point(path[i - 1], 1),
          c = point(path[i], -1),
          d = point(path[i], 1);
        vertices.push(...a, ...c, ...b, ...b, ...c, ...d);
      }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.computeVertexNormals();
  const rails = mesh(
    geometry,
    material("#9a9d94", {
      metalness: 0.5,
      roughness: 0.65,
      side: THREE.DoubleSide,
    }),
    0,
    0,
    0,
  );
  rails.castShadow = false;
}

export function createHopVehicle({
  city,
  box,
  mesh,
  rod,
  label,
  material,
  palette: p,
}) {
  const group = new THREE.Group();
  city.add(group);
  const gold = material("#b5a16c"),
    red = material("#bf6950");
  box(0.4, 0.35, 1.65, 0, 0.535, 0, p.white, group);
  box(0.41, 0.12, 1.5, 0, 0.42, 0, gold, group);
  box(0.35, 0.28, 1.49, 0, 0.71, 0, p.glass, group);
  box(0.4, 0.07, 1.57, 0, 0.89, 0, p.white, group);
  for (const q of [-1, 1]) {
    box(0.42, 0.29, 0.075, 0, 0.65, q * 0.79, p.white, group);
    box(0.32, 0.18, 0.012, 0, 0.715, q * 0.835, p.glass, group);
    for (const z of [-0.53, -0.15, 0.15, 0.53])
      box(0.018, 0.27, 0.035, q * 0.205, 0.72, z, p.white, group);
    label("the hop", 0.69, 0.15, q * 0.217, 0.465, 0.39, {
      parent: group,
      ry: (q * Math.PI) / 2,
      background: null,
      color: "#345345",
      size: 92,
    });
    for (const zz of [-0.56, 0.56])
      box(0.045, 0.11, 0.15, q * 0.2, 0.355, zz, p.black, group);
  }
  // Bellows visually break up the body into a little articulated streetcar.
  for (const z of [-0.24, 0.24])
    for (let i = 0; i < 4; i++)
      box(0.415, 0.42, 0.017, 0, 0.65, z + (i - 1.5) * 0.021, p.roof, group);
  const doors = [];
  for (const side of [-1, 1])
    for (const half of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.216, 0, half * 0.074);
      group.add(pivot);
      box(0.018, 0.38, 0.14, 0, 0.61, 0, gold, pivot);
      box(0.022, 0.19, 0.1, 0, 0.7, 0, p.glass, pivot);
      doors.push({ pivot, half });
    }
  rod([0, 0.94, -0.24], [0, 1.14, 0], 0.018, p.dark, group);
  rod([0, 1.14, 0], [0, 0.99, 0.22], 0.018, p.dark, group);
  box(0.26, 0.026, 0.1, 0, 1.145, 0, p.dark, group);
  const brakes = [-1, 1].map((x) =>
    box(0.07, 0.045, 0.025, x * 0.12, 0.5, -0.842, red, group),
  );
  const passenger = new THREE.Group();
  group.add(passenger);
  mesh(
    new THREE.SphereGeometry(0.06, 9, 7),
    material("#d8aa81"),
    -0.231,
    0.74,
    -0.42,
    passenger,
  );
  box(0.024, 0.11, 0.12, -0.229, 0.63, -0.42, p.brick, passenger);
  const wave = new THREE.Group();
  wave.position.set(-0.24, 0.66, -0.34);
  passenger.add(wave);
  rod([0, 0, 0], [0, 0.1, 0.08], 0.022, p.brick, wave);
  mesh(
    new THREE.SphereGeometry(0.027, 8, 6),
    material("#d8aa81"),
    0,
    0.105,
    0.08,
    wave,
  );
  passenger.visible = false;
  return {
    group,
    brakes,
    blinkers: [],
    beacons: [],
    hop: true,
    animate(car, sim) {
      doors.forEach(({ pivot, half }) => {
        pivot.position.z = half * (0.074 + (car.hopDoors || 0) * 0.12);
      });
      passenger.visible = Object.values(
        sim.discoveries.pedestrians.states,
      ).some(
        (s) =>
          s.phase === "riding" &&
          s.carrier?.id === car.id &&
          s.carrier.kind === "car",
      );
      wave.rotation.x = Math.sin(sim.time * 9) * 0.3;
    },
  };
}
