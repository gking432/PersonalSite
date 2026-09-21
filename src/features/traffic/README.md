# Milwaukee traffic miniature

The homepage now uses this intersection instead of the marble machine. It is a stylized Wisconsin Avenue / Water Street scene: an Iron Block-inspired façade, a compressed cream tower, a glass riverside building, a bridge and a strip of Milwaukee River. Dimensions and building heights are composed for the miniature, not a surveyed reconstruction. Architectural references include the [Library of Congress Iron Block record](https://www.loc.gov/item/wi0030/) and [Chase Tower's location](https://www.chasetowermke.com/).

## Interaction

- The model stays idle until the visitor presses or drags it. Horizontal and vertical dragging change the view. Enter/Space starts it; arrow keys rotate it.
- Click any signal to change that street's pair of lights. Green changes through amber to red; red changes to green. The two streets are independently controlled. Cars already committed to a crossing finish driving through when their light changes.
- Every car that exits earns one point. A collision costs three points; the wrecks clear after 1.7 seconds. Opening conflicting greens can cause a collision. A backed-up approach that remains full for 12 seconds ends the round in gridlock; Reset starts fresh.
- Cars arrive increasingly often, from roughly one every 2.5 seconds to one every 0.7 seconds over 75 seconds, with small timing variations. Vehicle count is capped at 32. Drivers keep their lane and leave space behind the car ahead.
- The score is a small grey number in the upper-right corner. The only play hint is “Click the lights.” The ordinary cursor stays in place. Signal controls are transparent native buttons over the projected 3D lamps, so they remain clickable and keyboard accessible after rotation.
- Below 701px, the miniature is hidden and its simulation pauses. A fresh narrow-screen visit never imports Three.js. Offscreen models, hidden tabs and explicitly paused games also stop their clock. Leaving the homepage disposes the renderer and resets the game on return.

## Implementation

`trafficSimulation.js` owns vehicle following, stopping, amber transitions, commitment to a crossing, collisions, scoring and gridlock. It has no DOM or renderer dependency. `cityScene.js` builds the city with procedural geometry and canvas lettering; static architectural details are batched into instanced meshes. Car geometry and effect materials are shared. `cityRuntime.js` advances the model in fixed 1/120-second steps, updates the scene and projects light targets. `TrafficCity.jsx` loads that runtime only for wide screens and handles accessible controls and lifecycle cleanup. React receives discrete score and signal changes, not animation frames.

The previous marble source remains under `src/features/marbles` as a retained prototype. The app does not mount its provider or load its renderer, and no page-wide marble overlay is created.

## Local verification — 2026-09-20

- `node --test tests/trafficSimulation.test.mjs`: idle/arrival behavior, bounded population, red-light queues and separation, green release and score, amber clearance, crossing collisions with one penalty and wreck cleanup, opposing lanes, gridlock and reset.
- `node scripts/verify-traffic-city.mjs`: browser drag activation and rotation, real red-light queues, clicking projected light controls to release cars, score placement, pause, narrow-screen and offscreen suspension, rendered collisions, gridlock/reset, keyboard activation, route cleanup/remount, mobile import exclusion and absence of the former marble overlay. A development-only `window.__trafficCity` inspection hook makes the physics assertions possible. Collision and gridlock end-state scenarios inject controlled traffic; normal queuing and release checks run against actual arrivals.
- `npm run build`: client bundle, server bundle and static prerendering of the ten public routes.

These are local checks, not claims about a deployed production version. Browser screenshots are written outside the repository under `/tmp/portfolio-traffic-check` by default.
