import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const output = "/tmp/little-milwaukee-site";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.MILWAUKEE_SITE_URL || "http://127.0.0.1:5202/");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  assert.equal((await snap()).started, false);
  assert.ok((await snap()).scene.layout.width >= 390);
  assert.equal(await page.locator(".studio-hero").count(), 0);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth),
    390,
  );
  await page
    .getByRole("button", {
      name: "Wisconsin Avenue westbound light: red",
      exact: true,
    })
    .tap();
  assert.equal((await snap()).started, true);
  assert.deepEqual((await snap()).signals, {
    water: "green",
    wisconsin: "green",
  });
  await page
    .getByRole("button", { name: "Open the bridge", exact: true })
    .tap();
  assert.equal((await snap()).bridge.requestedOpen, true);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map(([x, y], id) => ({
        x,
        y,
        id,
        radiusX: 2,
        radiusY: 2,
      })),
    });
  await touch("touchStart", [
    [140, 400],
    [240, 400],
  ]);
  await touch("touchMove", [
    [100, 400],
    [280, 400],
  ]);
  await touch("touchEnd", []);
  assert.ok((await snap()).pose.zoom > 1.5, "two-finger pinch zooms the city");
  const beforePan = (await snap()).pose;
  await touch("touchStart", [
    [120, 430],
    [240, 430],
  ]);
  await touch("touchMove", [
    [150, 450],
    [270, 450],
  ]);
  await touch("touchEnd", []);
  assert.notEqual((await snap()).pose.panX, beforePan.panX);
  const beforeRotate = (await snap()).pose;
  await touch("touchStart", [[180, 460]]);
  await touch("touchMove", [[230, 480]]);
  await touch("touchEnd", []);
  assert.notEqual((await snap()).pose.yaw, beforeRotate.yaw);
  assert.equal((await snap()).bridge.requestedOpen, true);
  await page.screenshot({ path: `${output}/phone-zoomed.png` });
  await page.getByRole("button", { name: "Reset traffic", exact: true }).tap();
  assert.equal((await snap()).started, false);
  assert.equal((await snap()).pose.zoom, 1);
  assert.deepEqual((await snap()).signals, {
    water: "green",
    wisconsin: "red",
  });
  await page.screenshot({ path: `${output}/phone.png` });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.layout.width === 844,
  );
  await page.screenshot({ path: `${output}/landscape.png` });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().scene.layout.width === 1440,
  );
  await page.screenshot({ path: `${output}/desktop.png` });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "phone city rendering",
          "no horizontal overflow",
          "independent light tap",
          "bridge tap",
          "two-finger pinch",
          "two-finger pan",
          "one-finger rotation",
          "reset",
          "landscape and desktop fit",
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
