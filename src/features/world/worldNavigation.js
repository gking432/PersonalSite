export const locations = {
  road: { label: 'The country road', p: [0, 1.75, 39], links: ['gate'], yaw: 0 },
  gate: { label: 'The archway', p: [0, 1.75, 23], links: ['road', 'square'], yaw: 0 },
  square: { label: 'The piazza', p: [0, 1.75, 12], links: ['gate', 'east', 'west'], yaw: 0 },
  east: { label: 'By the fountain', p: [6, 1.75, 3], links: ['square', 'workshopDoor', 'chapel'], yaw: -.35 },
  west: { label: 'The cloister garden', p: [-6, 1.75, 3], links: ['square', 'libraryDoor', 'chapel'], yaw: .35, room: 'garden' },
  workshopDoor: { label: 'Workshop doorway', p: [12, 1.75, -3], links: ['east', 'workshop'], yaw: 0 },
  workshop: { label: 'Inside the workshop', p: [12, 1.75, -11], links: ['workshopDoor'], yaw: 0, room: 'workshop' },
  libraryDoor: { label: 'Library doorway', p: [-12, 1.75, -3], links: ['west', 'library'], yaw: 0 },
  library: { label: 'Inside the library', p: [-12, 1.75, -11], links: ['libraryDoor'], yaw: 0, room: 'library' },
  chapel: { label: 'The chapel steps', p: [0, 1.75, -15], links: ['east', 'west', 'chapelInside'], yaw: 0 },
  chapelInside: { label: 'A quiet place', p: [0, 1.75, -23], links: ['chapel'], yaw: 0, room: 'post' },
}
export function findRoute(start, end) {
  const queue = [[start]], seen = new Set([start])
  while (queue.length) {
    const path = queue.shift(), last = path.at(-1)
    if (last === end) return path.slice(1)
    for (const id of locations[last].links) if (!seen.has(id)) { seen.add(id); queue.push([...path, id]) }
  }
  return []
}

