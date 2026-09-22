import * as THREE from "three";
import { createPeople } from "./cityPeople";
import {
  riverPoint,
  riverBridgeHeight,
  lakeOpacity,
  RIVER_NORTH_END,
  RIVER_SOUTH_END,
  WATERFRONT_WALKS,
} from "./waterfront";

export function createWaterfrontScene({
  city,
  palette: p,
  box,
  mesh,
  cylinder,
  rod,
  material,
  texture,
  building,
  tree,
}) {
  const group = (x, y, z) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    city.add(g);
    return g;
  };
  function ribbon(
    from,
    to,
    y,
    mat,
    start = -RIVER_NORTH_END,
    end = RIVER_SOUTH_END,
  ) {
    const positions = [],
      indices = [],
      steps = Math.ceil((end - start) * 8);
    for (let i = 0; i <= steps; i++)
      for (const offset of [from, to]) {
        const a = riverPoint(start + ((end - start) * i) / steps, offset);
        positions.push(a.x, y, a.z);
      }
    for (let i = 0; i < steps; i++) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return mesh(geometry, mat, 0, 0, 0);
  }
  // Continuous water and walks around the 90-degree bend. The old west bank
  // buildings remain, and apartment façades complete the new northern bank.
  ribbon(-5, -0.82, 0.245, p.pavement);
  ribbon(-0.81, 0.81, 0.255, p.water);
  ribbon(-1.48, -0.82, 0.4, p.curb);
  ribbon(0.82, 1.48, 0.4, p.curb);
  for (let s = -RIVER_NORTH_END; s < -5.4; s += 0.42) {
    for (const offset of [-0.92, 0.92]) {
      const a = riverPoint(s, offset),
        b = riverPoint(Math.min(s + 0.42, -5.4), offset);
      if (Math.min(Math.abs(a.x), Math.abs(a.x - 14.4)) < 1.65) continue;
      rod([a.x, 0.41, a.z], [a.x, 0.72, a.z], 0.014, p.dark);
      rod([a.x, 0.72, a.z], [b.x, 0.72, b.z], 0.02, p.dark);
    }
  }
  // Fixed elevated crossings carry the original roads above the new river.
  for (const x of [0, 14.4]) {
    for (let i = 0; i < 28; i++) {
      const z = -10 + ((i + 0.5) * 3.4) / 28,
        h = riverBridgeHeight(x, z);
      box(2.92, 0.12, 3.4 / 28 + 0.008, x, 0.235 + h, z, p.base);
      box(2.75, 0.035, 3.4 / 28 + 0.008, x, 0.302 + h, z, p.asphalt);
      for (const side of [-1, 1]) {
        box(
          0.055,
          0.06,
          3.4 / 28 + 0.008,
          x + side * 1.42,
          0.73 + h,
          z,
          p.trim,
        );
        if (i % 3 === 0)
          rod(
            [x + side * 1.42, 0.3 + h, z],
            [x + side * 1.42, 0.73 + h, z],
            0.018,
            p.dark,
          );
      }
      if (i % 5 < 3) box(0.026, 0.007, 0.1, x, 0.325 + h, z, p.yellow);
    }
    for (const z of [-9.3, -7.1])
      for (const side of [-1, 1])
        box(
          0.18,
          0.15 + riverBridgeHeight(x, z),
          0.25,
          x + side * 1.2,
          0.15 + (0.15 + riverBridgeHeight(x, z)) / 2,
          z,
          p.cream,
        );
  }
  const apartments = [
    [-7.75, -8.5, 2.6],
    [2.9, -11.4, 2.8],
    [6.5, -11.4, 3.3],
    [10.2, -11.4, 2.6],
    [17.6, -11.4, 3],
    [21.5, -11.4, 2.5],
  ];
  apartments.forEach(([x, z, h], i) => {
    building({
      x,
      z,
      w: 2.6,
      d: 2.15,
      h,
      floors: 4,
      body: i % 2 ? p.terra : p.ivory,
    });
    for (let floor = 0; floor < 3; floor++)
      for (const dx of [-0.68, 0.68]) {
        const y = 0.95 + (floor * (h - 0.4)) / 3,
          front = z + 1.27;
        box(0.7, 0.065, 0.45, x + dx, y, front, p.trim);
        box(0.73, 0.035, 0.035, x + dx, y + 0.26, front + 0.19, p.dark);
        for (const q of [-1, 0, 1])
          rod(
            [x + dx + q * 0.31, y, front + 0.19],
            [x + dx + q * 0.31, y + 0.26, front + 0.19],
            0.012,
            p.dark,
          );
      }
  });
  for (const x of [-1.9, 4.6, 8.3, 12.2, 19.5, 23.35]) tree(x, -10.25);

  // Extend the park edge into a lakewalk. A feathered water texture ends in
  // transparency, letting the actual page color show through at the horizon.
  // The lake follows the long edge opposite the northern apartment riverwalk.
  // Leave the river mouth open between the two pieces of the promenade.
  for (const [left, right] of [
    [-10.4, -6.8],
    [-5.08, 21.6],
  ]) {
    const width = right - left,
      x = (left + right) / 2;
    box(width, 0.34, 4, x, -0.05, 8.9, p.base);
    box(width, 0.12, 4, x, 0.18, 8.9, p.pavement);
    box(width, 0.16, 0.72, x, 0.33, 10.35, p.curb);
    box(width, 0.32, 0.12, x, 0.21, 10.79, p.cream);
    for (let px = left + 0.15; px < right - 0.1; px += 0.5) {
      rod([px, 0.41, 10.59], [px, 0.72, 10.59], 0.016, p.dark);
      rod(
        [px, 0.73, 10.59],
        [Math.min(px + 0.5, right), 0.73, 10.59],
        0.02,
        p.dark,
      );
      box(0.012, 0.004, 0.63, px, 0.414, 10.35, p.base);
    }
  }
  for (const [x, width] of [
    [-3.1, 3],
    [6.8, 8.8],
    [18.5, 5],
  ])
    box(width, 0.025, 2.35, x, 0.255, 8.4, p.leaves2);
  for (const x of [-3.3, 2.2, 7.3, 11.5, 20.8]) {
    const b = group(x, 0.31, 9.72);
    box(0.9, 0.08, 0.32, 0, 0.27, 0, p.roof, b);
    box(0.9, 0.28, 0.04, 0, 0.44, -0.14, p.roof, b);
    for (const q of [-1, 1])
      box(0.06, 0.27, 0.25, q * 0.32, 0.135, 0, p.dark, b);
  }
  for (const x of [-4.2, 3.1, 6.7, 10.6, 15.8]) tree(x, 8.4);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d"),
    pixels = ctx.createImageData(256, 256);
  for (let j = 0; j < 256; j++)
    for (let i = 0; i < 256; i++) {
      const x = -15 + (i / 255) * 47,
        z = 9.7 + (j / 255) * 12.3,
        k = (j * 256 + i) * 4,
        shimmer = Math.sin(x * 2 + z * 0.8) * 1.5;
      pixels.data[k] = 119 + shimmer;
      pixels.data[k + 1] = 162 + shimmer;
      pixels.data[k + 2] = 157 + shimmer;
      pixels.data[k + 3] = Math.round(lakeOpacity(x, z) * 255);
    }
  ctx.putImageData(pixels, 0, 0);
  const lake = mesh(
    new THREE.PlaneGeometry(47, 12.3),
    material("#ffffff", {
      map: texture(canvas),
      transparent: true,
      depthWrite: false,
      roughness: 1,
    }),
    8.5,
    0.251,
    15.85,
  );
  lake.rotation.x = -Math.PI / 2;
  lake.receiveShadow = false;
  lake.castShadow = false;
  // Feather the lake at the canvas boundary too, including while zoomed in.
  const viewport = { value: new THREE.Vector2(1, 1) };
  lake.material.onBeforeCompile = (shader) => {
    shader.uniforms.lakeViewport = viewport;
    shader.fragmentShader =
      "uniform vec2 lakeViewport;\n" +
      shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
      vec2 margin = min(gl_FragCoord.xy, lakeViewport - gl_FragCoord.xy);
      gl_FragColor.a *= smoothstep(0.0, 0.07 * min(lakeViewport.x, lakeViewport.y), min(margin.x, margin.y));`,
      );
  };
  lake.material.customProgramCacheKey = () => "lake-edge-fade";

  // A small Calatrava-inspired pavilion: glazed keel and open white wing ribs.
  const museum = group(18.5, 0.41, 8.3);
  museum.rotation.y = -Math.PI / 2;
  box(3.1, 0.14, 1.75, 0, 0.02, 0, p.trim, museum);
  box(2.65, 0.48, 1.18, -0.08, 0.31, 0, p.glass, museum);
  box(2.9, 0.09, 1.36, 0, 0.59, 0, p.ivory, museum);
  rod([-1.6, 0.65, 0], [1.65, 1.08, 0], 0.085, p.white, museum);
  for (let i = 0; i < 19; i++) {
    const u = i / 18,
      x = -1.35 + u * 2.75,
      span = 0.2 + Math.sin(u * Math.PI) * 1.85,
      y = 0.88 + u * 0.17;
    for (const sign of [-1, 1]) {
      rod(
        [x, y, sign * 0.07],
        [x + 0.08, y + 0.28, sign * span * 0.55],
        0.028,
        p.white,
        museum,
      );
      rod(
        [x + 0.08, y + 0.28, sign * span * 0.55],
        [x + 0.12, y + 0.73, sign * span],
        0.023,
        p.white,
        museum,
      );
    }
  }
  rod([-1.15, 0.78, 0], [-0.95, 2.5, 0], 0.032, p.white, museum);
  rod([-0.95, 2.5, 0], [1.65, 1.08, 0], 0.016, p.trim, museum);
  for (let i = 0; i < 8; i++)
    box(0.035, 0.5, 1.21, -1.15 + i * 0.32, 0.31, 0, p.white, museum);

  const sailboats = Array.from({ length: 3 }, (_, i) => {
    const g = group(-2 + i * 8.5, 0.32, 13 + (i % 2) * 2.7),
      mat = i === 1 ? p.brick : p.green;
    const hull = mesh(new THREE.SphereGeometry(0.5, 12, 8), mat, 0, 0, 0, g);
    hull.scale.set(0.48, 0.23, 1.65);
    box(0.31, 0.025, 1.07, 0, 0.06, 0, p.ivory, g);
    rod([0, 0.07, 0], [0, 1.85, 0], 0.022, p.roof, g);
    rod([0, 0.27, 0], [0, 0.27, -0.69], 0.018, p.roof, g);
    for (const forward of [false, true]) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          forward
            ? [0, 0.35, 0.07, 0, 1.75, 0.03, 0, 0.35, 0.64]
            : [0.025, 0.3, -0.08, 0.025, 1.8, -0.035, 0.025, 0.3, -0.73],
          3,
        ),
      );
      geometry.computeVertexNormals();
      mesh(
        geometry,
        material(forward ? "#ebdcc0" : "#fff6e7", { side: THREE.DoubleSide }),
        0,
        0,
        0,
        g,
      );
    }
    return { g, x: -2 + i * 8.5, z: 13 + (i % 2) * 2.7 };
  });
  const person = createPeople({
    city,
    palette: p,
    box,
    mesh,
    cylinder,
    rod,
    material,
  });
  const people = WATERFRONT_WALKS.map((walk, i) => ({
    ...walk,
    actor: person(walk.point[0], walk.point[2], i % 2 ? p.brick : p.green),
  }));
  let diagnostics = {};
  function update(sim) {
    people.forEach(({ id, duration, path, actor }) => {
      const t = sim.discoveries.active[id],
        progress = (t ?? 0) / duration;
      // Arc-length sampling keeps a stroll's speed consistent around corners.
      const lengths = path
        .slice(1)
        .map((b, i) => Math.hypot(b[0] - path[i][0], b[1] - path[i][1]));
      let d = progress * lengths.reduce((a, b) => a + b, 0),
        index = 0;
      while (index < lengths.length - 1 && d > lengths[index])
        d -= lengths[index++];
      const a = path[index],
        b = path[index + 1],
        f = d / lengths[index];
      actor.g.position.set(
        a[0] + (b[0] - a[0]) * f,
        0.42,
        a[1] + (b[1] - a[1]) * f,
      );
      actor.g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
      actor.animate(t ?? 0, t !== undefined);
    });
    sailboats.forEach(({ g, x, z }, i) => {
      const t = sim.time * 0.055 + i * 2;
      g.position.set(
        x + Math.sin(t) * 0.85,
        0.32 + Math.sin(sim.time * 1.5 + i) * 0.018,
        z + Math.cos(t) * 0.65,
      );
      g.rotation.set(
        Math.sin(sim.time * 0.8 + i) * 0.025,
        Math.atan2(0.85 * Math.cos(t), -0.65 * Math.sin(t)),
        Math.sin(sim.time + i) * 0.045,
      );
    });
    diagnostics = {
      museum: true,
      museumPosition: museum.position.toArray(),
      lakeEdge: "south",
      sailboats: sailboats.length,
      walkers: people.map(({ id, actor }) => ({
        id,
        x: actor.g.position.x,
        z: actor.g.position.z,
        walking: sim.discoveries.active[id] !== undefined,
      })),
    };
  }
  return {
    update,
    resize: (w, h) => viewport.value.set(w, h),
    diagnostics: () => diagnostics,
  };
}
