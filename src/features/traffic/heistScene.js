import { HEIST_PLACES, HEIST_TIMING } from "./secretHeist";
import { lakeCarPose, lakeRouteLength } from "./lakeRoad";
import { carPose } from "./trafficSimulation";
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
  const phone = group(HEIST_PLACES.phone[0], 0.41, HEIST_PLACES.phone[1]);
  // A recognizable street payphone: canopy, side panels, receiver, and keypad.
  box(0.42, 0.08, 0.42, 0, 0.04, 0, p.dark, phone);
  box(0.16, 0.68, 0.16, 0, 0.38, 0, p.trim, phone);
  box(0.44, 0.61, 0.29, 0, 0.93, 0, p.green, phone);
  box(0.32, 0.43, 0.025, 0, 0.92, 0.16, p.trim, phone);
  for (const sign of [-1, 1])
    box(0.04, 0.61, 0.43, sign * 0.24, 0.93, 0.06, p.green, phone);
  box(0.56, 0.07, 0.53, 0, 1.26, 0.06, p.green, phone);
  label("PHONE", 0.4, 0.13, 0, 1.15, 0.29, {
    parent: phone,
    background: "#315548",
    size: 120,
  });
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      box(
        0.028,
        0.025,
        0.016,
        0.018 + col * 0.048,
        0.96 - row * 0.047,
        0.185,
        p.dark,
        phone,
      );
  const handset = group(-0.095, 0.94, 0.205, phone);
  rod([0, -0.1, 0], [0, 0.1, 0], 0.027, p.black, handset);
  for (const sign of [-1, 1])
    box(0.065, 0.065, 0.05, 0.018, sign * 0.1, 0, p.black, handset);
  const hole = group(HEIST_PLACES.manhole[0], 0.416, HEIST_PLACES.manhole[1]);
  cylinder(0.35, 0.02, 0, 0, 0, p.dark, hole);
  const lid = group(-0.31, 0.025, 0, hole);
  cylinder(0.31, 0.025, 0.31, 0, 0, p.roof, lid);
  for (let i = -2; i <= 2; i++) {
    box(0.44, 0.008, 0.018, 0.31, 0.02, i * 0.085, p.dark, lid);
    box(0.018, 0.008, 0.44, 0.31 + i * 0.085, 0.02, 0, p.dark, lid);
  }
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
    reporter = person(-1.9, -5.3, p.cream);
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
  const getawayIn = route([
    [-1.15, -12.7],
    [-1.15, -6],
    [-1.15, -3.3],
  ]);
  const getawayOut = route([
    [-1.15, -3.3],
    [-1.08, -2.5],
    [-0.2, -2.45],
    [0.57, -3.3],
    [0.57, -7],
    [0.57, -12.7],
  ]);
  const spots = [
    [-4.7, -1.15],
    [-3.25, -1.15],
    [-1.15, -3.9],
  ];
  const east = [];
  for (let distance = -10; distance < 14; distance += 0.25) {
    const p = carPose({ junction: 1, lane: 1, turn: "straight", p: distance });
    east.push([p.x, p.z]);
    if (p.out > 7) break;
  }
  const south = [];
  for (let distance = 0; distance <= lakeRouteLength(1); distance += 0.25) {
    const p = lakeCarPose(distance, 1);
    south.push([p.x, p.z]);
  }
  const policeIn = [
    route([
      [-0.57, -12.7],
      [-0.57, -6],
      [-0.57, -2.2],
      [-1.3, -1.15],
      spots[0],
    ]),
    route([...east, [2, -0.57], [0, -0.57], [-1.4, -0.8], spots[1]]),
    route([
      ...south,
      [0.57, 4],
      [0.57, 0],
      [0.3, -1.5],
      [-1.15, -2.2],
      spots[2],
    ]),
  ];
  const policeOut = [
    route([
      spots[0],
      [-3, -1.15],
      [-1.65, -1.15],
      [-0.57, -2.4],
      [-0.57, -12.7],
    ]),
    route([
      spots[1],
      [-1.8, -1.15],
      [0, 0.57],
      [5, 0.57],
      [12, 0.57],
      [12.8, 1.8],
      [14.4, 2.1],
      [16.1, 1.5],
      [17, 0.57],
      [24.7, 0.57],
    ]),
    route([spots[2], [-1.1, -2.4], [0.57, -2.2], [0.57, -6], [0.57, -12.7]]),
  ];
  const newsIn = route([
      [-1.15, -12.7],
      [-1.15, -8],
      [-1.15, -5.5],
    ]),
    newsOut = route([
      [-1.15, -5.5],
      [-1.15, -8],
      [-1.15, -12.7],
    ]);
  const arrivalTimes = [15, 14.7, 14.6],
    arrivalDurations = [2.1, 3.3, 3.9];
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
  const robberOut = robbers.map((_, i) =>
    route(
      i === 0
        ? [
            [-3.38, -2.39],
            [-3.38, -2.07],
            [-1.94, -2.07],
            [-1.6, -3.3],
          ]
        : [
            [-3.38, -2.39],
            [-3.38, -2.07],
            [-1.85, -2.07],
            [-1.85, 0.1],
            HEIST_PLACES.manhole,
          ],
    ),
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
      running && t >= 12.5 && t < 15
        ? Math.PI * 0.74 * Math.min(1, (t - 12.5) * 4, (15 - t) * 4)
        : active.manhole === undefined
          ? 0
          : Math.sin(active.manhole * Math.PI) * 0.12;
    bankGlow.visible = running && t >= 7 && t < 10 && Math.sin(t * 16) > 0;
    getaway.g.visible = running && t < HEIST_TIMING.getawayGone;
    if (getaway.g.visible)
      drive(
        getaway,
        t < HEIST_TIMING.getaway ? getawayIn : getawayOut,
        t < HEIST_TIMING.getaway
          ? Math.min(1, t / 4)
          : ((t - HEIST_TIMING.getaway) /
              (HEIST_TIMING.getawayGone - HEIST_TIMING.getaway)) **
              1.5,
      );
    robbers.forEach((a, i) => {
      const enter = (t ?? 0) - 4 - i * 0.38,
        exit = (t ?? 0) - 9.8 - i * 0.22;
      const duration = i === 0 ? 2.5 : 3.9;
      a.g.visible =
        running &&
        ((enter >= 0 && enter < 2.1) || (exit >= 0 && exit < duration));
      a.g.scale.setScalar(1);
      a.g.rotation.x = a.g.rotation.z = 0;
      if (!a.g.visible) return;
      if (exit >= 0) {
        const travel = i === 0 ? 2 : 3.35;
        stroll(a, robberOut[i], Math.min(1, exit / travel), t * 1.4);
        if (i === 0 && exit > 2) {
          const jump = (exit - 2) / 0.5;
          a.g.position.x += jump * 0.45;
          a.g.position.y += Math.sin(jump * Math.PI) * 0.5;
          a.g.scale.setScalar(1 - jump * 0.65);
        }
        if (i > 0 && exit > travel) {
          const drop = (exit - travel) / 0.55;
          a.g.position.y -= drop * 0.7;
          a.g.scale.y = 1 - drop;
        }
      } else stroll(a, robberIn[i], enter / 2.1, t * 1.3);
    });
    cops.forEach((car, i) => {
      const arrive = arrivalTimes[i],
        leave = HEIST_TIMING.departure + i * 0.55;
      car.g.visible = running && t >= arrive && t < leave + 3.4;
      if (car.g.visible)
        drive(
          car,
          t < leave ? policeIn[i] : policeOut[i],
          t < leave
            ? 1 - (1 - Math.min(1, (t - arrive) / arrivalDurations[i])) ** 1.6
            : (t - leave) / 3.4,
        );
      car.lamps.forEach((lamp, index) => {
        lamp.visible = Math.floor((t ?? 0) * 12 + i) % 2 === index;
      });
      const officer = police[i];
      officer.g.visible =
        running &&
        t >= HEIST_TIMING.investigation &&
        t < HEIST_TIMING.departure;
      officer.g.position.set(
        i < 2 ? spots[i][0] : -1.9,
        0.42,
        i < 2 ? -1.88 : spots[i][1],
      );
      officer.g.rotation.y = Math.PI;
      officer.animate(t ?? 0, false);
    });
    news.g.visible = running && t >= 15.5 && t < 40;
    if (news.g.visible)
      drive(
        news,
        t < 35 ? newsIn : newsOut,
        t < 35 ? Math.min(1, (t - 15.5) / 3.4) : (t - 35) / 5,
      );
    reporter.g.visible =
      running && t >= HEIST_TIMING.investigation && t < HEIST_TIMING.departure;
    reporter.g.rotation.y = -Math.PI / 2;
    diagnostics = {
      ...sim.discoveries.heist.snapshot(),
      time: t,
      maskedFigures: robbers.filter((a) => a.g.visible).length,
      policeCars: cops.filter((car) => car.g.visible).length,
      newsVan: news.g.visible,
      manholeOpen: lid.rotation.z > 0.4,
      getawayVisible: getaway.g.visible,
      getawayMoving:
        running && t >= HEIST_TIMING.getaway && t < HEIST_TIMING.getawayGone,
      driverBoarding: running && t >= 11.8 && t < 12.3,
      escapedByCar: running && t >= HEIST_TIMING.getawayGone ? 1 : 0,
      escapedThroughManhole: running && t >= 14.2 ? 2 : 0,
      policeApproaches: ["north", "east", "lakefront"],
      policePositions: cops.map((car) => car.g.position.toArray()),
    };
  }
  return {
    update,
    landmarks: { payphone: phone, manhole: hole },
    diagnostics: () => diagnostics,
  };
}
