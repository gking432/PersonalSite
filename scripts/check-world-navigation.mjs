import assert from 'node:assert/strict'
import { locations, findRoute } from '../src/features/world/worldNavigation.js'

for (const [start, node] of Object.entries(locations)) {
  for (const neighbor of node.links) assert.ok(locations[neighbor].links.includes(start), `${start} must have a return path`)
  for (const end of Object.keys(locations)) {
    const route = findRoute(start, end)
    assert.equal(start === end ? route.length : route.at(-1), start === end ? 0 : end)
    let previous = start
    for (const step of route) { assert.ok(locations[previous].links.includes(step)); previous = step }
  }
  for (const neighbor of node.links) {
    const a = node.p, b = locations[neighbor].p
    for (let step = 0; step <= 100; step++) {
      const t = step / 100, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t
      assert.ok(Math.hypot(x, z - 2) > 3.35, `${start}→${neighbor} intersects the fountain`)
      for (const [center, facadeZ, halfWidth, doorway] of [[12, -6, 5.25, 1.5], [-12, -6, 5.25, 1.5], [0, -18, 4.25, 1.4]]) {
        if (Math.abs(z - facadeZ) < .45 && Math.abs(x - center) < halfWidth) assert.ok(Math.abs(x - center) < doorway, `${start}→${neighbor} intersects a facade`)
      }
    }
  }
}
assert.deepEqual(findRoute('road', 'workshop'), ['gate', 'square', 'east', 'workshopDoor', 'workshop'])
assert.deepEqual(findRoute('workshop', 'library'), ['workshopDoor', 'east', 'square', 'west', 'libraryDoor', 'library'])
console.log('PASS: all 121 location pairs connected; return paths; fountain clearance; doorway clearance; continuous road-to-room routes.')
