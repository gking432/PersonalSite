import { useRef, useEffect, useMemo } from 'react'
import { useScroll, useTransform, useSpring, motion } from 'framer-motion'
import './HorizonJourney.css'

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
function srand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function clamp01(t) { return Math.max(0, Math.min(1, t)) }
function lerp(a, b, t) { return a + (b - a) * t }

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

function easeOutCubic(t) { return 1 - (1 - t) ** 3 }
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ═══════════════════════════════════════════
// SKY PALETTES — [zenith, upper, mid, lower, horizon]
// ═══════════════════════════════════════════
const SKY_NIGHT    = [[5,5,15],[8,8,20],[10,10,25],[12,12,28],[15,15,32]]
const SKY_PREDAWN  = [[10,15,35],[15,18,40],[25,25,50],[50,35,55],[90,55,50]]
const SKY_DAWN     = [[30,55,95],[55,70,100],[110,80,65],[200,125,55],[245,175,65]]
const SKY_MORNING  = [[70,120,180],[100,150,200],[140,175,210],[180,200,220],[210,215,220]]
const SKY_NOON     = [[80,140,210],[110,165,225],[150,190,235],[190,210,240],[220,228,240]]
const SKY_GOLDEN   = [[40,60,100],[70,65,80],[140,80,50],[210,130,45],[250,180,55]]
const SKY_DUSK     = [[15,20,50],[30,25,55],[65,35,55],[120,55,50],[180,90,50]]
const SKY_ENDNIGHT = [[5,5,15],[8,8,20],[10,10,25],[12,12,28],[15,15,32]]

const SKY_PHASES = [
  { at: 0.00, palette: SKY_NIGHT },
  { at: 0.12, palette: SKY_PREDAWN },
  { at: 0.18, palette: SKY_DAWN },
  { at: 0.22, palette: SKY_MORNING },
  { at: 0.40, palette: SKY_NOON },
  { at: 0.58, palette: SKY_GOLDEN },
  { at: 0.75, palette: SKY_DUSK },
  { at: 0.88, palette: SKY_ENDNIGHT },
]

function getSkyPalette(progress) {
  for (let i = SKY_PHASES.length - 1; i >= 0; i--) {
    if (progress >= SKY_PHASES[i].at) {
      if (i === SKY_PHASES.length - 1) return SKY_PHASES[i].palette
      const from = SKY_PHASES[i], to = SKY_PHASES[i + 1]
      const t = easeInOutCubic(clamp01((progress - from.at) / (to.at - from.at)))
      return from.palette.map((c, idx) => lerpColor(c, to.palette[idx], t))
    }
  }
  return SKY_PHASES[0].palette
}

function toWaterColor(c) {
  return [Math.round(c[0]*0.55), Math.round(c[1]*0.58+3), Math.round(c[2]*0.6+5)]
}

// ═══════════════════════════════════════════
// CONTENT STOPS — 5 environmental reveals
// NOW OVERLAPPING: each transition bleeds into the next
// ═══════════════════════════════════════════
const CONTENT_STOPS = [
  {
    at: 0.02, duration: 0.16, reveal: 'constellation',
    label: 'PHILOSOPHY',
    text: ['Structure before decisions.'],
    sub: 'Markets, products, and teams usually follow patterns.',
  },
  {
    at: 0.18, duration: 0.24, reveal: 'cloud',
    label: 'CAPABILITY',
    text: ['Problems become solutions.'],
    sub: 'I turn ideas into working systems.',
  },
  {
    at: 0.36, duration: 0.18, reveal: 'sunbeam',
    label: 'IDENTITY',
    text: ['Marketing. Product. Technology.'],
    sub: 'Three disciplines that work better when treated as one.',
  },
  {
    at: 0.48, duration: 0.20, reveal: 'mist',
    label: 'PROOF',
    text: ['I stay close to the work', "until it's real."],
    sub: 'From early ideas through to something people actually use.',
  },
  {
    at: 0.64, duration: 0.22, reveal: 'reflection',
    label: 'NEXT',
    text: ["I'm looking for the right problems", 'to work on next.'],
    sub: '',
  },
]

/**
 * Cloud reveal: blob targets come from sampleTextPixels() (rasterized glyph mask).
 * Kept separate from visible CAPABILITY copy so headline edits don’t reshuffle clouds.
 * This two-line shape matches the original “I turn ideas into / working systems.” layout
 * the effect was tuned for — change only if you want a new silhouette on purpose.
 */
const CLOUD_REVEAL_SAMPLE_LINES = ['I turn ideas into', 'working systems.']

/** Subtext may be a single string or multiple lines (canvas has no wrap). */
function subTextLines(stop) {
  if (stop.sub == null || stop.sub === '') return []
  return Array.isArray(stop.sub) ? stop.sub : [stop.sub]
}

// ═══════════════════════════════════════════
// TEXT PARTICLE SAMPLING
// ═══════════════════════════════════════════
// 3-4 simple constellations that span behind the text area
// Each is defined in normalized coords (0–1) relative to the text block
function generateConstellations(seed) {
  const constellations = [
    // Upper-left: a gentle arc (like Cassiopeia)
    {
      stars: [
        { x: 0.08, y: 0.15 }, { x: 0.16, y: 0.08 }, { x: 0.26, y: 0.12 },
        { x: 0.34, y: 0.05 }, { x: 0.42, y: 0.10 },
      ],
      edges: [[0,1],[1,2],[2,3],[3,4]],
    },
    // Center-right: a kite / diamond shape
    {
      stars: [
        { x: 0.62, y: 0.10 }, { x: 0.72, y: 0.25 }, { x: 0.62, y: 0.45 },
        { x: 0.52, y: 0.25 }, { x: 0.78, y: 0.08 },
      ],
      edges: [[0,1],[1,2],[2,3],[3,0],[0,4]],
    },
    // Lower-left: a small triangle with tail
    {
      stars: [
        { x: 0.12, y: 0.55 }, { x: 0.22, y: 0.48 }, { x: 0.20, y: 0.65 },
        { x: 0.30, y: 0.72 }, { x: 0.06, y: 0.70 },
      ],
      edges: [[0,1],[1,2],[2,0],[2,3],[0,4]],
    },
    // Lower-right: a zigzag line (like part of Orion's belt extended)
    {
      stars: [
        { x: 0.58, y: 0.60 }, { x: 0.68, y: 0.55 }, { x: 0.76, y: 0.65 },
        { x: 0.85, y: 0.58 }, { x: 0.92, y: 0.68 }, { x: 0.88, y: 0.78 },
      ],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5]],
    },
  ]

  // Flatten into the points/lines format expected by the draw function
  const points = []
  const lines = []
  let offset = 0

  constellations.forEach((c, ci) => {
    c.stars.forEach((s, si) => {
      points.push({
        x: s.x,
        y: s.y,
        size: 0.8 + srand(seed + ci * 100 + si * 7) * 1.2,
        delay: ci * 0.08 + srand(seed + ci * 50 + si * 13) * 0.15,
        constellation: ci,
      })
    })
    c.edges.forEach(([a, b]) => {
      lines.push([offset + a, offset + b])
    })
    offset += c.stars.length
  })

  return { points, lines, count: constellations.length }
}

// Sample text pixels — still used for cloud particle targets
function sampleTextPixels(lines, fontSize, sampleStep, seed) {
  const canvas = document.createElement('canvas')
  const lineHeight = fontSize * 1.25
  const padding = 10
  canvas.width = 600
  canvas.height = lineHeight * lines.length + padding * 2
  const ctx = canvas.getContext('2d')

  ctx.font = `300 ${fontSize}px Georgia, serif`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, padding + i * lineHeight)
  })

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const points = []
  let idx = 0

  for (let y = 0; y < canvas.height; y += sampleStep) {
    for (let x = 0; x < canvas.width; x += sampleStep) {
      if (imageData.data[(y * canvas.width + x) * 4 + 3] > 128) {
        points.push({
          x: x / canvas.width,
          y: y / canvas.height,
          sx: srand(seed + idx * 7) * 0.8 + 0.1,
          sy: srand(seed + idx * 13) * 0.35 + 0.05,
          size: 0.5 + srand(seed + idx * 19) * 1.5,
          delay: srand(seed + idx * 29) * 0.3,
        })
        idx++
      }
    }
  }

  return points
}

// ═══════════════════════════════════════════
// SCENE GENERATION
// ═══════════════════════════════════════════
function generateStars(count) {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: srand(i * 7 + 1), y: srand(i * 13 + 2) * 0.44,
      size: 0.5 + srand(i * 19 + 3) * 2,
      brightness: 0.3 + srand(i * 29 + 4) * 0.7,
      twinkleSpeed: 1 + srand(i * 37 + 5) * 3,
    })
  }
  return stars
}

function generateMountainLayer(seed, peakCount, baseY, heightRange, roughness) {
  const points = []
  for (let i = 0; i <= 200; i++) {
    const x = i / 200
    let y = 0
    for (let p = 0; p < peakCount; p++) {
      const freq = 1 + srand(seed + p * 100) * 3
      const amp = srand(seed + p * 200 + 1) * heightRange
      const phase = srand(seed + p * 300 + 2) * Math.PI * 2
      y += Math.sin(x * Math.PI * freq + phase) * amp
    }
    y += (srand(seed + i * 17) - 0.5) * roughness
    points.push({ x, y: baseY - Math.abs(y) })
  }
  return points
}

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

function generateCloudBlobs(textTargets, count) {
  const blobs = []
  for (let i = 0; i < count; i++) {
    const target = textTargets[i % textTargets.length]
    blobs.push({
      natX: srand(i * 41 + 500) * 1.4 - 0.2,
      natY: srand(i * 47 + 501) * 0.7 + 0.05,
      tgtX: target.x,
      tgtY: target.y,
      size: 0.6 + srand(i * 53 + 502) * 1.2,
      opacity: 0.12 + srand(i * 59 + 503) * 0.18,
      windPhase: srand(i * 61 + 504) * Math.PI * 2,
      driftDir: srand(i * 67 + 505) > 0.5 ? 1 : -1,
      puffOffX: (srand(i * 71 + 506) - 0.5) * 0.4,
      puffOffY: (srand(i * 73 + 507) - 0.5) * 0.2,
    })
  }
  return blobs
}

// Pre-generate ripple patch locations for lake texture
function generateRipplePatches(count, seed) {
  const patches = []
  for (let i = 0; i < count; i++) {
    patches.push({
      x: srand(seed + i * 7),
      y: srand(seed + i * 13) * 0.75 + 0.05,
      size: 0.02 + srand(seed + i * 19) * 0.04,
      angle: srand(seed + i * 23) * Math.PI,
      rippleCount: 2 + Math.floor(srand(seed + i * 29) * 4),
      phase: srand(seed + i * 31) * Math.PI * 2,
      speed: 0.8 + srand(seed + i * 37) * 0.8,
    })
  }
  return patches
}

// ═══════════════════════════════════════════
// SPRITE CREATION
// ═══════════════════════════════════════════
function createCloudPuff() {
  const c = document.createElement('canvas')
  c.width = 64; c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,250,240,1)')
  g.addColorStop(0.4, 'rgba(255,250,240,0.5)')
  g.addColorStop(1, 'rgba(255,250,240,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return c
}

function createCloudBank() {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 64
  const ctx = c.getContext('2d')
  const blobs = [
    [40, 35, 25], [60, 28, 30], [85, 35, 25], [55, 20, 18], [75, 23, 20], [48, 40, 15],
  ]
  for (const [bx, by, br] of blobs) {
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br)
    g.addColorStop(0, 'rgba(255,250,240,0.85)')
    g.addColorStop(0.5, 'rgba(255,250,240,0.35)')
    g.addColorStop(1, 'rgba(255,250,240,0)')
    ctx.fillStyle = g
    ctx.fillRect(bx - br, by - br, br * 2, br * 2)
  }
  return c
}

function createStarGlow() {
  const c = document.createElement('canvas')
  c.width = 32; c.height = 32
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255,252,240,1)')
  g.addColorStop(0.2, 'rgba(200,220,255,0.6)')
  g.addColorStop(0.5, 'rgba(150,180,255,0.15)')
  g.addColorStop(1, 'rgba(150,180,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return c
}

// ═══════════════════════════════════════════
// REVEAL 1: CONSTELLATION
// ═══════════════════════════════════════════
function drawConstellationReveal(ctx, w, h, revealP, stop, data, sprites) {
  const { points, lines } = data
  const horizonY = h * 0.46

  const blockW = w * 0.75
  const blockH = horizonY * 0.7
  const blockX = (w - blockW) / 2
  const blockY = horizonY * 0.08

  const fade = revealP < 0.12 ? revealP / 0.12
    : revealP > 0.85 ? (1 - revealP) / 0.15 : 1
  if (fade < 0.01) return

  ctx.save()

  // Stagger: constellations appear one by one over the first 50% of the reveal
  const starsP = clamp01(revealP / 0.50)
  const linesP = clamp01((revealP - 0.15) / 0.40)
  const glowP = clamp01((revealP - 0.45) / 0.3)

  // Draw constellation lines
  if (linesP > 0) {
    ctx.lineWidth = 1
    for (let i = 0; i < lines.length; i++) {
      const [a, b] = lines[i]
      const pa = points[a], pb = points[b]
      // Stagger by constellation group
      const groupDelay = pa.constellation * 0.12
      const lineAlpha = clamp01((linesP - groupDelay) / 0.25)
      if (lineAlpha <= 0) continue
      ctx.strokeStyle = rgb([150, 180, 255], fade * lineAlpha * 0.3)
      ctx.beginPath()
      ctx.moveTo(blockX + pa.x * blockW, blockY + pa.y * blockH)
      ctx.lineTo(blockX + pb.x * blockW, blockY + pb.y * blockH)
      ctx.stroke()
    }
  }

  // Draw stars
  if (starsP > 0) {
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const starAppear = clamp01((starsP - p.delay) / 0.2)
      if (starAppear <= 0) continue
      const px = blockX + p.x * blockW
      const py = blockY + p.y * blockH
      const twinkle = 0.7 + 0.3 * Math.sin(revealP * 25 + i * 3.1)
      const s = (p.size + 0.5) * twinkle * 2.5
      ctx.globalAlpha = fade * starAppear * twinkle
      ctx.drawImage(sprites.starGlow, px - s, py - s, s * 2, s * 2)
    }
  }

  // Draw text over constellations
  if (glowP > 0) {
    const fontSize = Math.min(w * 0.045, 48)
    const lineH = fontSize * 1.3
    ctx.globalAlpha = 1
    ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.shadowColor = 'rgba(150, 180, 255, 0.8)'
    ctx.shadowBlur = 20 * glowP
    ctx.fillStyle = rgb([200, 220, 255], fade * glowP * 0.9)

    const textX = w / 2
    const textY = blockY + blockH * 0.3
    stop.text.forEach((line, i) => {
      ctx.fillText(line, textX, textY + i * lineH)
    })

    ctx.shadowBlur = 10 * glowP
    ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
    ctx.letterSpacing = '0.2em'
    ctx.fillStyle = rgb([150, 180, 255], fade * glowP * 0.6)
    ctx.fillText(stop.label, textX, textY - fontSize * 0.8)
    ctx.letterSpacing = '0'

    ctx.shadowBlur = 8 * glowP
    ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
    ctx.fillStyle = rgb([180, 200, 240], fade * glowP * 0.6)
    {
      const subPx = Math.min(w * 0.016, 15)
      const subLineH = subPx * 1.3
      subTextLines(stop).forEach((line, si) => {
        ctx.fillText(line, textX, textY + stop.text.length * lineH + fontSize * 0.5 + si * subLineH)
      })
    }

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 2: CLOUD FORMATION
// Longer duration — text lingers as the sun rises through it
// ═══════════════════════════════════════════
function drawCloudReveal(ctx, w, h, revealP, stop, data, sprites) {
  const horizonY = h * 0.46

  const blockW = w * 0.7
  const blockH = horizonY * 0.55
  const blockX = (w - blockW) / 2
  const blockY = horizonY * 0.06

  const fade = revealP < 0.06 ? revealP / 0.06
    : revealP > 0.88 ? (1 - revealP) / 0.12 : 1
  if (fade < 0.01) return

  ctx.save()

  // Extended phases: clouds form (0-0.25), text appears (0.25-0.40),
  // text LINGERS (0.40-0.75) while sun rises through, then disperses (0.75-1.0)
  const driftP = easeOutCubic(clamp01(revealP / 0.25))
  const morphP = easeInOutCubic(clamp01((revealP - 0.15) / 0.20))
  const textP = easeOutCubic(clamp01((revealP - 0.30) / 0.15))
  const disperseP = easeInOutCubic(clamp01((revealP - 0.75) / 0.25))

  for (const blob of data.blobs) {
    const wind = (1 - driftP) * 0.3 * blob.driftDir
    const breathe = Math.sin(revealP * 4 + blob.windPhase) * 0.01

    const cx = blockX + lerp(
      (blob.natX + wind + breathe) * blockW,
      blob.tgtX * blockW,
      morphP
    ) + disperseP * blob.driftDir * blockW * 0.3
    const cy = blockY + lerp(
      blob.natY * blockH,
      blob.tgtY * blockH,
      morphP
    ) + disperseP * (blob.natY - 0.5) * blockH * 0.4

    const size = (35 + blob.size * 30) * (1.4 - morphP * 0.6 + disperseP * 0.4)
    const cloudAlpha = fade * driftP * blob.opacity * (1 - disperseP * 0.8)
    if (cloudAlpha < 0.005) continue

    ctx.globalAlpha = cloudAlpha
    ctx.drawImage(sprites.cloudBank, cx - size, cy - size * 0.5, size * 2, size)
    const pSize = size * 0.7
    ctx.drawImage(
      sprites.cloudPuff,
      cx + blob.puffOffX * size - pSize * 0.5,
      cy + blob.puffOffY * size * 0.5 - pSize * 0.5,
      pSize, pSize
    )
  }

  // Text — appears and STAYS for a long time
  if (textP > 0) {
    const fontSize = Math.min(w * 0.042, 44)
    const lineH = fontSize * 1.3
    const textX = w / 2
    const textY = blockY + blockH * 0.25

    ctx.globalAlpha = fade * textP * (1 - disperseP) * 0.9
    ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = rgb([255, 252, 245], 1)
    ctx.shadowColor = 'rgba(255, 245, 230, 0.7)'
    ctx.shadowBlur = 25 * (1 - textP) + 8

    stop.text.forEach((line, i) => {
      ctx.fillText(line, textX, textY + i * lineH)
    })

    ctx.globalAlpha = fade * textP * (1 - disperseP) * 0.55
    ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
    ctx.fillStyle = rgb([255, 230, 180], 1)
    ctx.fillText(stop.label, textX, textY - fontSize * 0.8)

    ctx.globalAlpha = fade * textP * (1 - disperseP) * 0.5
    ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
    ctx.fillStyle = rgb([255, 245, 225], 1)
    {
      const subPx = Math.min(w * 0.016, 15)
      const subLineH = subPx * 1.3
      // Tighter gap under headline than other reveals — cloud scene reads better closer to main text
      const subGapAfterMain = fontSize * 0.22
      subTextLines(stop).forEach((line, si) => {
        ctx.fillText(line, textX, textY + stop.text.length * lineH + subGapAfterMain + si * subLineH)
      })
    }

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 3: SUN BEAM
// ═══════════════════════════════════════════
function drawSunBeamReveal(ctx, w, h, revealP, stop, sunX, sunY) {
  const horizonY = h * 0.46

  const fade = revealP < 0.1 ? revealP / 0.1
    : revealP > 0.85 ? (1 - revealP) / 0.15 : 1
  if (fade < 0.01) return

  ctx.save()
  ctx.globalAlpha = fade

  const fontSize = Math.min(w * 0.05, 52)
  const lineH = fontSize * 1.3
  const textX = w * 0.5
  const textY = horizonY - h * 0.06

  const beamWidth = w * 0.35 * easeOutCubic(clamp01(revealP / 0.7))
  const beamLeft = textX - w * 0.2
  const beamRight = beamLeft + beamWidth

  const beamGrad = ctx.createLinearGradient(sunX, sunY, textX, textY)
  beamGrad.addColorStop(0, 'rgba(255,240,200,0)')
  beamGrad.addColorStop(0.3, rgb([255, 240, 200], fade * 0.04))
  beamGrad.addColorStop(1, rgb([255, 230, 180], fade * 0.08))
  ctx.fillStyle = beamGrad

  ctx.beginPath()
  ctx.moveTo(sunX, sunY)
  ctx.lineTo(beamLeft, horizonY + 10)
  ctx.lineTo(beamRight, horizonY + 10)
  ctx.closePath()
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(sunX, sunY)
  ctx.lineTo(beamLeft - 10, horizonY + 20)
  ctx.lineTo(beamRight + 10, horizonY + 20)
  ctx.closePath()
  ctx.clip()

  ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(255, 220, 150, 0.9)'
  ctx.shadowBlur = 25
  ctx.fillStyle = rgb([255, 240, 200], 0.95)

  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textY - (stop.text.length - 1 - i) * lineH)
  })

  ctx.shadowBlur = 40
  ctx.globalAlpha = fade * 0.4
  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textY - (stop.text.length - 1 - i) * lineH)
  })

  ctx.restore()

  ctx.globalAlpha = fade * 0.7
  ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = rgb([255, 220, 150], 1)
  ctx.fillText(stop.label, textX, textY - stop.text.length * lineH - fontSize * 0.5)

  ctx.globalAlpha = fade * easeOutCubic(clamp01((revealP - 0.4) / 0.3)) * 0.6
  ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
  ctx.fillStyle = rgb([255, 240, 210], 1)
  ctx.textBaseline = 'top'
  {
    const subPx = Math.min(w * 0.016, 15)
    const subLineH = subPx * 1.3
    subTextLines(stop).forEach((line, si) => {
      ctx.fillText(line, textX, textY + fontSize * 0.3 + si * subLineH)
    })
  }

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.restore()
}

// Sunbeam text water reflection — called separately after water is drawn
function drawSunBeamWaterReflection(ctx, w, h, revealP, stop, sunX, sunY, sprites, time) {
  const horizonY = h * 0.46
  const waterH = h - horizonY

  const fade = revealP < 0.1 ? revealP / 0.1
    : revealP > 0.85 ? (1 - revealP) / 0.15 : 1
  if (fade < 0.01) return

  const fontSize = Math.min(w * 0.05, 52)
  const lineH = fontSize * 1.3
  const textX = w * 0.5

  const beamWidth = w * 0.35 * easeOutCubic(clamp01(revealP / 0.7))
  const beamLeft = textX - w * 0.2
  const beamRight = beamLeft + beamWidth

  const beamRevealAlpha = fade * easeOutCubic(clamp01(revealP / 0.7))
  if (beamRevealAlpha < 0.01) return

  const offscreen = sprites.reflectionCanvas
  const offCtx = sprites.reflectionCtx
  const offW = Math.min(w, 900)
  const offH = fontSize * (stop.text.length + 1) * 1.5

  offscreen.width = offW
  offscreen.height = offH
  offCtx.clearRect(0, 0, offW, offH)

  offCtx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'top'
  offCtx.fillStyle = rgb([200, 180, 130], 0.75)

  const textYOff = fontSize * 0.5
  stop.text.forEach((line, i) => {
    offCtx.fillText(line, offW / 2, textYOff + i * lineH)
  })

  ctx.save()

  // Clip to water area
  ctx.beginPath()
  ctx.rect(0, horizonY, w, waterH)
  ctx.clip()

  // Clip to mirrored beam sweep — fan from horizon intersection downward
  const beamMargin = 20
  ctx.beginPath()
  ctx.moveTo(beamLeft - beamMargin, horizonY)
  ctx.lineTo(beamRight + beamMargin, horizonY)
  ctx.lineTo(beamRight + beamMargin + waterH * 0.3, h)
  ctx.lineTo(beamLeft - beamMargin - waterH * 0.3, h)
  ctx.closePath()
  ctx.clip()

  const destX = (w - offW) / 2
  const destY = horizonY + waterH * 0.05
  const stripH = 2

  ctx.globalAlpha = beamRevealAlpha * 0.35

  for (let y = 0; y < offH; y += stripH) {
    const waveOffset = Math.sin(y * 0.08 + time * 1.6) * (3 + y * 0.05)
    const srcY = offH - y - stripH
    ctx.drawImage(
      offscreen,
      0, srcY, offW, stripH,
      destX + waveOffset, destY + y, offW, stripH
    )
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 4: FOG
// Fog is already rolling in as landscape → clears to reveal text
// ═══════════════════════════════════════════
function drawFogRevealText(ctx, w, h, revealP, stop, fogPatches) {
  const horizonY = h * 0.46

  const fontSize = Math.min(w * 0.048, 50)
  const lineH = fontSize * 1.3
  const textX = w * 0.5
  const textY = horizonY - fontSize * 0.3

  // Very slow clearance — fog is thick for a long time
  const clearance = easeInOutCubic(clamp01((revealP - 0.15) / 0.50))

  const fade = revealP < 0.06 ? revealP / 0.06
    : revealP > 0.88 ? (1 - revealP) / 0.12 : 1
  if (fade < 0.01) return

  ctx.save()
  ctx.globalAlpha = fade

  ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(220, 160, 50, 0.6)'
  ctx.shadowBlur = 12 * clearance
  ctx.fillStyle = rgb([255, 230, 160], clearance * 0.95)

  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textY - (stop.text.length - 1 - i) * lineH)
  })

  ctx.globalAlpha = fade * clearance * 0.6
  ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  ctx.fillStyle = rgb([255, 210, 120], 1)
  ctx.fillText(stop.label, textX, textY - stop.text.length * lineH - fontSize * 0.4)

  ctx.globalAlpha = fade * clearance * 0.5
  ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
  ctx.textBaseline = 'top'
  ctx.fillStyle = rgb([255, 240, 200], 1)
  {
    const subPx = Math.min(w * 0.016, 15)
    const subLineH = subPx * 1.3
    subTextLines(stop).forEach((line, si) => {
      ctx.fillText(line, textX, textY + fontSize * 0.3 + si * subLineH)
    })
  }

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  // Dense fog ON TOP of text — drifts outward slowly
  const fogDensity = (1 - clearance) * 0.95
  if (fogDensity > 0.02) {
    for (let i = 0; i < fogPatches.length; i++) {
      const p = fogPatches[i]
      const driftOut = clearance * (0.6 + p.drift * 0.4)
      const dirX = (p.rx - 0.5) * 2
      const dirY = (p.ry - 0.5) * 2

      const mx = textX + (p.rx - 0.5) * w * 0.5 + dirX * driftOut * w * 0.3
      const my = textY - fontSize * 0.5 + (p.ry - 0.4) * fontSize * 3 + dirY * driftOut * h * 0.12
      const mw = p.width * w
      const windDrift = Math.sin(p.phase + revealP * 2) * 18 * (1 - clearance * 0.5)

      const mg = ctx.createRadialGradient(mx + windDrift, my, 0, mx + windDrift, my, mw)
      const fogColor = [205, 198, 180]
      mg.addColorStop(0, rgb(fogColor, fogDensity * 0.24))
      mg.addColorStop(0.3, rgb(fogColor, fogDensity * 0.16))
      mg.addColorStop(0.6, rgb(fogColor, fogDensity * 0.06))
      mg.addColorStop(1, 'rgba(200,190,170,0)')
      ctx.globalAlpha = fade
      ctx.fillStyle = mg
      ctx.fillRect(mx + windDrift - mw, my - mw * 0.4, mw * 2, mw * 0.8)
    }
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 5: REFLECTION
// Bold text above water + wavy reflection below
// ═══════════════════════════════════════════
function drawReflectionReveal(ctx, w, h, revealP, stop, sprites, time) {
  const horizonY = h * 0.46
  const waterH = h - horizonY

  const fade = revealP < 0.12 ? revealP / 0.12
    : revealP > 0.82 ? (1 - revealP) / 0.18 : 1
  if (fade < 0.01) return

  // Horizontal sweep edge: 0 = left edge, w = right edge
  const sweepP = easeInOutCubic(clamp01(revealP < 0.5 ? revealP / 0.5 : 1))
  const sweepX = sweepP * w

  const fontSize = Math.min(w * 0.05, 52)
  const lineH = fontSize * 1.3

  const textX = w / 2
  const textBaseY = horizonY - fontSize * 0.6

  // Draw above-water text clipped to swept region
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, sweepX, horizonY)
  ctx.clip()
  ctx.globalAlpha = fade

  ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = rgb([200, 180, 220], 0.65)
  ctx.letterSpacing = '0.15em'
  ctx.fillText(stop.label, textX, textBaseY - stop.text.length * lineH - fontSize * 0.4)
  ctx.letterSpacing = '0'

  ctx.font = `600 ${fontSize}px "Instrument Serif", Georgia, serif`
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(180, 160, 220, 0.5)'
  ctx.shadowBlur = 18
  ctx.fillStyle = rgb([235, 225, 245], 0.95)

  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textBaseY - (stop.text.length - 1 - i) * lineH)
  })

  ctx.globalAlpha = fade * 0.6
  ctx.shadowBlur = 8
  ctx.font = `400 ${Math.min(w * 0.018, 16)}px "Crimson Text", Georgia, serif`
  ctx.textBaseline = 'top'
  ctx.fillStyle = rgb([200, 190, 220], 0.75)
  {
    const subPx = Math.min(w * 0.018, 16)
    const subLineH = subPx * 1.3
    subTextLines(stop).forEach((line, si) => {
      ctx.fillText(line, textX, textBaseY + fontSize * 0.35 + si * subLineH)
    })
  }

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.restore()

  // ═══ WAVY REFLECTION IN WATER (clipped to sweep edge) ═══
  const offscreen = sprites.reflectionCanvas
  const offCtx = sprites.reflectionCtx
  const offW = Math.min(w, 900)
  const offH = fontSize * (stop.text.length + 1) * 1.5

  offscreen.width = offW
  offscreen.height = offH
  offCtx.clearRect(0, 0, offW, offH)

  offCtx.font = `600 ${fontSize}px "Instrument Serif", Georgia, serif`
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'top'
  offCtx.fillStyle = rgb([160, 145, 185], 0.75)

  const textYOff = fontSize * 0.5
  stop.text.forEach((line, i) => {
    offCtx.fillText(line, offW / 2, textYOff + i * lineH)
  })

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizonY, sweepX, waterH)
  ctx.clip()

  const destX = (w - offW) / 2
  const destY = horizonY + waterH * 0.05
  const stripH = 2

  ctx.globalAlpha = fade * 0.45

  for (let y = 0; y < offH; y += stripH) {
    const waveOffset = Math.sin(y * 0.08 + time * 1.6) * (3 + y * 0.05)
    const srcY = offH - y - stripH
    ctx.drawImage(
      offscreen,
      0, srcY, offW, stripH,
      destX + waveOffset, destY + y, offW, stripH
    )
  }

  // Ripple rings
  const rippleCX = w / 2
  const rippleCY = destY + offH / 2
  for (let ring = 0; ring < 5; ring++) {
    const ringP = (time * 0.4 + ring * 0.2) % 1
    const ringR = ringP * Math.min(w, h) * 0.2
    const ringA = fade * (1 - ringP) * 0.08

    if (ringA > 0.005) {
      ctx.beginPath()
      ctx.ellipse(rippleCX, rippleCY, ringR, ringR * 0.25, 0, 0, Math.PI * 2)
      ctx.strokeStyle = rgb([200, 190, 220], ringA)
      ctx.lineWidth = 1
      ctx.globalAlpha = 1
      ctx.stroke()
    }
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// GENERIC TEXT WATER REFLECTION
// Draws wavy water reflection for any text content
// ═══════════════════════════════════════════
function drawTextWaterReflection(ctx, w, h, textLines, fontSize, alpha, color, sprites, time, sweepClipX) {
  if (alpha < 0.01) return
  const horizonY = h * 0.46
  const waterH = h - horizonY
  const lineH = fontSize * 1.3

  const offscreen = sprites.reflectionCanvas
  const offCtx = sprites.reflectionCtx
  const offW = Math.min(w, 900)
  const offH = fontSize * (textLines.length + 1) * 1.5

  offscreen.width = offW
  offscreen.height = offH
  offCtx.clearRect(0, 0, offW, offH)

  offCtx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'top'
  offCtx.fillStyle = rgb(color, 0.75)

  const textYOff = fontSize * 0.5
  textLines.forEach((line, i) => {
    offCtx.fillText(line, offW / 2, textYOff + i * lineH)
  })

  ctx.save()
  ctx.beginPath()
  if (sweepClipX != null && sweepClipX > 0) {
    // Only draw to the RIGHT of the sweep edge — new text claims the left
    ctx.rect(sweepClipX, horizonY, w - sweepClipX, waterH)
  } else {
    ctx.rect(0, horizonY, w, waterH)
  }
  ctx.clip()

  const destX = (w - offW) / 2
  const destY = horizonY + waterH * 0.05
  const stripH = 2

  ctx.globalAlpha = alpha * 0.35

  for (let y = 0; y < offH; y += stripH) {
    const waveOffset = Math.sin(y * 0.08 + time * 1.6) * (3 + y * 0.05)
    const srcY = offH - y - stripH
    ctx.drawImage(
      offscreen,
      0, srcY, offW, stripH,
      destX + waveOffset, destY + y, offW, stripH
    )
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// CELESTIAL WATER REFLECTION
// Renders disc + glow to offscreen canvas, flips and distorts
// strip-by-strip — same technique as the text reflection
// ═══════════════════════════════════════════
function drawCelestialReflection(ctx, w, h, bodyX, bodyY, bodyR, time, color, alpha, sprites) {
  const horizonY = h * 0.46
  const waterH = h - horizonY
  if (alpha < 0.01) return

  // Height above horizon determines reflection distance below horizon
  const heightAbove = horizonY - bodyY
  if (heightAbove < 0) return // below horizon, no reflection

  // Mountains extend ~0.04*h above horizon — don't show reflection until body
  // has cleared the mountain peaks, and fade in gradually
  const mountainClearance = h * 0.04
  if (heightAbove < mountainClearance * 0.5) {
    alpha *= clamp01((heightAbove - mountainClearance * 0.1) / (mountainClearance * 0.4))
    if (alpha < 0.005) return
  }

  // Render the disc + glow to offscreen canvas
  const offscreen = sprites.reflectionCanvas
  const offCtx = sprites.reflectionCtx
  const padding = bodyR * 4
  const offW = Math.ceil(padding * 2)
  const offH = Math.ceil(padding * 2)

  offscreen.width = offW
  offscreen.height = offH
  offCtx.clearRect(0, 0, offW, offH)

  const cx = offW / 2
  const cy = offH / 2

  // Draw glow
  const glowR = bodyR * 3
  const gg = offCtx.createRadialGradient(cx, cy, bodyR * 0.5, cx, cy, glowR)
  gg.addColorStop(0, rgb(color, 0.4))
  gg.addColorStop(0.3, rgb(color, 0.15))
  gg.addColorStop(0.6, rgb(color, 0.05))
  gg.addColorStop(1, rgb(color, 0))
  offCtx.fillStyle = gg
  offCtx.fillRect(0, 0, offW, offH)

  // Draw disc
  const dg = offCtx.createRadialGradient(cx, cy, 0, cx, cy, bodyR)
  dg.addColorStop(0, rgb([255, 255, 250], 0.95))
  dg.addColorStop(0.5, rgb(color, 0.9))
  dg.addColorStop(1, rgb(color, 0.7))
  offCtx.fillStyle = dg
  offCtx.beginPath()
  offCtx.arc(cx, cy, bodyR, 0, Math.PI * 2)
  offCtx.fill()

  // Draw flipped into water, strip by strip with wave distortion
  // Reflection appears at the mirror point: horizonY + heightAbove
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizonY, w, waterH)
  ctx.clip()

  const destX = bodyX - offW / 2
  const destY = horizonY + (heightAbove - offH / 2) // mirror position
  const stripH = 2

  ctx.globalAlpha = alpha

  for (let y = 0; y < offH; y += stripH) {
    const t = y / offH
    // Wave distortion increases with distance from horizon
    const distFromHorizon = (destY + y - horizonY) / waterH
    // More wiggle (high frequency), less morph (low amplitude)
    // Keeps the general form recognizable while shimmering actively
    const waveAmp = Math.max(0, distFromHorizon) * 5 + 1.5
    const waveOffset =
      Math.sin(y * 0.12 + time * 1.8) * waveAmp
      + Math.sin(y * 0.07 + time * 1.4 + 1.5) * waveAmp * 0.6
      + Math.sin(y * 0.20 + time * 2.2 + 3.0) * waveAmp * 0.3

    // Source from bottom-up (flip)
    const srcY = offH - y - stripH
    // Fade with depth
    const stripAlpha = alpha * (1 - Math.max(0, distFromHorizon) * 0.6)
    if (stripAlpha < 0.005) continue

    ctx.globalAlpha = stripAlpha
    ctx.drawImage(
      offscreen,
      0, srcY, offW, stripH,
      destX + waveOffset, destY + y, offW, stripH
    )
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// LAKE TEXTURE — localized ripple patches, not blanket coverage
// ═══════════════════════════════════════════
function drawLakeTexture(ctx, w, h, progress, ripplePatches, time) {
  const horizonY = h * 0.46
  const waterH = h - horizonY

  // Choppiness peaks at midday (still scroll-driven)
  const dayP = clamp01((progress - 0.14) / 0.66)
  const choppiness = Math.sin(dayP * Math.PI) * 0.85
  if (choppiness < 0.03) return

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizonY, w, waterH)
  ctx.clip()

  // Draw individual ripple patches at random locations
  for (const patch of ripplePatches) {
    const px = patch.x * w
    const py = horizonY + patch.y * waterH
    const patchSize = patch.size * w * (0.5 + choppiness * 0.5)
    const depth = (py - horizonY) / waterH
    const localChop = choppiness * (0.2 + depth * 0.8)

    if (localChop < 0.05) continue

    // Animate: ripples expand and fade — time-driven for constant motion
    const animPhase = (time * patch.speed * 1.5 + patch.phase) % (Math.PI * 2)
    const rippleAlpha = localChop * 0.06

    ctx.strokeStyle = rgb([255, 255, 255], rippleAlpha)
    ctx.lineWidth = 0.4 + choppiness * 0.3

    // Draw small elliptical ripple rings
    for (let r = 0; r < patch.rippleCount; r++) {
      const ringPhase = (animPhase + r * 1.2) % (Math.PI * 2)
      const ringExpand = (Math.sin(ringPhase) * 0.5 + 0.5)
      const ringR = patchSize * (0.3 + ringExpand * 0.7)
      const ringAlpha = rippleAlpha * (1 - ringExpand) * 0.8

      if (ringAlpha < 0.003) continue

      ctx.globalAlpha = ringAlpha
      ctx.beginPath()
      ctx.ellipse(
        px + Math.sin(ringPhase * 0.7) * patchSize * 0.15,
        py,
        ringR,
        ringR * 0.25,
        patch.angle,
        0, Math.PI * 2
      )
      ctx.stroke()
    }

    // Small wave marks (short dashes)
    if (localChop > 0.25) {
      const dashAlpha = (localChop - 0.25) * 0.08
      ctx.globalAlpha = dashAlpha
      ctx.strokeStyle = rgb([255, 255, 255], 1)
      ctx.lineWidth = 0.5
      for (let d = 0; d < 3; d++) {
        const dx = px + (srand(patch.phase * 10 + d * 7) - 0.5) * patchSize * 2
        const dy = py + (srand(patch.phase * 10 + d * 13) - 0.5) * patchSize * 0.5
        const dLen = patchSize * (0.3 + srand(patch.phase * 10 + d * 19) * 0.4)
        const waveY = Math.sin(dx * 0.03 + time * 2.0) * localChop * 1.5
        ctx.beginPath()
        ctx.moveTo(dx - dLen / 2, dy + waveY)
        ctx.lineTo(dx + dLen / 2, dy + waveY + localChop * 0.5)
        ctx.stroke()
      }
    }
  }

  // Midday glints
  if (choppiness > 0.4) {
    const glintIntensity = (choppiness - 0.4) * 1.5
    for (let i = 0; i < 30; i++) {
      const phase = time * 2.0 + i * 7.3
      const twinkle = (Math.sin(phase) * 0.5 + 0.5) * (Math.sin(phase * 1.7 + 2) * 0.5 + 0.5)
      if (twinkle < 0.4) continue
      const gx = srand(i * 7 + 600 + Math.floor(time * 0.8) * 3) * w
      const gy = horizonY + srand(i * 13 + 601) * waterH * 0.6 + waterH * 0.05
      const gs = (0.8 + srand(i * 19 + 602) * 1.5) * choppiness
      ctx.globalAlpha = twinkle * glintIntensity * 0.12
      ctx.fillStyle = rgb([255, 255, 240], 1)
      ctx.fillRect(gx, gy, gs * 2, gs * 0.3)
    }
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// MOON — rises in the same arc path as the sun
// ═══════════════════════════════════════════
function drawMoon(ctx, w, h, progress, rawProgress, sprites, time) {
  const horizonY = h * 0.46

  // Moon rises starting at progress 0.68
  const moonStart = 0.68
  if (progress < moonStart) return

  // Use rawProgress for arc so moon keeps moving as section scrolls away
  // rawProgress 0.125→0.875 maps to progress 0→1, so moonStart 0.68 ≈ rawProgress 0.635
  const rawMoonStart = 0.125 + moonStart * 0.75
  // Moon travels across the sky over a long span — still moving at rawProgress 1.0+
  const moonP = clamp01((rawProgress - rawMoonStart) / 0.50)
  const fadeIn = easeOutCubic(clamp01(moonP / 0.15))
  if (fadeIn < 0.01) return

  // Moon rises from the same LEFT side as the sun (like the real sky cycle)
  // Sun rises from w*0.15 — moon rises from the same origin point
  // Arc spans a wider range since it keeps moving as we scroll away
  const moonArc = moonP
  const moonX = w * (0.15 + moonArc * 0.35)
  const moonBaseY = horizonY - Math.sin(moonArc * Math.PI * 0.45) * h * 0.30
  const moonY = lerp(horizonY, moonBaseY, fadeIn)
  const moonR = Math.min(w, h) * 0.025

  ctx.save()

  // Moon glow
  const glowR = moonR * 8
  const mg = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, glowR)
  mg.addColorStop(0, rgb([180, 200, 230], fadeIn * 0.12))
  mg.addColorStop(0.2, rgb([140, 160, 200], fadeIn * 0.06))
  mg.addColorStop(0.5, rgb([100, 120, 170], fadeIn * 0.02))
  mg.addColorStop(1, 'rgba(100,120,170,0)')
  ctx.fillStyle = mg
  ctx.fillRect(moonX - glowR, moonY - glowR, glowR * 2, glowR * 2)

  // Moon disc
  ctx.globalAlpha = fadeIn * 0.95
  const dg = ctx.createRadialGradient(moonX - moonR * 0.2, moonY - moonR * 0.2, 0, moonX, moonY, moonR)
  dg.addColorStop(0, rgb([240, 240, 255], 1))
  dg.addColorStop(0.6, rgb([220, 225, 240], 0.95))
  dg.addColorStop(1, rgb([200, 210, 230], 0.85))
  ctx.fillStyle = dg
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
  ctx.fill()

  // Crater hints
  ctx.globalAlpha = fadeIn * 0.08
  ctx.fillStyle = rgb([160, 170, 190], 1)
  ctx.beginPath()
  ctx.arc(moonX + moonR * 0.25, moonY - moonR * 0.15, moonR * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(moonX - moonR * 0.3, moonY + moonR * 0.25, moonR * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(moonX + moonR * 0.05, moonY + moonR * 0.35, moonR * 0.15, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  // Moonlight wash — subtle blue-silver illumination over the whole scene
  const moonlightAlpha = fadeIn * 0.06
  if (moonlightAlpha > 0.005) {
    ctx.save()
    const mlGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, Math.max(w, h) * 0.8)
    mlGrad.addColorStop(0, rgb([140, 160, 210], moonlightAlpha * 1.5))
    mlGrad.addColorStop(0.2, rgb([120, 140, 190], moonlightAlpha))
    mlGrad.addColorStop(0.5, rgb([100, 120, 170], moonlightAlpha * 0.5))
    mlGrad.addColorStop(1, rgb([80, 100, 150], 0))
    ctx.fillStyle = mlGrad
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }

  // Moonlight shimmer on the water — silver glints
  if (fadeIn > 0.1) {
    const horizonY = h * 0.46
    const waterH = h - horizonY
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, horizonY, w, waterH)
    ctx.clip()

    const shimmerCount = 20
    for (let i = 0; i < shimmerCount; i++) {
      const phase = time * 2.5 + i * 5.7
      const twinkle = (Math.sin(phase) * 0.5 + 0.5) * (Math.sin(phase * 2.3 + 1) * 0.5 + 0.5)
      if (twinkle < 0.25) continue

      // Concentrate shimmer near moon's X position but spread a bit
      const spread = (srand(i * 11 + 400) - 0.5) * w * 0.4
      const gx = moonX + spread
      const gy = horizonY + srand(i * 17 + 401) * waterH * 0.5 + waterH * 0.02
      const gs = (0.5 + srand(i * 23 + 402) * 1.5)

      ctx.globalAlpha = fadeIn * twinkle * 0.10
      ctx.fillStyle = rgb([200, 215, 240], 1)
      ctx.fillRect(gx, gy, gs * 2.5, gs * 0.3)
    }
    ctx.restore()
  }

  // Moon reflection — rendered to offscreen, flipped with wave distortion
  drawCelestialReflection(ctx, w, h, moonX, moonY, moonR, time, [200, 215, 240], fadeIn * 0.18, sprites)
}

// ═══════════════════════════════════════════
// MAIN DRAW FUNCTION
// ═══════════════════════════════════════════
function drawHorizon(ctx, w, h, rawProgress, sceneData, sprites, time) {
  ctx.clearRect(0, 0, w, h)

  // ═══════ PROGRESS REMAPPING ═══════
  const progress = clamp01((rawProgress - 0.125) / 0.75)

  const horizonY = h * 0.46
  const { stars, mountains, treeline, mist } = sceneData

  const fadeIn = clamp01(progress / 0.025)
  const fadeOut = clamp01((progress - 0.94) / 0.06)

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
  const starAlpha =
    progress < 0.12 ? 1 :
    progress < 0.20 ? 1 - clamp01((progress - 0.12) / 0.08) :
    progress > 0.72 ? clamp01((progress - 0.72) / 0.08) : 0

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

  // ═══════ CONSTELLATION REVEAL (night) ═══════
  const c0 = CONTENT_STOPS[0]
  const c0p = clamp01((progress - c0.at) / c0.duration)
  if (c0p > 0 && c0p < 1) {
    drawConstellationReveal(ctx, w, h, c0p, c0, sceneData.constellation, sprites)
  }

  // ═══════ HORIZON GLOW ═══════
  const dawnGlow = clamp01((progress - 0.12) / 0.08) * (1 - clamp01((progress - 0.22) / 0.10))
  const goldenGlow = clamp01((progress - 0.55) / 0.08) * (1 - clamp01((progress - 0.78) / 0.08))
  const glowIntensity = Math.max(dawnGlow, goldenGlow)

  if (glowIntensity > 0.01) {
    const sunArc = clamp01((progress - 0.14) / 0.66)
    const gSunX = w * (0.15 + sunArc * 0.7)
    const gg = ctx.createRadialGradient(gSunX, horizonY, 0, gSunX, horizonY, w * 0.5)
    gg.addColorStop(0, rgb([255, 170, 50], glowIntensity * 0.25))
    gg.addColorStop(0.2, rgb([255, 140, 40], glowIntensity * 0.12))
    gg.addColorStop(0.5, rgb([220, 100, 30], glowIntensity * 0.04))
    gg.addColorStop(1, 'rgba(220,100,30,0)')
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, w, h)
  }

  // ═══════ CLOUD REVEAL (dawn — overlaps with sun) ═══════
  const c1 = CONTENT_STOPS[1]
  const c1p = clamp01((progress - c1.at) / c1.duration)
  if (c1p > 0 && c1p < 1) {
    drawCloudReveal(ctx, w, h, c1p, c1, sceneData.cloud, sprites)
  }

  // ═══════ SUN ═══════
  const sunVisible = progress > 0.14 && progress < 0.82
  let sunX = 0, sunY = 0, sunR = 0

  if (sunVisible) {
    const sunArc = clamp01((progress - 0.14) / 0.66)
    sunX = w * (0.15 + sunArc * 0.7)
    const arcHeight = h * 0.35
    sunY = horizonY - Math.sin(sunArc * Math.PI) * arcHeight
    // Gradual rise from horizon
    const riseP = clamp01((progress - 0.14) / 0.08)
    const setP = clamp01((progress - 0.76) / 0.06)
    const verticalOffset = horizonY - sunY
    sunY = horizonY - verticalOffset * easeOutCubic(riseP) * (1 - easeOutCubic(setP))
    sunR = Math.min(w, h) * 0.03
    const edgeFactor = 1 + 0.4 * (1 - Math.sin(sunArc * Math.PI))
    sunR *= edgeFactor
    const noonness = Math.sin(sunArc * Math.PI)
    const sunCoreColor = lerpColor([255, 180, 60], [255, 250, 220], noonness)
    const sunEdgeColor = lerpColor([255, 140, 30], [255, 220, 150], noonness)

    // Corona
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

    // Disc
    const dg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
    dg.addColorStop(0, rgb([255, 255, 245], 1))
    dg.addColorStop(0.5, rgb(sunCoreColor, 1))
    dg.addColorStop(1, rgb(sunEdgeColor, 0.95))
    ctx.beginPath()
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
    ctx.fillStyle = dg
    ctx.fill()

    // Lens flare rays
    if (noonness < 0.7) {
      for (let r = 0; r < 6; r++) {
        const angle = (r / 6) * Math.PI * 2 + progress * 0.5
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

  // ═══════ MOUNTAINS ═══════
  const mtns = mountains
  const mtAlpha = clamp01((progress - 0.04) / 0.06)

  if (mtAlpha > 0) {
    const distColor = lerpColor(skyPalette[3], lerpColor(skyPalette[3], [40, 50, 60], 0.4), 0.5)
    ctx.fillStyle = rgb(distColor, mtAlpha * 0.6)
    ctx.beginPath(); ctx.moveTo(0, horizonY)
    for (const p of mtns.distant) ctx.lineTo(p.x * w, p.y * h)
    ctx.lineTo(w, horizonY); ctx.closePath(); ctx.fill()

    const midColor = lerpColor(skyPalette[4], [20, 35, 25], 0.6)
    ctx.fillStyle = rgb(midColor, mtAlpha * 0.75)
    ctx.beginPath(); ctx.moveTo(0, horizonY)
    for (const p of mtns.mid) ctx.lineTo(p.x * w, p.y * h)
    ctx.lineTo(w, horizonY); ctx.closePath(); ctx.fill()

    ctx.fillStyle = rgb([10, 22, 16], mtAlpha * 0.9)
    ctx.beginPath(); ctx.moveTo(0, horizonY)
    for (const p of mtns.near) ctx.lineTo(p.x * w, p.y * h)
    ctx.lineTo(w, horizonY); ctx.closePath(); ctx.fill()
  }

  // ═══════ SUN BEAM REVEAL (overlaps with cloud fade) ═══════
  const c2 = CONTENT_STOPS[2]
  const c2p = clamp01((progress - c2.at) / c2.duration)
  if (c2p > 0 && c2p < 1 && sunVisible) {
    drawSunBeamReveal(ctx, w, h, c2p, c2, sunX, sunY)
  }

  // ═══════ TREELINE ═══════
  if (mtAlpha > 0) {
    ctx.beginPath()
    for (const t of treeline) {
      const x = t.x * w, th = t.h * h, tw = t.w * h
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

  // ═══════ FOG REVEAL TEXT (overlaps with sunbeam fade) ═══════
  const c3 = CONTENT_STOPS[3]
  const c3p = clamp01((progress - c3.at) / c3.duration)
  if (c3p > 0 && c3p < 1) {
    drawFogRevealText(ctx, w, h, c3p, c3, sceneData.fogPatches)
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
    const sunArc = clamp01((progress - 0.14) / 0.66)
    const gSunX = w * (0.15 + sunArc * 0.7)
    const wg = ctx.createRadialGradient(gSunX, horizonY, 0, gSunX, horizonY + h * 0.12, w * 0.35)
    wg.addColorStop(0, rgb([230, 150, 50], glowIntensity * 0.15))
    wg.addColorStop(0.3, rgb([200, 120, 40], glowIntensity * 0.06))
    wg.addColorStop(1, 'rgba(200,120,40,0)')
    ctx.fillStyle = wg
    ctx.fillRect(0, horizonY, w, h - horizonY)
  }

  // ═══════ REFLECTIONS IN WATER ═══════
  if (mtAlpha > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, horizonY, w, h - horizonY)
    ctx.clip()
    ctx.translate(0, horizonY * 2)
    ctx.scale(1, -1)

    ctx.globalAlpha = fadeIn * (1 - fadeOut) * mtAlpha * 0.12
    ctx.fillStyle = rgb([10, 22, 16], 1)
    ctx.beginPath(); ctx.moveTo(0, horizonY)
    for (const p of mtns.near) ctx.lineTo(p.x * w, p.y * h)
    ctx.lineTo(w, horizonY); ctx.closePath(); ctx.fill()

    ctx.beginPath()
    for (const t of treeline) {
      const x = t.x * w, th = t.h * h, tw = t.w * h
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

  // ═══════ TEXT WATER REFLECTIONS (all active stops) ═══════
  {
    const refColors = [
      [130, 155, 210],  // constellation — cool night blue
      [185, 165, 145],  // cloud — warm dawn
      [200, 180, 130],  // sunbeam — golden
      [195, 175, 130],  // fog — amber
    ]
    const refFontSizes = [
      Math.min(w * 0.045, 48),
      Math.min(w * 0.042, 44),
      Math.min(w * 0.05, 52),
      Math.min(w * 0.048, 50),
    ]

    // Compute sweep edges from incoming reveals so old reflections wipe out
    // Reflection reveal (stop 4): left-to-right sweep
    const c4Early = CONTENT_STOPS[4]
    const c4pEarly = clamp01((progress - c4Early.at) / c4Early.duration)
    const reflSweepX = c4pEarly > 0
      ? easeInOutCubic(clamp01(c4pEarly < 0.5 ? c4pEarly / 0.5 : 1)) * w
      : 0

    // Sunbeam (stop 2): beam sweeps from left — use full beam width as wipe edge
    // The beam covers from beamLeft to beamRight; old reflections clip to the RIGHT of beamRight
    const sbStopEarly = CONTENT_STOPS[2]
    const sbPEarly = clamp01((progress - sbStopEarly.at) / sbStopEarly.duration)
    let beamSweepX = 0
    if (sbPEarly > 0 && sbPEarly < 1) {
      const beamWidth = w * 0.35 * easeOutCubic(clamp01(sbPEarly / 0.7))
      const beamLeft = w * 0.5 - w * 0.2
      beamSweepX = beamLeft + beamWidth + 20  // +margin to match beam clip
    }

    for (let i = 0; i < 4; i++) {
      // Skip i === 2 (sunbeam) — its reflection is drawn inside drawSunBeamReveal
      // with the matching beam sweep clip
      if (i === 2) continue

      const stop = CONTENT_STOPS[i]
      const sp = clamp01((progress - stop.at) / stop.duration)
      if (sp <= 0 || sp >= 1) continue

      let alpha = 0

      if (i === 0) {
        const fade = sp < 0.12 ? sp / 0.12 : sp > 0.85 ? (1 - sp) / 0.15 : 1
        const glowP = clamp01((sp - 0.45) / 0.3)
        alpha = fade * glowP * 0.9
      } else if (i === 1) {
        const fade = sp < 0.06 ? sp / 0.06 : sp > 0.88 ? (1 - sp) / 0.12 : 1
        const textP = easeOutCubic(clamp01((sp - 0.30) / 0.15))
        const disperseP = easeInOutCubic(clamp01((sp - 0.75) / 0.25))
        alpha = fade * textP * (1 - disperseP) * 0.9
      } else if (i === 3) {
        const fade = sp < 0.06 ? sp / 0.06 : sp > 0.88 ? (1 - sp) / 0.12 : 1
        const clearance = easeInOutCubic(clamp01((sp - 0.15) / 0.50))
        alpha = fade * clearance
      }

      if (alpha < 0.01) continue

      // Pick the active sweep edge that should push this reflection out
      let sweepClipX = null
      if (reflSweepX > 0) {
        sweepClipX = reflSweepX
      } else if (beamSweepX > 0 && (i === 0 || i === 1)) {
        sweepClipX = beamSweepX
      }

      drawTextWaterReflection(
        ctx, w, h, stop.text, refFontSizes[i], alpha,
        refColors[i], sprites, time, sweepClipX
      )
    }

    // Sunbeam text reflection — drawn here (after water) with beam sweep clip
    const sbStop = CONTENT_STOPS[2]
    const sbP = clamp01((progress - sbStop.at) / sbStop.duration)
    if (sbP > 0 && sbP < 1 && sunVisible) {
      drawSunBeamWaterReflection(ctx, w, h, sbP, sbStop, sunX, sunY, sprites, time)
    }
  }

  // ═══════ MOON (rises as sun sets — keeps moving as section scrolls away) ═══════
  drawMoon(ctx, w, h, progress, rawProgress, sprites, time)

  // ═══════ REFLECTION REVEAL (overlaps with fog fade) ═══════
  const c4 = CONTENT_STOPS[4]
  const c4p = clamp01((progress - c4.at) / c4.duration)
  if (c4p > 0 && c4p < 1) {
    drawReflectionReveal(ctx, w, h, c4p, c4, sprites, time)
  }

  // ═══════ SUN REFLECTION ON WATER (wavy strip distortion) ═══════
  if (sunVisible) {
    const sunArcP = clamp01((progress - 0.14) / 0.66)
    const noonness = Math.sin(sunArcP * Math.PI)
    const refColor = lerpColor([255, 180, 80], [255, 240, 200], noonness)
    drawCelestialReflection(ctx, w, h, sunX, sunY, sunR, time, refColor, 0.30, sprites)
  }

  // ═══════ LAKE TEXTURE (localized ripple patches) ═══════
  drawLakeTexture(ctx, w, h, progress, sceneData.ripplePatches, time)

  // ═══════ LANDSCAPE MIST / FOG ═══════
  // Morning mist
  const morningMist = clamp01((progress - 0.16) / 0.08) * (1 - clamp01((progress - 0.30) / 0.08))
  // Fog rolls in VERY gradually: starts as barely-there wisps at 0.24,
  // builds imperceptibly over 0.55 of progress — takes multiple scrolls to fully appear
  const fogRollIn = easeInOutCubic(clamp01((progress - 0.24) / 0.55)) * (1 - clamp01((progress - 0.82) / 0.10))
  // Evening mist
  const eveningMist = clamp01((progress - 0.78) / 0.06) * (1 - clamp01((progress - 0.88) / 0.06))
  const mistAlpha = Math.max(morningMist, fogRollIn, eveningMist)

  if (mistAlpha > 0.01) {
    for (const m of mist) {
      const mx = m.x * w
      const my = horizonY + m.yOff * h
      const mw = m.w * w
      const drift = Math.sin(m.x * 10 + progress * 4) * 20
      const mg = ctx.createRadialGradient(mx + drift, my, 0, mx + drift, my, mw)
      mg.addColorStop(0, rgb([210, 210, 200], mistAlpha * m.op * 0.07))
      mg.addColorStop(0.5, rgb([210, 210, 200], mistAlpha * m.op * 0.03))
      mg.addColorStop(1, 'rgba(210,210,200,0)')
      ctx.fillStyle = mg
      ctx.fillRect(mx + drift - mw, my - mw * 0.3, mw * 2, mw * 0.6)
    }

    // Dense treeline fog — fades in proportionally with the base fog
    // No threshold — it comes in as a continuous part of the fog buildup
    // Each patch has its own staggered delay for organic appearance
    if (fogRollIn > 0.01) {
      for (let i = 0; i < 18; i++) {
        const patchDelay = srand(i * 41 + 703) * 0.4 // each patch starts at different time
        const patchFog = easeInOutCubic(clamp01((fogRollIn - patchDelay) / (1 - patchDelay)))
        if (patchFog < 0.01) continue

        const fx = srand(i * 23 + 700) * w
        const fy = horizonY + (srand(i * 31 + 701) - 0.5) * h * 0.06
        const fw = (0.06 + srand(i * 37 + 702) * 0.10) * w
        const windDrift = Math.sin(i * 1.7 + progress * 3) * 25
        const fg = ctx.createRadialGradient(fx + windDrift, fy, 0, fx + windDrift, fy, fw)
        const fAlpha = patchFog * (0.25 + srand(i * 43 + 704) * 0.25)
        fg.addColorStop(0, rgb([200, 195, 180], fAlpha * 0.10))
        fg.addColorStop(0.4, rgb([200, 195, 180], fAlpha * 0.06))
        fg.addColorStop(1, 'rgba(200,195,180,0)')
        ctx.fillStyle = fg
        ctx.fillRect(fx + windDrift - fw, fy - fw * 0.35, fw * 2, fw * 0.7)
      }
    }
  }

  // ═══════ VIGNETTE ═══════
  const dayBrightness = Math.sin(clamp01((progress - 0.14) / 0.66) * Math.PI)
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const squeezeRef = useRef(null)
  const { scrollYProgress: squeezeProgress } = useScroll({
    target: squeezeRef,
    offset: ['start 0.85', 'start 0.15'],
  })
  const rawScale = useTransform(squeezeProgress, [0, 1], [1, 0.88])
  const rawRadius = useTransform(squeezeProgress, [0, 1], [0, 24])
  const scale = useSpring(rawScale, { stiffness: 120, damping: 30 })
  const borderRadius = useSpring(rawRadius, { stiffness: 120, damping: 30 })

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

    const constellation = generateConstellations(1000)

    const cloudTargets = sampleTextPixels(CLOUD_REVEAL_SAMPLE_LINES, 42, 20, 2000)
    const cloudBlobs = generateCloudBlobs(cloudTargets, Math.max(cloudTargets.length, 30))
    const cloud = { blobs: cloudBlobs }

    const fogPatches = []
    for (let i = 0; i < 28; i++) {
      fogPatches.push({
        rx: srand(i * 17 + 800),
        ry: srand(i * 23 + 801),
        width: 0.06 + srand(i * 29 + 802) * 0.10,
        phase: srand(i * 31 + 803) * 10,
        drift: srand(i * 41 + 805),
      })
    }

    const ripplePatches = generateRipplePatches(40, 900)

    return { stars, mountains, treeline, mist, constellation, cloud, fogPatches, ripplePatches }
  }, [])

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      progressRef.current = v
    })
  }, [scrollYProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let cw = 0, ch = 0

    const cloudPuff = createCloudPuff()
    const cloudBank = createCloudBank()
    const starGlow = createStarGlow()
    const reflectionCanvas = document.createElement('canvas')
    const reflectionCtx = reflectionCanvas.getContext('2d')
    const sprites = { cloudPuff, cloudBank, starGlow, reflectionCanvas, reflectionCtx }

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
      const time = performance.now() * 0.001 // seconds, for continuous water shimmer
      drawHorizon(ctx, cw, ch, progressRef.current, sceneData, sprites, time)
      animFrameRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [sceneData])

  return (
    <section className="horizon-section" ref={squeezeRef}>
      <div className="horizon-scroll-runway" ref={sectionRef}>
        <div className="horizon-sticky-wrapper">
          <motion.div
            className="horizon-squeeze"
            ref={containerRef}
            style={{ scale, borderRadius, overflow: 'hidden' }}
          >
            <canvas ref={canvasRef} className="horizon-canvas" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HorizonJourney
