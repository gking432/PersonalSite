# Kinetic marble game

The homepage sculpture is idle until clicked or activated with Enter/Space. Click a marble on the machine or anywhere on the page to catch it. A small “Click to catch” reticle follows the pointer; arrow keys move it in both axes while the machine is focused, and Enter/Space catches at that position. A successful catch earns +1. The first contact with text costs −1 once per marble; clicking that marble afterward cleans it up without restoring the point. Score, successful catches, Pause and Clear appear after activation. Clicking a marble over a link catches it without following the link; other clicks work normally.

The first marble travels at 60% speed and no others appear until it is caught. Cleaning up a missed opening marble, or letting it leave the page, gives another single-marble attempt. The first successful catch releases the second marble immediately, then the third follows after 4.8 seconds, overlapping the second trip. Over 90 seconds of active play, travel speed and release frequency gradually reach the prior maximum: full speed and one release every 1.05 seconds. Each marble randomly takes one of three physical branches with separate exits. Misses cross from the Three.js model into a transparent page overlay and collide with text and project images below it.

The game follows the former globe's 701px minimum width. Below that width it hides and pauses; a fresh mobile visit does not import the renderer. Hidden tabs pause without catching up missed time on return. Game activation, score, catch count and pacing survive client-side navigation, while piles reset to the new page's layout. The floating controls remain available on other pages. Clear resets the round to its single-marble opening.

## Rendering and collisions

- `machineScene.js` creates and disposes the procedural Three.js model. Escaping spheres are projected into page coordinates at the end of the chute.
- `marbleRound.js` owns scoring, the opening catch gate, gradual pacing and random branch selection independently of the renderer.
- `textSurfaces.js` measures actual browser text ranges after fonts load, rasterizes each line, and creates signed distance fields around the rendered ink. Text remains selectable HTML. Decorative rules have no colliders. Project media and visible link buttons get solid collision surfaces.
- `marblePhysics.js` uses fixed 180Hz steps, distance-field contacts, a spatial hash for marble contacts, and sleeping bodies. New impacts and moving surfaces wake resting bodies. The pool is capped at 320, with offscreen bodies recycled first.
- `pageMarbles.js` draws only visible spheres, synchronizes text positions with scrolling and squeeze transforms, rebuilds geometry after reflow/content changes, and stops the renderer when the model is offscreen.

Continuous generation is bounded simulation, not unbounded object allocation. Under an entirely visible full pool, the oldest marble is retired. Window resizing rebuilds collision fields; existing piles may resettle. The machine's ramps are authored motion paths; the page's bouncing, piling, and spilling use collision simulation.

## Verification — 2026-09-20

Local checks, not a claim about a deployed release:

- `node --test tests/marble*.test.mjs`: 11 tests covering ink versus whitespace, holes, transformed surfaces, piles and wake-up, click targeting, first-hit penalties, finite/bounded state, the opening gate, overlapping feed, the maximum pace, cleanup scoring, reset and all three branch choices.
- `npm run build`: client and server builds plus prerendering of all 10 public routes.
- `MARBLE_TEST_URL=http://127.0.0.1:5193 node scripts/verify-marble-game.mjs`: one slow opening marble, an immediate second release after catching, overlapping feed, all three branch choices, real clicks on track/page marbles, late cleanup, link click interception, score/catch display, maximum pace, text impact, squeeze alignment, pause/resume including the pacing clock, narrow-screen suspension, route persistence, keyboard activation/aim/catch, clearing, mobile download exclusion, and a 320-marble load check. Uses the development-only inspection hook, which is omitted from production. Screenshots go to `/tmp/portfolio-marble-check` by default. The maximum-pace and pool checks advance the clock and inject bodies; the opening and overlap checks run at actual elapsed time.

The updated 320-marble local browser check measured approximately 4.4ms of game work per frame; this is not a cross-device frame-rate guarantee.
