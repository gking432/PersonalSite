# Milwaukee traffic miniature

The homepage now uses this intersection instead of the marble machine. It is a stylized Wisconsin Avenue / Water Street scene: an Iron Block-inspired façade, a compressed cream tower, a glass riverside building, a bridge and a strip of Milwaukee River. Dimensions and building heights are composed for the miniature, not a surveyed reconstruction. Architectural references include the [Library of Congress Iron Block record](https://www.loc.gov/item/wi0030/) and [Chase Tower's location](https://www.chasetowermke.com/).

## Interaction

- The model stays idle until the visitor presses or drags it. Horizontal and vertical dragging change the view. Enter/Space starts it; arrow keys rotate it.
- Click any signal to change that street's pair of lights. Green changes through amber to red; red changes to green. The two streets are independently controlled. Cars already committed to a crossing finish driving through when their light changes.
- Every car that exits earns one point. A collision costs three points; the wrecks clear after 1.7 seconds. Opening conflicting greens can cause a collision. A full approach spills its rear car off the road as another arrives. Traffic continues; Reset clears the roads and all fallen cars.
- Cars arrive increasingly often, from roughly one every 2.5 seconds to one every 0.7 seconds over 75 seconds, with small timing variations. Each arrival randomly chooses straight (46%), left (27%) or right (27%). Curved turns preserve speed and join the proper outgoing lane. Left turns yield to oncoming traffic, and followers keep a gap through outgoing merges. Longer road arms hold roughly eight ordinary cars per approach (fewer buses). Active road traffic is capped at 48.
- Drivers waiting about 4.5–7 seconds display a floating `*honk*`. They repeat at spaced intervals while stopped; this is a visual effect with no audio.
- Overflow cars tip off the model, then continue as spinning images of their actual 3D geometry on a transparent page canvas. They bounce against rendered letters and tangible page elements, passing through decorative lines. The overlay cannot intercept clicks. A pool of 160 bodies recycles offscreen cars first to bound memory during long visits.
- The score is a small grey number in the upper-right corner. The only play hint is “Click the lights.” The ordinary cursor stays in place. Signal controls are transparent native buttons over the projected 3D lamps, so they remain clickable and keyboard accessible after rotation.
- Below 701px, the miniature is hidden and its simulation pauses. A fresh narrow-screen visit never imports Three.js. Offscreen models suspend new traffic; a car already tipping still completes its fall, and fallen cars keep moving down the page. Hidden tabs and explicitly paused games stop both simulations. Leaving the homepage disposes the renderer, page overlay, collision surfaces and observers, and resets the game on return.

## Implementation

`trafficSimulation.js` owns vehicle following, stopping, amber transitions, commitment to a crossing, rotated collision footprints, scoring, honk timing and queue overflow. It has no DOM or renderer dependency. `cityScene.js` builds the city with procedural geometry and canvas lettering; static architectural details are batched into instanced meshes. Car geometry and effect materials are shared. One reusable offscreen render target captures each spilled car for the page handoff; honk labels reuse one texture. Three.js is a separately cached optional chunk. `cityRuntime.js` advances the model in fixed 1/120-second steps, updates the scene and projects light targets. `TrafficCity.jsx` loads that runtime only for wide screens and handles accessible controls and lifecycle cleanup. React receives discrete score and signal changes, not animation frames.

`pageCars.js` loads after activation and reuses the existing ink-distance collision solver and text-surface measurements. Page-body positions follow scrolling and the squeeze-container transforms. The miniature controls are excluded from collision geometry.

The previous marble source remains under `src/features/marbles` as a retained prototype. The app does not mount its provider or load its renderer, and no page-wide marble overlay is created.

## Local verification — 2026-09-20

- `node --test tests/trafficSimulation.test.mjs`: idle/arrival behavior, bounded population, red-light queues and separation, green release and score, amber clearance, crossing collisions with one penalty and wreck cleanup, all twelve turn routes and their continuity, left-turn yielding, outgoing following, delayed/repeating honks, eight-car queues, overflow/reset, and two five-minute seeded simulations with mixed cars and buses under safe signal cycles (14 tests).
- `node --test tests/marblePhysics.test.mjs`: six checks for ink strokes, open letter interiors, transformed surfaces, piles, and the retained prototype’s interaction rules.
- `node scripts/verify-traffic-city.mjs`: browser drag activation and rotation, real red-light queues, clicking projected light controls to release cars, score placement, pause, narrow-screen and offscreen suspension, rendered collisions, honk animations, overflowing extended queues, 3D-to-page handoff, page ink collisions, overflow pause/reset and mobile hiding, keyboard activation, route cleanup/remount, mobile import exclusion and absence of the former marble overlay. A development-only `window.__trafficCity` inspection hook makes the physics assertions possible. Collision, honk and overflow scenarios inject controlled traffic; normal queuing and release checks run against actual arrivals.
- `npm run build`: client bundle, server bundle and static prerendering of the ten public routes. A local production-preview browser check also verified server-rendered homepage copy, desktop activation/light controls, absence of the development inspection hook, no game chunks requested on a fresh mobile visit, and no browser errors.

These are local checks, not claims about a deployed production version. Browser screenshots are written outside the repository under `/tmp/portfolio-traffic-check` by default.
