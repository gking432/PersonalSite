import { sailboatPose } from "./sailboatMotion";
import { lakeRoadPoint, lakeRoadLength, LAKE_ROAD_Z } from "./lakeRoad";
import * as THREE from "three";
import { createPeople } from "./cityPeople";
import {
  riverPoint,
  riverBridgeHeight,
  RIVER_BRIDGE_START,
  RIVER_BRIDGE_END,
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
  const group = (x, y, z, parent = city) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
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
  // Continuous surfaces replace the horizontal stair-step bridge pieces.
  for (const x of [0, 14.4]) {
    const segments = 120,
      span = RIVER_BRIDGE_END - RIVER_BRIDGE_START;
    function bridgeStrip(left, right, y, mat) {
      const positions = [],
        indices = [];
      for (let i = 0; i <= segments; i++) {
        const z = RIVER_BRIDGE_START + (span * i) / segments,
          h = riverBridgeHeight(x, z);
        positions.push(x + left, y + h, z, x + right, y + h, z);
        if (i < segments) {
          const n = i * 2;
          indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      mesh(geometry, mat, 0, 0, 0);
    }
    bridgeStrip(-1.46, 1.46, 0.275, p.base);
    bridgeStrip(-1.375, 1.375, 0.303, p.asphalt);
    // Continuous rail meshes keep the gentle curves inexpensive to render.
    for (const side of [-1, 1])
      for (const [y, radius, mat] of [
        [0.71, 0.025, p.trim],
        [0.25, 0.055, p.base],
      ]) {
        const points = Array.from({ length: segments + 1 }, (_, i) => {
          const z = RIVER_BRIDGE_START + (span * i) / segments;
          return new THREE.Vector3(
            x + side * 1.43,
            y + riverBridgeHeight(x, z),
            z,
          );
        });
        mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            segments,
            radius,
            6,
            false,
          ),
          mat,
          0,
          0,
          0,
        );
      }
    const marks = [],
      markIndices = [];
    for (let i = 0; i < segments; i++) {
      const z = RIVER_BRIDGE_START + (span * i) / segments,
        next = z + span / segments,
        h = riverBridgeHeight(x, z),
        hn = riverBridgeHeight(x, next);
      if (i % 8 === 0)
        for (const side of [-1, 1])
          rod(
            [x + side * 1.43, 0.28 + h, z],
            [x + side * 1.43, 0.71 + h, z],
            0.018,
            p.dark,
          );
      if (i % 10 < 6) {
        const n = marks.length / 3;
        marks.push(
          x - 0.014,
          0.314 + h,
          z,
          x + 0.014,
          0.314 + h,
          z,
          x - 0.014,
          0.314 + hn,
          next,
          x + 0.014,
          0.314 + hn,
          next,
        );
        markIndices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
      }
    }
    const markingGeometry = new THREE.BufferGeometry();
    markingGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(marks, 3),
    );
    markingGeometry.setIndex(markIndices);
    markingGeometry.computeVertexNormals();
    mesh(markingGeometry, p.yellow, 0, 0, 0);
    for (const z of [-9.3, -7.1])
      for (const side of [-1, 1]) {
        const h = riverBridgeHeight(x, z);
        box(
          0.18,
          0.15 + h,
          0.25,
          x + side * 1.2,
          0.15 + (0.15 + h) / 2,
          z,
          p.cream,
        );
      }
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
  // Replace the central green strip with a continuous two-lane shore road.
  // Sample one centerline for paving, curbs and markings so the bends meet.
  function roadStrip(inner, outer, y, mat) {
    const positions = [],
      indices = [],
      steps = 160;
    for (let i = 0; i <= steps; i++) {
      const a = lakeRoadPoint((lakeRoadLength() * i) / steps);
      for (const offset of [inner, outer])
        positions.push(a.x - a.dz * offset, y, a.z + a.dx * offset);
      if (i < steps) {
        const n = i * 2;
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    mesh(geometry, mat, 0, 0, 0);
  }
  roadStrip(-1.375, 1.375, 0.303, p.asphalt);
  roadStrip(-1.62, -1.375, 0.34, p.curb);
  roadStrip(1.375, 1.62, 0.34, p.curb);
  for (let d = 0.32; d < lakeRoadLength(); d += 0.68) {
    const a = lakeRoadPoint(d),
      b = lakeRoadPoint(Math.min(d + 0.4, lakeRoadLength()));
    rod([a.x, 0.312, a.z], [b.x, 0.312, b.z], 0.014, p.yellow);
  }
  // Two rows of planted trees frame the street; the existing promenade stays
  // unbroken along the water, with benches facing the lake.
  for (const x of [2.6, 4.7, 6.8, 8.9, 11])
    for (const z of [6.65, 9.92]) {
      box(0.52, 0.045, 0.4, x, 0.27, z, p.leaves2);
      tree(x, z);
    }
  for (const [x, width] of [
    [-3.1, 3],
    [18.5, 5],
  ])
    box(width, 0.025, 2.35, x, 0.255, 8.4, p.leaves2);
  for (const x of [-3.3, 3.65, 7.85, 12.25, 20.8]) {
    const b = group(x, 0.31, 9.78);
    box(0.9, 0.08, 0.32, 0, 0.27, 0, p.roof, b);
    box(0.9, 0.28, 0.04, 0, 0.44, -0.14, p.roof, b);
    for (const q of [-1, 1])
      box(0.06, 0.27, 0.25, q * 0.32, 0.135, 0, p.dark, b);
  }
  tree(-4.2, 8.4);
  tree(16.6, 9.9);
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

  const sailMaterials = Object.fromEntries(
    ["brick", "green", "ivory", "roof"].map((key) => [
      key,
      material(p[key].color, { transparent: true }),
    ]),
  );
  sailMaterials.blue = material("#4e82a0", { transparent: true });
  const sailboats = Array.from({ length: 3 }, (_, i) => {
    const g = group(-2 + i * 8.5, 0.32, 13 + (i % 2) * 2.7),
      mat = [sailMaterials.green, sailMaterials.brick, sailMaterials.blue][i];
    const hull = mesh(new THREE.SphereGeometry(0.5, 12, 8), mat, 0, 0, 0, g);
    hull.scale.set(0.48, 0.23, 1.65);
    box(0.31, 0.025, 1.07, 0, 0.06, 0, sailMaterials.ivory, g);
    rod([0, 0.07, 0], [0, 1.85, 0], 0.022, sailMaterials.roof, g);
    rod([0, 0.27, 0], [0, 0.27, -0.69], 0.018, sailMaterials.roof, g);
    const sails = new THREE.Group();
    g.add(sails);
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
        material(forward ? "#ebdcc0" : "#fff6e7", {
          side: THREE.DoubleSide,
          transparent: true,
        }),
        0,
        0,
        0,
        sails,
      );
    }
    const wake = mesh(
      new THREE.RingGeometry(0.35, 0.38, 24),
      material("#f2f3de", {
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      0,
      0.01,
      -0.5,
      g,
    );
    wake.rotation.x = -Math.PI / 2;
    wake.scale.y = 2;
    wake.visible = false;
    wake.castShadow = false;
    const skipper = group(0, 0.12, -0.37, g);
    cylinder(0.055, 0.15, 0, 0.1, 0, p.brick, skipper);
    mesh(new THREE.SphereGeometry(0.055, 8, 6), p.ivory, 0, 0.22, 0, skipper);
    return { g, sails, wake, x: -2 + i * 8.5, z: 13 + (i % 2) * 2.7 };
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
    actor: person(
      walk.point[0],
      walk.point[2],
      i % 2 ? p.brick : p.green,
      0.42,
      i + 2,
    ),
  }));
  let diagnostics = {};
  function update(sim, world) {
    sailboats.forEach(({ g, sails, wake }, i) => {
      const pose = sailboatPose(
        i,
        sim.ambientTime,
        sim.discoveries.active[`sailboat${i}`],
      );
      g.position.set(
        pose.x,
        0.32 + Math.sin(sim.ambientTime * 1.5 + i) * 0.018,
        pose.z,
      );
      g.rotation.set(
        Math.sin(sim.ambientTime * 0.8 + i) * 0.025,
        pose.yaw,
        pose.heel +
          Math.sin(sim.ambientTime * 1.3 + i) *
            Math.min(0.1, (world?.weather?.windKph || 0) / 400),
      );
      sails.rotation.y = pose.sail;
      wake.visible = pose.wake > 0.05;
      wake.material.opacity = pose.wake * 0.4;
      wake.scale.set(1 + pose.wake * 0.5, 2 + pose.wake, 1);
    });
    diagnostics = {
      museum: true,
      museumPosition: museum.position.toArray(),
      lakeEdge: "south",
      lakeRoad: { connected: true, z: LAKE_ROAD_Z, treeRows: 2 },
      sailboats: sailboats.length,
      sailing: sailboats.map((boat, i) => ({
        id: `sailboat${i}`,
        position: boat.g.position.toArray(),
        heel: boat.g.rotation.z,
        active: sim.discoveries.active[`sailboat${i}`] !== undefined,
      })),
      walkers: people.map(({ id, actor, seated }) => ({
        id,
        x: actor.g.position.x,
        z: actor.g.position.z,
        walking: seated
          ? sim.discoveries.active[id] !== undefined
          : sim.discoveries.active[id] === undefined,
        seated: !!seated && sim.discoveries.active[id] === undefined,
        fall: actor.g.rotation.x,
      })),
    };
  }
  return {
    walkers: people,
    update,
    target: (id) => {
      if (/^sailboat[0-2]$/.test(id))
        return sailboats[Number(id.at(-1))].g.position
          .clone()
          .add(new THREE.Vector3(0, 0.65, 0));
      const w = people.find((w) => w.id === id);
      return w
        ? w.actor.g.position.clone().add(new THREE.Vector3(0, 0.6, 0))
        : null;
    },
    diagnostics: () => diagnostics,
  };
}
