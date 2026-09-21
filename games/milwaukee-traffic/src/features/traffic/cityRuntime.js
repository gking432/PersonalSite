import { TrafficSimulation } from "./trafficSimulation";
import { createCityScene } from "./cityScene";
import { UNLOCK } from "./progression.js";

export function createCityRuntime(host, controls, onState) {
  const sim = new TrafficSimulation();
  let pageCars = null,
    pageLoading = null,
    pendingFalls = [];
  const scene = createCityScene(host, controls, (point) => {
    if (pageCars) pageCars.add(point);
    else {
      pendingFalls.push(point);
      if (pendingFalls.length > 16) pendingFalls.shift();
    }
  });
  let cleanupMode = false,
    programMode = false,
    streetMode = false,
    selectedJunction = null,
    roundaboutMode = false,
    toolMessage = "";
  let paused = false,
    enabled = true,
    visible = true,
    disposed = false;
  let raf = 0,
    last = 0,
    accumulator = 0,
    signature = "";
  const pointers = new Map();
  let pinchDistance = 0,
    pinched = false;
  const state = () => ({
    ...sim.snapshot(),
    paused,
    cleanupMode,
    programMode,
    streetMode,
    selectedJunction,
    roundaboutMode,
    toolMessage,
    ready: true,
  });
  const running = () =>
    sim.started &&
    !paused &&
    !sim.gameOver &&
    !sim.expansionPending &&
    enabled &&
    (visible || scene.diagnostics().falling > 0) &&
    !document.hidden &&
    !disposed;
  function notify() {
    const next = state();
    const key = JSON.stringify([
      next.started,
      next.level,
      next.progress,
      next.gameOver,
      next.expansionPending,
      next.tutorial?.id,
      next.neighborhoodReady,
      next.linkedStreet?.key,
      streetMode,
      next.districtReady,
      next.emergency,
      next.allSignals,
      next.programs,
      next.district,
      next.roundabout,
      programMode,
      selectedJunction,
      roundaboutMode,
      toolMessage,
      next.signals2,
      next.signals3,
      next.tow,
      next.incidents,
      next.rescue,
      next.bridge.phase,
      next.bridge.requestedOpen,
      next.bridge.waiting,
      cleanupMode,
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
      if (visible) sim.tick(1 / 120);
      accumulator -= 1 / 120;
    }
    if (sim.gameOver || sim.expansionPending) pageCars?.setEnabled(false);
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
        pageCars.setEnabled(
          enabled &&
            !paused &&
            sim.started &&
            !sim.gameOver &&
            !sim.expansionPending,
        );
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
    if (!enabled || disposed || sim.gameOver) return;
    sim.start();
    preparePage();
    pageCars?.setEnabled(
      enabled && !paused && !sim.gameOver && !sim.expansionPending,
    );
    notify();
    schedule();
  }
  function toggleSignal(axis, junction = 0) {
    if (
      !enabled ||
      disposed ||
      sim.gameOver ||
      sim.expansionPending ||
      cleanupMode
    )
      return;
    if (programMode) {
      selectJunction(junction);
      return;
    }
    if (paused || roundaboutMode) return;
    sim.toggle(axis, junction);
    preparePage();
    scene.update(sim);
    scene.render();
    notify();
    schedule();
  }
  function toggleCleanup(type) {
    if (paused || !enabled || disposed || sim.gameOver || sim.expansionPending)
      return;
    if (
      type === "helicopter" &&
      (sim.level < 4 || sim.rescue.active || sim.rescue.cooldown > 0)
    )
      return;
    if (type === "tow" && sim.tow.active) return;
    if (!["tow", "helicopter"].includes(type)) return;
    programMode = streetMode = roundaboutMode = false;
    selectedJunction = null;
    cleanupMode = cleanupMode === type ? false : type;
    notify();
  }
  function rescue(id) {
    if (
      !cleanupMode ||
      paused ||
      !enabled ||
      sim.gameOver ||
      sim.expansionPending
    )
      return;
    const dispatched =
      cleanupMode === "tow" ? sim.dispatchTow(id) : sim.dispatchRescue(id);
    if (dispatched) {
      cleanupMode = false;
      notify();
      schedule();
    }
  }
  function toggleBridge() {
    if (!enabled || paused || sim.gameOver || sim.expansionPending) return;
    sim.toggleBridge();
    notify();
    schedule();
  }
  function reset() {
    stop();
    clearPointers();
    sim.reset();
    cleanupMode = programMode = streetMode = roundaboutMode = false;
    selectedJunction = null;
    toolMessage = "";
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
    if (sim.gameOver || sim.expansionPending) return;
    paused = !paused;
    pageCars?.setEnabled(
      enabled && !paused && !sim.gameOver && !sim.expansionPending,
    );
    notify();
    if (paused) stop();
    else schedule();
  }
  function toggleProgramMode() {
    if (
      sim.level < UNLOCK.timer ||
      sim.gameOver ||
      sim.expansionPending ||
      !enabled
    )
      return;
    programMode = !programMode;
    selectedJunction = null;
    cleanupMode = streetMode = roundaboutMode = false;
    toolMessage = "";
    notify();
  }
  function toggleRoundaboutMode() {
    if (
      !sim.neighborhoodReady ||
      sim.roundabout !== null ||
      sim.gameOver ||
      sim.expansionPending ||
      !enabled
    )
      return;
    roundaboutMode = !roundaboutMode;
    programMode = streetMode = cleanupMode = false;
    selectedJunction = null;
    toolMessage = "";
    notify();
  }
  function selectJunction(junction) {
    if (sim.gameOver || sim.expansionPending || !enabled) return;
    if (roundaboutMode) {
      if (sim.placeRoundabout(junction)) {
        roundaboutMode = false;
        toolMessage = "";
        scene.update(sim);
        scene.render();
      } else toolMessage = "Let the crossing clear first.";
    } else if (programMode && sim.roundabout !== junction) {
      selectedJunction = junction;
      toolMessage = "";
    }
    notify();
  }
  function configureProgram(junction, rule) {
    if (sim.gameOver || sim.expansionPending || !enabled) return;
    if (sim.configureProgram(junction, rule)) {
      toolMessage = "";
      selectedJunction = null;
      programMode = false;
    } else toolMessage = "Choose an unlocked crossing without a roundabout.";
    notify();
    schedule();
  }
  function toggleStreetMode() {
    if (
      sim.level < UNLOCK.street ||
      sim.gameOver ||
      sim.expansionPending ||
      !enabled
    )
      return;
    streetMode = !streetMode;
    programMode = cleanupMode = roundaboutMode = false;
    selectedJunction = null;
    toolMessage = "";
    notify();
  }
  function linkStreet(key) {
    if (!sim.linkStreet(key)) return;
    streetMode = false;
    scene.update(sim);
    scene.render();
    notify();
  }
  function closeProgram() {
    selectedJunction = null;
    toolMessage = "";
    notify();
  }
  function restart() {
    reset();
    start();
    host.focus({ preventScroll: true });
  }
  function pointerDown(e) {
    if (
      (e.pointerType !== "touch" && (!e.isPrimary || e.button !== 0)) ||
      sim.expansionPending ||
      !enabled ||
      disposed
    )
      return;
    if (!pointers.size) pinched = false;
    const rotate = host.contains(e.target);
    // Observe touches on projected controls too, but preserve ordinary taps.
    if (!rotate && e.pointerType !== "touch") return;
    pointers.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      rotate,
      target: e.currentTarget,
    });
    if (rotate) e.currentTarget.setPointerCapture(e.pointerId);
    if (pointers.size >= 2) {
      pinched = true;
      pinchDistance = distanceBetweenPointers();
      for (const [id, pointer] of pointers) {
        pointer.rotate = true;
        pointer.target.setPointerCapture(id);
      }
    }
    if (rotate || pinched) start();
  }
  function distanceBetweenPointers() {
    const [a, b] = pointers.values();
    return b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
  }
  function pointerMove(e) {
    const pointer = pointers.get(e.pointerId);
    if (!pointer) return;
    const dx = e.clientX - pointer.x,
      dy = e.clientY - pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (pointers.size >= 2) {
      const distance = distanceBetweenPointers();
      if (pinchDistance > 0 && distance > 0)
        scene.zoomBy(distance / pinchDistance);
      pinchDistance = distance;
    } else if (pointer.rotate) scene.rotate(dx, dy);
  }
  function pointerUp(e) {
    const pointer = pointers.get(e.pointerId);
    if (!pointer) return;
    pointers.delete(e.pointerId);
    pinchDistance = distanceBetweenPointers();
    if (pointer.target.hasPointerCapture(e.pointerId))
      pointer.target.releasePointerCapture(e.pointerId);
  }
  function clearPointers() {
    for (const id of [...pointers.keys()]) pointerUp({ pointerId: id });
  }
  function lostPointerCapture(e) {
    const pointer = pointers.get(e.pointerId);
    // Ignore a control releasing its implicit capture as a pinch takes over.
    if (pointer && !pointer.target.hasPointerCapture(e.pointerId)) pointerUp(e);
  }
  function clickCapture(e) {
    // A browser may synthesize a click after the last finger lifts.
    if (pinched && e.detail !== 0) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  function key(e) {
    if (sim.expansionPending) return;
    if (e.key === "Escape") {
      cleanupMode = programMode = streetMode = roundaboutMode = false;
      selectedJunction = null;
      toolMessage = "";
      notify();
    } else if (["Enter", " "].includes(e.key)) {
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
    if (document.hidden) {
      clearPointers();
      stop();
    } else schedule();
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (running()) schedule();
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
    refresh() {
      if (!disposed) {
        scene.update(sim);
        scene.render();
      }
    },
    start,
    acknowledgeExpansion() {
      if (!sim.acknowledgeExpansion()) return;
      cleanupMode = programMode = streetMode = roundaboutMode = false;
      selectedJunction = null;
      toolMessage = "";
      accumulator = 0;
      pageCars?.setEnabled(enabled && !paused && sim.started);
      scene.update(sim, paused ? 2.4 : 0);
      scene.render();
      notify();
      schedule();
      host.focus({ preventScroll: true });
    },
    toggleSignal,
    toggleCleanup,
    toggleProgramMode,
    toggleStreetMode,
    linkStreet,
    toggleRoundaboutMode,
    selectJunction,
    configureProgram,
    closeProgram,
    restart,
    rescue,
    toggleBridge,
    reset,
    togglePause,
    pointerDown,
    pointerMove,
    pointerUp,
    lostPointerCapture,
    clickCapture,
    key,
    setEnabled(value) {
      enabled = value;
      pageCars?.setEnabled(
        value &&
          !paused &&
          sim.started &&
          !sim.gameOver &&
          !sim.expansionPending,
      );
      if (value) {
        scene.resize();
        schedule();
      } else {
        clearPointers();
        stop();
      }
    },
    dispose() {
      disposed = true;
      clearPointers();
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
