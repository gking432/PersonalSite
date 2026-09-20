# Kinetic marble game

The homepage sculpture starts on the first primary pointer press, including a press that turns into a rotation drag, or keyboard activation with Enter/Space. Dragging continues to rotate the machine during play. Marbles become catchable only after leaving a track. Click a page marble to catch it, with a forgiving invisible 24px margin around its edge. The site cursor stays unchanged with no following label or ring; “Click to catch” appears only in the caption below the machine. Arrow keys move the aim in both axes while the machine is focused, and Enter/Space catches at that position. A successful catch earns +1. The first contact with text costs −1 once per marble; clicking that marble afterward cleans it up without restoring the point. The score appears as a small plain grey number in the upper-right corner of the machine area. Pause and Clear remain available after activation. Clicking a marble over a link catches it without following the link; other clicks work normally.

Every marble completes its track in 2.6 seconds (previously 5.8 seconds), followed by full-speed page physics. The first marble releases immediately; the next follows after 2.4 seconds whether or not the first is caught. Over 30 seconds of active play, releases gradually increase to the prior maximum of one every 1.05 seconds. Catching, missing and cleaning do not stall or reset the ramp. Each marble randomly takes one of three physical branches with separate exits. Misses cross from the Three.js model into a transparent page overlay and collide with text and project images below it.

The game follows the former globe's 701px minimum width. Below that width it hides and pauses; a fresh mobile visit does not import the renderer. Hidden tabs pause without catching up missed time on return. Game activation, score, catch count and pacing survive client-side navigation, while piles reset to the new page's layout. The floating controls remain available on other pages. Clear resets the score and release ramp to their initial state.

## Rendering and collisions

- `machineScene.js` creates and disposes the procedural Three.js model. Escaping spheres are projected into page coordinates at the end of the chute.
- `machineTracks.js` defines the three paths. The left branch swings outside the flywheel, clearing the rim and rotating spokes with room for the marble and both rails.
- `marbleRound.js` owns scoring, automatic release progression, gradual pacing and random branch selection independently of the renderer.
- `textSurfaces.js` measures actual browser text ranges after fonts load, rasterizes each line, and creates signed distance fields around the rendered ink. Text remains selectable HTML. Decorative rules have no colliders. Project media and visible link buttons get solid collision surfaces.
- `marblePhysics.js` uses fixed 180Hz steps, distance-field contacts, a spatial hash for marble contacts, and sleeping bodies. New impacts and moving surfaces wake resting bodies. The pool is capped at 320, with offscreen bodies recycled first.
- `pageMarbles.js` draws only visible spheres, synchronizes text positions with scrolling and squeeze transforms, rebuilds geometry after reflow/content changes, and stops the renderer when the model is offscreen.

Continuous generation is bounded simulation, not unbounded object allocation. Under an entirely visible full pool, the oldest marble is retired. Window resizing rebuilds collision fields; existing piles may resettle. The machine's ramps are authored motion paths; the page's bouncing, piling, and spilling use collision simulation.

## Verification — 2026-09-20

Local checks, not a claim about a deployed release:

- `node --test tests/marble*.test.mjs`: 13 tests covering ink versus whitespace, holes, transformed surfaces, piles and wake-up, the larger click area and nearest-marble targeting, first-hit penalties, finite/bounded state, automatic overlapping feed even without catches, the maximum pace, cleanup scoring, reset, all three branch choices, continuous track joins, distinct exits and flywheel clearance.
- `npm run build`: client and server builds plus prerendering of all 10 public routes.
- `MARBLE_TEST_URL=http://127.0.0.1:5193 node scripts/verify-marble-game.mjs`: starting on pointer press and rotation drag, continuing to rotate during play, faster 2.6-second track trips, automatic overlapping releases before any catch, all three branch choices, rejected catches on the machine, catches after track exit with the larger invisible click area, unchanged cursor with no following label or ring, a caption-only hint, late cleanup, link click interception, small grey score positioned in the machine upper-right, maximum pace, text impact, squeeze alignment, pause/resume including the pacing clock, narrow-screen suspension, route persistence, keyboard activation/aim/catch, clearing, mobile download exclusion, and a 320-marble load check. Uses the development-only inspection hook, which is omitted from production. Screenshots go to `/tmp/portfolio-marble-check` by default. The maximum-pace and pool checks advance the clock and inject bodies; the track travel and automatic release checks run at actual elapsed time.

The 320-marble load check reports average game work per frame for the local browser; it is not a cross-device frame-rate guarantee.
