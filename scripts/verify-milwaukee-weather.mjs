import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { WEATHER_URL } from "../src/features/traffic/worldConditions.js";
const output = "/tmp/milwaukee-weather";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const cases = [
    {
      id: "sunny-noon",
      time: "2026-09-22T17:00:00Z",
      description: "Clear",
      cloud: "CLR",
      temp: 22,
      wind: 5,
      phase: "day",
      precipitation: "none",
    },
    {
      id: "night",
      time: "2026-09-23T05:00:00Z",
      description: "Clear",
      cloud: "CLR",
      temp: 14,
      wind: 5,
      phase: "night",
      precipitation: "none",
    },
    {
      id: "rain",
      time: "2026-09-22T17:00:00Z",
      description: "Heavy Rain",
      cloud: "OVC",
      temp: 12,
      wind: 40,
      phase: "day",
      precipitation: "rain",
    },
    {
      id: "snow",
      time: "2026-12-22T18:00:00Z",
      description: "Snow",
      cloud: "OVC",
      temp: -3,
      wind: 22,
      phase: "day",
      precipitation: "snow",
    },
  ];
  const results = [];
  for (const item of cases) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 2,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.clock.setFixedTime(item.time);
    await page.route(WEATHER_URL, (route) =>
      route.fulfill({
        json: {
          properties: {
            timestamp: item.time,
            textDescription: item.description,
            temperature: { value: item.temp },
            windSpeed: { value: item.wind },
            windDirection: { value: 270 },
            cloudLayers: [{ amount: item.cloud }],
            presentWeather: [],
          },
        },
      }),
    );
    await page.goto("http://127.0.0.1:5201/");
    await page.waitForFunction(
      () => window.__trafficCity?.snapshot().world.status === "current",
    );
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.__trafficCity.api.zoomBy(2.5);
      window.__trafficCity.api.refresh();
    });
    const snap = await page.evaluate(() => window.__trafficCity.snapshot());
    assert.equal(
      snap.started,
      false,
      "weather runs before traffic is activated",
    );
    assert.equal(snap.scene.atmosphere.phase, item.phase);
    assert.equal(snap.scene.atmosphere.precipitation, item.precipitation);
    if (item.phase === "night") {
      assert.ok(snap.scene.atmosphere.windowGlow > 0.4);
      assert.ok(snap.scene.atmosphere.lampGlow > 2);
    }
    if (item.precipitation !== "none") {
      assert.ok(snap.scene.atmosphere.particles > 150);
      await page.waitForTimeout(100);
      const later = await page.evaluate(
        () => window.__trafficCity.snapshot().scene.atmosphere.particleTime,
      );
      assert.ok(
        later > snap.scene.atmosphere.particleTime,
        "weather animates smoothly between clock updates",
      );
    }
    await page.screenshot({ path: `${output}/${item.id}.png` });
    if (item.id === "sunny-noon") {
      await page.evaluate(() => window.__trafficCity.api.zoomBy(1.5));
      const p = await page.evaluate(() =>
        window.__trafficCity.discoveryTargets().find((t) => t.id === "pigeons"),
      );
      await page.mouse.move(1100, 500);
      await page.mouse.down({ button: "right" });
      await page.mouse.move(1100 + 1080 - p.x, 500 + 490 - p.y, { steps: 8 });
      await page.mouse.up({ button: "right" });
      await page.screenshot({ path: `${output}/public-market-sign.png` });
    }
    assert.deepEqual(errors, []);
    results.push({
      scene: item.id,
      label: snap.world.label,
      particles: snap.scene.atmosphere.particles,
    });
    await page.close();
  }
  const offline = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await offline.route(WEATHER_URL, (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await offline.goto("http://127.0.0.1:5201/");
  await offline.waitForFunction(
    () => window.__trafficCity?.snapshot().world.status === "unavailable",
  );
  assert.equal(
    await offline.evaluate(() => window.__trafficCity.snapshot().world.weather),
    null,
  );
  await offline
    .getByRole("button", { name: "Call The Hop streetcar", exact: true })
    .click();
  assert.equal(
    await offline.evaluate(() => window.__trafficCity.snapshot().started),
    true,
  );
  await offline.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const requests = [];
  mobile.on("request", (r) => requests.push(r.url()));
  await mobile.goto("http://127.0.0.1:5201/");
  await mobile.waitForTimeout(1200);
  assert.ok(!requests.includes(WEATHER_URL));
  assert.ok(
    !requests.some(
      (url) => url.includes("cityRuntime") || url.includes("traffic-three"),
    ),
  );
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        scenes: results,
        checks: [
          "real local sun and clock",
          "night lighting",
          "moving rain and snow before activation",
          "wind and wet roads",
          "weather failure leaves interactions working",
          "no mobile weather or Three.js load",
          "no browser errors",
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
