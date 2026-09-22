// Miniature U.S. Bank Center: white structural grid, three braced bands,
// dark glazing and the Baird / U.S. Bank signs around its flat crown.
export function createMilwaukeeTower({
  x,
  z,
  w,
  d,
  h,
  box,
  rod,
  label,
  palette: p,
}) {
  const base = 0.41;
  box(w, h, d, x, base + h / 2, z, p.windows);
  box(w + 0.22, 0.16, d + 0.22, x, base + 0.02, z, p.trim);
  for (let floor = 0; floor <= 20; floor++) {
    const y = base + 0.42 + (floor * (h - 0.8)) / 20;
    box(w + 0.04, 0.045, d + 0.04, x, y, z, p.white);
  }
  for (const sign of [-1, 1]) {
    for (let i = 0; i <= 6; i++) {
      const xx = x - w / 2 + (i * w) / 6;
      box(0.055, h, 0.055, xx, base + h / 2, z + (sign * d) / 2, p.white);
      const zz = z - d / 2 + (i * d) / 6;
      box(0.055, h, 0.055, x + (sign * w) / 2, base + h / 2, zz, p.white);
    }
    for (const y of [base + 0.6, base + h * 0.35, base + h - 0.38]) {
      for (let i = 0; i < 3; i++) {
        const a = x - w / 2 + (i * w) / 3,
          b = a + w / 3;
        rod(
          [a, y - 0.2, z + sign * (d / 2 + 0.025)],
          [b, y + 0.2, z + sign * (d / 2 + 0.025)],
          0.035,
          p.white,
        );
        const c = z - d / 2 + (i * d) / 3,
          e = c + d / 3;
        rod(
          [x + sign * (w / 2 + 0.025), y - 0.2, c],
          [x + sign * (w / 2 + 0.025), y + 0.2, e],
          0.035,
          p.white,
        );
      }
    }
    label(
      "BAIRD",
      w * 0.63,
      0.28,
      x,
      base + h - 0.35,
      z + sign * (d / 2 + 0.07),
      {
        background: "#335879",
        color: "#ffffff",
        size: 100,
        ry: sign > 0 ? 0 : Math.PI,
      },
    );
    label(
      "us bank",
      d * 0.64,
      0.28,
      x + sign * (w / 2 + 0.07),
      base + h - 0.35,
      z,
      {
        background: "#ecebdd",
        color: "#354967",
        size: 90,
        ry: (sign * Math.PI) / 2,
      },
    );
  }
  box(w + 0.08, 0.09, d + 0.08, x, base + h, z, p.white);
  box(w * 0.6, 0.22, d * 0.55, x, base + h + 0.12, z, p.roof);
  for (let i = 0; i < 4; i++)
    rod(
      [x - 0.45 + i * 0.3, base + h + 0.2, z],
      [x - 0.45 + i * 0.3, base + h + 0.4 + (i % 2) * 0.15, z],
      0.015,
      p.dark,
    );
}
