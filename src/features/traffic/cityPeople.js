import * as THREE from "three";
export function createPeople({
  city,
  palette: p,
  box,
  mesh,
  cylinder,
  rod,
  material,
}) {
  const skin = material("#d8aa81");
  const group = (x, y, z, parent = city) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const sphere = (r, x, y, z, mat, parent) =>
    mesh(new THREE.SphereGeometry(r, 10, 7), mat, x, y, z, parent);
  return (x, z, shirt, y = 0.42) => {
    const g = group(x, y, z);
    cylinder(0.105, 0.28, 0, 0.39, 0, shirt, g, 0.085);
    const head = sphere(0.105, 0, 0.64, 0, skin, g);
    const legs = [-1, 1].map((q) => {
      const pivot = group(q * 0.058, 0.27, 0, g);
      box(0.075, 0.25, 0.085, 0, -0.125, 0, p.dark, pivot);
      return pivot;
    });
    const arms = [-1, 1].map((q) => {
      const pivot = group(q * 0.125, 0.5, 0, g);
      rod([0, 0, 0], [q * 0.018, -0.22, 0.025], 0.033, shirt, pivot);
      sphere(0.04, q * 0.018, -0.22, 0.025, skin, pivot);
      return pivot;
    });
    return {
      g,
      head,
      legs,
      arms,
      animate(t, moving) {
        legs.forEach(
          (leg, i) =>
            (leg.rotation.x = moving
              ? Math.sin(t * 10 + i * Math.PI) * 0.55
              : 0),
        );
        arms.forEach(
          (arm, i) =>
            (arm.rotation.x = moving
              ? -Math.sin(t * 10 + i * Math.PI) * 0.4
              : 0),
        );
      },
    };
  };
}
