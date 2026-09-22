import * as THREE from "three";
import { createPeople } from "./cityPeople.js";
export const FONZ = [-4.65, 0.43, -3.15];
export const GERTIE = [-4.72, 0.45, 1.75];

export function createPublicMarket({
  x,
  z,
  w,
  d,
  h,
  box,
  rod,
  label,
  material,
  palette: p,
}) {
  const brick = material("#ac725b"),
    steel = material("#a9aaa1"),
    roof = material("#929b99"),
    glass = material("#738b91", { roughness: 0.38, metalness: 0.25 });
  glass.userData.worldWindow = true;
  box(w, h, d, x, 0.41 + h / 2, z, brick);
  // Warm brick piers, ground-floor glazing, and the real hall's silver louvers.
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const xx = x - w * 0.4 + i * w * 0.2;
      box(w * 0.158, 0.55, 0.035, xx, 0.82, z + sign * (d / 2 + 0.02), glass);
      box(w * 0.158, 0.69, 0.035, xx, 1.59, z + sign * (d / 2 + 0.02), p.dark);
      box(
        0.045,
        1.55,
        0.065,
        xx - w * 0.097,
        1.25,
        z + sign * (d / 2 + 0.04),
        steel,
      );
      for (let row = 0; row < 8; row++)
        box(
          w * 0.158,
          0.04,
          0.045,
          xx,
          1.29 + row * 0.085,
          z + sign * (d / 2 + 0.045),
          steel,
        );
    }
    for (let i = 0; i < 6; i++) {
      const zz = z - d * 0.41 + i * d * 0.164;
      box(0.038, 1.2, d * 0.13, x + sign * (w / 2 + 0.018), 1.19, zz, glass);
      box(
        0.06,
        1.57,
        0.05,
        x + sign * (w / 2 + 0.035),
        1.25,
        zz - d * 0.08,
        steel,
      );
    }
    box(w + 0.1, 0.1, 0.1, x, 1.16, z + sign * (d / 2 + 0.025), brick);
    box(w + 0.13, 0.055, 0.34, x, 1.1, z + sign * (d / 2 + 0.12), steel);
  }
  box(w + 0.2, 0.12, d + 0.16, x, 2.13, z, roof);
  for (let i = 0; i < 10; i++)
    box(0.014, 0.012, d + 0.13, x - w / 2 + (i * w) / 9, 2.196, z, steel);
  box(0.48, 0.09, 0.7, x + 0.6, 2.235, z + 0.65, p.roof);
  for (const q of [-1, 1])
    rod(
      [x + q * 0.9, 2.19, z + 1.34],
      [x + q * 0.9, 2.92, z + 1.34],
      0.018,
      p.dark,
    );
  for (const sign of [-1, 1]) {
    const signFace = label(
      "PUBLIC MARKET",
      3.3,
      0.8,
      x,
      2.78,
      z + 1.34 + sign * 0.016,
      {
        background: null,
        color: "#d22e26",
        size: 88,
        ry: sign > 0 ? 0 : Math.PI,
      },
    );
    // Cutout letters write depth so the transparent river cannot paint over
    // the part of the sign that projects beyond the roof.
    Object.assign(signFace.material, {
      side: THREE.FrontSide,
      transparent: false,
      alphaTest: 0.25,
      depthWrite: true,
    });
  }
  box(0.44, 0.65, 0.05, x, 0.75, z - d / 2 - 0.045, glass);
  for (const xx of [x - 0.22, x, x + 0.22])
    box(0.025, 0.66, 0.065, xx, 0.75, z - d / 2 - 0.06, steel);
}

export function createClockTower({
  city,
  x,
  z,
  h,
  box,
  mesh,
  rod,
  label,
  material,
  palette: p,
}) {
  const base = 0.41,
    top = base + h - 0.8;
  box(1.52, h - 1.5, 1.52, x, base + (h - 1.5) / 2, z, p.brick);
  box(1.9, 0.17, 1.9, x, base + 0.085, z, p.trim);
  for (const q of [-1, 1])
    for (const a of [-0.5, 0, 0.5]) {
      box(
        0.12,
        h - 1.8,
        0.035,
        x + a,
        base + (h - 1.8) / 2 + 0.16,
        z + q * 0.77,
        p.glass,
      );
      box(
        0.035,
        h - 1.8,
        0.12,
        x + q * 0.77,
        base + (h - 1.8) / 2 + 0.16,
        z + a,
        p.glass,
      );
    }
  box(1.62, 1.55, 1.62, x, top - 0.03, z, p.trim);
  box(1.7, 0.09, 1.7, x, top + 0.78, z, p.roof);
  const glow = material("#fff8db", {
    emissive: "#fbe7ac",
    emissiveIntensity: 0.36,
  });
  const faces = [];
  for (let i = 0; i < 4; i++) {
    const face = new THREE.Group();
    face.position.set(x, top, z);
    face.rotation.y = (i * Math.PI) / 2;
    // A group is attached by the first helper mesh, then holds the moving hands.
    mesh(new THREE.CircleGeometry(0.64, 40), glow, 0, 0, 0.82, face);
    city.add(face);
    for (let mark = 0; mark < 12; mark++) {
      const angle = (mark * Math.PI) / 6;
      rod(
        [Math.sin(angle) * 0.48, Math.cos(angle) * 0.48, 0.835],
        [Math.sin(angle) * 0.57, Math.cos(angle) * 0.57, 0.835],
        0.016,
        p.dark,
        face,
      );
    }
    const hour = new THREE.Group(),
      minute = new THREE.Group();
    face.add(hour, minute);
    rod([0, 0, 0.85], [0, 0.32, 0.85], 0.024, p.dark, hour);
    rod([0, 0, 0.86], [0, 0.47, 0.86], 0.017, p.dark, minute);
    mesh(new THREE.SphereGeometry(0.034, 8, 6), p.dark, 0, 0, 0.88, face);
    faces.push({ hour, minute });
  }
  label("ALLEN-BRADLEY", 1.5, 0.15, x, top - 0.96, z + 0.79, {
    background: null,
    color: "#f2e3c6",
    size: 62,
  });
  const timeFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  return {
    update(sim) {
      const parts = timeFormat.formatToParts(new Date());
      const value = (type) => Number(parts.find((p) => p.type === type).value);
      const minutes = value("minute") + value("second") / 60,
        hours = value("hour") + minutes / 60;
      const t = sim.discoveries.active.clockTower;
      const extra =
        t === undefined
          ? 0
          : (Math.PI * 4 * (1 - Math.cos(Math.min(1, t / 4) * Math.PI))) / 2;
      for (const { hour, minute } of faces) {
        hour.rotation.z = (-hours * Math.PI) / 6 - extra;
        minute.rotation.z = (-minutes * Math.PI) / 30 - extra * 3;
      }
      glow.emissiveIntensity =
        t === undefined ? 0.36 : 0.55 + Math.sin(t * 6) * 0.14;
    },
  };
}

export function createThirdWard({
  city,
  box,
  mesh,
  cylinder,
  rod,
  label,
  material,
  tree,
  palette: p,
}) {
  const group = (x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    city.add(g);
    return g;
  };
  // Broadway fits between existing plots; the adjoining narrow shops shift east.
  for (const sign of [-1, 1]) {
    const length = sign < 0 ? 5.45 : 6.48,
      z = sign < 0 ? -4.1 : 4.615;
    box(2.55, 0.048, length, 6.65, 0.279, z, p.asphalt);
    for (const x of [5.22, 8.08]) box(0.28, 0.11, length, x, 0.345, z, p.curb);
    box(0.86, 0.02, 3.65, 6.65, 0.315, sign * 4.25, p.roof);
    for (let i = 0; i < 5; i++) {
      const zz = sign * (2.62 + i * 0.78);
      box(0.83, 0.006, 0.025, 6.65, 0.329, zz, p.white, city, -0.32);
      if (i === 2) continue;
      const car = group(6.65, 0.04, zz + 0.3);
      car.rotation.y = -0.32 + (sign < 0 ? Math.PI : 0);
      const paint = [p.ivory, p.brick, material("#547f99"), p.green][i % 4];
      box(0.36, 0.19, 0.62, 0, 0.44, 0, paint, car);
      box(0.29, 0.15, 0.34, 0, 0.6, 0, p.glass, car);
      box(0.3, 0.025, 0.3, 0, 0.69, 0, paint, car);
      for (const q of [-1, 1])
        for (const e of [-1, 1])
          box(0.06, 0.13, 0.13, q * 0.18, 0.35, e * 0.21, p.black, car);
    }
    for (const zz of [sign * 2.05, sign * 6.37]) {
      box(0.82, 0.08, 0.42, 6.65, 0.37, zz, p.curb);
      tree(6.65, zz);
    }
    for (const x of [5.75, 7.55])
      for (let i = 0; i < 6; i++)
        box(0.14, 0.006, 0.08, x, 0.307, sign * (1.48 + i * 0.12), p.white);
  }
  label("N BROADWAY", 2.25, 0.22, 6.65, 0.31, 7.15, {
    floor: true,
    background: null,
    color: "#e7dfc9",
    size: 75,
  });
  label("CAFÉ BENELUX", 1.7, 0.24, 4.69, 1.28, -3.7, {
    ry: Math.PI / 2,
    background: "#dcaa61",
    color: "#254c46",
    size: 70,
  });
  label("THE WICKED HOP", 1.95, 0.23, 8.205, 1.13, -4.65, {
    ry: -Math.PI / 2,
    background: "#365c48",
    color: "#f0e2bf",
    size: 68,
  });
  // Compact stop platforms; streetcar doors face these sidewalks.
  for (const [x, z, side] of [
    [-1.44, 3.55, 0],
    [8.3, -1.47, 1],
  ]) {
    const g = group(x, 0.4, z);
    g.rotation.y = side ? Math.PI / 2 : 0;
    box(0.32, 0.06, 1.75, 0, 0, 0, p.curb, g);
    rod([0, 0.02, -0.7], [0, 1.12, -0.7], 0.023, p.dark, g);
    label("H", 0.25, 0.3, 0, 1.1, -0.7, {
      parent: g,
      background: "#b89b5b",
      color: "#fff8e5",
      size: 150,
      square: true,
    });
    box(0.14, 0.04, 0.68, 0, 0.3, 0.12, p.roof, g);
  }
  // Street-facing tables stay on the widened sidewalk, out of the lane.
  for (const z of [-5.8, -3.2, 4.1]) {
    cylinder(0.16, 0.055, 8.04, 0.79, z, p.trim);
    cylinder(0.022, 0.34, 8.04, 0.59, z, p.dark);
    for (const sign of [-1, 1])
      box(0.15, 0.035, 0.15, 8.04, 0.61, z + sign * 0.25, p.green);
  }
  const person = createPeople({
    city,
    box,
    mesh,
    cylinder,
    rod,
    material,
    palette: p,
  });
  const fonz = person(FONZ[0], FONZ[2], material("#68523b"), FONZ[1] + 0.14);
  const bronze = material("#8b7450", { metalness: 0.55, roughness: 0.5 });
  fonz.g.traverse((o) => {
    if (o.isMesh) o.material = bronze;
  });
  fonz.g.scale.setScalar(0.78);
  fonz.g.rotation.y = Math.PI / 2;
  box(0.48, 0.13, 0.48, FONZ[0], 0.485, FONZ[2], p.trim);
  const hair = mesh(
    new THREE.SphereGeometry(0.109, 10, 6),
    material("#51432f"),
    0,
    0.69,
    -0.008,
    fonz.g,
  );
  hair.scale.y = 0.6;
  for (const [i, arm] of fonz.arms.entries())
    rod([0, -0.19, 0.025], [0, -0.12, 0.025], 0.025, bronze, arm);
  const ducks = Array.from({ length: 6 }, (_, i) => {
    const g = group(GERTIE[0], GERTIE[1], GERTIE[2]);
    g.scale.setScalar(i ? 0.5 : 0.85);
    const body = mesh(
      new THREE.SphereGeometry(0.15, 10, 7),
      i ? p.yellow : bronze,
      0,
      0.15,
      0,
      g,
    );
    body.scale.set(0.82, 0.82, 1.45);
    mesh(
      new THREE.SphereGeometry(0.095, 10, 7),
      i ? p.yellow : p.green,
      0,
      0.3,
      0.14,
      g,
    );
    box(0.095, 0.035, 0.13, 0, 0.27, 0.24, p.yellow, g);
    for (const side of [-1, 1])
      mesh(
        new THREE.SphereGeometry(0.014, 6, 5),
        p.black,
        side * 0.07,
        0.32,
        0.2,
        g,
      );
    return g;
  });
  const awake = person(-1.55, 4.7, p.brick);
  awake.g.visible = false;
  const stopFriend = person(8.35, -1.8, p.green);
  stopFriend.g.visible = false;
  let diagnostics = {};
  return {
    update(sim) {
      const t = sim.discoveries.active.fonz;
      fonz.arms.forEach((arm, i) => {
        arm.rotation.x =
          -0.95 -
          (t === undefined ? 0 : Math.sin(Math.min(1, t / 3) * Math.PI) * 0.75);
        arm.rotation.z = (i ? 1 : -1) * 0.25;
      });
      fonz.head.rotation.y = t === undefined ? 0 : Math.sin(t * 2) * 0.15;
      const d = sim.discoveries.active.gertie;
      ducks.forEach((g, i) => {
        if (d === undefined) {
          g.visible = i === 0;
          g.position.set(GERTIE[0], GERTIE[1], GERTIE[2]);
          g.rotation.y = -Math.PI / 2;
          return;
        }
        const progress = Math.max(0, Math.min(1, (d - i * 0.22) / 10));
        const angle = progress * Math.PI * 2;
        g.visible = d > i * 0.22;
        g.position.set(
          GERTIE[0] - 0.88 * Math.sin(Math.PI * progress),
          0.32 + Math.max(0, 1 - progress * 12) * 0.13,
          GERTIE[2] + Math.sin(angle) * 0.85,
        );
        g.rotation.y = Math.atan2(
          -0.88 * Math.PI * Math.cos(Math.PI * progress),
          Math.cos(angle) * Math.PI * 1.7,
        );
      });
      const open = sim.hop.doors > 0.2,
        car = sim.hop.car();
      const nearMarket = car && car.junction === 0 && car.p > 0;
      awake.g.visible = open && nearMarket;
      stopFriend.g.visible = open && !nearMarket;
      for (const visitor of [awake, stopFriend])
        visitor.animate(sim.time, true);
      diagnostics = {
        market: true,
        broadway: { x: 6.65, centerParking: 8, continuousGround: true },
        fonz: t !== undefined,
        ducks: ducks.filter((g) => g.visible).length,
        clockTower: true,
        hopWaiting: open,
      };
    },
    target(id) {
      if (id === "fonz") return new THREE.Vector3(FONZ[0], 1.08, FONZ[2]);
      if (id === "gertie")
        return ducks[0].position.clone().add(new THREE.Vector3(0, 0.2, 0));
      return null;
    },
    diagnostics: () => diagnostics,
  };
}
