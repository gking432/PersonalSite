import { JUNCTION_LEVEL, JUNCTION_NAMES } from "./cityChallenges.js";
import { UNLOCK, TIMER_SECONDS } from "./progression.js";
const opposite = (axis) => (axis === "water" ? "wisconsin" : "water");
export class SignalPrograms {
  constructor() {
    this.rules = JUNCTION_LEVEL.map(() => ({
      mode: "manual",
      seconds: TIMER_SECONDS,
      elapsed: 0,
      desired: "water",
      initial: "water",
    }));
  }
  configure(junction, input, sim) {
    if (
      sim.level < UNLOCK.timer ||
      !sim.junctionActive(junction) ||
      sim.roundabout === junction ||
      !["manual", "timer"].includes(input.mode)
    )
      return false;
    if (input.mode === "timer") {
      this.rules.forEach((rule, j) => {
        if (rule.mode === "timer") this.manual(j);
      });
      const initial =
        sim.signalsAt(junction).wisconsin.color === "green"
          ? "wisconsin"
          : "water";
      this.rules[junction] = {
        mode: "timer",
        seconds: TIMER_SECONDS,
        elapsed: 0,
        desired: initial,
        initial,
      };
    } else this.manual(junction);
    return true;
  }
  manual(junction) {
    this.rules[junction].mode = "manual";
  }
  request(junction, axis) {
    this.rules[junction] = {
      ...this.rules[junction],
      mode: "street",
      desired: axis,
    };
  }
  tick(dt, sim) {
    this.rules.forEach((rule, j) => {
      if (
        !sim.junctionActive(j) ||
        sim.roundabout === j ||
        rule.mode === "manual"
      )
        return;
      if (rule.mode === "timer") {
        rule.elapsed += dt;
        rule.desired =
          Math.floor(rule.elapsed / TIMER_SECONDS) % 2
            ? opposite(rule.initial)
            : rule.initial;
      }
      const signals = sim.signalsAt(j),
        wanted = rule.desired,
        other = opposite(wanted);
      if (signals[other].color === "green") {
        signals[other].color = "amber";
        signals[other].left = 0.65;
      }
      const occupied = sim.cars.some(
        (c) => c.junction === j && c.committed && !c.crashed && c.p < 4.8,
      );
      if (
        signals[other].color === "red" &&
        !occupied &&
        signals[wanted].color !== "amber"
      )
        signals[wanted].color = "green";
    });
  }
  snapshot() {
    return this.rules.map((r) => ({
      ...r,
      elapsed: undefined,
      remaining:
        r.mode === "timer"
          ? Math.max(0, Math.ceil(TIMER_SECONDS - (r.elapsed % TIMER_SECONDS)))
          : null,
    }));
  }
}
export { JUNCTION_NAMES };
