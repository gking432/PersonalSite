// Run against the development server: MARBLE_TEST_URL=http://127.0.0.1:5193 node scripts/verify-marble-game.mjs
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.MARBLE_TEST_URL || "http://127.0.0.1:5193";
const output = process.env.MARBLE_TEST_OUTPUT || "/tmp/portfolio-marble-check";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.MARBLE_BROWSER || "chrome",
  headless: true,
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(() => window.__marbleGame?.snapshot().ready);
  assert.equal(
    await page.evaluate(() => window.__marbleGame.snapshot().started),
    false,
  );
  await page
    .getByRole("button", { name: "Explore the kinetic machine" })
    .click();
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().escapeCount > 0,
  );
  // Catch a real marble emitted by the machine, using the pointer a visitor uses.
  for (let attempt = 0; attempt < 6; attempt++) {
    const target = await page.evaluate(() => {
      const game = window.__marbleGame;
      if (game.snapshot().caught) return "caught";
      const r = document
        .querySelector(".kinetic-machine__model")
        .getBoundingClientRect();
      const ball = game.physics.balls.find(
        (b) => b.y < r.bottom + scrollY - 20 && b.y > r.top + scrollY,
      );
      if (!ball) return null;
      const delta = r.bottom + scrollY - 9 - ball.y;
      const t = (-ball.vy + Math.sqrt(ball.vy ** 2 + 2 * 620 * delta)) / 620;
      return { x: ball.x + ball.vx * t, y: r.bottom - 15 };
    });
    if (target === "caught") break;
    if (target) await page.mouse.move(target.x, target.y);
    await page.waitForTimeout(1100);
  }
  assert.ok(
    await page.evaluate(() => window.__marbleGame.snapshot().caught > 0),
    "Pointer catches a machine marble",
  );
  await page.mouse.move(80, 150);
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().inkContacts > 0,
    { timeout: 15000 },
  );
  await page.locator(".studio-proof").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${output}/text-collisions.png` });
  const proof = await page.evaluate(() => {
    const s = window.__marbleGame.surfaces.find(
      (s) =>
        s.el.classList.contains("studio-proof__value") &&
        s.el.textContent.startsWith("Build"),
    );
    const r = s.el.getBoundingClientRect();
    return { delta: Math.abs(s.x + 16 * s.scale - r.left), scale: s.scale };
  });
  assert.ok(proof.delta < 1);
  await page.locator(".studio-approach").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  const squeezed = await page.evaluate(() => {
    const s = window.__marbleGame.surfaces.find((s) =>
      s.el.matches(".studio-approach h2"),
    );
    const r = s.el.getBoundingClientRect();
    return {
      scale: s.scale,
      delta: Math.abs(s.y + 16 * s.scale - r.top - scrollY),
    };
  });
  assert.ok(
    squeezed.scale < 0.95 && squeezed.delta < 1,
    JSON.stringify(squeezed),
  );
  await page.getByRole("button", { name: "Pause marbles" }).click();
  const pausedTime = await page.evaluate(
    () => window.__marbleGame.physics.time,
  );
  await page.waitForTimeout(700);
  assert.equal(
    await page.evaluate(() => window.__marbleGame.physics.time),
    pausedTime,
  );
  await page.getByRole("button", { name: "Resume marbles" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !window.__marbleGame.snapshot().enabled);
  assert.equal(await page.locator(".kinetic-machine").isVisible(), false);
  assert.equal(await page.locator(".marble-overlay").isVisible(), false);
  const narrowTime = await page.evaluate(
    () => window.__marbleGame.physics.time,
  );
  await page.waitForTimeout(700);
  assert.equal(
    await page.evaluate(() => window.__marbleGame.physics.time),
    narrowTime,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(
    () =>
      window.__marbleGame.snapshot().enabled &&
      window.__marbleGame.snapshot().geometryReady,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.locator('.nav-links a[href="/about"]').click();
  await page.waitForURL("**/about");
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().geometryReady,
  );
  assert.equal(
    await page.evaluate(() => window.__marbleGame.snapshot().started),
    true,
  );
  await page.waitForFunction(
    () => window.__marbleGame.physics.balls.length > 0,
  );
  assert.equal(await page.locator(".marble-overlay").count(), 1);
  await page.locator(".navbar .logo").click();
  await page.waitForURL(base + "/");
  await page.waitForFunction(
    () =>
      !!document.querySelector(".kinetic-machine__model canvas") &&
      window.__marbleGame.snapshot().geometryReady,
  );
  assert.equal(await page.locator(".kinetic-machine__model canvas").count(), 1);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  assert.equal(
    await page.evaluate(() => window.__marbleGame.snapshot().started),
    false,
  );
  assert.equal(
    await page.evaluate(() => window.__marbleGame.physics.balls.length),
    0,
  );
  await page
    .getByRole("button", { name: "Explore the kinetic machine" })
    .focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().geometryReady,
  );
  // Load the bounded pool, then let the real integration/renderer run.
  await page.evaluate(() => {
    const r = document.querySelector(".studio-proof").getBoundingClientRect();
    for (let i = 0; i < 320; i++)
      window.__marbleGame.physics.add({
        x: 850 + (i % 20) * 20,
        y: r.top + scrollY - 10 - Math.floor(i / 20) * 18,
        radius: 6,
      });
    scrollTo(0, r.top + scrollY - 200);
  });
  await page.waitForTimeout(4000);
  const load = await page.evaluate(() => window.__marbleGame.snapshot());
  assert.ok(load.balls <= 320);
  assert.ok(load.frameMs < 40, `Mean game work per frame: ${load.frameMs}ms`);
  await page.screenshot({ path: `${output}/pile-load.png` });
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  const loaded = [];
  mobile.on("request", (r) => loaded.push(r.url()));
  await mobile.goto(base);
  await mobile.waitForTimeout(1200);
  assert.equal(await mobile.locator(".kinetic-machine").isVisible(), false);
  assert.ok(
    !loaded.some(
      (u) =>
        u.includes("pageMarbles") ||
        u.includes("machineScene") ||
        u.includes("three"),
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "idle until clicked",
          "pointer catch",
          "real text collision",
          "squeeze alignment",
          "pause",
          "narrow-screen suspension",
          "resume",
          "client navigation persistence",
          "clear",
          "keyboard start",
          "bounded pool",
          "mobile skips 3D download",
        ],
        load,
        output,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
