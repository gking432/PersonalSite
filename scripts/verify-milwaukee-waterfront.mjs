import { revealDiscovery } from "./traffic-discovery-helpers.mjs";
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/milwaukee-waterfront";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.locator(".traffic-city").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const click = async (id) => {
    await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
    const p = await revealDiscovery(page, id);
    assert.equal(
      await page.evaluate(
        (p) => document.elementFromPoint(p.x, p.y)?.dataset.discovery,
        p,
      ),
      id,
    );
    await page.mouse.click(p.x, p.y);
  };
  const freeze = async (values) =>
    page.evaluate((values) => {
      const { sim, api } = window.__trafficCity;
      api.setEnabled(false);
      // Stop ambient and traffic clocks while inspecting exact animation milestones.
      sim.started = false;
      sim.nextArrival = sim.bridge.nextBoat = Infinity;
      sim.cars = [];
      Object.assign(sim.discoveries.active, values.active || {});
      if (values.heist !== undefined) sim.discoveries.heist.time = values.heist;
      api.refresh();
    }, values);
  const idle = await snap();
  assert.equal(idle.scene.waterfront.lakeEdge, "south");
  assert.ok(idle.scene.waterfront.museumPosition[2] > 7);
  assert.equal(idle.scene.waterfront.sailboats, 3);
  assert.deepEqual(idle.scene.waterfront.lakeRoad, {
    connected: true,
    z: 8.3,
    treeRows: 2,
  });
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  assert.equal((await snap()).started, false);
  assert.ok((await snap()).zoom > 1);
  await page
    .getByRole("button", { name: "Explore Little Milwaukee", exact: true })
    .press("+");
  const stage = await page.locator(".traffic-city__stage").boundingBox();
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -900);
  await page.keyboard.up("Control");
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().zoom === 3.2,
  );
  await page.waitForFunction(
    () => document.querySelector('[aria-label="Zoom in"]').disabled,
  );
  await page.evaluate(() => {
    window.__trafficCity.api.setEnabled(true);
    window.__trafficCity.api.reset();
  });
  const cdp = await page.context().newCDPSession(page);
  const center = {
    x: stage.x + stage.width / 2,
    y: stage.y + stage.height / 2,
  };
  const touches = (spread) =>
    [0, 1].map((i) => ({
      id: i + 1,
      x: center.x + (i ? spread : -spread),
      y: center.y,
      radiusX: 4,
      radiusY: 4,
      force: 1,
    }));
  const beforePinch = await snap();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: touches(35),
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: touches(50),
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  assert.ok((await snap()).zoom > 1.3);
  assert.equal((await snap()).pose.yaw, beforePinch.pose.yaw);
  assert.deepEqual((await snap()).discoveries.counts, {});
  await page.evaluate(() => window.__trafficCity.api.reset());
  for (const id of ["bankClock", "payphone", "manhole"]) await click(id);
  assert.equal((await snap()).discoveries.heist.running, true);
  assert.equal((await snap()).discoveries.heist.plays, 1);
  await freeze({ heist: 5.2 });
  assert.equal((await snap()).scene.heist.maskedFigures, 3);
  await page.screenshot({ path: `${output}/heist-arrival.png` });
  await freeze({ heist: 11.1 });
  assert.equal((await snap()).scene.heist.maskedFigures, 3);
  await freeze({ heist: 12.7 });
  assert.ok((await snap()).scene.heist.manholeOpen);
  await freeze({ heist: 20 });
  assert.equal((await snap()).scene.heist.policeCars, 3);
  assert.equal((await snap()).scene.heist.newsVan, true);
  assert.equal((await snap()).scene.heist.phase, "investigation");
  assert.deepEqual((await snap()).signals, idle.signals);
  await page.screenshot({ path: `${output}/police-news.png` });
  await freeze({ heist: 33.9 });
  assert.equal((await snap()).scene.heist.phase, "investigation");
  await freeze({ heist: 34.1 });
  assert.equal((await snap()).scene.heist.phase, "departure");
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.discoveries.tick(9);
    api.refresh();
  });
  assert.equal((await snap()).scene.heist.running, false);
  assert.equal((await snap()).scene.heist.policeCars, 0);
  assert.equal((await snap()).scene.heist.newsVan, false);
  await click("lakeWalk");
  await click("apartmentWalk");
  await freeze({
    active: { musician: 1, helicopter: 9 },
  });
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.discoveries.tick(2.7);
    sim.discoveries.active.musician = 1;
    sim.discoveries.active.helicopter = 9;
    sim.discoveries.walkClocks.lakeWalk = 8;
    sim.discoveries.walkClocks.apartmentWalk = 8;
    api.refresh();
  });
  const active = await snap();
  assert.equal(active.scene.discoveries.notes, 3);
  assert.equal(active.scene.discoveries.helicopterPhase, "cruising");
  for (const id of ["lakeWalk", "apartmentWalk"]) {
    const a = active.scene.waterfront.walkers.find((w) => w.id === id),
      b = idle.scene.waterfront.walkers.find((w) => w.id === id);
    assert.ok(a.walking);
    assert.ok(Math.hypot(a.x - b.x, a.z - b.z) > 1);
  }
  await page.screenshot({ path: `${output}/waterfront-active.png` });
  await page.evaluate(() => {
    window.__trafficCity.api.setEnabled(true);
    window.__trafficCity.api.zoomBy(2.6);
  });
  await page.screenshot({ path: `${output}/zoomed.png` });
  await page.evaluate(() => window.__trafficCity.api.reset());
  assert.equal((await snap()).zoom, 1);
  assert.equal((await snap()).discoveries.heist.running, false);
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.spawn(0, 0);
    sim.spawn(0, 1);
    sim.cars.forEach((car, i) =>
      Object.assign(car, {
        lakeFrom: i,
        p: i ? 5 : 10,
        committed: true,
        turn: "straight",
      }),
    );
    api.refresh();
  });
  await page.screenshot({ path: `${output}/lake-road.png` });
  await page.evaluate(() => window.__trafficCity.api.reset());
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "long-edge lake",
          "connected two-way lake road and tree rows",
          "museum and sailboats",
          "zoom buttons and keyboard",
          "trackpad zoom limits",
          "two-finger pinch without incidental clicks",
          "secret sequence",
          "three masked actors",
          "manhole escape",
          "three police cars and news van",
          "15-second investigation and departure",
          "manual lights unchanged",
          "independent walkers",
          "visible musical notes",
          "helicopter circuits",
          "reset",
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
