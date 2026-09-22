export const HEIST_PLACES = { phone: [-4.8, -5.55], manhole: [0, 0] };
export const HEIST_TIMING = {
  getaway: 12.3,
  getawayGone: 14.2,
  police: 14.6,
  investigation: 19,
  departure: 34,
};
export const HEIST_SEQUENCE = ["bankClock", "payphone", "manhole"];
export const HEIST_DURATION = 42;
export class SecretHeist {
  constructor() {
    this.time = null;
    this.step = 0;
    this.remaining = 0;
    this.plays = 0;
    this.responseReady = false;
    this.responseComplete = false;
  }
  click(id) {
    if (this.time !== null) return;
    this.step =
      id === HEIST_SEQUENCE[this.step]
        ? this.step + 1
        : id === HEIST_SEQUENCE[0]
          ? 1
          : 0;
    this.remaining = this.step ? 20 : 0;
    if (this.step === HEIST_SEQUENCE.length) {
      this.time = 0;
      this.step = 0;
      this.plays++;
      this.responseReady = this.responseComplete = false;
    }
  }
  tick(dt) {
    if (this.time !== null) {
      this.time += dt;
      if (!this.responseReady && this.time >= HEIST_TIMING.investigation)
        this.time = HEIST_TIMING.investigation;
      if (this.time >= HEIST_DURATION)
        this.time = this.responseComplete ? null : HEIST_DURATION;
    } else if (this.step) {
      this.remaining -= dt;
      if (this.remaining <= 0) this.step = 0;
    }
  }
  snapshot() {
    const t = this.time;
    return {
      plays: this.plays,
      running: t !== null,
      phase:
        t === null
          ? "idle"
          : t < 4
            ? "arrival"
            : t < 10
              ? "bank"
              : t < HEIST_TIMING.police
                ? "escape"
                : !this.responseReady || t < HEIST_TIMING.investigation
                  ? "response"
                  : t < HEIST_TIMING.departure
                    ? "investigation"
                    : "departure",
    };
  }
}
