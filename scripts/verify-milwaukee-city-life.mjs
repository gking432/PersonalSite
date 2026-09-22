import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const output = "/tmp/milwaukee-city-life";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.locator(".traffic-city").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const targets = () =>
    page.evaluate(() => window.__trafficCity.discoveryTargets());
  const click = async (id) => {
    await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
    const p = (await targets()).find((p) => p.id === id);
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
      if (values.heist !== undefined) sim.discoveries.heist.time = values.heist;
      if (values.active) Object.assign(sim.discoveries.active, values.active);
      api.refresh();
    }, values);
  const initial = await snap();
  await page.waitForTimeout(500);
  const walking = await snap();
  assert.equal(walking.started, false);
  assert.equal(walking.cars, 0);
  assert.notDeepEqual(
    walking.scene.waterfront.walkers.find((w) => w.id === "lakeWalk"),
    initial.scene.waterfront.walkers.find((w) => w.id === "lakeWalk"),
  );
  assert.equal(
    walking.scene.waterfront.walkers.filter((w) => w.seated).length,
    2,
  );
  await click("lakeWalk");
  await freeze({ active: { lakeWalk: 1 } });
  assert.ok(
    (await snap()).scene.waterfront.walkers.find((w) => w.id === "lakeWalk")
      .fall > 1,
  );
  await page.screenshot({ path: `${output}/pedestrian-stumble.png` });
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.discoveries.tick(3.3);
    api.refresh();
  });
  assert.equal(
    (await snap()).scene.waterfront.walkers.find((w) => w.id === "lakeWalk")
      .fall,
    0,
  );
  await click("lakeBench");
  await freeze({ active: { lakeBench: 6 } });
  assert.ok(
    (await snap()).scene.waterfront.walkers.find((w) => w.id === "lakeBench")
      .walking,
  );
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.discoveries.tick(21);
    api.refresh();
  });
  assert.ok(
    (await snap()).scene.waterfront.walkers.find((w) => w.id === "lakeBench")
      .seated,
  );
  await page.evaluate(() => {
    const { api } = window.__trafficCity;
    api.setEnabled(true);
    api.reset();
    api.zoomBy(100);
  });
  assert.equal((await snap()).zoom, 3.2);
  const stage = await page.locator(".traffic-city__stage").boundingBox();
  const before = await snap();
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(
    stage.x + stage.width / 2 + 90,
    stage.y + stage.height / 2 + 30,
    { steps: 8 },
  );
  await page.mouse.up({ button: "right" });
  const after = await snap();
  assert.equal(after.pose.yaw, before.pose.yaw);
  assert.notEqual(after.pose.panX, before.pose.panX);
  assert.notEqual(after.pose.panY, before.pose.panY);
  assert.deepEqual(after.discoveries.counts, {});
  const mask = await page
    .locator(".traffic-city__model canvas")
    .evaluate((canvas) => getComputedStyle(canvas).maskImage);
  assert.ok(mask.includes("data:image/png"));
  await page.screenshot({ path: `${output}/zoom-and-pan.png` });
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    stage.x + stage.width / 2 + 30,
    stage.y + stage.height / 2,
    { steps: 4 },
  );
  await page.mouse.up();
  assert.notEqual((await snap()).pose.yaw, after.pose.yaw);
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.zoomBy(2.7);
  });
  const fisher = (await targets()).find((p) => p.id === "fisherman");
  const dx = stage.x + stage.width * 0.5 - fisher.x,
    dy = stage.y + stage.height * 0.5 - fisher.y;
  await page.mouse.move(stage.x + 40, stage.y + stage.height * 0.5);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(stage.x + 40 + dx, stage.y + stage.height * 0.5 + dy, {
    steps: 12,
  });
  await page.mouse.up({ button: "right" });
  await click("fisherman");
  for (const [t, phase] of [
    [0.6, "casting"],
    [2.5, "waiting"],
    [4.5, "reeling"],
    [6.5, "caught"],
  ]) {
    await freeze({ active: { fisherman: t } });
    assert.equal((await snap()).scene.discoveries.fishing.phase, phase);
    await page
      .locator(".traffic-city__stage")
      .screenshot({ path: `${output}/fisherman-${phase}.png` });
  }
  assert.ok((await snap()).scene.discoveries.fishing.fishVisible);
  await page.evaluate(() => {
    window.__trafficCity.api.setEnabled(true);
    window.__trafficCity.api.reset();
  });
  for (const id of ["bankClock", "payphone", "manhole"]) await click(id);
  await freeze({ heist: 12 });
  assert.ok((await snap()).scene.heist.driverBoarding);
  await freeze({ heist: 13 });
  assert.ok((await snap()).scene.heist.getawayMoving);
  assert.equal((await snap()).scene.heist.policeCars, 0);
  await page.screenshot({ path: `${output}/split-escape.png` });
  await freeze({ heist: 14.3 });
  assert.equal((await snap()).scene.heist.getawayVisible, false);
  assert.equal((await snap()).scene.heist.escapedThroughManhole, 2);
  await freeze({ heist: 15.2 });
  const response = (await snap()).scene.heist;
  assert.equal(response.policeCars, 3);
  assert.deepEqual(response.policeApproaches, ["north", "east", "lakefront"]);
  for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 3; j++)
      assert.ok(
        Math.hypot(
          response.policePositions[i][0] - response.policePositions[j][0],
          response.policePositions[i][2] - response.policePositions[j][2],
        ) > 3,
      );
  await page.screenshot({ path: `${output}/police-rush.png` });
  await freeze({ heist: 20 });
  assert.equal((await snap()).scene.heist.phase, "investigation");
  assert.equal((await snap()).scene.heist.newsVan, true);
  await freeze({ heist: 33.9 });
  assert.equal((await snap()).scene.heist.phase, "investigation");
  await freeze({ heist: 34.1 });
  assert.equal((await snap()).scene.heist.phase, "departure");
  await page.evaluate(() => {
    window.__trafficCity.api.setEnabled(true);
    window.__trafficCity.api.reset();
  });
  const final = await snap();
  assert.equal(final.zoom, 1);
  assert.equal(final.pose.panX, 0);
  assert.equal(final.started, false);
  assert.deepEqual(final.signals, initial.signals);
  assert.deepEqual(errors, []);
  await page.screenshot({ path: `${output}/idle.png` });
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "ambient pedestrians before traffic",
          "moving click targets",
          "stumble and recovery",
          "sitters stand and return",
          "3.2x zoom",
          "right-drag pan and normal drag rotation",
          "content-shaped text halos",
          "visible casting, reeling and fish",
          "driver boards and speeds away before police",
          "two manhole escapes",
          "three separate police approaches",
          "15-second investigation",
          "reset and unchanged manual lights",
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
