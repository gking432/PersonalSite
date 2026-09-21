import * as THREE from "three";

// Shared by the original street blocks and the corner shop: identical footprint,
// cornice, windows, awning and roof. The shop differs only in its small sign.
export const NEIGHBORHOOD_BUILDING = {
  width: 2.32,
  depth: 2.7,
  height: 1.8,
  parcelWidth: 3.65,
  parcelDepth: 4.7,
};
export function neighborhoodBuilding(
  { box, mesh, palette },
  parent,
  {
    x,
    z,
    height = 1.8,
    front = 1,
    side = 1,
    ivory = false,
    parcel = true,
    planter = true,
  },
) {
  const b = (w, h, d, px, y, pz, mat) => box(w, h, d, px, y, pz, mat, parent);
  if (parcel) b(3.65, 0.12, 4.7, x, 0.34, z + front * 0.35, palette.curb);
  b(
    2.32,
    height,
    2.7,
    x,
    0.41 + height / 2,
    z,
    ivory ? palette.ivory : palette.brick,
  );
  b(2.5, 0.12, 2.88, x, height + 0.46, z, palette.trim);
  b(2.2, 0.06, 2.6, x, height + 0.54, z, palette.green);
  for (let floor = 0; floor < 3; floor++)
    for (let col = 0; col < 4; col++) {
      const y = 0.77 + (floor * (height - 0.5)) / 3;
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
  b(1.6, 0.1, 0.36, x, 0.96, z - front * 1.55, palette.green);
  if (!planter) return;
  b(0.6, 0.14, 0.45, x + side * 1.5, 0.48, z + front * 1.35, palette.green);
  mesh(
    new THREE.IcosahedronGeometry(0.34, 1),
    palette.leaves,
    x + side * 1.5,
    0.94,
    z + front * 1.35,
    parent,
  );
}
