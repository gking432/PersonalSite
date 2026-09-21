import { useEffect, useRef, useState } from "react";
import { SIGNALS } from "./signals";
import "./TrafficCity.css";

function Icon({ name }) {
  const paths = {
    tow: (
      <>
        <path d="M3 15V9h8v6h4v-4h4l3 4v3H3zM6 9V4h3l4 5m-4-5 8 1v4" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    helicopter: (
      <>
        <path d="M5 4h14M12 4v4m-6 5H3L1 8m5 5c0-3 2-5 6-5 5 0 9 3 9 6s-5 3-8 3H9c-2 0-3-1-3-4Zm8-5v5h7M9 17v3m8-3v3M6 20h15" />
      </>
    ),
    pause: (
      <>
        <path d="M8 5v14M16 5v14" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7z" />,
    fullscreen: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6" />,
    exit: <path d="M3 9h6V3m6 0v6h6M9 21v-6H3m18 0h-6v6" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function TrafficCity() {
  const root = useRef(null),
    host = useRef(null),
    buttons = useRef([]),
    engine = useRef(null),
    bridge = useRef(null),
    wrecks = useRef(new Map());
  const [fullscreen, setFullscreen] = useState(false);
  const [wide, setWide] = useState(false);
  const [game, setGame] = useState({
    ready: false,
    started: false,
    paused: false,
    level: 1,
    progress: 0,
    incidents: [],
    cleanupMode: false,
    rescue: { busy: false, cooldown: 0, fuel: 100 },
    tow: { busy: false },
    signals3: { water: "green", wisconsin: "red" },
    bridge: { phase: "closed", requestedOpen: false },
    signals2: { water: "green", wisconsin: "red" },
    signals: { water: "green", wisconsin: "red" },
    error: "",
  });
  useEffect(() => {
    const query = matchMedia("(min-width: 701px)");
    const change = () => setWide(query.matches);
    change();
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (!wide) {
      engine.current?.setEnabled(false);
      return;
    }
    if (engine.current) {
      engine.current.setEnabled(true);
      return;
    }
    import("./cityRuntime")
      .then(({ createCityRuntime }) => {
        if (cancelled) return;
        engine.current = createCityRuntime(
          host.current,
          { signals: buttons.current, bridge, wrecks: wrecks.current },
          setGame,
        );
      })
      .catch(() => {
        if (!cancelled)
          setGame((g) => ({ ...g, error: "The miniature could not load." }));
      });
    return () => {
      cancelled = true;
    };
  }, [wide]);
  useEffect(
    () => () => {
      engine.current?.dispose();
      engine.current = null;
    },
    [],
  );
  useEffect(() => {
    const changed = () =>
      setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  useEffect(() => {
    if (!fullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement)
        setFullscreen(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [fullscreen]);
  async function toggleFullscreen() {
    if (fullscreen) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setFullscreen(false);
    } else {
      try {
        if (root.current.requestFullscreen)
          await root.current.requestFullscreen();
      } catch {
        /* The expanded view also works when native fullscreen is unavailable. */
      }
      setFullscreen(true);
    }
  }
  const unassigned = game.incidents.some((i) => !i.assigned);
  const helicopterLabel =
    game.level < 4
      ? "Helicopter unlocks at level 4"
      : game.rescue.busy
        ? "Helicopter en route"
        : game.rescue.cooldown > 0
          ? `Helicopter refueling: ${game.rescue.cooldown} seconds`
          : "Select an accident for helicopter pickup";
  const towLabel = game.tow.busy
    ? game.tow.waiting
      ? "Tow truck waiting for green"
      : "Tow truck en route"
    : "Select an accident for tow truck pickup";
  return (
    <div
      className="traffic-city"
      ref={root}
      data-fullscreen={fullscreen}
      data-expanded={game.level >= 2}
      onKeyDown={(e) => {
        if (e.key === "Escape") engine.current?.key(e);
      }}
    >
      <div className="traffic-city__toolbar">
        {game.started && (
          <button
            type="button"
            className="traffic-city__tool"
            title={game.paused ? "Resume" : "Pause"}
            aria-label={game.paused ? "Resume traffic" : "Pause traffic"}
            onClick={() => engine.current?.togglePause()}
          >
            <Icon name={game.paused ? "play" : "pause"} />
          </button>
        )}
        <button
          type="button"
          className="traffic-city__tool"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
        >
          <Icon name={fullscreen ? "exit" : "fullscreen"} />
        </button>
      </div>
      {game.started &&
        (game.incidents.length > 0 ||
          game.tow.busy ||
          game.rescue.busy ||
          game.rescue.cooldown > 0) && (
          <div
            className="traffic-city__rescue-tools"
            role="group"
            aria-label="Accident recovery"
          >
            <button
              type="button"
              className="traffic-city__tool"
              title={towLabel}
              aria-label={towLabel}
              aria-pressed={game.cleanupMode === "tow"}
              disabled={game.paused || game.tow.busy || !unassigned}
              onClick={() => engine.current?.toggleCleanup("tow")}
            >
              <Icon name="tow" />
            </button>
            <div className="traffic-city__helicopter">
              <button
                type="button"
                className="traffic-city__tool"
                title={helicopterLabel}
                aria-label={helicopterLabel}
                aria-pressed={game.cleanupMode === "helicopter"}
                disabled={
                  game.paused ||
                  game.level < 4 ||
                  game.rescue.busy ||
                  game.rescue.cooldown > 0 ||
                  !unassigned
                }
                onClick={() => engine.current?.toggleCleanup("helicopter")}
              >
                <Icon name="helicopter" />
              </button>
              {game.rescue.cooldown > 0 && (
                <svg
                  className="traffic-city__fuel"
                  viewBox="0 0 48 48"
                  role="progressbar"
                  aria-label="Helicopter fuel"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={game.rescue.fuel}
                >
                  <circle cx="24" cy="24" r="21" />
                  <circle
                    className="traffic-city__fuel-fill"
                    cx="24"
                    cy="24"
                    r="21"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - game.rescue.fuel}
                  />
                </svg>
              )}
              {game.level < 4 && <span className="traffic-city__lock">L4</span>}
            </div>
          </div>
        )}
      {game.started && (
        <div className="traffic-city__progress">
          <span className="traffic-city__level" role="status">
            Level {game.level}
          </span>
          <div
            role="progressbar"
            aria-label={`Level ${game.level} traffic progress`}
            aria-valuenow={game.progress}
            aria-valuemin={0}
            aria-valuemax={20}
            aria-valuetext={`${game.progress} of 20 cars through`}
            className="traffic-city__bar"
          >
            <span key={game.level} style={{ width: `${game.progress * 5}%` }} />
          </div>
        </div>
      )}
      <div className="traffic-city__stage">
        <div
          ref={host}
          className="traffic-city__model"
          role="button"
          tabIndex={0}
          aria-label="Explore the Milwaukee intersection"
          onPointerDown={(e) => engine.current?.pointerDown(e)}
          onPointerMove={(e) => engine.current?.pointerMove(e)}
          onPointerUp={() => engine.current?.pointerUp()}
          onPointerCancel={() => engine.current?.pointerUp()}
          onKeyDown={(e) => engine.current?.key(e)}
          onClick={() => engine.current?.start()}
        >
          {!game.ready && (
            <span className="traffic-city__fallback">A little Milwaukee.</span>
          )}
        </div>
        {SIGNALS.map((signal, i) => (
          <button
            key={signal.label}
            ref={(node) => {
              buttons.current[i] = node;
            }}
            type="button"
            className="traffic-city__signal"
            data-axis={signal.axis}
            data-junction={signal.junction}
            hidden={game.level < signal.level}
            aria-label={`${signal.label} light: ${[game.signals, game.signals2, game.signals3][signal.junction][signal.axis]}`}
            disabled={!game.started || game.cleanupMode || game.paused}
            tabIndex={game.started ? 0 : -1}
            onClick={() =>
              engine.current?.toggleSignal(signal.axis, signal.junction)
            }
          />
        ))}
        <button
          ref={bridge}
          type="button"
          className="traffic-city__signal traffic-city__bridge"
          hidden={game.level < 3}
          disabled={game.paused || game.cleanupMode}
          aria-label={
            game.bridge.requestedOpen ? "Close the bridge" : "Open the bridge"
          }
          title={game.bridge.requestedOpen ? "Close bridge" : "Open bridge"}
          onClick={() => engine.current?.toggleBridge()}
        />
        {game.incidents.map((incident) => (
          <button
            key={incident.id}
            type="button"
            ref={(node) => {
              if (node) wrecks.current.set(incident.id, node);
              else wrecks.current.delete(incident.id);
            }}
            className="traffic-city__signal traffic-city__wreck"
            hidden={!game.cleanupMode || incident.assigned}
            aria-label={`Pick up accident ${incident.id}`}
            onClick={() => engine.current?.rescue(incident.id)}
          >
            +
          </button>
        ))}
      </div>
      <div className="traffic-city__caption">
        <span role="status">
          {game.error ||
            (game.cleanupMode
              ? "Click the accident."
              : game.paused
                ? "Paused."
                : game.started
                  ? "Click the lights."
                  : "A little Milwaukee.")}
        </span>
        {game.started && (
          <div className="traffic-city__controls">
            <button
              type="button"
              onClick={() => engine.current?.reset()}
              aria-label="Reset traffic"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
