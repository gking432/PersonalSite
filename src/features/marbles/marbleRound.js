export const MAX_FEED_INTERVAL = 1.05;
export const START_FEED_INTERVAL = 2.4;
export const RAMP_SECONDS = 30;

export function chooseRoute(random = Math.random) {
  return Math.max(0, Math.min(2, Math.floor(random() * 3)));
}

// Active time only: pausing, changing tabs, and narrow screens never accelerate
// the release rate. The stream builds on its own, including after misses.
export class MarbleRound {
  constructor() {
    this.reset();
  }
  reset() {
    this.caught = 0;
    this.missed = 0;
    this.cleaned = 0;
    this.elapsed = 0;
    this.nextIn = 0;
    this.emitted = 0;
  }
  get score() {
    return this.caught - this.missed;
  }
  get progress() {
    return Math.min(1, this.elapsed / RAMP_SECONDS);
  }
  get interval() {
    return (
      START_FEED_INTERVAL +
      (MAX_FEED_INTERVAL - START_FEED_INTERVAL) * this.progress
    );
  }
  tick(dt) {
    if (this.emitted === 0) {
      this.emitted++;
      this.nextIn = START_FEED_INTERVAL;
      return 1;
    }
    this.elapsed = Math.min(RAMP_SECONDS, this.elapsed + dt);
    this.nextIn -= dt;
    if (this.nextIn > 0) return 0;
    this.nextIn += this.interval;
    this.emitted++;
    return 1;
  }
  catch(hitText) {
    if (hitText) {
      this.cleaned++;
      return { label: "Cleaned" };
    }
    this.caught++;
    return { label: "+1" };
  }

  miss() {
    this.missed++;
  }
  snapshot() {
    return {
      caught: this.caught,
      missed: this.missed,
      cleaned: this.cleaned,
      score: this.score,
      interval: this.interval,
      elapsed: this.elapsed,
      emitted: this.emitted,
    };
  }
}
