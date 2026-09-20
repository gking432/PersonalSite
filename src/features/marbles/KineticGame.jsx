import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./KineticGame.css";

const GameContext = createContext(null);

export function KineticGameProvider({ children }) {
  const { pathname } = useLocation();
  const engine = useRef(null);
  const host = useRef(null);
  const [game, setGame] = useState({
    started: false,
    paused: false,
    caught: 0,
    score: 0,
    ready: false,
    error: "",
  });
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = matchMedia("(min-width: 701px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
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
    import("./pageMarbles")
      .then(({ createPageMarbles }) => {
        if (cancelled) return;
        engine.current = createPageMarbles(setGame);
        engine.current.attach(host.current);
      })
      .catch(() => {
        if (!cancelled)
          setGame((g) => ({ ...g, error: "The workshop could not load." }));
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
    engine.current?.changePage();
  }, [pathname]);
  const attach = (element) => {
    host.current = element;
    engine.current?.attach(element);
  };
  return (
    <GameContext.Provider
      value={{
        game,
        attach,
        start: () => engine.current?.start(),
        key: (e) => engine.current?.key(e),
      }}
    >
      {children}
      {game.started && wide && (
        <div className="marble-controls" aria-label="Marble game controls">
          <button type="button" onClick={() => engine.current?.togglePause()}>
            {game.paused ? "Resume marbles" : "Pause marbles"}
          </button>
          <button type="button" onClick={() => engine.current?.reset()}>
            Clear
          </button>
        </div>
      )}
    </GameContext.Provider>
  );
}

export default function KineticMachine() {
  const { game, attach, start, key } = useContext(GameContext);
  // Stable callback: status updates must not detach/rebuild the WebGL scene.
  const attachRef = useRef(attach);
  attachRef.current = attach;
  const [mountRef] = useState(() => (element) => attachRef.current(element));
  return (
    <div className="kinetic-machine">
      {game.started && (
        <span
          className="kinetic-machine__score"
          role="status"
          aria-label={`Score: ${game.score}`}
        >
          {game.score}
        </span>
      )}
      <button
        type="button"
        className="kinetic-machine__stage"
        aria-label={
          game.started ? "Click to catch" : "Explore the kinetic machine"
        }
        onClick={start}
        onKeyDown={key}
      >
        <span
          ref={mountRef}
          className="kinetic-machine__model"
          aria-hidden="true"
        />
        {!game.ready && (
          <span className="kinetic-machine__fallback">
            A little working system.
          </span>
        )}
      </button>
      <span className="kinetic-machine__caption" role="status">
        {game.error ||
          (game.started ? "Click to catch" : "A little working system.")}
      </span>
    </div>
  );
}
