# Somewhere in the Midwest — 3D world

Updated September 6, 2026. The homepage now renders a real Three.js environment,
with perspective, geometric buildings, open doorways, furnished interiors,
lighting, shadows, and camera travel. The earlier illustrated homepage is retained
in `src/variants/Somewhere.jsx`; its content panels are reused by the new world.

## Visitor workflow

- Click a glowing ground circle or a nearby-destination button to walk there.
- Drag with a mouse or touch to look around; arrow keys and turn buttons also work.
- The map follows connected paths to distant destinations. It does not teleport
  through scenery. Movement is waypoint-based, not unrestricted WASD walking.
- Walk from the cornfield road through the stone arch and around the fountain.
- Enter the workshop to inspect app screens and open the working demos.
- Enter the library to read the case studies, or visit the garden to meet Gunnar.
- Enter the chapel's quiet room to open contact information.
- Portfolio and contact links remain available without exploring the world.

The environment is a stylized, procedurally modeled first playable version. It is
not a photographic panorama, scanned environment, or finished photorealistic game.
No Blender installation or external model download is required.

## Implementation and accessibility

`worldNavigation.js` owns the connected route graph. `worldScene.js` builds the
world and handles raycasting, camera interpolation, and resource disposal. React
owns the accessible navigation, location announcements, map, and native dialogs.
Three.js is loaded asynchronously on the client; existing routes still prerender.
Vegetation and paving use instancing, pixel density is capped, and the renderer
pauses behind content dialogs and when the tab is hidden. System reduced motion
removes travel animation, camera bob, and ambient movement. A separate toggle is
also available. WebGL failure presents portfolio links and a reload action.

## Local verification — September 6, 2026

- Production build and prerender of all 10 existing public routes passed.
- `node scripts/check-world-navigation.mjs` checks all 121 pairs of locations,
  return paths, fountain clearance, and passage through door openings.
- Local Chrome browser checks covered animated entry, multi-stop travel to the
  workshop, library and chapel, content links, Escape, turn and arrow controls,
  390px mobile layout, and reduced motion without runtime errors.
- A real touchscreen tap on the projected ground marker moved to the arch.
- A browser launched with WebGL disabled displayed the fallback correctly.

These are local browser and geometry checks, not live-model evaluations or proof
of performance on all phones. Existing case studies retain their own dated
capability and evaluation evidence. No AI backend or evaluation result changed.

## Earlier illustrated version

The following art remains in the repository for reference. It is not used as the
new 3D environment background.

## Artwork provenance

Created September 6, 2026 with the built-in image-generation tool. Original PNGs
were converted to WebP with Sharp at quality 88. The two committed environment
assets together are approximately 813 KiB. No new runtime dependency was added.

### `public/images/somewhere-arrival.webp`

Use case: stylized-concept. Asset type: original landscape 16:9 adventure game environment artwork, no interface. Primary request: A breathtaking heavenly Midwest landscape as a polished painterly 3D adventure game environment. An ivory Roman stone arch stands in right-center. A gravel path through golden-green prairie wildflowers and corn leads towards a distant Italian piazza and Catholic campanile. An ordinary rural mailbox stands near the arch. Enormous pale blue sky and fluffy cumulus clouds. Late summer golden hour, welcoming, whimsical, sacred and tranquil. Rich greens, cream stone, antique gold. Wide cinematic composition with clear sky in upper left for future title overlay, horizon around center. Beautiful premium art-directed environment, detailed tactile materials and lush foliage, sophisticated cinematic painterly 3D, not generic cartoon. Constraints: landscape 16:9, no text, no UI, no watermark, no people.

### `public/images/somewhere-courtyard.webp`

Use case: stylized-concept. Asset type: original landscape 16:9 adventure game environment artwork, no interface. Primary request: A breathtaking heavenly Midwest courtyard as a polished painterly 3D adventure game environment. Slightly elevated wide view of a small explorable Roman piazza surrounded by Midwest fields. Ivory travertine buildings and terracotta roofs. Chapel bell tower at center rear with tasteful cross. Round fountain at center foreground. Library arched building at left. Workshop at right. Cloister garden at left foreground. Tiny rural post office at right foreground. Grain silo with gilded dome in distant right. Abundant green climbing plants and flowers. One lawn chair and a subtle basketball hoop. Glorious pale blue sky with fluffy cumulus and warm late-summer afternoon golden light. Welcoming, whimsical, sacred, tranquil. Rich greens, cream stone, antique gold. Architectural features clearly separated to support clickable UI labels later; entire courtyard visible. Beautiful premium art-directed cinematic environment, detailed tactile materials and lush foliage, sophisticated cinematic painterly 3D, not generic cartoon. Constraints: landscape 16:9, no text, no UI, no watermark, no people.
