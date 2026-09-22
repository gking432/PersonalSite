import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { WEATHER_URL } from "../src/features/traffic/worldConditions.js";

const output = "/tmp/milwaukee-lighting";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  let time = "2026-09-23T05:00:00Z";
  await page.clock.setFixedTime(time);
  await page.route(WEATHER_URL, (route) =>
    route.fulfill({
      json: {
        properties: {
          timestamp: time,
          textDescription: "Clear",
          temperature: { value: 15 },
          windSpeed: { value: 5 },
          windDirection: { value: 180 },
          cloudLayers: [{ amount: "CLR" }],
          presentWeather: [],
        },
      },
    }),
  );
  await page.goto(process.env.TRAFFIC_TEST_URL || "http://127.0.0.1:5201/");
  await page.waitForFunction(
    () => window.__trafficCity?.snapshot().world.status === "current",
  );
  await page.waitForTimeout(1800);
  const snapshot = () => page.evaluate(() => window.__trafficCity.snapshot());
  const lights = () => snapshot().then((s) => s.scene.lighting.buildings);
  let s = await snapshot();
  assert.equal(s.started, false, "lighting and stars run before activation");
  assert.equal(s.scene.lighting.buildings.length, 22);
  assert.equal(s.scene.lighting.streetLamps, 19);
  assert.ok(
    s.scene.lighting.buildings.every(
      (b) => b.on && b.windowMaterials > 0 && b.exteriorLights === 4,
    ),
  );
  assert.ok(s.scene.sky.stars > 70);
  await page.screenshot({ path: `${output}/night.png` });

  // Every building has a separate switch, including nonstandard landmark models.
  const ids = (await lights()).map((b) => b.id);
  for (const id of ids) {
    await page.evaluate(
      (id) => window.__trafficCity.api.toggleBuilding(id),
      id,
    );
    const state = await lights();
    assert.equal(
      state.find((b) => b.id === id).on,
      false,
      `${id} switches off at night`,
    );
    assert.ok(
      state.filter((b) => b.id !== id).every((b) => b.on),
      "neighboring buildings stay lit",
    );
    await page.evaluate(
      (id) => window.__trafficCity.api.toggleBuilding(id),
      id,
    );
  }
  await page.evaluate(() => window.__trafficCity.api.reset());
  await page
    .getByRole("button", { name: "Milwaukee Art Museum lights", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  assert.equal(
    (await lights()).find((b) => b.id === "museum").on,
    false,
    "keyboard switch works",
  );

  // Click actual roof geometry, rather than an overlay or a debug switch.
  const target = await page.evaluate(() =>
    window.__trafficCity.buildingTargets().find((b) => b.id === "building-18"),
  );
  await page.mouse.click(target.x, target.y + 3);
  assert.equal(
    (await lights()).find((b) => b.id === "building-18").on,
    false,
    "clicking an apartment roof toggles it",
  );
  const beforeDrag = (await lights()).map((b) => b.override);
  await page.mouse.move(target.x, target.y + 3);
  await page.mouse.down();
  await page.mouse.move(target.x + 65, target.y + 8, { steps: 8 });
  await page.mouse.up();
  assert.deepEqual(
    (await lights()).map((b) => b.override),
    beforeDrag,
    "swiveling never toggles a building",
  );
  await page.evaluate(() => window.__trafficCity.api.reset());
  await page
    .getByRole("button", {
      name: "Switch the Iron Block’s window lights",
      exact: true,
    })
    .click();
  assert.equal((await lights()).find((b) => b.id === "iron-block").on, false);
  assert.equal(
    (await snapshot()).discoveries.windows,
    false,
    "existing window discovery shares the building state",
  );
  await page
    .getByRole("button", { name: "Fly the rooftop helicopter", exact: true })
    .click();
  assert.ok(
    (await snapshot()).discoveries.counts.helicopter > 0,
    "rooftop discovery still receives its click",
  );

  // A manual night override survives the automatic day transition.
  await page.evaluate(() => window.__trafficCity.api.toggleBuilding("museum"));
  for (const item of [
    ["dawn", "2026-09-22T12:00:00Z"],
    ["day", "2026-09-22T17:00:00Z"],
    ["dusk", "2026-09-22T23:35:00Z"],
  ]) {
    time = item[1];
    await page.clock.setFixedTime(time);
    await page.evaluate(() => window.__trafficCity.api.refresh());
    s = await snapshot();
    assert.equal(s.scene.sky.phase, item[0]);
    assert.equal(
      s.scene.lighting.buildings.find((b) => b.id === "museum").on,
      false,
    );
    if (item[0] === "day") {
      assert.equal(s.scene.sky.stars, 0);
      assert.ok(
        s.scene.lighting.buildings
          .filter((b) => b.override === null)
          .every((b) => !b.on),
      );
    }
    await page.screenshot({ path: `${output}/${item[0]}.png` });
  }
  await page.evaluate(() => {
    window.__trafficCity.api.reset();
    window.__trafficCity.api.zoomBy(2.5);
  });
  await page.screenshot({ path: `${output}/dusk-zoom.png` });
  assert.ok(
    (await lights()).every((b) => b.override === null),
    "reset restores automatic lighting",
  );
  const masks = await page.evaluate(() => {
    const sky = document.querySelector(".traffic-city__sky"),
      webgl = sky.nextElementSibling;
    const ctx = sky.getContext("2d");
    return {
      same:
        getComputedStyle(sky).maskImage === getComputedStyle(webgl).maskImage,
      masked: getComputedStyle(sky).maskImage !== "none",
      alpha: [
        ctx.getImageData(0, 0, 1, 1).data[3],
        ctx.getImageData(sky.width - 1, sky.height - 1, 1, 1).data[3],
      ],
    };
  });
  assert.equal(
    masks.same && masks.masked,
    true,
    "sky respects the exact same text halos as the city",
  );
  assert.ok(
    masks.alpha.every((a) => a < 2),
    "sky disappears at canvas edges",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        buildings: ids.length,
        phases: ["night", "dawn", "day", "dusk"],
        checks: [
          "independent interior/exterior switches",
          "actual roof click",
          "keyboard switch",
          "drag suppression",
          "window and helicopter discoveries",
          "manual overrides across day changes",
          "reset",
          "matching text mask",
          "transparent sky edges",
          "no runtime errors",
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
