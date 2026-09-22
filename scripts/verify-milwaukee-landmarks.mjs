import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { revealDiscovery } from "./traffic-discovery-helpers.mjs";
const output = "/tmp/milwaukee-landmarks";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.waitForTimeout(1800);
  const snap = () => page.evaluate(() => window.__trafficCity.snapshot());
  const freeze = () =>
    page.evaluate(() => window.__trafficCity.api.setEnabled(false));
  const advance = (seconds) =>
    page.evaluate((seconds) => {
      const { sim, api } = window.__trafficCity;
      for (let t = 0; t < seconds; t += 1 / 120) sim.tick(1 / 120);
      api.refresh();
    }, seconds);
  async function frame(id, zoom = 3.2) {
    await page.evaluate((zoom) => {
      const { api, sim } = window.__trafficCity;
      api.setEnabled(true);
      api.reset();
      api.zoomBy(zoom);
      sim.nextArrival = sim.bridge.nextBoat = Infinity;
    }, zoom);
    const p = await page.evaluate(
      (id) => window.__trafficCity.discoveryTargets().find((t) => t.id === id),
      id,
    );
    await page.mouse.move(1100, 500);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(1100 + 1080 - p.x, 500 + 490 - p.y, { steps: 8 });
    await page.mouse.up({ button: "right" });
    await freeze();
  }
  async function click(id) {
    await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
    const p = await revealDiscovery(page, id);
    await page.mouse.click(p.x, p.y);
    await freeze();
    assert.equal((await snap()).discoveries.counts[id], 1);
  }
  await frame("pigeons");
  await page.screenshot({ path: `${output}/public-market.png` });
  const outfits = new Set(
    (await snap()).scene.pedestrians.people.map((p) => p.outfit),
  );
  assert.ok(outfits.size >= 6);
  assert.match(
    (await snap()).scene.pedestrians.paramedicUniform,
    /EMS.*reflective/,
  );
  await click("pigeons");
  await advance(1.5);
  await page.screenshot({ path: `${output}/market-pigeons.png` });
  for (const id of ["clockTower", "fonz", "gertie", "sailboat1"]) {
    await frame(id);
    await click(id);
    await advance(id === "gertie" ? 2 : 1.5);
    const s = await snap();
    assert.ok(s.discoveries.busy.includes(id));
    if (id === "fonz") assert.ok(s.scene.thirdWard.fonz);
    if (id === "gertie") assert.equal(s.scene.thirdWard.ducks, 6);
    if (id === "sailboat1") assert.ok(s.scene.waterfront.sailing[1].active);
    await page.screenshot({ path: `${output}/${id}.png` });
    await advance(13);
    assert.ok(!(await snap()).discoveries.busy.includes(id));
  }
  await frame("hop", 2.7);
  await click("hop");
  await page.evaluate(() => {
    const { sim } = window.__trafficCity;
    sim.signals.water.color = sim.signals.wisconsin.color = "green";
  });
  let opened = false;
  for (let i = 0; i < 25; i++) {
    await advance(0.5);
    if ((await snap()).hop.doors > 0.6) {
      opened = true;
      break;
    }
  }
  assert.ok(opened, "The Hop must stop and open its doors");
  assert.equal((await snap()).scene.streetcars, 1);
  await page.screenshot({ path: `${output}/broadway-and-hop.png` });
  await advance(80);
  assert.ok((await snap()).hop.stops >= 4);
  await frame("fisherman", 2.7);
  await page.evaluate(() => {
    const { sim, api } = window.__trafficCity;
    sim.bridge.boats = [1, 2, 3, 4, 5].map((id, i) => ({
      id,
      direction: 1,
      p: -3 - i * 2,
      waited: 0,
      nextToot: 7,
    }));
    api.refresh();
  });
  const paints = new Set((await snap()).scene.boats.map((b) => b.paint));
  assert.equal(paints.size, 3);
  assert.ok(paints.has("467c9a") && paints.has("bd5e4b"));
  await page.screenshot({ path: `${output}/riverboat-colors.png` });
  await page.evaluate(() => window.__trafficCity.api.reset());
  assert.equal((await snap()).hop.carId, null);
  assert.equal((await snap()).scene.streetcars, 0);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "Public Market and pigeon interaction",
          "clock, Fonz and duck clicks",
          "sailboat click and recovery",
          "six pedestrian outfits and EMS uniform",
          "Hop full circuits and working doors",
          "three riverboat colors",
          "reset and browser console",
        ],
        screenshots: output,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
