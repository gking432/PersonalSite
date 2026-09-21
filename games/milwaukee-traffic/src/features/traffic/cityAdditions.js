import { RIVER, FIXED_BRIDGES, roadElevation } from "./districtLayout.js";
import { neighborhoodBuilding } from "./neighborhoodBuilding.js";
import * as THREE from "three";
import {
  JUNCTION_X,
  JUNCTION_Z,
  JUNCTION_APPROACHES,
  roadReach,
} from "./cityChallenges";

export function createCityAdditions({
  city,
  palette,
  box,
  mesh,
  cylinder,
  rod,
  unitBox,
  lampMaterials,
}) {
  function makeBlock(junction) {
    const block = new THREE.Group();
    city.add(block);
    block.position.set(JUNCTION_X[junction], 0, JUNCTION_Z[junction]);
    const bridge = FIXED_BRIDGES.find((b) => b.z === JUNCTION_Z[junction]);
    const b = (w, h, d, x, y, z, mat) => {
      // Carve the river out of terrain layers; water must not be painted over land.
      const worldX = x + JUNCTION_X[junction],
        min = worldX - w / 2,
        max = worldX + w / 2;
      const shoreLeft = RIVER.x - RIVER.width / 2,
        shoreRight = RIVER.x + RIVER.width / 2;
      if (
        y <= 0.18 &&
        [palette.base, palette.edge, palette.pavement].includes(mat) &&
        max > shoreLeft &&
        min < shoreRight
      ) {
        for (const [a, c] of [
          [min, Math.min(max, shoreLeft)],
          [Math.max(min, shoreRight), max],
        ])
          if (c > a)
            box(
              c - a,
              h,
              d,
              (a + c) / 2 - JUNCTION_X[junction],
              y,
              z,
              mat,
              block,
            );
      } else box(w, h, d, x, y, z, mat, block);
    };
    b(14.4, 0.34, 13.8, 0, -0.05, 0, palette.base);
    b(14.5, 0.07, 13.9, 0, -0.24, 0, palette.edge);
    b(14.25, 0.12, 13.65, 0, 0.18, 0, palette.pavement);
    const approaches = JUNCTION_APPROACHES[junction];
    b(2.75, 0.045, 2.75, 0, 0.28, 0, palette.asphalt);
    for (const approach of approaches) {
      const vertical = approach % 2 === 0;
      const sign = approach === 0 || approach === 3 ? -1 : 1;
      const reach = roadReach(junction, approach);
      const center = (sign * (reach + 1.375)) / 2;
      const length = reach - 1.375;
      if (!vertical && bridge) {
        const min = JUNCTION_X[junction] + center - length / 2,
          max = min + length;
        for (const [a, c] of [
          [min, Math.min(max, bridge.minX)],
          [Math.max(min, bridge.maxX), max],
        ])
          if (c > a)
            b(
              c - a,
              0.045,
              2.75,
              (a + c) / 2 - JUNCTION_X[junction],
              0.28,
              0,
              palette.asphalt,
            );
      } else
        b(
          vertical ? 2.75 : length,
          0.045,
          vertical ? length : 2.75,
          vertical ? 0 : center,
          0.28,
          vertical ? center : 0,
          palette.asphalt,
        );
      if (reach > 6.85) {
        const endLength = reach - 6.7,
          endCenter = (sign * (reach + 6.7)) / 2;
        b(
          vertical ? 2.95 : endLength,
          0.34,
          vertical ? endLength : 2.95,
          vertical ? 0 : endCenter,
          -0.05,
          vertical ? endCenter : 0,
          palette.base,
        );
        b(
          vertical ? 3.04 : endLength + 0.06,
          0.07,
          vertical ? endLength + 0.06 : 3.04,
          vertical ? 0 : endCenter,
          -0.24,
          vertical ? endCenter : 0,
          palette.edge,
        );
      }
      for (let p = 2.5; p < reach - 0.2; p += 0.68)
        for (const line of [-0.035, 0.035]) {
          if (
            !vertical &&
            bridge &&
            JUNCTION_X[junction] + sign * p > bridge.minX &&
            JUNCTION_X[junction] + sign * p < bridge.maxX
          )
            continue;
          b(
            vertical ? 0.025 : 0.42,
            0.006,
            vertical ? 0.42 : 0.025,
            vertical ? line : sign * p,
            0.306,
            vertical ? sign * p : line,
            palette.yellow,
          );
        }
      for (let i = -5; i <= 5; i++)
        b(
          vertical ? 0.12 : 0.38,
          0.008,
          vertical ? 0.38 : 0.12,
          vertical ? i * 0.205 : sign * 1.66,
          0.307,
          vertical ? sign * 1.66 : i * 0.205,
          palette.white,
        );
      b(
        vertical ? 1.08 : 0.045,
        0.009,
        vertical ? 0.045 : 1.08,
        vertical ? -sign * 0.64 : sign * 2,
        0.308,
        vertical ? sign * 2 : sign * 0.64,
        palette.white,
      );
    }
    for (const s of [-1, 1]) {
      const closed = !approaches.includes(s < 0 ? 0 : 2);
      if (closed) b(14.25, 0.14, 0.2, 0, 0.34, s * 1.5, palette.curb);
      for (const side of [-1, 1]) {
        if (closed || (junction === 4 && s === -1 && side === -1)) continue;
        neighborhoodBuilding({ box, mesh, palette }, block, {
          x: side * 3.48,
          z: s * 3.72,
          height: side === s ? 1.8 : 2.5,
          front: s,
          side,
          ivory: side !== s,
        });
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

    return block;
  }
  const block = makeBlock(1),
    westBlock = makeBlock(2);
  const northBlocks = JUNCTION_X.slice(3).map((_, i) => makeBlock(i + 3));
  const blocks = [city, block, westBlock, ...northBlocks];
  // The west riverwalk is already inhabited before its intersection unlocks.
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
  const towTruck = new THREE.Group();
  city.add(towTruck);
  box(0.43, 0.18, 1.05, 0, 0.47, 0, palette.yellow, towTruck);
  box(0.38, 0.25, 0.42, 0, 0.66, 0.26, palette.glass, towTruck);
  box(0.43, 0.045, 0.48, 0, 0.8, 0.26, palette.yellow, towTruck);
  box(0.43, 0.045, 0.59, 0, 0.59, -0.28, palette.dark, towTruck);
  rod([0, 0.6, -0.1], [0, 1.05, -0.62], 0.04, palette.yellow, towTruck);
  rod([0, 1.05, -0.62], [0, 0.55, -0.72], 0.015, palette.dark, towTruck);
  const towLamps = [];
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      const wheel = mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.07, 10),
        palette.black,
        side * 0.23,
        0.375,
        end * 0.33,
        towTruck,
      );
      wheel.rotation.z = Math.PI / 2;
    }
    towLamps.push(
      box(
        0.15,
        0.08,
        0.12,
        side * 0.12,
        0.87,
        0.2,
        lampMaterials.amber,
        towTruck,
      ),
    );
    box(0.08, 0.04, 0.025, side * 0.13, 0.54, 0.54, palette.white, towTruck);
  }
  const recovered = new THREE.Group();
  towTruck.add(recovered);
  box(0.36, 0.16, 0.7, 0, 0.48, -1.05, palette.brick, recovered);
  box(0.3, 0.14, 0.32, 0, 0.63, -1.05, palette.glass, recovered);
  for (const side of [-1, 1])
    for (const end of [-1, 1]) {
      const wheel = mesh(
        new THREE.CylinderGeometry(0.095, 0.095, 0.05, 8),
        palette.black,
        side * 0.19,
        0.38,
        -1.05 + end * 0.23,
        recovered,
      );
      wheel.rotation.z = Math.PI / 2;
    }
  let growth = 0,
    westGrowth = 0,
    neighborhoodGrowth = 0,
    districtGrowth = 0;

  return {
    block,
    westBlock,
    blocks,
    update(sim, dt) {
      neighborhoodGrowth = sim.neighborhoodReady
        ? Math.min(1, neighborhoodGrowth + dt / 2.4)
        : 0;
      const neighborhoodEased = 1 - Math.pow(1 - neighborhoodGrowth, 3);
      districtGrowth = sim.districtReady
        ? Math.min(1, districtGrowth + dt / 2.4)
        : 0;
      const districtEased = 1 - Math.pow(1 - districtGrowth, 3);
      northBlocks.forEach((b, i) => {
        b.visible = i < 3 ? sim.neighborhoodReady : sim.districtReady;
        b.position.y = -4 * (1 - (i < 3 ? neighborhoodEased : districtEased));
      });
      const westTarget = sim.level >= 5;
      westGrowth = westTarget ? Math.min(1, westGrowth + dt / 1.8) : 0;
      const westEased = 1 - Math.pow(1 - westGrowth, 3);
      westBlock.visible = westTarget;
      westBlock.position.y = -3 * (1 - westEased);
      const tow = sim.tow.active;
      towTruck.visible = !!tow;
      if (tow) {
        const road = sim.neighborhoodReady
          ? roadElevation(tow.x, tow.z, tow.yaw)
          : { y: 0, pitch: 0 };
        towTruck.position.set(tow.x, road.y, tow.z);
        towTruck.rotation.set(-road.pitch, tow.yaw, 0, "YXZ");
        towLamps.forEach((lamp, i) => {
          lamp.visible = Math.floor(sim.time * 9) % 2 === i;
        });
        recovered.visible = tow.loaded;
      }
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
      return {
        growth: eased,
        westGrowth: westEased,
        neighborhoodGrowth: neighborhoodEased,
        districtGrowth: districtEased,
        cargo,
      };
    },
    clear() {
      growth = westGrowth = neighborhoodGrowth = districtGrowth = 0;
      towTruck.visible = false;
      helicopter.visible = false;
      for (const group of boatMeshes.values()) city.remove(group);
      boatMeshes.clear();
    },
  };
}
