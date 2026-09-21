# Full-game rules and implementation

The standalone game starts when a player clicks, taps or drags the city. Native buttons projected over the 3D lights and bridge support pointer, touch and keyboard control. It runs on desktop and narrow screens. State stays in the current page session.

## Progression and controls

Each car leaving the road network or entering a destination lot adds one pass; 20 passes advance a level.

| Level | Unlock |
| --- | --- |
| 1 | Original intersection, manual signals, tow recovery |
| 2 | Broadway intersection and ambulances |
| 3 | Boats and the clickable lift bridge |
| 4 | Helicopter recovery; 20 seconds to refuel after a flight |
| 5 | Plankinton intersection across the river |
| 6 | Timed signal cycles |
| 7 | Linked crossings, opposite phases, and timer offsets |
| 8 | Queue sensors and ambulance priority |
| 9 | Paused expansion introduction, a nine-unit grid, stadium, market, raised freeway ramp, and one placeable roundabout |

Select the sliders icon, then a light, to program that crossing. Apply a timed cycle, follow another crossing, or let a sensor serve the larger incoming queue. Programming includes amber and crossing clearance; direct light clicks outside programming mode restore manual control. Linked rules cannot form cycles. Programs and roundabout placement can be configured while paused.

Select the roundabout icon and an empty crossing to convert it. Its approaches must be clear enough to construct the island safely. Only one conversion is available per round; cars circulate on curved paths and yield at entry, including longer clearance for buses.

An ambulance stopped on a signal approach or in a bridge queue starts a 20-second deadline. The red HUD bar shows the most urgent ambulance. A light change alone does not clear its waiting time; the vehicle must move. More than 20 seconds ends the round and freezes traffic and overflow physics. Bridge queues on both banks count, including vehicles that have already cleared an intersection. Closing the bridge does not reset the timer until the ambulance actually moves. Crashed ambulances and ordinary roundabout yielding are excluded. Pause, offscreen suspension, and background tabs freeze the traffic clocks.

A **block** means one small building plot (a 3.65 × 4.7 curb parcel). A **unit** means one larger terrain tile. The level-nine expansion preserves the original three units along the front and fits the whole neighborhood inside a 3×3 grid of units.

The stadium keeps its miniature scale and shares the rear-west unit with all 24 parking spaces. Cars circulate around its perimeter without crossing the field. The public market occupies two building plots, with a small pedestrian plaza behind it; East Market and Lakefront have real T-junctions with no traffic or light controls on their closed arms. The corner shop uses the same building model as the existing corners and shares one plot with three parking spaces. Ordinary buildings fill the surrounding units.

The river continues through the full nine-unit map. Two fixed bridges carry the new streets over it, with bank abutments outside the water and enough clearance for boats. Vehicle height and pitch follow the same elevation profile as the bridge decks, including through intersection handoffs. The original level-three lift bridge retains its gameplay; the new bridges need no controls. Boats entering the expanded city travel from the map edges.

The freeway branches from East Market into a separate slip road along the eastern edge. It leaves the surface lanes at ground level, rises away from them, and crosses Lakefront at full height. Columns stand outside the crossing. Its deck and vehicles use the same sampled 3D route; inbound traffic queues on the ramp until the street has room. Destination routing follows legal turns through connected intersections, including routes that must loop around a unit to avoid a U-turn.

Before any expansion geometry, traffic, or tools activate, a modal explains the event traffic, signal programs, one roundabout, and emergency deadline. Traffic, emergency clocks, and page overflow physics freeze until the visitor continues. The dialog traps keyboard focus, appears once per round, and returns after a reset. The introduction also works in the standalone touch layout.

The stadium repeats arrivals (50 seconds), game time (35 seconds), and departures (45 seconds). The 24-space stadium lot fills with actual arrivals and empties during the exit rush. The corner shop has three spaces and shorter individual visits. Lot departures merge back into normal lanes and route toward the freeway. Full lots hold incoming traffic; backed-up lanes hold departing cars in the lot.

## Implementation and original verification

- `trafficSimulation.js`: routes, connected intersections, queues, collision/rescue integration, emergency failure, and roundabout admission.
- `signalPrograms.js`: unlock validation, dependency checks, timing, sensors, and safe signal changes.
- `stadiumDistrict.js`: destination parking, event clock, ramp movements, and returning traffic.
- `districtLayout.js`: contained grid footprint and shared elevated ramp geometry.
- `roundabout.js`: cached arc-length paths for all turn directions.
- `cityScene.js`, `cityAdditions.js`, `stadiumScene.js`, `riverScene.js`: bounded vehicle meshes, batched architecture, projected controls, and scene disposal.
- `TrafficCity.jsx`, `SignalProgrammer.jsx`, `DistrictIntro.jsx`: accessible HUD, programming editor, expansion introduction, fullscreen, and restart.

Verification of the original full game on **2026-09-20**, before extraction: 64 simulation/physics tests passed, including bridge waits on both banks, the paused expansion, ramp merging and elevation, continuous route handoffs, legal T-junction turns and tow recovery, stadium parking contained in one unit, field-free parking paths, river bridge clearance, continuous vehicle elevation, the separated freeway incline, expanded boat routes, and sustained mixed roundabout traffic with buses. The production build and both Playwright flows passed: `scripts/verify-traffic-city.mjs` covers the existing game; `scripts/verify-traffic-stadium.mjs` covers deadlines, programming, the district, roundabout placement while paused, rendered cars on fixed bridge decks, and street-level cars below the freeway. The expansion browser script printed PASS for all 19 checks; its browser teardown then stalled and the completed test runner was stopped. The original 24-check browser flow exited normally. These are local verification results, not a claim of production deployment or live-model evaluation.

```sh
node --test tests/traffic*.test.mjs tests/marblePhysics.test.mjs
node scripts/verify-standalone.mjs
npm run build
```
