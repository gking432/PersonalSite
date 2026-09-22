import assert from "node:assert/strict";
// A rear-side discovery must be reached by swivelling the actual scene, not by
// clicking its invisible projection through a building.
export async function revealDiscovery(page, id) {
  for (let i = 0; i < 9; i++) {
    const p = await page.evaluate(
      (id) => window.__trafficCity.discoveryTargets().find((t) => t.id === id),
      id,
    );
    if (
      await page.evaluate(
        (p) => document.elementFromPoint(p.x, p.y)?.dataset.discovery === p.id,
        p,
      )
    )
      return p;
    const r = await page.locator(".traffic-city__stage").boundingBox();
    await page.mouse.move(r.x + r.width * 0.5, r.y + r.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width * 0.5 + 100, r.y + r.height * 0.5, {
      steps: 5,
    });
    await page.mouse.up();
  }
  assert.fail(`Could not reveal ${id} by swivelling the city`);
}

// Drive the real simulation through response journeys, with safe light phases.
// Cinematic timestamps alone must never teleport a response vehicle to its stop.
export async function advanceResponseTraffic(page, goal) {
  const reached = await page.evaluate((goal) => {
    const { sim, api } = window.__trafficCity;
    api.setEnabled(false);
    sim.start();
    sim.nextArrival = sim.bridge.nextBoat = Infinity;
    const signals = structuredClone(sim.signals);
    const pickups = sim.discoveries.pedestrians.pickups;
    const done = () => {
      if (goal === "dispatched")
        return sim.cars.filter((c) => c.police).length === 3;
      if (goal === "arrived") return sim.discoveries.heist.responseReady;
      if (goal === "left") return sim.discoveries.heist.time === null;
      if (goal === "ambulance-arrived")
        return sim.discoveries.pedestrians.rescue?.arrived;
      return sim.discoveries.pedestrians.pickups > pickups;
    };
    for (let i = 0; i < 180 * 120 && !done(); i++) {
      const phase = (i / 120) % 24;
      sim.signals.water.color = phase < 10 ? "green" : "red";
      sim.signals.wisconsin.color = phase >= 12 && phase < 22 ? "green" : "red";
      sim.tick(1 / 120);
    }
    sim.signals = signals;
    api.refresh();
    return !!done();
  }, goal);
  assert.ok(reached, `Response traffic did not finish: ${goal}`);
}
