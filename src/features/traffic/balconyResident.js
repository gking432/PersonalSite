import * as THREE from "three";
import { BALCONY_RESIDENT } from "./balconyDefinition.js";
export function createBalconyResident({
  city,
  palette: p,
  box,
  mesh,
  rod,
  cylinder,
  material,
}) {
  const balcony = new THREE.Group();
  balcony.position.set(6.5, 2.35, -12.55);
  balcony.rotation.y = Math.PI;
  city.add(balcony);
  box(1.8, 0.09, 1.15, 0, 0, 0.42, p.trim, balcony);
  rod([-0.78, -0.42, 0], [-0.78, -0.04, 0.8], 0.025, p.dark, balcony);
  rod([0.78, -0.42, 0], [0.78, -0.04, 0.8], 0.025, p.dark, balcony);
  for (const x of [-0.84, 0.84])
    rod([x, 0.05, -0.12], [x, 0.05, 0.96], 0.018, p.dark, balcony);
  rod([-0.84, 0.45, 0.96], [0.84, 0.45, 0.96], 0.023, p.dark, balcony);
  for (let x = -0.84; x <= 0.85; x += 0.21)
    rod([x, 0.02, 0.96], [x, 0.45, 0.96], 0.014, p.dark, balcony);
  for (const x of [-0.84, 0.84])
    rod([x, 0.45, -0.12], [x, 0.45, 0.96], 0.022, p.dark, balcony);
  // A little folding chair, table and ashtray make it part of the apartment.
  box(0.42, 0.055, 0.38, 0, 0.31, 0.42, p.green, balcony);
  box(0.42, 0.4, 0.055, 0, 0.51, 0.24, p.green, balcony);
  for (const x of [-0.18, 0.18])
    rod([x, 0.05, 0.19], [x, 0.31, 0.59], 0.023, p.dark, balcony);
  cylinder(0.19, 0.035, 0.56, 0.43, 0.5, p.trim, balcony);
  rod([0.56, 0.05, 0.5], [0.56, 0.43, 0.5], 0.025, p.dark, balcony);
  cylinder(0.055, 0.016, 0.56, 0.458, 0.5, p.roof, balcony);
  const person = new THREE.Group();
  person.position.set(0, 0.34, 0.46);
  balcony.add(person);
  const skin = material("#d8aa81"),
    shirt = material("#72848a");
  const sphere = (r, x, y, z, mat, parent = person) =>
    mesh(new THREE.SphereGeometry(r, 10, 8), mat, x, y, z, parent);
  cylinder(0.115, 0.3, 0, 0.2, 0, shirt, person, 0.095);
  sphere(0.11, 0, 0.47, 0.005, skin);
  for (const x of [-0.066, 0.066]) {
    rod([x, 0.05, 0], [x, 0.04, 0.19], 0.046, p.dark, person);
    rod([x, 0.04, 0.19], [x, -0.23, 0.21], 0.038, p.dark, person);
    box(0.09, 0.055, 0.14, x, -0.24, 0.25, p.dark, person);
  }
  rod([-0.12, 0.32, 0], [-0.17, 0.1, 0.12], 0.035, shirt, person);
  sphere(0.04, -0.17, 0.1, 0.12, skin);
  const hand = new THREE.Group();
  person.add(hand);
  rod([0.12, 0.32, 0], [0.18, 0.12, 0.08], 0.035, shirt, person);
  const fore = rod([0, -0.09, 0], [0, 0.09, 0], 0.032, shirt, person);
  sphere(0.043, 0, 0, 0, skin, hand);
  rod([0, 0, 0.01], [0, 0, 0.17], 0.013, p.ivory, hand);
  const emberMat = material("#8e5440", {
    emissive: "#ff6826",
    emissiveIntensity: 0,
  });
  sphere(0.017, 0, 0, 0.18, emberMat, hand);
  const smoke = Array.from({ length: 7 }, () => {
    const mat = material("#e9e7df", {
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const puff = sphere(0.075, 0, 0, 0, mat, balcony);
    puff.castShadow = false;
    return puff;
  });
  let phase = "sitting";
  function update(sim) {
    const t = sim.discoveries.active.balconyResident;
    const ease = (v) => {
      v = Math.max(0, Math.min(1, v));
      return v * v * (3 - 2 * v);
    };
    const lift =
      t === undefined ? 0 : ease(t / 0.9) * (1 - ease((t - 2.4) / 0.9));
    hand.position.set(
      0.16 * (1 - lift) + 0.035 * lift,
      0.11 * (1 - lift) + 0.43 * lift,
      0.2 * (1 - lift) + 0.1 * lift,
    );
    const elbow = new THREE.Vector3(0.18, 0.12, 0.08),
      target = hand.position;
    fore.position.copy(elbow.clone().add(target).multiplyScalar(0.5));
    fore.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      target.clone().sub(elbow).normalize(),
    );
    fore.scale.y = elbow.distanceTo(target) / 0.18;
    // The forearm geometry is centered before orienting it to the hand.
    emberMat.emissiveIntensity =
      t !== undefined && t > 0.9 && t < 2.4 ? 2.2 : 0.08;
    phase =
      t === undefined
        ? "sitting"
        : t < 0.9
          ? "raising"
          : t < 2.4
            ? "inhaling"
            : t < 3.2
              ? "lowering"
              : "exhaling";
    smoke.forEach((puff, i) => {
      const age = t === undefined ? -1 : t - 3 - i * 0.18;
      const visible = age > 0 && age < 1.65;
      puff.visible = visible;
      if (visible) {
        puff.position.set(
          Math.sin(age * 2 + i) * 0.07 + age * 0.13,
          0.83 + age * 0.3,
          0.6 + age * 0.35,
        );
        puff.scale.setScalar(0.45 + age * 1.3);
        puff.material.opacity = 0.32 * Math.sin((age / 1.65) * Math.PI);
      }
    });
  }
  return {
    update,
    target: () => new THREE.Vector3(...BALCONY_RESIDENT.point),
    object: person,
    diagnostics: () => ({
      phase,
      smoke: smoke.filter((p) => p.visible).length,
      ember: emberMat.emissiveIntensity,
    }),
  };
}
