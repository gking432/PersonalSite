import { TrafficSimulation } from "./trafficSimulation";
import { createCityScene } from "./cityScene";
export function createCityRuntime(host, controls, onState) {
  const sim = new TrafficSimulation();
  let pageCars = null,
    pageLoading = null,
    pendingFalls = [];
  let paused = false,
    enabled = true,
    visible = true,
    disposed = false,
    raf = 0,
    last = 0,
    accumulator = 0,
    drag = null,
    signature = "";
  const scene = createCityScene(host, controls, (point) => {
    if (pageCars) pageCars.add(point);
    else {
      pendingFalls.push(point);
      if (pendingFalls.length > 16) pendingFalls.shift();
    }
  });
  const state = () => ({ ...sim.snapshot(), paused, ready: true });
  const running = () =>
    sim.started &&
    !paused &&
    enabled &&
    (visible || scene.diagnostics().falling > 0) &&
    !document.hidden &&
    !disposed;
  function notify() {
    const next = state(),
      key = JSON.stringify([
        next.started,
        next.signals,
        next.bridge.phase,
        next.bridge.requestedOpen,
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
      if (visible) sim.tick(1 / 120);
      accumulator -= 1 / 120;
    }
    scene.update(sim, dt);
    scene.render();
    notify();
    if (running()) raf = requestAnimationFrame(tick);
  }
  function preparePage() {
    if (pageCars || pageLoading) return;
    pageLoading = import("./pageCars")
      .then(({ createPageCars }) => {
        if (disposed) return;
        pageCars = createPageCars(host);
        pageCars.setEnabled(enabled && !paused && sim.started);
        for (const point of pendingFalls) pageCars.add(point);
        pendingFalls = [];
      })
      .catch(() => {
        pendingFalls = [];
      })
      .finally(() => {
        pageLoading = null;
      });
  }
  function start() {
    if (!enabled || disposed) return;
    sim.start();
    preparePage();
    pageCars?.setEnabled(enabled && !paused);
    notify();
    schedule();
  }
  function toggleSignal() {
    if (!enabled || disposed || paused) return;
    start();
    sim.toggle();
    scene.update(sim);
    scene.render();
    notify();
    schedule();
  }
  function toggleBridge() {
    if (!enabled || disposed || paused) return;
    start();
    sim.toggleBridge();
    scene.update(sim);
    scene.render();
    notify();
    schedule();
  }
  function reset() {
    stop();
    sim.reset();
    pendingFalls = [];
    pageCars?.clear();
    paused = false;
    accumulator = 0;
    scene.clear();
    scene.update(sim);
    scene.render();
    notify();
  }
  function togglePause() {
    paused = !paused;
    pageCars?.setEnabled(enabled && !paused && sim.started);
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
    } else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      start();
      scene.rotate(
        e.key === "ArrowLeft" ? -12 : e.key === "ArrowRight" ? 12 : 0,
        e.key === "ArrowUp" ? -12 : e.key === "ArrowDown" ? 12 : 0,
      );
    }
  }
  function visibility() {
    if (document.hidden) stop();
    else schedule();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (running()) schedule();
    else stop();
  });
  intersection.observe(host);
  const size = new ResizeObserver(() => scene.resize());
  size.observe(host);
  document.addEventListener("visibilitychange", visibility);
  scene.update(sim);
  scene.render();
  notify();
  const api = {
    start,
    toggleSignal,
    toggleBridge,
    reset,
    togglePause,
    pointerDown,
    pointerMove,
    pointerUp,
    key,
    refresh() {
      if (!disposed) {
        scene.update(sim);
        scene.render();
      }
    },
    setEnabled(value) {
      enabled = value;
      pageCars?.setEnabled(value && !paused && sim.started);
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
      pageCars?.dispose();
      pendingFalls = [];
      if (import.meta.env.DEV && window.__trafficCity?.api === api)
        delete window.__trafficCity;
    },
  };
  if (import.meta.env.DEV)
    window.__trafficCity = {
      api,
      sim,
      snapshot: () => ({
        ...state(),
        enabled,
        visible,
        pose: scene.pose,
        scene: scene.diagnostics(),
        page: pageCars?.snapshot() || null,
      }),
      targets: () => {
        const r = host.getBoundingClientRect();
        return scene
          .targets()
          .map((p) => ({ ...p, x: r.left + p.x, y: r.top + p.y }));
      },
    };
  return api;
}
