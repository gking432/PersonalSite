import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/portfolio-traffic-stadium";
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
  const button = (name) => page.getByRole("button", { name, exact: true });
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const shot = (name) => page.screenshot({ path: `${output}/${name}.png` });
  async function level(n) {
    await page.evaluate((n) => {
      const { sim: s, api } = window.__trafficCity;
      api.reset();
      s.passed = (n - 1) * 20;
      s.nextArrival =
        s.nextAmbulance =
        s.district.nextArrival =
        s.district.nextShop =
          10000;
      s.random = () => 0.5;
      api.start();
    }, n);
    await page.waitForFunction(
      (n) => window.__trafficCity.snapshot().level === n,
      n,
    );
  }
  await level(2);
  const hud = await page.locator(".traffic-city__progress").boundingBox(),
    city = await page.locator(".traffic-city").boundingBox();
  assert.ok(hud.width < city.width * 0.4);
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.spawn(1, 0, true);
    Object.assign(s.cars.at(-1), { p: -2.26, speed: 0, turn: "straight" });
  });
  await page.getByRole("timer", { name: "Emergency countdown" }).waitFor();
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().emergency?.remaining < 8,
  );
  await shot("emergency-countdown");
  await button("Pause traffic").click();
  const remaining = (await snap()).emergency.remaining;
  await page.waitForTimeout(450);
  assert.equal((await snap()).emergency.remaining, remaining);
  await button("Resume traffic").click();
  await page.getByRole("alertdialog").waitFor();
  await shot("game-over");
  const time = (await snap()).time;
  await page.waitForTimeout(300);
  assert.equal((await snap()).time, time);
  assert.equal(
    await button("Try again").evaluate((el) => el === document.activeElement),
    true,
  );
  await button("Try again").click();
  assert.equal((await snap()).level, 1);
  assert.equal((await snap()).gameOver, null);
  assert.equal(await page.getByRole("timer").count(), 0);
  await level(6);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.westExpansion === 1,
  );
  await button("Program lights").click();
  await button("Water Street northbound light: green").click();
  await page
    .getByLabel("Signal control", { exact: true })
    .selectOption("timer");
  await page.getByLabel("Green duration").selectOption("4");
  await button("Apply program").click();
  assert.equal((await snap()).programs[0].mode, "timer");
  assert.equal(
    await page.locator('option[value="linked"]').evaluate((el) => el.disabled),
    true,
  );
  await shot("timer-program");
  await button("Close light program").click();
  await button("Program lights").click();
  await page.waitForFunction(
    () => window.__trafficCity.sim.signals.wisconsin.color === "green",
  );
  await level(7);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.westExpansion === 1,
  );
  await button("Program lights").click();
  await button("Water Street northbound light: green").click();
  await page
    .getByLabel("Signal control", { exact: true })
    .selectOption("timer");
  await page.getByLabel("Green duration").selectOption("6");
  await button("Apply program").click();
  await button("Close light program").click();
  await button("Broadway northbound light: green").click();
  await page
    .getByLabel("Signal control", { exact: true })
    .selectOption("linked");
  await page.getByLabel("Linked source").selectOption("0");
  await page.getByLabel("Link pattern").selectOption("opposite");
  await page.getByLabel("Link delay").selectOption("2");
  await button("Apply program").click();
  assert.equal((await snap()).programs[1].source, 0);
  await page.waitForFunction(() =>
    document
      .querySelector(".traffic-city__links path")
      ?.getAttribute("d")
      ?.startsWith("M"),
  );
  await shot("linked-lights");
  await level(8);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.westExpansion === 1,
  );
  await button("Program lights").click();
  await button("Water Street northbound light: green").click();
  await page
    .getByLabel("Signal control", { exact: true })
    .selectOption("sensor");
  await page.getByLabel("Ambulance priority", { exact: false }).check();
  await button("Apply program").click();
  assert.equal((await snap()).programs[0].emergency, true);
  await shot("sensor-program");
  await level(9);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.districtExpansion === 1,
  );
  assert.equal(
    await page.locator(".traffic-city__signal[data-axis]:visible").count(),
    24,
  );
  await button("Enter fullscreen").click();
  await page.waitForFunction(() => !!document.fullscreenElement);
  await shot("six-block-stadium");
  await button("Pause traffic").click();
  await button("Place one roundabout").click();
  await page.waitForFunction(() =>
    document
      .querySelector('[aria-label="Place roundabout at Stadium District"]')
      ?.style.transform.includes("translate"),
  );
  await button("Place roundabout at Stadium District").click();
  assert.equal((await snap()).roundabout, 5);
  await button("Resume traffic").click();
  assert.equal(await button("Place one roundabout").count(), 0);
  assert.equal(
    await page.locator(".traffic-city__signal[data-axis]:visible").count(),
    20,
  );
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.district.nextArrival = 0;
  });
  await page.waitForFunction(
    () => window.__trafficCity.sim.district.arrivals >= 2,
    {},
    { timeout: 30000 },
  );
  await shot("stadium-parking");
  assert.ok((await snap()).district.stadium >= 2);
  assert.equal((await snap()).gameOver, null);
  await page.evaluate(() => {
    window.__trafficCity.sim.district.time = 51;
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().district.phase === "game",
  );
  await shot("stadium-lights");
  await page.evaluate(() => {
    window.__trafficCity.sim.district.time = 85;
  });
  await page.waitForFunction(
    () => window.__trafficCity.sim.district.departures > 0,
  );
  await shot("exit-rush");
  assert.ok(
    await page.evaluate(() =>
      window.__trafficCity.sim.cars.some((c) => c.destination === "freeway"),
    ),
  );
  await button("Exit fullscreen").click();
  await page.waitForFunction(() => !document.fullscreenElement);
  await button("Reset traffic").click();
  assert.equal((await snap()).roundabout, null);
  assert.equal((await snap()).district, null);
  assert.equal(
    (await snap()).programs.every((p) => p.mode === "manual"),
    true,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.locator(".traffic-city").isVisible(), false);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "compact green bar",
          "red emergency countdown and pause",
          "game over, frozen simulation, focused restart",
          "level-six timer editor and actual light cycle",
          "level-seven links and visible connections",
          "level-eight sensor and ambulance priority",
          "six connected blocks at level nine",
          "fullscreen district",
          "one roundabout placement",
          "real freeway arrivals park at stadium",
          "stadium lighting and timed exit rush",
          "returning parking traffic",
          "reset clears unlocks and programs",
          "mobile stays hidden",
          "no browser errors",
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
