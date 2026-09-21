# Full-game rules and implementation

The standalone game starts when a player clicks, taps or drags the city. Native buttons projected over the 3D lights and bridge support pointer, touch and keyboard control. It runs on desktop and narrow screens. State stays in the current page session.

## Progression and controls

Each car leaving the road network or entering a destination lot adds one pass; 20 passes advance a level.

| Level | Unlock |
| --- | --- |
| 1 | Original intersection, manual signals, tow recovery |
| 2 | Broadway, ambulances, and a paused tutorial for the single 10-second timer |
| 3 | Boats and a paused tutorial for the clickable lift bridge |
| 4 | Helicopter recovery; 20 seconds to refuel after a flight |
| 5 | Plankinton intersection across the river |
| 6 | Practice managing the three units with the timer |
| 7 | Practice with the timer on the existing three units |
| 8 | Paused neighborhood tutorial; 3×2 map and one roundabout |
| 9 | Paused street-link tutorial; control one selected strip together |
| 10 | Practice with the six-unit neighborhood |
| 11 | Paused stadium tutorial; 3×3 map, ballpark, parking and freeway |

Tap **Timer**, then a light, then **Set 10-second timer**. Directions alternate every 10 seconds with amber and crossing clearance. Only one timer can be active. Assigning another moves it; a direct light tap returns a crossing to manual. The simple timer replaces the earlier configurable timers, dependency links and queue sensors.

At level 9, tap **Link street** and choose an east–west row or north–south column. One street is linked at a time, indicated by a blue line. Tapping any light at a member crossing changes the whole strip's desired direction. Every crossing waits for amber and occupied traffic to clear before opening the conflicting direction. Roundabouts are excluded. A street tap takes over any timer in that strip; a timer elsewhere continues. Changing the selected street releases the previous group's held phases back to manual control.

Select the roundabout icon and an empty crossing to convert it. Its approaches must be clear enough to construct the island safely. Only one conversion is available per round; cars circulate on curved paths and yield at entry, including longer clearance for buses.

Any stopped, uncrashed ambulance starts a 20-second deadline, including behind a wreck, in its queue, or between intersections. The red HUD bar shows the most urgent ambulance. A light change alone does not clear its waiting time; the vehicle must move. More than 20 seconds ends the round and freezes traffic and overflow physics. Bridge queues on both banks count, including vehicles that have already cleared an intersection. Closing the bridge does not reset the timer until the ambulance actually moves. Crashed ambulances themselves are excluded. Waiting at a roundabout also counts; the deadline follows the active vehicle wherever it stops. Pause, offscreen suspension, and background tabs freeze the traffic clocks.

A **block** means one small building plot (a 3.65 × 4.7 curb parcel). A **unit** means one larger terrain tile. Level 8 adds a second row while retaining the original three units. Level 11 adds the stadium row to complete the 3×3 grid. Each stage gates its geometry, signals, connections and traffic together; streets cannot hand traffic into hidden units.

The stadium keeps its miniature scale and shares the rear-west unit with all 24 parking spaces. Cars circulate around its perimeter without crossing the field. The public market occupies two building plots, with a small pedestrian plaza behind it; East Market and Lakefront have real T-junctions with no traffic or light controls on their closed arms. The corner shop uses the same building model as the existing corners and shares one plot with three parking spaces. Ordinary buildings fill the surrounding units.

The river continues through the full nine-unit map. Two fixed bridges carry the new streets over it, with bank abutments outside the water and enough clearance for boats. Vehicle height and pitch follow the same elevation profile as the bridge decks, including through intersection handoffs. The original level-three lift bridge retains its gameplay; the new bridges need no controls. Boats entering the expanded city travel from the map edges.

The freeway branches from East Market into a separate slip road along the eastern edge. It leaves the surface lanes at ground level, rises away from them, and crosses Lakefront at full height. Columns stand outside the crossing. Its deck and vehicles use the same sampled 3D route; inbound traffic queues on the ramp until the street has room. Destination routing follows legal turns through connected intersections, including routes that must loop around a unit to avoid a U-turn.

Levels 2, 3, 8, 9 and 11 each introduce exactly the new tool or expansion in a short how-to modal. Traffic, emergency clocks, and page overflow physics freeze until the visitor continues. Each dialog traps keyboard focus, appears once per round, and returns after a reset. The introduction also works in the standalone touch layout.

The stadium repeats arrivals (50 seconds), game time (35 seconds), and departures (45 seconds). The 24-space stadium lot fills with actual arrivals and empties during the exit rush. The corner shop has three spaces and shorter individual visits. Lot departures merge back into normal lanes and route toward the freeway. Full lots hold incoming traffic; backed-up lanes hold departing cars in the lot.

## Implementation and verification

- `trafficSimulation.js`: routes, connected intersections, queues, collision/rescue integration, emergency failure, and roundabout admission.
- `signalPrograms.js`: one timer, fixed ten-second timing, grouped requests, and safe phase changes.
- `progression.js`: unlock levels and tutorial content.
- `stadiumDistrict.js`: destination parking, event clock, ramp movements, and returning traffic.
- `districtLayout.js`: contained grid footprint and shared elevated ramp geometry.
- `roundabout.js`: cached arc-length paths for all turn directions.
- `cityScene.js`, `cityAdditions.js`, `stadiumScene.js`, `riverScene.js`: bounded vehicle meshes, batched architecture, projected controls, and scene disposal.
- `TrafficCity.jsx`, `SignalProgrammer.jsx`, `StreetLinker.jsx`, `DistrictIntro.jsx`: touch-friendly game HUD, timer and street selection, staged tutorials, fullscreen, and restart.

The **2026-09-21** progression update passes 69 model/physics checks and mobile/desktop browser flows for all five tutorials, timer relocation, roundabout placement while paused, street linking, delayed stadium traffic, reset and pinch zoom. Regression checks cover ambulance waits directly behind a wreck, behind its queue, and across a junction boundary; rescue dispatch cannot clear the wait, movement does, and the bridge tutorial freezes an existing countdown. The touch flow verifies the red countdown, pause, game over and restart. The visual direction is now specific to the standalone game. Physical device and native-app testing remain separate.

Historical verification of the original full game on **2026-09-20**, before extraction: 64 simulation/physics tests passed, including bridge waits on both banks, the paused expansion, ramp merging and elevation, continuous route handoffs, legal T-junction turns and tow recovery, stadium parking contained in one unit, field-free parking paths, river bridge clearance, continuous vehicle elevation, the separated freeway incline, expanded boat routes, and sustained mixed roundabout traffic with buses. The production build and both Playwright flows passed: `scripts/verify-traffic-city.mjs` covers the existing game; `scripts/verify-traffic-stadium.mjs` covers deadlines, programming, the district, roundabout placement while paused, rendered cars on fixed bridge decks, and street-level cars below the freeway. The expansion browser script printed PASS for all 19 checks; its browser teardown then stalled and the completed test runner was stopped. The original 24-check browser flow exited normally. These are local verification results, not a claim of production deployment or live-model evaluation.

```sh
node --test tests/traffic*.test.mjs tests/marblePhysics.test.mjs
node scripts/verify-standalone.mjs
npm run build
```

## Future direction

Player-built streets, freeway extensions and traffic-flow improvements are reserved for a later update. The current map is authored and expands at fixed milestones.
