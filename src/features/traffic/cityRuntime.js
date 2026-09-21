import { TrafficSimulation } from "./trafficSimulation";
import { createCityScene } from "./cityScene";

export function createCityRuntime(host, buttons, onState) {
  const sim = new TrafficSimulation();
  const scene = createCityScene(host, buttons);
  let paused = false,
    enabled = true,
    visible = true,
    disposed = false;
  let raf = 0,
    last = 0,
    accumulator = 0,
    drag = null,
    signature = "";
  const state = () => ({ ...sim.snapshot(), paused, ready: true });
  const running = () =>
    sim.started &&
    !sim.jammed &&
    !paused &&
    enabled &&
    visible &&
    !document.hidden &&
    !disposed;
  function notify() {
    const next = state();
    const key = JSON.stringify([
      next.started,
      next.jammed,
      next.score,
      next.signals,
      paused,
    ]);
    if (key !== signature) {
      signature = key;
      onState(next);
    }
  }
  function schedule() {
    if (!raf && running()) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function tick(now) {
    raf = 0;
    if (!running()) return;
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    accumulator = Math.min(0.06, accumulator + dt);
    while (accumulator >= 1 / 120) {
      sim.tick(1 / 120);
      accumulator -= 1 / 120;
    }
    scene.update(sim, dt);
    scene.render();
    notify();
    if (running()) raf = requestAnimationFrame(tick);
  }
  function start() {
    if (!enabled || disposed || sim.jammed) return;
    sim.start();
    notify();
    schedule();
  }
  function toggleSignal(axis) {
    if (!enabled || disposed) return;
    sim.toggle(axis);
    scene.update(sim);
    scene.render();
    notify();
    schedule();
  }
  function reset() {
    stop();
    sim.reset();
    paused = false;
    accumulator = 0;
    scene.clear();
    scene.update(sim);
    scene.render();
    notify();
  }
  function togglePause() {
    paused = !paused;
    notify();
    if (paused) stop();
    else schedule();
  }
  function pointerDown(e) {
    if (!e.isPrimary || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
    host.setPointerCapture(e.pointerId);
    start();
  }
  function pointerMove(e) {
    if (!drag || drag.id !== e.pointerId) return;
    scene.rotate(e.clientX - drag.x, e.clientY - drag.y);
    drag.x = e.clientX;
    drag.y = e.clientY;
  }
  function pointerUp() {
    drag = null;
  }
  function key(e) {
    if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      start();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      start();
      scene.rotate(e.key === "ArrowLeft" ? -12 : 12, 0);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      start();
      scene.rotate(0, e.key === "ArrowUp" ? -12 : 12);
    }
  }
  function resize() {
    scene.resize();
  }
  function visibility() {
    if (document.hidden) stop();
    else schedule();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else stop();
  });
  intersection.observe(host);
  const size = new ResizeObserver(resize);
  size.observe(host);
  document.addEventListener("visibilitychange", visibility);
  scene.update(sim);
  scene.render();
  notify();
  const api = {
    start,
    toggleSignal,
    reset,
    togglePause,
    pointerDown,
    pointerMove,
    pointerUp,
    key,
    setEnabled(value) {
      enabled = value;
      if (value) {
        scene.resize();
        schedule();
      } else stop();
    },
    dispose() {
      disposed = true;
      stop();
      intersection.disconnect();
      size.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      scene.dispose();
      if (import.meta.env.DEV && window.__trafficCity?.api === api)
        delete window.__trafficCity;
    },
  };
  if (import.meta.env.DEV)
    window.__trafficCity = {
      api,
      sim,
      snapshot: () => ({ ...state(), enabled, visible, pose: scene.pose }),
      targets: () => {
        const r = host.getBoundingClientRect();
        return scene
          .targets()
          .map((p) => ({ ...p, x: r.left + p.x, y: r.top + p.y }));
      },
    };
  return api;
}
