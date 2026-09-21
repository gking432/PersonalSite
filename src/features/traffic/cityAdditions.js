import * as THREE from "three";
import { BLOCK_SPACING } from "./cityChallenges";

export function createCityAdditions({
  city,
  palette,
  box,
  mesh,
  cylinder,
  rod,
  unitBox,
}) {
  const block = new THREE.Group();
  city.add(block);
  block.position.x = BLOCK_SPACING;
  const b = (w, h, d, x, y, z, mat) => box(w, h, d, x, y, z, mat, block);
  b(14.4, 0.34, 13.8, 0, -0.05, 0, palette.base);
  b(14.5, 0.07, 13.9, 0, -0.24, 0, palette.edge);
  b(14.25, 0.12, 13.65, 0, 0.18, 0, palette.pavement);
  b(20, 0.045, 2.75, 0, 0.28, 0, palette.asphalt);
  b(2.75, 0.045, 20, 0, 0.28, 0, palette.asphalt);
  for (const s of [-1, 1]) {
    b(2.95, 0.34, 3.3, 0, -0.05, s * 8.35, palette.base);
    b(3.04, 0.07, 3.36, 0, -0.24, s * 8.35, palette.edge);
    b(3.3, 0.34, 2.95, s * 8.35, -0.05, 0, palette.base);
    b(3.36, 0.07, 3.04, s * 8.35, -0.24, 0, palette.edge);
    for (let p = 2.5; p < 9.8; p += 0.68)
      for (const line of [-0.035, 0.035]) {
        b(0.025, 0.006, 0.42, line, 0.306, s * p, palette.yellow);
        b(0.42, 0.006, 0.025, s * p, 0.306, line, palette.yellow);
      }
    for (let i = -5; i <= 5; i++) {
      b(0.12, 0.008, 0.38, i * 0.205, 0.307, s * 1.66, palette.white);
      b(0.38, 0.008, 0.12, s * 1.66, 0.307, i * 0.205, palette.white);
    }
    b(1.08, 0.009, 0.045, -s * 0.64, 0.308, s * 2, palette.white);
    b(0.045, 0.009, 1.08, s * 2, 0.308, s * 0.64, palette.white);
    for (const side of [-1, 1]) {
      const x = side * 3.48,
        z = s * 3.72,
        h = side === s ? 1.8 : 2.5;
      b(3.65, 0.12, 4.7, x, 0.34, s * 4.07, palette.curb);
      b(
        2.32,
        h,
        2.7,
        x,
        0.41 + h / 2,
        z,
        side === s ? palette.brick : palette.ivory,
      );
      b(2.5, 0.12, 2.88, x, h + 0.46, z, palette.trim);
      b(2.2, 0.06, 2.6, x, h + 0.54, z, palette.green);
      for (let floor = 0; floor < 3; floor++)
        for (let col = 0; col < 4; col++) {
          const y = 0.77 + (floor * (h - 0.5)) / 3;
          for (const face of [-1, 1]) {
            b(
              0.26,
              0.32,
              0.035,
              x - 0.83 + col * 0.55,
              y,
              z + face * 1.37,
              palette.glass,
            );
            b(
              0.035,
              0.32,
              0.29,
              x + face * 1.18,
              y,
              z - 1 + col * 0.66,
              palette.glass,
            );
          }
        }
      b(1.6, 0.1, 0.36, x, 0.96, z - s * 1.55, palette.green);
      b(0.6, 0.14, 0.45, x + side * 1.5, 0.48, z + s * 1.35, palette.green);
      mesh(
        new THREE.IcosahedronGeometry(0.34, 1),
        palette.leaves,
        x + side * 1.5,
        0.94,
        z + s * 1.35,
        block,
      );
    }
  }
  // Batch the new block independently so it can rise into place as one object.
  const groups = new Map();
  for (const child of [...block.children])
    if (child.geometry === unitBox) {
      if (!groups.has(child.material)) groups.set(child.material, []);
      groups.get(child.material).push(child.matrix.clone());
      block.remove(child);
    }
  for (const [material, matrices] of groups) {
    const batch = new THREE.InstancedMesh(unitBox, material, matrices.length);
    matrices.forEach((m, i) => batch.setMatrixAt(i, m));
    batch.castShadow = batch.receiveShadow = true;
    block.add(batch);
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
  function boatModel() {
    const group = new THREE.Group();
    city.add(group);
    box(0.54, 0.17, 1.15, 0, 0, 0, palette.ivory, group);
    box(0.47, 0.09, 1.04, 0, 0.12, 0, palette.white, group);
    box(0.38, 0.22, 0.48, 0, 0.25, -0.08, palette.glass, group);
    box(0.45, 0.045, 0.54, 0, 0.38, -0.08, palette.green, group);
    rod([0, 0.35, -0.3], [0, 0.79, -0.3], 0.015, palette.dark, group);
    box(0.23, 0.14, 0.025, 0.11, 0.7, -0.3, palette.brick, group);
    return group;
  }
  const boatTemplate = boatModel();
  city.remove(boatTemplate);
  const helicopter = new THREE.Group();
  city.add(helicopter);
  mesh(
    new THREE.SphereGeometry(0.5, 16, 10),
    palette.ivory,
    0,
    0,
    0,
    helicopter,
  ).scale.set(0.85, 0.8, 1.5);
  mesh(
    new THREE.SphereGeometry(0.39, 16, 10),
    palette.glass,
    0,
    0.04,
    0.38,
    helicopter,
  ).scale.set(0.9, 0.83, 1);
  rod([0, 0.05, -0.35], [0, 0.25, -1.95], 0.09, palette.green, helicopter);
  box(0.07, 0.65, 0.38, 0, 0.43, -1.86, palette.ivory, helicopter);
  for (const side of [-1, 1]) {
    box(0.018, 0.22, 0.07, side * 0.421, 0, -0.13, palette.brick, helicopter);
    box(0.02, 0.07, 0.24, side * 0.422, 0, -0.13, palette.brick, helicopter);
  }
  const rotor = new THREE.Group();
  rotor.position.y = 0.56;
  helicopter.add(rotor);
  box(3.1, 0.025, 0.085, 0, 0, 0, palette.dark, rotor);
  box(0.085, 0.025, 3.1, 0, 0, 0, palette.dark, rotor);
  for (const side of [-1, 1]) {
    rod(
      [side * 0.43, -0.5, -0.65],
      [side * 0.43, -0.5, 0.65],
      0.025,
      palette.dark,
      helicopter,
    );
    rod(
      [side * 0.3, -0.17, -0.35],
      [side * 0.43, -0.5, -0.35],
      0.025,
      palette.dark,
      helicopter,
    );
    rod(
      [side * 0.3, -0.17, 0.35],
      [side * 0.43, -0.5, 0.35],
      0.025,
      palette.dark,
      helicopter,
    );
  }
  const cable = mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 1, 6),
    palette.dark,
    0,
    -1,
    0,
    helicopter,
  );
  const hook = mesh(
    new THREE.TorusGeometry(0.12, 0.026, 6, 12, Math.PI * 1.7),
    palette.yellow,
    0,
    -1,
    0,
    helicopter,
  );
  let growth = 0;
  return {
    block,
    update(sim, dt) {
      const target = sim.level >= 2 ? 1 : 0;
      growth = target === 0 ? 0 : Math.min(1, growth + dt / 1.8);
      const eased = 1 - Math.pow(1 - growth, 3);
      block.visible = target > 0;
      block.position.y = -3 * (1 - eased);
      for (const { leaf, sign } of leaves)
        leaf.rotation.z = -sign * sim.bridge.lift * 1.15;
      for (const gate of gates)
        gate.rotation.x = (-Math.PI / 2) * (1 - (sim.bridge.gated ? 1 : 0));
      const live = new Set();
      for (const boat of sim.bridge.boats) {
        live.add(boat.id);
        if (!boatMeshes.has(boat.id)) {
          const model = boatTemplate.clone(true);
          city.add(model);
          boatMeshes.set(boat.id, model);
        }
        const group = boatMeshes.get(boat.id);
        group.position.set(
          boat.x,
          0.38 + Math.sin(sim.time * 1.8 + boat.id) * 0.025,
          boat.p * boat.direction,
        );
        group.rotation.y = boat.direction === 1 ? 0 : Math.PI;
      }
      for (const [id, group] of boatMeshes)
        if (!live.has(id)) {
          city.remove(group);
          boatMeshes.delete(id);
        }
      const rescue = sim.rescue.active;
      helicopter.visible = !!rescue;
      let cargo = null;
      if (rescue) {
        const t = rescue.elapsed,
          arrival = Math.min(1, t / 2),
          departure = Math.max(0, (t - 4.8) / 2.2);
        const dx = -15 * Math.pow(1 - arrival, 2) + departure * 19;
        const dz = -6 * (1 - arrival) + departure * 4;
        const rise = (1 - arrival) * 4 + departure * 6;
        helicopter.position.set(rescue.x + dx, 4.8 + rise, rescue.z + dz);
        helicopter.rotation.y = Math.PI / 2;
        rotor.rotation.y += dt * 42;
        const lower = Math.max(0, Math.min(1, (t - 2) / 1.5));
        const lift = Math.max(0, Math.min(1, (t - 3.5) / 1.3));
        const length = 0.55 + lower * 3.75 - lift * 3;
        cable.scale.y = length;
        cable.position.y = -length / 2;
        hook.position.y = -length;
        cargo = {
          id: rescue.id,
          dx: departure * 19,
          dz: departure * 4,
          y: lift * 3 + departure * 6,
        };
      }
      return { growth: eased, cargo };
    },
    clear() {
      growth = 0;
      helicopter.visible = false;
      for (const group of boatMeshes.values()) city.remove(group);
      boatMeshes.clear();
    },
  };
}
