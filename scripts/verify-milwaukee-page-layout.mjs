import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/milwaukee-page-layout";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.waitForTimeout(2000);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const drag = async (dx, dy, button = "left", shift = false) => {
    if (shift) await page.keyboard.down("Shift");
    await page.mouse.move(1080, 560);
    await page.mouse.down({ button });
    await page.mouse.move(1080 + dx, 560 + dy, { steps: 10 });
    await page.mouse.up({ button });
    if (shift) await page.keyboard.up("Shift");
  };
  const maskPixels = () =>
    page.evaluate(async () => {
      const host = document.querySelector(".traffic-city__model");
      const url = getComputedStyle(host)
        .getPropertyValue("--city-content-mask")
        .trim()
        .slice(5, -2);
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const alpha = (x, y) =>
        ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data[3];
      const box = window.__trafficCity.snapshot().scene.layout.halos[0];
      return {
        text: alpha(box.x + box.width / 2, box.y + box.height / 2),
        feather: alpha(box.x + box.width + 18, box.y + box.height / 2),
        open: alpha(image.width - 80, 100),
        width: image.width,
        canvasWidth: host.clientWidth,
        stageWidth: document.querySelector(".traffic-city__stage").clientWidth,
      };
    });
  const pixels = await maskPixels();
  assert.equal(pixels.text, 0);
  assert.ok(pixels.feather > 0 && pixels.feather < 255, JSON.stringify(pixels));
  assert.equal(pixels.open, 255);
  assert.ok(pixels.width > pixels.stageWidth * 2);
  assert.equal(pixels.width, pixels.canvasWidth);
  assert.ok((await snap()).scene.opaqueMaterials > 30);
  assert.deepEqual(
    await page.evaluate(() => window.__trafficCity.inspectLandmarks()),
    [
      { id: "payphone", unobstructed: false },
      { id: "manhole", unobstructed: true },
    ],
  );
  await page.evaluate(() => window.__trafficCity.api.zoomBy(3.2));
  const before = await snap();
  await drag(50, 10);
  const swivel = await snap();
  assert.notEqual(swivel.pose.yaw, before.pose.yaw);
  assert.equal(swivel.pose.panX, before.pose.panX);
  await drag(-80, 40, "right");
  const pan = await snap();
  assert.equal(pan.pose.yaw, swivel.pose.yaw);
  assert.notEqual(pan.pose.panX, swivel.pose.panX);
  await drag(20, 0, "left", true);
  assert.equal((await snap()).pose.yaw, pan.pose.yaw);
  assert.notEqual((await snap()).pose.panX, pan.pose.panX);
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.zoomBy(3.2);
  });
  await page.screenshot({ path: `${output}/text-bubbles.png` });
  // All actual website links still receive pointer hits above the canvas.
  for (const name of ["Read the CRM case study", "All projects"]) {
    assert.ok(
      await page.getByRole("link", { name, exact: true }).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    );
  }
  // Trigger real crossing collisions, first in view, then behind a text halo.
  const collide = async () => {
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
      () => window.__trafficCity.snapshot().crashes === 1,
    );
    await page.waitForTimeout(1100);
  };
  await page.evaluate(() => window.__trafficCity.api.reset());
  await collide();
  assert.ok((await snap()).page.escaped >= 2);
  await page.waitForFunction(() => window.__trafficCity.snapshot().page.ready);
  assert.equal((await snap()).page.heroSurfaces, 0);
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.zoomBy(3.2);
  });
  // The first intersection projects behind the headline after this right-drag.
  const target = await page.evaluate(() => {
    const t = window.__trafficCity.targets();
    return {
      x: t.reduce((s, p) => s + p.x, 0) / t.length,
      y: t.reduce((s, p) => s + p.y, 0) / t.length,
    };
  });
  await drag(330 - target.x, 430 - target.y, "right");
  await collide();
  assert.equal((await snap()).page.escaped, 0);
  assert.equal((await snap()).scene.falling, 0);
  await page.screenshot({ path: `${output}/hidden-intersection-no-falls.png` });
  const protectedSprites = await page.evaluate(async () => {
    const { createPageCars } = await import(
      "/src/features/traffic/pageCars.js"
    );
    const host = document.querySelector(".traffic-city__model");
    const overlay = createPageCars(host);
    overlay.setEnabled(false);
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const ctx = sprite.getContext("2d");
    ctx.fillRect(0, 0, 32, 32);
    const r = host.getBoundingClientRect(),
      heading = document
        .querySelector(".studio-headline")
        .getBoundingClientRect();
    const point = { vx: 0, vy: 100, radius: 8, size: 32, sprite, spin: 0 };
    overlay.add({
      ...point,
      x: heading.left + 100 - r.left,
      y: heading.top + 40 - r.top,
    });
    const onText = overlay.snapshot().cars;
    overlay.add({ ...point, x: 1200 - r.left, y: 650 - r.top });
    const inOpenSpace = overlay.snapshot().cars;
    overlay.dispose();
    return { onText, inOpenSpace };
  });
  assert.deepEqual(protectedSprites, { onText: 0, inOpenSpace: 1 });
  await page.evaluate(() => window.__trafficCity.api.reset());
  await page.setViewportSize({ width: 900, height: 1000 });
  await page.waitForTimeout(500);
  const tablet = await maskPixels();
  assert.equal(tablet.text, 0);
  assert.equal(tablet.width, tablet.canvasWidth);
  assert.ok(tablet.width > tablet.stageWidth * 2);
  await page.screenshot({ path: `${output}/tablet.png` });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "full-width surface",
          "opaque text cores and soft halos",
          "unmasked open space",
          "solid architecture",
          "unobstructed phone and manhole",
          "normal swivel / right-drag pan / Shift-drag pan",
          "website link hits",
          "visible crash handoff",
          "hidden crash suppression",
          "no hero text collision surfaces",
          "falling sprites cannot draw over hero text",
          "responsive wrapping",
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
