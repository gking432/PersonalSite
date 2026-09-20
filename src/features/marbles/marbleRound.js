export const MAX_FEED_INTERVAL = 1.05;
export const START_FEED_INTERVAL = 4.8;
export const RAMP_SECONDS = 90;

export function chooseRoute(random = Math.random) {
  return Math.max(0, Math.min(2, Math.floor(random() * 3)));
}

// Active time only: pausing, changing tabs, and narrow screens never accelerate
// the game. The first successful catch unlocks the overlapping stream.
export class MarbleRound {
  constructor() {
    this.reset();
  }
  reset() {
    this.caught = 0;
    this.missed = 0;
    this.cleaned = 0;
    this.opening = true;
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
  tick(dt, liveCount) {
    if (this.opening) {
      // Retry one marble after a missed opening marble is cleaned up or exits.
      if (liveCount === 0) {
        this.emitted++;
        return 1;
      }
      return 0;
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
      return { label: "Cleaned", emit: 0 };
    }
    this.caught++;
    if (this.opening) {
      this.opening = false;
      this.elapsed = 0;
      this.nextIn = START_FEED_INTERVAL;
      this.emitted++;
      return { label: "+1", emit: 1 };
    }
    return { label: "+1", emit: 0 };
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
      opening: this.opening,
      interval: this.interval,
      elapsed: this.elapsed,
      emitted: this.emitted,
    };
  }
}
