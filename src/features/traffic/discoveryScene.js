import { CITY_WALKERS } from "./pedestrianMotion";
import { FISHERMAN, fishingPose } from "./fishingMotion";
import { LAKE_ROAD_START } from "./lakeRoad";
import * as THREE from "three";
import { createPeople } from "./cityPeople";
import { helicopterFlight } from "./helicopterFlight";

// Small, reusable performances. Their clocks live in the simulation so hiding
// the miniature pauses every actor, and Reset returns the whole square to rest.
export function createDiscoveryScene({
  city,
  palette: p,
  box,
  mesh,
  cylinder,
  rod,
  label,
  material,
  tree,
  building,
  windows,
  texture,
}) {
  const group = (x = 0, y = 0, z = 0, parent = city) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const sphere = (r, x, y, z, mat, parent = city) =>
    mesh(new THREE.SphereGeometry(r, 10, 7), mat, x, y, z, parent);
  const skin = material("#d8aa81"),
    blue = material("#56818b"),
    red = material("#b96347"),
    brass = material("#d7ad51", { metalness: 0.5, roughness: 0.3 });
  const walk = (actor, points, fraction) => {
    const t = Math.min(0.99999, Math.max(0, fraction)) * (points.length - 1),
      i = Math.floor(t),
      f = t - i;
    const a = points[i],
      b = points[i + 1];
    actor.position.x = a[0] + (b[0] - a[0]) * f;
    actor.position.z = a[1] + (b[1] - a[1]) * f;
    actor.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
  };
  const person = createPeople({
    city,
    palette: p,
    box,
    mesh,
    cylinder,
    rod,
    material,
  });
  const bench = (x, z, yaw = 0) => {
    const g = group(x, 0.41, z);
    g.rotation.y = yaw;
    box(0.9, 0.08, 0.33, 0, 0.25, 0, p.roof, g);
    box(0.9, 0.3, 0.055, 0, 0.46, -0.15, p.roof, g);
    for (const q of [-1, 1])
      box(0.055, 0.25, 0.26, q * 0.32, 0.125, 0, p.dark, g);
  };

  // One additional city unit: a connected avenue and a self-managing roundabout.
  // Both city units now share one continuous ground slab and avenue.
  box(
    2.75,
    0.045,
    6.825 + LAKE_ROAD_START,
    14.4,
    0.28,
    (LAKE_ROAD_START - 6.825) / 2,
    p.asphalt,
  );
  for (const [x, z, horizontal] of [[22.95, 0, true]]) {
    box(
      horizontal ? 3.3 : 2.95,
      0.34,
      horizontal ? 2.95 : 3.3,
      x,
      -0.05,
      z,
      p.base,
    );
    box(
      horizontal ? 3.36 : 3.04,
      0.07,
      horizontal ? 3.04 : 3.36,
      x,
      -0.24,
      z,
      p.edge,
    );
    box(
      horizontal ? 3.3 : 2.75,
      0.045,
      horizontal ? 2.75 : 3.3,
      x,
      0.28,
      z,
      p.asphalt,
    );
  }
  for (const q of [-1, 1]) {
    for (let d = 2.7; d < 9.8; d += 0.68) {
      if (q < 0 || d < LAKE_ROAD_START - 0.2)
        box(0.025, 0.006, 0.42, 14.4, 0.306, q * d, p.yellow);
      if (q > 0 || d < 4.6)
        box(0.42, 0.006, 0.025, 14.4 + q * d, 0.306, 0, p.yellow);
    }
    for (const r of [-1, 1])
      box(4.5, 0.12, 4.75, 14.4 + q * 4.25, 0.34, r * 4.075, p.curb);
  }
  cylinder(2.14, 0.035, 14.4, 0.306, 0, p.asphalt);
  for (let i = 0; i < 4; i++) {
    const arrow = group(14.4, 0.329, 0);
    arrow.rotation.y = (i * Math.PI) / 2;
    box(0.045, 0.006, 0.32, -1.77, 0, 0, p.white, arrow);
    rod([-1.89, 0, -0.08], [-1.77, 0, -0.2], 0.018, p.white, arrow);
    rod([-1.65, 0, -0.08], [-1.77, 0, -0.2], 0.018, p.white, arrow);
  }
  cylinder(1.035, 0.14, 14.4, 0.375, 0, p.curb);
  // Fountain bowl stays inside the driving circle, including bus clearance.
  cylinder(0.83, 0.21, 14.4, 0.5, 0, p.ivory);
  cylinder(0.71, 0.025, 14.4, 0.612, 0, p.water);
  cylinder(0.12, 0.72, 14.4, 0.84, 0, p.cream, city, 0.085);
  cylinder(0.34, 0.085, 14.4, 1.17, 0, p.ivory);
  cylinder(0.055, 0.25, 14.4, 1.3, 0, p.cream);
  const drops = Array.from({ length: 24 }, (_, i) =>
    sphere(0.032, 14.4, 0.7, 0, p.water),
  );

  // Continue the original architecture around the retained fountain. Three
  // corners have street walls; just the southeast corner remains a small park.
  for (const config of [
    {
      x: 10.6,
      z: -3.7,
      w: 2.4,
      d: 2.7,
      h: 6.2,
      landmark: true,
      floors: 5,
      body: p.cream,
      ornate: true,
    },
    { x: 8.65, z: -4.8, w: 0.85, d: 3.75, h: 1.8, floors: 3, body: p.brick },
    { x: 10.6, z: -5.92, w: 2.4, d: 1.35, h: 1.65, floors: 3, body: p.ivory },
    {
      x: 17.65,
      z: -3.7,
      w: 1.9,
      d: 1.9,
      h: 5.1,
      landmark: "clock",
      floors: 4,
      body: p.brick,
      ornate: true,
    },
    { x: 20.1, z: -4.7, w: 1.45, d: 3.75, h: 1.85, floors: 3, body: p.cream },
    { x: 17.65, z: -5.92, w: 2.6, d: 1.35, h: 1.5, floors: 3, body: p.terra },
    {
      x: 10.6,
      z: 3.7,
      w: 2.45,
      d: 2.65,
      h: 2.15,
      floors: 4,
      body: p.ivory,
      ornate: true,
    },
    { x: 8.65, z: 4.75, w: 0.85, d: 3.75, h: 1.55, floors: 3, body: p.glass },
    { x: 10.6, z: 5.92, w: 2.45, d: 1.35, h: 1.6, floors: 3, body: p.brick },
  ])
    building(config);
  for (const [x, z] of [
    [12.3, -5.3],
    [20.2, -2.05],
    [12.3, 5.7],
    [17, 5.8],
    [20, 2.4],
    [20, 5.8],
  ])
    tree(x, z);
  box(3.8, 0.025, 3.2, 18.4, 0.415, 4.45, p.leaves2);
  box(3.7, 0.027, 0.52, 18.4, 0.435, 3.5, p.pavement);
  bench(18.4, 5.8);
  bench(19.7, 3, Math.PI);
  label("FOUNTAIN SQUARE", 3.3, 0.24, 18.4, 0.46, 4.3, {
    floor: true,
    background: null,
    color: "#8d836b",
    size: 45,
  });

  // These additions occupy existing storefronts and sidewalks, not new lots.
  box(0.38, 0.58, 0.035, 3.5, 0.73, -2.36, p.dark);
  label("COFFEE", 0.65, 0.13, 3.5, 0.81, -2.33, { size: 56 });
  box(0.38, 0.6, 0.03, 4.3, 0.73, -2.36, p.dark);
  // A narrow curbside loading bay keeps the parked truck out of moving lanes.
  box(2.65, 0.04, 0.3, 3.95, 0.28, -1.48, p.asphalt);
  box(2.3, 0.006, 0.025, 3.9, 0.308, -0.83, p.yellow);
  for (const x of [2.75, 5.05])
    box(0.025, 0.006, 0.72, x, 0.308, -1.18, p.yellow);

  // Rooftop helicopter: skids, cockpit, tail, spinning rotors and a helipad.
  cylinder(0.82, 0.035, 3.5, 3.34, -3.7, p.ivory);
  label("H", 0.65, 0.65, 3.5, 3.364, -3.7, {
    floor: true,
    background: null,
    color: "#657468",
    size: 110,
  });
  const heli = group(3.5, 3.38, -3.7);
  heli.scale.setScalar(0.72);
  const helicopterRed = material("#cb4f43", { roughness: 0.55 });
  const body = sphere(0.31, 0, 0.45, 0, helicopterRed, heli);
  body.scale.set(0.93, 0.9, 1.4);
  const canopy = sphere(0.235, 0, 0.46, 0.28, p.glass, heli);
  canopy.scale.set(0.95, 0.85, 1.2);
  rod([0, 0.42, -0.24], [0, 0.56, -1.08], 0.07, helicopterRed, heli);
  box(0.06, 0.34, 0.24, 0, 0.66, -1.05, p.ivory, heli);
  for (const q of [-1, 1]) {
    rod([q * 0.22, 0.28, -0.2], [q * 0.29, 0.09, -0.2], 0.025, p.dark, heli);
    rod([q * 0.22, 0.28, 0.26], [q * 0.29, 0.09, 0.26], 0.025, p.dark, heli);
    rod([q * 0.29, 0.08, -0.5], [q * 0.29, 0.08, 0.5], 0.027, p.dark, heli);
  }
  cylinder(0.035, 0.23, 0, 0.78, 0, p.dark, heli);
  const rotor = group(0, 0.9, 0, heli);
  box(1.9, 0.025, 0.075, 0, 0, 0, p.dark, rotor);
  box(0.075, 0.025, 1.9, 0, 0, 0, p.dark, rotor);
  const rotorBlur = mesh(
    new THREE.CircleGeometry(0.95, 32),
    material("#597466", {
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    0,
    0.906,
    0,
    heli,
  );
  rotorBlur.rotation.x = -Math.PI / 2;
  rotorBlur.castShadow = false;
  const tailRotor = group(0.08, 0.64, -1.08, heli);
  box(0.025, 0.42, 0.04, 0, 0, 0, p.dark, tailRotor);
  box(0.025, 0.04, 0.42, 0, 0, 0, p.dark, tailRotor);

  const bird = (x, y, z) => {
    const g = group(x, y, z);
    sphere(0.085, 0, 0.035, 0, p.roof, g).scale.z = 1.4;
    sphere(0.065, 0, 0.13, 0.07, p.roof, g);
    const wings = [-1, 1].map((q) => {
      const wing = group(q * 0.055, 0.055, 0, g);
      box(0.23, 0.025, 0.11, q * 0.1, 0, 0, p.glass, wing);
      return wing;
    });
    return { g, wings, home: new THREE.Vector3(x, y, z) };
  };
  const birds = Array.from({ length: 5 }, (_, i) =>
    bird(-4.1 + i * 0.37, 2.19, 3.5 + (i % 2) * 0.4),
  );
  const fisher = person(FISHERMAN[0], FISHERMAN[1], p.green);
  const fishingScale = 0.65;
  fisher.g.scale.setScalar(fishingScale);
  fisher.g.rotation.y = Math.PI / 2;
  cylinder(0.155, 0.045, 0, 0.75, 0, p.cream, fisher.g);
  cylinder(0.11, 0.09, 0, 0.8, 0, p.cream, fisher.g);
  const fishingRod = group(
    FISHERMAN[0] + 0.1 * fishingScale,
    0.42 + 0.61 * fishingScale,
    FISHERMAN[1],
  );
  fishingRod.scale.setScalar(fishingScale);
  const pole = group(0, 0, 0, fishingRod);
  rod([0, 0, 0], [1.12, 0, 0], 0.02, p.roof, pole);
  cylinder(0.07, 0.05, 0.15, 0, 0, p.trim, pole);
  const line = rod(
    [0.95, 0.65, 0],
    [0.95, -0.71, 0],
    0.007,
    p.ivory,
    fishingRod,
  );
  const catchGroup = group(-6.13, 0.3, FISHERMAN[1]);
  const bobber = sphere(0.055, -5.94, 0.3, FISHERMAN[1], red);
  catchGroup.scale.setScalar(fishingScale);
  bobber.scale.setScalar(fishingScale);
  const fish = group(0, 0, 0, catchGroup);
  sphere(0.105, 0, 0, 0, brass, fish).scale.set(0.55, 1.8, 1);
  const fin = mesh(
    new THREE.ConeGeometry(0.11, 0.13, 3),
    brass,
    0,
    -0.19,
    0,
    fish,
  );
  fin.rotation.z = Math.PI;
  const walkers = CITY_WALKERS.map((item, i) => ({
    ...item,
    actor: person(item.point[0], item.point[2], i ? p.green : red, 0.42, i),
  }));
  const customer = person(3.5, -2.38, red);
  cylinder(0.055, 0.095, 0.15, 0.35, 0.13, p.ivory, customer.g);
  const steam = Array.from({ length: 3 }, (_, i) =>
    sphere(0.03, 0.15, 0.45 + i * 0.07, 0.13, p.white, customer.g),
  );
  const owner = person(2.85, 5.6, blue);
  const dog = group(3.6, 0.45, 5.7);
  sphere(0.13, 0, 0.23, 0, p.terra, dog).scale.set(0.9, 0.9, 1.8);
  sphere(0.13, 0, 0.36, 0.2, p.terra, dog);
  sphere(0.055, 0, 0.32, 0.32, p.dark, dog);
  for (const q of [-1, 1]) {
    box(0.055, 0.16, 0.08, q * 0.1, 0.41, 0.16, p.roof, dog);
    for (const z of [-0.13, 0.13])
      rod([q * 0.08, 0.22, z], [q * 0.08, 0.03, z], 0.035, p.terra, dog);
  }
  const tail = rod([0, 0.25, -0.16], [0, 0.44, -0.35], 0.035, p.terra, dog);
  const ball = sphere(0.085, 3.2, 0.52, 5.6, red);
  const musician = person(-3.8, 5.7, p.green);
  musician.g.rotation.y = -0.65;
  rod([0.03, 0.57, 0.11], [0.03, 0.48, 0.43], 0.037, brass, musician.g);
  const bell = mesh(
    new THREE.ConeGeometry(0.13, 0.2, 12, 1, true),
    brass,
    0.03,
    0.47,
    0.5,
    musician.g,
  );
  bell.rotation.x = -Math.PI / 2;
  sphere(0.05, 0.03, 0.52, 0.22, skin, musician.g);
  const notes = Array.from({ length: 3 }, (_, i) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.font = "bold 98px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#fff9e9";
    ctx.lineWidth = 5;
    ctx.strokeText(i % 2 ? "♪" : "♫", 64, 68);
    ctx.fillStyle = "#865d2d";
    ctx.fillText(i % 2 ? "♪" : "♫", 64, 68);
    const note = mesh(
      new THREE.PlaneGeometry(0.65, 0.65),
      material("#ffffff", {
        map: texture(canvas),
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        emissive: "#ffffff",
        emissiveIntensity: 0.6,
      }),
      0,
      0,
      0,
    );
    note.castShadow = false;
    return note;
  });
  const dancer = person(-2.8, 5.7, red);

  const truck = group(3.8, 0, -1.16);
  truck.rotation.y = -Math.PI / 2;
  box(0.63, 0.46, 1.12, 0, 0.77, -0.15, p.green, truck);
  box(0.63, 0.38, 0.48, 0, 0.72, 0.67, p.ivory, truck);
  box(0.56, 0.19, 0.025, 0, 0.81, 0.918, p.glass, truck);
  for (const q of [-1, 1])
    for (const z of [-0.5, 0.63]) {
      const wheel = cylinder(0.14, 0.09, q * 0.33, 0.46, z, p.dark, truck);
      wheel.rotation.z = Math.PI / 2;
    }
  const doors = [-1, 1].map((q) => {
    const pivot = group(q * 0.3, 0.77, -0.725, truck);
    box(0.3, 0.43, 0.035, -q * 0.15, 0, 0, p.cream, pivot);
    return pivot;
  });
  label("BEER", 0.46, 0.2, 0, 0.8, 0.925, { parent: truck, size: 62 });
  const worker = person(4.8, -1.65, blue);
  cylinder(0.13, 0.28, 0, 0.38, 0.22, p.roof, worker.g);
  cylinder(0.135, 0.027, 0, 0.5, 0.22, p.trim, worker.g);
  cylinder(0.135, 0.027, 0, 0.27, 0.22, p.trim, worker.g);
  for (let i = 0; i < 2; i++) {
    cylinder(0.14, 0.29, 4.25 + i * 0.3, 0.56, -2.06, p.roof);
    cylinder(0.145, 0.025, 4.25 + i * 0.3, 0.72, -2.06, p.trim);
  }
  let diagnostics = {};
  function update(sim) {
    const active = sim.discoveries.active,
      time = sim.time;
    const flight = sim.discoveries.helicopterTime();
    const flying = helicopterFlight(flight);
    heli.position.set(flying.x, flying.y, flying.z);
    heli.rotation.set(flying.pitch, flying.yaw, flying.bank, "YXZ");
    rotor.rotation.y = 0.22 + flying.rotor;
    tailRotor.rotation.x = 0.3 + flying.rotor * 1.4;
    rotorBlur.material.opacity = flying.power * 0.12;
    birds.forEach((b, i) => {
      const t = active.pigeons;
      b.g.position.copy(b.home);
      b.g.rotation.y = 0.3;
      b.wings.forEach((wing) => (wing.rotation.z = 0));
      if (t !== undefined) {
        const envelope = Math.sin((Math.PI * t) / 8),
          a = t * 1.8 + i;
        b.g.position.add(
          new THREE.Vector3(
            Math.sin(a) * 2.5 * envelope,
            (2.2 + i * 0.2) * envelope,
            Math.cos(a) * 2 * envelope,
          ),
        );
        b.g.rotation.y = a + Math.PI / 2;
        b.wings.forEach(
          (wing, j) =>
            (wing.rotation.z = Math.sin(t * 23) * 0.8 * (j ? 1 : -1)),
        );
      }
    });
    const fishing = active.fisherman,
      cast = fishingPose(fishing);
    pole.rotation.z = cast.angle;
    const top = new THREE.Vector3(
      Math.cos(cast.angle) * 1.12,
      Math.sin(cast.angle) * 1.12,
      0,
    );
    const bottom = new THREE.Vector3(cast.bobX, cast.bobY, 0);
    // Shorter gear still reaches the water instead of lifting the bobber above it.
    bottom.y += (0.31 - fishingRod.position.y) / fishingScale + 0.72;
    line.position.copy(top).add(bottom).multiplyScalar(0.5);
    line.scale.y = top.distanceTo(bottom) / 1.36;
    line.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      bottom.clone().sub(top).normalize(),
    );
    catchGroup.position
      .copy(fishingRod.position)
      .addScaledVector(bottom, fishingScale);
    catchGroup.visible = cast.fish;
    catchGroup.rotation.y = fishing === undefined ? 0 : fishing * 7;
    fish.visible = true;
    bobber.position
      .copy(fishingRod.position)
      .addScaledVector(bottom, fishingScale);
    bobber.visible = !cast.fish;
    fisher.arms[0].rotation.x = -0.9;
    fisher.arms[1].rotation.x =
      fishing === undefined ? -0.8 : -0.8 + Math.sin(fishing * 15) * 0.3;
    const coffee = active.coffee;
    customer.g.visible = coffee !== undefined;
    walk(
      customer.g,
      [
        [3.5, -2.38],
        [3.5, -1.87],
        [4.4, -1.88],
        [4.4, -1.88],
        [3.5, -1.87],
        [3.5, -2.38],
      ],
      (coffee || 0) / 11,
    );
    customer.animate(
      coffee || 0,
      coffee !== undefined && (coffee < 4.4 || coffee > 6.6),
    );
    const sitting = coffee !== undefined && coffee >= 4.4 && coffee <= 6.6;
    customer.g.position.y = sitting ? 0.33 : 0.42;
    if (sitting) {
      customer.g.rotation.y = -Math.PI / 2;
      customer.legs.forEach((leg) => {
        leg.rotation.x = -1.3;
      });
    }
    steam.forEach((s, i) => {
      s.position.y = 0.44 + ((time * 0.15 + i * 0.07) % 0.23);
      s.scale.setScalar(0.7 + i * 0.2);
    });
    const fetch = active.dog;
    dog.position.set(3.6, 0.45, 5.7);
    dog.rotation.y = 0.5;
    ball.position.set(3.2, 0.52, 5.6);
    owner.arms[1].rotation.x =
      fetch === undefined
        ? 0
        : -0.9 * Math.sin((Math.min(fetch, 1.5) / 1.5) * Math.PI);
    if (fetch !== undefined) {
      const t = Math.min(1, fetch / 1.5);
      ball.position.set(
        3.2 + 2.1 * t,
        0.52 + Math.sin(t * Math.PI) * 1.25,
        5.6 + 0.4 * t,
      );
      walk(
        dog,
        [
          [3.6, 5.7],
          [5.3, 6.0],
          [3.6, 5.7],
        ],
        Math.max(0, (fetch - 1.2) / 7.8),
      );
      dog.position.y += Math.abs(Math.sin(fetch * 12)) * 0.07;
      if (fetch > 5.1)
        ball.position
          .copy(dog.position)
          .add(
            new THREE.Vector3(
              Math.sin(dog.rotation.y) * 0.33,
              0.32,
              Math.cos(dog.rotation.y) * 0.33,
            ),
          );
    }
    tail.rotation.z = fetch === undefined ? 0 : Math.sin(fetch * 14) * 0.35;
    const music = active.musician;
    musician.g.rotation.z = music === undefined ? 0 : Math.sin(music * 9) * 0.1;
    dancer.g.position.y =
      0.42 + (music === undefined ? 0 : Math.abs(Math.sin(music * 9)) * 0.1);
    dancer.animate(music || 0, music !== undefined);
    notes.forEach((note, i) => {
      note.visible = music !== undefined;
      note.position.set(
        -3.7 + i * 0.3,
        1.35 + (((music || 0) * 0.5 + i * 0.25) % 1),
        5.75,
      );
    });
    const delivery = active.delivery;
    doors.forEach(
      (door, i) =>
        (door.rotation.y =
          delivery === undefined
            ? 0
            : (i ? -1 : 1) * 1.5 * Math.min(1, delivery, 10 - delivery)),
    );
    worker.g.visible = delivery !== undefined;
    walk(
      worker.g,
      [
        [4.8, -1.65],
        [4.8, -1.98],
        [4.3, -2.25],
        [4.8, -1.98],
        [4.8, -1.65],
      ],
      (delivery || 0) / 10,
    );
    worker.animate(delivery || 0, delivery !== undefined);
    windows.color.set(sim.discoveries.windows ? "#fbd08d" : "#42676a");
    windows.emissiveIntensity = sim.discoveries.windows ? 0.8 : 0;
    const fountain = active.fountain;
    const boost =
      fountain === undefined
        ? 0.2
        : 0.2 + Math.sin((Math.PI * fountain) / 6) * 0.85;
    drops.forEach((drop, i) => {
      const t = (time * 0.7 + (i % 6) / 6) % 1,
        a = (Math.floor(i / 6) * Math.PI) / 2 + Math.PI / 4;
      drop.position.set(
        14.4 + Math.cos(a) * t * 0.62,
        1.23 + Math.sin(t * Math.PI) * boost - t * 0.6,
        Math.sin(a) * t * 0.62,
      );
    });
    diagnostics = {
      fishing: {
        ...cast,
        position: fisher.g.position.toArray(),
        fishVisible: catchGroup.visible,
      },
      walkers: walkers.map(({ id, actor }) => ({
        id,
        position: actor.g.position.toArray(),
        fall: actor.g.rotation.x,
      })),
      helicopter: flight !== undefined,
      helicopterHeight: heli.position.y,
      helicopterPhase: flying.phase,
      helicopterScale: 0.72,
      helicopterColor: "red",
      heistPatrol: !!sim.discoveries.heistFlight,
      notes: notes.filter((note) => note.visible).length,
      fountainBoost: boost,
      windowsLit: sim.discoveries.windows,
      active: Object.keys(active),
    };
  }
  return {
    walkers,
    update,
    target: (id) => {
      if (id === "fisherman")
        return fisher.g.position
          .clone()
          .add(new THREE.Vector3(0, 0.6 * fishingScale, 0));
      const w = walkers.find((w) => w.id === id);
      return w
        ? w.actor.g.position.clone().add(new THREE.Vector3(0, 0.6, 0))
        : null;
    },
    faceCamera: (q) => notes.forEach((note) => note.quaternion.copy(q)),
    diagnostics: () => diagnostics,
  };
}
