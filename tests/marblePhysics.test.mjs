import test from "node:test";
import assert from "node:assert/strict";
import {
  MarblePhysics,
  inkDistanceField,
  sampleField,
} from "../src/features/marbles/marblePhysics.js";

function surface(paint, { scale = 1, x = 0, y = 0 } = {}) {
  const width = 240,
    height = 120,
    alpha = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) if (paint(x, y)) alpha[y * width + x] = 255;
  return { field: inkDistanceField(alpha, width, height), scale, x, y };
}
function run(world, surfaces, seconds = 3) {
  for (let t = 0; t < seconds * 180; t++)
    world.step(1 / 180, surfaces, { width: 500, height: 1000 });
}
test("ink is solid, while whitespace between glyph strokes stays open", () => {
  const ink = surface((x, y) => y >= 65 && y < 75 && (x < 80 || x > 105));
  const world = new MarblePhysics();
  const onInk = world.add({ x: 50, y: 15, radius: 5 });
  const inGap = world.add({ x: 94, y: 15, radius: 5 });
  run(world, [ink], 1.5);
  assert.ok(onInk.y < 66 && onInk.y > 53, `on ink: ${onInk.y}`);
  assert.ok(inGap.y > 250, `gap: ${inGap.y}`);
  assert.ok(world.stats.inkContacts > 0);
});
test("letter cutouts have empty interiors and solid rims", () => {
  const ring = surface((x, y) => {
    const d = Math.hypot(x - 80, y - 60);
    return d > 24 && d < 30;
  });
  assert.ok(sampleField(ring.field, 80, 60) > 20);
  assert.ok(sampleField(ring.field, 80, 32) < 0);
});
test("scaled and translated ink remains a collision surface", () => {
  const ink = surface((x, y) => y >= 65 && y < 75, {
    scale: 0.88,
    x: 30,
    y: 100,
  });
  const world = new MarblePhysics(),
    ball = world.add({ x: 100, y: 80, radius: 5 });
  run(world, [ink]);
  assert.ok(Math.abs(ball.y - (100 + 65 * 0.88 - 5)) < 2, `y: ${ball.y}`);
});
test("marbles form a pile and incoming impacts wake resting marbles", () => {
  const floor = surface((x, y) => y >= 100);
  const world = new MarblePhysics();
  const bottom = world.add({ x: 100, y: 94, radius: 6 });
  run(world, [floor], 2);
  assert.ok(bottom.sleep > 0.8);
  const top = world.add({ x: 100, y: 20, radius: 6 });
  run(world, [floor], 3);
  assert.ok(top.y < bottom.y - 9, `${top.y} / ${bottom.y}`);
  assert.ok(world.stats.ballContacts > 0);
  assert.ok(Number.isFinite(bottom.y + top.y));
});
test("catching consumes a marble and the long-session pool stays bounded", () => {
  const world = new MarblePhysics({ maxBalls: 12 });
  let caught = 0;
  world.add({ x: 100, y: 48, vy: 30, radius: 6 });
  world.step(1 / 180, [], {
    width: 300,
    height: 900,
    catcher: { x: 100, y: 54, width: 60 },
    onCatch: () => caught++,
  });
  assert.equal(caught, 1);
  assert.equal(world.balls.length, 0);
  for (let i = 0; i < 500; i++) world.add({ x: 100, y: i * 15 });
  assert.equal(world.balls.length, 12);
  run(world, [], 3);
  assert.ok(world.balls.every((b) => Number.isFinite(b.x + b.y)));
});
