import { createLiveWeather } from "./liveWeather";
import { createPhoneRing } from "./phoneRing";
import { TrafficSimulation } from "./trafficSimulation";
import { createCityScene } from "./cityScene";
import { createTrumpetPlayer } from "./trumpet";
export function createCityRuntime(host, controls, onState) {
  const sim = new TrafficSimulation();
  const trumpet = createTrumpetPlayer();
  const phone = createPhoneRing();
  const weather = createLiveWeather();
  const pointers = new Map();
  let pinch = null;
  let pageCars = null,
    pageLoading = null,
    pendingFalls = [];
  let enabled = true,
    visible = true,
    disposed = false,
    raf = 0,
    last = 0,
    accumulator = 0,
    drag = null,
    suppressClick = false,
    signature = "";
  const scene = createCityScene(host, controls, (point) => {
    if (pageCars) pageCars.add(point);
    else {
      pendingFalls.push(point);
      if (pendingFalls.length > 16) pendingFalls.shift();
    }
  });
  const state = () => ({
    ...sim.snapshot(),
    zoom: scene.pose.zoom,
    ready: true,
    world: weather.read(),
  });
  const running = () =>
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
        next.discoveries,
        next.zoom,
        next.world.label,
        next.world.status,
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
    scene.update(sim, dt, weather.read());
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
        pageCars.setEnabled(enabled && sim.started);
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
    sim.hop.enabled = true;
    preparePage();
    pageCars?.setEnabled(enabled);
    notify();
    schedule();
  }
  function toggleSignal(axis) {
    if (!enabled || disposed || suppressClick) return;
    start();
    sim.toggle(axis);
    scene.update(sim, 0, weather.read());
    scene.render();
    notify();
    schedule();
  }
  function toggleBridge() {
    if (!enabled || disposed || suppressClick) return;
    start();
    sim.toggleBridge();
    scene.update(sim, 0, weather.read());
    scene.render();
    notify();
    schedule();
  }
  function reset() {
    stop();
    trumpet.stop();
    phone.stop();
    sim.reset();
    pendingFalls = [];
    pageCars?.clear();
    accumulator = 0;
    scene.clear();
    scene.resetView();
    scene.update(sim, 0, weather.read());
    scene.render();
    notify();
    schedule();
  }
  function discover(id) {
    if (!enabled || disposed || suppressClick) return;
    start();
    if (!sim.discoveries.trigger(id)) return;
    if (id === "musician") trumpet.play();
    if (id === "payphone") phone.play();
    if (id === "hop" && !sim.hop.car()) sim.hop.next = 0;
    scene.update(sim, 0, weather.read());
    scene.render();
    notify();
  }
  function pointerDown(e) {
    if (
      (e.pointerType !== "touch" && !e.isPrimary) ||
      ![0, 2].includes(e.button)
    )
      return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    suppressClick = false;
    drag = {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      id: e.pointerId,
      pan: e.button === 2 || e.shiftKey,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        zoom: scene.pose.zoom,
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      };
      drag = null;
      suppressClick = true;
    }
    start();
  }
  function pointerMove(e) {
    if (pointers.has(e.pointerId))
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      scene.setZoom(
        (pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) /
          Math.max(1, pinch.distance),
      );
      const x = (a.x + b.x) / 2,
        y = (a.y + b.y) / 2;
      scene.pan(x - pinch.x, y - pinch.y);
      pinch.x = x;
      pinch.y = y;
      suppressClick = true;
      notify();
      return;
    }
    if (!drag || drag.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5)
      suppressClick = true;
    if (drag.pan) scene.pan(e.clientX - drag.x, e.clientY - drag.y);
    else scene.rotate(e.clientX - drag.x, e.clientY - drag.y);
    drag.x = e.clientX;
    drag.y = e.clientY;
  }
  function pointerUp(e) {
    if (e) pointers.delete(e.pointerId);
    else pointers.clear();
    if (pointers.size) {
      drag = null;
      return;
    }
    pinch = null;
    drag = null;
    // A native click follows pointerup in the same task. Clear after that click,
    // including cancellation/lost capture, so later keyboard clicks still work.
    setTimeout(() => {
      suppressClick = false;
    }, 0);
  }
  function zoomBy(factor) {
    if (!enabled || disposed) return;
    scene.setZoom(scene.pose.zoom * factor);
    notify();
  }
  function wheel(e) {
    if (!enabled || disposed || (!sim.started && !e.ctrlKey)) return;
    const before = scene.pose.zoom;
    zoomBy(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.025 : 0.002)));
    // Ordinary page scrolling continues at the zoom limits. Trackpad pinch
    // stays within the miniature and never changes the browser's page scale.
    if (e.ctrlKey || scene.pose.zoom !== before) e.preventDefault();
  }
  host.parentElement.addEventListener("wheel", wheel, { passive: false });
  function key(e) {
    if (["+", "=", "-", "_"].includes(e.key)) {
      e.preventDefault();
      zoomBy(e.key === "-" || e.key === "_" ? 1 / 1.15 : 1.15);
    } else if (["Enter", " "].includes(e.key)) {
      e.preventDefault();
      start();
    } else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      start();
      const move = e.shiftKey ? scene.pan : scene.rotate;
      move(
        e.key === "ArrowLeft" ? -12 : e.key === "ArrowRight" ? 12 : 0,
        e.key === "ArrowUp" ? -12 : e.key === "ArrowDown" ? 12 : 0,
      );
    }
  }
  const syncWeather = () =>
    weather.setActive(enabled && visible && !document.hidden);
  function visibility() {
    syncWeather();
    if (document.hidden) {
      stop();
      trumpet.stop();
      phone.stop();
    } else schedule();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncWeather();
    if (!visible) {
      trumpet.stop();
      phone.stop();
    }
    if (running()) schedule();
    else stop();
  });
  intersection.observe(host);
  const size = new ResizeObserver(() => scene.resize());
  size.observe(host);
  document.addEventListener("visibilitychange", visibility);
  scene.update(sim, 0, weather.read());
  scene.render();
  notify();
  schedule();
  const api = {
    start,
    toggleSignal,
    toggleBridge,
    discover,
    zoomBy,
    reset,
    pointerDown,
    pointerMove,
    pointerUp,
    key,
    refresh() {
      if (!disposed) {
        scene.update(sim, 0, weather.read());
        scene.render();
        notify();
      }
    },
    setEnabled(value) {
      enabled = value;
      syncWeather();
      pageCars?.setEnabled(value && sim.started);
      if (value) {
        scene.resize();
        schedule();
      } else {
        stop();
        trumpet.stop();
        phone.stop();
      }
    },
    dispose() {
      disposed = true;
      stop();
      trumpet.dispose();
      phone.dispose();
      weather.dispose();
      intersection.disconnect();
      size.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      host.parentElement.removeEventListener("wheel", wheel);
      pointers.clear();
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
        audio: trumpet.snapshot(),
        phoneAudio: phone.snapshot(),
        page: pageCars?.snapshot() || null,
      }),
      inspectLandmarks: () => scene.inspectLandmarks(),
      targets: () => {
        const r = host.getBoundingClientRect();
        return scene
          .targets()
          .map((p) => ({ ...p, x: r.left + p.x, y: r.top + p.y }));
      },
      discoveryTargets: () => {
        const r = host.getBoundingClientRect();
        return scene
          .discoveryTargets()
          .map((p) => ({ ...p, x: r.left + p.x, y: r.top + p.y }));
      },
    };
  return api;
}
