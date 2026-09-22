export const DISCOVERIES = [
  {
    id: "helicopter",
    label: "Fly the rooftop helicopter",
    point: [3.5, 3.9, -3.7],
    duration: 16,
  },
  {
    id: "fisherman",
    label: "Help the riverwalk fisherman catch something",
    point: [-4.78, 1.1, 6.1],
    duration: 7,
  },
  {
    id: "pedestrians",
    label: "Take a walk along the riverwalk",
    point: [-1.95, 1, 3.05],
    duration: 17,
  },
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
];

export class Discoveries {
  constructor() {
    this.reset();
  }
  reset() {
    this.active = {};
    this.counts = {};
    this.windows = false;
  }
  trigger(id) {
    const discovery = DISCOVERIES.find((item) => item.id === id);
    if (!discovery || id in this.active) return false;
    this.counts[id] = (this.counts[id] || 0) + 1;
    if (id === "windows") this.windows = !this.windows;
    else this.active[id] = 0;
    if (id === "helicopter" && !("pigeons" in this.active))
      this.trigger("pigeons");
    return true;
  }
  tick(dt) {
    for (const item of DISCOVERIES) {
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
    };
  }
}
