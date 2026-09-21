# Milwaukee Traffic — standalone game

This is the full game preserved from portfolio commit `268f3a1` on **2026-09-21**, before the homepage was simplified. The simulation and level rules are independent copies: future homepage changes cannot remove features from this project.

Open **[Milwaukee Traffic.html](Milwaukee%20Traffic.html)** in a browser for the complete game. It bundles the application, styles, React and Three.js into one file and needs no server or network connection. The editable entry point is `src/main.jsx`.

**[Play the full game on Sites](https://milwaukee-traffic-gunnar.gunnarneuman60.chatgpt.site)** from a phone or desktop browser. The Site is private to the owner; sign in with the same ChatGPT account if prompted. Tap or drag the city to start, then tap its traffic lights. The portfolio homepage remains the separate, simpler single-intersection version.

The independent Sites checkout is `/Users/gkn/Documents/MilwaukeeTraffic-Sites`. Its `.openai/hosting.json` records the existing Site identity for future updates. The published entry is a copy of this project's portable HTML with a traffic-light favicon, description and optional browser-agent controls; gameplay remains unchanged. Rebuild this project when gameplay changes, refresh that checkout, and republish the existing Site.

## Preserved features

- Twenty successful exits per level, multiple intersections, the stadium and parking, river crossings and freeway.
- Ambulances with a 20-second deadline, boats and drawbridge controls.
- Persistent crashes, tow trucks, helicopter recovery and refueling.
- Timed/linked/sensor-controlled lights and a placeable roundabout.
- Fullscreen, pause, restart, honks, and vehicles tumbling off the map.

The standalone shell supports desktop and touch screens. Portrait framing keeps the city in view. Drag with one finger to rotate; pinch with two fingers to zoom from 0.65× to 4×. Pinching over a light does not switch it, and lifting one finger resumes rotation smoothly. Zoom works while paused, survives screen rotation, and returns to the original framing when the game resets. This is the browser prototype for the future mobile and Steam game; native app builds, Steam integration and store releases are future work.

## Development

```sh
cd games/milwaukee-traffic
npm ci
npm run dev       # http://127.0.0.1:5194
npm test          # preserved simulation and physics tests
npm run build     # rebuild the portable HTML and dist/ preview
npm run verify    # desktop, touch and offline-file browser checks; dev server must be running
```

From the repository root, `npm run game:dev`, `npm run game:build`, and `npm run game:test` target this project. Only this directory and its npm dependencies are needed; it does not import the portfolio source.

`GAMEPLAY.md` documents the full rules and original implementation. The original homepage browser harnesses are archived under `reference/website-verification`; they are historical fixtures for the old website shell. The active standalone browser checks are in `scripts/verify-standalone.mjs`.

## Preservation and local verification

The copied `src/features/traffic/trafficSimulation.js` retains SHA-256 `b02e09a41df7c9bfbd1e0cd1f424cb6e46ee69d59c0e5f8ddc7f096d29f336d0`. Changes cover the standalone shell, portrait camera fitting and pinch/drag input; all 64 preserved model/physics tests pass. `scripts/verify-pinch.mjs` checks real browser touch events, zoom bounds, cancellation, control taps, pause, screen rotation and reset. These are emulated mobile-browser checks, not physical iPhone/Safari testing.

Verification on **2026-09-21** covers the local browser prototype. The Sites copy also passed a 390 × 844 touch-browser check for activation, light controls, screen fit and runtime errors. Its optional browser-agent controls passed a test-adapter check; native WebMCP was unavailable in the local browser. Sites reported successful private publication on the same date. The hosted URL was not independently browser-tested after publication. Native mobile builds and a Steam release remain future work.
