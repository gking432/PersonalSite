import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/little-milwaukee";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.locator(".traffic-city").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      document.querySelector(".studio-hero__city").getBoundingClientRect()
        .width > 300,
  );
  // The entrance motion must finish before testing projected canvas hit areas.
  await page.waitForTimeout(1000);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const targets = () =>
    page.evaluate(() => window.__trafficCity.discoveryTargets());
  const clickDiscovery = async (id) => {
    const target = (await targets()).find((item) => item.id === id);
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.dataset.discovery,
      target,
    );
    assert.equal(hit, id, `projected ${id} must hit its own control`);
    await page.mouse.click(target.x, target.y);
  };
  assert.equal((await snap()).started, false);
  assert.deepEqual((await snap()).audio, { plays: 0, voices: 0 });
  assert.equal(await page.locator("[data-discovery]").count(), 17);
  assert.equal(await page.locator('[data-control="light"]').count(), 4);
  await page.screenshot({ path: `${output}/idle.png` });
  for (const target of await targets()) {
    await clickDiscovery(target.id);
    const state = await snap();
    assert.equal(
      state.discoveries.counts[target.id],
      1,
      `${target.id} activates once`,
    );
    if (target.id === "windows")
      assert.equal(state.scene.discoveries.windowsLit, true);
    else assert.ok(state.discoveries.busy.includes(target.id));
    if (target.id === "musician") {
      await page.waitForFunction(
        () => window.__trafficCity.snapshot().audio.voices === 6,
      );
      assert.equal((await snap()).audio.plays, 1);
      await clickDiscovery("musician");
      assert.equal(
        (await snap()).audio.plays,
        1,
        "busy musician must not layer another phrase",
      );
    }
  }
  assert.ok((await snap()).discoveries.busy.includes("pigeons"));
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().audio.voices === 0,
  );
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.nextArrival = sim.bridge.nextBoat = Infinity;
    sim.cars = [];
    Object.assign(sim.discoveries.active, {
      helicopter: 4,
      fisherman: 3,
      pedestrians: 6,
      pigeons: 3,
      coffee: 5,
      dog: 4,
      musician: 1,
      delivery: 4,
      fountain: 3,
    });
    api.refresh();
  });
  assert.ok((await snap()).scene.discoveries.helicopterHeight > 6);
  assert.ok((await snap()).scene.discoveries.fountainBoost > 1);
  await page.screenshot({ path: `${output}/discoveries.png` });
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    for (let i = 0; i < 120 * 30; i++) sim.tick(1 / 120);
    api.refresh();
  });
  assert.deepEqual((await snap()).discoveries.busy, []);
  assert.equal((await snap()).scene.discoveries.helicopterHeight, 3.38);
  assert.equal((await snap()).scene.discoveries.windowsLit, true);
  await clickDiscovery("windows");
  assert.equal((await snap()).scene.discoveries.windowsLit, false);
  // Rotating from an interactive object must not accidentally trigger it.
  const before = await snap();
  const target = (await targets()).find((item) => item.id === "helicopter");
  await page.mouse.move(target.x, target.y);
  await page.mouse.down();
  await page.mouse.move(target.x + 55, target.y + 5, { steps: 8 });
  await page.mouse.up();
  const after = await snap();
  assert.notEqual(after.pose.yaw, before.pose.yaw);
  assert.equal(
    after.discoveries.counts.helicopter,
    before.discoveries.counts.helicopter,
  );
  for (const width of [1440, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator(".traffic-city").scrollIntoViewIfNeeded();
    await page
      .getByRole("button", { name: "Explore Little Milwaukee", exact: true })
      .press("ArrowRight");
    for (const target of await targets()) {
      const hit = await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.dataset.discovery,
        target,
      );
      assert.equal(hit, target.id, `${target.id} after rotation at ${width}px`);
    }
    await clickDiscovery("windows");
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const musician = page.getByRole("button", {
    name: "Play a 3-second trumpet tune",
    exact: true,
  });
  await musician.focus();
  await musician.press("Enter");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().audio.voices > 0,
  );
  await page
    .getByRole("button", { name: "Reset traffic", exact: true })
    .click();
  assert.equal((await snap()).audio.voices, 0);
  assert.deepEqual((await snap()).discoveries, {
    busy: [],
    windows: false,
    counts: {},
    heist: { plays: 0, running: false, phase: "idle" },
  });
  assert.equal((await snap()).started, false);
  await musician.press("Enter");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().audio.voices > 0,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !window.__trafficCity.snapshot().enabled);
  assert.equal((await snap()).audio.voices, 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".traffic-city").scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Reset traffic", exact: true })
    .click();
  await musician.press("Enter");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().audio.voices > 0,
  );
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(() => !window.__trafficCity.snapshot().visible);
  assert.equal((await snap()).audio.voices, 0);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        discoveries: 17,
        checks: [
          "rendered hit targets",
          "one-shot animations",
          "landing and reset",
          "brief click-only audio",
          "drag suppression",
          "keyboard activation",
          "resizing and rotation",
          "audio cleanup",
        ],
        output,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
