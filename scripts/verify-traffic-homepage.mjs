import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/traffic-homepage";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(20000);
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5193");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const button = (name) => page.getByRole("button", { name, exact: true });
  assert.equal(await page.locator('[data-control="light"]:visible').count(), 1);
  assert.equal(
    await page.locator('[data-control="bridge"]:visible').count(),
    1,
  );
  assert.equal(await page.getByRole("progressbar").count(), 0);
  assert.equal((await snap()).started, false);
  await button("Explore the Milwaukee intersection").press("Enter");
  await page.waitForFunction(() => window.__trafficCity.snapshot().cars > 0);
  await page.waitForFunction(() => window.__trafficCity.snapshot().page?.ready);
  await page.locator('[data-control="light"]').click();
  assert.equal((await snap()).signals.wisconsin, "green");
  await button("Pause traffic").click();
  const time = (await snap()).time;
  await page.waitForTimeout(200);
  assert.equal((await snap()).time, time);
  await button("Resume traffic").click();
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.cars = [];
    s.nextArrival = 10000;
    s.bridge.nextBoat = 10000;
    s.spawn(0);
    s.spawn(1);
    s.cars.forEach((c, i) =>
      Object.assign(c, {
        p: i ? 0.57 : -0.57,
        turn: "straight",
        committed: true,
        speed: 0,
      }),
    );
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().crashes === 1,
  );
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page.escaped >= 2,
  );
  assert.equal(
    await page.getByRole("group", { name: "Accident recovery" }).count(),
    0,
  );
  await page.evaluate(() => {
    const { sim: s, api } = window.__trafficCity;
    s.cars = [];
    s.bridge.boats = [];
    s.bridge.requestedOpen = true;
    s.bridge.lift = 1;
    s.bridge.spawn(s.events);
    Object.assign(s.bridge.boats[0], { p: 0, committed: true });
    api.refresh();
  });
  // The UI updates on the next animation step, then this real click drops the crossing boat.
  await button("Close the bridge").click();
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().bridge.crashes === 1,
  );
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page.escaped >= 3,
  );
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.passed = 500;
    s.signals.water.color = s.signals.wisconsin.color = "red";
    for (let i = 0; i < 12; i++) {
      s.spawn(1);
      for (let j = 0; j < 240; j++) s.tick(1 / 120);
    }
    for (let i = 0; i < 12; i++) {
      s.bridge.spawn(s.events);
      for (let j = 0; j < 240; j++) s.tick(1 / 120);
    }
  });
  await page.waitForFunction(
    () =>
      window.__trafficCity.snapshot().overflowed > 0 &&
      window.__trafficCity.snapshot().bridge.overflowed > 0,
  );
  assert.equal((await snap()).level, undefined);
  assert.equal(await page.getByRole("progressbar").count(), 0);
  await page.screenshot({ path: `${output}/single-intersection.png` });
  await button("Reset traffic").click();
  assert.equal((await snap()).started, false);
  assert.equal((await snap()).page.escaped, 0);
  await button("Open the bridge").click();
  assert.equal((await snap()).started, true);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().bridge.lift === 1,
  );
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.bridge.spawn(s.events);
    s.bridge.boats.at(-1).p = 6.88;
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().bridge.passed > 0,
  );
  await button("Enter fullscreen").click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await button("Exit fullscreen").click();
  await page.waitForFunction(() => !document.fullscreenElement);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !window.__trafficCity.snapshot().enabled);
  assert.equal(await page.locator(".traffic-city").isVisible(), false);
  const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
    }),
    requests = [];
  mobile.on("request", (r) => requests.push(r.url()));
  await mobile.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5193");
  assert.equal(
    await mobile.evaluate(() => typeof window.__trafficCity),
    "undefined",
  );
  assert.ok(
    !requests.some((url) => /cityRuntime|cityScene|three[._-]/.test(url)),
  );
  assert.deepEqual(errors, []);
  await mobile.close();
  await page.close();
  console.log(JSON.stringify({ status: "PASS", checks: 14, output }, null, 2));
} finally {
  await browser.close();
}
