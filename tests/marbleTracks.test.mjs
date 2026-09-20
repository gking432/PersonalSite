import test from "node:test";
import assert from "node:assert/strict";
import {
  createMachineTracks,
  FLYWHEEL_CENTER,
  FLYWHEEL_RADIUS,
} from "../src/features/marbles/machineTracks.js";

test("all three marble paths and rails clear the flywheel and its spokes", () => {
  const { routes } = createMachineTracks();
  // Swept sphere envelope covers the marble, twin rails and their cross ties.
  const envelope = 0.23;
  const [cx, cy, cz] = FLYWHEEL_CENTER;
  for (const [route, curves] of routes.entries()) {
    for (const curve of curves) {
      for (let i = 0; i <= 800; i++) {
        const p = curve.getPointAt(i / 800);
        const radialGap = Math.max(
          0,
          Math.hypot(p.x - cx, p.y - cy) - (FLYWHEEL_RADIUS + 0.07),
        );
        const depthGap = Math.max(0, Math.abs(p.z - cz) - 0.105);
        assert.ok(
          Math.hypot(radialGap, depthGap) > envelope,
          `Branch ${route} intersects wheel near ${p.toArray()}`,
        );
      }
    }
  }
});

test("three branches have connected entries and distinct exits", () => {
  const { routes } = createMachineTracks();
  const ends = routes.map((curves) => curves.at(-1).getPoint(1));
  for (const curves of routes) {
    for (let i = 1; i < curves.length; i++) {
      assert.ok(
        curves[i - 1].getPoint(1).distanceTo(curves[i].getPoint(0)) < 0.001,
      );
    }
  }
  for (let i = 0; i < ends.length; i++) {
    for (let j = i + 1; j < ends.length; j++)
      assert.ok(ends[i].distanceTo(ends[j]) > 2);
  }
});
