export const HEIST_SEQUENCE = ["bankClock", "payphone", "manhole"];
export const HEIST_DURATION = 42;
export class SecretHeist {
  constructor() {
    this.time = null;
    this.step = 0;
    this.remaining = 0;
    this.plays = 0;
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
    }
  }
  tick(dt) {
    if (this.time !== null) {
      this.time += dt;
      if (this.time >= HEIST_DURATION) this.time = null;
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
              : t < 13
                ? "escape"
                : t < 18
                  ? "response"
                  : t < 33
                    ? "investigation"
                    : "departure",
    };
  }
}
