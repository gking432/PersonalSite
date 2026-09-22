import * as THREE from "three";
import { createBoatModel } from "./boatModel";
import { riverBoatPose } from "./waterfront";
export function createCityAdditions({
  city,
  palette,
  box,
  mesh,
  cylinder,
  rod,
  material,
}) {
  // Buildings complete the riverwalk on the opposite bank.
  for (const side of [-1, 1]) {
    box(3.3, 0.34, 5.2, -8.5, -0.05, side * 4.1, palette.base);
    box(3.35, 0.07, 5.25, -8.5, -0.24, side * 4.1, palette.edge);
    box(3.25, 0.12, 5.15, -8.5, 0.18, side * 4.1, palette.pavement);
    box(2, 0.13, 3.15, -8.75, 0.34, side * 3.9, palette.curb);
    const height = side > 0 ? 1.7 : 2.3;
    box(
      1.65,
      height,
      2.5,
      -8.75,
      0.4 + height / 2,
      side * 3.9,
      side > 0 ? palette.brick : palette.ivory,
    );
    box(1.85, 0.14, 2.7, -8.75, 0.45 + height, side * 3.9, palette.trim);
    box(1.55, 0.06, 2.4, -8.75, 0.55 + height, side * 3.9, palette.roof);
    for (let floor = 0; floor < 3; floor++)
      for (let col = 0; col < 4; col++)
        box(
          0.035,
          0.26,
          0.25,
          -7.91,
          0.75 + floor * 0.48,
          side * 3.9 - 0.87 + col * 0.58,
          palette.glass,
        );
    rod([-7.1, 0.4, side * 1.9], [-7.1, 0.4, side * 6.5], 0.025, palette.dark);
    for (let z = 2; z < 6.5; z += 0.5)
      rod([-7.1, 0.3, side * z], [-7.1, 0.62, side * z], 0.015, palette.dark);
  }

  const leaves = [];
  for (const sign of [-1, 1]) {
    const leaf = new THREE.Group();
    city.add(leaf);
    leaf.position.set(-5.95 + sign * 0.9, 0.28, 0);
    box(0.9, 0.12, 2.98, -sign * 0.45, -0.05, 0, palette.base, leaf);
    box(0.9, 0.045, 2.75, -sign * 0.45, 0, 0, palette.asphalt, leaf);
    for (const z of [-1.49, 1.49]) {
      box(0.9, 0.1, 0.12, -sign * 0.45, 0.17, z, palette.terra, leaf);
      box(0.9, 0.04, 0.04, -sign * 0.45, 0.43, z, palette.dark, leaf);
      for (let i = 0; i < 4; i++)
        box(
          0.025,
          0.28,
          0.025,
          -sign * (0.12 + i * 0.22),
          0.29,
          z,
          palette.dark,
          leaf,
        );
    }
    for (const line of [-0.035, 0.035])
      box(0.55, 0.006, 0.025, -sign * 0.45, 0.027, line, palette.yellow, leaf);
    leaves.push({ leaf, sign });
  }
  const gates = [];
  for (const x of [-7.25, -4.65]) {
    cylinder(0.065, 0.65, x, 0.62, -1.46, palette.green);
    const gate = new THREE.Group();
    gate.position.set(x, 0.92, -1.46);
    city.add(gate);
    box(0.055, 0.055, 2.85, 0, 0, 1.42, palette.white, gate);
    for (let z = 0.22; z < 2.8; z += 0.4)
      box(0.065, 0.065, 0.18, 0, 0, z, palette.brick, gate);
    gates.push(gate);
  }
  const boatMeshes = new Map();
  const paints = [palette.green, material("#467c9a"), material("#bd5e4b")];
  const boatTemplates = paints.map((paint) =>
    createBoatModel({ palette, box, mesh, rod, paint }),
  );
  const boatTemplate = boatTemplates[0];
  const templateFor = (boat) =>
    boatTemplates[boat.id % 5 === 2 ? 1 : boat.id % 5 === 4 ? 2 : 0];

  return {
    createBoat: () => boatTemplate.clone(true),
    takeBoat(boat) {
      const model = boatMeshes.get(boat.id) || templateFor(boat).clone(true);
      boatMeshes.delete(boat.id);
      city.add(model);
      return model;
    },
    update(sim) {
      for (const { leaf, sign } of leaves)
        leaf.rotation.z = -sign * sim.bridge.lift * 1.15;
      for (const gate of gates)
        gate.rotation.x = (-Math.PI / 2) * (1 - (sim.bridge.gated ? 1 : 0));
      const live = new Set();
      for (const boat of sim.bridge.boats) {
        live.add(boat.id);
        if (!boatMeshes.has(boat.id)) {
          const model = templateFor(boat).clone(true);
          city.add(model);
          boatMeshes.set(boat.id, model);
        }
        const group = boatMeshes.get(boat.id);
        const pose = riverBoatPose(boat);
        group.position.set(
          pose.x,
          0.38 + Math.sin(sim.time * 1.8 + boat.id) * 0.025,
          pose.z,
        );
        group.rotation.y = pose.yaw;
      }
      for (const [id, group] of boatMeshes)
        if (!live.has(id)) {
          city.remove(group);
          boatMeshes.delete(id);
        }
    },
    diagnostics: () =>
      [...boatMeshes].map(([id, group]) => ({
        id,
        paint: group
          .getObjectByName("painted-v-hull")
          .material.color.getHexString(),
      })),
    clear() {
      for (const group of boatMeshes.values()) city.remove(group);
      boatMeshes.clear();
    },
  };
}
