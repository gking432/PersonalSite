import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/milwaukee-progression";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(15000);
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5194/");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  const button = (name) => page.getByRole("button", { name, exact: true });
  const state = () => page.evaluate(() => window.__trafficCity.snapshot());
  const signal = (j) =>
    page
      .locator(`.traffic-city__signal[data-junction="${j}"][data-axis]:visible`)
      .last();
  await button("Explore the Milwaukee intersection").tap({
    position: { x: 35, y: 70 },
  });
  const milestone = async (level, id, action) => {
    if ((await state()).paused) await button("Resume traffic").tap();
    await page.evaluate((level) => {
      const s = window.__trafficCity.sim;
      s.cars = [];
      s.incidents = [];
      s.nextArrival = s.nextAmbulance = s.bridge.nextBoat = Infinity;
      s.district.nextArrival = s.district.nextShop = Infinity;
      s.passed = (level - 1) * 20 - 1;
      s.spawn(3, 1);
      Object.assign(s.cars[0], {
        p: 9.74,
        turn: "straight",
        committed: true,
        speed: 2.4,
      });
    }, level);
    await page.getByRole("dialog").waitFor();
    assert.equal((await state()).tutorial.id, id);
    const time = await page.evaluate(() => window.__trafficCity.sim.time);
    await page.waitForTimeout(180);
    assert.equal(
      await page.evaluate(() => window.__trafficCity.sim.time),
      time,
    );
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent),
      action,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({ path: `${output}/level-${level}-tutorial.png` });
    await button(action).tap();
    await page.getByRole("dialog").waitFor({ state: "detached" });
  };
  await milestone(2, "timer", "Try the timer");
  assert.deepEqual((await state()).activeJunctions, [0, 1]);
  assert.equal((await state()).neighborhoodReady, false);
  await button("Program lights").tap();
  await signal(0).tap();
  await button("Set 10-second timer").tap();
  assert.equal((await state()).programs[0].mode, "timer");
  await button("Program lights").tap();
  await signal(1).tap();
  await button("Move timer here").tap();
  assert.equal((await state()).programs[0].mode, "manual");
  assert.equal((await state()).programs[1].mode, "timer");
  await page.screenshot({ path: `${output}/level-2-timer.png` });
  await milestone(3, "bridge", "Watch the bridge");
  await button("Open the bridge").tap();
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().bridge.lift === 1,
  );
  await button("Close the bridge").tap();
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().bridge.lift === 0,
  );
  await milestone(8, "roundabout", "Open the neighborhood");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.neighborhoodExpansion === 1,
  );
  assert.deepEqual((await state()).scene.visibleJunctions, [0, 1, 2, 3, 4, 5]);
  assert.equal((await state()).districtReady, false);
  assert.equal(
    await page.locator(".traffic-city__signal[data-axis]:visible").count(),
    23,
  );
  await button("Pause traffic").tap();
  await button("Place one roundabout").tap();
  await button("Place roundabout at Civic Square").tap();
  assert.equal((await state()).roundabout, 4);
  assert.equal(await button("Place one roundabout").count(), 0);
  await page.screenshot({ path: `${output}/level-8-neighborhood.png` });
  await milestone(9, "street", "Link a street");
  await button("Link street").tap();
  await page
    .getByRole("button", { name: /Wisconsin Avenue.*3 crossings/ })
    .tap();
  assert.equal((await state()).linkedStreet.key, "row-0");
  assert.ok(await page.locator(".traffic-city__street-line").getAttribute("d"));
  await signal(1).tap();
  await page.waitForFunction(() =>
    [0, 1, 2].every(
      (j) =>
        window.__trafficCity.snapshot().allSignals[j].wisconsin === "green",
    ),
  );
  assert.equal(
    (await state()).programs.filter((r) => r.mode === "timer").length,
    0,
  );
  assert.equal((await state()).scene.visibleJunctions.length, 6);
  await page.screenshot({ path: `${output}/level-9-street.png` });
  await milestone(11, "stadium", "Let’s play ball");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.districtExpansion === 1,
  );
  assert.equal((await state()).scene.visibleJunctions.length, 8);
  assert.ok((await state()).district);
  assert.equal((await state()).roundabout, 4);
  assert.equal((await state()).linkedStreet.key, "row-0");
  await page.screenshot({ path: `${output}/level-11-stadium.png` });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `${output}/level-11-desktop.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const s = window.__trafficCity.sim;
    s.cars = [];
    s.incidents = [];
    s.spawn(0);
    const wreck = s.cars[0];
    Object.assign(wreck, {
      p: 2.2,
      turn: "straight",
      speed: 0,
      committed: true,
      crashed: true,
      incident: 90,
    });
    s.incidents.push({
      id: 90,
      junction: 0,
      x: -0.57,
      z: 2.2,
      assigned: false,
    });
    s.spawn(0, 0, true);
    Object.assign(s.cars[1], {
      p: 1.18,
      turn: "straight",
      speed: 0,
      committed: true,
    });
    for (let frame = 0; frame < 8 * 120; frame++) s.tick(1 / 120);
  });
  await page.getByRole("timer", { name: "Emergency countdown" }).waitFor();
  assert.ok((await state()).emergency.remaining < 12.1);
  await page.screenshot({ path: `${output}/ambulance-crash-countdown.png` });
  await button("Pause traffic").tap();
  const wait = await page.evaluate(
    () => window.__trafficCity.sim.emergencySnapshot().remaining,
  );
  await page.waitForTimeout(200);
  assert.equal(
    await page.evaluate(
      () => window.__trafficCity.sim.emergencySnapshot().remaining,
    ),
    wait,
  );
  await button("Resume traffic").tap();
  await page.evaluate(() => {
    for (let frame = 0; frame < 11 * 120; frame++)
      window.__trafficCity.sim.tick(1 / 120);
  });
  await button("Try again").waitFor();
  assert.ok((await state()).gameOver);
  await button("Try again").tap();
  assert.deepEqual(errors, []);
  await button("Reset traffic").click();
  assert.equal((await state()).level, 1);
  assert.equal((await state()).linkedStreet, null);
  assert.equal((await state()).roundabout, null);
  assert.equal(
    (await state()).programs.every((r) => r.mode === "manual"),
    true,
  );
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "all five paused tutorial milestones",
          "level-two timer assignment and relocation on 2x1",
          "bridge tutorial and touch controls at level three",
          "six-unit map with one roundabout",
          "street selection, projected highlight and group switch",
          "stadium and freeway delayed until eleven",
          "phone and desktop layouts",
          "crash-blocked ambulance HUD, pause, deadline and restart",
          "reset clears all tools",
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
