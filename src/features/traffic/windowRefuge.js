import * as THREE from "three";
import { REFUGE_WINDOWS, WINDOW_NPC } from "./pedestrianEscape.js";

export function createWindowRefuge({
  city,
  box,
  mesh,
  material,
  texture,
  palette: p,
}) {
  // The existing Iron Block's east entrance and second-floor windows.
  box(0.035, 0.59, 0.36, 4.822, 0.72, 3.58, p.dark);
  box(0.038, 0.46, 0.27, 4.842, 0.75, 3.58, p.glass);
  const panels = REFUGE_WINDOWS.map((z) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 320;
    const map = texture(canvas);
    const mat = material("#ffffff", {
      map,
      emissive: "#ffffff",
      emissiveMap: map,
      emissiveIntensity: 0.3,
      roughness: 1,
    });
    const panel = mesh(
      new THREE.PlaneGeometry(0.24, 0.31),
      mat,
      4.825,
      1.2175,
      z,
    );
    panel.rotation.y = Math.PI / 2;
    panel.castShadow = false;
    panel.visible = false;
    return { canvas, map, panel, z };
  });
  const shards = Array.from({ length: 6 }, (_, i) => {
    const shard = mesh(new THREE.CircleGeometry(0.028, 3), p.glass, 0, 0, 0);
    shard.visible = false;
    return shard;
  });
  let state,
    lit = false;
  function update(sim) {
    state = sim.discoveries.pedestrians.states[WINDOW_NPC];
    lit = sim.discoveries.windows;
    panels.forEach(({ canvas, map, panel, z }, i) => {
      const occupied = state?.phase === "inside" && lit;
      const broken = state?.windowBroken && state.windowPane === i;
      panel.visible = occupied || !!broken;
      if (!panel.visible) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 256, 320);
      ctx.fillStyle = lit ? "#dcb76e" : "#42676a";
      ctx.fillRect(0, 0, 256, 320);
      if (
        occupied ||
        (broken && state.phase === "window-hit" && state.time < 0.6)
      ) {
        const x = 128 - ((state.windowZ - z) / 0.24) * 256;
        const collapse = broken ? Math.min(1, state.time / 0.6) : 0;
        ctx.save();
        ctx.translate(x, 70 + collapse * 210);
        ctx.rotate(collapse * 1.2);
        ctx.fillStyle = "#313934";
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-24, 25, 48, 105);
        ctx.lineWidth = 18;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#313934";
        const swing = Math.sin(state.time * 9) * 22;
        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(sign * 14, 122);
          ctx.lineTo(sign * (20 + swing), 198);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sign * 22, 42);
          ctx.lineTo(sign * (38 - swing * 0.5), 106);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (broken) {
        ctx.strokeStyle = lit ? "#f6edcf" : "#bac6bd";
        ctx.lineWidth = 7;
        for (let j = 0; j < 7; j++) {
          const angle = (j * Math.PI * 2) / 7;
          ctx.beginPath();
          ctx.moveTo(128, 132);
          ctx.lineTo(128 + Math.cos(angle) * 58, 132 + Math.sin(angle) * 70);
          ctx.lineTo(
            128 + Math.cos(angle + 0.13) * 180,
            132 + Math.sin(angle + 0.13) * 210,
          );
          ctx.stroke();
        }
        ctx.fillStyle = "#8e3933";
        for (const [x, y, r] of [
          [133, 145, 22],
          [155, 158, 10],
          [112, 137, 7],
          [149, 121, 5],
          [130, 175, 4],
        ]) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      map.needsUpdate = true;
    });
    shards.forEach((shard, i) => {
      shard.visible = state?.phase === "window-hit" && state.time < 1;
      if (shard.visible) {
        const t = state.time;
        shard.position.set(
          4.85 + t * (0.3 + i * 0.04),
          1.22 + t * 0.3 - 2.6 * t * t,
          REFUGE_WINDOWS[state.windowPane] + (i - 2.5) * t * 0.045,
        );
        shard.rotation.set(t * 5 + i, t * 3, i);
      }
    });
  }
  return {
    update,
    occupied: () => state?.phase === "inside" && lit,
    target: () =>
      new THREE.Vector3(4.85, 1.2175, REFUGE_WINDOWS[state?.windowPane ?? 1]),
    visible: () =>
      state?.phase === "inside" &&
      lit &&
      Math.abs(state.windowZ - REFUGE_WINDOWS[state.windowPane]) < 0.2,
    diagnostics: () => ({
      npc: WINDOW_NPC,
      occupied: state?.phase === "inside" && lit,
      broken: !!state?.windowBroken,
      pane: state?.windowPane ?? null,
    }),
  };
}
