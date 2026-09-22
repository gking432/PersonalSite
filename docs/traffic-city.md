# Homepage traffic miniature

The homepage now contains one endless intersection and its boat bridge. The full level-based game is preserved separately in [`games/milwaukee-traffic`](../games/milwaukee-traffic/README.md), with its own source, tests, package and portable HTML file. The homepage does not import that project.

Click or drag the miniature to begin. Each of the four clickable signal heads controls its own road. Clicking green changes that road through amber to red; clicking red makes it green. The crossing road stays unchanged. Opposing heads on the same road are paired. Both roads can be red or green, and there is no automatic alternation. Cars already in the intersection continue, so a badly timed switch can cause a crash. Click the bridge itself to open or close it for boats. There are no levels, progression bars, emergency deadlines, rescue tools or map expansions on the website.

Cars continue arriving every 3.5 seconds, keeping their normal driving speed. They turn left/right or continue straight, queue at red lights or the raised bridge, and honk after waiting. Full queues eject their rear vehicles onto the webpage. Crashes immediately eject both cars and clear the road.

The first boat arrives 18 seconds after activation; subsequent boats arrive 35–50 seconds apart and queue in two river lanes. A full queue ejects a boat from the river edge. Closing the bridge onto a crossing boat causes it to crash and fall too. The bridge waits for cars already on its deck before opening. Boats have a closed, tapered green hull, keel, deck, cabin and railing. They bank off the map and hand over a deck-visible sprite, so page tumbling keeps them recognizable. Spilled cars and boats then bounce on page lettering using the shared ink collision solver. Fallen bodies are bounded to 160 and cannot intercept page clicks.

There are no pause or fullscreen controls. Reset clears all vehicles, boats and falls and returns to idle. Background tabs and narrow screens suspend it; offscreen city traffic pauses while vehicles already on the webpage finish falling. Below 701px the homepage miniature remains hidden and fresh mobile visits do not load Three.js. The standalone full game has its own mobile-capable shell.

## Implementation

- `src/features/traffic/trafficSimulation.js`: single-intersection traffic, queues, turning and immediate crash ejection.
- `cityChallenges.js`: bridge movement, boat arrivals, queue overflow and bridge collisions.
- `cityScene.js` and `cityAdditions.js`: the original city model, projected light/bridge controls and tumbling car/boat meshes.
- `cityRuntime.js`: fixed-step simulation, optional page physics and lifecycle cleanup.
- `TrafficCity.jsx`: four clickable heads for two independent road signals, the bridge, reset and keyboard activation.

## Local verification — 2026-09-21

```sh
npm run test:traffic
node scripts/verify-traffic-homepage.mjs
npm run build
npm run game:test
npm run game:build
npm --prefix games/milwaukee-traffic run verify
```

The homepage has 17 model/physics checks and a 15-check browser flow covering activation, the single light, car/boat crashes and overflow, actual page handoffs, bridge passage, absence of progression, reset, independent road controls and rendered-head clicks after rotation and resize, absence of pause/fullscreen, and mobile import exclusion. The standalone project retains all 64 full-game model/physics tests and separately checks desktop progression, the expanded city, programming, touch controls and the offline HTML. These are local checks, not deployment or store-release claims.
