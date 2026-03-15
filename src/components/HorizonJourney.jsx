import { useRef, useEffect, useMemo, useState } from 'react'
import { useScroll } from 'framer-motion'
import './HorizonJourney.css'

// ═══════════════════════════════════════════
// DETERMINISTIC PSEUDO-RANDOM (seeded)
// ═══════════════════════════════════════════
function srand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function clamp01(t) {
  return Math.max(0, Math.min(1, t))
}

function lerp(a, b, t) {
  return a + (b - a) * t
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

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ═══════════════════════════════════════════
// SKY PALETTES — 5-band gradient for each phase
// [zenith, upper, mid, lower, horizon]
// ═══════════════════════════════════════════
const SKY_NIGHT = [
  [5, 5, 15],
  [8, 8, 20],
  [10, 10, 25],
  [12, 12, 28],
  [15, 15, 32],
]

const SKY_PREDAWN = [
  [10, 15, 35],
  [15, 18, 40],
  [25, 25, 50],
  [50, 35, 55],
  [90, 55, 50],
]

const SKY_DAWN = [
  [30, 55, 95],
  [55, 70, 100],
  [110, 80, 65],
  [200, 125, 55],
  [245, 175, 65],
]

const SKY_MORNING = [
  [70, 120, 180],
  [100, 150, 200],
  [140, 175, 210],
  [180, 200, 220],
  [210, 215, 220],
]

const SKY_NOON = [
  [80, 140, 210],
  [110, 165, 225],
  [150, 190, 235],
  [190, 210, 240],
  [220, 228, 240],
]

const SKY_GOLDEN = [
  [40, 60, 100],
  [70, 65, 80],
  [140, 80, 50],
  [210, 130, 45],
  [250, 180, 55],
]

const SKY_DUSK = [
  [15, 20, 50],
  [30, 25, 55],
  [65, 35, 55],
  [120, 55, 50],
  [180, 90, 50],
]

const SKY_ENDNIGHT = [
  [5, 5, 15],
  [8, 8, 20],
  [10, 10, 25],
  [12, 12, 28],
  [15, 15, 32],
]

// Day cycle palette sequence with scroll breakpoints
const SKY_PHASES = [
  { at: 0.00, palette: SKY_NIGHT },
  { at: 0.06, palette: SKY_PREDAWN },
  { at: 0.12, palette: SKY_DAWN },
  { at: 0.22, palette: SKY_MORNING },
  { at: 0.40, palette: SKY_NOON },
  { at: 0.58, palette: SKY_GOLDEN },
  { at: 0.75, palette: SKY_DUSK },
  { at: 0.88, palette: SKY_ENDNIGHT },
]

function getSkyPalette(progress) {
  // Find which two phases we're between
  for (let i = SKY_PHASES.length - 1; i >= 0; i--) {
    if (progress >= SKY_PHASES[i].at) {
      if (i === SKY_PHASES.length - 1) return SKY_PHASES[i].palette
      const from = SKY_PHASES[i]
      const to = SKY_PHASES[i + 1]
      const t = easeInOutCubic(clamp01((progress - from.at) / (to.at - from.at)))
      return from.palette.map((c, idx) => lerpColor(c, to.palette[idx], t))
    }
  }
  return SKY_PHASES[0].palette
}

function toWaterColor(c) {
  return [
    Math.round(c[0] * 0.55),
    Math.round(c[1] * 0.58 + 3),
    Math.round(c[2] * 0.6 + 5),
  ]
}

// ═══════════════════════════════════════════
// CONTENT STOPS — what appears at each sun position
// ═══════════════════════════════════════════
const CONTENT_STOPS = [
  {
    at: 0.16,         // dawn
    duration: 0.07,
    label: 'Philosophy',
    text: 'Every system has a pattern. I find it.',
    sub: 'Markets, products, teams — I map the terrain before I move.',
  },
  {
    at: 0.28,         // morning
    duration: 0.07,
    label: 'Capability',
    text: 'I build what others just talk about.',
    sub: 'From marketing strategy to product code to AI integration — I close the gap between vision and execution.',
  },
  {
    at: 0.45,         // noon
    duration: 0.07,
    label: 'Identity',
    text: 'Marketing. Product. AI.',
    sub: 'Three disciplines, one operator. The best work happens at the intersection.',
  },
  {
    at: 0.62,         // golden hour
    duration: 0.07,
    label: 'Proof',
    text: 'Five products. Zero handoffs.',
    sub: 'Every product I\'ve launched was conceived, built, branded, and shipped by the same person — me.',
  },
  {
    at: 0.72,         // dusk
    duration: 0.07,
    label: 'Next',
    text: 'The sun sets on the solo chapter.',
    sub: 'I\'m looking for a team that values builders. Let\'s make something worth making.',
  },
]

// ═══════════════════════════════════════════
// STAR FIELD (pre-generated)
// ═══════════════════════════════════════════
function generateStars(count) {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: srand(i * 7 + 1),
      y: srand(i * 13 + 2) * 0.44,  // only in sky half
      size: 0.5 + srand(i * 19 + 3) * 2,
      brightness: 0.3 + srand(i * 29 + 4) * 0.7,
      twinkleSpeed: 1 + srand(i * 37 + 5) * 3,
    })
  }
  return stars
}

// ═══════════════════════════════════════════
// MOUNTAIN LAYER GENERATION
// ═══════════════════════════════════════════
function generateMountainLayer(seed, peakCount, baseY, heightRange, roughness) {
  const points = []
  const segmentCount = 200
  for (let i = 0; i <= segmentCount; i++) {
    const x = i / segmentCount
    // Sum of sine waves for organic mountain shape
    let y = 0
    for (let p = 0; p < peakCount; p++) {
      const freq = 1 + srand(seed + p * 100) * 3
      const amp = srand(seed + p * 200 + 1) * heightRange
      const phase = srand(seed + p * 300 + 2) * Math.PI * 2
      y += Math.sin(x * Math.PI * freq + phase) * amp
    }
    // Add high-freq roughness
    y += (srand(seed + i * 17) - 0.5) * roughness
    points.push({ x, y: baseY - Math.abs(y) })
  }
  return points
}

// ═══════════════════════════════════════════
// TREELINE GENERATION
// ═══════════════════════════════════════════
function generateTreeline(seed, count) {
  const trees = []
  for (let i = 0; i < count; i++) {
    trees.push({
      x: srand(seed + i * 7),
      h: 0.02 + srand(seed + i * 13 + 1) * 0.04,
      w: 0.006 + srand(seed + i * 19 + 2) * 0.007,
    })
  }
  return trees
}

// ═══════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════
function drawHorizon(ctx, w, h, progress, sceneData) {
  ctx.clearRect(0, 0, w, h)

  const horizonY = h * 0.46
  const { stars, mountains, treeline, mist } = sceneData

  // ── Global fade in / out ──
  const fadeIn = clamp01(progress / 0.04)
  const fadeOut = clamp01((progress - 0.90) / 0.08)

  if (fadeIn <= 0) return

  ctx.save()
  ctx.globalAlpha = fadeIn * (1 - fadeOut)

  // ═══════ SKY ═══════
  const skyPalette = getSkyPalette(progress)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
  for (let i = 0; i < skyPalette.length; i++) {
    skyGrad.addColorStop(i / (skyPalette.length - 1), rgb(skyPalette[i]))
  }
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, horizonY + 1)

  // ═══════ STARS ═══════
  // Visible during night/predawn and dusk/endnight
  const starAlpha =
    progress < 0.06 ? 1 :
    progress < 0.15 ? 1 - clamp01((progress - 0.06) / 0.09) :
    progress > 0.72 ? clamp01((progress - 0.72) / 0.08) :
    0

  if (starAlpha > 0.01) {
    for (const star of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(progress * star.twinkleSpeed * 40 + star.x * 100)
      const alpha = starAlpha * star.brightness * twinkle
      if (alpha < 0.02) continue
      ctx.fillStyle = rgb([255, 252, 245], alpha)
      ctx.beginPath()
      ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ═══════ HORIZON GLOW ═══════
  // Warm glow near horizon — strongest at dawn and golden hour
  const dawnGlow = clamp01((progress - 0.06) / 0.08) * (1 - clamp01((progress - 0.22) / 0.10))
  const goldenGlow = clamp01((progress - 0.55) / 0.08) * (1 - clamp01((progress - 0.78) / 0.08))
  const glowIntensity = Math.max(dawnGlow, goldenGlow)

  if (glowIntensity > 0.01) {
    // Sun X position determines glow center
    const sunArc = clamp01((progress - 0.08) / 0.72)
    const sunX = w * (0.15 + sunArc * 0.7)

    const gg = ctx.createRadialGradient(
      sunX, horizonY, 0,
      sunX, horizonY, w * 0.5
    )
    gg.addColorStop(0, rgb([255, 170, 50], glowIntensity * 0.25))
    gg.addColorStop(0.2, rgb([255, 140, 40], glowIntensity * 0.12))
    gg.addColorStop(0.5, rgb([220, 100, 30], glowIntensity * 0.04))
    gg.addColorStop(1, 'rgba(220,100,30,0)')
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, w, h)
  }

  // ═══════ SUN ═══════
  // Arc from east (left) to west (right)
  const sunVisible = progress > 0.08 && progress < 0.82
  let sunX = 0, sunY = 0, sunR = 0

  if (sunVisible) {
    const sunArc = clamp01((progress - 0.08) / 0.72)
    sunX = w * (0.15 + sunArc * 0.7)

    // Parabolic arc: highest at noon
    const arcHeight = h * 0.35
    sunY = horizonY - Math.sin(sunArc * Math.PI) * arcHeight

    // Sun rises from horizon and sets into it
    const riseP = clamp01((progress - 0.08) / 0.06)
    const setP = clamp01((progress - 0.76) / 0.06)
    const verticalOffset = horizonY - sunY
    sunY = horizonY - verticalOffset * easeOutCubic(riseP) * (1 - easeOutCubic(setP))

    sunR = Math.min(w, h) * 0.03

    // Make sun slightly larger at dawn/dusk (atmospheric effect)
    const edgeFactor = 1 + 0.4 * (1 - Math.sin(sunArc * Math.PI))
    sunR *= edgeFactor

    // Sun color shifts: orange at edges, yellow-white at noon
    const noonness = Math.sin(sunArc * Math.PI)
    const sunCoreColor = lerpColor([255, 180, 60], [255, 250, 220], noonness)
    const sunEdgeColor = lerpColor([255, 140, 30], [255, 220, 150], noonness)

    // Outer corona
    const coronaR = sunR * 10
    const cg = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, coronaR)
    cg.addColorStop(0, rgb(sunEdgeColor, 0.15))
    cg.addColorStop(0.15, rgb(sunEdgeColor, 0.06))
    cg.addColorStop(0.4, rgb(sunEdgeColor, 0.02))
    cg.addColorStop(1, 'rgba(255,200,100,0)')
    ctx.fillStyle = cg
    ctx.fillRect(sunX - coronaR, sunY - coronaR, coronaR * 2, coronaR * 2)

    // Inner glow
    const innerR = sunR * 3.5
    const ig = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, innerR)
    ig.addColorStop(0, rgb(sunCoreColor, 0.3))
    ig.addColorStop(0.4, rgb(sunEdgeColor, 0.1))
    ig.addColorStop(1, 'rgba(255,200,100,0)')
    ctx.fillStyle = ig
    ctx.beginPath()
    ctx.arc(sunX, sunY, innerR, 0, Math.PI * 2)
    ctx.fill()

    // Sun disc
    const dg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
    dg.addColorStop(0, rgb([255, 255, 245], 1))
    dg.addColorStop(0.5, rgb(sunCoreColor, 1))
    dg.addColorStop(1, rgb(sunEdgeColor, 0.95))
    ctx.beginPath()
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
    ctx.fillStyle = dg
    ctx.fill()

    // Lens flare rays (subtle)
    if (noonness < 0.7) {
      const rayCount = 6
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2 + progress * 0.5
        const rayLen = sunR * (4 + srand(r * 31) * 4)
        const rayW = sunR * 0.15
        ctx.save()
        ctx.translate(sunX, sunY)
        ctx.rotate(angle)
        const rg = ctx.createLinearGradient(0, 0, rayLen, 0)
        rg.addColorStop(0, rgb(sunCoreColor, 0.12 * (1 - noonness)))
        rg.addColorStop(1, 'rgba(255,200,100,0)')
        ctx.fillStyle = rg
        ctx.fillRect(0, -rayW / 2, rayLen, rayW)
        ctx.restore()
      }
    }
  }

  // ═══════ MOUNTAINS (back layer — distant, lighter) ═══════
  const mtns = mountains
  const mtAlpha = clamp01((progress - 0.04) / 0.06)

  if (mtAlpha > 0) {
    // Distant mountains
    const distColor = lerpColor(
      skyPalette[3],
      lerpColor(skyPalette[3], [40, 50, 60], 0.4),
      0.5
    )
    ctx.fillStyle = rgb(distColor, mtAlpha * 0.6)
    ctx.beginPath()
    ctx.moveTo(0, horizonY)
    for (const p of mtns.distant) {
      ctx.lineTo(p.x * w, p.y * h)
    }
    ctx.lineTo(w, horizonY)
    ctx.closePath()
    ctx.fill()

    // Mid mountains
    const midColor = lerpColor(
      skyPalette[4],
      [20, 35, 25],
      0.6
    )
    ctx.fillStyle = rgb(midColor, mtAlpha * 0.75)
    ctx.beginPath()
    ctx.moveTo(0, horizonY)
    for (const p of mtns.mid) {
      ctx.lineTo(p.x * w, p.y * h)
    }
    ctx.lineTo(w, horizonY)
    ctx.closePath()
    ctx.fill()

    // Near hills
    ctx.fillStyle = rgb([10, 22, 16], mtAlpha * 0.9)
    ctx.beginPath()
    ctx.moveTo(0, horizonY)
    for (const p of mtns.near) {
      ctx.lineTo(p.x * w, p.y * h)
    }
    ctx.lineTo(w, horizonY)
    ctx.closePath()
    ctx.fill()
  }

  // ═══════ TREELINE ═══════
  if (mtAlpha > 0) {
    ctx.beginPath()
    for (const t of treeline) {
      const x = t.x * w
      const th = t.h * h
      const tw = t.w * h
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
    ctx.fillStyle = rgb([6, 14, 10], mtAlpha * 0.95)
    ctx.fill()
  }

  // ═══════ WATER ═══════
  const waterPalette = skyPalette.map(c => toWaterColor(c)).reverse()
  const waterGrad = ctx.createLinearGradient(0, horizonY, 0, h)
  for (let i = 0; i < waterPalette.length; i++) {
    waterGrad.addColorStop(i / (waterPalette.length - 1), rgb(waterPalette[i]))
  }
  ctx.fillStyle = waterGrad
  ctx.fillRect(0, horizonY, w, h - horizonY)

  // Water horizon glow
  if (glowIntensity > 0.01) {
    const sunArc = clamp01((progress - 0.08) / 0.72)
    const gSunX = w * (0.15 + sunArc * 0.7)
    const wg = ctx.createRadialGradient(
      gSunX, horizonY, 0,
      gSunX, horizonY + h * 0.12, w * 0.35
    )
    wg.addColorStop(0, rgb([230, 150, 50], glowIntensity * 0.15))
    wg.addColorStop(0.3, rgb([200, 120, 40], glowIntensity * 0.06))
    wg.addColorStop(1, 'rgba(200,120,40,0)')
    ctx.fillStyle = wg
    ctx.fillRect(0, horizonY, w, h - horizonY)
  }

  // ═══════ MOUNTAIN + TREE REFLECTIONS IN WATER ═══════
  if (mtAlpha > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, horizonY, w, h - horizonY)
    ctx.clip()

    // Flip vertically around horizon
    ctx.translate(0, horizonY * 2)
    ctx.scale(1, -1)

    // Reflected mountains (fainter)
    ctx.globalAlpha = fadeIn * (1 - fadeOut) * mtAlpha * 0.12

    ctx.fillStyle = rgb([10, 22, 16], 1)
    ctx.beginPath()
    ctx.moveTo(0, horizonY)
    for (const p of mtns.near) {
      ctx.lineTo(p.x * w, p.y * h)
    }
    ctx.lineTo(w, horizonY)
    ctx.closePath()
    ctx.fill()

    // Reflected treeline
    ctx.beginPath()
    for (const t of treeline) {
      const x = t.x * w
      const th = t.h * h
      const tw = t.w * h
      ctx.moveTo(x, horizonY - th * 0.25)
      ctx.lineTo(x - tw * 0.5, horizonY + 2)
      ctx.lineTo(x + tw * 0.5, horizonY + 2)
      ctx.moveTo(x, horizonY - th * 0.65)
      ctx.lineTo(x - tw * 0.38, horizonY - th * 0.15)
      ctx.lineTo(x + tw * 0.38, horizonY - th * 0.15)
    }
    ctx.fillStyle = rgb([6, 14, 10], 1)
    ctx.fill()

    ctx.restore()
  }

  // ═══════ SUN REFLECTION ON WATER ═══════
  if (sunVisible) {
    const colW = sunR * 1.2
    const waterH = h - horizonY
    const strips = 40

    for (let i = 0; i < strips; i++) {
      const t = i / strips
      const stripY = horizonY + t * waterH * 0.8
      const stripH = (waterH * 0.8) / strips
      const waveX = Math.sin(t * 14 + progress * 10) * (2 + t * 12)
      const alpha = 0.28 * (1 - t * 0.85)
      const stripW = colW * (1.5 + t * 3)

      const noonness = Math.sin(clamp01((progress - 0.08) / 0.72) * Math.PI)
      const refColor = lerpColor([255, 180, 80], [255, 240, 200], noonness)

      ctx.fillStyle = rgb(refColor, alpha)
      ctx.fillRect(sunX - stripW / 2 + waveX, stripY, stripW, stripH + 1)
    }
  }

  // ═══════ WATER SURFACE TEXTURE ═══════
  const dayBrightness = Math.sin(clamp01((progress - 0.08) / 0.72) * Math.PI)
  if (dayBrightness > 0.05) {
    ctx.beginPath()
    for (let y = horizonY + 3; y < h; y += 7) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.strokeStyle = rgb([255, 255, 255], dayBrightness * 0.015)
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // ═══════ MIST ═══════
  // Morning and evening mist
  const morningMist = clamp01((progress - 0.12) / 0.08) * (1 - clamp01((progress - 0.30) / 0.10))
  const eveningMist = clamp01((progress - 0.68) / 0.08) * (1 - clamp01((progress - 0.82) / 0.06))
  const mistAlpha = Math.max(morningMist, eveningMist)

  if (mistAlpha > 0.01) {
    for (const m of mist) {
      const mx = m.x * w
      const my = horizonY + m.yOff * h
      const mw = m.w * w
      const drift = Math.sin(m.x * 10 + progress * 4) * 20

      const mg = ctx.createRadialGradient(
        mx + drift, my, 0,
        mx + drift, my, mw
      )
      mg.addColorStop(0, rgb([210, 210, 200], mistAlpha * m.op * 0.07))
      mg.addColorStop(0.5, rgb([210, 210, 200], mistAlpha * m.op * 0.03))
      mg.addColorStop(1, 'rgba(210,210,200,0)')
      ctx.fillStyle = mg
      ctx.fillRect(mx + drift - mw, my - mw * 0.3, mw * 2, mw * 0.6)
    }
  }

  // ═══════ CONTENT STOP — WATER RIPPLE EFFECT ═══════
  // Draw concentric ripple rings on the water when a content stop is active
  for (const stop of CONTENT_STOPS) {
    const stopProgress = clamp01((progress - stop.at) / stop.duration)
    const stopFade = stopProgress < 0.15
      ? stopProgress / 0.15
      : stopProgress > 0.85
        ? (1 - stopProgress) / 0.15
        : 1

    if (stopFade > 0.01) {
      const rippleCenterX = w * 0.5
      const rippleCenterY = horizonY + (h - horizonY) * 0.3

      // Multiple expanding rings
      for (let ring = 0; ring < 4; ring++) {
        const ringProgress = (stopProgress * 2 + ring * 0.25) % 1
        const ringRadius = ringProgress * Math.min(w, h) * 0.25
        const ringAlpha = stopFade * (1 - ringProgress) * 0.12

        if (ringAlpha > 0.005) {
          ctx.beginPath()
          ctx.ellipse(rippleCenterX, rippleCenterY, ringRadius, ringRadius * 0.3, 0, 0, Math.PI * 2)
          ctx.strokeStyle = rgb([255, 250, 240], ringAlpha)
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }
    }
  }

  // ═══════ VIGNETTE ═══════
  // Subtle vignette at all times, stronger at night
  const vignetteStrength = 0.3 + (1 - dayBrightness) * 0.3
  const vg = ctx.createRadialGradient(
    w * 0.5, h * 0.5, Math.min(w, h) * 0.3,
    w * 0.5, h * 0.5, Math.max(w, h) * 0.8
  )
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, rgb([0, 0, 0], vignetteStrength))
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, w, h)

  ctx.restore()
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════
function HorizonJourney() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const progressRef = useRef(0)
  const animFrameRef = useRef(null)
  const [activeStop, setActiveStop] = useState(-1)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Generate all scene data ONCE
  const sceneData = useMemo(() => {
    const stars = generateStars(200)
    const mountains = {
      distant: generateMountainLayer(42, 5, 0.42, 0.06, 0.003),
      mid: generateMountainLayer(99, 4, 0.44, 0.04, 0.004),
      near: generateMountainLayer(177, 3, 0.455, 0.02, 0.002),
    }
    const treeline = generateTreeline(500, 70)
    const mist = []
    for (let i = 0; i < 12; i++) {
      mist.push({
        x: srand(i * 17 + 300) * 0.9 + 0.05,
        yOff: srand(i * 23 + 301) * 0.04 - 0.01,
        w: 0.07 + srand(i * 29 + 302) * 0.14,
        op: 0.4 + srand(i * 37 + 304) * 0.6,
      })
    }
    return { stars, mountains, treeline, mist }
  }, [])

  // Scroll listener
  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      progressRef.current = v

      // Determine active content stop
      let found = -1
      for (let i = 0; i < CONTENT_STOPS.length; i++) {
        const stop = CONTENT_STOPS[i]
        const stopP = clamp01((v - stop.at) / stop.duration)
        if (stopP > 0.05 && stopP < 0.95) {
          found = i
        }
      }
      setActiveStop(found)
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
      drawHorizon(ctx, cw, ch, progressRef.current, sceneData)
      animFrameRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [sceneData])

  return (
    <section className="horizon-section" ref={sectionRef}>
      <div className="horizon-sticky" ref={containerRef}>
        <canvas ref={canvasRef} className="horizon-canvas" />

        {/* Content overlay */}
        <div className="horizon-content-layer">
          {CONTENT_STOPS.map((stop, i) => (
            <div
              key={i}
              className={`horizon-stop ${activeStop === i ? 'horizon-stop--active' : ''}`}
            >
              <div className="horizon-stop-inner">
                <span className="horizon-stop-label">{stop.label}</span>
                <p className="horizon-stop-text">{stop.text}</p>
                {stop.sub && <p className="horizon-stop-sub">{stop.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HorizonJourney
