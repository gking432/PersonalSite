import * as THREE from "three";
import { createPeople } from "./cityPeople";
import { riverBridgeHeight } from "./waterfront";

export function createHeistScene({
  city,
  palette: p,
  box,
  mesh,
  cylinder,
  rod,
  label,
  material,
}) {
  const group = (x = 0, y = 0, z = 0, parent = city) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const sphere = (r, x, y, z, mat, parent) =>
    mesh(new THREE.SphereGeometry(r, 10, 8), mat, x, y, z, parent);
  const blue = material("#426586"),
    black = material("#2c3435"),
    redLamp = material("#fd6555", {
      emissive: "#f84035",
      emissiveIntensity: 1.2,
    }),
    blueLamp = material("#679ce4", {
      emissive: "#357bf3",
      emissiveIntensity: 1.2,
    });
  // A bank, a payphone, and a street cover are ordinary city details until the
  // three are clicked in order. No puzzle prompt or heist button is displayed.
  box(0.43, 0.62, 0.03, -3.38, 0.74, -2.365, p.dark);
  label("BANK", 0.75, 0.17, -3.38, 1.17, -2.36, {
    background: "#d7c49b",
    color: "#345548",
    size: 60,
  });
  const clock = group(-3.38, 1.73, -2.35);
  const rim = cylinder(0.19, 0.04, 0, 0, 0, p.trim, clock);
  rim.rotation.x = Math.PI / 2;
  const face = cylinder(0.154, 0.045, 0, 0, 0.014, p.ivory, clock);
  face.rotation.x = Math.PI / 2;
  const hands = group(0, 0, 0.042, clock);
  box(0.016, 0.12, 0.012, 0, 0.045, 0, p.dark, hands);
  box(0.095, 0.014, 0.012, 0.035, 0, 0, p.dark, hands);
  const phone = group(-1.87, 0.41, -4.5);
  box(0.2, 0.68, 0.2, 0, 0.34, 0, p.green, phone);
  box(0.22, 0.32, 0.23, 0, 0.76, 0, p.trim, phone);
  box(0.09, 0.2, 0.018, 0, 0.77, 0.125, p.dark, phone);
  box(0.04, 0.04, 0.02, 0.065, 0.74, 0.127, p.glass, phone);
  const handset = group(0, 0.77, 0.142, phone);
  rod([-0.065, -0.075, 0], [-0.065, 0.075, 0], 0.02, p.black, handset);
  const hole = group(-1.61, 0.412, -2.45);
  cylinder(0.23, 0.014, 0, 0, 0, p.dark, hole);
  const lid = group(-0.23, 0.02, 0, hole);
  cylinder(0.235, 0.018, 0.23, 0, 0, p.roof, lid);
  for (let i = -2; i <= 2; i++)
    box(0.31, 0.008, 0.01, 0.23, 0.014, i * 0.065, p.trim, lid);
  const bankGlow = box(
    0.41,
    0.54,
    0.012,
    -3.38,
    0.75,
    -2.341,
    redLamp,
    group(),
  );
  bankGlow.visible = false;
  const person = createPeople({
    city,
    palette: p,
    box,
    mesh,
    cylinder,
    rod,
    material,
  });
  const robbers = Array.from({ length: 3 }, (_, i) => {
    const a = person(-3.6 + i * 0.22, -1.5, black);
    a.head.material = black;
    for (const q of [-1, 1]) sphere(0.018, q * 0.037, 0.66, 0.09, p.ivory, a.g);
    sphere(0.105, 0.18, 0.29, 0.08, p.cream, a.g).scale.y = 1.2;
    return a;
  });
  function vehicle(kind) {
    const g = group(),
      van = kind === "news",
      body = kind === "getaway" ? p.green : p.ivory;
    box(0.54, 0.2, van ? 1.2 : 1.05, 0, 0.49, 0, body, g);
    box(
      0.47,
      van ? 0.42 : 0.27,
      van ? 0.79 : 0.53,
      0,
      van ? 0.75 : 0.68,
      -0.07,
      body,
      g,
    );
    box(0.42, 0.17, 0.02, 0, 0.73, van ? 0.34 : 0.21, p.glass, g);
    for (const q of [-1, 1]) {
      box(0.022, 0.16, van ? 0.55 : 0.36, q * 0.24, 0.73, -0.04, p.glass, g);
      if (kind === "police")
        box(0.018, 0.12, 0.65, q * 0.279, 0.53, 0, blue, g);
      for (const z of [-0.36, 0.36]) {
        const tire = cylinder(0.13, 0.08, q * 0.27, 0.38, z, p.dark, g);
        tire.rotation.z = Math.PI / 2;
      }
    }
    const lamps = [];
    if (kind === "police")
      for (const q of [-1, 1])
        lamps.push(
          box(
            0.16,
            0.065,
            0.095,
            q * 0.09,
            0.85,
            -0.05,
            q < 0 ? redLamp : blueLamp,
            g,
          ),
        );
    if (van) {
      rod([0, 0.99, -0.25], [0, 1.25, -0.25], 0.025, p.dark, g);
      const dish = mesh(
        new THREE.SphereGeometry(0.17, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        p.trim,
        0,
        1.24,
        -0.25,
        g,
      );
      dish.rotation.z = 0.6;
      label("NEWS", 0.42, 0.17, 0, 0.85, 0.36, {
        parent: g,
        background: null,
        color: "#345548",
        size: 65,
      });
    }
    return { g, lamps };
  }
  const getaway = vehicle("getaway"),
    cops = Array.from({ length: 3 }, () => vehicle("police")),
    news = vehicle("news");
  const police = Array.from({ length: 3 }, () => person(0, 0, blue)),
    reporter = person(-1.85, -4.1, p.cream);
  police.forEach((a) => {
    cylinder(0.12, 0.06, 0, 0.75, 0, blue, a.g);
    box(0.11, 0.025, 0.11, 0, 0.73, 0.085, blue, a.g);
  });
  box(0.12, 0.1, 0.15, 0.15, 0.53, 0.13, p.dark, reporter.g);
  function route(points) {
    return new THREE.CatmullRomCurve3(
      points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      false,
      "centripetal",
    );
  }
  const arrival = (x) =>
    route([
      [-1.15, -10],
      [-1.15, -3.1],
      [-1.22, -1.65],
      [-1.8, -1.18],
      [x, -1.18],
    ]);
  const depart = (x) =>
    route([
      [x, -1.18],
      [x + 0.55, -1.12],
      [-1.65, -1.12],
      [-1.15, -1.65],
      [-1.15, -10],
    ]);
  const getawayIn = route([
      [-1.15, -10],
      [-1.15, -6],
      [-1.15, -3.3],
    ]),
    getawayOut = route([
      [-1.15, -3.3],
      [-1.15, -6],
      [-1.15, -10],
    ]);
  const spots = [-4.7, -3.25, -1.9],
    policeIn = spots.map(arrival),
    policeOut = spots.map(depart);
  const newsIn = route([
      [-1.15, -10],
      [-1.15, -6],
      [-1.15, -4.7],
    ]),
    newsOut = route([
      [-1.15, -4.7],
      [-1.15, -7],
      [-1.15, -10],
    ]);
  function drive(car, path, progress) {
    const f = THREE.MathUtils.clamp(progress, 0, 1),
      pos = path.getPointAt(f),
      tangent = path.getTangentAt(f);
    car.g.position.set(pos.x, riverBridgeHeight(pos.x, pos.z), pos.z);
    car.g.rotation.y = Math.atan2(tangent.x, tangent.z);
    const ahead = path.getPointAt(Math.min(1, f + 0.002));
    const distance = pos.distanceTo(ahead);
    car.g.rotation.order = "YXZ";
    car.g.rotation.x =
      distance > 0.0001
        ? -Math.atan2(
            riverBridgeHeight(ahead.x, ahead.z) - car.g.position.y,
            distance,
          )
        : 0;
  }
  const robberIn = robbers.map((_, i) =>
    route([
      [-1.6, -3.3 + i * 0.2],
      [-1.94, -2.07],
      [-3.38, -2.07],
      [-3.38, -2.39],
    ]),
  );
  const robberOut = robbers.map(() =>
    route([
      [-3.38, -2.39],
      [-2.65, -2.07],
      [-1.94, -2.07],
      [-1.61, -2.45],
    ]),
  );
  function stroll(actor, path, progress, time) {
    const pos = path.getPointAt(THREE.MathUtils.clamp(progress, 0, 1)),
      tangent = path.getTangentAt(THREE.MathUtils.clamp(progress, 0, 1));
    actor.g.position.set(pos.x, 0.42, pos.z);
    actor.g.rotation.y = Math.atan2(tangent.x, tangent.z);
    actor.animate(time, true);
  }
  let diagnostics = {};
  function update(sim) {
    const t = sim.discoveries.heist.time,
      running = t !== null,
      active = sim.discoveries.active;
    hands.rotation.z =
      active.bankClock === undefined ? 0 : -active.bankClock * Math.PI * 2;
    handset.rotation.z =
      active.payphone === undefined ? 0 : Math.sin(active.payphone * 28) * 0.16;
    lid.rotation.z =
      running && t >= 11 && t < 14
        ? Math.PI * 0.74 * Math.min(1, t - 11, 14 - t)
        : active.manhole === undefined
          ? 0
          : Math.sin(active.manhole * Math.PI) * 0.12;
    bankGlow.visible = running && t >= 7 && t < 10 && Math.sin(t * 16) > 0;
    getaway.g.visible = running && t < 42;
    if (running)
      drive(
        getaway,
        t < 38 ? getawayIn : getawayOut,
        t < 38 ? Math.min(1, t / 4) : (t - 38) / 4,
      );
    robbers.forEach((a, i) => {
      const enter = (t ?? 0) - 4 - i * 0.38,
        exit = (t ?? 0) - 10 - i * 0.42;
      a.g.visible =
        running && ((enter >= 0 && enter < 2.1) || (exit >= 0 && exit < 2.35));
      a.g.scale.setScalar(1);
      if (!a.g.visible) return;
      if (exit >= 0) {
        stroll(a, robberOut[i], Math.min(1, exit / 1.9), t);
        if (exit > 1.9) {
          const drop = (exit - 1.9) / 0.45;
          a.g.position.y -= drop * 0.6;
          a.g.scale.y = 1 - drop;
        }
      } else stroll(a, robberIn[i], enter / 2.1, t);
    });
    cops.forEach((car, i) => {
      const arrive = 13 + i * 0.55,
        leave = 33 + i * 0.55;
      car.g.visible = running && t >= arrive && t < leave + 3.4;
      if (car.g.visible)
        drive(
          car,
          t < leave ? policeIn[i] : policeOut[i],
          t < leave ? Math.min(1, (t - arrive) / 3.2) : (t - leave) / 3.4,
        );
      car.lamps.forEach((lamp, index) => {
        lamp.visible = Math.floor((t ?? 0) * 12 + i) % 2 === index;
      });
      const officer = police[i];
      officer.g.visible = running && t >= 18 && t < 33;
      officer.g.position.set(spots[i], 0.42, -1.88);
      officer.g.rotation.y = Math.PI;
      officer.animate(t ?? 0, false);
    });
    news.g.visible = running && t >= 14.4 && t < 38;
    if (news.g.visible)
      drive(
        news,
        t < 34 ? newsIn : newsOut,
        t < 34 ? Math.min(1, (t - 14.4) / 3.4) : (t - 34) / 4,
      );
    reporter.g.visible = running && t >= 18 && t < 33;
    reporter.g.rotation.y = -Math.PI / 2;
    diagnostics = {
      ...sim.discoveries.heist.snapshot(),
      time: t,
      maskedFigures: robbers.filter((a) => a.g.visible).length,
      policeCars: cops.filter((car) => car.g.visible).length,
      newsVan: news.g.visible,
      manholeOpen: lid.rotation.z > 0.4,
    };
  }
  return { update, diagnostics: () => diagnostics };
}
