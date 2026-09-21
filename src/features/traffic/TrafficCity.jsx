import { useEffect, useRef, useState } from "react";
import { SIGNALS } from "./signals";
import "./TrafficCity.css";

export default function TrafficCity() {
  const host = useRef(null),
    buttons = useRef([]),
    engine = useRef(null);
  const [wide, setWide] = useState(false);
  const [game, setGame] = useState({
    ready: false,
    started: false,
    paused: false,
    score: 0,
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
          buttons.current,
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
    <div className="traffic-city">
      {game.started && (
        <span
          className="traffic-city__score"
          role="status"
          aria-label={`Traffic score: ${game.score}`}
        >
          {game.score}
        </span>
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
            aria-label={`${signal.label} light: ${game.signals[signal.axis]}`}
            disabled={!game.started}
            tabIndex={game.started ? 0 : -1}
            onClick={() => engine.current?.toggleSignal(signal.axis)}
          />
        ))}
      </div>
      <div className="traffic-city__caption">
        <span role="status">
          {game.error ||
            (game.paused
              ? "Paused."
              : game.started
                ? "Click the lights."
                : "A little Milwaukee.")}
        </span>
        {game.started && (
          <div className="traffic-city__controls">
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
