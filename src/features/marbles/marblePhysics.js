// Screen-space physics: circles collide with the signed distance to rendered ink,
// not with the rectangular boxes around words. No DOM or renderer dependencies.
export function inkDistanceField(alpha, width, height) {
  const count = width * height;
  function distance(toInk) {
    const d = new Float32Array(count);
    for (let i = 0; i < count; i++) d[i] = alpha[i] > 64 === toInk ? 0 : 10000;
    const diagonal = Math.SQRT2;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (x) d[i] = Math.min(d[i], d[i - 1] + 1);
        if (y) {
          d[i] = Math.min(d[i], d[i - width] + 1);
          if (x) d[i] = Math.min(d[i], d[i - width - 1] + diagonal);
          if (x + 1 < width) d[i] = Math.min(d[i], d[i - width + 1] + diagonal);
        }
      }
    for (let y = height - 1; y >= 0; y--)
      for (let x = width - 1; x >= 0; x--) {
        const i = y * width + x;
        if (x + 1 < width) d[i] = Math.min(d[i], d[i + 1] + 1);
        if (y + 1 < height) {
          d[i] = Math.min(d[i], d[i + width] + 1);
          if (x) d[i] = Math.min(d[i], d[i + width - 1] + diagonal);
          if (x + 1 < width) d[i] = Math.min(d[i], d[i + width + 1] + diagonal);
        }
      }
    return d;
  }
  const outside = distance(true),
    inside = distance(false);
  for (let i = 0; i < count; i++)
    outside[i] = alpha[i] > 64 ? 0.5 - inside[i] : outside[i] - 0.5;
  return { width, height, values: outside };
}

export function sampleField(field, x, y) {
  if (x < 0 || y < 0 || x >= field.width - 1 || y >= field.height - 1)
    return 10000;
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = x - ix,
    fy = y - iy,
    i = iy * field.width + ix;
  const a = field.values[i] * (1 - fx) + field.values[i + 1] * fx;
  const b =
    field.values[i + field.width] * (1 - fx) +
    field.values[i + field.width + 1] * fx;
  return a * (1 - fy) + b * fy;
}

export function collideInk(ball, surface) {
  const { x, y, scale = 1, field } = surface;
  if (!Number.isFinite(scale) || scale <= 0) return false;
  const px = (ball.x - x) / scale,
    py = (ball.y - y) / scale,
    radius = ball.radius / scale;
  if (px < 0 || py < 0 || px >= field.width - 1 || py >= field.height - 1)
    return false;
  const distance = sampleField(field, px, py);
  if (distance >= radius) return false;
  let nx = sampleField(field, px + 1, py) - sampleField(field, px - 1, py);
  let ny = sampleField(field, px, py + 1) - sampleField(field, px, py - 1);
  let length = Math.hypot(nx, ny);
  if (length < 0.01) {
    nx = 0;
    ny = -1;
    length = 1;
  }
  nx /= length;
  ny /= length;
  const penetration = (radius - distance) * scale;
  ball.x += nx * penetration;
  ball.y += ny * penetration;
  const normalSpeed = ball.vx * nx + ball.vy * ny;
  if (normalSpeed < 0) {
    const bounce = Math.abs(normalSpeed) > 32 ? 0.34 : 0;
    ball.vx -= (1 + bounce) * normalSpeed * nx;
    ball.vy -= (1 + bounce) * normalSpeed * ny;
    const tangent = -ball.vx * ny + ball.vy * nx;
    ball.vx += tangent * ny * 0.1;
    ball.vy -= tangent * nx * 0.1;
  }
  ball.contacts++;
  return true;
}

export class MarblePhysics {
  constructor({ maxBalls = 320 } = {}) {
    this.balls = [];
    this.maxBalls = maxBalls;
    this.nextId = 1;
    this.time = 0;
    this.stats = { inkContacts: 0, ballContacts: 0, recycled: 0 };
  }
  add({
    x,
    y,
    vx = 0,
    vy = 20,
    radius = 6,
    visibleTop = 0,
    visibleBottom = 900,
  }) {
    if (this.balls.length >= this.maxBalls) {
      // Prefer recycling a body outside the view; bounded storage for long sessions.
      const index = this.balls.findIndex(
        (b) => b.y < visibleTop - 80 || b.y > visibleBottom + 80,
      );
      this.balls.splice(index < 0 ? 0 : index, 1);
      this.stats.recycled++;
    }
    const ball = {
      id: this.nextId++,
      x,
      y,
      vx,
      vy,
      radius,
      sleep: 0,
      contacts: 0,
      hitText: false,
      born: this.time,
    };
    this.balls.push(ball);
    return ball;
  }
  hitTest(x, y, padding = 24) {
    let hit = null,
      nearest = Infinity;
    for (const b of this.balls) {
      const d = Math.hypot(b.x - x, b.y - y);
      if (d <= b.radius + padding && d < nearest) {
        hit = b;
        nearest = d;
      }
    }
    return hit;
  }
  remove(ball) {
    const index = this.balls.indexOf(ball);
    if (index < 0) return false;
    this.balls.splice(index, 1);
    this.wake();
    return true;
  }
  wake() {
    for (const b of this.balls) b.sleep = 0;
  }
  clear() {
    this.balls.length = 0;
  }
  step(dt, surfaces, { width, height, onTextHit } = {}) {
    this.time += dt;
    for (const ball of this.balls) {
      ball.contacts = 0;
      if (ball.sleep > 0.8) continue;
      ball.vy = Math.min(650, ball.vy + 620 * dt);
      ball.vx *= Math.exp(-0.1 * dt);
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < ball.radius) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.5;
      }
      if (ball.x > width - ball.radius) {
        ball.x = width - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.5;
      }
      for (let iteration = 0; iteration < 2; iteration++)
        for (const surface of surfaces) {
          if (collideInk(ball, surface)) {
            this.stats.inkContacts++;
            if (surface.kind !== "object" && !ball.hitText) {
              ball.hitText = true;
              onTextHit?.(ball);
            }
          }
        }
    }
    // A spatial hash bounds marble-to-marble work even when a pile grows.
    const grid = new Map(),
      cell = 24;
    for (const ball of this.balls) {
      const gx = Math.floor(ball.x / cell),
        gy = Math.floor(ball.y / cell);
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++) {
          for (const other of grid.get(`${gx + dx},${gy + dy}`) || []) {
            const sx = ball.x - other.x,
              sy = ball.y - other.y;
            const min = ball.radius + other.radius,
              distance = Math.hypot(sx, sy);
            if (distance >= min) continue;
            this.stats.ballContacts++;
            const nx = distance > 0.001 ? sx / distance : 0,
              ny = distance > 0.001 ? sy / distance : -1;
            const push = (min - distance) * 0.5;
            if (push > 0.15) {
              ball.sleep = 0;
              other.sleep = 0;
            }
            ball.x += nx * push;
            ball.y += ny * push;
            other.x -= nx * push;
            other.y -= ny * push;
            const speed = (ball.vx - other.vx) * nx + (ball.vy - other.vy) * ny;
            if (speed < 0) {
              const impulse = -speed * (Math.abs(speed) > 30 ? 0.64 : 0.5);
              ball.vx += impulse * nx;
              ball.vy += impulse * ny;
              other.vx -= impulse * nx;
              other.vy -= impulse * ny;
              if (speed < -25) {
                ball.sleep = 0;
                other.sleep = 0;
              }
            }
            ball.contacts++;
            other.contacts++;
          }
        }
      const key = `${gx},${gy}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(ball);
    }
    for (const b of this.balls) {
      if (b.sleep > 0.8) {
        b.vx = 0;
        b.vy = 0;
      } else if (b.contacts && Math.hypot(b.vx, b.vy) < 10) b.sleep += dt;
      else b.sleep = 0;
    }
    this.balls = this.balls.filter(
      (b) => b.y < height + 120 && Number.isFinite(b.x + b.y),
    );
  }
}
