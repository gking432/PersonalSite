import { useRef, useEffect, useMemo } from 'react'
import { useScroll } from 'framer-motion'
import './LakeDawn.css'

// ═══════════════════════════════════════════
// DETERMINISTIC PSEUDO-RANDOM (seeded by index)
// No Math.random() in the render loop = no flickering
// ═══════════════════════════════════════════
function srand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function clamp01(t) {
  return Math.max(0, Math.min(1, t))
}

function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function rgb(c, a) {
  return a !== undefined
    ? `rgba(${c[0]},${c[1]},${c[2]},${a})`
    : `rgb(${c[0]},${c[1]},${c[2]})`
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

// ═══════════════════════════════════════════
// COLOR PALETTES
// [top, upper, mid, lower, horizon]
// ═══════════════════════════════════════════
const SKY_NIGHT = [
  [8, 10, 18],
  [10, 12, 22],
  [12, 14, 26],
  [14, 16, 28],
  [16, 18, 32],
]

const SKY_DAWN = [
  [28, 48, 78],
  [50, 55, 75],
  [95, 65, 60],
  [185, 110, 55],
  [235, 165, 60],
]

function toWaterColor(c) {
  return [
    Math.round(c[0] * 0.6),
    Math.round(c[1] * 0.65 + 4),
    Math.round(c[2] * 0.65 + 6),
  ]
}

// ═══════════════════════════════════════════
// TREE RENDERING
// ═══════════════════════════════════════════
function drawTreeLayer(ctx, w, horizonY, layer, h) {
  ctx.beginPath()
  for (const t of layer) {
    const x = t.x * w
    const th = t.h * h
    const tw = t.w * h

    // 3-tier pine silhouette
    ctx.moveTo(x, horizonY - th * 0.25)
    ctx.lineTo(x - tw * 0.5, horizonY + 2)
    ctx.lineTo(x + tw * 0.5, horizonY + 2)

    ctx.moveTo(x, horizonY - th * 0.65)
    ctx.lineTo(x - tw * 0.38, horizonY - th * 0.15)
    ctx.lineTo(x + tw * 0.38, horizonY - th * 0.15)

    ctx.moveTo(x, horizonY - th)
    ctx.lineTo(x - tw * 0.22, horizonY - th * 0.45)
    ctx.lineTo(x + tw * 0.22, horizonY - th * 0.45)
  }
  ctx.fill()
}

// ═══════════════════════════════════════════
// MAIN RENDER FUNCTION
// Entirely deterministic — no randomness per frame
// ═══════════════════════════════════════════
function drawLakeDawn(ctx, w, h, progress, trees) {
  ctx.clearRect(0, 0, w, h)

  const horizonY = h * 0.46

  // ── Phase calculations ──
  const fadeIn  = clamp01(progress / 0.08)
  const skyP    = clamp01((progress - 0.08) / 0.58)
  const glowP   = clamp01((progress - 0.15) / 0.30)
  const treeP   = clamp01((progress - 0.20) / 0.30)
  const sunP    = clamp01((progress - 0.30) / 0.35)
  const mistP   = clamp01((progress - 0.50) / 0.20)
  const fadeOut  = clamp01((progress - 0.88) / 0.10)

  if (fadeIn <= 0) return

  ctx.save()
  ctx.globalAlpha = fadeIn

  // ═══════ SKY ═══════
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
  for (let i = 0; i < SKY_NIGHT.length; i++) {
    const c = lerpColor(SKY_NIGHT[i], SKY_DAWN[i], skyP)
    skyGrad.addColorStop(i / (SKY_NIGHT.length - 1), rgb(c))
  }
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, horizonY + 1)

  // ═══════ HORIZON GLOW ═══════
  if (glowP > 0) {
    const gg = ctx.createRadialGradient(
      w * 0.5, horizonY, 0,
      w * 0.5, horizonY, w * 0.45
    )
    gg.addColorStop(0, rgb([220, 140, 50], glowP * 0.20))
    gg.addColorStop(0.3, rgb([200, 110, 45], glowP * 0.08))
    gg.addColorStop(0.7, rgb([180, 90, 40], glowP * 0.02))
    gg.addColorStop(1, 'rgba(180,90,40,0)')
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, w, h)
  }

  // ═══════ SUN ═══════
  if (sunP > 0) {
    const sunR = Math.min(w, h) * 0.035
    const sunX = w * 0.5
    const sunY = horizonY - easeOutCubic(sunP) * h * 0.14

    // Outer glow
    const outerR = sunR * 8
    const og = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, outerR)
    og.addColorStop(0, rgb([255, 200, 80], sunP * 0.12))
    og.addColorStop(0.4, rgb([255, 160, 60], sunP * 0.04))
    og.addColorStop(1, 'rgba(255,160,60,0)')
    ctx.fillStyle = og
    ctx.fillRect(sunX - outerR, sunY - outerR, outerR * 2, outerR * 2)

    // Inner glow
    const innerR = sunR * 3
    const ig = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, innerR)
    ig.addColorStop(0, rgb([255, 230, 160], sunP * 0.25))
    ig.addColorStop(0.5, rgb([255, 200, 100], sunP * 0.08))
    ig.addColorStop(1, 'rgba(255,200,100,0)')
    ctx.fillStyle = ig
    ctx.beginPath()
    ctx.arc(sunX, sunY, innerR, 0, Math.PI * 2)
    ctx.fill()

    // Sun disc
    const dg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
    dg.addColorStop(0, rgb([255, 245, 210], sunP))
    dg.addColorStop(0.6, rgb([255, 215, 120], sunP))
    dg.addColorStop(1, rgb([255, 195, 80], sunP * 0.9))
    ctx.beginPath()
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
    ctx.fillStyle = dg
    ctx.fill()
  }

  // ═══════ WATER ═══════
  const waterGrad = ctx.createLinearGradient(0, horizonY, 0, h)
  for (let i = 0; i < SKY_NIGHT.length; i++) {
    const srcIdx = SKY_NIGHT.length - 1 - i
    const skyC = lerpColor(SKY_NIGHT[srcIdx], SKY_DAWN[srcIdx], skyP)
    const wc = toWaterColor(skyC)
    waterGrad.addColorStop(i / (SKY_NIGHT.length - 1), rgb(wc))
  }
  ctx.fillStyle = waterGrad
  ctx.fillRect(0, horizonY, w, h - horizonY)

  // Water horizon glow reflection
  if (glowP > 0) {
    const wg = ctx.createRadialGradient(
      w * 0.5, horizonY, 0,
      w * 0.5, horizonY + h * 0.1, w * 0.4
    )
    wg.addColorStop(0, rgb([200, 120, 40], glowP * 0.12))
    wg.addColorStop(0.4, rgb([180, 100, 35], glowP * 0.04))
    wg.addColorStop(1, 'rgba(180,100,35,0)')
    ctx.fillStyle = wg
    ctx.fillRect(0, horizonY, w, h - horizonY)
  }

  // Sun reflection — shimmering vertical column
  if (sunP > 0) {
    const sunX = w * 0.5
    const colW = Math.min(w, h) * 0.035
    const waterH = h - horizonY
    const strips = 30

    for (let i = 0; i < strips; i++) {
      const t = i / strips
      const stripY = horizonY + t * waterH * 0.75
      const stripH = (waterH * 0.75) / strips
      const waveX = Math.sin(t * 12 + progress * 8) * (3 + t * 8)
      const alpha = sunP * 0.22 * (1 - t * 0.8)
      const stripW = colW * (1.2 + t * 2)

      ctx.fillStyle = rgb([255, 210, 110], alpha)
      ctx.fillRect(sunX - stripW / 2 + waveX, stripY, stripW, stripH + 1)
    }
  }

  // Subtle water surface texture
  if (skyP > 0.1) {
    ctx.beginPath()
    for (let y = horizonY + 4; y < h; y += 8) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.strokeStyle = rgb([255, 255, 255], skyP * 0.012)
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // ═══════ TREELINE ═══════
  if (treeP > 0) {
    // Background trees (smaller, lighter)
    ctx.fillStyle = rgb([8, 14, 10], treeP * 0.7)
    drawTreeLayer(ctx, w, horizonY, trees.bg, h)

    // Foreground trees (taller, darker)
    ctx.fillStyle = rgb([6, 10, 8], treeP * 0.9)
    drawTreeLayer(ctx, w, horizonY, trees.fg, h)

    // Tree reflections in water
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, horizonY, w, h - horizonY)
    ctx.clip()

    // Flip coordinate system around horizon line
    ctx.translate(0, horizonY * 2)
    ctx.scale(1, -1)

    ctx.fillStyle = rgb([6, 10, 8], treeP * 0.15)
    drawTreeLayer(ctx, w, horizonY, trees.bg, h)
    drawTreeLayer(ctx, w, horizonY, trees.fg, h)

    ctx.restore()
  }

  // ═══════ MIST ═══════
  if (mistP > 0) {
    for (const m of trees.mist) {
      const mx = m.x * w
      const my = horizonY + m.yOff * h
      const mw = m.w * w
      const drift = Math.sin(m.x * 10 + progress * 3) * 15

      const mg = ctx.createRadialGradient(
        mx + drift, my, 0,
        mx + drift, my, mw
      )
      mg.addColorStop(0, rgb([200, 200, 195], mistP * m.op * 0.06))
      mg.addColorStop(0.5, rgb([200, 200, 195], mistP * m.op * 0.03))
      mg.addColorStop(1, 'rgba(200,200,195,0)')
      ctx.fillStyle = mg
      ctx.fillRect(mx + drift - mw, my - mw * 0.3, mw * 2, mw * 0.6)
    }
  }

  // ═══════ FADE OUT ═══════
  if (fadeOut > 0) {
    ctx.fillStyle = rgb([10, 12, 11], fadeOut)
    ctx.fillRect(0, 0, w, h)
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════
function LakeDawn() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const progressRef = useRef(0)
  const animFrameRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Generate all random data ONCE — deterministic, no flicker
  const trees = useMemo(() => {
    const bg = []
    const fg = []
    const mist = []

    // Background treeline (shorter, sparser)
    for (let i = 0; i < 35; i++) {
      bg.push({
        x: srand(i * 3 + 1) * 1.1 - 0.05,
        h: 0.025 + srand(i * 7 + 2) * 0.04,
        w: 0.008 + srand(i * 11 + 3) * 0.008,
      })
    }

    // Foreground treeline (taller, denser)
    for (let i = 0; i < 50; i++) {
      fg.push({
        x: srand(i * 5 + 100) * 1.1 - 0.05,
        h: 0.035 + srand(i * 9 + 101) * 0.055,
        w: 0.009 + srand(i * 13 + 102) * 0.01,
      })
    }

    // Mist patches near water surface
    for (let i = 0; i < 10; i++) {
      mist.push({
        x: srand(i * 17 + 200) * 0.9 + 0.05,
        yOff: srand(i * 23 + 201) * 0.04 - 0.01,
        w: 0.06 + srand(i * 29 + 202) * 0.12,
        op: 0.4 + srand(i * 37 + 204) * 0.6,
      })
    }

    return { bg, fg, mist }
  }, [])

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      progressRef.current = v
    })
  }, [scrollYProgress])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let cw = 0, ch = 0

    function resize() {
      cw = container.clientWidth
      ch = container.clientHeight
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    function render() {
      drawLakeDawn(ctx, cw, ch, progressRef.current, trees)
      animFrameRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [trees])

  return (
    <section className="lake-section" ref={sectionRef}>
      <div className="lake-sticky" ref={containerRef}>
        <canvas ref={canvasRef} className="lake-canvas" />
      </div>
    </section>
  )
}

export default LakeDawn
