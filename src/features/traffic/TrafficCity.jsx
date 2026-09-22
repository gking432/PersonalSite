import { useEffect, useRef, useState } from "react";
import "./TrafficCity.css";
import { SIGNALS } from "./signals";
import { DISCOVERIES } from "./littleMilwaukee";
export default function TrafficCity() {
  const host = useRef(null),
    engine = useRef(null),
    buttons = useRef([]),
    discoveryButtons = useRef([]),
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
            {
              signals: buttons.current,
              bridge,
              discoveries: discoveryButtons.current,
            },
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
  const gestures = {
    onPointerDown: (e) => engine.current?.pointerDown(e),
    onPointerMove: (e) => engine.current?.pointerMove(e),
    onPointerUp: () => engine.current?.pointerUp(),
    onPointerCancel: () => engine.current?.pointerUp(),
    onLostPointerCapture: () => engine.current?.pointerUp(),
  };
  return (
    <div className="traffic-city">
      <div className="traffic-city__stage">
        <div
          ref={host}
          className="traffic-city__model"
          role="button"
          tabIndex={0}
          aria-label="Explore Little Milwaukee"
          {...gestures}
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
            data-axis={signal.axis}
            aria-label={`${signal.label} light: ${game.signals[signal.axis]}`}
            disabled={!game.ready}
            {...gestures}
            onClick={() => engine.current?.toggleSignal(signal.axis)}
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
          {...gestures}
          onClick={() => engine.current?.toggleBridge()}
        />
        {DISCOVERIES.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              discoveryButtons.current[index] = node;
            }}
            type="button"
            className="traffic-city__signal traffic-city__discovery"
            data-discovery={item.id}
            aria-label={item.label}
            title={item.label}
            aria-busy={game.discoveries?.busy.includes(item.id) || false}
            aria-pressed={
              item.id === "windows"
                ? game.discoveries?.windows || false
                : undefined
            }
            disabled={!game.ready}
            {...gestures}
            onClick={() => engine.current?.discover(item.id)}
          />
        ))}
      </div>
      <div className="traffic-city__caption">
        little milwaukee. interact with the map
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
