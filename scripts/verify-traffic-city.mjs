import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5193";
const output =
  process.env.TRAFFIC_TEST_OUTPUT || "/tmp/portfolio-traffic-levels";
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
  page.setDefaultTimeout(25000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const shot = (name) => page.screenshot({ path: `${output}/${name}.png` });
  const button = (name) => page.getByRole("button", { name, exact: true });
  assert.equal(await page.locator(".traffic-city__model canvas").count(), 1);
  assert.equal(await page.getByRole("progressbar").count(), 0);
  assert.equal(await page.locator(".traffic-city__signal:visible").count(), 4);
  await shot("idle");
  const stage = await page.locator(".traffic-city__model").boundingBox();
  const pose = (await snap()).pose;
  await page.mouse.move(stage.x + 90, stage.y + 70);
  await page.mouse.down();
  await page.mouse.move(stage.x + 115, stage.y + 80, { steps: 5 });
  await page.mouse.up();
  await page.waitForFunction(() => window.__trafficCity.snapshot().started);
  assert.ok((await snap()).pose.yaw > pose.yaw + 0.15);
  await page.evaluate(() => {
    window.__trafficCity.sim.random = () => 0.5;
  });
  await page.waitForFunction(() => window.__trafficCity.sim.passed === 1);
  await page.waitForTimeout(300);
  assert.equal(
    await page.getByRole("progressbar").getAttribute("aria-valuenow"),
    "1",
  );
  assert.equal(await page.locator(".traffic-city__score").count(), 0);
  const fill = await page
    .locator(".traffic-city__bar")
    .evaluate(
      (el) =>
        el.firstChild.getBoundingClientRect().width /
        el.getBoundingClientRect().width,
    );
  assert.ok(Math.abs(fill - 0.05) < 0.005);
  const queued = await page.evaluate(() =>
    window.__trafficCity.sim.cars.find((c) => c.lane === 1 && c.stopped > 0.1),
  );
  assert.ok(queued);
  await button("Water Street northbound light: green").click();
  await page.waitForFunction(
    () => window.__trafficCity.sim.signals.water.color === "red",
  );
  await page.waitForFunction(
    () =>
      !window.__trafficCity.sim.cars.some(
        (c) => [0, 2].includes(c.lane) && c.committed && Math.abs(c.p) < 3,
      ),
  );
  await button("Wisconsin Avenue westbound light: red").click();
  await page.waitForFunction((id) => {
    const c = window.__trafficCity.sim.cars.find((c) => c.id === id);
    return !c || c.p > -1;
  }, queued.id);
  await button("Pause traffic").click();
  const paused = (await snap()).time;
  await page.waitForTimeout(350);
  assert.equal((await snap()).time, paused);
  await button("Resume traffic").click();
  // Use a real exiting car for each milestone; only the preceding passes are seeded.
  async function milestone(passed) {
    await page.evaluate((passed) => {
      const s = window.__trafficCity.sim;
      s.cars = [];
      s.nextArrival = 10000;
      s.passed = passed;
      s.spawn(0);
      const c = s.cars[0];
      c.p = 9.73;
      c.turn = "straight";
      c.speed = 2.4;
      c.committed = true;
    }, passed);
    await page.waitForFunction(
      (expected) => window.__trafficCity.sim.passed === expected,
      passed + 1,
    );
  }
  await milestone(19);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.expansion === 1,
  );
  assert.equal((await snap()).level, 2);
  assert.equal((await snap()).progress, 0);
  assert.equal(await page.locator(".traffic-city__signal:visible").count(), 8);
  await shot("level-two");
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
  // Follow the same vehicle into the next block, then release it with that block's lights.
  const transferId = await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.spawn(3);
    const c = s.cars.at(-1);
    c.p = 5.48;
    c.turn = "straight";
    c.speed = 2.4;
    c.committed = true;
    return c.id;
  });
  await page.waitForFunction(
    (id) =>
      window.__trafficCity.sim.cars.find((c) => c.id === id)?.junction === 1,
    transferId,
  );
  await page.waitForFunction(
    (id) =>
      window.__trafficCity.sim.cars.find((c) => c.id === id)?.stopped > 0.2,
    transferId,
  );
  assert.equal((await snap()).progress, 0);
  await button("Broadway northbound light: green").click();
  await page.waitForFunction(
    () => window.__trafficCity.sim.signals2.water.color === "red",
  );
  await button("Wisconsin Avenue at Broadway westbound light: red").click();
  await page.waitForFunction(() => window.__trafficCity.sim.progress === 1);
  // Observe blinkers and ambulance beacons in the live scene.
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.spawn(0, 1, true);
    const c = s.cars.at(-1);
    c.turn = "left";
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.ambulances === 1,
  );
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.blinkersOn > 0,
  );
  assert.ok((await snap()).scene.beaconsOn > 0);
  await shot("ambulance");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.blinkersOn === 0,
  );
  await milestone(39);
  assert.equal((await snap()).level, 3);
  assert.equal((await snap()).progress, 0);
  await page.waitForFunction(() =>
    window.__trafficCity.sim.bridge.boats.some((b) => b.waited > 0.2),
  );
  await shot("boat-waiting");
  await button("Raise bridge").click();
  await page.waitForFunction(() => window.__trafficCity.sim.bridge.lift === 1);
  await page.waitForFunction(() =>
    window.__trafficCity.sim.bridge.boats.some((b) => b.committed),
  );
  await shot("bridge-open");
  await button("Lower bridge").click();
  await page.waitForFunction(
    () => window.__trafficCity.sim.bridge.phase === "boat crossing",
  );
  assert.equal((await snap()).bridge.lift, 1);
  await page.waitForFunction(
    () => window.__trafficCity.sim.bridge.phase === "closed",
  );
  // Persistent wrecks, selected pickup, hooked lift, and reload.
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.cars = [];
    s.nextArrival = 10000;
    s.spawn(0, 1);
    s.spawn(1, 1);
    s.cars.forEach((c, i) => {
      c.p = i ? 0.57 : -0.57;
      c.turn = "straight";
      c.speed = 0;
      c.committed = true;
    });
  });
  await page.waitForFunction(
    () => window.__trafficCity.sim.incidents.length === 1,
  );
  await page.waitForTimeout(2000);
  assert.equal((await snap()).incidents.length, 1);
  await shot("accident");
  const accident = (await snap()).incidents[0].id;
  await button("Select an accident for helicopter pickup").click();
  await page.keyboard.press("Escape");
  assert.equal((await snap()).cleanupMode, false);
  await button("Select an accident for helicopter pickup").click();
  await button(`Pick up accident ${accident}`).click();
  await page.waitForFunction(
    () => window.__trafficCity.sim.rescue.active?.elapsed > 3.7,
  );
  await shot("helicopter-hook");
  await page.waitForFunction(() =>
    window.__trafficCity.sim.cars.some((c) => c.lifted),
  );
  await shot("helicopter-lift");
  await page.waitForFunction(() => !window.__trafficCity.sim.rescue.active);
  assert.equal((await snap()).incidents.length, 0);
  assert.equal((await snap()).progress, 0);
  assert.ok((await snap()).rescue.cooldown >= 14);
  assert.equal(
    await button("Select an accident for helicopter pickup").isDisabled(),
    true,
  );
  // The full 15-second cooldown is covered in the simulation test.
  await page.evaluate(() => {
    window.__trafficCity.sim.rescue.cooldown = 0.2;
  });
  await page.waitForFunction(
    () => window.__trafficCity.sim.rescue.cooldown === 0,
  );
  // Queues and honks still spill physical cars onto the webpage.
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.cars = [];
    s.nextArrival = 10000;
    s.signals.water.color = s.signals.wisconsin.color = "red";
    for (let lane = 0; lane < 4; lane++)
      for (let i = 0; i < 8; i++) {
        s.spawn(lane);
        const c = s.cars.at(-1);
        c.p = -2.16 - i * 0.92;
        c.speed = 0;
        c.stopped = 7;
        c.nextHonk = 7.01;
      }
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.honks > 0,
  );
  await shot("honk");
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    for (let n = 0; n < 3; n++)
      for (let lane = 0; lane < 4; lane++) s.spawn(lane);
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page?.escaped >= 12,
  );
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page.contacts > 0,
  );
  assert.equal(
    await page
      .locator(".traffic-city__overflow")
      .evaluate((el) => getComputedStyle(el).pointerEvents),
    "none",
  );
  await shot("page-cars");
  await page.locator(".studio-approach").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !window.__trafficCity.snapshot().visible);
  const offscreen = (await snap()).time;
  await page.waitForTimeout(350);
  assert.equal((await snap()).time, offscreen);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForFunction(() => window.__trafficCity.snapshot().visible);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !window.__trafficCity.snapshot().enabled);
  assert.equal(await page.locator(".traffic-city").isVisible(), false);
  assert.equal(
    await page.locator(".traffic-city__overflow").isVisible(),
    false,
  );
  const narrow = (await snap()).time;
  await page.waitForTimeout(300);
  assert.equal((await snap()).time, narrow);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => window.__trafficCity.snapshot().enabled);
  await button("Reset traffic").click();
  assert.equal((await snap()).level, 1);
  assert.equal((await snap()).page.cars, 0);
  assert.equal((await snap()).bridge.lift, 0);
  assert.equal((await snap()).rescue.busy, false);
  assert.equal(await page.getByRole("progressbar").count(), 0);
  await page.locator('.nav-links a[href="/about"]').click();
  await page.waitForURL("**/about");
  await page.waitForFunction(() => !window.__trafficCity);
  assert.equal(await page.locator(".traffic-city__overflow").count(), 0);
  await page.locator(".navbar .logo").click();
  await page.waitForURL(base + "/");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await button("Explore the Milwaukee intersection").focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.__trafficCity.snapshot().started);
  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  mobile.on("request", (r) => requests.push(r.url()));
  await mobile.goto(base);
  await mobile.waitForTimeout(400);
  assert.ok(
    !requests.some((u) => /cityRuntime|cityScene|cityAdditions|three/.test(u)),
  );
  assert.equal(await mobile.locator(".traffic-city").isVisible(), false);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "idle and drag activation",
          "5% progress per exit; no score counter",
          "real red-light queues and release",
          "pause/resume",
          "20-car unlock and connected second intersection",
          "eight projected light targets",
          "transfer counts only at final exit",
          "turn blinkers and ambulance beacons",
          "level-three boat arrivals",
          "manual drawbridge and boat clearance",
          "persistent accidents",
          "select accident and dispatch helicopter",
          "hook, lift, road clearance, and reload",
          "honk animations",
          "overflow onto page ink",
          "offscreen and narrow-screen suspension",
          "reset and route cleanup",
          "keyboard activation",
          "mobile skips 3D modules",
          "no browser errors",
        ],
        output,
      },
      null,
      2,
    ),
  );
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  const fallback = setTimeout(() => process.exit(process.exitCode || 0), 5000);
  await browser.close();
  clearTimeout(fallback);
}
