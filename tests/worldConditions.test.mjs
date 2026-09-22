import test from "node:test";
import assert from "node:assert/strict";
import {
  milwaukeeSun,
  parseObservation,
  worldConditions,
  MAX_OBSERVATION_AGE,
  WEATHER_REFRESH,
} from "../src/features/traffic/worldConditions.js";
import { createLiveWeather } from "../src/features/traffic/liveWeather.js";
const base = Date.parse("2026-09-22T17:00:00Z");
const report = (extra = {}, time = base) => ({
  properties: {
    timestamp: new Date(time).toISOString(),
    textDescription: "Cloudy",
    temperature: { value: 14 },
    windSpeed: { value: 18 },
    windDirection: { value: 70 },
    cloudLayers: [{ amount: "OVC" }],
    presentWeather: [],
    ...extra,
  },
});
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
function fixture(fetcher) {
  let time = base,
    next = 0;
  const timers = new Map(),
    cache = new Map();
  const options = {
    now: () => time,
    fetcher,
    storage: {
      getItem: (key) => cache.get(key),
      setItem: (key, value) => cache.set(key, value),
    },
    setTimer: (fn, delay) => {
      timers.set(++next, { fn, at: time + delay });
      return next;
    },
    clearTimer: (id) => timers.delete(id),
  };
  return {
    options,
    timers,
    cache,
    async advance(ms) {
      time += ms;
      for (const [id, job] of [...timers])
        if (job.at <= time) {
          timers.delete(id);
          job.fn();
        }
      await flush();
    },
  };
}
test("Milwaukee sun follows the season, with dawn, day and night at the right local times", () => {
  assert.equal(milwaukeeSun(base).phase, "day");
  assert.equal(milwaukeeSun(Date.parse("2026-09-22T05:00:00Z")).phase, "night");
  assert.equal(milwaukeeSun(Date.parse("2026-09-22T11:50:00Z")).phase, "dawn");
  assert.ok(milwaukeeSun(Date.parse("2026-06-21T12:00:00Z")).altitude > 15);
  assert.ok(milwaukeeSun(Date.parse("2026-12-21T12:00:00Z")).altitude < -10);
  const before = worldConditions(Date.parse("2026-03-08T07:59:00Z"), null);
  const after = worldConditions(Date.parse("2026-03-08T08:01:00Z"), null);
  assert.equal(before.time, "1:59 AM");
  assert.equal(after.time, "3:01 AM");
  assert.ok(
    Math.abs(before.altitude - after.altitude) < 0.6,
    "DST must not jump the sun by an hour",
  );
});
test("observations distinguish clouds, rain and snow, while rejecting stale and malformed reports", () => {
  assert.equal(parseObservation(report(), base).precipitation, "none");
  assert.equal(
    parseObservation(
      report({ textDescription: "Partly Cloudy", cloudLayers: [] }),
      base,
    ).cloud,
    0.45,
  );
  const rain = parseObservation(
    report({ textDescription: "Light Rain" }),
    base,
  );
  assert.equal(rain.precipitation, "rain");
  assert.equal(rain.intensity, 0.35);
  const snow = parseObservation(
    report({ textDescription: "Heavy Snow" }),
    base,
  );
  assert.equal(snow.precipitation, "snow");
  assert.equal(snow.intensity, 1);
  assert.equal(
    parseObservation(report({}, base - MAX_OBSERVATION_AGE - 1), base),
    null,
  );
  assert.equal(parseObservation(report({}, base + 600000), base), null);
  assert.equal(parseObservation({}, base), null);
  const missing = parseObservation(
    report({ temperature: { value: null }, windSpeed: { value: null } }),
    base,
  );
  assert.equal(missing.temperatureC, null);
  assert.equal(missing.windKph, 0);
  assert.ok(!worldConditions(base, missing).label.includes("°F"));
});
test("weather fetches only while visible, polls every ten minutes, and reuses fresh cached reports", async () => {
  let calls = 0;
  const f = fixture(async () => {
    calls++;
    return { ok: true, json: async () => report({}, f.options.now()) };
  });
  const live = createLiveWeather(f.options);
  assert.equal(calls, 0);
  live.setActive(true);
  await flush();
  assert.equal(calls, 1);
  assert.equal(live.read().status, "current");
  assert.match(live.read().label, /57°F/);
  await f.advance(WEATHER_REFRESH - 1);
  assert.equal(calls, 1);
  await f.advance(1);
  assert.equal(calls, 2);
  live.setActive(false);
  await f.advance(WEATHER_REFRESH * 2);
  assert.equal(calls, 2);
  live.setActive(true);
  await flush();
  assert.equal(calls, 3);
  live.dispose();
  assert.equal(f.timers.size, 0);
  const cached = createLiveWeather(f.options);
  cached.setActive(true);
  await flush();
  assert.equal(calls, 3);
  assert.equal(cached.read().status, "current");
  cached.dispose();
});
test("a weather outage keeps a recent report, then expires weather without breaking the local clock", async () => {
  let fail = false;
  const f = fixture(async () => {
    if (fail) throw new Error("offline");
    return { ok: true, json: async () => report() };
  });
  const live = createLiveWeather(f.options);
  live.setActive(true);
  await flush();
  fail = true;
  await f.advance(WEATHER_REFRESH);
  assert.equal(live.read().status, "cached");
  assert.ok(live.read().weather);
  await f.advance(MAX_OBSERVATION_AGE);
  assert.equal(live.read().status, "unavailable");
  assert.equal(live.read().weather, null);
  assert.equal(live.read().phase, "day");
  live.dispose();
});
test("hide/show during a fetch cancels it and retries promptly, and disposal leaves no timers", async () => {
  let calls = 0,
    signal;
  const f = fixture((url, options) => {
    calls++;
    signal = options.signal;
    if (calls > 1)
      return Promise.resolve({ ok: true, json: async () => report() });
    return new Promise((resolve, reject) =>
      signal.addEventListener("abort", () => reject(new Error("aborted"))),
    );
  });
  const live = createLiveWeather(f.options);
  live.setActive(true);
  live.setActive(false);
  live.setActive(true);
  assert.equal(signal.aborted, true);
  await flush();
  await f.advance(1000);
  assert.equal(calls, 2);
  assert.equal(live.read().status, "current");
  live.dispose();
  assert.equal(f.timers.size, 0);
});
test("an eight-second timeout recovers without repeated requests or fabricated clear weather", async () => {
  let calls = 0;
  const f = fixture((url, { signal }) => {
    calls++;
    return new Promise((resolve, reject) =>
      signal.addEventListener("abort", () => reject(new Error("timeout"))),
    );
  });
  const live = createLiveWeather(f.options);
  live.setActive(true);
  await f.advance(8000);
  assert.equal(live.read().status, "unavailable");
  assert.equal(live.read().weather, null);
  await f.advance(9000);
  assert.equal(calls, 1);
  live.dispose();
  assert.equal(f.timers.size, 0);
});
