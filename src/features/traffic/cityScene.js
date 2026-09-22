import { createPedestrianScene } from "./pedestrianScene";
import { createMilwaukeeTower } from "./milwaukeeTower";
import { WATER_BARRIERS } from "./pedestrianEscape";
import { createBalconyResident } from "./balconyResident";
import { featherMapMaterial } from "./mapFade";
import { createPageLayout } from "./pageLayout";
import { LAKE_ROAD_START } from "./lakeRoad";
import * as THREE from "three";
import { APPROACHES, carPose } from "./trafficSimulation";

import { createCityAdditions } from "./cityAdditions";
import { createDiscoveryScene } from "./discoveryScene";
import { createHeistScene } from "./heistScene";
import { createWaterfrontScene } from "./waterfrontScene";
import { riverBridgeHeight, riverBoatPose } from "./waterfront";
import { DISCOVERIES } from "./littleMilwaukee";

import { SIGNALS } from "./signals";

export function createCityScene(host, controls, onEscape) {
  const buttons = controls.signals;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const city = new THREE.Group();
  scene.add(city);
  const camera = new THREE.OrthographicCamera(-9, 9, 9, -9, 0.1, 260);
  const sky = new THREE.HemisphereLight(0xfff8e8, 0x788576, 2.7);
  scene.add(sky);
  const sun = new THREE.DirectionalLight(0xffedcf, 3.3);
  sun.position.set(-6, 15, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, {
    left: -26,
    right: 26,
    top: 20,
    bottom: -20,
    near: 0.5,
    far: 40,
  });
  sun.shadow.normalBias = 0.025;
  sun.shadow.bias = -0.0003;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd8e8ff, 1.3);
  fill.position.set(8, 6, -9);
  scene.add(fill);

  const materials = new Set(),
    geometries = new Set(),
    textures = new Set();
  const mapYaw = { value: -0.12 };
  const material = (color, more = {}) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.77,
      ...more,
    });
    materials.add(m);
    return m;
  };
  const texture = (canvas) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    textures.add(t);
    return t;
  };
  const palette = {
    base: material("#d7c8ab"),
    edge: material("#e9dec9"),
    asphalt: material("#676c69"),
    pavement: material("#ddd8c8"),
    curb: material("#eee7d7"),
    cream: material("#cdbb8d"),
    ivory: material("#ebdcbc"),
    brick: material("#a67558"),
    terra: material("#b88d6b"),
    trim: material("#f0e4ca"),
    roof: material("#5d6557"),
    green: material("#295b48"),
    glass: material("#42676a", { metalness: 0.22, roughness: 0.3 }),
    dark: material("#253e38"),
    black: material("#303c39"),
    white: material("#f4ebd6"),
    yellow: material("#d9be76"),
    water: material("#779e95", { metalness: 0.25, roughness: 0.35 }),
    leaves: material("#6a8660", { flatShading: true }),
    leaves2: material("#8b9d6b", { flatShading: true }),
  };
  // Only terrain edges feather. Architecture and props use opaque materials,
  // preserving correct depth ordering even in the instanced building batches.
  const terrainMaterials = new Map();
  function terrainMaterial(mat) {
    if (mat.transparent) return mat;
    if (!terrainMaterials.has(mat)) {
      const faded = mat.clone();
      featherMapMaterial(faded, mapYaw);
      terrainMaterials.set(mat, faded);
      materials.add(faded);
    }
    return terrainMaterials.get(mat);
  }
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  geometries.add(unitBox);
  const batches = new Map();
  function box(w, h, d, x, y, z, mat, parent = city, ry = 0) {
    if (parent === city && y + h / 2 <= 0.41 && Math.max(w, d) > 2)
      mat = terrainMaterial(mat);
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry),
      new THREE.Vector3(w, h, d),
    );
    if (parent === city) {
      if (!batches.has(mat)) batches.set(mat, []);
      batches.get(mat).push(matrix);
      return;
    }
    const mesh = new THREE.Mesh(unitBox, mat);
    mesh.matrix.copy(matrix);
    mesh.matrixAutoUpdate = false;
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function mesh(geometry, mat, x, y, z, parent = city) {
    geometries.add(geometry);
    if (parent === city && !mat.transparent) {
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox;
      if (
        y + bounds.max.y <= 0.41 &&
        Math.max(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z) > 2
      )
        mat = terrainMaterial(mat);
    }
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cylinder(radius, height, x, y, z, mat, parent = city, top = radius) {
    return mesh(
      new THREE.CylinderGeometry(top, radius, height, 10),
      mat,
      x,
      y,
      z,
      parent,
    );
  }
  function rod(a, b, radius, mat, parent = city) {
    const from = new THREE.Vector3(...a),
      to = new THREE.Vector3(...b);
    const m = cylinder(radius, from.distanceTo(to), 0, 0, 0, mat, parent);
    m.position.copy(from.clone().add(to).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      to.sub(from).normalize(),
    );
    return m;
  }
  function label(
    text,
    w,
    h,
    x,
    y,
    z,
    {
      color = "#eee4ca",
      background = "#315548",
      ry = 0,
      floor = false,
      size = 48,
      parent = city,
      square = false,
      billboard = false,
    } = {},
  ) {
    const c = document.createElement("canvas");
    c.width = square ? 256 : 768;
    c.height = square ? 256 : 192;
    const ctx = c.getContext("2d");
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, c.width / 2, c.height / 2 + 4);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.add(texture);
    const mat = billboard
      ? new THREE.SpriteMaterial({
          map: texture,
          depthTest: false,
          depthWrite: false,
          toneMapped: false,
        })
      : new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
    materials.add(mat);
    if (billboard) {
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(w, h, 1);
      sprite.renderOrder = 20;
      parent.add(sprite);
      return sprite;
    }
    const m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent);
    m.rotation.y = ry;
    if (floor) m.rotation.x = -Math.PI / 2;
    m.castShadow = false;
    return m;
  }

  // A cut-out city block, with the river and a little Wisconsin Avenue bridge.
  box(14.4, 0.34, 13.8, 0, -0.05, 0, palette.base);
  box(14.5, 0.07, 13.9, 0, -0.24, 0, palette.edge);
  box(14.25, 0.12, 13.65, 0, 0.18, 0, palette.pavement);
  for (const z of [-4.4, -2.8, 2.7, 4.5]) {
    for (let j = 0; j < 3; j++)
      box(
        0.2 + j * 0.15,
        0.005,
        0.014,
        -6.3 + j * 0.22,
        0.282,
        z + j * 0.13,
        palette.edge,
      );
  }
  // Leave the river span open for the two moving bridge leaves.
  box(0.275, 0.045, 2.75, -6.9875, 0.28, 0, palette.asphalt);
  box(12.175, 0.045, 2.75, 1.0375, 0.28, 0, palette.asphalt);
  box(
    2.75,
    0.045,
    6.825 + LAKE_ROAD_START,
    0,
    0.28,
    (LAKE_ROAD_START - 6.825) / 2,
    palette.asphalt,
  );
  // Longer road arms hold eight cars per approach without making the buildings smaller.
  for (const q of [-1, 1]) {
    for (const horizontal of [false, true]) {
      if (horizontal && q === 1) continue;
      if (!horizontal) continue;
      const arm = (w, h, d, y, mat) =>
        box(
          horizontal ? d : w,
          h,
          horizontal ? w : d,
          horizontal ? q * 8.35 : 0,
          y,
          horizontal ? 0 : q * 8.35,
          mat,
        );
      arm(2.95, 0.34, 3.3, -0.05, palette.base);
      arm(3.04, 0.07, 3.36, -0.24, palette.edge);
      arm(2.9, 0.12, 3.3, 0.18, palette.pavement);
      arm(2.75, 0.045, 3.3, 0.28, palette.asphalt);
    }
  }
  for (let q of [-1, 1]) {
    // Four raised sidewalks and scored paving joints.
    for (let r of [-1, 1]) {
      box(3.56, 0.12, 4.75, q * 3.38, 0.34, r * 4.075, palette.curb);
      for (let i = 0; i < 9; i++)
        box(
          0.008,
          0.006,
          0.55,
          q * (1.66 + i * 0.39),
          0.404,
          r * 1.98,
          palette.base,
        );
      for (let i = 0; i < 11; i++)
        box(
          0.55,
          0.006,
          0.008,
          q * 1.98,
          0.404,
          r * (1.66 + i * 0.41),
          palette.base,
        );
    }
    // Broken center lines never run through the intersection.
    for (let p = 2.5; p < 9.8; p += 0.68) {
      for (let lane of [-0.035, 0.035]) {
        if (q < 0 || p < LAKE_ROAD_START - 0.2)
          box(0.025, 0.006, 0.42, lane, 0.306, q * p, palette.yellow);
        if (q * p < -6.85 || q * p > -5.05)
          box(0.42, 0.006, 0.025, q * p, 0.306, lane, palette.yellow);
      }
    }
    for (let i = -5; i <= 5; i++) {
      box(0.12, 0.008, 0.38, i * 0.205, 0.307, q * 1.66, palette.white);
      box(0.38, 0.008, 0.12, q * 1.66, 0.307, i * 0.205, palette.white);
    }
    box(1.08, 0.009, 0.045, -q * 0.64, 0.308, q * 2.0, palette.white);
    box(0.045, 0.009, 1.08, q * 2.0, 0.308, q * 0.64, palette.white);
    // Bridge balustrades and riverwalk railing.
    for (let z = 2.25; z < 6.5; z += 0.36)
      rod([-5.03, 0.3, q * z], [-5.03, 0.65, q * z], 0.016, palette.dark);
    rod([-5.03, 0.66, q * 2.2], [-5.03, 0.66, q * 6.55], 0.025, palette.dark);
  }
  label("MILWAUKEE", 3.5, 0.28, 0, -0.06, 6.91, {
    background: null,
    color: "#766b52",
    size: 52,
  });
  label("WISCONSIN AVE", 2.8, 0.32, 4.42, 0.312, 0.01, {
    background: null,
    color: "#c7c9b9",
    floor: true,
    size: 37,
  });
  const waterName = label("WATER ST", 2.0, 0.3, 0, 0.313, -4.7, {
    background: null,
    color: "#c7c9b9",
    floor: true,
    size: 42,
  });
  waterName.rotation.z = Math.PI / 2;

  const buildingBounds = [];
  function building({
    x,
    z,
    w,
    d,
    h,
    floors = 4,
    body = palette.cream,
    glass = palette.glass,
    ornate = false,
    landmark = false,
  }) {
    const bottom = 0.41;
    buildingBounds.push(
      new THREE.Box3(
        new THREE.Vector3(x - w / 2, 0.41, z - d / 2),
        new THREE.Vector3(x + w / 2, 0.41 + h, z + d / 2),
      ),
    );
    if (landmark) {
      createMilwaukeeTower({ x, z, w, d, h, box, rod, label, palette });
      return;
    }
    box(w, h, d, x, bottom + h / 2, z, body);
    box(w + 0.13, 0.14, d + 0.13, x, bottom + 0.07, z, palette.trim);
    box(w + 0.2, 0.12, d + 0.2, x, bottom + h + 0.025, z, palette.trim);
    box(w - 0.18, 0.08, d - 0.18, x, bottom + h + 0.08, z, palette.roof);
    for (let f = 0; f < floors; f++) {
      const y = bottom + 0.4 + (f * (h - 0.52)) / floors;
      for (let i = 0; i < Math.floor(w / 0.46); i++) {
        const xx =
          x -
          w / 2 +
          0.25 +
          (i * (w - 0.5)) / Math.max(1, Math.floor(w / 0.46) - 1);
        for (const sign of [-1, 1]) {
          box(0.24, 0.31, 0.025, xx, y, z + sign * (d / 2 + 0.02), glass);
          box(
            0.3,
            0.035,
            0.065,
            xx,
            y - 0.17,
            z + sign * (d / 2 + 0.036),
            palette.trim,
          );
          if (ornate) {
            box(
              0.29,
              0.045,
              0.055,
              xx,
              y + 0.17,
              z + sign * (d / 2 + 0.035),
              palette.trim,
            );
          }
        }
      }
      for (let i = 0; i < Math.floor(d / 0.46); i++) {
        const zz =
          z -
          d / 2 +
          0.25 +
          (i * (d - 0.5)) / Math.max(1, Math.floor(d / 0.46) - 1);
        for (const sign of [-1, 1]) {
          box(0.025, 0.31, 0.24, x + sign * (w / 2 + 0.02), y, zz, glass);
          box(
            0.065,
            0.035,
            0.3,
            x + sign * (w / 2 + 0.036),
            y - 0.17,
            zz,
            palette.trim,
          );
        }
      }
      if (ornate) {
        box(w + 0.09, 0.055, d + 0.09, x, y + 0.26, z, palette.trim);
        for (let side of [-1, 1])
          for (let i = 0; i < Math.floor(w / 0.32); i++)
            box(
              0.06,
              0.085,
              0.1,
              x - w / 2 + 0.13 + i * 0.32,
              bottom + h - 0.075,
              z + (side * d) / 2,
              palette.trim,
            );
      }
    }
    box(0.45, 0.18, 0.5, x + 0.35, bottom + h + 0.21, z + 0.25, palette.base);
    box(0.32, 0.06, 0.34, x + 0.35, bottom + h + 0.32, z + 0.25, palette.dark);
  }
  // Iron Block-inspired Italianate corner: cornices, paired columns and warm ironwork.
  const discoveryWindows = material("#42676a", {
    emissive: "#ffc565",
    emissiveIntensity: 0,
  });
  building({
    x: 3.55,
    z: 3.58,
    w: 2.45,
    d: 2.6,
    h: 2.15,
    floors: 4,
    body: palette.ivory,
    glass: discoveryWindows,
    ornate: true,
  });
  for (let i = 0; i < 6; i++) {
    cylinder(0.035, 0.48, 2.49 + i * 0.4, 0.78, 2.245, palette.trim);
    cylinder(0.035, 0.48, 2.3, 0.78, 2.47 + i * 0.43, palette.trim);
  }
  label("IRON BLOCK", 1.5, 0.18, 3.56, 1.13, 2.246, {
    color: "#5b614d",
    background: "#d7c49b",
    size: 43,
    ry: Math.PI,
  });
  label("IRON BLOCK", 1.5, 0.18, 2.316, 1.13, 3.6, {
    color: "#5b614d",
    background: "#d7c49b",
    size: 43,
    ry: -Math.PI / 2,
  });
  for (let i = 0; i < 5; i++)
    box(0.36, 0.1, 0.48, 2.69 + i * 0.43, 0.94, 2.13, palette.green);

  // A compressed, stepped cream tower recalls 100 East without hiding the game.
  building({ x: -3.38, z: -3.72, w: 2.35, d: 2.65, h: 3.1, floors: 6 });
  box(1.92, 0.64, 2.18, -3.38, 3.91, -3.72, palette.ivory);
  for (let i = 0; i < 4; i++)
    box(0.21, 0.38, 0.035, -4.07 + i * 0.46, 3.92, -2.61, palette.glass);
  const crown = mesh(
    new THREE.ConeGeometry(1.43, 0.9, 4),
    palette.green,
    -3.38,
    4.65,
    -3.72,
  );
  crown.rotation.y = Math.PI / 4;
  cylinder(0.035, 0.42, -3.38, 5.16, -3.72, palette.dark);
  // Red masonry, a copper roof and a little corner café on the east block.
  building({
    x: 3.48,
    z: -3.7,
    w: 2.35,
    d: 2.6,
    h: 2.75,
    floors: 5,
    body: palette.brick,
    ornate: true,
  });
  box(2.1, 0.13, 2.33, 3.48, 3.32, -3.7, palette.green);
  label("WATER STREET", 1.7, 0.22, 3.48, 1.13, -2.375, {
    color: "#eee2c2",
    background: "#345945",
    size: 43,
  });
  for (let i = 0; i < 6; i++)
    box(0.34, 0.12, 0.48, 2.52 + i * 0.39, 1.02, -2.23, palette.green);
  // Low riverside glass pavilion preserves a view into the intersection.
  building({
    x: -3.37,
    z: 3.65,
    w: 2.22,
    d: 2.8,
    h: 1.65,
    floors: 3,
    body: palette.glass,
    glass: palette.dark,
  });
  for (let i = 0; i < 8; i++)
    box(0.035, 1.59, 2.87, -4.37 + i * 0.287, 1.27, 3.65, palette.trim);
  box(2.4, 0.13, 2.94, -3.37, 2.13, 3.65, palette.trim);
  label("RIVERWALK", 1.7, 0.19, -3.37, 0.88, 2.224, {
    background: "#49685c",
    size: 42,
    ry: Math.PI,
  });

  const leafGeometry = new THREE.IcosahedronGeometry(0.34, 1);
  geometries.add(leafGeometry);
  function tree(x, z, large = false) {
    cylinder(0.037, 0.65, x, 0.71, z, palette.terra);
    box(0.5, 0.13, 0.5, x, 0.47, z, palette.base);
    for (let i = 0; i < 3; i++) {
      const m = mesh(
        leafGeometry,
        i % 2 ? palette.leaves : palette.leaves2,
        x + (i - 1) * 0.16,
        1.1 + (i % 2) * 0.22,
        z + (i % 2) * 0.12,
      );
      if (large) m.scale.setScalar(1.22);
    }
  }
  for (const p of [
    [-4.72, -1.95],
    [-4.75, 2.02],
    [-4.73, 5.62],
    [2.05, 5.82],
    [5.12, 2.0],
    [4.98, -1.98],
    [2.03, -5.77],
    [-1.96, -5.83],
  ])
    tree(...p);
  function lamp(x, z) {
    cylinder(0.035, 1.35, x, 1.03, z, palette.dark);
    cylinder(0.11, 0.15, x, 1.77, z, palette.dark);
    const glow = material("#fff0bb", {
      emissive: "#e7bf6e",
      emissiveIntensity: 0.5,
    });
    mesh(new THREE.SphereGeometry(0.085, 10, 8), glow, x, 1.78, z);
    cylinder(0.15, 0.055, x, 1.9, z, palette.dark, city, 0.035);
  }
  for (const p of [
    [-1.85, 4.0],
    [1.85, -4.0],
    [4.6, 1.84],
    [-3.25, -1.83],
  ])
    lamp(...p);
  for (const [x, z] of [
    [-4.63, 3.1],
    [2.02, 4.7],
    [4.5, -1.89],
  ]) {
    box(0.22, 0.1, 0.67, x, 0.66, z, palette.green);
    box(0.055, 0.26, 0.67, x + 0.11, 0.82, z, palette.green);
    for (const q of [-0.24, 0.24])
      box(0.17, 0.22, 0.04, x, 0.49, z + q, palette.dark);
  }
  // Awnings, fire hydrants, planters and a river boat keep the small scale tangible.
  for (const [x, z] of [
    [1.79, 2.67],
    [-2.75, -1.83],
  ]) {
    cylinder(0.065, 0.24, x, 0.55, z, palette.yellow);
    cylinder(0.09, 0.05, x, 0.69, z, palette.yellow);
  }
  for (const [x, z] of [
    [-4.58, -4.85],
    [5.02, 4.86],
    [4.88, -5.26],
  ]) {
    box(0.57, 0.2, 0.52, x, 0.5, z, palette.green);
    box(0.49, 0.16, 0.43, x, 0.67, z, palette.leaves);
  }
  for (const [x, z, color] of [
    [1.97, 2.9, palette.brick],
    [-1.93, -3.15, palette.green],
    [3.9, 1.98, palette.yellow],
  ]) {
    cylinder(0.055, 0.22, x, 0.62, z, color);
    mesh(new THREE.SphereGeometry(0.06, 10, 8), palette.terra, x, 0.8, z);
  }

  const bulbMaterial = (color) => {
    const m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    materials.add(m);
    return m;
  };
  const lampMaterials = {
    red: bulbMaterial("#f35b43"),
    amber: bulbMaterial("#ffc849"),
    blue: bulbMaterial("#6495ff"),
    green: bulbMaterial("#59e09a"),
    off: material("#263c32"),
  };
  const additions = createCityAdditions({
    city,
    palette,
    box,
    mesh,
    cylinder,
    rod,
    unitBox,
    lampMaterials,
  });
  const discoveries = createDiscoveryScene({
    city,
    palette,
    box,
    mesh,
    cylinder,
    rod,
    label,
    material,
    tree,
    building,
    windows: discoveryWindows,
    texture,
  });
  const waterfront = createWaterfrontScene({
    city,
    palette,
    box,
    mesh,
    cylinder,
    rod,
    material,
    texture,
    building,
    tree,
  });
  const heist = createHeistScene({
    city,
    palette,
    box,
    mesh,
    cylinder,
    rod,
    label,
    material,
  });
  const pedestrianScene = createPedestrianScene({
    city,
    walkers: [...discoveries.walkers, ...waterfront.walkers],
    palette,
    box,
    mesh,
    cylinder,
    rod,
    label,
    material,
    texture,
  });
  const balcony = createBalconyResident({
    city,
    palette,
    box,
    mesh,
    cylinder,
    rod,
    material,
  });
  const boat = additions.createBoat();
  city.add(boat);
  boat.position.set(-5.94, 0.38, 3.7);
  const signals = SIGNALS.map((config) => {
    const s = config;
    const parent = new THREE.Group();
    city.add(parent);
    cylinder(0.043, 1.4, s.postX, 1.08, s.postZ, palette.dark, parent);
    cylinder(0.095, 0.15, s.postX, 0.47, s.postZ, palette.dark, parent);
    rod(
      [s.postX, 1.72, s.postZ],
      [s.x, 1.72, s.z],
      0.035,
      palette.dark,
      parent,
    );
    const head = new THREE.Group();
    head.position.set(s.x, 1.51, s.z);
    head.rotation.y = s.yaw;
    parent.add(head);
    box(0.3, 0.81, 0.22, 0, 0, 0, palette.dark, head);
    const bulbs = [];
    for (let i = 0; i < 3; i++) {
      // Two faces keep the controls legible as the miniature turns.
      const pair = [];
      for (const q of [-1, 1]) {
        const bulb = mesh(
          new THREE.SphereGeometry(0.099, 12, 10),
          lampMaterials.off,
          0,
          0.255 - i * 0.255,
          q * 0.13,
          head,
        );
        bulb.scale.z = 0.5;
        pair.push(bulb);
        box(
          0.2,
          0.033,
          0.11,
          0,
          0.37 - i * 0.255,
          q * 0.14,
          palette.dark,
          head,
        );
      }
      bulbs.push(pair);
    }
    return { ...config, head, bulbs, group: parent };
  });
  for (const s of [SIGNALS[1], SIGNALS[2]]) {
    label(
      s.axis === "water" ? "N WATER ST" : "E WISCONSIN AVE",
      0.9,
      0.14,
      s.postX,
      1.22,
      s.postZ + 0.06,
      { size: 37 },
    );
  }

  // Batch the architecture: hundreds of small details, only a few static draws.
  for (const [mat, matrices] of batches) {
    const instances = new THREE.InstancedMesh(unitBox, mat, matrices.length);
    matrices.forEach((m, i) => instances.setMatrixAt(i, m));
    instances.castShadow = instances.receiveShadow = true;
    city.add(instances);
  }

  const colors = [
    "#c9994b",
    "#698b8e",
    "#ece0c4",
    "#ab6854",
    "#385e4b",
    "#8e989d",
  ].map((c) => material(c, { metalness: 0.2, roughness: 0.39 }));
  const tireGeometry = new THREE.CylinderGeometry(0.105, 0.105, 0.065, 12);
  geometries.add(tireGeometry);
  const carMeshes = new Map();
  function vehicle(car) {
    const group = new THREE.Group();
    city.add(group);
    const l = car.length,
      paint =
        car.ambulance || car.police || car.news
          ? palette.white
          : colors[car.color];
    box(
      0.39,
      car.bus || car.ambulance ? 0.31 : 0.18,
      l,
      0,
      0.48,
      0,
      paint,
      group,
    );
    box(
      0.33,
      car.bus || car.ambulance ? 0.22 : 0.17,
      car.bus || car.ambulance ? l * 0.8 : l * 0.48,
      0,
      car.bus || car.ambulance ? 0.68 : 0.65,
      -0.045,
      palette.glass,
      group,
    );
    box(
      0.35,
      0.035,
      car.bus || car.ambulance ? l * 0.85 : l * 0.43,
      0,
      car.bus || car.ambulance ? 0.8 : 0.75,
      -0.045,
      paint,
      group,
    );
    box(0.37, 0.06, 0.06, 0, 0.39, l / 2, palette.trim, group);
    for (const side of [-1, 1]) {
      for (const pos of [-1, 1]) {
        const wheel = mesh(
          tireGeometry,
          palette.black,
          side * 0.201,
          0.375,
          pos * l * 0.31,
          group,
        );
        wheel.rotation.z = Math.PI / 2;
      }
      box(
        0.07,
        0.035,
        0.022,
        side * 0.125,
        0.52,
        l / 2 + 0.011,
        palette.white,
        group,
      );
    }
    const brakes = [];
    for (const side of [-1, 1])
      brakes.push(
        box(
          0.085,
          0.042,
          0.025,
          side * 0.125,
          0.51,
          -l / 2 - 0.015,
          lampMaterials.red,
          group,
        ),
      );
    const blinkers = [-1, 1].map((side) =>
      [-1, 1].map((end) =>
        box(
          0.065,
          0.04,
          0.024,
          side * 0.17,
          0.54,
          end * (l / 2 + 0.022),
          lampMaterials.amber,
          group,
        ),
      ),
    );
    const beacons = [];
    if (car.ambulance || car.police) {
      const blue = lampMaterials.blue;
      const roof = car.police ? 0.8 : 0.86;
      beacons.push(
        box(0.15, 0.08, 0.13, -0.1, roof, 0.1, lampMaterials.red, group),
      );
      beacons.push(box(0.15, 0.08, 0.13, 0.1, roof, 0.1, blue, group));
    }
    if (car.police)
      for (const side of [-1, 1])
        box(0.018, 0.09, l * 0.7, side * 0.202, 0.51, 0, palette.dark, group);
    if (car.news) {
      cylinder(0.025, 0.15, 0, 0.91, -0.2, palette.dark, group);
      const dish = mesh(
        new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        palette.trim,
        0,
        0.99,
        -0.2,
        group,
      );
      dish.rotation.z = 0.6;
    }
    if (car.ambulance) {
      for (const side of [-1, 1]) {
        box(
          0.018,
          0.16,
          0.055,
          side * 0.202,
          0.63,
          -0.21,
          lampMaterials.red,
          group,
        );
        box(
          0.019,
          0.05,
          0.18,
          side * 0.203,
          0.63,
          -0.21,
          lampMaterials.red,
          group,
        );
      }
    }
    return {
      group,
      brakes,
      blinkers,
      beacons,
      ambulance: car.ambulance,
      police: car.police,
    };
  }
  const effects = [];
  const effectTemplates = {};
  for (const kind of ["passed", "crash", "honk", "toot", "thanks"]) {
    effectTemplates[kind] = label(
      {
        honk: "*honk*",
        toot: "*toot*",
        thanks: "thanks!",
        passed: "",
        crash: "*crash*",
      }[kind],
      2.2,
      0.7,
      0,
      0,
      0,
      {
        background: null,
        color:
          kind === "honk"
            ? "#6b604d"
            : kind === "passed"
              ? "#416049"
              : "#b45f45",
        size: 150,
        parent: new THREE.Group(),
      },
    );
  }
  for (const template of Object.values(effectTemplates))
    template.material.depthTest = false;
  function effect(event) {
    const group = new THREE.Group();
    city.add(group);
    group.position.set(event.x, event.kind === "honk" ? 1.45 : 0.95, event.z);
    const text = effectTemplates[event.kind].clone();
    text.renderOrder = 50;
    group.add(text);
    effects.push({ group, text, life: 1.3, honk: event.kind === "honk" });
    if (event.kind === "crash") {
      for (let i = 0; i < 4; i++)
        mesh(
          leafGeometry,
          palette.base,
          (i - 1.5) * 0.1,
          -0.35 + (i % 2) * 0.1,
          0,
          group,
        ).scale.setScalar(0.35);
    }
  }
  const falling = [];
  // Reuse one offscreen target to photograph the real 3D car at handoff.
  const stampTarget = new THREE.WebGLRenderTarget(96, 96);
  stampTarget.texture.colorSpace = THREE.SRGBColorSpace;
  stampTarget.samples = 4;
  const stampScene = new THREE.Scene();
  stampScene.add(new THREE.HemisphereLight(0xfff8e8, 0x788576, 2.7));
  const stampLight = new THREE.DirectionalLight(0xffedcf, 3.3);
  stampLight.position.copy(sun.position);
  stampScene.add(stampLight);
  const stampCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 30);
  function stamp(group, span, boat = false) {
    const clone = group.clone(true);
    // Keep the cabin and deck readable once the boat becomes a spinning page sprite.
    if (boat) clone.rotation.set(-0.08, group.rotation.y, 0.16);
    clone.position.copy(
      new THREE.Vector3(0, boat ? 0.24 : 0.5, 0)
        .applyQuaternion(clone.quaternion)
        .multiplyScalar(-1),
    );
    const pivot = new THREE.Group();
    pivot.rotation.y = yaw;
    pivot.add(clone);
    stampScene.add(pivot);
    stampCamera.left = stampCamera.bottom = -span / 2;
    stampCamera.right = stampCamera.top = span / 2;
    stampCamera.position.copy(camera.position).normalize().multiplyScalar(10);
    if (boat) stampCamera.position.y = Math.max(6, stampCamera.position.y);
    stampCamera.lookAt(0, 0, 0);
    stampCamera.updateProjectionMatrix();
    renderer.setRenderTarget(stampTarget);
    renderer.render(stampScene, stampCamera);
    const pixels = new Uint8Array(96 * 96 * 4);
    renderer.readRenderTargetPixels(stampTarget, 0, 0, 96, 96, pixels);
    renderer.setRenderTarget(null);
    stampScene.remove(pivot);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 96;
    const ctx = canvas.getContext("2d");
    const data = ctx.createImageData(96, 96);
    for (let row = 0; row < 96; row++)
      data.data.set(
        pixels.subarray((95 - row) * 384, (96 - row) * 384),
        row * 384,
      );
    ctx.putImageData(data, 0, 0);
    return canvas;
  }
  function spill(event) {
    const boat = event.kind === "boat-fall";
    const car = boat
      ? {
          id: event.boat.id,
          lane: event.boat.direction === 1 ? 0 : 2,
          length: 1.15,
        }
      : event.car;
    const model = boat
      ? { group: additions.takeBoat(event.boat) }
      : carMeshes.get(car.id) || vehicle(car);
    if (!boat) carMeshes.delete(car.id);
    // Never spawn a page sprite from an intersection hidden by copy or the
    // viewport. The player must actually see the launch in the miniature.
    if (!visibleOnPage(project(new THREE.Vector3(event.x, 0.6, event.z)))) {
      city.remove(model.group);
      return;
    }
    city.add(model.group);
    const lane = APPROACHES[car.lane];
    model.group.rotation.set(0, event.yaw, 0);
    falling.push({
      ...event,
      car,
      boat,
      group: model.group,
      life: 0,
      seenFor: 0,
      sx: boat ? (event.boat.direction === 1 ? -1 : 1) : -lane.dz,
      sz: boat ? 0 : lane.dx,
    });
  }
  let yaw = -0.12,
    pitch = 0.77,
    zoom = 1,
    panX = 0,
    panY = 0,
    width = 1,
    height = 1,
    disposed = false;
  const pageLayout = createPageLayout(host, () => resize());
  function view() {
    city.rotation.y = yaw;
    mapYaw.value = yaw;
    const distance = 110;
    camera.position.set(
      Math.sin(0.7) * Math.cos(pitch) * distance,
      Math.sin(pitch) * distance,
      Math.cos(0.7) * Math.cos(pitch) * distance,
    );
    const focus = new THREE.Vector3(8, 0.95, -1.7).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw,
    );
    focus.add(
      new THREE.Vector3(Math.cos(0.7), 0, -Math.sin(0.7)).multiplyScalar(panX),
    );
    focus.add(
      new THREE.Vector3(
        -Math.sin(0.7) * Math.sin(pitch),
        Math.cos(pitch),
        -Math.cos(0.7) * Math.sin(pitch),
      ).multiplyScalar(panY),
    );
    camera.position.add(focus);
    camera.lookAt(focus);
    const layout = pageLayout.view;
    const unitsPerPixel = 1 / (Math.max(1, layout.scale) * zoom);
    camera.left = -layout.anchorX * unitsPerPixel;
    camera.right = (width - layout.anchorX) * unitsPerPixel;
    camera.top = layout.anchorY * unitsPerPixel;
    camera.bottom = -(height - layout.anchorY) * unitsPerPixel;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    city.updateMatrixWorld(true);
  }
  function project(point) {
    const p = point.clone().applyMatrix4(city.matrixWorld).project(camera);
    return { x: ((p.x + 1) * width) / 2, y: ((1 - p.y) * height) / 2 };
  }
  function visibleOnPage(point) {
    const bounds = host.getBoundingClientRect();
    const x = bounds.left + point.x,
      y = bounds.top + point.y;
    return (
      point.x > 0 &&
      point.x < width &&
      point.y > 0 &&
      point.y < height &&
      x > 0 &&
      x < document.documentElement.clientWidth &&
      y > 0 &&
      y < innerHeight &&
      !pageLayout.protects(point.x, point.y, 44) &&
      !!document.elementFromPoint(x, y)?.closest(".traffic-city__surface")
    );
  }
  function signalPoint(s) {
    return new THREE.Vector3(s.x, 1.51, s.z);
  }
  const discoveryPoint = (item) =>
    pedestrianScene.target(item.id) ||
    (item.id === "balconyResident" ? balcony.target() : null) ||
    discoveries.target(item.id) ||
    waterfront.target(item.id) ||
    new THREE.Vector3(...item.point);
  function occluded(point) {
    const cameraLocal = city.worldToLocal(camera.position.clone());
    const ray = new THREE.Ray(
      cameraLocal,
      point.clone().sub(cameraLocal).normalize(),
    );
    const distance = cameraLocal.distanceTo(point),
      hit = new THREE.Vector3();
    return buildingBounds.some(
      (bounds) =>
        ray.intersectBox(bounds, hit) &&
        cameraLocal.distanceTo(hit) < distance - 0.12,
    );
  }
  function positionButtons() {
    const targets = [
      ...signals.map((signal, index) => ({
        button: buttons[index],
        ...project(signalPoint(signal)),
      })),
      {
        button: controls.bridge.current,
        ...project(new THREE.Vector3(-5.95, 0.6, 0)),
      },
      ...DISCOVERIES.map((item, index) => ({
        button: controls.discoveries[index],
        label: pedestrianScene.label(item.id) || item.label,
        hidden:
          pedestrianScene.hidden(item.id) ||
          ((item.loopDuration ||
            item.id === "balconyResident" ||
            item.id === "payphone") &&
            occluded(discoveryPoint(item))),
        ...project(discoveryPoint(item)),
      })),
    ].filter((target) => target.button);
    for (const target of targets) {
      const { button, x, y } = target;
      if (target.label) {
        button.setAttribute("aria-label", target.label);
        button.title = target.label;
      }
      const left = x - button.offsetWidth / 2,
        top = y - button.offsetHeight / 2;
      let polygon = [
        [Math.max(0, left), Math.max(0, top)],
        [Math.min(width, left + button.offsetWidth), Math.max(0, top)],
        [
          Math.min(width, left + button.offsetWidth),
          Math.min(height, top + button.offsetHeight),
        ],
        [Math.max(0, left), Math.min(height, top + button.offsetHeight)],
      ];
      // Large invisible hit areas must not cover a neighboring signal head.
      // Clip each area at the midpoint to the other projected controls.
      for (const other of targets) {
        if (other === target || !polygon.length) continue;
        const dx = other.x - x,
          dy = other.y - y;
        const distance = (point) =>
          dx * (point[0] - x) + dy * (point[1] - y) - (dx * dx + dy * dy) / 2;
        const clipped = [];
        for (let i = 0; i < polygon.length; i++) {
          const start = polygon[i],
            end = polygon[(i + 1) % polygon.length];
          const a = distance(start),
            b = distance(end);
          if (a <= 0) clipped.push(start);
          if (a <= 0 !== b <= 0) {
            const fraction = a / (a - b);
            clipped.push([
              start[0] + (end[0] - start[0]) * fraction,
              start[1] + (end[1] - start[1]) * fraction,
            ]);
          }
        }
        polygon = clipped;
      }
      button.style.transform = `translate(${left}px, ${top}px)`;
      const offscreen =
        target.hidden ||
        x < 0 ||
        x > width ||
        y < 0 ||
        y > height ||
        pageLayout.protects(x, y);
      button.style.visibility = offscreen ? "hidden" : "visible";
      button.style.clipPath = `polygon(${polygon.map(([px, py]) => `${(px - left).toFixed(2)}px ${(py - top).toFixed(2)}px`).join(",")})`;
    }
  }

  function render() {
    if (disposed) return;
    view();
    if (currentSim?.discoveries.pedestrians.environment)
      currentSim.discoveries.pedestrians.environment.camera = city
        .worldToLocal(camera.position.clone())
        .toArray();
    discoveries.faceCamera(
      camera.quaternion.clone().premultiply(city.quaternion.clone().invert()),
    );
    pedestrianScene.faceCamera(
      camera.quaternion.clone().premultiply(city.quaternion.clone().invert()),
      0.7 - yaw,
      occluded,
    );
    positionButtons();
    renderer.render(scene, camera);
  }
  function resize() {
    const nextWidth = host.clientWidth,
      nextHeight = host.clientHeight;
    if (!nextWidth || !nextHeight) return;
    if (width !== nextWidth || height !== nextHeight) {
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height);
    }

    render();
  }
  let currentSim = null;
  function update(sim, dt = 0) {
    currentSim = sim;
    if (!sim.discoveries.pedestrians.obstacles.length)
      sim.discoveries.pedestrians.obstacles = buildingBounds.map((b) => [
        b.min.x,
        b.min.z,
        b.max.x,
        b.max.z,
      ]);
    const pedestrians = sim.discoveries.pedestrians;
    pedestrians.environment = {
      camera: city.worldToLocal(camera.position.clone()).toArray(),
      buildings: buildingBounds.map((b) => [
        ...b.min.toArray(),
        ...b.max.toArray(),
      ]),
      obstacles: pedestrians.obstacles,
      water: WATER_BARRIERS,
      lightsOn: sim.discoveries.windows,
      bridgeOpen: sim.bridge.gated,
      cars: sim.cars
        .filter((c) => !c.remove)
        .map((c) => ({
          id: c.id,
          ...carPose(c),
          speed: c.speed,
          service: !!c.service,
        })),
      boats: sim.bridge.boats
        .filter((b) => !b.remove)
        .map((b) => ({ id: b.id, ...riverBoatPose(b) })),
    };
    pedestrianScene.update(sim);
    balcony.update(sim);
    additions.update(sim, dt);
    discoveries.update(sim);
    waterfront.update(sim);
    heist.update(sim);
    // Transfer overflow meshes before removing cars no longer in the simulation.
    for (const event of sim.events.splice(0)) {
      if (event.kind === "overflow" || event.kind === "boat-fall") spill(event);
      else effect(event);
    }
    const live = new Set();
    for (const car of sim.cars) {
      live.add(car.id);
      if (!carMeshes.has(car.id)) carMeshes.set(car.id, vehicle(car));
      const { group, brakes, blinkers, beacons } = carMeshes.get(car.id),
        p = carPose(car);
      const elevation = riverBridgeHeight(p.x, p.z);
      const ahead = carPose({ ...car, p: car.p + 0.02 });
      const grade = Math.atan2(
        riverBridgeHeight(ahead.x, ahead.z) - elevation,
        0.02,
      );
      group.position.set(p.x, elevation, p.z);
      group.rotation.set(-grade, p.yaw, 0, "YXZ");
      const blink = Math.sin(sim.time * 9) > 0;
      blinkers.forEach((pair, i) =>
        pair.forEach((b) => {
          b.visible =
            blink &&
            (car.crashed ||
              (p.out === null && car.turn === (i === 0 ? "right" : "left")));
        }),
      );
      beacons.forEach((b, i) => {
        b.visible = Math.floor(sim.time * 10) % 2 === i;
      });
      brakes.forEach((m) => {
        m.visible = car.speed < 0.7 || !!car.crashed;
      });
      group.visible = !car.remove;
    }
    for (const [id, m] of carMeshes)
      if (!live.has(id)) {
        city.remove(m.group);
        carMeshes.delete(id);
      }
    signals.forEach((s) =>
      s.bulbs.forEach((pair, i) =>
        pair.forEach((b) => {
          b.material =
            sim.signalsAt(s.junction)[s.axis].color ===
            ["red", "amber", "green"][i]
              ? lampMaterials[["red", "amber", "green"][i]]
              : lampMaterials.off;
        }),
      ),
    );
    for (let i = falling.length - 1; i >= 0; i--) {
      const f = falling[i];
      f.life += dt;
      const t = f.life;
      const side = Math.min(2.3, t * 3.8);
      const drop = Math.max(0, t - 0.28);
      f.group.position.set(
        f.x + f.sx * side,
        (f.boat ? 0.38 : 0) +
          (["crash", "bridge"].includes(f.reason)
            ? Math.sin(Math.min(1, t / 0.6) * Math.PI) * 1.2
            : 0) -
          5 * drop * drop,
        f.z + f.sz * side,
      );
      f.group.rotation.z = f.boat
        ? -Math.min(0.48, t * 1.4)
        : -Math.min(2.3, t * 4.5);
      f.group.rotation.x = t * (f.boat ? 0.22 : 0.9);
      {
        const center = new THREE.Vector3(0, 0.5, 0)
          .applyQuaternion(f.group.quaternion)
          .add(f.group.position);
        const point = project(center);
        if (!visibleOnPage(point)) {
          city.remove(f.group);
          falling.splice(i, 1);
          continue;
        }
        f.seenFor += dt;
        if (t <= 0.59 || f.seenFor < 0.12) continue;
        const velocity = project(
          center
            .clone()
            .add(new THREE.Vector3(f.sx * 0.38, -drop, f.sz * 0.38)),
        );
        const span = f.boat ? 2 : f.car.bus ? 1.8 : 1.45;
        const pixelsPerUnit = height / (camera.top - camera.bottom);
        onEscape?.({
          ...point,
          vx: (velocity.x - point.x) * 10,
          vy: (velocity.y - point.y) * 10,
          size: span * pixelsPerUnit,
          radius: f.car.length * pixelsPerUnit * 0.48,
          sprite: stamp(f.group, span, f.boat),
          spin: (f.car.id % 2 ? 1 : -1) * 3.5,
        });
        city.remove(f.group);
        falling.splice(i, 1);
      }
    }
    for (let i = effects.length - 1; i >= 0; i--) {
      const f = effects[i];
      f.life -= dt;
      f.group.position.y += dt * (f.honk ? 0.65 : 0.45);
      if (f.honk)
        f.text.scale.setScalar(1 + Math.sin((1.3 - f.life) * 24) * 0.065);
      f.text.quaternion
        .copy(camera.quaternion)
        .premultiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            -yaw,
          ),
        );
      if (f.life <= 0) {
        city.remove(f.group);
        effects.splice(i, 1);
      }
    }
    boat.visible = !sim.started;
    boat.position.y = 0.38 + Math.sin(sim.time * 1.6) * 0.022;
  }
  function clear() {
    for (const m of carMeshes.values()) city.remove(m.group);
    carMeshes.clear();
    additions.clear();
    for (const f of effects) {
      city.remove(f.group);
    }
    effects.length = 0;
    for (const f of falling) city.remove(f.group);
    falling.length = 0;
  }
  resize();
  return {
    resize,
    render,
    update,
    clear,
    rotate(dx, dy) {
      yaw += dx * 0.008;
      pitch = Math.max(0.48, Math.min(1.16, pitch + dy * 0.004));
      render();
    },
    pan(dx, dy) {
      const scale = (camera.top - camera.bottom) / Math.max(1, height);
      panX = THREE.MathUtils.clamp(panX - dx * scale, -24, 24);
      panY = THREE.MathUtils.clamp(panY + dy * scale, -18, 18);
      render();
    },
    resetView() {
      zoom = 1;
      panX = panY = 0;
      yaw = -0.12;
      pitch = 0.77;
      render();
    },
    setZoom(value) {
      zoom = Math.max(1, Math.min(3.2, value));
      render();
    },
    get pose() {
      return { yaw, pitch, zoom, panX, panY };
    },
    diagnostics: () => ({
      balcony: balcony.diagnostics(),
      pedestrians: pedestrianScene.diagnostics(),
      layout: pageLayout.diagnostics(),
      opaqueMaterials: [...materials].filter(
        (m) => m.isMeshStandardMaterial && !m.transparent,
      ).length,
      discoveries: discoveries.diagnostics(),
      waterfront: waterfront.diagnostics(),
      heist: heist.diagnostics(),
      falling: falling.length,
      fallingBoats: falling.filter((f) => f.boat).length,
      fallingCars: falling.filter((f) => !f.boat).length,
      blinkersOn: [...carMeshes.values()]
        .flatMap((m) => m.blinkers.flat())
        .filter((b) => b.visible).length,
      beaconsOn: [...carMeshes.values()]
        .flatMap((m) => m.beacons)
        .filter((b) => b.visible).length,
      ambulances: [...carMeshes.values()].filter((m) => m.ambulance).length,
      policeCars: [...carMeshes.values()].filter((m) => m.police).length,
      effects: effects.length,
      honks: effects.filter((f) => f.honk).length,
    }),
    inspectLandmarks() {
      view();
      const ray = new THREE.Raycaster();
      return Object.entries(heist.landmarks).map(([id, object]) => {
        const center = new THREE.Box3()
          .setFromObject(object)
          .getCenter(new THREE.Vector3());
        const projected = center.project(camera);
        ray.setFromCamera(new THREE.Vector2(projected.x, projected.y), camera);
        const hit = ray.intersectObject(city, true).find(({ object: mesh }) => {
          for (let node = mesh; node; node = node.parent)
            if (!node.visible) return false;
          return true;
        });
        let visible = false;
        for (let node = hit?.object; node; node = node.parent)
          if (node === object) visible = true;
        return { id, unobstructed: visible };
      });
    },
    targets: () =>
      signals.map((s, i) => ({
        ...project(signalPoint(s)),
        junction: s.junction,
        axis: s.axis,
        index: i,
      })),
    discoveryTargets: () =>
      DISCOVERIES.map((item) => ({
        id: item.id,
        ...project(discoveryPoint(item)),
      })),
    dispose() {
      disposed = true;
      pageLayout.dispose();
      clear();
      for (const t of textures) t.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      stampTarget.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
