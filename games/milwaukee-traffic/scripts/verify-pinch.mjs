import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5194/");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map(([id, x, y]) => ({ id, x, y })),
    });
  const pose = () => page.evaluate(() => window.__trafficCity.snapshot().pose);
  const gesture = async (from, to, cancel = false) => {
    await touch("touchStart", from);
    await touch("touchMove", to);
    await touch(cancel ? "touchCancel" : "touchEnd", []);
  };
  const baseline = await pose();
  await touch("touchStart", [
    [1, 145, 320],
    [2, 245, 320],
  ]);
  await touch("touchMove", [
    [1, 85, 320],
    [2, 305, 320],
  ]);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().pose.zoom > 2.19,
  );
  const zoomed = await pose();
  assert.ok(Math.abs(zoomed.zoom - 2.2) < 0.02);
  assert.equal(zoomed.yaw, baseline.yaw);
  assert.equal(zoomed.pitch, baseline.pitch);
  // Lifting one finger should smoothly return to rotation without a jump.
  await touch("touchEnd", [[2, 305, 320]]);
  const lifted = await pose();
  assert.deepEqual(lifted, zoomed);
  await touch("touchMove", [[1, 105, 320]]);
  await page.waitForFunction(
    (yaw) => window.__trafficCity.snapshot().pose.yaw > yaw,
    lifted.yaw,
  );
  assert.ok((await pose()).yaw > lifted.yaw);
  assert.equal((await pose()).zoom, zoomed.zoom);
  await touch("touchEnd", []);

  await gesture(
    [
      [1, 180, 300],
      [2, 200, 300],
    ],
    [
      [1, 50, 300],
      [2, 340, 300],
    ],
  );
  assert.equal((await pose()).zoom, 4);
  await gesture(
    [
      [1, 50, 300],
      [2, 340, 300],
    ],
    [
      [1, 190, 300],
      [2, 200, 300],
    ],
    true,
  );
  assert.equal((await pose()).zoom, 0.65);
  await gesture(
    [
      [1, 145, 320],
      [2, 245, 320],
    ],
    [
      [1, 118, 320],
      [2, 272, 320],
    ],
  );
  const normal = await pose();
  assert.ok(normal.zoom > 0.99 && normal.zoom < 1.02);

  // Start a pinch directly on a signal: never flip it on finger release.
  const signal = page
    .locator('.traffic-city__signal[data-axis="water"]')
    .first();
  const box = await signal.boundingBox();
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const beforeLight = await signal.getAttribute("aria-label");
  const beforeSignalZoom = (await pose()).zoom;
  await touch("touchStart", [[1, x, y]]);
  await touch("touchMove", [[1, x + 1, y]]);
  await touch("touchStart", [
    [1, x + 1, y],
    [2, x + 55, y],
  ]);
  await touch("touchMove", [
    [1, x - 15, y],
    [2, x + 75, y],
  ]);
  await touch("touchEnd", []);
  assert.ok((await pose()).zoom > beforeSignalZoom * 1.5);
  assert.equal(await signal.getAttribute("aria-label"), beforeLight);
  await signal.tap();
  assert.notEqual(await signal.getAttribute("aria-label"), beforeLight);

  await page.getByRole("button", { name: "Pause traffic", exact: true }).tap();
  const pausedZoom = (await pose()).zoom;
  await gesture(
    [
      [1, 145, 300],
      [2, 245, 300],
    ],
    [
      [1, 120, 300],
      [2, 270, 300],
    ],
  );
  const paused = await page.evaluate(() => window.__trafficCity.snapshot());
  assert.equal(paused.paused, true);
  assert.ok(paused.pose.zoom > pausedZoom);
  await page.setViewportSize({ width: 844, height: 390 });
  assert.equal((await pose()).zoom, paused.pose.zoom);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Reset traffic", exact: true }).tap();
  assert.equal((await pose()).zoom, 1);
  assert.deepEqual(errors, []);
  assert.equal(await page.evaluate(() => visualViewport.scale), 1);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "native two-touch zoom without rotation or browser-page zoom",
          "single-finger rotation after pinch",
          "zoom limits and cancellation recovery",
          "pinch on a light does not toggle it; next tap still works",
          "zoom while paused and across screen rotation",
          "reset restores original framing; no browser errors",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
