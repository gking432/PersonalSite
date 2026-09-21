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
  page.setDefaultTimeout(20000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(() => window.__marbleGame?.snapshot().ready);
  assert.equal(
    await page.evaluate(() => window.__marbleGame.snapshot().started),
    false,
  );
  // A press that becomes a rotation drag starts the game immediately.
  const stage = await page.locator(".kinetic-machine__stage").boundingBox();
  const rotationBefore = await page.evaluate(
    () => window.__marbleGame.snapshot().rotation,
  );
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.down();
  await page.waitForFunction(() => window.__marbleGame.snapshot().started);
  await page.mouse.move(
    stage.x + stage.width / 2 + 44,
    stage.y + stage.height / 2,
    { steps: 6 },
  );
  await page.mouse.up();
  assert.ok(
    Math.abs(
      (await page.evaluate(() => window.__marbleGame.snapshot().rotation)) -
        rotationBefore,
    ) > 0.3,
    "Rotation still works after starting",
  );
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().emitted === 1,
  );
  await page.waitForTimeout(500);
  assert.equal(
    await page.locator(".kinetic-machine__caption").innerText(),
    "Click to catch",
  );
  assert.equal(await page.locator(".kinetic-machine__score").innerText(), "0");
  const counter = await page
    .locator(".kinetic-machine__score")
    .evaluate((el) => {
      const rect = el.getBoundingClientRect(),
        parent = el.parentElement.getBoundingClientRect(),
        style = getComputedStyle(el);
      return {
        top: rect.top - parent.top,
        right: parent.right - rect.right,
        color: style.color,
        size: parseFloat(style.fontSize),
        position: style.position,
      };
    });
  assert.ok(counter.top >= 0 && counter.top <= 12 && counter.right <= 16);
  assert.equal(counter.color, "rgb(133, 133, 133)");
  assert.ok(counter.size <= 14);
  assert.equal(counter.position, "absolute");
  assert.equal(await page.locator(".marble-controls__score").count(), 0);
  assert.equal(
    await page
      .locator(".kinetic-machine__stage")
      .evaluate((el) => getComputedStyle(el).cursor),
    await page
      .locator(".kinetic-machine")
      .evaluate((el) => getComputedStyle(el).cursor),
  );
  await page.mouse.move(100, 140);
  await page.waitForTimeout(70);
  assert.equal(
    await page.evaluate(() => {
      const canvas = document.querySelector(".marble-overlay");
      const dpr = canvas.width / document.documentElement.clientWidth;
      const pixels = canvas
        .getContext("2d")
        .getImageData(80 * dpr, 120 * dpr, 160 * dpr, 80 * dpr).data;
      return pixels.every((v, i) => i % 4 !== 3 || v === 0);
    }),
    true,
    "Neither a circle nor a label follows the cursor",
  );
  await page.screenshot({ path: `${output}/three-track-machine.png` });
  // Clicking a sphere on its track cannot catch it.
  const target = await page.evaluate(
    () => window.__marbleGame.machineTargets()[0],
  );
  assert.ok(target);
  await page.mouse.click(target.x, target.y);
  assert.equal(await page.evaluate(() => window.__marbleGame.round.caught), 0);
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().escapeCount === 1,
  );
  const escaped = await page.evaluate(() => {
    const game = window.__marbleGame;
    const ball = game.physics.balls[0];
    return {
      x: ball.x,
      y: ball.y - scrollY,
      time: game.physics.time,
      emitted: game.round.emitted,
    };
  });
  assert.ok(
    escaped.time >= 2.5 && escaped.time < 3.0,
    `Faster 2.6-second track trip: ${escaped.time}s`,
  );
  assert.equal(escaped.emitted, 2, "The next marble releases before any catch");
  await page.mouse.click(escaped.x + 50, escaped.y);
  const firstCatch = await page.evaluate(() => window.__marbleGame.snapshot());
  assert.equal(firstCatch.caught, 1);
  assert.equal(firstCatch.score, 1);
  assert.equal(await page.locator(".kinetic-machine__score").innerText(), "1");
  await page.waitForTimeout(5000);
  const overlap = await page.evaluate(() => window.__marbleGame.snapshot());
  assert.ok(overlap.emitted >= 4);
  assert.ok(
    overlap.interval < 2.2 && overlap.interval > 1.9,
    "Release interval steadily shrinks",
  );
  // Exercise each real branch with controlled random input, then restore randomness.
  for (const [route, value] of [
    [0, 0.1],
    [1, 0.45],
    [2, 0.9],
  ]) {
    const count = await page.evaluate(
      ({ route, value }) => {
        const game = window.__marbleGame;
        window.__savedRandom = Math.random;
        Math.random = () => value;
        game.round.nextIn = 0;
        return game.snapshot().routeUses[route];
      },
      { route, value },
    );
    await page.waitForFunction(
      ({ route, count }) =>
        window.__marbleGame.snapshot().routeUses[route] > count,
      { route, count },
    );
    await page.evaluate(() => {
      Math.random = window.__savedRandom;
      delete window.__savedRandom;
    });
  }
  await page.mouse.move(80, 150);
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().missed > 0,
    null,
    { timeout: 20000 },
  );
  const score = await page.evaluate(() => window.__marbleGame.snapshot());
  assert.equal(score.score, score.caught - score.missed);
  await page.locator(".studio-proof").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${output}/text-collisions.png` });
  // A late click removes a marble but cannot recover its lost point.
  const missed = await page.evaluate(() => {
    const game = window.__marbleGame;
    const ball = game.physics.balls.find((b) => b.hitText);
    if (!ball) return null;
    window.__lateBall = ball;
    return { y: ball.y };
  });
  assert.ok(missed, "A machine marble really hit page text");
  await page.evaluate(
    (y) => scrollTo(0, Math.max(0, y - innerHeight / 2)),
    missed.y,
  );
  await page.waitForTimeout(600);
  const late = await page.evaluate(() => ({
    x: window.__lateBall.x,
    y: window.__lateBall.y - scrollY,
    caught: window.__marbleGame.round.caught,
    cleaned: window.__marbleGame.round.cleaned,
  }));
  await page.mouse.click(late.x, late.y);
  const cleaned = await page.evaluate(() => window.__marbleGame.snapshot());
  assert.equal(cleaned.cleaned, late.cleaned + 1);
  assert.equal(cleaned.caught, late.caught);
  assert.equal(
    await page.evaluate(() =>
      window.__marbleGame.physics.balls.includes(window.__lateBall),
    ),
    false,
  );
  // Catch a page marble away from the machine; the ordinary link underneath stays put.
  const anywhere = await page.evaluate(() => {
    const game = window.__marbleGame;
    const link = document.querySelector(".studio-btn");
    link.scrollIntoView({ block: "center" });
    const r = link.getBoundingClientRect();
    const ball = game.physics.add({
      x: r.left + r.width / 2,
      y: r.top + scrollY + r.height / 2,
      radius: 8,
    });
    ball.sleep = 1;
    return { x: ball.x, y: ball.y - scrollY, caught: game.round.caught };
  });
  await page.mouse.click(anywhere.x, anywhere.y);
  assert.equal(
    await page.evaluate(() => window.__marbleGame.round.caught),
    anywhere.caught + 1,
  );
  assert.equal(
    page.url(),
    base + "/",
    "Catching over a link does not navigate",
  );
  await page.locator(".studio-proof").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
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
  const pausedTime = await page.evaluate(() => ({
    physics: window.__marbleGame.physics.time,
    ramp: window.__marbleGame.round.elapsed,
  }));
  await page.waitForTimeout(700);
  assert.deepEqual(
    await page.evaluate(() => ({
      physics: window.__marbleGame.physics.time,
      ramp: window.__marbleGame.round.elapsed,
    })),
    pausedTime,
  );
  await page.getByRole("button", { name: "Resume marbles" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !window.__marbleGame.snapshot().enabled);
  assert.equal(await page.locator(".kinetic-machine").isVisible(), false);
  assert.equal(await page.locator(".marble-overlay").isVisible(), false);
  const narrowTime = await page.evaluate(() => ({
    physics: window.__marbleGame.physics.time,
    ramp: window.__marbleGame.round.elapsed,
  }));
  await page.waitForTimeout(700);
  assert.deepEqual(
    await page.evaluate(() => ({
      physics: window.__marbleGame.physics.time,
      ramp: window.__marbleGame.round.elapsed,
    })),
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
  const caughtBeforeNavigation = await page.evaluate(
    () => window.__marbleGame.round.caught,
  );
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
  assert.equal(
    await page.evaluate(() => window.__marbleGame.round.caught),
    caughtBeforeNavigation,
  );
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
  assert.equal(await page.evaluate(() => window.__marbleGame.round.score), 0);
  await page.waitForFunction(
    () => window.__marbleGame.snapshot().inFlight === 1,
  );
  // Aim in both axes with the keyboard and catch a page marble.
  const aim = { x: 70, y: 220 };
  await page.mouse.move(aim.x, aim.y);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.evaluate(({ x, y }) => {
    const ball = window.__marbleGame.physics.add({
      x: x + 14,
      y: y + scrollY + 14,
      radius: 7,
    });
    ball.sleep = 1;
  }, aim);
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => window.__marbleGame.round.caught), 1);
  // Advance the pacing clock without waiting 90 seconds; verify its cap in the live loop.
  await page.evaluate(() => {
    window.__marbleGame.round.elapsed = 30;
    window.__marbleGame.round.nextIn = 0;
  });
  await page.waitForTimeout(1100);
  const maxPace = await page.evaluate(() => window.__marbleGame.snapshot());
  assert.ok(Math.abs(maxPace.interval - 1.05) < 1e-10);
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
          "press or rotation drag starts the stream",
          "2.6-second track trips",
          "automatic acceleration without a catch gate",
          "small grey score in the machine upper-right",
          "track marbles cannot be caught",
          "original cursor with invisible larger catch area and no cursor label",
          "minimal click hint",
          "three randomly chosen tracks",
          "catch escaped marbles on the page",
          "cleanup preserves penalty",
          "corner score",
          "click interception over links",
          "keyboard aim and catch",
          "previous maximum pace retained",
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
  for (const context of browser.contexts()) await context.close();
  await browser.close();
}
