import { inkDistanceField } from "./marblePhysics";

const PAD = 16;
const excluded =
  '.navbar, .mobile-menu, .kinetic-machine, .marble-controls, .traffic-city, script, style, svg, canvas, [aria-hidden="true"], button';

// Group text-node ranges into actual browser line boxes. This preserves font
// metrics, wrapping, nested emphasis, and letter spacing without changing the DOM.
function linesFor(node, elementRect, scale) {
  const range = document.createRange(),
    lines = [];
  let current = null;
  for (let i = 0; i < node.length; i++) {
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const rect = range.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const y = (rect.top - elementRect.top) / scale;
    if (!current || Math.abs(current.y - y) > 2) {
      current = {
        text: "",
        x: (rect.left - elementRect.left) / scale,
        y,
        height: rect.height / scale,
      };
      lines.push(current);
    }
    current.text += node.textContent[i];
  }
  return lines;
}

export async function buildTextSurfaces(container, isCancelled = () => false) {
  await document.fonts.ready;
  if (!container || isCancelled()) return [];
  const groups = new Map();
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    if (
      !node.textContent.trim() ||
      el.closest(excluded) ||
      !el.closest("h1,h2,h3,h4,p,a,li,span,dt,dd,blockquote")
    )
      continue;
    if (!groups.has(el)) groups.set(el, []);
    groups.get(el).push(node);
  }
  const surfaces = [];
  let work = 0;
  for (const [el, nodes] of groups) {
    if (isCancelled()) return [];
    const rect = el.getBoundingClientRect(),
      style = getComputedStyle(el);
    if (
      !rect.width ||
      !rect.height ||
      style.display === "none" ||
      style.visibility === "hidden"
    )
      continue;
    const scale = el.offsetWidth ? rect.width / el.offsetWidth : 1;
    const allLines = nodes.flatMap((node) => linesFor(node, rect, scale));
    if (!allLines.length) continue;
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(2000, Math.ceil(rect.width / scale) + PAD * 2);
    canvas.height = Math.min(1600, Math.ceil(rect.height / scale) + PAD * 2);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "alphabetic";
    ctx.letterSpacing =
      style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    const metric = ctx.measureText("Hg");
    const ascent =
      metric.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8;
    for (const line of allLines) {
      const text =
        style.textTransform === "uppercase"
          ? line.text.toUpperCase()
          : style.textTransform === "lowercase"
            ? line.text.toLowerCase()
            : line.text;
      ctx.fillText(text, line.x + PAD, line.y + ascent + PAD);
    }
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const alpha = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels[i * 4 + 3];
    surfaces.push({
      el,
      field: inkDistanceField(alpha, canvas.width, canvas.height),
      baseWidth: rect.width / scale,
      x: rect.left + scrollX - PAD * scale,
      y: rect.top + scrollY - PAD * scale,
      scale,
    });
    // Yield between blocks so clicking the machine never blocks input for a long build.
    if (++work % 8 === 0)
      await new Promise((resolve) => setTimeout(resolve, 0));
  }
  // Only tangible controls and project images become solid objects. Decorative
  // section rules and card borders deliberately have no collision geometry.
  for (const el of container.querySelectorAll(
    ".studio-btn, .btn, .studio-work__feature-visual, .studio-system-compact__visual, .other-build-media",
  )) {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const scale = rect.width / el.offsetWidth;
    const w = Math.ceil(rect.width / scale),
      h = Math.ceil(rect.height / scale);
    const canvas = document.createElement("canvas");
    canvas.width = w + PAD * 2;
    canvas.height = h + PAD * 2;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(
      PAD,
      PAD,
      w,
      h,
      Math.min(parseFloat(getComputedStyle(el).borderRadius) || 0, h / 2),
    );
    ctx.fill();
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const alpha = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels[i * 4 + 3];
    surfaces.push({
      kind: "object",
      el,
      field: inkDistanceField(alpha, canvas.width, canvas.height),
      baseWidth: w,
      x: rect.left + scrollX - PAD * scale,
      y: rect.top + scrollY - PAD * scale,
      scale,
    });
  }
  return surfaces;
}

export function positionTextSurfaces(surfaces) {
  let moved = false;
  for (const surface of surfaces) {
    if (!surface.el.isConnected) continue;
    const r = surface.el.getBoundingClientRect();
    const scale = r.width / surface.baseWidth;
    const x = r.left + scrollX - PAD * scale,
      y = r.top + scrollY - PAD * scale;
    if (
      Math.abs(x - surface.x) +
        Math.abs(y - surface.y) +
        Math.abs(scale - surface.scale) >
      0.1
    )
      moved = true;
    surface.x = x;
    surface.y = y;
    surface.scale = scale;
  }
  return moved;
}
