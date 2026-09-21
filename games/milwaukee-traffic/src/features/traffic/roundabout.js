// Cached arc-length paths: an entry curve, a counter-clockwise circulating lane,
// and an exit curve. All three movements meet the existing incoming/outgoing lanes.
const routes = {};
function route(turn) {
  const points = [],
    radius = 1.45,
    startAngle = -Math.PI / 2 - 0.55;
  const turns = turn === "right" ? 1 : turn === "left" ? 3 : 2;
  const endAngle = startAngle - (turns * Math.PI) / 2 + 1.1;
  const circle = (a) => ({ x: radius * Math.cos(a), z: radius * Math.sin(a) });
  const tangent = (a) => ({ x: Math.sin(a), z: -Math.cos(a) });
  const cubic = (a, b, c, d) => {
    for (let i = 0; i <= 16; i++) {
      const t = i / 16,
        u = 1 - t;
      points.push({
        x:
          u ** 3 * a.x +
          3 * u * u * t * b.x +
          3 * u * t * t * c.x +
          t ** 3 * d.x,
        z:
          u ** 3 * a.z +
          3 * u * u * t * b.z +
          3 * u * t * t * c.z +
          t ** 3 * d.z,
      });
    }
  };
  const a = circle(startAngle),
    ta = tangent(startAngle),
    b = circle(endAngle),
    tb = tangent(endAngle);
  cubic(
    { x: -0.57, z: -2.16 },
    { x: -0.57, z: -1.72 },
    { x: a.x - ta.x * 0.3, z: a.z - ta.z * 0.3 },
    a,
  );
  const steps = Math.ceil((startAngle - endAngle) / 0.07);
  for (let i = 1; i <= steps; i++)
    points.push(circle(startAngle + ((endAngle - startAngle) * i) / steps));
  const end =
    turn === "right"
      ? { x: -2.16, z: -0.57 }
      : turn === "left"
        ? { x: 2.16, z: 0.57 }
        : { x: -0.57, z: 2.16 };
  const direction =
    turn === "right"
      ? { x: -1, z: 0 }
      : turn === "left"
        ? { x: 1, z: 0 }
        : { x: 0, z: 1 };
  cubic(
    b,
    { x: b.x + tb.x * 0.3, z: b.z + tb.z * 0.3 },
    { x: end.x - direction.x * 0.4, z: end.z - direction.z * 0.4 },
    end,
  );
  let length = 0;
  points.forEach((p, i) => {
    if (i) length += Math.hypot(p.x - points[i - 1].x, p.z - points[i - 1].z);
    p.distance = length;
  });
  return { points, length, end, direction };
}
for (const turn of ["left", "straight", "right"]) routes[turn] = route(turn);
export function roundaboutPose(p, turn = "straight") {
  if (p <= -2.16) return { x: -0.57, z: p, dx: 0, dz: 1, out: null };
  const r = routes[turn],
    distance = p + 2.16;
  if (distance >= r.length)
    return {
      x: r.end.x + r.direction.x * (distance - r.length),
      z: r.end.z + r.direction.z * (distance - r.length),
      dx: r.direction.x,
      dz: r.direction.z,
      out: 2.16 + distance - r.length,
    };
  let index = 1;
  while (r.points[index].distance < distance) index++;
  const a = r.points[index - 1],
    b = r.points[index],
    span = b.distance - a.distance,
    t = span ? (distance - a.distance) / span : 0;
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    dx: (b.x - a.x) / (span || 1),
    dz: (b.z - a.z) / (span || 1),
    out: null,
  };
}
