import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";

// Closed, tapered hulls look finished from below as well as on the river.
export function createBoatModel({ palette, box, mesh, rod }) {
  const group = new THREE.Group();
  group.name = "riverboat";
  const outline = [
    [0, 0.68],
    [0.23, 0.43],
    [0.28, 0.05],
    [0.27, -0.43],
    [0.21, -0.61],
    [-0.21, -0.61],
    [-0.27, -0.43],
    [-0.28, 0.05],
    [-0.23, 0.43],
  ];
  function shell(rings, mat, name) {
    const points = rings.flatMap(([y, width, length]) =>
      outline.map(([x, z]) => new THREE.Vector3(x * width, y, z * length)),
    );
    const part = mesh(new ConvexGeometry(points), mat, 0, 0, 0, group);
    part.name = name;
  }
  shell(
    [
      [0.06, 1, 1],
      [-0.12, 0.82, 0.9],
      [-0.24, 0.12, 0.72],
    ],
    palette.green,
    "painted-v-hull",
  );
  shell(
    [
      [0.07, 1.015, 1.01],
      [0.11, 1.015, 1.01],
    ],
    palette.white,
    "waterline-trim",
  );
  shell(
    [
      [0.112, 0.9, 0.95],
      [0.14, 0.9, 0.95],
    ],
    palette.trim,
    "deck",
  );
  box(0.045, 0.045, 0.74, 0, -0.245, -0.03, palette.dark, group);
  box(0.025, 0.12, 0.12, 0, -0.13, -0.6, palette.green, group);
  const propeller = mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.025, 8),
    palette.yellow,
    0,
    -0.15,
    -0.55,
    group,
  );
  propeller.rotation.x = Math.PI / 2;

  box(0.38, 0.23, 0.47, 0, 0.255, -0.07, palette.ivory, group);
  box(0.29, 0.13, 0.018, 0, 0.285, 0.173, palette.glass, group);
  box(0.27, 0.12, 0.018, 0, 0.285, -0.313, palette.glass, group);
  for (const side of [-1, 1]) {
    for (const z of [-0.18, 0.03])
      box(0.018, 0.13, 0.15, side * 0.196, 0.285, z, palette.glass, group);
    box(0.06, 0.06, 0.17, side * 0.17, 0.185, -0.43, palette.terra, group);
    rod(
      [side * 0.24, 0.2, 0.16],
      [side * 0.18, 0.2, 0.43],
      0.012,
      palette.white,
      group,
    );
    rod([side * 0.18, 0.2, 0.43], [0, 0.2, 0.6], 0.012, palette.white, group);
  }
  box(0.45, 0.06, 0.54, 0, 0.4, -0.07, palette.green, group);
  rod([0, 0.42, -0.27], [0, 0.78, -0.27], 0.013, palette.dark, group);
  box(0.19, 0.11, 0.022, 0.095, 0.71, -0.27, palette.brick, group);
  return group;
}
