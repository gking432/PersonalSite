import { MarblePhysics } from "../marbles/marblePhysics";
import {
  buildTextSurfaces,
  positionTextSurfaces,
} from "../marbles/textSurfaces";

// The miniature hands over a snapshot of each tumbling car. The existing ink
// collision solver lets those cars land on letters while passing through rules.
export function createPageCars(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "traffic-city__overflow";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const physics = new MarblePhysics({ maxBalls: 160 });
  let surfaces = [],
    enabled = true,
    disposed = false,
    ready = false;
  let raf = 0,
    last = 0,
    accumulator = 0,
    generation = 0,
    timer = 0;
  let width = 1,
    height = 1,
    escaped = 0;
  function resize() {
    width = document.documentElement.clientWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  async function rebuild() {
    const token = ++generation;
    try {
      const next = await buildTextSurfaces(
        document.querySelector(".layout"),
        () => disposed || token !== generation,
      );
      if (disposed || token !== generation) return;
      surfaces = next.filter((surface) => !surface.el.closest(".studio-hero"));
      physics.wake();
      ready = true;
      schedule();
    } catch {
      // Keep the page usable even if a browser cannot rasterize a font.
      ready = true;
      schedule();
    }
  }
  function reflow() {
    resize();
    clearTimeout(timer);
    timer = setTimeout(rebuild, 180);
  }
  function schedule() {
    if (
      !raf &&
      enabled &&
      ready &&
      physics.balls.length &&
      !document.hidden &&
      !disposed
    ) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }
  function heroText() {
    return [
      ...document.querySelectorAll(
        ".studio-hero__copy :is(.studio-status, h1, p, a), .traffic-city__caption",
      ),
    ]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width && r.height);
  }
  function overlapsText(car, rects) {
    const y = car.y - scrollY,
      radius = (car.size * Math.SQRT2) / 2 + 12;
    return rects.some(
      (r) =>
        car.x + radius > r.left &&
        car.x - radius < r.right &&
        y + radius > r.top &&
        y - radius < r.bottom,
    );
  }
  function draw() {
    // Retire a sprite before it touches hero copy, even during scrolling or
    // resizing; removing it also prevents it reappearing below the text later.
    const protectedRects = heroText();
    physics.balls = physics.balls.filter(
      (car) => !overlapsText(car, protectedRects),
    );
    ctx.clearRect(0, 0, width, height);
    if (document.querySelector(".navbar-menu-open, dialog[open]")) return;
    for (const car of physics.balls) {
      const y = car.y - scrollY;
      if (y < -40 || y > height + 40) continue;
      ctx.save();
      ctx.translate(car.x, y);
      ctx.rotate(car.angle);
      ctx.drawImage(
        car.sprite,
        -car.size / 2,
        -car.size / 2,
        car.size,
        car.size,
      );
      ctx.restore();
    }
  }
  function tick(now) {
    raf = 0;
    if (!enabled || document.hidden || disposed) return;
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    if (!document.querySelector(".navbar-menu-open, dialog[open]")) {
      const connected = surfaces.filter((s) => s.el.isConnected);
      if (positionTextSurfaces(connected)) physics.wake();
      accumulator = Math.min(0.06, accumulator + dt);
      while (accumulator >= 1 / 180) {
        physics.step(1 / 180, connected, {
          width,
          height: document.documentElement.scrollHeight,
        });
        for (const car of physics.balls) {
          if (car.sleep > 0.8) continue;
          car.angle += car.spin / 180;
          if (car.contacts) car.spin *= 0.94;
        }
        accumulator -= 1 / 180;
      }
    }
    draw();
    if (physics.balls.length) raf = requestAnimationFrame(tick);
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
  }
  const observer = new MutationObserver((records) => {
    if (
      records.some(
        (r) =>
          !(
            r.target.nodeType === 1 ? r.target : r.target.parentElement
          )?.closest(".traffic-city, .traffic-city__overflow"),
      )
    ) {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 180);
    }
  });
  const layout = document.querySelector(".layout");
  if (layout)
    observer.observe(layout, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  window.addEventListener("resize", reflow);
  window.addEventListener("scroll", draw, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  document.fonts.addEventListener("loadingdone", reflow);
  resize();
  rebuild();
  return {
    add(point) {
      if (disposed || !host.isConnected) return;
      const r = host.getBoundingClientRect(),
        scale = r.width / (host.clientWidth || 1);
      const car = physics.add({
        x: r.left + point.x * scale,
        y: r.top + scrollY + point.y * scale,
        vx: point.vx * scale,
        vy: Math.max(40, point.vy * scale),
        radius: Math.min(11.5, point.radius * scale),
        visibleTop: scrollY,
        visibleBottom: scrollY + height,
      });
      Object.assign(car, {
        sprite: point.sprite,
        size: point.size * scale,
        angle: 0,
        spin: point.spin,
      });
      escaped++;
      draw();
      schedule();
    },
    setEnabled(value) {
      enabled = value;
      if (!value) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      draw();
      schedule();
    },
    clear() {
      physics.clear();
      escaped = 0;
      accumulator = 0;
      cancelAnimationFrame(raf);
      raf = 0;
      draw();
    },
    snapshot: () => ({
      ready,
      escaped,
      cars: physics.balls.length,
      contacts: physics.stats.inkContacts,
      surfaces: surfaces.length,
      heroSurfaces: surfaces.filter((s) => s.el.closest(".studio-hero")).length,
    }),
    dispose() {
      disposed = true;
      generation++;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", reflow);
      window.removeEventListener("scroll", draw);
      document.removeEventListener("visibilitychange", visibility);
      document.fonts.removeEventListener("loadingdone", reflow);
      physics.clear();
      surfaces = [];
      canvas.remove();
    },
  };
}
