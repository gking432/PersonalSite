import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const output = "/tmp/milwaukee-car-letters";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.waitForTimeout(1800);

  // Actual crossing crash -> visible 3D launch -> page sprite -> letter impact.
  // Previously both sprites disappeared at the full-width city caption box.
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    api.setEnabled(false);
    sim.cars = [];
    sim.bridge.boats = [];
    sim.nextArrival = sim.bridge.nextBoat = Infinity;
    sim.signals.water.color = sim.signals.wisconsin.color = "green";
    sim.spawn(0);
    sim.spawn(1);
    sim.cars.forEach((car, i) =>
      Object.assign(car, {
        p: i ? 0.57 : -0.57,
        turn: "straight",
        committed: true,
        speed: 0,
      }),
    );
    api.setEnabled(true);
    api.start();
  });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page?.escaped === 2,
  );
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page.bodies.some((b) => b.hitText),
    null,
    { timeout: 8000 },
  );
  await page.screenshot({ path: `${output}/crashed-car-hits-page-text.png` });
  await page.waitForFunction(
    () =>
      window.__trafficCity
        .snapshot()
        .page.bodies.some((b) => b.hitText && b.settled),
    null,
    { timeout: 12000 },
  );
  const crash = await page.evaluate(() => {
    const state = window.__trafficCity.snapshot();
    window.__trafficCity.api.setEnabled(false);
    return { crashes: state.crashes, ...state.page };
  });
  assert.equal(crash.crashes, 1);
  assert.equal(crash.heroSurfaces, 0);
  assert.ok(crash.contacts > 0);

  // Controlled drops over real DOM lettering and empty space beside it. No
  // synthetic floor: the top rule and the column's empty area must stay open.
  const fixture = await page.evaluate(async () => {
    window.__trafficCity.api.reset();
    window.scrollTo(0, 600);
    const { createPageCars } = await import(
      "/src/features/traffic/pageCars.js"
    );
    const host = document.querySelector(".traffic-city__model");
    const overlay = createPageCars(host);
    window.__pageCarProbe = overlay;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 24;
    const ctx = sprite.getContext("2d");
    ctx.fillStyle = "#c44837";
    ctx.fillRect(3, 6, 18, 12);
    ctx.fillStyle = "#17352b";
    ctx.fillRect(8, 6, 6, 12);
    const label = document.querySelectorAll(".studio-proof__value")[2];
    const rect = label.getBoundingClientRect();
    const proof = document
      .querySelector(".studio-proof")
      .getBoundingClientRect();
    const bounds = host.getBoundingClientRect();
    for (const x of [rect.left + 26, proof.right - 12])
      overlay.add({
        x: x - bounds.left,
        y: proof.top - 25 - bounds.top,
        vx: 0,
        vy: 40,
        radius: 6,
        size: 24,
        spin: 1,
        sprite,
      });
    return {
      ruleY: proof.top + scrollY,
      bottom: proof.bottom + scrollY,
      textY: rect.top + scrollY,
      textBottom: rect.bottom + scrollY,
    };
  });
  await page.waitForFunction(
    ({ bottom }) =>
      window.__pageCarProbe.snapshot().bodies.find((b) => b.id === 2)?.y >
      bottom + 12,
    fixture,
  );
  const passing = await page.evaluate(() => window.__pageCarProbe.snapshot());
  const ink = passing.bodies.find((b) => b.id === 1);
  const gap = passing.bodies.find((b) => b.id === 2);
  assert.ok(ink.hitText, "the letter catches the car");
  assert.ok(ink.y > fixture.ruleY + 20, "the decorative rule is not a floor");
  assert.equal(gap.hitText, false, "empty column space does not catch a car");
  await page.waitForFunction(
    () =>
      window.__pageCarProbe.snapshot().bodies.find((b) => b.id === 1)?.settled,
  );
  const resting = await page.evaluate(() =>
    window.__pageCarProbe.snapshot().bodies.find((b) => b.id === 1),
  );
  assert.ok(resting.y > fixture.textY - 10);
  assert.ok(resting.y < fixture.textBottom);
  await page.screenshot({ path: `${output}/letters-catch-rules-do-not.png` });

  // A resting car stays attached to document lettering when the page scrolls.
  await page.evaluate(() => window.scrollBy(0, 130));
  // Scrolling animates the squeeze panels and wakes bodies while surfaces move.
  await page.waitForTimeout(1800);
  await page.waitForFunction(
    () =>
      window.__pageCarProbe.snapshot().bodies.find((b) => b.id === 1)?.settled,
  );
  const scrolled = await page.evaluate(() =>
    window.__pageCarProbe.snapshot().bodies.find((b) => b.id === 1),
  );
  assert.ok(Math.abs(resting.x - scrolled.x) < 0.5);
  assert.ok(Math.abs(resting.y - scrolled.y) < 0.5);
  assert.ok(scrolled.settled);
  await page.evaluate(() => window.__pageCarProbe.dispose());
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "real crash survives the city caption and hits page lettering",
          "a crashed car comes to rest on the page",
          "letter ink catches cars below the city",
          "decorative rules and empty column space remain open",
          "resting car stays with its letters through scrolling",
          "hero copy excluded from collision surfaces",
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
