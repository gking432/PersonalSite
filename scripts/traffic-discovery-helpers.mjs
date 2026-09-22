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
