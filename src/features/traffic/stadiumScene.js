import * as THREE from "three";
import { RAMP_CENTER, rampOffset } from "./districtLayout.js";
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
  const stadium = new THREE.Group();
  stadium.position.set(-8, 0, -22);
  stadium.scale.set(1.1, 1, 1.05);
  district.add(stadium);
  const b = (w, h, d, x, y, z, mat, parent = stadium, ry = 0) =>
    box(w, h, d, x, y, z, mat, parent, ry);
  // A single 2×2 footprint replaces four terrain cells, within the old grid.
  b(27.7, 0.34, 26, -8.35, -0.05, -19.9, palette.base, district);
  b(27.7, 0.07, 26, -8.35, -0.24, -19.9, palette.edge, district);
  b(27.5, 0.12, 25.8, -8.35, 0.18, -19.9, palette.pavement, district);
  // The shop is one ordinary-sized cell, sharing the adjoining street block.
  b(12.7, 0.34, 13.8, 11.85, -0.05, -26, palette.base, district);
  b(12.7, 0.07, 13.9, 11.85, -0.24, -26, palette.edge, district);
  b(12.5, 0.12, 13.65, 11.85, 0.18, -26, palette.pavement, district);
  b(2.75, 0.045, 4.5, 11, 0.28, -21.2, palette.asphalt, district);
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
    palette.green,
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
  for (const [lot, data] of Object.entries(LOTS)) {
    const center =
      lot === "stadium"
        ? { x: -10.65, z: -9.1, w: 23.1, d: 3.9 }
        : { x: 11, z: -24.9, w: 8.1, d: 4.2 };
    b(center.w, 0.3, center.d, center.x, 0, center.z, palette.base, district);
    b(
      center.w - 0.1,
      0.035,
      center.d - 0.1,
      center.x,
      0.28,
      center.z,
      palette.asphalt,
      district,
    );
    for (let i = 0; i < data.capacity; i++) {
      const p = parkingSpace(lot, i);
      for (const side of [-1, 1])
        b(
          0.025,
          0.008,
          0.95,
          p.x + side * 0.65,
          0.307,
          p.z,
          palette.white,
          district,
        );
    }
    label(
      lot === "stadium" ? "P · BALLPARK" : "P · MARKET",
      lot === "stadium" ? 3.2 : 2.5,
      0.3,
      center.x,
      0.33,
      center.z + center.d / 2 - 0.5,
      { parent: district, floor: true, size: 60 },
    );
  }
  // One shop and its six-space lot, on the same foundation as the other cells.
  b(6.2, 1.7, 3.1, 12, 1.2, -30.1, palette.brick, district);
  b(6.4, 0.16, 3.3, 12, 2.1, -30.1, palette.trim, district);
  b(5.5, 0.8, 0.035, 12, 1.05, -28.53, palette.glass, district);
  b(5.8, 0.13, 0.9, 12, 1.65, -28.2, palette.green, district);
  label("CORNER MARKET", 4.5, 0.43, 12, 1.88, -28.1, {
    parent: district,
    size: 58,
  });
  for (const [x, z] of [
    [16.5, -30.5],
    [16.5, -23],
    [-20, -29],
    [3, -29],
  ]) {
    b(0.14, 0.9, 0.14, x, 0.8, z, palette.dark, district);
    mesh(
      new THREE.IcosahedronGeometry(0.65, 1),
      palette.leaves2,
      x,
      1.5,
      z,
      district,
    );
  }
  // The only freeway geometry is this raised ramp. Rendering and car motion
  // share the sampled curve so vehicles stay on the deck through the climb.
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
  for (const i of [32, 49, 60, 69]) {
    const p = RAMP_CENTER[i];
    b(0.35, p.y, 0.5, p.x, p.y / 2 + 0.16, p.z, palette.curb, district);
    b(2.1, 0.15, 0.55, p.x, p.y + 0.18, p.z, palette.base, district);
  }
  label("I–94 ↗", 1.9, 0.48, 16.5, 1.4, -12.7, { parent: district, size: 64 });
  for (const x of [-3.7, 1.7])
    rod([x, 0.3, -12], [x, 2.6, -12], 0.06, palette.dark, district);
  const sign = label("FIRST PITCH", 5.5, 0.85, -1, 2.3, -12, {
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
  for (const parent of [stadium, district]) {
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
    update(sim, growth) {
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
