# Little Milwaukee — homepage miniature

The homepage contains a fixed two-unit miniature: the original intersection and boat bridge, connected to a fountain roundabout and a dense second city unit. A curved river and apartment riverwalk enclose the northern edge; Lake Michigan, a lakewalk, sailboats and a small art museum occupy the opposite long southern edge. Its caption is “little milwaukee. interact with the map”. The full level-based game remains separate in [`games/milwaukee-traffic`](../games/milwaukee-traffic/README.md). Homepage changes do not alter or import that project.

Click or drag the miniature to begin. Each of the original four signal heads controls its own road. Clicking green changes that road through amber to red; clicking red makes it green. The crossing road stays unchanged. Opposing heads on the same road are paired. Both roads can be red or green; there is no automatic alternation. The new roundabout yields automatically and has no lights. Cars travel continuously between the two units, choosing a fresh left, straight or right route at each. Click the bridge itself to open or close it for boats.

There are no levels, progression bars, deadlines, rescue tools, pause or fullscreen controls. Cars choose among six outer approaches with random gaps, keeping their normal driving speed. Most arrivals are 2.5–5.5 seconds apart; occasional pairs enter different original roads 0.18–0.66 seconds apart. The overall pace stays roughly one car every 3–4 seconds, while cross traffic can arrive together and collide if both roads are green. Cars queue at red lights or the raised bridge and honk after waiting. Full queues eject their rear vehicles onto the webpage. Crashes at the manual intersection immediately eject both cars and clear the road.

The first boat arrives 18 seconds after activation; subsequent boats arrive 35–50 seconds apart and queue in two river lanes. A full queue ejects a boat from the river edge. Closing the bridge onto a crossing boat causes it to crash and fall too. The bridge waits for cars already on its deck before opening. Boats have a closed, tapered green hull, keel, deck, cabin and railing. They bank off the map and hand over a deck-visible sprite. Spilled cars and boats bounce on page lettering using the shared ink collision solver. Fallen bodies are bounded to 160 and cannot intercept page clicks.

## Discoveries

The original character/building discoveries still occupy the original city footprint. The fisherman now sits on the opposite western river bank; four additional people walk independently around the Iron Block, the apartment riverwalk, the lakewalk and the art museum. The truck is parked along the original Water Street café’s curb, the musician and fisherman use the riverwalk, the customer uses the existing café and bench, the walkers follow the pavilion sidewalks, and the dog plays behind the Iron Block. Window clicks light the existing Iron Block. The retained fountain extension uses the same architectural builder, with nine buildings across three corners and one small park.

Each object has an invisible, projected click target and a labelled keyboard button. The regions are clipped between nearby objects so one cannot cover another object's center. Dragging from an object rotates the miniature without activating that object. Busy animations ignore repeat clicks and return to their starting state.

- Rooftop helicopter: spools up, lifts vertically, hovers, follows its nose through two gently banked circuits, descends onto the pad and spools down; also scatters the rooftop pigeons.
- Pigeons: fly a short loop and settle back onto their roof.
- Riverwalk fisherman: reels in a fish; every third catch is a boot.
- Pedestrians: stroll along the riverwalk and return.
- Corner café: a customer walks out with a steaming coffee, sits briefly and returns.
- Dog: fetches a thrown ball and brings it back.
- Trumpet player: plays an original synthesized brass phrase lasting about three seconds, with larger camera-facing floating notes and a nearby dancer.
- Brewery truck: opens its rear doors while a worker carries a keg to the building.
- Iron Block windows: toggle warm interior lights.
- Fountain: briefly increases the height of its water jets.

The trumpet only plays after directly activating its musician. It never autoplays or loops, and stops on reset, unmount, a hidden tab, an offscreen miniature, or a narrow viewport. Reset returns vehicles, discoveries, windows, zoom, the secret scene and falls to idle. Offscreen city activity pauses while vehicles already on the webpage finish falling. Below 701px the homepage miniature remains hidden; fresh mobile visits do not load Three.js. The standalone game has its own mobile shell.

## Waterfront, zoom and hidden sequence

The river follows a continuous quarter-circle around the existing city, with walks on both banks and six apartment façades on the far bank. Two fixed elevated road bridges clear the riverboats; vehicle height and pitch follow the ramps. The original bridge remains manually operated. Boats now follow the river bend and enter from its two ends. The lake is a translucent procedural wash with transparent outer edges and a screen-edge fade during zoom. Its shoreline runs along the long edge opposite the apartment row. A small white winged museum, three sailing boats, benches, trees and two clickable walkers occupy the lakefront.

Use the small + / − controls, keyboard + / −, a two-finger pinch, or a trackpad pinch to zoom from 1× to 1.65×. Once the toy is active, scrolling over it also zooms; ordinary scrolling resumes at the zoom limits. Drag still rotates the city. Pinching and dragging do not trigger the objects underneath. Zoom buttons alone do not start traffic.

The secret sequence is **bank clock → payphone → manhole cover**, all in the original bank block. Each next clue must be clicked within 20 seconds. The ordinary object labels do not reveal the sequence. Completing it starts a short cartoon scene: a car pulls up beside the bank, three masked figures run inside, then escape through the manhole. Three police cars and a news van arrive, remain at the scene for 15 seconds, then depart. Their curbside animation is independent of the traffic lights. Repeat attempts during a running scene are ignored; the scene can be replayed after everyone leaves. Reset clears partial and active sequences.

## Implementation

- `src/features/traffic/trafficSimulation.js`: fixed map, manual road signals, autonomous roundabout admission, queues, transfers and immediate crash ejection.
- `roundabout.js`: cached paths around the fountain, with continuous entry/exit positions.
- `littleMilwaukee.js`: discovery durations, repeat-click protection and resettable state.
- `discoveryScene.js`: the retained fountain square, actors integrated into the original city and their performances.
- `waterfront.js` / `waterfrontScene.js`: river paths, bridge elevations, long-edge lake fade, museum, sailboats and independent walkers.
- `helicopterFlight.js`: takeoff, tangent-aligned circuits, hover and landing.
- `secretHeist.js` / `heistScene.js`: ordered-clue state machine and timed bank, escape and response scene.
- `cityPeople.js`: shared procedural pedestrian models.
- `trumpet.js`: lazily created Web Audio synthesis and sound cleanup; no external recording or audio library.
- `cityChallenges.js`: bridge movement, boat arrivals, overflow and bridge collisions.
- `cityScene.js` / `cityAdditions.js`: original architecture, projected controls and tumbling vehicle meshes.
- `cityRuntime.js`: fixed-step simulation, optional page physics, pointer gestures and lifecycle cleanup.
- `TrafficCity.jsx`: controls, accessible labels, keyboard activation and caption; React updates only when control state changes.

## Local verification — 2026-09-21

```sh
npm run test:traffic
TRAFFIC_TEST_URL=http://127.0.0.1:5201 node scripts/verify-traffic-homepage.mjs
TRAFFIC_TEST_URL=http://127.0.0.1:5201 node scripts/verify-little-milwaukee.mjs
TRAFFIC_TEST_URL=http://127.0.0.1:5201 node scripts/verify-milwaukee-waterfront.mjs
npm exec vite -- build
npm exec vite -- build --ssr src/entry-server.jsx --outDir dist/server --emptyOutDir false
node scripts/prerender.mjs
```

30 model/physics tests cover all twelve routes at each intersection, continuous transfers, queued roundabout traffic and fairness, discovery timing/reset and original-footprint locations, randomized arrival timing and natural both-green crashes, independent manual lights, car/boat crashes and overflow, bridge passage and webpage collisions, plus continuous river routes, bridge clearance, long-edge water fade, helicopter heading and landing, independent walkers and the timed secret sequence. The existing 15-check browser flow verifies traffic controls and spill handoffs, including rendered lamp heads after rotation and resize, reset, and mobile import exclusion. The discovery browser flow activates all seventeen objects at their projected positions, verifies return to rest, repeat-click protection, drag suppression, keyboard access, resize/rotation, and Web Audio start/end/cleanup. The waterfront browser flow additionally verifies button/keyboard/trackpad zoom, real two-touch pinch input without accidental clicks, all heist milestones and departure, unchanged manual signals, walking positions, musical-note visibility and absence of browser errors. Screenshots are written outside the repository under `/tmp/little-milwaukee`, `/tmp/traffic-homepage` and `/tmp/milwaukee-waterfront`.

These are local browser, simulation and production-build checks, not deployment or app-store claims. The standalone game was not modified or revalidated by this homepage update.
