import * as THREE from "three";
import { movePedestrian, pathPose } from "./pedestrianMotion.js";
import { riverBridgeHeight } from "./waterfront.js";
import { createWindowRefuge } from "./windowRefuge.js";
import { WINDOW_NPC } from "./pedestrianEscape.js";
const ease = (v) => {
  v = Math.max(0, Math.min(1, v));
  return v * v * (3 - 2 * v);
};
export function createPedestrianScene({
  city,
  walkers,
  palette: p,
  box,
  mesh,
  cylinder,
  rod,
  label,
  material,
  texture,
}) {
  const group = () => {
    const g = new THREE.Group();
    city.add(g);
    return g;
  };
  const people = walkers.map((def) => {
    if (def.seated) return def;
    for (const x of [-0.035, 0.035])
      mesh(
        new THREE.SphereGeometry(0.014, 6, 5),
        p.dark,
        x,
        0.012,
        0.092,
        def.actor.head,
      );
    const badge = group();
    const question = label("?", 0.43, 0.55, 0, 0, 0, {
      parent: badge,
      background: null,
      color: "#47584c",
      size: 190,
      square: true,
      billboard: true,
    });
    const angry = label("!", 0.43, 0.55, 0, 0, 0, {
      parent: badge,
      background: null,
      color: "#cf5144",
      size: 190,
      square: true,
      billboard: true,
    });
    const health = group();
    mesh(
      new THREE.PlaneGeometry(0.76, 0.12),
      material("#f2e7d2"),
      0,
      0,
      0,
      health,
    );
    const fill = mesh(
      new THREE.PlaneGeometry(0.68, 0.065),
      material("#739367"),
      0,
      0,
      0.01,
      health,
    );
    // Keep small reactions legible against nearby facades. Visibility still
    // follows the person's occlusion, so these never reveal someone behind a building.
    for (const overlay of [badge, health])
      overlay.traverse((child) => {
        if (!child.isMesh) return;
        child.material.depthTest = child.material.depthWrite = false;
        child.material.transparent = true;
        child.castShadow = child.receiveShadow = false;
        child.renderOrder = overlay === badge ? 20 : 21;
      });
    badge.visible = health.visible = false;
    return { ...def, badge, question, angry, health, fill };
  });
  const refuge = createWindowRefuge({
    city,
    box,
    mesh,
    material,
    texture,
    palette: p,
  });
  const ripples = new Map(
    people
      .filter((def) => !def.seated)
      .map((def) => {
        const ring = mesh(
          new THREE.RingGeometry(0.13, 0.17, 20),
          material("#e7eee3", {
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
          }),
          0,
          0.32,
          0,
        );
        ring.rotation.x = -Math.PI / 2;
        ring.visible = false;
        ring.castShadow = false;
        return [def.id, ring];
      }),
  );
  const medic = group();
  const skin = material("#d8aa81");
  cylinder(0.11, 0.3, 0, 0.4, 0, p.green, medic, 0.095);
  mesh(new THREE.SphereGeometry(0.1, 10, 8), skin, 0, 0.65, 0, medic);
  box(0.18, 0.06, 0.016, 0, 0.44, 0.105, p.trim, medic);
  const legs = [-1, 1].map((sign) => {
    const g = new THREE.Group();
    g.position.set(sign * 0.06, 0.27, 0);
    medic.add(g);
    box(0.075, 0.25, 0.085, 0, -0.125, 0, p.dark, g);
    return g;
  });
  for (const x of [-0.13, 0.13])
    rod([x, 0.48, 0], [x, 0.29, 0.16], 0.033, p.green, medic);
  const stretcher = new THREE.Group();
  medic.add(stretcher);
  box(0.44, 0.04, 0.83, 0, 0.35, 0.55, p.trim, stretcher);
  box(0.32, 0.13, 0.49, 0, 0.44, 0.55, p.green, stretcher);
  mesh(new THREE.SphereGeometry(0.105, 10, 8), skin, 0, 0.48, 0.87, stretcher);
  for (const x of [-0.22, 0.22])
    rod([x, 0.31, 0.07], [x, 0.31, 1], 0.016, p.dark, stretcher);
  medic.visible = false;
  let lastState = null,
    diagnostics = [];
  function update(sim) {
    lastState = sim.discoveries.pedestrians;
    refuge.update(sim);
    diagnostics = [];
    for (const def of people) {
      const { actor, id } = def,
        clock = sim.discoveries.walkClocks[id] || 0,
        state = lastState.states[id];
      actor.g.visible = true;
      actor.g.scale.setScalar(1);
      actor.head.rotation.set(0, 0, 0);
      actor.arms.forEach((a) => {
        a.rotation.set(0, 0, 0);
        a.position.y = 0.5;
      });
      if (!state || state.phase === "walking" || def.seated) {
        movePedestrian(
          actor,
          def,
          def.seated ? sim.discoveries.active[id] || 0 : clock,
          def.seated ? sim.discoveries.active[id] : undefined,
        );
      } else {
        actor.g.visible =
          !["away", "carried", "inside", "window-hit", "retired"].includes(
            state.phase,
          ) && !(state.phase === "riding" && state.carrier?.kind === "car");
        const running = state.phase === "running",
          fallen = state.phase === "stumbled" || state.phase === "down";
        actor.g.position.set(state.x, state.y ?? 0.42, state.z);
        actor.g.rotation.set(0, state.yaw, 0, "YXZ");
        actor.animate(state.time * (running ? 1.9 : 1), running);
        if (running) actor.g.rotation.x = 0.13;
        if (state.phase === "hiding" || state.phase === "underbridge") {
          actor.g.scale.y = 0.62;
          actor.legs.forEach((leg) => (leg.rotation.x = -0.65));
          actor.head.rotation.y = Math.sin(state.time * 1.8) * 0.35;
        }
        if (state.phase === "boarding") {
          actor.arms.forEach((arm) => (arm.rotation.x = -2));
          actor.legs.forEach((leg) => (leg.rotation.x = -0.55));
          if (state.jumpKind === "car")
            actor.g.scale.setScalar(1 - Math.min(1, state.time / 0.65) * 0.5);
        }
        if (state.phase === "swimming") {
          actor.arms.forEach((arm, i) => {
            arm.rotation.x =
              -1.5 + Math.sin(state.time * 7 + i * Math.PI) * 0.6;
            arm.rotation.z = (i ? 1 : -1) * 0.65;
          });
        }
        if (state.phase === "riding") {
          actor.legs.forEach((leg) => (leg.rotation.x = -1.3));
          actor.g.position.y += 0.1;
        }
        if (fallen) {
          const fall =
            1.5 *
            ease(state.time / 0.19) *
            (state.phase === "down" ? 1 : 1 - ease((state.time - 0.48) / 0.67));
          actor.g.rotation.x = fall;
          actor.g.position.y = (state.y ?? 0.42) - Math.sin(fall) * 0.12;
          actor.arms.forEach((a) => (a.rotation.x = -0.8));
        }
        if (state.phase === "reacting") {
          const t = state.time,
            amount = ease(t / 0.25) * (1 - ease((t - 1.8) / 0.8));
          if (state.level < 3) {
            const lift = (state.level === 1 ? 0.8 : 1.2) * amount;
            actor.arms.forEach((arm, i) => {
              arm.rotation.z = (i ? 1 : -1) * lift;
              arm.rotation.x = -0.3 * amount;
              arm.position.y =
                0.5 +
                amount *
                  (0.035 + Math.sin(t * (state.level === 1 ? 6 : 12)) * 0.025);
            });
            actor.head.rotation.z = Math.sin(t * 5) * 0.11 * amount;
          } else {
            actor.arms[1].rotation.x = -2.4;
            actor.arms[1].rotation.z = 0.24 + Math.sin(t * 23) * 0.3;
            actor.legs[0].rotation.x = Math.max(0, Math.sin(t * 12)) * 0.5;
            actor.g.position.y += Math.abs(Math.sin(t * 12)) * 0.045;
          }
        }
      }
      const ripple = ripples.get(id);
      if (ripple) {
        ripple.visible =
          state?.phase === "swimming" ||
          (state?.phase === "boarding" &&
            ["water", "bridge", "boat"].includes(state.jumpKind));
        ripple.position.set(actor.g.position.x, 0.31, actor.g.position.z);
        ripple.scale.setScalar(1 + ((state?.time || 0) % 0.8) * 0.65);
      }
      if (def.badge) {
        const reacting = state?.phase === "reacting";
        def.badge.visible = reacting;
        def.question.visible = reacting && state.level < 3;
        def.angry.visible = reacting && state.level >= 3;
        def.badge.position
          .copy(actor.g.position)
          .add(new THREE.Vector3(0, 1.1, 0));
        def.badge.scale.setScalar(state?.level === 2 ? 1.3 : 1);
        def.health.visible =
          !!state?.hits &&
          [
            "running",
            "stumbled",
            "down",
            "hiding",
            "swimming",
            "riding",
            "boarding",
          ].includes(state.phase);
        def.health.position
          .copy(actor.g.position)
          .add(new THREE.Vector3(0, state?.phase === "down" ? 0.65 : 1, 0));
        const fraction = state ? (4 - state.hits) / 4 : 1;
        def.fill.scale.x = fraction;
        def.fill.position.x = -(1 - fraction) * 0.34;
        def.fill.material.color.set(
          fraction > 0.5 ? "#739367" : fraction > 0.25 ? "#cb9b4a" : "#bc5446",
        );
      }
      diagnostics.push({
        id,
        phase: state?.phase || (def.seated ? "seated" : "walking"),
        level: state?.level || 0,
        hits: state?.hits || 0,
        health: state?.hits ? (4 - state.hits) / 4 : null,
        visible: actor.g.visible,
        position: actor.g.position.toArray(),
        fall: actor.g.rotation.x,
        replans: state?.replans || 0,
        escape: state?.destination?.kind || null,
        carrier: state?.carrier || null,
      });
    }
    const job = lastState.rescue;
    medic.visible = false;
    if (job) {
      const t = job.time;
      medic.visible = t >= 4.5 && t < job.depart;
      if (medic.visible) {
        const carry = t >= job.pickup;
        const f = carry
          ? 1 - ease((t - job.pickup) / job.walk)
          : ease((t - 4.5) / job.walk);
        const m = pathPose(job.medicPath, f);
        medic.position.set(m.x, 0.42 + riverBridgeHeight(m.x, m.z), m.z);
        medic.rotation.y = m.yaw + (carry ? Math.PI : 0);
        legs.forEach(
          (l, i) => (l.rotation.x = Math.sin(t * 12 + i * Math.PI) * 0.4),
        );
        stretcher.visible = carry;
      }
    }
  }
  return {
    update,
    hidden(id) {
      if (id === WINDOW_NPC && lastState?.states[id]?.phase === "inside")
        return !refuge.visible();
      if (lastState?.states[id]?.phase === "underbridge") return true;
      const def = people.find((p) => p.id === id);
      return def ? !def.actor.g.visible : false;
    },
    target(id) {
      if (id === WINDOW_NPC && lastState?.states[id]?.phase === "inside")
        return refuge.target();
      const def = people.find((p) => p.id === id);
      return def
        ? def.actor.g.position
            .clone()
            .add(
              new THREE.Vector3(
                0,
                ["stumbled", "down"].includes(lastState?.states[id]?.phase)
                  ? 0.18
                  : 0.62,
                0,
              ),
            )
        : null;
    },
    label(id) {
      return id === WINDOW_NPC && refuge.occupied()
        ? "Tap the occupied window"
        : null;
    },
    faceCamera(q, yaw, occluded) {
      for (const def of people) {
        def.badge?.quaternion.copy(q);
        def.health?.quaternion.copy(q);
        const s = lastState?.states[def.id];
        if (def.badge) {
          const visible =
            def.actor.g.visible &&
            !occluded(
              def.actor.g.position.clone().add(new THREE.Vector3(0, 0.62, 0)),
            );
          def.badge.visible = visible && s?.phase === "reacting";
          def.health.visible =
            visible &&
            !!s?.hits &&
            [
              "running",
              "stumbled",
              "down",
              "hiding",
              "swimming",
              "riding",
              "boarding",
            ].includes(s.phase);
        }
        if (s?.phase === "reacting") {
          const turn = ease(s.time / 0.22);
          let d = Math.atan2(Math.sin(yaw - s.yaw), Math.cos(yaw - s.yaw));
          def.actor.g.rotation.y = s.yaw + d * turn;
        }
      }
    },
    diagnostics: () => ({
      people: diagnostics.map((item) => {
        const def = people.find((p) => p.id === item.id);
        return {
          ...item,
          reactionVisible: !!def.badge?.visible,
          healthVisible: !!def.health?.visible,
        };
      }),
      rescue: lastState?.rescue
        ? {
            id: lastState.rescue.id,
            time: lastState.rescue.time,
            phase: !lastState.rescue.arrived
              ? "arriving"
              : lastState.rescue.time < lastState.rescue.pickup
                ? "approaching"
                : lastState.rescue.time < lastState.rescue.depart
                  ? "carrying"
                  : "departing",
          }
        : null,
      pickups: lastState?.pickups || 0,
      refuge: refuge.diagnostics(),
    }),
  };
}
