import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { revealDiscovery } from "./traffic-discovery-helpers.mjs";
const output = "/tmp/milwaukee-escapes";
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
  await page.goto("http://127.0.0.1:5201");
  await page.waitForFunction(() => window.__trafficCity?.snapshot().ready);
  await page.waitForTimeout(1500);
  const snapshot = () => page.evaluate(() => window.__trafficCity.snapshot());
  const freeze = () =>
    page.evaluate(() => window.__trafficCity.api.setEnabled(false));
  const advance = (seconds) =>
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
  await page.evaluate(() => window.__trafficCity.api.zoomBy(2.5));
  await freeze();
  await page.screenshot({ path: `${output}/tower-helicopter.png` });
  assert.equal((await snapshot()).scene.discoveries.helicopterColor, "red");
  assert.equal((await snapshot()).scene.discoveries.helicopterScale, 0.72);
  // Actual clicks escalate the reaction and route this person to real cover.
  for (let level = 1; level <= 4; level++) {
    await click("pedestrianFriend");
    await advance(0.5);
    await page.screenshot({ path: `${output}/gesture-${level}.png` });
  }
  await advance(7);
  let state = await page.evaluate(
    () =>
      window.__trafficCity.sim.discoveries.pedestrians.states.pedestrianFriend,
  );
  assert.equal(state.phase, "hiding");
  const hidden = [state.x, state.z],
    replans = state.replans;
  await advance(20);
  state = await page.evaluate(
    () =>
      window.__trafficCity.sim.discoveries.pedestrians.states.pedestrianFriend,
  );
  assert.deepEqual([state.x, state.z], hidden);
  // Swivel the rendered city until the building no longer conceals the person.
  await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
  await revealDiscovery(page, "pedestrianFriend");
  await freeze();
  await advance(0.6);
  state = await page.evaluate(
    () =>
      window.__trafficCity.sim.discoveries.pedestrians.states.pedestrianFriend,
  );
  assert.equal(state.phase, "running");
  assert.ok(state.replans > replans);
  await advance(7);
  state = await page.evaluate(
    () =>
      window.__trafficCity.sim.discoveries.pedestrians.states.pedestrianFriend,
  );
  assert.equal(state.phase, "hiding");
  assert.notDeepEqual([state.x, state.z], hidden);
  await page.screenshot({ path: `${output}/new-cover.png` });
  await page.evaluate(() => window.__trafficCity.api.reset());
  await freeze();
  await click("windows");
  for (let level = 1; level <= 4; level++) {
    await click("cityWalk");
    await advance(0.5);
  }
  await advance(8);
  let refuge = (await snapshot()).scene.pedestrians.refuge;
  assert.ok(refuge.occupied);
  assert.equal(refuge.npc, "cityWalk");
  // The silhouette's real window becomes the pedestrian's click target.
  await page.evaluate(() => {
    window.__trafficCity.api.setEnabled(true);
    window.__trafficCity.api.zoomBy(3.2);
  });
  const target = await revealDiscovery(page, "cityWalk");
  const stage = await page.locator(".traffic-city__stage").boundingBox();
  await page.mouse.move(
    stage.x + stage.width * 0.7,
    stage.y + stage.height * 0.65,
  );
  await page.mouse.down({ button: "right" });
  await page.mouse.move(
    stage.x + stage.width * 0.7 + 1080 - target.x,
    stage.y + stage.height * 0.65 + 480 - target.y,
    { steps: 8 },
  );
  await page.mouse.up({ button: "right" });
  await freeze();
  await page.screenshot({ path: `${output}/occupied-window.png` });
  const close = await revealDiscovery(page, "cityWalk");
  await page.screenshot({
    path: `${output}/window-close.png`,
    clip: { x: close.x - 70, y: close.y - 100, width: 140, height: 180 },
  });
  await page.evaluate(() => window.__trafficCity.api.setEnabled(true));
  await page.mouse.click(close.x, close.y);
  await freeze();
  await advance(0.18);
  refuge = (await snapshot()).scene.pedestrians.refuge;
  assert.ok(refuge.broken);
  await page.screenshot({
    path: `${output}/broken-window.png`,
    clip: { x: close.x - 70, y: close.y - 100, width: 140, height: 180 },
  });
  await advance(3);
  assert.equal(
    await page.evaluate(
      () =>
        window.__trafficCity.sim.discoveries.pedestrians.states.cityWalk.phase,
    ),
    "retired",
  );
  // Exercise alternate escapes against the real city footprints and live vehicles.
  for (const kind of ["car", "boat", "bridge", "water"]) {
    await page.evaluate((kind) => {
      const { sim, api } = window.__trafficCity;
      api.reset();
      api.setEnabled(false);
      sim.start();
      sim.cars = [];
      sim.bridge.boats = [];
      sim.nextArrival = sim.bridge.nextBoat = Infinity;
      sim.signals.water.color = "red";
      const id =
        kind === "bridge"
          ? "pedestrians"
          : kind === "water"
            ? "lakeWalk"
            : "cityWalk";
      const point =
        kind === "car"
          ? [-1.05, -2.16]
          : kind === "boat"
            ? [-4.62, 2.3]
            : kind === "bridge"
              ? [-4.42, 1.14]
              : [6, 10.4];
      if (kind === "car") {
        sim.spawn(0);
        Object.assign(sim.cars[0], { p: -2.16, speed: 0, turn: "straight" });
      }
      if (kind === "boat") {
        sim.bridge.spawn(sim.events);
        sim.bridge.boats[0].p = -2.3;
      }
      sim.discoveries.pedestrians.states[id] = {
        phase: "running",
        level: 4,
        hits: 0,
        time: 0,
        x: point[0],
        z: point[1],
        yaw: 0,
        replans: 2,
        needsPlan: true,
      };
      api.refresh();
      for (let i = 0; i < 120; i++) {
        sim.tick(1 / 120);
        if (i % 12 === 0) api.refresh();
      }
      api.refresh();
    }, kind);
    const people = (await snapshot()).scene.pedestrians.people;
    const id =
      kind === "bridge"
        ? "pedestrians"
        : kind === "water"
          ? "lakeWalk"
          : "cityWalk";
    const person = people.find((p) => p.id === id);
    assert.equal(
      person.phase,
      kind === "bridge"
        ? "underbridge"
        : kind === "water"
          ? "swimming"
          : "riding",
      kind,
    );
    if (kind === "car") assert.equal(person.visible, false);
    if (kind === "boat") assert.equal(person.carrier.kind, "boat");
    await page.screenshot({ path: `${output}/escape-${kind}.png` });
  }
  await page.evaluate(() => {
    const { api, sim } = window.__trafficCity;
    api.reset();
    api.setEnabled(true);
    for (const id of ["bankClock", "payphone", "manhole"]) api.discover(id);
    api.setEnabled(false);
    sim.nextArrival = sim.bridge.nextBoat = Infinity;
  });
  await advance(11);
  assert.ok((await snapshot()).scene.discoveries.heistPatrol);
  assert.equal(
    (await snapshot()).scene.discoveries.helicopterPhase,
    "cruising",
  );
  await page.screenshot({ path: `${output}/heist-patrol.png` });
  await advance(65);
  assert.ok((await snapshot()).scene.discoveries.helicopterHeight > 6);
  assert.ok((await snapshot()).scene.discoveries.heistPatrol);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "red smaller helicopter and tower",
          "four billboard gestures",
          "real cover, waiting, camera-driven relocation",
          "lit-building entry and moving window silhouette",
          "exclusive broken-window easter egg",
          "live car / boat boarding, bridge shelter and lake swimming",
          "sustained heist helicopter patrol",
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
