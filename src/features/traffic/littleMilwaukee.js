import { PedestrianReactions } from "./pedestrianReactions.js";
import { BALCONY_RESIDENT } from "./balconyDefinition.js";
import { CITY_WALKERS } from "./pedestrianMotion.js";
import { FISHERMAN, FISHING_DURATION } from "./fishingMotion.js";
import { SecretHeist, HEIST_PLACES } from "./secretHeist.js";
import { FLIGHT_DURATION } from "./helicopterFlight.js";
import { WATERFRONT_WALKS } from "./waterfront.js";
export const DISCOVERIES = [
  {
    id: "helicopter",
    label: "Fly the rooftop helicopter",
    point: [3.5, 3.75, -3.7],
    duration: FLIGHT_DURATION,
  },
  {
    id: "fisherman",
    label: "Help the riverwalk fisherman catch something",
    point: [FISHERMAN[0], 1.1, FISHERMAN[1]],
    duration: FISHING_DURATION,
  },
  ...CITY_WALKERS,
  {
    id: "pigeons",
    label: "Send the rooftop pigeons flying",
    point: [-3.35, 2.55, 3.65],
    duration: 8,
  },
  {
    id: "coffee",
    label: "Order a coffee at the corner café",
    point: [3.5, 1.0, -2.18],
    duration: 11,
  },
  {
    id: "dog",
    label: "Play fetch with the dog",
    point: [3.6, 0.8, 5.7],
    duration: 9,
  },
  {
    id: "musician",
    label: "Play a 3-second trumpet tune",
    point: [-3.8, 1.1, 5.7],
    duration: 3,
  },
  {
    id: "delivery",
    label: "Unload the brewery delivery truck",
    point: [3.8, 1, -1.16],
    duration: 10,
  },
  {
    id: "windows",
    label: "Switch the Iron Block’s window lights",
    point: [3.55, 1.8, 3.65],
    duration: 0,
  },
  {
    id: "fountain",
    label: "Make the fountain dance",
    point: [14.4, 1.2, 0],
    duration: 6,
  },
  ...WATERFRONT_WALKS,
  BALCONY_RESIDENT,
  {
    id: "bankClock",
    label: "Tap the bank clock",
    point: [-3.38, 1.73, -2.35],
    duration: 1,
  },
  {
    id: "payphone",
    label: "Pick up the payphone",
    point: [HEIST_PLACES.phone[0], 1.1, HEIST_PLACES.phone[1]],
    duration: 1.2,
  },
  {
    id: "manhole",
    label: "Tap the manhole cover",
    point: [HEIST_PLACES.manhole[0], 0.35, HEIST_PLACES.manhole[1]],
    duration: 1,
  },
];

export class Discoveries {
  constructor() {
    this.reset();
  }
  reset() {
    this.active = {};
    this.pedestrians = new PedestrianReactions();
    this.walkClocks = {};
    this.counts = {};
    this.windows = false;
    this.heist = new SecretHeist();
    this.heistFlight = null;
  }
  trigger(id) {
    const discovery = DISCOVERIES.find((item) => item.id === id);
    if (!discovery) return false;
    if (id === "helicopter" && this.heistFlight) return false;
    if (discovery.loopDuration) {
      if (!this.pedestrians.click(discovery, this.walkClocks[id] || 0))
        return false;
    } else if (id in this.active) return false;
    const beforeHeist = this.heist.plays;
    this.heist.click(id);
    if (this.heist.plays > beforeHeist) {
      const manual = this.active.helicopter || 0;
      this.heistFlight = {
        time: manual > 17.2 ? 0 : manual,
        returning: manual > 17.2 ? manual : null,
        returnAt: null,
      };
      delete this.active.helicopter;
    }
    this.counts[id] = (this.counts[id] || 0) + 1;
    if (id === "windows") {
      this.windows = !this.windows;
      this.pedestrians.lightsOn = this.windows;
      if (this.pedestrians.environment)
        this.pedestrians.environment.lightsOn = this.windows;
    } else this.active[id] = 0;
    if (id === "helicopter" && !("pigeons" in this.active))
      this.trigger("pigeons");
    return true;
  }
  tick(dt) {
    this.heist.tick(dt);
    if (this.heistFlight) {
      const flight = this.heistFlight;
      if (flight.returning !== null) {
        flight.returning += dt;
        if (flight.returning >= FLIGHT_DURATION) flight.returning = null;
      } else flight.time += dt;
      if (this.heist.time === null && flight.returnAt === null)
        flight.returnAt =
          4.8 + Math.max(1, Math.ceil((flight.time - 4.8) / 12.4)) * 12.4;
      if (flight.returnAt !== null && flight.time >= flight.returnAt + 5.3)
        this.heistFlight = null;
    }
    this.pedestrians.lightsOn = this.windows;
    this.pedestrians.tick(dt);
    for (const item of DISCOVERIES) {
      if (item.loopDuration) {
        const state = this.pedestrians.states[item.id];
        if (!state || state.phase === "walking") {
          this.walkClocks[item.id] = (this.walkClocks[item.id] || 0) + dt;
          delete this.active[item.id];
        } else this.active[item.id] = state.time;
        continue;
      }
      if (!(item.id in this.active)) continue;
      this.active[item.id] += dt;
      if (this.active[item.id] >= item.duration) delete this.active[item.id];
    }
  }
  snapshot() {
    return {
      busy: Object.keys(this.active),
      windows: this.windows,
      counts: { ...this.counts },
      heist: this.heist.snapshot(),
    };
  }
  helicopterTime() {
    const flight = this.heistFlight;
    if (!flight) return this.active.helicopter;
    if (flight.returning !== null) return flight.returning;
    if (flight.returnAt !== null && flight.time >= flight.returnAt)
      return 17.2 + flight.time - flight.returnAt;
    return flight.time < 4.8 ? flight.time : 4.8 + ((flight.time - 4.8) % 12.4);
  }
}
