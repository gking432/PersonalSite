import { useState } from "react";
import { JUNCTION_LEVEL, JUNCTION_NAMES } from "./cityChallenges";
export default function SignalProgrammer({ junction, game, onApply, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...game.programs[junction] }));
  const change = (key, value) =>
    setDraft((r) => ({
      ...r,
      [key]: value,
      ...(key === "mode" && value === "linked" && r.source === junction
        ? {
            source: JUNCTION_NAMES.findIndex(
              (_, j) =>
                j !== junction &&
                game.level >= JUNCTION_LEVEL[j] &&
                game.roundabout !== j,
            ),
          }
        : {}),
    }));
  return (
    <section
      className="traffic-city__programmer"
      aria-label={`Program ${JUNCTION_NAMES[junction]}`}
    >
      <div className="traffic-city__panel-heading">
        <strong>{JUNCTION_NAMES[junction]}</strong>
        <button
          type="button"
          aria-label="Close light program"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <label>
        Control
        <select
          aria-label="Signal control"
          value={draft.mode}
          onChange={(e) => change("mode", e.target.value)}
        >
          <option value="manual">Manual</option>
          <option value="timer">Timed cycle</option>
          <option value="linked" disabled={game.level < 7}>
            Linked lights{game.level < 7 ? " · level 7" : ""}
          </option>
          <option value="sensor" disabled={game.level < 8}>
            Queue sensor{game.level < 8 ? " · level 8" : ""}
          </option>
        </select>
      </label>
      {["timer", "sensor"].includes(draft.mode) && (
        <label>
          {draft.mode === "timer" ? "Seconds per green" : "Minimum green"}
          <select
            aria-label="Green duration"
            value={draft.seconds}
            onChange={(e) => change("seconds", Number(e.target.value))}
          >
            {[4, 6, 8, 10, 12, 16].map((n) => (
              <option key={n} value={n}>
                {n} seconds
              </option>
            ))}
          </select>
        </label>
      )}
      {draft.mode === "linked" && (
        <>
          <label>
            Follow
            <select
              aria-label="Linked source"
              value={draft.source}
              onChange={(e) => change("source", Number(e.target.value))}
            >
              <option value={-1}>Choose a light</option>
              {JUNCTION_NAMES.map(
                (name, j) =>
                  j !== junction &&
                  game.level >= JUNCTION_LEVEL[j] &&
                  game.roundabout !== j && (
                    <option key={j} value={j}>
                      {name}
                    </option>
                  ),
              )}
            </select>
          </label>
          <label>
            Pattern
            <select
              aria-label="Link pattern"
              value={draft.inverted ? "opposite" : "together"}
              onChange={(e) =>
                change("inverted", e.target.value === "opposite")
              }
            >
              <option value="together">Same direction together</option>
              <option value="opposite">Opposite direction</option>
            </select>
          </label>
          <label>
            Green-wave delay
            <select
              aria-label="Link delay"
              value={draft.offset}
              onChange={(e) => change("offset", Number(e.target.value))}
            >
              {[0, 2, 4, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} seconds
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <label className="traffic-city__check">
        <input
          type="checkbox"
          checked={draft.emergency}
          disabled={game.level < 8}
          onChange={(e) => change("emergency", e.target.checked)}
        />
        Ambulance priority{game.level < 8 ? " · level 8" : ""}
      </label>
      <p>
        {draft.mode === "sensor"
          ? "Serves the longer queue after each minimum green."
          : draft.mode === "linked"
            ? "Follows the selected crossing. Delay offsets a timed source."
            : "A direct light click returns this crossing to manual."}
      </p>
      <button
        className="traffic-city__apply"
        type="button"
        onClick={() => onApply(junction, draft)}
      >
        Apply program
      </button>
      {game.toolMessage && <span role="status">{game.toolMessage}</span>}
    </section>
  );
}
