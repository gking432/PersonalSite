// Keep the camera anchored to its original place in the hero, but give it the
// surrounding page as a drawing surface. Only the actual text gets a halo.
export function createPageLayout(host, onChange) {
  const surface = host.parentElement;
  const anchor = surface.parentElement;
  const hero = host.closest(".studio-hero");
  const proof = hero?.nextElementSibling;
  const nextPanel = proof?.nextElementSibling?.querySelector(".studio-panel");
  const caption = anchor.parentElement.querySelector(".traffic-city__caption");
  const mask = document.createElement("canvas");
  let boxes = [],
    frame = 0,
    enterFrame = 0,
    disposed = false,
    signature = "";
  let layout = { width: 1, height: 1, anchorX: 0, anchorY: 0, scale: 1 };

  function measure() {
    if (disposed || !anchor.offsetWidth) return;
    if (!hero) {
      const width = anchor.clientWidth,
        height = anchor.clientHeight;
      const next = `${width}:${height}`;
      if (next === signature) return;
      signature = next;
      layout = {
        width,
        height,
        anchorX: width / 2,
        anchorY: height / 2,
        scale: Math.min(width / 43, height / 31),
      };
      // The standalone city owns its viewport; no portfolio text masks.
      onChange();
      return;
    }
    const a = anchor.getBoundingClientRect(),
      h = hero.getBoundingClientRect();
    const bottom = nextPanel
      ? nextPanel.getBoundingClientRect().top + 64
      : proof?.getBoundingClientRect().bottom || h.bottom;
    const width = document.documentElement.clientWidth;
    const height = Math.ceil(bottom - h.top);
    Object.assign(surface.style, {
      left: `${-a.left}px`,
      top: `${h.top - a.top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    layout = {
      width,
      height,
      anchorX: a.left + a.width / 2,
      anchorY: a.top + a.height / 2 - h.top,
      scale: a.width / 43,
    };
    const rects = [];
    const add = (r, padding = 12) => {
      if (r.width < 1 || r.height < 1) return;
      rects.push({
        x: r.left - padding,
        y: r.top - h.top - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      });
    };
    // Text ranges follow line wraps, rather than masking a whole column.
    for (const root of [
      hero.querySelector(".studio-headline"),
      hero.querySelector(".studio-sub"),
      proof,
      caption?.querySelector("span"),
      caption?.querySelector(".traffic-city__weather"),
    ]) {
      if (!root) continue;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) add(rect);
      }
    }
    for (const node of hero.querySelectorAll(
      ".studio-status, .studio-hero__actions a, .traffic-city__controls button",
    ))
      add(node.getBoundingClientRect(), 14);
    boxes = rects;
    const next = JSON.stringify([
      layout,
      rects.map((r) => Object.values(r).map(Math.round)),
    ]);
    if (next === signature) return;
    signature = next;
    mask.width = width;
    mask.height = height;
    const ctx = mask.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "destination-out";
    for (const r of boxes) {
      // Overlapping translucent outlines form a continuous falloff. Keeping a
      // solid core protects the ink without a hard rounded-rectangle edge.
      for (let spread = 32; spread > 0; spread--) {
        ctx.globalAlpha = (1 - spread / 33) * 0.2;
        ctx.beginPath();
        ctx.roundRect(
          r.x - spread,
          r.y - spread,
          r.width + spread * 2,
          r.height + spread * 2,
          Math.min(24, r.height / 2) + spread,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.roundRect(r.x, r.y, r.width, r.height, Math.min(24, r.height / 2));
      ctx.fill();
    }
    host.style.setProperty("--city-content-mask", `url("${mask.toDataURL()}")`);
    onChange();
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  }
  const resize = new ResizeObserver(schedule);
  for (const node of [anchor, hero, proof, caption, nextPanel])
    if (node) resize.observe(node);
  const content = new MutationObserver(schedule);
  if (caption)
    content.observe(caption, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  window.addEventListener("resize", schedule);
  document.fonts?.ready.then(() => {
    if (!disposed) schedule();
  });
  // The copy enters with a short transform animation. Follow it until settled.
  const started = performance.now();
  function enter() {
    measure();
    if (!disposed && performance.now() - started < 1800)
      enterFrame = requestAnimationFrame(enter);
  }
  enterFrame = requestAnimationFrame(enter);
  return {
    get view() {
      return layout;
    },
    protects(x, y, padding = 12) {
      return boxes.some(
        (r) =>
          x > r.x - padding &&
          x < r.x + r.width + padding &&
          y > r.y - padding &&
          y < r.y + r.height + padding,
      );
    },
    diagnostics: () => ({ ...layout, halos: boxes, mask: "content" }),
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(enterFrame);
      resize.disconnect();
      content.disconnect();
      window.removeEventListener("resize", schedule);
    },
  };
}
