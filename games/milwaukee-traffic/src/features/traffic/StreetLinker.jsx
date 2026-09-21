export default function StreetLinker({ game, onSelect, onClose }) {
  return (
    <section
      className="traffic-city__programmer traffic-city__street-picker"
      aria-label="Link a street"
    >
      <div className="traffic-city__panel-heading">
        <strong>Link one street</strong>
        <button
          type="button"
          aria-label="Close street picker"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p>
        Pick a strip. Tap any of its lights to switch all its crossings
        together.
      </p>
      <div className="traffic-city__street-options">
        {game.streets.map((street) => (
          <button
            type="button"
            key={street.key}
            aria-pressed={game.linkedStreet?.key === street.key}
            onClick={() => onSelect(street.key)}
          >
            <span aria-hidden="true">
              {street.axis === "water" ? "↕" : "↔"}
            </span>
            <span>
              {street.name}
              <small>{street.junctions.length} crossings</small>
            </span>
          </button>
        ))}
      </div>
      {game.linkedStreet && (
        <button
          type="button"
          className="traffic-city__unlink"
          onClick={() => onSelect(null)}
        >
          Unlink {game.linkedStreet.name}
        </button>
      )}
    </section>
  );
}
