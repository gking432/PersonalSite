# Little Milwaukee — homepage miniature

The homepage contains a fixed two-unit miniature: the original intersection and boat bridge, connected to a fountain roundabout and a dense second city unit. A curved river and apartment riverwalk enclose the northern edge; Lake Michigan, a lakewalk, sailboats and a small art museum occupy the opposite long southern edge. Its caption is “little milwaukee. interact with the map”. The full level-based game remains separate in [`games/milwaukee-traffic`](../games/milwaukee-traffic/README.md). Homepage changes do not alter or import that project.

People stroll automatically while the visible miniature is idle. Click or drag it to start road and bridge traffic. Each of the original four signal heads controls its own road. Clicking green changes that road through amber to red; clicking red makes it green. The crossing road stays unchanged. Opposing heads on the same road are paired. Both roads can be red or green; there is no automatic alternation. The new roundabout yields automatically and has no lights. Cars travel continuously between the two units, choosing a fresh left, straight or right route at each. Click the bridge itself to open or close it for boats.

There are no levels, progression bars, deadlines, rescue tools, pause or fullscreen controls. Cars choose among four outer approaches with random gaps, keeping their normal driving speed. Most arrivals are 2.5–5.5 seconds apart; occasional pairs enter different original roads 0.18–0.66 seconds apart. The overall pace stays roughly one car every 3–4 seconds, while cross traffic can arrive together and collide if both roads are green. Cars queue at red lights or the raised bridge and honk after waiting. Full queues eject their rear vehicles onto the webpage. Crashes at the manual intersection immediately eject both cars and clear the road.

The first boat arrives 18 seconds after activation; subsequent boats arrive 35–50 seconds apart and queue in two river lanes. A full queue ejects a boat from the river edge. Closing the bridge onto a crossing boat causes it to crash and fall too. The bridge waits for cars already on its deck before opening. Boats have a closed, tapered green hull, keel, deck, cabin and railing. They bank off the map and hand over a deck-visible sprite. Spilled cars and boats bounce on page lettering using the shared ink collision solver. Fallen bodies are bounded to 160 and cannot intercept page clicks.

## Discoveries

The original character/building discoveries still occupy the original city footprint. The fisherman stands in a visible southern spot on the opposite western river bank; four additional people walk independently around the Iron Block, the apartment riverwalk, the lakewalk and the art museum. The truck is parked along the original Water Street café’s curb, the musician and fisherman use the riverwalk, the customer uses the existing café and bench, the walkers follow the pavilion sidewalks, and the dog plays behind the Iron Block. Window clicks light the existing Iron Block. The retained fountain extension uses the same architectural builder, with nine buildings across three corners and one small park.

Each object has an invisible, projected click target and a labelled keyboard button. Pedestrian targets follow the moving people. The regions are clipped between nearby objects so one cannot cover another object's center. Dragging from an object moves the camera without activating it: rotation at the default view, panning when zoomed in, or Shift-drag for rotation at any zoom. Busy animations ignore repeat clicks and return to their starting state.

- Rooftop helicopter: spools up, lifts vertically, hovers, follows its nose through two gently banked circuits, descends onto the pad and spools down; also scatters the rooftop pigeons.
- Pigeons: fly a short loop and settle back onto their roof.
- Riverwalk fisherman: swings his rod back, casts a bobber into the river, waits, reels, and lifts a visible fish. The line remains attached to the moving rod tip and bobber/fish throughout the nine-second performance.
- Pedestrians: six people stroll independently before traffic starts. Clicking a walker briefly makes them stumble, fall forward and recover; their route clock pauses during the reaction. Two seated people stand, take a short walk and return to their benches when clicked.
- Corner café: a customer walks out with a steaming coffee, sits briefly and returns.
- Dog: fetches a thrown ball and brings it back.
- Trumpet player: plays an original synthesized brass phrase lasting about three seconds, with larger camera-facing floating notes and a nearby dancer.
- Brewery truck: opens its rear doors while a worker carries a keg to the building.
- Iron Block windows: toggle warm interior lights.
- Fountain: briefly increases the height of its water jets.

The trumpet only plays after directly activating its musician. It never autoplays or loops, and stops on reset, unmount, a hidden tab, an offscreen miniature, or a narrow viewport. Reset returns vehicles, discoveries, windows, zoom, camera position, the secret scene and falls to idle. Offscreen city activity pauses while vehicles already on the webpage finish falling. Below 701px the homepage miniature remains hidden; fresh mobile visits do not load Three.js. The standalone game has its own mobile shell.

## Waterfront, zoom and hidden sequence

The river follows a continuous quarter-circle around the existing city, with walks on both banks and six apartment façades on the far bank. Two fixed elevated road bridges clear the riverboats. Continuous mesh decks and railings replace stepped pieces, with longer ramps and zero slope at their ends. Vehicle height and pitch follow the same smooth profile. The original bridge remains manually operated. Boats now follow the river bend and enter from its two ends. The lake is a translucent procedural wash with transparent outer edges and a screen-edge fade during zoom. The outer city footprint also feathers into transparency, and all four canvas edges have a soft mask so panning never creates a hard cutoff next to the page text. Its shoreline runs along the long edge opposite the apartment row. A small white winged museum, three sailing boats, benches, trees and two clickable walkers occupy the lakefront. The southern street ends curve into a two-way boulevard through the former central green strip. Cars follow continuous lanes between the original intersection and fountain roundabout, including queuing across both bends and junction handoffs. New cars enter only at the four remaining outer road edges. Two rows of trees border the boulevard, and the lakeside promenade stays continuous outside it.

Use the small + / − controls, keyboard + / −, a two-finger pinch, or a trackpad pinch to zoom from 1× to 3.2×. Once the toy is active, scrolling over it also zooms; ordinary scrolling resumes at the zoom limits. Drag rotates at 1× and pans when zoomed in. Shift-drag always rotates. Arrow keys follow the same rule; two-finger gestures can pan and pinch together. Pinching and dragging do not trigger the objects underneath. Zoom buttons alone do not start traffic.

The secret sequence is **bank clock → payphone → manhole cover**, with the payphone across Water Street and the manhole farther away across Wisconsin Avenue. Each next clue must be clicked within 20 seconds. The ordinary object labels do not reveal the sequence. Completing it starts a short cartoon scene: a car pulls up beside the bank, three masked figures run inside, then split up. One jumps back into the car and accelerates away before police arrive; two run to the distant manhole and disappear underground. Three police cars rush in from the north, the east through the roundabout, and the lakefront connection. A news van joins them. They remain at the scene for 15 seconds, then depart. Their curbside animation is independent of the traffic lights. Repeat attempts during a running scene are ignored; the scene can be replayed after everyone leaves. Reset clears partial and active sequences.

## Live time and weather (September 22, 2026)

The homepage uses Milwaukee time (`America/Chicago`), including daylight-saving changes, and a season-aware sun position calculated from NOAA’s [solar equations](https://gml.noaa.gov/grad/solcalc/solareqns.PDF). Morning and evening light warms the miniature; night brings cool illumination, lit windows, streetlamps and headlights. The manual Iron Block window interaction remains independent.

Current conditions come directly from the National Weather Service’s [KMKE observation endpoint](https://api.weather.gov/stations/KMKE/observations/latest). The fixed Milwaukee location requires no visitor location permission or API key. Visible desktop scenes check every ten minutes, with an eight-second request timeout and a local cache. Weather reports older than two hours are discarded. A recent cached report can cover a connection failure; otherwise the caption says weather is unavailable and the local daylight cycle continues. The caption links to the station’s observations and its tooltip shows the observation time. These are station reports, which can lag the weather on the ground, rather than second-by-second downtown measurements.

Cloud cover softens the lighting; rain darkens the streets and animates wind-driven drops; snow adds falling flakes and a light dusting to roofs and roads. Wind also changes the sailboats’ motion. Effects are drawn within the existing canvas and text masks. Weather runs before traffic activation, pauses when hidden/offscreen, and is disposed with the miniature. Fresh visits below 701px load neither the weather client nor Three.js.

The Public Market rooftop sign reads **PUBLIC MARKET** in larger red lettering, with outward-facing front/back surfaces so the letters do not overlap.

Local validation on September 22, 2026: 66 model tests, simulated noon/night/rain/snow browser checks, cache/failure/cancellation tests, and a live KMKE observation fetch. The preview received a current Cloudy report with temperature and wind. These checks validate the local preview and implementation, not a production deployment.

## Falling cars and page lettering (September 22, 2026)

The miniature's caption no longer removes cars crossing its full-width layout box. A visible launch approaching a text fade or the canvas edge transfers to page physics, where cars bounce on the rendered letter shapes, settle, and can pile up. Decorative rules and empty space remain open. The introductory headline, copy and links still retire incoming sprites, and crashes hidden behind those areas do not launch page cars.

Local checks use `node scripts/verify-page-car-letters.mjs` to follow an actual crossing crash through its 3D launch and onto page lettering, verify controlled drops through a rule and beside words, and check that a resting car stays aligned while scrolling. The existing page-layout checks cover hidden-crash suppression and hero-copy protection. Screenshots are saved outside the repository under `/tmp/milwaukee-car-letters`.

## Implementation

- `src/features/traffic/trafficSimulation.js`: fixed map, manual road signals, autonomous roundabout admission, queues, transfers and immediate crash ejection.
- `lakeRoad.js`: continuous opposing lanes and shared geometry for the lakefront connection.
- `roundabout.js`: cached paths around the fountain, with continuous entry/exit positions.
- `littleMilwaukee.js`: discovery durations, repeat-click protection and resettable state.
- `discoveryScene.js`: the retained fountain square, actors integrated into the original city and their performances.
- `waterfront.js` / `waterfrontScene.js`: river paths, bridge elevations, long-edge lake fade, museum, sailboats and independent walkers.
- `helicopterFlight.js`: takeoff, tangent-aligned circuits, hover and landing.
- `secretHeist.js` / `heistScene.js`: ordered-clue state machine and timed bank, escape and response scene.
- `cityPeople.js` / `pedestrianMotion.js`: shared pedestrian models, independent walking clocks, stumble/recovery and bench transitions.
- `fishingMotion.js`: cast, waiting, reeling and fish-lift poses.
- `mapFade.js`: feathered map footprint; the canvas mask adds a soft screen boundary while panning.
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
TRAFFIC_TEST_URL=http://127.0.0.1:5201 node scripts/verify-milwaukee-city-life.mjs
npm exec vite -- build
npm exec vite -- build --ssr src/entry-server.jsx --outDir dist/server --emptyOutDir false
node scripts/prerender.mjs
```

36 model/physics tests cover all twelve routes at each intersection, continuous transfers, queued roundabout traffic and fairness, discovery timing/reset and original-footprint locations, randomized arrival timing and natural both-green crashes, independent manual lights, car/boat crashes and overflow, bridge passage and webpage collisions, plus continuous river routes, bridge clearance, long-edge water fade, helicopter heading and landing, independent walkers and the timed secret sequence. Lakefront checks cover continuous transfers in both directions and a full queue backing around the bend before draining on green. The existing 15-check browser flow verifies traffic controls and spill handoffs, including rendered lamp heads after rotation and resize, reset, and mobile import exclusion. The discovery browser flow activates all twenty objects at their projected positions, verifies return to rest, repeat-click protection, drag suppression, keyboard access, resize/rotation, and Web Audio start/end/cleanup. The waterfront browser flow additionally verifies button/keyboard/trackpad zoom, real two-touch pinch input without accidental clicks, all heist milestones and departure, unchanged manual signals, walking positions, musical-note visibility and absence of browser errors. The city-life flow verifies idle walking, moving hit targets, stumble recovery, bench return, 3.2× zoom and drag panning, Shift-drag rotation, all fishing phases, driver boarding and early getaway, two sewer escapes, distinct police approaches, and the 15-second investigation. Model tests also verify pedestrian clock isolation, fishing order and bridge slope limits. Screenshots are written outside the repository under `/tmp/little-milwaukee`, `/tmp/traffic-homepage` `/tmp/milwaukee-waterfront`, and `/tmp/milwaukee-city-life`.

These are local browser, simulation and production-build checks, not deployment or app-store claims. The standalone game was not modified or revalidated by this homepage update.

## Homepage lighting and sky — September 22, 2026

The portfolio homepage now uses Milwaukee's existing solar clock for 19 street
lamps, individually lit interiors and entrance sconces on all 22 buildings, and
five bounded, unshadowed lights on landmark façades. Small feathered light pools
provide most of the exterior illumination without a separate GPU light per lamp.
Window materials belong to each building; clicking actual building geometry
switches only that building. Keyboard switches expose the same state. Manual
choices persist through changes in daylight until Reset restores automatic
lighting. The Iron Block window discovery and pedestrian refuge share this state.

A canvas behind the 3D renderer draws daylight, sunrise/sunset colors and a cloudy
or starry night wash. Its transparent outer edge follows the projected city as it
rotates, pans and zooms. It uses the exact homepage text mask used by the renderer,
so the cream halos protect the headline and surrounding copy. Stars dim with cloud
cover; the sky animates before traffic starts. These additions are enabled only
inside the portfolio hero, with no change to the separately hosted mobile Site.

Local verification on September 22, 2026: `verify-milwaukee-lighting.mjs` checks all
22 independent switches, a real apartment-roof click, keyboard activation,
drag suppression, existing window/helicopter discoveries, manual overrides across
clock changes, reset, four solar phases, text masking and transparent canvas
edges. `verify-milwaukee-weather.mjs` covers weather, offline behavior and avoiding
Three.js/weather loading on the mobile homepage. `verify-milwaukee-page-layout.mjs`
covers text halos, rotation/panning, website links and car handoff to page physics.
Screenshots are local verification artifacts in `/tmp/milwaukee-lighting`; they
are not evidence of a production deployment.
