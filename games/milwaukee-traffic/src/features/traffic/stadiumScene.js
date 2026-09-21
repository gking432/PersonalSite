import { createRiverScene } from "./riverScene.js";
import { neighborhoodBuilding } from "./neighborhoodBuilding.js";
import * as THREE from "three";
import {
  RAMP_CENTER,
  rampOffset,
  STADIUM_SCALE,
  FREEWAY_SUPPORTS,
  FIXED_BRIDGES,
} from "./districtLayout.js";
import { LOTS, parkingSpace } from "./stadiumDistrict.js";
import { JUNCTION_X, JUNCTION_Z } from "./cityChallenges.js";
export function createStadiumScene({
  city,
  palette,
  box,
  mesh,
  rod,
  label,
  unitBox,
  lampMaterials,
}) {
  const district = new THREE.Group();
  city.add(district);
  const neighborhood = new THREE.Group();
  city.add(neighborhood);
  createRiverScene({
    parent: neighborhood,
    palette,
    box,
    mesh,
    rod,
    minZ: -20,
    bridges: [FIXED_BRIDGES[0]],
  });
  createRiverScene({
    parent: district,
    palette,
    box,
    mesh,
    rod,
    maxZ: -20,
    bridges: [FIXED_BRIDGES[1]],
  });
  const stadium = new THREE.Group();
  stadium.position.set(-15, 0.16, -26);
  stadium.scale.set(STADIUM_SCALE, 0.6, STADIUM_SCALE);
  district.add(stadium);
  const b = (w, h, d, x, y, z, mat, parent = stadium, ry = 0) =>
    box(w, h, d, x, y, z, mat, parent, ry);
  // One terrain unit contains both the ballpark and its perimeter parking.
  b(14.4, 0.34, 13.8, -15, -0.05, -26, palette.base, district);
  b(14.5, 0.07, 13.9, -15, -0.24, -26, palette.edge, district);
  b(14.25, 0.12, 13.65, -15, 0.18, -26, palette.pavement, district);
  mesh(
    new THREE.CylinderGeometry(6.8, 6.8, 0.08, 64),
    palette.leaves,
    0,
    0.33,
    0,
    stadium,
  );
  mesh(
    new THREE.CylinderGeometry(5.9, 5.9, 0.02, 64),
    palette.leaves,
    0,
    0.38,
    -0.2,
    stadium,
  );
  b(3.6, 0.025, 3.6, 0, 0.4, 2.6, palette.terra, stadium, Math.PI / 4);
  b(2.35, 0.03, 2.35, 0, 0.42, 2.6, palette.leaves, stadium, Math.PI / 4);
  for (const [x, z] of [
    [0, 5.15],
    [-2.55, 2.6],
    [0, 0.05],
    [2.55, 2.6],
  ])
    b(0.19, 0.035, 0.19, x, 0.45, z, palette.white, stadium, Math.PI / 4);
  for (const sign of [-1, 1])
    rod(
      [0, 0.44, 5.15],
      [sign * 5.7, 0.44, -0.55],
      0.025,
      palette.white,
      stadium,
    );
  for (let band = 0; band < 5; band++) {
    const seating = mesh(
      new THREE.TorusGeometry(6.5 + band * 0.42, 0.22, 4, 64, Math.PI * 1.6),
      band % 2 ? palette.ivory : palette.green,
      0,
      0.6 + band * 0.34,
      0,
      stadium,
    );
    seating.rotation.set(Math.PI / 2, 0, Math.PI * 0.2);
  }
  for (let i = 0; i < 26; i++) {
    const angle = Math.PI * 0.15 + (i / 25) * Math.PI * 1.7;
    const x = Math.cos(angle) * 8.7,
      z = Math.sin(angle) * 8.7;
    b(1.45, 2.1, 0.4, x, 1.35, z, palette.brick, stadium, -angle + Math.PI / 2);
    b(
      0.48,
      1.1,
      0.43,
      x,
      1.45,
      z,
      palette.glass,
      stadium,
      -angle + Math.PI / 2,
    );
    b(1.5, 0.2, 0.55, x, 2.5, z, palette.trim, stadium, -angle + Math.PI / 2);
  }
  // A ribbed arched roof leaves the field exposed like the miniature's opening fan roof.
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI,
      c = ((i + 1) / 18) * Math.PI;
    const x1 = Math.cos(a) * 8.6,
      x2 = Math.cos(c) * 8.6,
      y1 = 2.6 + Math.sin(a) * 3.1,
      y2 = 2.6 + Math.sin(c) * 3.1;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          x1,
          y1,
          -6,
          x2,
          y2,
          -6,
          x2,
          y2,
          -1.5,
          x1,
          y1,
          -6,
          x2,
          y2,
          -1.5,
          x1,
          y1,
          -1.5,
        ],
        3,
      ),
    );
    geometry.computeVertexNormals();
    mesh(geometry, palette.green, 0, 0, 0, stadium);
    rod([x1, y1, -6], [x1, y1, -1.5], 0.045, palette.trim, stadium);
  }
  label("MILLER PARK", 7.2, 0.7, 0, 2.7, 8.8, { parent: stadium, size: 82 });
  const lights = [];
  for (const x of [-7.5, 7.5])
    for (const z of [-6.5, 6.5]) {
      rod([x, 0.3, z], [x, 5.6, z], 0.08, palette.dark, stadium);
      for (let i = 0; i < 3; i++)
        lights.push(
          b(0.35, 0.25, 0.15, x - 0.45 + i * 0.45, 5.7, z, lampMaterials.off),
        );
    }
  // Asphalt surrounds the stadium instead of occupying a second unit.
  for (const [x, z, w, d] of [
    [-15, -20.25, 14.2, 2.1],
    [-15, -31.75, 14.2, 2.1],
    [-20.95, -26, 2.3, 9.4],
    [-9.05, -26, 2.3, 9.4],
  ])
    b(w, 0.035, d, x, 0.28, z, palette.asphalt, district);
  b(1.65, 0.035, 1.8, -15, 0.28, -19.6, palette.asphalt, district);
  // One normal building plot: shop at the back, three spaces at the front.
  const beforeNeighborhood = new Set(district.children);
  b(3.65, 0.12, 4.7, -3.48, 0.34, -17.07, palette.curb, district);
  b(3.5, 0.025, 1.2, -3.48, 0.407, -15.4, palette.asphalt, district);
  b(0.95, 0.035, 1.5, -2.5, 0.28, -14.2, palette.asphalt, district);
  for (const [lot, data] of Object.entries(LOTS)) {
    const beforeParking = new Set(district.children);
    for (let i = 0; i < data.capacity; i++) {
      const p = parkingSpace(lot, i),
        horizontal = lot === "stadium" && Math.floor(i / 6) % 2 === 1;
      for (const side of [-1, 1])
        b(
          horizontal ? 1.05 : 0.025,
          0.008,
          horizontal ? 0.025 : 1.05,
          p.x + (horizontal ? 0 : side * 0.44),
          lot === "shop" ? 0.425 : 0.307,
          p.z + (horizontal ? side * 0.52 : 0),
          palette.white,
          district,
        );
    }
    if (lot === "stadium")
      for (const child of district.children)
        if (!beforeParking.has(child)) beforeNeighborhood.add(child);
  }
  neighborhoodBuilding({ box, mesh, palette }, district, {
    x: -3.48,
    z: -17.6,
    height: 1.8,
    front: -1,
    side: -1,
    parcel: false,
    planter: false,
  });
  label("CORNER SHOP", 1.45, 0.17, -3.48, 1.14, -16.21, {
    parent: district,
    size: 64,
  });

  // Two small building plots, measured against the original 3.65 × 4.7 curb.
  // The hall closes just this street arm, creating East Market's T junction.
  b(7.3, 0.12, 4.7, 11, 0.34, -17.07, palette.curb, district);
  b(6.3, 1.8, 2.7, 11, 1.31, -16.72, palette.ivory, district);
  b(6.5, 0.12, 2.88, 11, 2.26, -16.72, palette.trim, district);
  b(6.2, 0.06, 2.6, 11, 2.34, -16.72, palette.green, district);
  for (let col = 0; col < 10; col++)
    for (let floor = 0; floor < 3; floor++)
      for (const side of [-1, 1])
        b(
          0.3,
          0.32,
          0.035,
          8.4 + col * 0.58,
          0.77 + floor * 0.44,
          -16.72 + side * 1.37,
          palette.glass,
          district,
        );
  b(1.3, 0.1, 0.36, 11, 0.96, -15.17, palette.green, district);
  b(0.8, 0.7, 0.05, 11, 0.79, -15.33, palette.glass, district);
  label("PUBLIC MARKET", 2.4, 0.2, 11, 1.7, -15.32, {
    parent: district,
    size: 64,
  });
  for (const child of [...district.children])
    if (!beforeNeighborhood.has(child)) neighborhood.add(child);
  function tree(x, z) {
    b(0.12, 0.65, 0.12, x, 0.67, z, palette.dark, district);
    mesh(
      new THREE.IcosahedronGeometry(0.48, 1),
      palette.leaves2,
      x,
      1.19,
      z,
      district,
    );
    b(0.95, 0.09, 0.95, x, 0.32, z, palette.leaves, district);
  }
  function bench(x, z) {
    b(0.95, 0.1, 0.3, x, 0.58, z, palette.terra, district);
    b(0.95, 0.35, 0.06, x, 0.8, z + 0.12, palette.terra, district);
    for (const dx of [-0.35, 0.35])
      b(0.08, 0.22, 0.22, x + dx, 0.43, z, palette.dark, district);
  }
  // A compact pedestrian square fills the space behind the two-plot hall.
  b(7.3, 0.12, 4.7, 11, 0.34, -21.4, palette.curb, district);
  for (const [x, z] of [
    [8.1, -20],
    [13.9, -20],
    [8.1, -23],
    [13.9, -23],
    [-21.4, -32.2],
    [-8.6, -32.2],
    [-21.4, -19.8],
    [-8.6, -19.8],
  ])
    tree(x, z);
  for (const [x, z] of [
    [9.6, -23],
    [12.4, -23],
    [8.2, -21.4],
    [13.8, -21.4],
  ])
    bench(x, z);
  mesh(
    new THREE.CylinderGeometry(0.9, 0.95, 0.18, 32),
    palette.curb,
    11,
    0.48,
    -21.3,
    district,
  );
  mesh(
    new THREE.CylinderGeometry(0.76, 0.76, 0.06, 32),
    palette.water,
    11,
    0.59,
    -21.3,
    district,
  );
  mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 0.42, 16),
    palette.trim,
    11,
    0.8,
    -21.3,
    district,
  );
  for (const [x, z] of [
    [7, -17],
    [15, -17],
    [7, -21.4],
    [15, -21.4],
  ]) {
    rod([x, 0.3, z], [x, 1.9, z], 0.035, palette.dark, district);
    b(0.27, 0.15, 0.27, x, 1.98, z, lampMaterials.amber, district);
  }
  // The only freeway geometry is this raised ramp. Rendering and car motion
  // share the side-ramp path, which only rises after leaving the surface lanes.
  const vertices = [];
  for (let i = 0; i < RAMP_CENTER.length - 1; i++) {
    const a = rampOffset(i, -1.15),
      b = rampOffset(i, 1.15),
      c = rampOffset(i + 1, -1.15),
      d = rampOffset(i + 1, 1.15);
    for (const p of [a, b, c, b, d, c]) vertices.push(p.x, p.y + 0.305, p.z);
    for (const side of [-1, 1]) {
      const u = rampOffset(i, side * 1.08),
        v = rampOffset(i + 1, side * 1.08);
      rod(
        [u.x, u.y + 0.43, u.z],
        [v.x, v.y + 0.43, v.z],
        0.07,
        palette.curb,
        district,
      );
    }
    if (i % 3 === 0) {
      const u = RAMP_CENTER[i],
        v = RAMP_CENTER[i + 1];
      rod(
        [u.x, u.y + 0.325, u.z],
        [v.x, v.y + 0.325, v.z],
        0.02,
        palette.yellow,
        district,
      );
    }
  }
  const deck = new THREE.BufferGeometry();
  deck.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  deck.computeVertexNormals();
  mesh(deck, palette.asphalt, 0, 0, 0, district);
  // The overpass has clear road space below it: no columns in either lane.
  for (const p of FREEWAY_SUPPORTS) {
    for (const side of [-1, 1])
      b(
        0.25,
        p.y,
        0.28,
        p.x + side * 1.5,
        p.y / 2 + 0.16,
        p.z,
        palette.curb,
        district,
      );
    b(3.25, 0.16, 0.45, p.x, p.y + 0.18, p.z, palette.base, district);
  }
  // Ground-level apron under the short slip road, beyond the ordinary curb.
  for (let i = 0; i < 33; i += 2) {
    const p = RAMP_CENTER[i];
    b(1.0, 0.34, 1.0, p.x, -0.05, p.z, palette.base, district);
  }
  label("I–94 →", 1.5, 0.36, 16.1, 1.05, -12.25, {
    parent: district,
    size: 64,
  });
  for (const x of [-17, -13])
    rod([x, 0.3, -19.6], [x, 1.5, -19.6], 0.045, palette.dark, district);
  const sign = label("FIRST PITCH", 3.6, 0.5, -15, 1.3, -19.6, {
    parent: district,
    size: 68,
  });
  let lastSign = "";
  const roundabout = new THREE.Group();
  city.add(roundabout);
  mesh(
    new THREE.CylinderGeometry(2.12, 2.12, 0.02, 48),
    palette.asphalt,
    0,
    0.325,
    0,
    roundabout,
  );
  mesh(
    new THREE.CylinderGeometry(0.9, 0.95, 0.16, 40),
    palette.curb,
    0,
    0.4,
    0,
    roundabout,
  );
  mesh(
    new THREE.CylinderGeometry(0.79, 0.8, 0.12, 32),
    palette.leaves,
    0,
    0.51,
    0,
    roundabout,
  );
  mesh(
    new THREE.IcosahedronGeometry(0.4, 1),
    palette.leaves2,
    0,
    0.86,
    0,
    roundabout,
  );
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    b(
      0.18,
      0.012,
      0.04,
      Math.cos(a) * 1.06,
      0.346,
      Math.sin(a) * 1.06,
      palette.white,
      roundabout,
      -a,
    );
  }
  // Batch the static stadium and district details; the lamps/sign remain mutable.
  for (const parent of [stadium, district, neighborhood]) {
    const groups = new Map();
    for (const child of [...parent.children])
      if (child.geometry === unitBox && !lights.includes(child)) {
        if (!groups.has(child.material)) groups.set(child.material, []);
        groups.get(child.material).push(child.matrix.clone());
        parent.remove(child);
      }
    for (const [mat, matrices] of groups) {
      const batch = new THREE.InstancedMesh(unitBox, mat, matrices.length);
      matrices.forEach((m, i) => batch.setMatrixAt(i, m));
      batch.castShadow = batch.receiveShadow = true;
      parent.add(batch);
    }
  }
  return {
    update(sim, growth, neighborhoodGrowth) {
      neighborhood.visible = sim.neighborhoodReady;
      neighborhood.position.y = -4 * (1 - neighborhoodGrowth);
      district.visible = sim.districtReady;
      district.position.y = -4 * (1 - growth);
      lights.forEach((l) => {
        l.material =
          sim.district.phase === "arrivals"
            ? lampMaterials.off
            : lampMaterials.amber;
      });
      roundabout.visible = sim.roundabout !== null;
      if (roundabout.visible)
        roundabout.position.set(
          JUNCTION_X[sim.roundabout],
          0,
          JUNCTION_Z[sim.roundabout],
        );
      const state = sim.district.snapshot();
      const message =
        state.phase === "arrivals"
          ? `FIRST PITCH · ${state.remaining}s`
          : state.phase === "game"
            ? `GAME ON · ${state.remaining}s`
            : `EXIT RUSH · ${state.remaining}s`;
      if (message !== lastSign) {
        lastSign = message;
        const canvas = sign.material.map.image,
          ctx = canvas.getContext("2d");
        ctx.fillStyle = "#315548";
        ctx.fillRect(0, 0, 768, 192);
        ctx.fillStyle = "#eee4ca";
        ctx.font = "600 60px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(message, 384, 100);
        sign.material.map.needsUpdate = true;
      }
    },
  };
}
