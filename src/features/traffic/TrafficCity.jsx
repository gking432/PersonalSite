import { useEffect, useRef, useState } from "react";
import { SIGNALS } from "./signals";
import "./TrafficCity.css";

export default function TrafficCity() {
  const host = useRef(null),
    buttons = useRef([]),
    engine = useRef(null),
    bridge = useRef(null),
    wrecks = useRef(new Map());
  const [wide, setWide] = useState(false);
  const [game, setGame] = useState({
    ready: false,
    started: false,
    paused: false,
    level: 1,
    progress: 0,
    incidents: [],
    cleanupMode: false,
    rescue: { busy: false, cooldown: 0 },
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
  return (
    <div
      className="traffic-city"
      data-expanded={game.level >= 2}
      onKeyDown={(e) => {
        if (e.key === "Escape") engine.current?.key(e);
      }}
    >
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
            hidden={signal.junction === 1 && game.level < 2}
            aria-label={`${signal.label} light: ${(signal.junction ? game.signals2 : game.signals)[signal.axis]}`}
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
            {(game.incidents.length > 0 ||
              game.rescue.busy ||
              game.rescue.cooldown > 0) && (
              <button
                type="button"
                aria-label="Select an accident for helicopter pickup"
                aria-pressed={game.cleanupMode}
                disabled={
                  game.paused ||
                  game.rescue.busy ||
                  game.rescue.cooldown > 0 ||
                  !game.incidents.some((i) => !i.assigned)
                }
                onClick={() => engine.current?.toggleCleanup()}
              >
                {game.rescue.busy
                  ? "Helicopter en route"
                  : game.rescue.cooldown
                    ? `Helicopter · ${game.rescue.cooldown}s`
                    : game.cleanupMode
                      ? "Cancel cleanup"
                      : "Clean up"}
              </button>
            )}
            {game.level >= 3 && (
              <button
                type="button"
                disabled={game.paused}
                aria-label={
                  game.bridge.requestedOpen ? "Lower bridge" : "Raise bridge"
                }
                onClick={() => engine.current?.toggleBridge()}
              >
                {game.bridge.phase === "clearing"
                  ? "Clearing bridge…"
                  : game.bridge.requestedOpen
                    ? "Close bridge"
                    : "Open bridge"}
              </button>
            )}
            <button
              type="button"
              onClick={() => engine.current?.togglePause()}
              aria-label={game.paused ? "Resume traffic" : "Pause traffic"}
            >
              {game.paused ? "Resume" : "Pause"}
            </button>
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
