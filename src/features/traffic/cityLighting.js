import * as THREE from "three";

// Building-owned materials keep a switch from changing every copy of a window.
export function createCityLighting({ city, host, enabled, onToggle }) {
  const buildings = [],
    streets = [],
    resources = [];
  const warmWindow = new THREE.Color("#efc588");
  let active = null,
    night = 0,
    windowIndex = 0;
  const poolGeometry = new THREE.PlaneGeometry(1, 1);
  const fixtureGeometry = new THREE.BoxGeometry(0.09, 0.14, 0.06);
  resources.push(poolGeometry, fixtureGeometry);
  function pool(x, z, radius, y = 0.415) {
    const mat = new THREE.ShaderMaterial({
      uniforms: { strength: { value: 0 } },
      vertexShader: `varying vec2 uvLocal; void main(){ uvLocal=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec2 uvLocal; uniform float strength; void main(){ float r=length(uvLocal-.5)*2.; float a=pow(1.-smoothstep(0.,1.,r),2.); gl_FragColor=vec4(1.,.70,.29,a*strength); }`,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      toneMapped: false,
    });
    const plane = new THREE.Mesh(poolGeometry, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x, y, z);
    plane.scale.setScalar(radius * 2);
    plane.userData.lightPool = true;
    city.add(plane);
    resources.push(mat);
    return mat.uniforms.strength;
  }
  function begin(options) {
    if (!enabled) return;
    const { x, z, w, d, h } = options;
    const id = options.id || `building-${buildings.length + 1}`;
    const name =
      options.name ||
      (z < -8 ? "Riverwalk apartment" : "Third Ward building") +
        ` ${buildings.length + 1}`;
    const b = {
      id,
      name,
      x,
      z,
      w,
      d,
      h,
      override: null,
      on: false,
      glow: 0,
      windows: new Map(),
      exterior: [],
    };
    buildings.push(b);
    active = b;
    windowIndex = 0;
    const button = document.createElement("button");
    button.className = "traffic-city__building-switch";
    button.type = "button";
    button.setAttribute("aria-label", `${name} lights`);
    button.addEventListener("click", () => onToggle(id));
    host.parentElement.appendChild(button);
    b.button = button;
    // Small sconces and warm, feathered pools at both entrances.
    const fixture = new THREE.MeshStandardMaterial({
      color: "#e9ce98",
      emissive: "#ffb84d",
      emissiveIntensity: 0,
    });
    resources.push(fixture);
    b.fixture = fixture;
    // A bounded set of unshadowed lights grazes the landmark façades. Most
    // lamps use emissive lanterns and soft ground pools to keep GPU work small.
    if (
      ["iron-block", "bank", "water-street", "market", "museum"].includes(id)
    ) {
      const light = new THREE.PointLight("#ffc375", 0, 3.2, 2);
      light.position.set(x, 1.5, z + d / 2 + 0.4);
      city.add(light);
      b.light = light;
    }
    for (const side of [-1, 1]) {
      const zz = z + side * (d / 2 + 0.08);
      for (const offset of [-0.26, 0.26]) {
        const sconce = new THREE.Mesh(fixtureGeometry, fixture);
        sconce.position.set(x + offset, 1.04, zz);
        sconce.userData.buildingId = id;
        city.add(sconce);
      }
      b.exterior.push(pool(x, zz + side * 0.25, 0.9));
    }
    return b;
  }
  function windowMaterial(source) {
    if (!active) return source;
    const variant = windowIndex++ % 3;
    const key = `${source.uuid}-${variant}`;
    if (!active.windows.has(key)) {
      const mat = source.clone();
      mat.userData = { buildingWindow: true };
      mat.emissive.set(["#ffc16c", "#ffdba0", "#ffb659"][variant]);
      mat.emissiveIntensity = 0;
      active.windows.set(key, { mat, base: source.color.clone(), variant });
      resources.push(mat);
    }
    return active.windows.get(key).mat;
  }
  function set(id, value) {
    const b = buildings.find((b) => b.id === id);
    if (!b) return false;
    b.override = value ?? !b.on;
    apply(b);
    return true;
  }
  function apply(b) {
    const glow = b.override === null ? night : Number(b.override);
    b.glow = glow;
    b.on = glow > 0.3;
    for (const { mat, base, variant } of b.windows.values()) {
      mat.color
        .copy(base)
        .lerp(warmWindow, glow * (variant === 2 ? 0.55 : 0.9));
      mat.emissiveIntensity = glow * [1.35, 1.05, 0.65][variant];
    }
    b.fixture.emissiveIntensity = glow * 2.4;
    if (b.light) b.light.intensity = glow * 1.7;
    b.exterior.forEach((u) => {
      u.value = glow * 0.6;
    });
    b.button.setAttribute("aria-pressed", String(b.on));
  }
  return {
    begin,
    end() {
      active = null;
    },
    resume(id) {
      active = buildings.find((b) => b.id === id) || null;
    },
    get activeId() {
      return active?.id;
    },
    windowMaterial,
    set,
    on: (id) => buildings.find((b) => b.id === id)?.on,
    street(x, z) {
      if (enabled) streets.push(pool(x, z, 1.25, 0.425));
    },
    update(world) {
      night = 1 - THREE.MathUtils.smoothstep(world.daylight, 0.05, 0.8);
      buildings.forEach(apply);
      streets.forEach((u) => {
        u.value = night * 0.7;
      });
    },
    position(project, protects, width, height) {
      for (const b of buildings) {
        const p = project(new THREE.Vector3(b.x, b.h + 0.5, b.z));
        b.button.style.transform = `translate(${p.x - 20}px, ${p.y - 20}px)`;
        b.button.hidden =
          p.x < 0 ||
          p.y < 0 ||
          p.x > width ||
          p.y > height ||
          protects(p.x, p.y);
      }
    },
    targets(project) {
      return buildings.map((b) => ({
        id: b.id,
        ...project(new THREE.Vector3(b.x, b.h + 0.45, b.z)),
      }));
    },
    reset() {
      buildings.forEach((b) => {
        b.override = null;
        apply(b);
      });
    },
    diagnostics: () => ({
      streetLamps: streets.length,
      buildings: buildings.map((b) => ({
        id: b.id,
        name: b.name,
        on: b.on,
        override: b.override,
        glow: b.glow,
        windowMaterials: b.windows.size,
        exteriorLights: b.exterior.length * 2,
      })),
    }),
    dispose() {
      buildings.forEach((b) => b.button.remove());
      resources.forEach((r) => r.dispose());
    },
  };
}
