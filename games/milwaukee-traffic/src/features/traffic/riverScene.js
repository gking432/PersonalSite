import * as THREE from "three";
import { RIVER, FIXED_BRIDGES, bridgeHeight } from "./districtLayout.js";

export function createRiverScene({ parent, palette, box, mesh, rod }) {
  const b = (w, h, d, x, y, z, mat) => box(w, h, d, x, y, z, mat, parent);
  // Meet the original river exactly; both ends now reach the expanded map edge.
  for (const [start, end] of [
    [RIVER.minZ, -6.75],
    [6.75, RIVER.maxZ],
  ]) {
    b(
      RIVER.width,
      0.22,
      end - start,
      RIVER.x,
      0.08,
      (start + end) / 2,
      palette.base,
    );
    b(
      RIVER.width,
      0.04,
      end - start,
      RIVER.x,
      0.255,
      (start + end) / 2,
      palette.water,
    );
    for (const side of [-1, 1]) {
      const x = RIVER.x + side * (RIVER.width / 2 + 0.055);
      b(0.11, 0.17, end - start, x, 0.3, (start + end) / 2, palette.curb);
    }
    for (let z = start + 0.5; z < end - 0.3; z += 1.8)
      for (let i = 0; i < 3; i++)
        b(
          0.2 + i * 0.1,
          0.005,
          0.015,
          RIVER.x - 0.4 + i * 0.22,
          0.282,
          z + i * 0.13,
          palette.edge,
        );
  }
  for (const bridge of FIXED_BRIDGES) {
    const vertices = [],
      sides = [];
    const point = (x, z, offset = 0) => [
      x,
      0.305 + bridgeHeight(x, bridge) + offset,
      z,
    ];
    const tri = (target, a, b, c) => target.push(...a, ...b, ...c);
    for (let i = 0; i < 80; i++) {
      const x = bridge.minX + ((bridge.maxX - bridge.minX) * i) / 80;
      const next = bridge.minX + ((bridge.maxX - bridge.minX) * (i + 1)) / 80;
      const a = point(x, bridge.z - 1.375),
        c = point(next, bridge.z - 1.375),
        d = point(next, bridge.z + 1.375),
        e = point(x, bridge.z + 1.375);
      tri(vertices, a, e, c);
      tri(vertices, e, d, c);
      for (const side of [-1, 1]) {
        const u = point(x, bridge.z + side * 1.375),
          v = point(next, bridge.z + side * 1.375),
          lowU = point(x, bridge.z + side * 1.375, -0.14),
          lowV = point(next, bridge.z + side * 1.375, -0.14);
        tri(sides, u, lowU, v);
        tri(sides, v, lowU, lowV);
        rod(
          point(x, bridge.z + side * 1.43, 0.04),
          point(next, bridge.z + side * 1.43, 0.04),
          0.07,
          palette.curb,
          parent,
        );
        rod(
          point(x, bridge.z + side * 1.43, 0.35),
          point(next, bridge.z + side * 1.43, 0.35),
          0.023,
          palette.dark,
          parent,
        );
        if (i % 6 === 0)
          rod(
            point(x, bridge.z + side * 1.43, 0.04),
            point(x, bridge.z + side * 1.43, 0.35),
            0.017,
            palette.dark,
            parent,
          );
      }
      if (i % 8 < 4)
        for (const dz of [-0.035, 0.035])
          rod(
            point(x, bridge.z + dz, 0.009),
            point(next, bridge.z + dz, 0.009),
            0.013,
            palette.yellow,
            parent,
          );
    }
    for (const [points, mat] of [
      [vertices, palette.asphalt],
      [sides, palette.base],
    ]) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(points, 3),
      );
      geometry.computeVertexNormals();
      mesh(geometry, mat, 0, 0, 0, parent);
    }
    // Abutments stand on the banks, leaving the entire water channel open.
    for (const x of [RIVER.x - 1.1, RIVER.x + 1.1])
      for (const side of [-1, 1])
        b(0.22, 1.4, 0.25, x, 0.86, bridge.z + side * 1.23, palette.curb);
  }
}
