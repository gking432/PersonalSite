import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
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
  assert.equal(await page.locator('[data-control="light"]:visible').count(), 4);
  assert.equal(
    await page.locator('[data-control="bridge"]:visible').count(),
    1,
  );
  assert.equal(await page.getByRole("progressbar").count(), 0);
  assert.equal((await snap()).started, false);
  assert.equal(
    await page.getByRole("button", { name: /pause|fullscreen/i }).count(),
    0,
  );
  await button("Explore Little Milwaukee").press("Enter");
  await page.waitForFunction(() => window.__trafficCity.snapshot().cars > 0);
  await page.waitForFunction(() => window.__trafficCity.snapshot().page?.ready);
  await page.locator('[data-control="light"]').first().click();
  assert.equal((await snap()).signals.water, "amber");
  assert.equal((await snap()).signals.wisconsin, "red");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().signals.water === "red",
  );
  // Click where the rendered lamp heads actually sit, not a locator's center.
  // Each head controls its own road, even after rotation and resize.
  for (const width of [1440, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    for (let step = 0; step < 4; step++)
      await button("Explore Little Milwaukee").press("ArrowRight");
    for (let index = 0; index < 4; index++) {
      const target = await page.evaluate(
        (i) => window.__trafficCity.targets()[i],
        index,
      );
      const control = await page.evaluate(
        ({ x, y }) =>
          document.elementFromPoint(x, y)?.closest("[data-control]")?.dataset
            .axis,
        target,
      );
      assert.equal(control, target.axis, `head ${index} at ${width}px`);
      const before = (await snap()).signals;
      const other = target.axis === "water" ? "wisconsin" : "water";
      await page.mouse.click(target.x, target.y);
      const after = (await snap()).signals;
      assert.notEqual(
        after[target.axis],
        before[target.axis],
        `head ${index} at ${width}px`,
      );
      assert.equal(
        after[other],
        before[other],
        `cross traffic changed for head ${index} at ${width}px`,
      );
      await page.waitForFunction(() =>
        Object.values(window.__trafficCity.snapshot().signals).every(
          (color) => color !== "amber",
        ),
      );
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => {
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
      if (
        this.canvas.classList.contains("traffic-city__overflow") &&
        image instanceof HTMLCanvasElement
      )
        window.__lastPageSprite = image;
      return draw.call(this, image, ...args);
    };
  });
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
  const boatSprite = await page.evaluate(() =>
    window.__lastPageSprite.toDataURL(),
  );
  await writeFile(
    `${output}/falling-boat.png`,
    Buffer.from(boatSprite.split(",")[1], "base64"),
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
  await page.screenshot({ path: `${output}/little-milwaukee.png` });
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
  assert.equal(
    await page.getByRole("button", { name: /pause|fullscreen/i }).count(),
    0,
  );
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
  console.log(JSON.stringify({ status: "PASS", checks: 15, output }, null, 2));
} finally {
  await browser.close();
}
