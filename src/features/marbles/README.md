# Kinetic marble game

The homepage sculpture is idle until clicked or activated with Enter/Space. Move the pointer, or use the arrow keys while the machine is focused, to position its catcher. Catches return through the machine's elevator. Misses cross from the Three.js model into a transparent page overlay and collide with text and project images below it. Pause and Clear appear after activation.

The game follows the former globe's 701px minimum width. Below that width it hides and pauses; a fresh mobile visit does not import the renderer. Hidden tabs pause without catching up missed time on return. Game activation and the catch count survive client-side navigation, while piles reset to the new page's layout. The floating controls remain available on other pages.

## Rendering and collisions

- `machineScene.js` creates and disposes the procedural Three.js model. Escaping spheres are projected into page coordinates at the end of the chute.
- `textSurfaces.js` measures actual browser text ranges after fonts load, rasterizes each line, and creates signed distance fields around the rendered ink. Text remains selectable HTML. Decorative rules have no colliders. Project media and visible link buttons get solid collision surfaces.
- `marblePhysics.js` uses fixed 180Hz steps, distance-field contacts, a spatial hash for marble contacts, and sleeping bodies. New impacts and moving surfaces wake resting bodies. The pool is capped at 320, with offscreen bodies recycled first.
- `pageMarbles.js` draws only visible spheres, synchronizes text positions with scrolling and squeeze transforms, rebuilds geometry after reflow/content changes, and stops the renderer when the model is offscreen.

Continuous generation is bounded simulation, not unbounded object allocation. Under an entirely visible full pool, the oldest marble is retired. Window resizing rebuilds collision fields; existing piles may resettle. The machine's ramps are authored motion paths; the page's bouncing, piling, and spilling use collision simulation.

## Verification — 2026-09-20

Local checks, not a claim about a deployed release:

- `node --test tests/marblePhysics.test.mjs`: ink versus whitespace, holes, transformed surfaces, piles and wake-up, catching, finite/bounded state.
- `npm run build`: client and server builds plus prerendering of all 10 public routes.
- `MARBLE_TEST_URL=http://127.0.0.1:5193 node scripts/verify-marble-game.mjs`: real pointer catch, text impact, squeeze alignment, pause/resume, narrow-screen suspension, route persistence, keyboard activation, clearing, mobile download exclusion, and a 320-marble load check. Uses the development-only inspection hook, which is omitted from production. Screenshots go to `/tmp/portfolio-marble-check` by default.

The initial 320-marble local browser check measured approximately 3.3ms of game work per frame; this is not a cross-device frame-rate guarantee.
