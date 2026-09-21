import { useEffect, useRef } from "react";
export default function DistrictIntro({ tutorial, onContinue }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      previous?.focus?.({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="traffic-city__intro"
      aria-labelledby="traffic-unlock-title"
      aria-describedby="traffic-unlock-description"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="traffic-city__intro-top">
        <span className="traffic-city__intro-kicker">
          Level {tutorial.level} · New unlock
        </span>
        <span className="traffic-city__map-chip">{tutorial.map}</span>
      </div>
      <div className="traffic-city__unlock-icon" aria-hidden="true">
        {tutorial.badge}
      </div>
      <h3 id="traffic-unlock-title">{tutorial.title}</h3>
      <p id="traffic-unlock-description">{tutorial.description}</p>
      <ol>
        {tutorial.steps.map(([title, text]) => (
          <li key={title}>
            <strong>{title}</strong>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      <button type="button" autoFocus onClick={onContinue}>
        {tutorial.action}
      </button>
      <small>Take your time. Traffic is paused.</small>
    </dialog>
  );
}
