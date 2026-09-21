# Milwaukee Traffic — standalone game

This standalone game was extracted from portfolio commit `268f3a1` on **2026-09-21** and now evolves independently. It has its own mobile game palette, touch controls and staged progression; homepage changes cannot remove features from this project.

Open **[Milwaukee Traffic.html](Milwaukee%20Traffic.html)** in a browser for the complete game. It bundles the application, styles, React and Three.js into one file and needs no server or network connection. The editable entry point is `src/main.jsx`.

**[Play the full game on Sites](https://milwaukee-traffic-gunnar.gunnarneuman60.chatgpt.site)** from a phone or desktop browser. The Site is private to the owner; sign in with the same ChatGPT account if prompted. Tap or drag the city to start, then tap its traffic lights. The portfolio homepage remains the separate, simpler single-intersection version.

The independent Sites checkout is `/Users/gkn/Documents/MilwaukeeTraffic-Sites`. Its `.openai/hosting.json` records the existing Site identity for future updates. The published entry is a copy of this project's portable HTML with a traffic-light favicon, description and optional browser-agent controls; gameplay remains unchanged. Rebuild this project when gameplay changes, refresh that checkout, and republish the existing Site.

## Game features

- Twenty successful exits per level, multiple intersections, the stadium and parking, river crossings and freeway.
- Ambulances with a 20-second deadline, boats and drawbridge controls.
- Persistent crashes, tow trucks, helicopter recovery and refueling.
- Level 2: one movable, fixed 10-second timer as soon as the second intersection opens.
- Level 3: a paused bridge tutorial explaining how to let boats and cars through.
- Level 8: a 3×2 neighborhood and one placeable roundabout.
- Level 9: select one street; tap any of its lights to switch the strip together.
- Level 11: the third row, stadium parking and freeway traffic.
- Each new tool/expansion has a paused how-to dialog.
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

`GAMEPLAY.md` documents the current rules and implementation. The original homepage browser harnesses are archived under `reference/website-verification`; they are historical fixtures for the old website shell. The active browser checks are `scripts/verify-standalone.mjs`, `scripts/verify-pinch.mjs` and `scripts/verify-progression.mjs`.

## Preservation and local verification

The original extraction remains available in Git history. The revised progression passes 69 model/physics tests. The browser flow covers all five tutorials, timer relocation, six-unit expansion, roundabout placement while paused, street linking, the delayed stadium, crash-blocked ambulance countdowns, and reset. Pinch checks cover native browser touch events, bounds, cancellation, light taps and screen rotation. These are emulated mobile-browser checks, not physical iPhone/Safari testing.

Verification on **2026-09-21** covers the local browser prototype. The Sites copy also passed a 390 × 844 touch-browser check for activation, light controls, screen fit and runtime errors. Its optional browser-agent controls passed a test-adapter check; native WebMCP was unavailable in the local browser. Sites reported successful private publication on the same date. The hosted URL was not independently browser-tested after publication. Native mobile builds and a Steam release remain future work.
