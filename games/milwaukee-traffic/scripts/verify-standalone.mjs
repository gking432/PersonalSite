import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const output = "/tmp/milwaukee-standalone";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const errors = [],
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(20000);
  const url = process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5194";
  await page.goto(url);
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  const button = (name) => page.getByRole("button", { name, exact: true });
  await button("Explore the Milwaukee intersection").press("Enter");
  await page.waitForFunction(() => window.__trafficCity.snapshot().cars > 0);
  assert.equal(await page.getByRole("progressbar").count(), 1);
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.cars = [];
    s.nextArrival = s.nextAmbulance = 10000;
    s.passed = 159;
    s.spawn(0);
    Object.assign(s.cars[0], {
      p: 9.74,
      turn: "straight",
      committed: true,
      speed: 2.4,
    });
  });
  await page.getByRole("dialog").waitFor();
  assert.equal(
    await page.evaluate(() => window.__trafficCity.snapshot().districtReady),
    false,
  );
  await button("Let’s grow the city").click();
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.districtExpansion === 1,
  );
  assert.equal(
    await page.locator(".traffic-city__signal[data-axis]:visible").count(),
    30,
  );
  await button("Program lights").click();
  await page
    .locator(".traffic-city__signal[data-axis]:visible")
    .first()
    .click();
  await page.locator(".traffic-city__programmer").waitFor();
  await page.screenshot({ path: `${output}/full-game-desktop.png` });
  await page.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto(url);
  await mobile.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  assert.equal(await mobile.locator(".traffic-city").isVisible(), true);
  await mobile
    .getByRole("button", {
      name: "Explore the Milwaukee intersection",
      exact: true,
    })
    .tap({ position: { x: 40, y: 70 } });
  await mobile.waitForFunction(() => window.__trafficCity.snapshot().started);
  await mobile
    .locator(".traffic-city__signal[data-axis]:visible")
    .first()
    .tap();
  await mobile.waitForFunction(
    () => window.__trafficCity.snapshot().signals.water !== "green",
  );
  await mobile.screenshot({ path: `${output}/full-game-mobile.png` });
  await mobile.close();
  const file = await browser.newPage({
      viewport: { width: 1200, height: 900 },
    }),
    network = [];
  file.on("pageerror", (e) => errors.push(e.message));
  file.on("request", (r) => {
    if (/^https?:/.test(r.url())) network.push(r.url());
  });
  await file.goto(pathToFileURL(resolve("dist/Milwaukee Traffic.html")).href);
  await file.locator(".traffic-city__model canvas").waitFor();
  await file
    .getByRole("button", {
      name: "Explore the Milwaukee intersection",
      exact: true,
    })
    .press("Enter");
  await file
    .getByRole("button", { name: "Pause traffic", exact: true })
    .waitFor();
  assert.equal(
    await file.evaluate(() => typeof window.__trafficCity),
    "undefined",
  );
  assert.deepEqual(network, []);
  assert.deepEqual(errors, []);
  await file.close();
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "desktop activation and progress",
          "full level-nine expansion and 30 signals",
          "light programmer retained",
          "mobile touch activation and light controls",
          "single HTML runs locally without network or dev hook",
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
