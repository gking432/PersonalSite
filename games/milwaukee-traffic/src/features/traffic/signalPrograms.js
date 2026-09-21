import { JUNCTION_LEVEL, JUNCTION_NAMES } from "./cityChallenges.js";
const AXES = ["water", "wisconsin"];
export class SignalPrograms {
  constructor() {
    this.rules = JUNCTION_LEVEL.map(() => ({
      mode: "manual",
      seconds: 8,
      source: 0,
      offset: 0,
      inverted: false,
      emergency: false,
      elapsed: 0,
      desired: "water",
    }));
  }
  configure(junction, input, sim) {
    if (
      sim.level < 6 ||
      sim.level < JUNCTION_LEVEL[junction] ||
      sim.roundabout === junction
    )
      return false;
    if (!["manual", "timer", "linked", "sensor"].includes(input.mode))
      return false;
    if (
      (input.mode === "linked" && sim.level < 7) ||
      ((input.mode === "sensor" || input.emergency) && sim.level < 8)
    )
      return false;
    const next = { ...this.rules[junction], ...input, elapsed: 0 };
    next.seconds = Math.max(4, Math.min(16, Number(next.seconds) || 8));
    next.offset = Math.max(0, Math.min(8, Number(next.offset) || 0));
    next.source = Number(next.source);
    if (next.mode === "linked") {
      const seen = new Set([junction]);
      let source = next.source;
      while (true) {
        if (
          !this.rules[source] ||
          sim.level < JUNCTION_LEVEL[source] ||
          sim.roundabout === source ||
          seen.has(source)
        )
          return false;
        seen.add(source);
        if (this.rules[source].mode !== "linked") break;
        source = this.rules[source].source;
      }
    }
    this.rules[junction] = next;
    return true;
  }
  manual(junction) {
    this.rules[junction].mode = "manual";
    this.rules[junction].emergency = false;
  }
  tick(dt, sim) {
    const scheduled = new Map();
    const desire = (j) => {
      if (scheduled.has(j)) return scheduled.get(j);
      const rule = this.rules[j];
      let axis = rule.desired;
      if (rule.mode === "timer")
        axis =
          Math.floor(rule.elapsed / rule.seconds) % 2 ? "wisconsin" : "water";
      if (rule.mode === "linked") {
        const source = this.rules[rule.source];
        if (source.mode === "timer")
          axis =
            Math.floor(
              Math.max(0, source.elapsed - rule.offset) / source.seconds,
            ) % 2
              ? "wisconsin"
              : "water";
        else
          axis =
            source.mode === "manual"
              ? sim.signalsAt(rule.source).wisconsin.color === "green"
                ? "wisconsin"
                : "water"
              : desire(rule.source);
        if (rule.inverted) axis = axis === "water" ? "wisconsin" : "water";
      }
      if (rule.mode === "sensor" && rule.elapsed >= rule.seconds) {
        const queues = AXES.map(
          (a) =>
            sim.cars.filter(
              (c) =>
                c.junction === j &&
                !c.committed &&
                !c.crashed &&
                (c.lane % 2 ? "wisconsin" : "water") === a,
            ).length,
        );
        const wanted =
          queues[1] > queues[0]
            ? "wisconsin"
            : queues[0] > queues[1]
              ? "water"
              : axis === "water"
                ? "wisconsin"
                : "water";
        axis = wanted;
        rule.elapsed = 0;
      }
      if (rule.emergency) {
        const ambulance = sim.cars
          .filter(
            (c) =>
              c.junction === j && c.ambulance && !c.crashed && !c.committed,
          )
          .sort(
            (a, b) =>
              (b.emergencyWait || 0) - (a.emergencyWait || 0) || b.p - a.p,
          )[0];
        if (ambulance) axis = ambulance.lane % 2 ? "wisconsin" : "water";
      }
      scheduled.set(j, axis);
      return axis;
    };
    this.rules.forEach((rule, j) => {
      if (sim.level >= JUNCTION_LEVEL[j]) rule.elapsed += dt;
    });
    this.rules.forEach((rule, j) => {
      if (
        sim.level < JUNCTION_LEVEL[j] ||
        sim.roundabout === j ||
        (rule.mode === "manual" && !rule.emergency)
      )
        return;
      const wanted = desire(j),
        signals = sim.signalsAt(j),
        other = wanted === "water" ? "wisconsin" : "water";
      rule.desired = wanted;
      if (signals[other].color === "green") {
        signals[other].color = "amber";
        signals[other].left = 0.65;
      }
      // Programs include an all-red clearance, including turning cars still crossing.
      const occupied = sim.cars.some(
        (c) => c.junction === j && c.committed && !c.crashed && c.p < 4.8,
      );
      if (signals[other].color === "red" && !occupied)
        signals[wanted].color = "green";
    });
  }
  snapshot() {
    return this.rules.map((r) => ({
      ...r,
      elapsed: undefined,
      remaining:
        r.mode === "timer" || r.mode === "sensor"
          ? Math.max(0, Math.ceil(r.seconds - (r.elapsed % r.seconds)))
          : null,
    }));
  }
}
export { JUNCTION_NAMES };
