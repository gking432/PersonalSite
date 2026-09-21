import * as THREE from "three";
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
  stadium.position.set(-39, 0, -13);
  district.add(stadium);
  const b = (w, h, d, x, y, z, mat, parent = stadium, ry = 0) =>
    box(w, h, d, x, y, z, mat, parent, ry);
  b(22, 0.34, 22, 0, -0.05, 0, palette.base);
  b(22.1, 0.07, 22.1, 0, -0.24, 0, palette.edge);
  b(21.7, 0.12, 21.7, 0, 0.18, 0, palette.pavement);
  const turf = mesh(
    new THREE.CylinderGeometry(6.8, 6.8, 0.08, 64),
    palette.leaves,
    0,
    0.33,
    0,
    stadium,
  );
  const outfield = mesh(
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
        ? { x: -27.7, z: -13.3, w: 5.4, d: 12.5 }
        : { x: 23.8, z: -14, w: 6.5, d: 7.5 };
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
          1.1,
          0.008,
          0.025,
          p.x,
          0.307,
          p.z + side * 0.39,
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
  // Small corner shop with a canopy and six working spaces.
  b(4, 1.6, 2.8, 23.8, 1.1, -19.3, palette.brick, district);
  b(4.2, 0.16, 3, 23.8, 1.95, -19.3, palette.trim, district);
  b(3.4, 0.7, 0.035, 23.8, 0.9, -17.88, palette.glass, district);
  b(3.7, 0.13, 0.9, 23.8, 1.55, -17.55, palette.green, district);
  label("CORNER MARKET", 3, 0.36, 23.8, 1.78, -17.77, {
    parent: district,
    size: 58,
  });
  // Divided freeway, connected exit/entrance ramps, and an overhead wave sign.
  b(66, 0.32, 3.5, -10.5, 0.02, -25.85, palette.base, district);
  b(66, 0.04, 3.2, -10.5, 0.29, -25.85, palette.asphalt, district);
  b(66, 0.15, 0.15, -10.5, 0.42, -25.85, palette.curb, district);
  for (let x = -43; x < 22; x += 1.4)
    for (const z of [-26.8, -24.9])
      b(0.7, 0.01, 0.04, x, 0.318, z, palette.white, district);
  for (const [x, z, angle] of [
    [-18, -25.2, -0.35],
    [-15.5, -23.65, -1.4],
    [-12.4, -24.1, 0.38],
  ])
    b(5.4, 0.06, 1.3, x, 0.3, z, palette.asphalt, district, angle);
  for (const x of [-24, -18])
    rod([x, 0.3, -26], [x, 3.3, -26], 0.06, palette.dark, district);
  rod([-24, 3.3, -26], [-18, 3.3, -26], 0.06, palette.dark, district);
  const sign = label("STADIUM EXIT", 5.5, 0.85, -21, 3, -25.85, {
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
      district.visible = sim.level >= 9;
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
