import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import {
  revealDiscovery,
  advanceResponseTraffic,
} from "./traffic-discovery-helpers.mjs";
const output = "/tmp/milwaukee-residents";
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
  await page.goto("http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.waitForTimeout(1800);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const person = async (id) =>
    (await snap()).scene.pedestrians.people.find((p) => p.id === id);
  const freeze = () =>
    page.evaluate(() => window.__trafficCity.api.setEnabled(false));
  const advance = async (seconds) =>
    page.evaluate((seconds) => {
      const { sim, api } = window.__trafficCity;
      sim.nextArrival = sim.bridge.nextBoat = Infinity;
      for (let t = 0; t < seconds; t += 1 / 120) sim.tick(1 / 120);
      api.refresh();
    }, seconds);
  const click = async (id) => {
    await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
    const p = await revealDiscovery(page, id);
    await page.mouse.click(p.x, p.y);
    await freeze();
  };
  await page.evaluate(() => window.__trafficCity.api.zoomBy(3.2));
  for (let level = 1; level <= 4; level++) {
    await click("cityWalk");
    await advance(0.5);
    assert.equal((await person("cityWalk")).level, level);
    assert.equal((await person("cityWalk")).hits, 0);
    assert.equal((await person("cityWalk")).fall, 0);
    assert.equal((await person("cityWalk")).reactionVisible, true);
    await page.screenshot({ path: `${output}/reaction-${level}.png` });
    if (level < 4) await advance(2.2);
  }
  await advance(1.2);
  assert.equal((await person("cityWalk")).phase, "running");
  for (let hit = 1; hit <= 4; hit++) {
    await click("cityWalk");
    await advance(0.23);
    await revealDiscovery(page, "cityWalk");
    const state = await person("cityWalk");
    assert.equal(state.hits, hit);
    assert.equal(state.health, (4 - hit) / 4);
    assert.equal(state.healthVisible, true);
    assert.ok(state.fall > 1.2);
    await page.screenshot({ path: `${output}/escape-hit-${hit}.png` });
    if (hit < 4) await advance(1.05);
  }
  assert.equal((await person("cityWalk")).phase, "down");
  await advanceResponseTraffic(page, "ambulance-arrived");
  assert.equal((await snap()).scene.pedestrians.rescue.phase, "approaching");
  await page.screenshot({ path: `${output}/ambulance.png` });
  const job = await page.evaluate(
    () => window.__trafficCity.sim.discoveries.pedestrians.rescue,
  );
  await advance(job.pickup - job.time + 0.3);
  assert.equal((await person("cityWalk")).phase, "carried");
  await page.screenshot({ path: `${output}/pickup.png` });
  await advanceResponseTraffic(page, "ambulance-done");
  assert.equal((await snap()).scene.pedestrians.pickups, 1);
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.setEnabled(true);
  });
  await click("balconyResident");
  await advance(1.3);
  assert.equal((await snap()).scene.balcony.phase, "inhaling");
  assert.ok((await snap()).scene.balcony.ember > 1);
  await page.evaluate(() => {
    const { api } = window.__trafficCity;
    api.setEnabled(true);
    api.zoomBy(2.5);
    api.setEnabled(false);
  });
  await page.screenshot({ path: `${output}/balcony-drag.png` });
  await advance(2.4);
  assert.equal((await snap()).scene.balcony.phase, "exhaling");
  assert.ok((await snap()).scene.balcony.smoke > 0);
  await page.screenshot({ path: `${output}/balcony-smoke.png` });
  await advance(3);
  assert.equal((await snap()).scene.balcony.phase, "sitting");
  assert.equal((await snap()).scene.balcony.smoke, 0);
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.setEnabled(true);
  });
  // Sound is direct-click-only, brief, and never layers repeat clicks.
  assert.equal((await snap()).phoneAudio.plays, 0);
  const phone = await revealDiscovery(page, "payphone");
  await page.mouse.click(phone.x, phone.y);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().phoneAudio.plays === 1,
  );
  assert.ok((await snap()).phoneAudio.voices > 0);
  await page.mouse.click(phone.x, phone.y);
  assert.equal((await snap()).phoneAudio.plays, 1);
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().phoneAudio.voices === 0,
  );
  await page.screenshot({ path: `${output}/rear-payphone.png` });
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.setEnabled(true);
    window.__trafficCity.api.start();
  });
  await page.waitForFunction(() => window.__trafficCity.snapshot().page?.ready);
  await freeze();
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.cars = [];
    sim.nextArrival = sim.bridge.nextBoat = Infinity;
    sim.spawn(3);
    Object.assign(sim.cars[0], {
      p: -5.94,
      turn: "straight",
      speed: 0,
      committed: true,
    });
    api.refresh();
  });
  await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
  await page
    .getByRole("button", { name: "Open the bridge", exact: true })
    .click();
  await page.waitForFunction(
    () => window.__trafficCity.snapshot().page.escaped > 0,
  );
  assert.ok((await snap()).bridge.lift > 0);
  await page.screenshot({ path: `${output}/bridge-launch.png` });
  await page.evaluate(() => window.__trafficCity.api.reset());
  assert.equal((await snap()).scene.pedestrians.pickups, 0);
  assert.equal((await snap()).scene.balcony.phase, "sitting");
  assert.equal((await snap()).phoneAudio.voices, 0);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "four escalating gestures",
          "running, stumbling and health",
          "ambulance arrival and stretcher pickup",
          "balcony drag, ember and smoke",
          "rear payphone and brief ring",
          "loaded bridge launches car",
          "reset and no browser errors",
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
