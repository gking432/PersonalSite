# Homepage traffic city

The desktop homepage miniature starts when a visitor clicks or drags it. Native buttons projected over the 3D lights and bridge support pointer and keyboard control. The city and physics modules load only above the homepage's 700px breakpoint. State stays in the current page session.

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
| 9 | Six connected blocks, stadium, parking, market, freeway ramps, and one placeable roundabout |

Select the sliders icon, then a light, to program that crossing. Apply a timed cycle, follow another crossing, or let a sensor serve the larger incoming queue. Programming includes amber and crossing clearance; direct light clicks outside programming mode restore manual control. Linked rules cannot form cycles. Programs and roundabout placement can be configured while paused.

Select the roundabout icon and an empty crossing to convert it. Its approaches must be clear enough to construct the island safely. Only one conversion is available per round; cars circulate on curved paths and yield at entry, including longer clearance for buses.

An ambulance stopped on a signal approach starts a 10-second deadline. The red HUD bar shows the most urgent ambulance. A light change alone does not clear its waiting time; the vehicle must move. More than 10 seconds ends the round and freezes traffic and overflow physics. Bridge queues, crashed ambulances, and roundabout yielding are excluded from this light deadline. Pause, offscreen suspension, and background tabs freeze the traffic clocks.

The stadium repeats arrivals (50 seconds), game time (35 seconds), and departures (45 seconds). The 24-space stadium lot fills with actual arrivals and empties during the exit rush. The market has six spaces and shorter individual visits. Lot departures merge back into normal lanes and route toward the freeway. Full lots hold incoming traffic; backed-up lanes hold departing cars in the lot.

## Implementation and verification

- `trafficSimulation.js`: routes, connected intersections, queues, collision/rescue integration, emergency failure, and roundabout admission.
- `signalPrograms.js`: unlock validation, dependency checks, timing, sensors, and safe signal changes.
- `stadiumDistrict.js`: destination parking, event clock, ramp movements, and returning traffic.
- `roundabout.js`: cached arc-length paths for all turn directions.
- `cityScene.js`, `cityAdditions.js`, `stadiumScene.js`: bounded vehicle meshes, batched architecture, projected controls, and scene disposal.
- `TrafficCity.jsx`, `SignalProgrammer.jsx`: accessible HUD, programming editor, fullscreen, and restart.

Local verification on **2026-09-20**: 50 simulation/physics tests passed, including sustained mixed roundabout traffic with buses. Both Playwright flows passed: `scripts/verify-traffic-city.mjs` covers the existing game; `scripts/verify-traffic-stadium.mjs` covers deadlines, programming, the district, and roundabout placement while paused. These are local verification results, not a claim of production deployment or live-model evaluation.

```sh
node --test tests/traffic*.test.mjs tests/marblePhysics.test.mjs
node scripts/verify-traffic-city.mjs
node scripts/verify-traffic-stadium.mjs
npm run build
```
