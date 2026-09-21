import { useEffect, useRef, useState } from "react";
import "./TrafficCity.css";
function Icon({ name }) {
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
      <path
        d={
          {
            pause: "M8 5v14M16 5v14",
            play: "m8 5 11 7-11 7z",
            fullscreen: "M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6",
            exit: "M3 9h6V3m6 0v6h6M9 21v-6H3m18 0h-6v6",
          }[name]
        }
      />
    </svg>
  );
}
export default function TrafficCity() {
  const root = useRef(null),
    host = useRef(null),
    engine = useRef(null),
    buttons = useRef([]),
    bridge = useRef(null);
  const [wide, setWide] = useState(false),
    [fullscreen, setFullscreen] = useState(false);
  const [game, setGame] = useState({
    ready: false,
    started: false,
    paused: false,
    signals: { water: "green", wisconsin: "red" },
    bridge: { requestedOpen: false },
  });
  useEffect(() => {
    const query = matchMedia("(min-width: 701px)"),
      change = () => setWide(query.matches);
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
        if (!cancelled)
          engine.current = createCityRuntime(
            host.current,
            { signals: buttons.current, bridge },
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
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement)
        setFullscreen(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", escape);
    };
  }, [fullscreen]);
  async function toggleFullscreen() {
    if (fullscreen) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setFullscreen(false);
    } else {
      try {
        await root.current.requestFullscreen?.();
      } catch {
        /* CSS view is the fallback. */
      }
      setFullscreen(true);
    }
  }
  return (
    <div className="traffic-city" ref={root} data-fullscreen={fullscreen}>
      <div className="traffic-city__toolbar">
        {game.started && (
          <button
            type="button"
            className="traffic-city__tool"
            aria-label={game.paused ? "Resume traffic" : "Pause traffic"}
            onClick={() => engine.current?.togglePause()}
          >
            <Icon name={game.paused ? "play" : "pause"} />
          </button>
        )}
        <button
          type="button"
          className="traffic-city__tool"
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
        >
          <Icon name={fullscreen ? "exit" : "fullscreen"} />
        </button>
      </div>
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
            <span className="traffic-city__fallback">
              {game.error || "A little Milwaukee."}
            </span>
          )}
        </div>
        <button
          ref={(node) => {
            buttons.current[0] = node;
          }}
          type="button"
          className="traffic-city__signal"
          data-control="light"
          aria-label={`Switch traffic light; ${game.signals.water === "green" ? "Water Street" : "Wisconsin Avenue"} is green`}
          disabled={!game.ready || game.paused}
          onClick={() => engine.current?.toggleSignal()}
        />
        <button
          ref={bridge}
          type="button"
          className="traffic-city__signal traffic-city__bridge"
          data-control="bridge"
          aria-label={
            game.bridge.requestedOpen ? "Close the bridge" : "Open the bridge"
          }
          aria-pressed={game.bridge.requestedOpen}
          disabled={!game.ready || game.paused}
          onClick={() => engine.current?.toggleBridge()}
        />
      </div>
      <div className="traffic-city__caption">
        {game.paused
          ? "Paused."
          : game.started
            ? "Click the light. Raise the bridge."
            : "Click to start."}
        {game.started && (
          <div className="traffic-city__controls">
            <button
              type="button"
              aria-label="Reset traffic"
              onClick={() => engine.current?.reset()}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
