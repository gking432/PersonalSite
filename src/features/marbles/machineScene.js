import * as THREE from "three";
import { chooseRoute } from "./marbleRound";
import {
  createMachineTracks,
  FLYWHEEL_CENTER,
  FLYWHEEL_RADIUS,
} from "./machineTracks";

export function createMachine(host, onEscape) {
  const { Vector3: V } = THREE;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 3.5, -3.5, 0.1, 60);
  camera.position.set(7.6, 6.5, 10.2);
  camera.lookAt(0.35, 2.1, 0);
  scene.add(new THREE.HemisphereLight(0xfff8e7, 0x526252, 2.7));
  const key = new THREE.DirectionalLight(0xffedd2, 4.2);
  key.position.set(-3, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -5,
    right: 5,
    top: 6,
    bottom: -5,
    near: 0.5,
    far: 20,
  });
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 5;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe5efff, 2.2);
  fill.position.set(5, 5, -5);
  scene.add(fill);
  const envCanvas = document.createElement("canvas");
  envCanvas.width = 1024;
  envCanvas.height = 512;
  const ec = envCanvas.getContext("2d");
  const grad = ec.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#f7f1e0");
  grad.addColorStop(0.45, "#e6e2d5");
  grad.addColorStop(0.6, "#6b796b");
  grad.addColorStop(1, "#242e28");
  ec.fillStyle = grad;
  ec.fillRect(0, 0, 1024, 512);
  ec.fillStyle = "#ffffff";
  ec.fillRect(80, 40, 180, 225);
  ec.fillRect(570, 50, 100, 180);
  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(envTex);
  scene.environment = environment.texture;
  envTex.dispose();
  pmrem.dispose();
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb79854,
    metalness: 0.84,
    roughness: 0.25,
  });
  const lightBrass = new THREE.MeshStandardMaterial({
    color: 0xd0b574,
    metalness: 0.73,
    roughness: 0.28,
  });
  const enamel = new THREE.MeshStandardMaterial({
    color: 0x234b3c,
    metalness: 0.32,
    roughness: 0.24,
  });
  const black = new THREE.MeshStandardMaterial({
    color: 0x24372f,
    metalness: 0.55,
    roughness: 0.32,
  });
  const ivory = new THREE.MeshStandardMaterial({
    color: 0xf0e5c9,
    metalness: 0.15,
    roughness: 0.35,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x9cafa5,
    metalness: 0.91,
    roughness: 0.17,
  });
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xc36939,
    metalness: 0.58,
    roughness: 0.22,
  });
  const machine = new THREE.Group();
  scene.add(machine);
  const mesh = (geo, mat, parent = machine) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const cylinder = (r, h, mat, pos, parent = machine, r2 = r) => {
    const m = mesh(new THREE.CylinderGeometry(r, r2, h, 36), mat, parent);
    m.position.set(...pos);
    return m;
  };
  const rod = (a, b, r, mat = brass, parent = machine) => {
    a = new V(...a);
    b = new V(...b);
    const m = mesh(
      new THREE.CylinderGeometry(r, r, a.distanceTo(b), 12),
      mat,
      parent,
    );
    m.position.copy(a.clone().add(b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new V(0, 1, 0), b.sub(a).normalize());
    return m;
  };
  function block(w, h, d, r, mat, pos, parent = machine) {
    const sh = new THREE.Shape();
    const x = -w / 2,
      y = -h / 2;
    sh.moveTo(x + r, y);
    sh.lineTo(x + w - r, y);
    sh.quadraticCurveTo(x + w, y, x + w, y + r);
    sh.lineTo(x + w, y + h - r);
    sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    sh.lineTo(x + r, y + h);
    sh.quadraticCurveTo(x, y + h, x, y + h - r);
    sh.lineTo(x, y + r);
    sh.quadraticCurveTo(x, y, x + r, y);
    const geo = new THREE.ExtrudeGeometry(sh, {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 12,
    });
    geo.translate(0, 0, -d / 2);
    const m = mesh(geo, mat, parent);
    m.position.set(...pos);
    return m;
  }
  block(5.3, 0.24, 3.3, 0.09, enamel, [0, 0.28, 0]);
  block(5.1, 0.07, 3.13, 0.025, brass, [0, 0.435, 0]);
  block(5.04, 0.04, 3.08, 0.018, enamel, [0, 0.49, 0]);
  for (const x of [-2.03, 2.03])
    for (const z of [-1.1, 1.1]) {
      cylinder(0.18, 0.17, black, [x, 0.105, z]);
      cylinder(0.15, 0.05, brass, [x, 0.205, z]);
    }
  const ground = mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ opacity: 0.17 }),
    scene,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.01;
  ground.castShadow = false;
  for (const [x, z] of [
    [-2.25, -1.2],
    [-2.25, 1.2],
    [2.25, -1.2],
    [2.25, 1.2],
  ]) {
    cylinder(0.04, 0.015, lightBrass, [x, 0.53, z]);
    rod([x - 0.025, 0.54, z], [x + 0.025, 0.54, z], 0.006, black);
  }
  function pole(x, z, h) {
    cylinder(0.1, 0.055, brass, [x, 0.555, z]);
    cylinder(0.034, h - 0.55, brass, [x, (h + 0.55) / 2, z]);
    cylinder(0.067, 0.07, enamel, [x, h - 0.12, z]);
  }
  const { lead, spiral, exit, short, left, routes } = createMachineTracks();
  const routeUses = [0, 0, 0];
  function rail(curve) {
    const pts = [[], []];
    const N = Math.ceil(curve.getLength() * 36);
    for (let i = 0; i <= N; i++) {
      const t = i / N,
        p = curve.getPointAt(t),
        dir = curve.getTangentAt(t),
        side = new V(-dir.z, 0, dir.x).normalize();
      for (let j = 0; j < 2; j++)
        pts[j].push(
          p
            .clone()
            .addScaledVector(side, j === 0 ? -0.095 : 0.095)
            .add(new V(0, -0.105, 0)),
        );
    }
    for (const ps of pts)
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(ps),
          N,
          0.026,
          8,
          false,
        ),
        brass,
      );
    const n = Math.ceil(curve.getLength() / 0.48);
    for (let i = 1; i < n; i++) {
      const t = i / n,
        p = curve.getPointAt(t),
        dir = curve.getTangentAt(t),
        s = new V(-dir.z, 0, dir.x).normalize().multiplyScalar(0.15);
      const a = p.clone().sub(s),
        b = p.clone().add(s);
      a.y -= 0.145;
      b.y -= 0.145;
      rod(a.toArray(), b.toArray(), 0.018, black);
    }
  }
  [lead, spiral, exit, short, left].forEach(rail);
  pole(-1.82, -1.12, 2.65);
  pole(-2.55, -0.45, 2.02);
  pole(2.64, -0.56, 1.36);
  pole(-1.8, -0.65, 3.7);
  pole(-1.1, 0.15, 2.64);
  pole(0.03, 1.13, 2.82);
  pole(1.13, 0.03, 2.12);
  pole(1.97, -0.5, 2.56);
  pole(0.53, 1.34, 1.8);
  const hopper = cylinder(
    0.32,
    0.43,
    enamel,
    [-1.8, 4.14, -0.65],
    machine,
    0.125,
  );
  const rim = mesh(new THREE.TorusGeometry(0.32, 0.032, 10, 56), lightBrass);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(-1.8, 4.37, -0.65);
  cylinder(0.278, 0.015, black, [-1.8, 4.365, -0.65]);
  const waitingBall = mesh(new THREE.SphereGeometry(0.13, 24, 16), ballMat);
  waitingBall.position.set(-1.8, 4.46, -0.65);
  const lever = new THREE.Group();
  lever.position.set(-1.8, 3.91, -0.48);
  machine.add(lever);
  rod([0, 0, 0], [0, 0, 0.38], 0.038, brass, lever);
  rod([0, 0, 0.38], [0.24, 0.17, 0.38], 0.045, brass, lever);
  const knob = mesh(new THREE.SphereGeometry(0.09, 20, 16), enamel, lever);
  knob.position.set(0.24, 0.17, 0.38);
  const selector = new THREE.Group();
  selector.position.set(0, 3.16, -1.13);
  machine.add(selector);
  cylinder(0.105, 0.1, enamel, [0, 0, 0], selector);
  rod([0, 0.07, 0], [0.24, 0.07, 0.12], 0.045, lightBrass, selector);
  cylinder(0.055, 0.08, enamel, [0.24, 0.12, 0.12], selector);
  const wheel = new THREE.Group();
  wheel.position.set(...FLYWHEEL_CENTER);
  machine.add(wheel);
  const wr = mesh(
    new THREE.TorusGeometry(FLYWHEEL_RADIUS, 0.07, 14, 72),
    enamel,
    wheel,
  );
  const inner = mesh(
    new THREE.TorusGeometry(0.53, 0.025, 10, 64),
    brass,
    wheel,
  );
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    rod(
      [0, 0, 0],
      [Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0],
      0.035,
      brass,
      wheel,
    );
    const pin = mesh(new THREE.SphereGeometry(0.045, 12, 8), lightBrass, wheel);
    pin.position.set(Math.cos(a) * 0.63, Math.sin(a) * 0.63, 0.045);
  }
  const axle = cylinder(0.115, 0.21, brass, [0, 0, 0], wheel);
  axle.rotation.x = Math.PI / 2;
  pole(-1.42, 0.58, 1.48);
  rod([-1.42, 1.47, 0.46], [-1.42, 1.47, 0.94], 0.055, brass);
  const littleWheel = new THREE.Group();
  littleWheel.position.set(-0.41, 0.93, 0.72);
  machine.add(littleWheel);
  mesh(new THREE.TorusGeometry(0.22, 0.028, 10, 44), brass, littleWheel);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    rod(
      [0, 0, 0],
      [Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0],
      0.023,
      brass,
      littleWheel,
    );
  }
  rod([-0.41, 0.93, 0.6], [-0.41, 0.93, 0.87], 0.04, brass);
  pole(-0.41, 0.6, 0.95);
  const beltPoints = [
    [-1.76, 1.98, 0.7],
    [-1.41, 2.08, 0.7],
    [-1.03, 1.97, 0.7],
    [-0.25, 1.13, 0.7],
    [-0.18, 0.92, 0.7],
    [-0.31, 0.72, 0.7],
    [-0.52, 0.75, 0.7],
    [-1.89, 1.06, 0.7],
    [-2.02, 1.48, 0.7],
    [-1.76, 1.98, 0.7],
  ].map((p) => new V(...p));
  mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(beltPoints, true),
      100,
      0.018,
      8,
      true,
    ),
    black,
  );
  const plaque = block(1.42, 0.28, 0.022, 0.035, brass, [0.14, 0.295, 1.674]);
  const tc = document.createElement("canvas");
  tc.width = 512;
  tc.height = 96;
  const ctx = tc.getContext("2d");
  ctx.fillStyle = "#b79c63";
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = "#243d30";
  ctx.font = "500 29px Georgia";
  ctx.textAlign = "center";
  ctx.fillText("G N   /   WORKING SYSTEMS", 256, 60);
  const tex = new THREE.CanvasTexture(tc);
  tex.colorSpace = THREE.SRGBColorSpace;
  const label = mesh(
    new THREE.PlaneGeometry(1.3, 0.244),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.6,
      metalness: 0.4,
    }),
  );
  label.position.set(0.14, 0.295, 1.721);

  const flights = [];
  let yaw = -0.2,
    pulse = 0;
  machine.rotation.y = yaw;
  const ballGeometry = new THREE.SphereGeometry(0.13, 24, 16);
  let width = 1,
    height = 1,
    disposed = false;
  function project(point) {
    machine.updateMatrixWorld(true);
    const p = point.clone().applyMatrix4(machine.matrixWorld).project(camera);
    return { x: ((p.x + 1) * width) / 2, y: ((1 - p.y) * height) / 2 };
  }
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    const span = 7.25;
    camera.left = (-span * width) / height / 2;
    camera.right = -camera.left;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    render();
  }
  function render() {
    if (!disposed) renderer.render(scene, camera);
  }
  function emit() {
    waitingBall.visible = false;
    const route = chooseRoute();
    routeUses[route]++;
    const ball = mesh(ballGeometry, ballMat),
      curves = routes[route],
      lengths = curves.map((c) => c.getLength());
    ball.position.copy(lead.getPoint(0));
    flights.push({
      route,
      ball,
      curves,
      lengths,
      length: lengths.reduce((a, b) => a + b, 0),
      age: 0,
    });
    pulse = 0.4;
  }
  function tick(dt, visible = true) {
    if (disposed) return;
    pulse = Math.max(0, pulse - dt);
    lever.rotation.z = -Math.sin((pulse * Math.PI) / 0.4) * 0.55;
    if (flights.length) {
      wheel.rotation.z -= dt * 1.7;
      littleWheel.rotation.z += dt * 4.5;
    }
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i];
      f.age += dt;
      const progress = Math.min(1, f.age / 5.8);
      let distance = progress * f.length,
        index = 0;
      while (index < f.curves.length - 1 && distance > f.lengths[index])
        distance -= f.lengths[index++];
      if (index > 0) selector.rotation.y = [-1.1, 0.2, 1.2][f.route];
      f.ball.position.copy(
        f.curves[index].getPointAt(Math.min(1, distance / f.lengths[index])),
      );
      if (progress >= 1) {
        const end = project(f.ball.position),
          before = project(f.curves.at(-1).getPointAt(0.95)),
          edge = project(f.ball.position.clone().add(new V(0.13, 0, 0)));
        onEscape({
          ...end,
          route: f.route,
          vx: (end.x - before.x) * 7,
          vy: 25,
          radius: Math.max(
            4.5,
            Math.min(8, Math.hypot(edge.x - end.x, edge.y - end.y)),
          ),
        });
        machine.remove(f.ball);
        flights.splice(i, 1);
      }
    }
    if (visible) render();
  }
  function targets() {
    return flights.map((f) => {
      const p = project(f.ball.position);
      const edge = project(f.ball.position.clone().add(new V(0.13, 0, 0)));
      return {
        ...p,
        radius: Math.max(4.5, Math.hypot(edge.x - p.x, edge.y - p.y)),
        flight: f,
      };
    });
  }
  function clear() {
    waitingBall.visible = true;
    for (const f of flights) machine.remove(f.ball);
    flights.length = 0;
    render();
  }
  function rotate(delta) {
    yaw += delta;
    machine.rotation.y = yaw;
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return {
    emit,
    targets,
    get routeUses() {
      return [...routeUses];
    },
    tick,
    rotate,
    clear,
    render,
    resize,
    get inFlight() {
      return flights.length;
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      clear();
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material) materials.add(o.material);
      });
      geometries.add(ballGeometry);
      for (const g of geometries) g.dispose();
      for (const m of materials) {
        m.map?.dispose();
        m.dispose();
      }
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
