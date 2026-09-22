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
  const outfits = [
    { name: "striped tee", color: "#eee1c7", pants: "#597687" },
    { name: "mustard hoodie", color: "#c3a057", pants: "#3e5467" },
    { name: "denim jacket", color: "#567c94", pants: "#b79d76" },
    { name: "red jacket", color: "#b76551", pants: "#394747" },
    { name: "overalls", color: "#6f97a0", pants: "#537280" },
    { name: "waistcoat", color: "#66545b", pants: "#434a52" },
  ].map((o) => ({
    ...o,
    shirt: material(o.color),
    trousers: material(o.pants),
  }));
  const tones = [
    skin,
    material("#ae7856"),
    material("#885b43"),
    material("#e0b994"),
  ];
  return (x, z, shirt, y = 0.42, style = null) => {
    const outfit = style === null ? null : outfits[style % outfits.length];
    if (outfit) shirt = outfit.shirt;
    const complexion = style === null ? skin : tones[style % tones.length];
    const g = group(x, y, z);
    cylinder(0.105, 0.28, 0, 0.39, 0, shirt, g, 0.085);
    const head = sphere(0.105, 0, 0.64, 0, complexion, g);
    const legs = [-1, 1].map((q) => {
      const pivot = group(q * 0.058, 0.27, 0, g);
      box(0.075, 0.25, 0.085, 0, -0.125, 0, outfit?.trousers || p.dark, pivot);
      return pivot;
    });
    const arms = [-1, 1].map((q) => {
      const pivot = group(q * 0.125, 0.5, 0, g);
      rod([0, 0, 0], [q * 0.018, -0.22, 0.025], 0.033, shirt, pivot);
      sphere(0.04, q * 0.018, -0.22, 0.025, complexion, pivot);
      return pivot;
    });
    if (outfit) {
      if (style % 6 === 0)
        for (const yy of [0.34, 0.4, 0.46])
          cylinder(0.106, 0.026, 0, yy, 0, p.green, g);
      if ([2, 3, 5].includes(style % 6))
        box(0.068, 0.2, 0.012, 0, 0.42, 0.105, p.trim, g);
      if (style % 6 === 4)
        for (const q of [-1, 1])
          rod(
            [q * 0.06, 0.52, 0.085],
            [q * 0.055, 0.34, 0.103],
            0.013,
            p.trim,
            g,
          );
      if ([1, 4].includes(style % 6)) {
        cylinder(0.111, 0.06, 0, 0.71, 0, shirt, g);
        box(0.15, 0.018, 0.13, 0, 0.705, 0.09, shirt, g);
      } else {
        const hair = sphere(0.107, 0, 0.073, -0.011, p.roof, head);
        hair.scale.y = 0.55;
      }
      if (style % 3 === 1) {
        box(0.15, 0.2, 0.07, 0, 0.43, -0.12, p.terra, g);
        for (const q of [-1, 1])
          rod(
            [q * 0.07, 0.53, 0.055],
            [q * 0.07, 0.34, 0.075],
            0.013,
            p.terra,
            g,
          );
      }
      for (const leg of legs)
        box(0.08, 0.055, 0.115, 0, -0.23, 0.025, p.trim, leg);
    }
    return {
      outfit: outfit?.name || "plain",
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
