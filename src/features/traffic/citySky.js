import * as THREE from "three";
const mix = (a, b, t) =>
  new THREE.Color(a).lerp(new THREE.Color(b), t).getStyle();
const fract = (n) => n - Math.floor(n);

// A sky wash behind the miniature, masked by the same text bubbles as WebGL.
// Its oval follows the projected city and fades fully before the canvas edges.
export function createCitySky(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "traffic-city__sky";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const stars = Array.from({ length: 115 }, (_, i) => ({
    x: fract(Math.sin(i * 17.13 + 1) * 41871.3),
    y: fract(Math.sin(i * 9.18 + 5) * 21871.7) * 0.65,
    size: 0.5 + fract(Math.sin(i * 11.12) * 8171.3) * 1.1,
  }));
  let world,
    last = 0,
    signature = "",
    diagnostics = {};
  return {
    update(value) {
      world = value;
    },
    draw(project, width, height) {
      if (!world || !ctx) return;
      const center = project(new THREE.Vector3(7, 1.4, -1));
      const extent = project(new THREE.Vector3(28, 1.4, -1));
      const radius = Math.max(
        220,
        Math.hypot(extent.x - center.x, extent.y - center.y) * 1.28,
      );
      const key = [
        width,
        height,
        center.x,
        center.y,
        radius,
        world.phase,
        world.daylight,
        world.golden,
        world.weather?.cloud,
      ]
        .map((n) => (typeof n === "number" ? n.toFixed(3) : n))
        .join();
      const now = performance.now(),
        night = 1 - world.daylight;
      if (key === signature && (night < 0.3 || now - last < 125)) return;
      last = now;
      signature = key;
      const ratio = Math.min(devicePixelRatio || 1, 1.25);
      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      const golden = world.golden,
        cloud = world.weather?.cloud ?? 0.25;
      const top = mix(
        mix("#17233e", "#c7e0e9", world.daylight),
        world.phase === "dawn" ? "#ada2c9" : "#8c779f",
        golden * 0.8,
      );
      const bottom = mix(
        mix("#526788", "#f4eee0", world.daylight),
        "#efb387",
        golden,
      );
      const wash = ctx.createLinearGradient(
        0,
        center.y - radius * 0.75,
        0,
        center.y + radius * 0.7,
      );
      wash.addColorStop(0, top);
      wash.addColorStop(0.6, mix(top, bottom, 0.62));
      wash.addColorStop(1, bottom);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);
      const starOpacity = Math.pow(night, 3) * (1 - cloud * 0.95);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i],
          x = center.x + (s.x - 0.5) * radius * 2,
          y = center.y + (s.y - 0.5) * radius * 1.65;
        ctx.globalAlpha =
          starOpacity * (0.65 + 0.25 * Math.sin(now / 2400 + i));
        ctx.fillStyle = "#fff5dc";
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-in";
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.scale(radius, radius * 0.78);
      const fade = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      fade.addColorStop(0, "#fff");
      fade.addColorStop(0.44, "#fffe");
      fade.addColorStop(0.72, "#fff8");
      fade.addColorStop(1, "#fff0");
      ctx.fillStyle = fade;
      ctx.fillRect(
        -width / radius - 2,
        -height / radius - 2,
        (width / radius) * 2 + 4,
        (height / radius) * 2 + 4,
      );
      ctx.restore();
      // No rectangular crop when zooming or panning close to a viewport edge.
      for (const horizontal of [true, false]) {
        const size = horizontal ? width : height,
          edge = Math.min(80, size * 0.15);
        const g = ctx.createLinearGradient(
          0,
          0,
          horizontal ? width : 0,
          horizontal ? 0 : height,
        );
        g.addColorStop(0, "#fff0");
        g.addColorStop(edge / size, "#fff");
        g.addColorStop(1 - edge / size, "#fff");
        g.addColorStop(1, "#fff0");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = "source-over";
      diagnostics = {
        phase: world.phase,
        stars: starOpacity > 0.1 ? stars.length : 0,
        starOpacity,
        top,
        bottom,
      };
    },
    diagnostics: () => diagnostics,
    dispose() {
      canvas.remove();
    },
  };
}
