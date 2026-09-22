export const MILWAUKEE = {
  latitude: 43.0389,
  longitude: -87.9065,
  timeZone: "America/Chicago",
};
export const WEATHER_URL =
  "https://api.weather.gov/stations/KMKE/observations/latest";
export const MAX_OBSERVATION_AGE = 2 * 60 * 60 * 1000;
export const WEATHER_REFRESH = 10 * 60 * 1000;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const smooth = (a, b, n) => {
  const t = clamp((n - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const rad = Math.PI / 180;
const clock = new Intl.DateTimeFormat("en-US", {
  timeZone: MILWAUKEE.timeZone,
  hour: "numeric",
  minute: "2-digit",
});

// NOAA's fractional-year solar equations. UTC solar time naturally follows
// the season; the displayed civil clock uses Chicago's daylight-saving rules.
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF
export function milwaukeeSun(now) {
  const date = new Date(now),
    year = date.getUTCFullYear();
  const day = (now - Date.UTC(year, 0, 1)) / 86400000;
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const gamma = ((2 * Math.PI) / days) * (day - 0.5);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const minutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const hour = ((minutes + equation + 4 * MILWAUKEE.longitude) / 4 - 180) * rad;
  const latitude = MILWAUKEE.latitude * rad;
  const up =
    Math.sin(latitude) * Math.sin(declination) +
    Math.cos(latitude) * Math.cos(declination) * Math.cos(hour);
  const east = -Math.cos(declination) * Math.sin(hour);
  const south =
    Math.sin(latitude) * Math.cos(declination) * Math.cos(hour) -
    Math.cos(latitude) * Math.sin(declination);
  const altitude = Math.asin(clamp(up, -1, 1)) / rad;
  return {
    altitude,
    direction: [east, up, south],
    daylight: smooth(-7, 12, altitude),
    golden: smooth(-5, 0, altitude) * (1 - smooth(6, 20, altitude)),
    phase:
      altitude < -6
        ? "night"
        : altitude < 8
          ? east > 0
            ? "dawn"
            : "dusk"
          : "day",
  };
}
export function parseObservation(data, now = Date.now()) {
  const p = data?.properties,
    observedAt = Date.parse(p?.timestamp);
  if (
    !Number.isFinite(observedAt) ||
    now - observedAt > MAX_OBSERVATION_AGE ||
    observedAt > now + 5 * 60000
  )
    return null;
  const description =
    typeof p.textDescription === "string"
      ? p.textDescription.trim().slice(0, 100)
      : "";
  const present = Array.isArray(p.presentWeather) ? p.presentWeather : [];
  const text =
    `${description} ${present.map((w) => `${w.intensity || ""} ${w.weather || ""}`).join(" ")}`.toLowerCase();
  const snow = /snow|sleet|ice pellets|hail/.test(text),
    rain = /rain|drizzle|showers/.test(text);
  const precipitation = snow ? "snow" : rain ? "rain" : "none";
  const cloudAmounts = {
    CLR: 0,
    SKC: 0,
    FEW: 0.2,
    SCT: 0.45,
    BKN: 0.8,
    OVC: 1,
    VV: 1,
  };
  const layers = (Array.isArray(p.cloudLayers) ? p.cloudLayers : [])
    .map((l) => cloudAmounts[l.amount])
    .filter(Number.isFinite);
  if (!description && !layers.length && !present.length) return null;
  const cloud = layers.length
    ? Math.max(...layers)
    : /partly/.test(text)
      ? 0.45
      : /overcast|cloudy|fog|rain|snow/.test(text)
        ? 0.9
        : 0.1;
  const temp = p.temperature?.value;
  const wind = p.windSpeed?.value;
  return {
    observedAt,
    description:
      description ||
      (precipitation === "none"
        ? "Current conditions"
        : precipitation === "snow"
          ? "Snow"
          : "Rain"),
    cloud,
    precipitation,
    intensity:
      precipitation === "none"
        ? 0
        : /heavy/.test(text)
          ? 1
          : /light|drizzle/.test(text)
            ? 0.35
            : 0.65,
    temperatureC: Number.isFinite(temp) ? temp : null,
    windKph: Number.isFinite(wind) ? clamp(wind, 0, 100) : 0,
    windDegrees: Number.isFinite(p.windDirection?.value)
      ? p.windDirection.value
      : 0,
  };
}
export function worldConditions(now, observation, networkState = "loading") {
  const fresh =
    observation && now - observation.observedAt <= MAX_OBSERVATION_AGE;
  const weather = fresh ? observation : null;
  const time = clock.format(now);
  const temperature =
    weather?.temperatureC == null
      ? ""
      : ` · ${Math.round((weather.temperatureC * 9) / 5 + 32)}°F`;
  const status = weather
    ? networkState === "unavailable"
      ? "cached"
      : "current"
    : networkState === "loading"
      ? "loading"
      : "unavailable";
  return {
    ...milwaukeeSun(now),
    now,
    time,
    status,
    weather,
    label: `Milwaukee · ${time}${weather ? ` · ${weather.description}${temperature}` : status === "loading" ? " · Checking weather" : " · Weather unavailable"}`,
    detail: weather
      ? `Milwaukee Mitchell Airport observation at ${clock.format(weather.observedAt)}. ${status === "cached" ? "Using the last report while the connection recovers. " : ""}Weather checked every 10 minutes.`
      : "Daylight follows Milwaukee’s local sun position. Weather will return when a recent observation is available.",
  };
}
