import * as THREE from "three";
const mix = THREE.MathUtils.lerp;
const fract = (n) => n - Math.floor(n);
export function createWorldAtmosphere({
  homepage = false,
  city,
  sun,
  sky,
  fill,
  palette,
  materials,
  terrainMaterials,
  mapYaw,
}) {
  const uniforms = {
    time: { value: 0 },
    wind: { value: new THREE.Vector2() },
    opacity: { value: 0 },
    snow: { value: 0 },
  };
  const vertex = `
    uniform float time; uniform vec2 wind; uniform float snow;
    attribute float seed; attribute float endpoint;
    varying float fade;
    void main() {
      float travel = time * mix(7.5, 0.85, snow) + seed * 8.0;
      float y = 8.0 - mod(travel, 8.0);
      vec3 p = position;
      p.xz += wind * (8.0-y) * 0.08;
      p.x += sin(time * 0.9 + seed * 57.0) * 0.13 * snow;
      float edge = min(min(p.x+10.8, 25.0-p.x), min(p.z+12.3, 13.0-p.z));
      fade = smoothstep(0.0, 1.7, edge) * (1.0 - smoothstep(6.0, 8.0, y));
      p.y = y + 0.38 + endpoint * 0.36;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = 3.2 + seed * 1.4;
    }
  `;
  const base = [],
    seeds = [],
    ends = [];
  for (let i = 0; i < 380; i++) {
    const seed = fract(Math.sin(i * 17.31 + 1) * 41871.37);
    const x = -10.8 + fract(Math.sin(i * 7.18 + 2) * 21871.12) * 35.8;
    const z = -12.3 + fract(Math.sin(i * 11.73 + 3) * 81721.37) * 25.3;
    for (const end of [0, 1]) {
      base.push(x, 0, z);
      seeds.push(seed);
      ends.push(end);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(base, 3));
  geometry.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("endpoint", new THREE.Float32BufferAttribute(ends, 1));
  const rainMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: `uniform float opacity; varying float fade; void main(){ gl_FragColor = vec4(0.56,0.69,0.78, opacity * fade); }`,
    transparent: true,
    depthWrite: false,
  });
  const rain = new THREE.LineSegments(geometry, rainMat);
  rain.frustumCulled = false;
  city.add(rain);
  const snowGeometry = new THREE.BufferGeometry();
  snowGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      base.filter((_, i) => Math.floor(i / 3) % 2 === 0),
      3,
    ),
  );
  snowGeometry.setAttribute(
    "seed",
    new THREE.Float32BufferAttribute(
      seeds.filter((_, i) => i % 2 === 0),
      1,
    ),
  );
  snowGeometry.setAttribute(
    "endpoint",
    new THREE.Float32BufferAttribute(new Float32Array(380), 1),
  );
  const snowMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: `uniform float opacity; varying float fade; void main(){ float r = length(gl_PointCoord-0.5); gl_FragColor = vec4(0.96,0.98,1.0, (1.0-smoothstep(0.22,0.5,r)) * opacity * fade); }`,
    transparent: true,
    depthWrite: false,
  });
  const snow = new THREE.Points(snowGeometry, snowMat);
  snow.frustumCulled = false;
  city.add(snow);
  const glass = [...materials].filter((m) => m.userData.worldWindow);
  const lamps = [...materials].filter((m) => m.userData.worldLamp);
  const roadColor = palette.asphalt.color.clone(),
    roofColor = palette.roof.color.clone();
  const nightSky = new THREE.Color("#92a9d2"),
    daySky = new THREE.Color("#fff8e8");
  const nightGround = new THREE.Color("#576679"),
    dayGround = new THREE.Color("#788576");
  const moon = new THREE.Color("#91acd8"),
    daylight = new THREE.Color("#ffedcf"),
    sunset = new THREE.Color("#ffb36b");
  const pale = new THREE.Color("#e1e8e9"),
    wet = new THREE.Color("#465462");
  let diagnostics = {},
    level = null,
    cloud = 0.25,
    rainAmount = 0,
    snowAmount = 0,
    lastWorldTime = null;
  return {
    update(world, dt) {
      const blend = level === null || !dt ? 1 : 1 - Math.exp(-dt * 0.6);
      level = mix(level ?? world.daylight, world.daylight, blend);
      cloud = mix(cloud, world.weather?.cloud ?? 0.25, blend);
      rainAmount = mix(
        rainAmount,
        world.weather?.precipitation === "rain" ? world.weather.intensity : 0,
        blend,
      );
      snowAmount = mix(
        snowAmount,
        world.weather?.precipitation === "snow" ? world.weather.intensity : 0,
        blend,
      );
      sky.color.copy(nightSky).lerp(daySky, level);
      sky.groundColor.copy(nightGround).lerp(dayGround, level);
      sky.intensity = homepage ? 0.62 + level * 2.08 : 1.05 + level * 1.65;
      fill.intensity = homepage ? 0.35 + level * 0.95 : 0.7 + level * 0.6;
      sun.color
        .copy(moon)
        .lerp(daylight, level)
        .lerp(sunset, world.golden * (1 - cloud * 0.6));
      sun.intensity = mix(0.55, 3.3 * (1 - cloud * 0.78), level);
      const direction = new THREE.Vector3(...world.direction);
      direction.y = Math.max(0.22, direction.y);
      direction
        .normalize()
        .lerp(new THREE.Vector3(-0.55, 0.8, 0.24), 1 - level);
      direction
        .normalize()
        .multiplyScalar(24)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), mapYaw.value);
      sun.position.copy(direction);
      for (const m of glass) {
        m.emissive.set("#ffbf62");
        m.emissiveIntensity = (1 - level) * 0.42;
      }
      for (const m of lamps) m.emissiveIntensity = 0.08 + (1 - level) * 2.2;
      palette.asphalt.color
        .copy(roadColor)
        .lerp(wet, rainAmount * 0.4)
        .lerp(pale, snowAmount * 0.22);
      palette.asphalt.roughness = mix(0.77, 0.2, rainAmount);
      palette.asphalt.metalness = rainAmount * 0.25;
      palette.roof.color.copy(roofColor).lerp(pale, snowAmount * 0.5);
      for (const [source, faded] of terrainMaterials) {
        faded.color.copy(source.color);
        faded.roughness = source.roughness;
        faded.metalness = source.metalness;
      }
      // Wall time keeps precipitation alive before anyone starts traffic.
      if (lastWorldTime === null || Math.abs(world.now - lastWorldTime) > 2000)
        uniforms.time.value = (world.now / 1000) % 8000;
      else uniforms.time.value += dt;
      lastWorldTime = world.now;
      const wind = (world.weather?.windKph || 0) / 12,
        angle = ((world.weather?.windDegrees || 0) * Math.PI) / 180;
      uniforms.wind.value.set(-Math.sin(angle) * wind, Math.cos(angle) * wind);
      const snowy = snowAmount > rainAmount;
      uniforms.snow.value = snowy ? 1 : 0;
      uniforms.opacity.value = snowy ? 0.85 : 0.38 + rainAmount * 0.25;
      const count = Math.round(380 * Math.max(rainAmount, snowAmount));
      geometry.setDrawRange(0, count * 2);
      snowGeometry.setDrawRange(0, count);
      rain.visible = !snowy && count > 0;
      snow.visible = snowy && count > 0;
      diagnostics = {
        phase: world.phase,
        daylight: level,
        cloud,
        precipitation: count ? (snowy ? "snow" : "rain") : "none",
        particles: count,
        particleTime: uniforms.time.value,
        windowGlow: glass[0]?.emissiveIntensity || 0,
        lampGlow: lamps[0]?.emissiveIntensity || 0,
        wetRoad: rainAmount,
        windKph: world.weather?.windKph || 0,
      };
    },
    diagnostics: () => diagnostics,
    dispose() {
      city.remove(rain, snow);
      geometry.dispose();
      snowGeometry.dispose();
      rainMat.dispose();
      snowMat.dispose();
    },
  };
}
