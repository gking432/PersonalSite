import { useEffect, useRef } from "react";

export default function DistrictIntro({ onContinue }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="traffic-city__intro"
      aria-labelledby="traffic-district-title"
      aria-describedby="traffic-district-description"
      onCancel={(event) => event.preventDefault()}
    >
      <span className="traffic-city__intro-kicker">
        Level 9 · City expansion
      </span>
      <h3 id="traffic-district-title">A bigger little Milwaukee.</h3>
      <p id="traffic-district-description">
        Nine blocks. A ballpark, a corner market, and a new freeway ramp.
        Traffic is paused while you get your bearings.
      </p>
      <ul>
        <li>
          <strong>Handle the rush.</strong> Cars arrive from the ramp, park for
          the game, then leave together. The market has its own visitors. Watch
          the first-pitch countdown.
        </li>
        <li>
          <strong>Program your lights.</strong> Click the sliders icon, then a
          light. Use a timer, link it to another light (together or opposite),
          or let a queue sensor choose. Turn on ambulance priority to interrupt
          the cycle.
        </li>
        <li>
          <strong>Place one roundabout.</strong> Click the circular-arrow icon,
          then a clear intersection. Cars yield automatically. You get one per
          game.
        </li>
        <li>
          <strong>Keep emergencies moving.</strong> An ambulance can wait up to
          20 seconds. Bridge queues count too—click the bridge itself to close
          it after boats pass.
        </li>
      </ul>
      <button type="button" autoFocus onClick={onContinue}>
        Let’s grow the city
      </button>
    </dialog>
  );
}
