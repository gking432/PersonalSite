import { createMachine } from "./machineScene";
import { MarblePhysics } from "./marblePhysics";
import { MarbleRound } from "./marbleRound";
import { buildTextSurfaces, positionTextSurfaces } from "./textSurfaces";

export function createPageMarbles(onState) {
  const canvas = document.createElement("canvas");
  canvas.className = "marble-overlay";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const physics = new MarblePhysics();
  const round = new MarbleRound();
  const flashes = [];
  let pointer = { x: innerWidth / 2, y: 200 };
  const state = {
    started: false,
    paused: false,
    caught: 0,
    ready: false,
    error: "",
  };
  let host = null,
    scene = null,
    surfaces = [],
    enabled = true,
    disposed = false;
  let raf = 0,
    last = 0,
    accumulator = 0,
    width = innerWidth,
    height = innerHeight;
  let generation = 0,
    rebuildTimer = 0,
    drag = null,
    dragged = false,
    geometryReady = false;
  let lastEmissionX = 0.8,
    frameMs = 0,
    escapeCount = 0;
  const notify = () => onState({ ...state, ...round.snapshot() });
  const running = () =>
    state.started && !state.paused && enabled && !document.hidden && !disposed;
  function sizeCanvas() {
    width = document.documentElement.clientWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  async function rebuild() {
    const token = ++generation;
    try {
      const next = await buildTextSurfaces(
        document.querySelector(".layout"),
        () => disposed || token !== generation,
      );
      if (disposed || token !== generation) return;
      surfaces = next;
      physics.wake();
      geometryReady = true;
    } catch {
      // The ordinary website stays usable if a browser cannot rasterize a font.
      state.error = "The marble game could not read the page. Try reloading.";
      state.paused = true;
      notify();
    }
  }
  function scheduleRebuild() {
    if (!state.started || !enabled) return;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(rebuild, 180);
  }
  function escaped(point) {
    if (!host?.isConnected) return;
    const r = host.getBoundingClientRect(),
      scale = r.width / (host.clientWidth || 1);
    const x = r.left + point.x * scale,
      y = r.top + scrollY + point.y * scale;
    lastEmissionX = x / width;
    physics.add({
      x,
      y,
      vx: point.vx * scale + (Math.random() - 0.5) * 35,
      vy: point.vy,
      radius: point.radius * scale,
      visibleTop: scrollY,
      visibleBottom: scrollY + height,
    });
    escapeCount++;
  }
  function attach(element) {
    if (element === host) return;
    scene?.dispose();
    scene = null;
    host = element;
    if (host && enabled) {
      try {
        scene = createMachine(host, escaped);
        state.ready = true;
        notify();
      } catch {
        state.ready = false;
        state.error = "The 3D workshop is unavailable in this browser.";
        notify();
      }
    }
  }
  function emit() {
    if (scene) scene.emit();
    else
      physics.add({
        x: Math.max(
          12,
          Math.min(
            width - 12,
            lastEmissionX * width + (Math.random() - 0.5) * width * 0.45,
          ),
        ),
        y: -12,
        vx: (Math.random() - 0.5) * 70,
        radius: 6,
        visibleTop: scrollY,
        visibleBottom: scrollY + height,
      });
  }
  function flash(x, y, label) {
    flashes.push({ x, y, label, life: 1 });
  }
  function finishCatch(hitText, x, y) {
    const result = round.catch(hitText);
    flash(x, y, result.label);
    notify();
    draw();
  }
  function catchAt(x, y) {
    if (!running() || document.querySelector(".navbar-menu-open, dialog[open]"))
      return false;
    const ball = physics.hitTest(x, y + scrollY);
    if (ball) {
      physics.remove(ball);
      finishCatch(ball.hitText, x, y + scrollY);
      return true;
    }
    return false;
  }
  function drawBall(b) {
    const y = b.y - scrollY,
      r = b.radius;
    if (y < -20 || y > height + 20) return;
    ctx.fillStyle = "rgba(33,45,34,.12)";
    ctx.beginPath();
    ctx.ellipse(b.x + 2, y + r + 2, r * 0.85, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    const gradient = ctx.createRadialGradient(
      b.x - r * 0.35,
      y - r * 0.4,
      r * 0.08,
      b.x,
      y,
      r,
    );
    gradient.addColorStop(0, "#fff0ba");
    gradient.addColorStop(0.25, "#dfa45e");
    gradient.addColorStop(0.7, "#ac6637");
    gradient.addColorStop(1, "#563b26");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(b.x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const ball of physics.balls) drawBall(ball);
    ctx.font = "500 12px Inter, sans-serif";
    for (const f of flashes) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = f.label === "−1" ? "#9d442d" : "#27543b";
      ctx.fillText(f.label, f.x + 9, f.y - scrollY - 14 - (1 - f.life) * 22);
    }
    ctx.globalAlpha = 1;
  }

  function requestFrame() {
    if (!raf && running()) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }
  function tick(now) {
    raf = 0;
    if (!running()) return;
    const began = performance.now(),
      dt = Math.min((now - last) / 1000, 0.035);
    last = now;
    // Suspend during a navigation overlay rather than drawing through it.
    if (document.querySelector(".navbar-menu-open, dialog[open]")) {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, width, height);
      return;
    }
    if (geometryReady) {
      if (round.tick(dt)) emit();
      for (let i = flashes.length - 1; i >= 0; i--) {
        flashes[i].life -= dt;
        if (flashes[i].life <= 0) flashes.splice(i, 1);
      }
      const r = host?.getBoundingClientRect();
      scene?.tick(dt, Boolean(r && r.bottom > 0 && r.top < height));
      const connected = surfaces.filter((s) => s.el.isConnected);
      if (positionTextSurfaces(connected)) physics.wake();
      accumulator = Math.min(accumulator + dt, 0.05);
      while (accumulator >= 1 / 180) {
        physics.step(1 / 180, connected, {
          width,
          height: document.documentElement.scrollHeight,
          onTextHit: (ball) => {
            round.miss();
            flash(ball.x, ball.y, "−1");
            notify();
          },
        });
        accumulator -= 1 / 180;
      }
      draw();
    }
    frameMs = frameMs * 0.95 + (performance.now() - began) * 0.05;
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (state.started || !enabled || !scene) return;
    state.started = true;
    notify();
    rebuild();
    requestFrame();
  }
  function togglePause() {
    state.paused = !state.paused;
    notify();
    if (state.paused) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else requestFrame();
  }
  function reset() {
    state.started = false;
    state.paused = false;
    round.reset();
    flashes.length = 0;
    cancelAnimationFrame(raf);
    raf = 0;
    clearTimeout(rebuildTimer);
    generation++;
    geometryReady = false;
    physics.clear();
    scene?.clear();
    ctx.clearRect(0, 0, width, height);
    notify();
  }
  function key(e) {
    if (!state.started) return;
    const directions = {
      ArrowLeft: [-14, 0],
      ArrowRight: [14, 0],
      ArrowUp: [0, -14],
      ArrowDown: [0, 14],
    };
    if (directions[e.key]) {
      e.preventDefault();
      const [x, y] = directions[e.key];
      pointer = {
        x: Math.max(0, Math.min(width, pointer.x + x)),
        y: Math.max(0, Math.min(height, pointer.y + y)),
      };
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      catchAt(pointer.x, pointer.y);
    }
  }
  function click(e) {
    if (dragged) {
      dragged = false;
      return;
    }
    if (e.target instanceof Element && e.target.closest(".marble-controls"))
      return;
    if (catchAt(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
  function pointerDown(e) {
    if (!e.isPrimary || e.button !== 0) return;
    pointer = { x: e.clientX, y: e.clientY };
    dragged = false;
    if (!host?.contains(e.target)) return;
    drag = { x: e.clientX, pointerId: e.pointerId };
    host.setPointerCapture(e.pointerId);
    start();
  }
  function pointerMove(e) {
    if (!e.isPrimary) return;
    pointer = { x: e.clientX, y: e.clientY };
    if (drag && scene && drag.pointerId === e.pointerId) {
      const delta = e.clientX - drag.x;
      if (Math.abs(delta) > 2) dragged = true;
      scene.rotate(delta * 0.008);
      drag.x = e.clientX;
    }
  }
  const pointerUp = () => {
    drag = null;
  };
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else requestFrame();
  }
  function resize() {
    sizeCanvas();
    scene?.resize();
    scheduleRebuild();
    physics.wake();
  }
  function setEnabled(value) {
    enabled = value;
    if (!value) {
      generation++;
      clearTimeout(rebuildTimer);
      cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, width, height);
    } else {
      if (host && !scene) {
        const saved = host;
        host = null;
        attach(saved);
      }
      geometryReady = false;
      resize();
      requestFrame();
    }
  }
  function changePage() {
    physics.clear();
    surfaces = [];
    geometryReady = false;
    scheduleRebuild();
  }
  const observer = new MutationObserver((records) => {
    // The score lives inside the homepage, but changing it does not reflow text.
    if (
      records.some(({ target }) => {
        const el = target instanceof Element ? target : target.parentElement;
        return !el?.closest(".kinetic-machine, .marble-controls");
      })
    )
      scheduleRebuild();
  });
  const main = document.querySelector(".main-content");
  if (main)
    observer.observe(main, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  window.addEventListener("click", click, true);
  window.addEventListener("resize", resize);
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove, { passive: true });
  window.addEventListener("pointerup", pointerUp);
  window.addEventListener("pointercancel", pointerUp);
  document.addEventListener("visibilitychange", visibility);
  document.fonts.addEventListener("loadingdone", scheduleRebuild);
  sizeCanvas();
  const api = {
    attach,
    start,
    key,
    togglePause,
    reset,
    setEnabled,
    changePage,
    dispose() {
      disposed = true;
      generation++;
      cancelAnimationFrame(raf);
      clearTimeout(rebuildTimer);
      observer.disconnect();
      scene?.dispose();
      canvas.remove();
      window.removeEventListener("click", click, true);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      document.removeEventListener("visibilitychange", visibility);
      document.fonts.removeEventListener("loadingdone", scheduleRebuild);
      if (import.meta.env.DEV && window.__marbleGame?.api === api)
        delete window.__marbleGame;
    },
  };
  if (import.meta.env.DEV)
    window.__marbleGame = {
      api,
      physics,
      round,
      machineTargets: () => {
        const r = host?.getBoundingClientRect();
        return r && scene
          ? scene.targets().map((p) => ({
              x: r.left + (p.x * r.width) / host.clientWidth,
              y: r.top + (p.y * r.width) / host.clientWidth,
              radius: p.radius,
              route: p.flight.route,
            }))
          : [];
      },
      get surfaces() {
        return surfaces;
      },
      snapshot: () => ({
        ...state,
        ...round.snapshot(),
        routeUses: scene?.routeUses || [],
        rotation: scene?.rotation ?? null,
        enabled,
        frameMs,
        geometryReady,
        surfaceCount: surfaces.length,
        balls: physics.balls.length,
        sleepers: physics.balls.filter((b) => b.sleep > 0.8).length,
        inFlight: scene?.inFlight || 0,
        escapeCount,
        ...physics.stats,
      }),
    };
  return api;
}
