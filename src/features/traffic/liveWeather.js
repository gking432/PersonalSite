import {
  WEATHER_URL,
  WEATHER_REFRESH,
  parseObservation,
  worldConditions,
} from "./worldConditions.js";
const CACHE_KEY = "little-milwaukee-weather-v1";
export function createLiveWeather({
  fetcher = (...args) => fetch(...args),
  now = Date.now,
  storage,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
} = {}) {
  let observation = null,
    lastFetch = 0,
    networkState = "loading",
    active = false,
    disposed = false,
    timer = null,
    request = null,
    revision = 0,
    cachedState = null,
    cachedSecond = -1;
  try {
    storage ??= globalThis.localStorage;
    const saved = JSON.parse(storage?.getItem(CACHE_KEY) || "null");
    observation = parseObservation(saved?.data, now());
    if (observation) {
      lastFetch = Number.isFinite(saved.fetchedAt)
        ? Math.min(now(), saved.fetchedAt)
        : 0;
      networkState = "current";
    }
  } catch {
    /* Storage may be unavailable in a private browser. */
  }
  function schedule() {
    clearTimer(timer);
    if (!disposed && active)
      timer = setTimer(
        refresh,
        Math.max(1000, WEATHER_REFRESH - (now() - lastFetch)),
      );
  }
  async function refresh() {
    if (disposed || !active || request) return;
    const controller = new AbortController();
    request = controller;
    const version = revision;
    const timeout = setTimer(() => controller.abort(), 8000);
    try {
      const response = await fetcher(WEATHER_URL, {
        signal: controller.signal,
        headers: { Accept: "application/geo+json" },
      });
      if (!response.ok) throw new Error("Weather temporarily unavailable");
      const data = await response.json();
      const next = parseObservation(data, now());
      if (!next) throw new Error("No recent weather observation");
      if (disposed || !active || version !== revision) return;
      observation = next;
      networkState = "current";
      try {
        storage?.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: now() }));
      } catch {
        /* A cache is optional. */
      }
    } catch {
      if (!disposed && active && version === revision)
        networkState = "unavailable";
    } finally {
      clearTimer(timeout);
      request = null;
      if (!disposed && active && version === revision) lastFetch = now();
      cachedSecond = -1;
      schedule();
    }
  }
  return {
    read() {
      const stamp = now(),
        second = Math.floor(stamp / 1000);
      if (second !== cachedSecond) {
        cachedSecond = second;
        cachedState = worldConditions(stamp, observation, networkState);
      }
      return cachedState;
    },
    setActive(value) {
      if (disposed || active === value) return;
      active = value;
      if (!active) {
        revision++;
        clearTimer(timer);
        request?.abort();
      } else if (!lastFetch || now() - lastFetch >= WEATHER_REFRESH)
        void refresh();
      else schedule();
    },
    dispose() {
      disposed = true;
      active = false;
      clearTimer(timer);
      request?.abort();
    },
  };
}
