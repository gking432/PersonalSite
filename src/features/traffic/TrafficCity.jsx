import { useEffect, useRef, useState } from "react";
import "./TrafficCity.css";
import { SIGNALS } from "./signals";
export default function TrafficCity() {
  const host = useRef(null),
    engine = useRef(null),
    buttons = useRef([]),
    bridge = useRef(null);
  const [wide, setWide] = useState(false);
  const [game, setGame] = useState({
    ready: false,
    started: false,
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
  return (
    <div className="traffic-city">
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
        {SIGNALS.map((signal, index) => (
          <button
            key={signal.label}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            type="button"
            className="traffic-city__signal"
            data-control="light"
            data-signal={index}
            aria-label={`Switch traffic at ${signal.label}; ${game.signals.water === "green" ? "Water Street" : "Wisconsin Avenue"} is green`}
            disabled={!game.ready}
            onClick={() => engine.current?.toggleSignal()}
          />
        ))}
        <button
          ref={bridge}
          type="button"
          className="traffic-city__signal traffic-city__bridge"
          data-control="bridge"
          aria-label={
            game.bridge.requestedOpen ? "Close the bridge" : "Open the bridge"
          }
          aria-pressed={game.bridge.requestedOpen}
          disabled={!game.ready}
          onClick={() => engine.current?.toggleBridge()}
        />
      </div>
      <div className="traffic-city__caption">
        {game.started ? "Click a light. Raise the bridge." : "Click to start."}
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
