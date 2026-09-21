import { JUNCTION_NAMES } from "./cityChallenges";
export default function SignalProgrammer({ junction, game, onApply, onClose }) {
  const active = game.programs.findIndex((r) => r.mode === "timer");
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
      <div className="traffic-city__timer-preview">
        <b>
          10<span>s</span>
        </b>
        <span>
          Automatic changeover
          <br />
          One active timer
        </span>
      </div>
      <p>
        {active === junction
          ? "This crossing is running automatically. Tap its light to take control."
          : active >= 0
            ? `Your timer is on ${JUNCTION_NAMES[active]}. Move it here to alternate these lights every 10 seconds.`
            : "Let this crossing alternate directions every 10 seconds. Amber and crossing clearance happen automatically."}
      </p>
      <button
        className="traffic-city__apply"
        type="button"
        onClick={() =>
          onApply(junction, { mode: active === junction ? "manual" : "timer" })
        }
      >
        {active === junction
          ? "Remove timer"
          : active >= 0
            ? "Move timer here"
            : "Set 10-second timer"}
      </button>
      {game.toolMessage && <span role="status">{game.toolMessage}</span>}
    </section>
  );
}
