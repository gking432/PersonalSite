# Homepage traffic miniature

The homepage now contains one endless intersection and its boat bridge. The full level-based game is preserved separately in [`games/milwaukee-traffic`](../games/milwaukee-traffic/README.md), with its own source, tests, package and portable HTML file. The homepage does not import that project.

Click or drag the miniature to begin. One traffic-light control switches the intersection between Water Street and Wisconsin Avenue; the departing green changes through amber. Cars already in the intersection continue, so a badly timed switch can cause a crash. Click the bridge itself to open or close it for boats. There are no levels, progression bars, emergency deadlines, rescue tools or map expansions on the website.

Cars continue arriving every 1.2 seconds. They turn left/right or continue straight, queue at red lights or the raised bridge, and honk after waiting. Full queues eject their rear vehicles onto the webpage. Crashes immediately eject both cars and clear the road.

Boats arrive throughout play and queue in two river lanes. A full queue ejects a boat from the river edge. Closing the bridge onto a crossing boat causes it to crash and fall too. The bridge waits for cars already on its deck before opening. Spilled cars and boats retain their 3D appearance, then bounce on page lettering using the shared ink collision solver. Fallen bodies are bounded to 160 and cannot intercept page clicks.

Pause freezes the miniature and page physics. Reset clears all vehicles, boats and falls and returns to idle. Background tabs and narrow screens suspend it; offscreen city traffic pauses while vehicles already on the webpage finish falling. Below 701px the homepage miniature remains hidden and fresh mobile visits do not load Three.js. The standalone full game has its own mobile-capable shell.

## Implementation

- `src/features/traffic/trafficSimulation.js`: single-intersection traffic, queues, turning and immediate crash ejection.
- `cityChallenges.js`: bridge movement, boat arrivals, queue overflow and bridge collisions.
- `cityScene.js` and `cityAdditions.js`: the original city model, projected light/bridge controls and tumbling car/boat meshes.
- `cityRuntime.js`: fixed-step simulation, optional page physics and lifecycle cleanup.
- `TrafficCity.jsx`: one light control, the bridge, pause/fullscreen/reset and keyboard activation.

## Local verification — 2026-09-21

```sh
npm run test:traffic
node scripts/verify-traffic-homepage.mjs
npm run build
npm run game:test
npm run game:build
npm --prefix games/milwaukee-traffic run verify
```

The homepage has 15 model/physics checks and a 14-check browser flow covering activation, the single light, car/boat crashes and overflow, actual page handoffs, bridge passage, absence of progression, reset, pause/fullscreen and mobile import exclusion. The standalone project retains all 64 full-game model/physics tests and separately checks desktop progression, the expanded city, programming, touch controls and the offline HTML. These are local checks, not deployment or store-release claims.
