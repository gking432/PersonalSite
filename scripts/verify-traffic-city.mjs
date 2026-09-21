import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5193";
const output =
  process.env.TRAFFIC_TEST_OUTPUT || "/tmp/portfolio-traffic-check";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.TRAFFIC_BROWSER || "chrome",
  headless: true,
});
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  assert.equal(await page.locator(".marble-overlay").count(), 0);
  assert.equal(await page.locator(".traffic-city__model canvas").count(), 1);
  await page.waitForTimeout(400);
  assert.equal(
    await page.evaluate(() => window.__trafficCity.sim.cars.length),
    0,
  );
  await page.screenshot({ path: `${output}/idle.png` });
  const stage = await page.locator(".traffic-city__model").boundingBox();
  const originalPose = await page.evaluate(
    () => window.__trafficCity.snapshot().pose,
  );
  await page.mouse.move(stage.x + 90, stage.y + 80);
  await page.mouse.down();
  await page.waitForFunction(() => window.__trafficCity.snapshot().started);
  await page.mouse.move(stage.x + 134, stage.y + 88, { steps: 6 });
  await page.mouse.up();
  const turned = await page.evaluate(
    () => window.__trafficCity.snapshot().pose,
  );
  assert.ok(
    turned.yaw > originalPose.yaw + 0.3 && turned.pitch > originalPose.pitch,
  );
  await page.waitForFunction(() => window.__trafficCity.snapshot().waiting > 0);
  const queue = await page.evaluate(() =>
    window.__trafficCity.sim.cars.find((c) => c.lane === 1 && c.stopped > 0.3),
  );
  assert.ok(
    queue && Math.abs(queue.p + 2.16 + (queue.length - 0.72) / 2) < 0.1,
    JSON.stringify(queue),
  );
  await page.waitForFunction(() => window.__trafficCity.sim.passed > 0);
  const scoreStyle = await page
    .locator(".traffic-city__score")
    .evaluate((el) => ({
      color: getComputedStyle(el).color,
      right:
        el.parentElement.getBoundingClientRect().right -
        el.getBoundingClientRect().right,
    }));
  assert.equal(scoreStyle.color, "rgb(133, 133, 133)");
  assert.ok(scoreStyle.right < 16);
  await page.screenshot({ path: `${output}/traffic.png` });
  // Open Wisconsin only after Water's cars have cleared the crossing.
  await page
    .getByRole("button", {
      name: "Water Street northbound light: green",
      exact: true,
    })
    .click();
  await page.waitForFunction(
    () => window.__trafficCity.sim.signals.water.color === "red",
  );
  await page.waitForFunction(
    () =>
      !window.__trafficCity.sim.cars.some(
        (c) => [0, 2].includes(c.lane) && c.committed && Math.abs(c.p) < 2,
      ),
  );
  await page
    .getByRole("button", {
      name: "Wisconsin Avenue westbound light: red",
      exact: true,
    })
    .click();
  await page.waitForFunction((id) => {
    const c = window.__trafficCity.sim.cars.find((c) => c.id === id);
    return !c || c.p > -1;
  }, queue.id);
  assert.equal(
    await page.evaluate(() => window.__trafficCity.sim.signals.wisconsin.color),
    "green",
  );
  // DOM hit targets stay attached to the real lamps after rotation.
  const targets = await page.evaluate(() => window.__trafficCity.targets());
  for (const target of targets) {
    const r = await page
      .locator(".traffic-city__signal")
      .nth(target.index)
      .boundingBox();
    assert.ok(
      Math.abs(r.x + r.width / 2 - target.x) < 1 &&
        Math.abs(r.y + r.height / 2 - target.y) < 1,
    );
  }
  await page
    .getByRole("button", { name: "Pause traffic", exact: true })
    .click();
  const paused = await page.evaluate(() => window.__trafficCity.sim.time);
  await page.waitForTimeout(450);
  assert.equal(
    await page.evaluate(() => window.__trafficCity.sim.time),
    paused,
  );
  await page
    .getByRole("button", { name: "Resume traffic", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !window.__trafficCity.snapshot().enabled);
  assert.equal(await page.locator(".traffic-city").isVisible(), false);
  const narrow = await page.evaluate(() => window.__trafficCity.sim.time);
  await page.waitForTimeout(400);
  assert.equal(
    await page.evaluate(() => window.__trafficCity.sim.time),
    narrow,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => window.__trafficCity.snapshot().enabled);
  await page.locator(".studio-approach").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !window.__trafficCity.snapshot().visible);
  const offscreen = await page.evaluate(() => window.__trafficCity.sim.time);
  await page.waitForTimeout(400);
  assert.equal(
    await page.evaluate(() => window.__trafficCity.sim.time),
    offscreen,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => window.__trafficCity.snapshot().visible);
  // Reproduce one conflict through the live renderer and real light controls.
  await page
    .getByRole("button", { name: "Pause traffic", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Water Street northbound light: red",
      exact: true,
    })
    .click();
  const beforeCrash = await page.evaluate(() => {
    const sim = window.__trafficCity.sim;
    sim.cars = [];
    sim.nextArrival = 10000;
    sim.spawn(0);
    sim.spawn(1);
    sim.cars[0].p = -0.57;
    sim.cars[1].p = 0.57;
    sim.cars.forEach((c) => {
      c.committed = true;
      c.speed = 0;
    });
    return sim.crashes;
  });
  await page
    .getByRole("button", { name: "Resume traffic", exact: true })
    .click();
  await page.waitForFunction(
    (before) => window.__trafficCity.sim.crashes === before + 1,
    beforeCrash,
  );
  await page.screenshot({ path: `${output}/collision.png` });
  await page.waitForFunction(() => window.__trafficCity.sim.cars.length === 0);
  // Force the final fraction of a blocked queue timer; the unit test runs its full duration.
  await page
    .getByRole("button", { name: "Reset traffic", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Explore the Milwaukee intersection",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await page.evaluate(() => {
    const sim = window.__trafficCity.sim;
    sim.cars = [];
    sim.nextArrival = 10000;
    for (let i = 0; i < 6; i++) {
      sim.spawn(1);
      const c = sim.cars.at(-1);
      c.bus = false;
      c.length = 0.72;
      c.p = -2.16 - i * 0.92;
      c.speed = 0;
    }
    sim.blocked[1] = 11.9;
  });
  await page.waitForFunction(() => window.__trafficCity.sim.jammed);
  assert.match(
    await page.locator(".traffic-city__caption").innerText(),
    /Gridlock/,
  );
  await page
    .getByRole("button", { name: "Reset traffic", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => window.__trafficCity.sim.started),
    false,
  );
  assert.equal(await page.locator(".traffic-city__score").count(), 0);
  await page.locator('.nav-links a[href="/about"]').click();
  await page.waitForURL("**/about");
  await page.waitForFunction(() => !window.__trafficCity);
  await page.locator(".navbar .logo").click();
  await page.waitForURL(base + "/");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  assert.equal(await page.locator(".traffic-city__model canvas").count(), 1);
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  mobile.on("request", (r) => requests.push(r.url()));
  await mobile.goto(base);
  await mobile.waitForTimeout(500);
  assert.equal(await mobile.locator(".traffic-city").isVisible(), false);
  assert.ok(!requests.some((u) => /cityRuntime|cityScene|three/.test(u)));
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "idle miniature",
          "press and drag activates traffic",
          "rotation in two axes",
          "red-light queues",
          "safe light switching releases cars",
          "corner score",
          "projected lamp click targets",
          "pause/resume",
          "narrow-screen and offscreen suspension",
          "conflicting-green crash and cleanup",
          "gridlock and reset",
          "keyboard activation",
          "route cleanup and remount",
          "mobile skips Three.js",
          "no marble overlay",
          "no browser errors",
        ],
        output,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  const fallback = setTimeout(() => process.exit(process.exitCode || 0), 5000);
  await browser.close();
  clearTimeout(fallback);
}
