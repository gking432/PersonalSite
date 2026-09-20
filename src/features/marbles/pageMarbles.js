import { createMachine } from "./machineScene";
import { MarblePhysics } from "./marblePhysics";
import { buildTextSurfaces, positionTextSurfaces } from "./textSurfaces";

export function createPageMarbles(onState) {
  const canvas = document.createElement("canvas");
  canvas.className = "marble-overlay";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const physics = new MarblePhysics();
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
    feed = 0,
    catcherX = 0,
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
  const notify = () => onState({ ...state });
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
        catcherX = host.getBoundingClientRect().left + host.clientWidth / 2;
        notify();
      } catch {
        state.ready = false;
        state.error = "The 3D workshop is unavailable in this browser.";
        notify();
      }
    }
  }
  function catcher() {
    if (!scene || !host?.isConnected) return null;
    const r = host.getBoundingClientRect();
    return {
      x: Math.max(r.left + 26, Math.min(r.right - 26, catcherX)),
      y: r.bottom + scrollY - 9,
      width: 66,
    };
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
  function drawCatcher(c) {
    const y = c.y - scrollY;
    if (y < -30 || y > height + 30) return;
    ctx.save();
    ctx.translate(c.x, y);
    const fill = ctx.createLinearGradient(0, -5, 0, 22);
    fill.addColorStop(0, "#547664");
    fill.addColorStop(1, "#163e2e");
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-33, 0);
    ctx.quadraticCurveTo(-26, 24, 0, 24);
    ctx.quadraticCurveTo(26, 24, 33, 0);
    ctx.fill();
    ctx.fillStyle = "#1c362b";
    ctx.beginPath();
    ctx.ellipse(0, 0, 33, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c6a563";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }
  function draw(c) {
    ctx.clearRect(0, 0, width, height);
    for (const ball of physics.balls) drawBall(ball);
    if (c) drawCatcher(c);
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
      feed += dt;
      if (feed >= 1.05) {
        feed = 0;
        if (scene) scene.emit();
        else
          physics.add({
            x: Math.max(12, Math.min(width - 12, lastEmissionX * width)),
            y: -12,
            vx: (Math.random() - 0.5) * 70,
            radius: 6,
            visibleTop: scrollY,
            visibleBottom: scrollY + height,
          });
      }
      const r = host?.getBoundingClientRect();
      scene?.tick(dt, Boolean(r && r.bottom > 0 && r.top < height));
      const connected = surfaces.filter((s) => s.el.isConnected);
      if (positionTextSurfaces(connected)) physics.wake();
      const c = catcher();
      accumulator = Math.min(accumulator + dt, 0.05);
      while (accumulator >= 1 / 180) {
        physics.step(1 / 180, connected, {
          width,
          height: document.documentElement.scrollHeight,
          catcher: c,
          onCatch: () => {
            state.caught++;
            scene?.returned();
            notify();
          },
        });
        accumulator -= 1 / 180;
      }
      draw(c);
    }
    frameMs = frameMs * 0.95 + (performance.now() - began) * 0.05;
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (dragged) {
      dragged = false;
      return;
    }
    if (state.started || !enabled || !scene) return;
    state.started = true;
    feed = 1.05;
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
    state.caught = 0;
    cancelAnimationFrame(raf);
    raf = 0;
    clearTimeout(rebuildTimer);
    generation++;
    geometryReady = false;
    physics.clear();
    scene?.clear();
    ctx.clearRect(0, 0, width, height);
    feed = 0;
    notify();
  }
  function key(e) {
    if (!state.started || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    catcherX += e.key === "ArrowLeft" ? -25 : 25;
  }
  function pointerDown(e) {
    if (!host?.contains(e.target)) return;
    drag = { x: e.clientX };
    dragged = false;
  }
  function pointerMove(e) {
    if (state.started) catcherX = e.clientX;
    else if (drag && scene) {
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
  const observer = new MutationObserver(scheduleRebuild);
  const main = document.querySelector(".main-content");
  if (main)
    observer.observe(main, {
      childList: true,
      subtree: true,
      characterData: true,
    });
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
      get surfaces() {
        return surfaces;
      },
      snapshot: () => ({
        ...state,
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
