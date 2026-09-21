# Milwaukee traffic miniature

A desktop homepage easter egg: a stylized Wisconsin Avenue / Water Street miniature grows into a second intersection at Broadway. Cream brick, an Iron Block-inspired façade, the river, and a working bascule bridge give it local character. Dimensions and architecture are composed for the game, not a surveyed reconstruction. Architectural references include the [Library of Congress Iron Block record](https://www.loc.gov/item/wi0030/) and [Chase Tower's location](https://www.chasetowermke.com/).

## Playing and progression

- Press or drag the model to start. Horizontal and vertical dragging rotate the city. Enter/Space starts it; arrow keys rotate it.
- Click a signal to change that intersection's pair of lights. Green goes through amber to red; red goes to green. Each street and intersection is independently controlled. Cars already crossing continue through a signal change.
- A slim progress bar replaces the numeric score. Each vehicle that successfully leaves the city adds exactly 5%. After 20 vehicles, the bar resets and the level advances. A car travelling between intersections counts only when it leaves the entire city. Wrecks, overflow and helicopter pickups never add progress.
- Level 1 has one intersection. At level 2, the second block rises into place and the camera gently widens. The two intersections share a real connecting road: a downstream queue can back up into the first block. Ambulances begin appearing, with flashing red/blue beacons and slightly faster free-flow driving; they still obey lights and queues.
- Level 3 introduces boats. Click the bridge itself or **Open bridge** to raise it. Road gates close first, cars already on the span clear, and then the bridge opens. Boats wait until it is open. If **Close bridge** is selected while a boat is underneath, closing waits for clearance. Waiting boats occasionally display `*toot*`.
- Further levels keep the same two-block city and bridge, with denser traffic. Arrivals come in waves, with short breathing periods and a changing emphasis between approaches. Arrival frequency has a fixed upper bound; active road vehicles are capped at 80.
- Cars randomly choose straight (46%), left (27%) or right (27%). Working amber turn signals show their intent. Curved routes preserve travel speed, left turns yield to oncoming traffic, and followers keep a gap into outgoing merges. Road approaches hold about eight normal cars, fewer buses.
- Crashes leave persistent wrecks that obstruct traffic. Click **Clean up**, then the highlighted accident. A helicopter flies in, lowers a hook, lifts both wrecks, and carries them away. Its seven-second rescue is followed by a 15-second reload. The controls show when it is busy. Escape cancels accident selection. Pedestrians and tow-truck dispatch remain possible later additions.
- Overfull queues still push their rear cars off the model onto the actual webpage. These cars bounce on rendered letter strokes and tangible page elements, pass through decorative lines, and cannot intercept normal page clicks. A pool of 160 fallen bodies recycles offscreen cars first.
- Waiting drivers display spaced `*honk*` animations. All horn and emergency effects are visual; no audio is played. The normal site cursor remains unchanged.
- Pause freezes both simulations and all challenge timers. Reset returns to the first block, clears wrecks, boats, progress, rescue state and fallen cars. Hidden tabs and narrow screens suspend the game. Offscreen city models suspend new traffic, while already-fallen cars continue moving through the page. Leaving the homepage disposes the game and resets it on return.

## Implementation and adoption choices

`trafficSimulation.js` owns vehicle routes, cross-block transfers, following, stopping, collisions, arrivals and progression. `cityChallenges.js` isolates bridge/boat safety and helicopter availability. Both are independent of the DOM and renderer, allowing fast deterministic scenario checks.

`cityScene.js` builds and animates the original miniature, vehicles, blinkers, lamps and page handoffs. `cityAdditions.js` builds the growing block, moving bridge, boats and rescue helicopter. Static architecture uses instanced meshes; vehicles, boats and effect labels reuse geometry/materials. A single reusable render target photographs spilled cars for their page sprites. Three.js is cached separately from the changing game code.

`cityRuntime.js` advances traffic in fixed 1/120-second steps, controls lifecycle suspension, and projects native buttons onto signals, bridge and accident locations. `TrafficCity.jsx` supplies keyboard-accessible controls, an accessible progress bar, and discrete state updates rather than React animation frames. The bridge has both a model target and a text control for discoverability. Complexity appears as it is unlocked; the initial hint remains “Click the lights.”

`pageCars.js` loads after activation and reuses the existing ink-distance collision solver and text-surface measurements under `src/features/marbles`. Its collision surfaces follow scroll and squeeze-container transforms. The miniature's own controls are excluded. The retained marble prototype's provider and 3D renderer are not mounted.

Below 701px, the miniature is hidden. Fresh mobile visits do not load the game runtime or Three.js. All screenshots and generated check artifacts stay outside the repository.

## Local verification — 2026-09-20

- `node --test tests/trafficSimulation.test.mjs tests/trafficLevels.test.mjs tests/marblePhysics.test.mjs`: 30 checks covering original routes and queues, 20-car milestones, continuous inter-block handoffs and single final-exit credit, ambulance behavior, bridge road clearance, waiting boats, closing while occupied, canceling a partial opening, persistent wrecks and pickup, full reload timing, overflow, transformed ink collisions and piles. Two seeded five-minute mixed-traffic scenarios exercise both intersections, changing lights, congestion and rescue recovery.
- `node scripts/verify-traffic-city.mjs`: browser checks for idle/drag activation, the actual 5% progress fill, real queues and signal switching, second-block growth and all eight projected light targets, the same car moving between blocks, blinking turn signals and ambulance beacons, level-three boats, manually opening/closing the bridge, accident selection, the helicopter's hook/lift/reload, overflow onto page ink, pause, narrow/offscreen suspension, reset, keyboard input, route cleanup and mobile import exclusion. Milestones and incident scenarios seed controlled traffic; initial queuing and passing use real arrivals. A development-only inspection hook exposes assertions without shipping that hook in production.
- `npm run build`: client build, server build and prerendering of ten public routes. Production-preview smoke checks cover server-rendered homepage content, desktop activation/light controls, no development hook, mobile excluding optional game chunks and no browser errors.

These are local checks, not claims about a deployed production version. Browser screenshots default to `/tmp/portfolio-traffic-levels`.
