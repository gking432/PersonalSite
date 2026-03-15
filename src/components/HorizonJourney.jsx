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
  { at: 0.06, palette: SKY_PREDAWN },
  { at: 0.12, palette: SKY_DAWN },
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
// Timing is relative to remapped scene progress (0–1)
// ═══════════════════════════════════════════
const CONTENT_STOPS = [
  {
    at: 0.04, duration: 0.15, reveal: 'constellation',
    label: 'PHILOSOPHY',
    text: ['Every system has', 'a pattern. I find it.'],
    sub: 'Markets, products, teams — I map the terrain before I move.',
  },
  {
    at: 0.23, duration: 0.16, reveal: 'cloud',
    label: 'CAPABILITY',
    text: ['I build what others', 'just talk about.'],
    sub: 'From strategy to code to AI — I close the gap between vision and execution.',
  },
  {
    at: 0.44, duration: 0.12, reveal: 'sunbeam',
    label: 'IDENTITY',
    text: ['Marketing. Product. AI.'],
    sub: 'Three disciplines, one operator.',
  },
  {
    at: 0.60, duration: 0.16, reveal: 'mist',
    label: 'PROOF',
    text: ['Five products.', 'Zero handoffs.'],
    sub: 'Conceived, built, branded, and shipped by one person.',
  },
  {
    at: 0.78, duration: 0.14, reveal: 'reflection',
    label: 'NEXT',
    text: ['The sun sets on', 'the solo chapter.'],
    sub: "I'm looking for a team that values builders.",
  },
]

// ═══════════════════════════════════════════
// TEXT PARTICLE SAMPLING
// ═══════════════════════════════════════════
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

function computeConstellationLines(points, maxDist, maxLines) {
  const lines = []
  for (let i = 0; i < points.length && lines.length < maxLines; i++) {
    for (let j = i + 1; j < points.length && lines.length < maxLines; j++) {
      const dx = points[i].x - points[j].x
      const dy = points[i].y - points[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < maxDist && dist > maxDist * 0.3) {
        lines.push([i, j])
      }
    }
  }
  return lines
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

// ═══════════════════════════════════════════
// CLOUD BLOB GENERATION for reveal 2
// ═══════════════════════════════════════════
function generateCloudBlobs(textTargets, count) {
  const blobs = []
  for (let i = 0; i < count; i++) {
    const target = textTargets[i % textTargets.length]
    blobs.push({
      // Natural position: spread across the sky like a cloud bank
      natX: srand(i * 41 + 500) * 1.4 - 0.2,
      natY: srand(i * 47 + 501) * 0.7 + 0.05,
      // Target position: converges on text pixel
      tgtX: target.x,
      tgtY: target.y,
      // Properties
      size: 0.6 + srand(i * 53 + 502) * 1.2,
      opacity: 0.12 + srand(i * 59 + 503) * 0.18,
      windPhase: srand(i * 61 + 504) * Math.PI * 2,
      driftDir: srand(i * 67 + 505) > 0.5 ? 1 : -1,
      // Offset for multi-puff compositing
      puffOffX: (srand(i * 71 + 506) - 0.5) * 0.4,
      puffOffY: (srand(i * 73 + 507) - 0.5) * 0.2,
    })
  }
  return blobs
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
// Stars connect to form text in the night sky
// ═══════════════════════════════════════════
function drawConstellationReveal(ctx, w, h, revealP, stop, data, sprites) {
  const { points, lines } = data
  const horizonY = h * 0.46

  const blockW = w * 0.65
  const blockH = horizonY * 0.6
  const blockX = (w - blockW) / 2
  const blockY = horizonY * 0.12

  const fade = revealP < 0.12 ? revealP / 0.12
    : revealP > 0.85 ? (1 - revealP) / 0.15 : 1

  if (fade < 0.01) return

  ctx.save()
  ctx.globalAlpha = fade

  // Phase 1: Stars appear (0 → 0.35) — slower
  const starsP = clamp01(revealP / 0.35)
  // Phase 2: Lines connect (0.2 → 0.55)
  const linesP = clamp01((revealP - 0.2) / 0.35)
  // Phase 3: Text glow fills (0.45 → 0.75)
  const glowP = clamp01((revealP - 0.45) / 0.3)

  // Draw connecting lines
  if (linesP > 0) {
    ctx.strokeStyle = rgb([150, 180, 255], linesP * 0.25)
    ctx.lineWidth = 0.8
    const visibleLines = Math.floor(lines.length * linesP)
    for (let i = 0; i < visibleLines; i++) {
      const [a, b] = lines[i]
      const pa = points[a], pb = points[b]
      ctx.beginPath()
      ctx.moveTo(blockX + pa.x * blockW, blockY + pa.y * blockH)
      ctx.lineTo(blockX + pb.x * blockW, blockY + pb.y * blockH)
      ctx.stroke()
    }
  }

  // Draw constellation stars
  if (starsP > 0) {
    const visibleStars = Math.floor(points.length * starsP)
    for (let i = 0; i < visibleStars; i++) {
      const p = points[i]
      const px = blockX + p.x * blockW
      const py = blockY + p.y * blockH
      const twinkle = 0.6 + 0.4 * Math.sin(revealP * 30 + i * 2.5)
      const s = (p.size + 1) * twinkle * 3
      ctx.globalAlpha = fade * twinkle
      ctx.drawImage(sprites.starGlow, px - s, py - s, s * 2, s * 2)
    }
    ctx.globalAlpha = fade
  }

  // Filled text glow
  if (glowP > 0) {
    const fontSize = Math.min(w * 0.045, 48)
    const lineH = fontSize * 1.3
    ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.shadowColor = 'rgba(150, 180, 255, 0.8)'
    ctx.shadowBlur = 20 * glowP
    ctx.fillStyle = rgb([200, 220, 255], glowP * 0.9)

    const textX = w / 2
    const textY = blockY + blockH * 0.3
    stop.text.forEach((line, i) => {
      ctx.fillText(line, textX, textY + i * lineH)
    })

    ctx.shadowBlur = 10 * glowP
    ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
    ctx.letterSpacing = '0.2em'
    ctx.fillStyle = rgb([150, 180, 255], glowP * 0.6)
    ctx.fillText(stop.label, textX, textY - fontSize * 0.8)
    ctx.letterSpacing = '0'

    ctx.shadowBlur = 8 * glowP
    ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
    ctx.fillStyle = rgb([180, 200, 240], glowP * 0.6)
    ctx.fillText(stop.sub, textX, textY + stop.text.length * lineH + fontSize * 0.5)

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 2: CLOUD FORMATION
// Natural clouds drift in, settle as landscape, then morph into text
// ═══════════════════════════════════════════
function drawCloudReveal(ctx, w, h, revealP, stop, data, sprites) {
  const horizonY = h * 0.46

  const blockW = w * 0.7
  const blockH = horizonY * 0.55
  const blockX = (w - blockW) / 2
  const blockY = horizonY * 0.06

  const fade = revealP < 0.08 ? revealP / 0.08
    : revealP > 0.85 ? (1 - revealP) / 0.15 : 1
  if (fade < 0.01) return

  ctx.save()

  // Phases: clouds drift in (0-0.3), settle naturally (0.3-0.5),
  // morph to text positions (0.5-0.75), text clear (0.75-1.0)
  const driftP = easeOutCubic(clamp01(revealP / 0.30))
  const morphP = easeInOutCubic(clamp01((revealP - 0.40) / 0.30))
  const textP = easeOutCubic(clamp01((revealP - 0.60) / 0.20))
  const disperseP = easeInOutCubic(clamp01((revealP - 0.85) / 0.15))

  // Draw cloud blobs — they start as natural clouds, converge to text
  for (const blob of data.blobs) {
    // Natural cloud position with wind drift
    const wind = (1 - driftP) * 0.3 * blob.driftDir
    const breathe = Math.sin(revealP * 4 + blob.windPhase) * 0.01

    // Lerp from natural to text-target position
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

    // Clouds shrink as they converge (fluffy → tight)
    const size = (35 + blob.size * 30) * (1.4 - morphP * 0.6 + disperseP * 0.4)
    const cloudAlpha = fade * driftP * blob.opacity * (1 - disperseP * 0.8)

    if (cloudAlpha < 0.005) continue

    ctx.globalAlpha = cloudAlpha

    // Main cloud body (use bank sprite for wider, more natural shapes)
    ctx.drawImage(sprites.cloudBank, cx - size, cy - size * 0.5, size * 2, size)
    // Overlay puff for volume
    const pSize = size * 0.7
    ctx.drawImage(
      sprites.cloudPuff,
      cx + blob.puffOffX * size - pSize * 0.5,
      cy + blob.puffOffY * size * 0.5 - pSize * 0.5,
      pSize, pSize
    )
  }

  // Text emerges from the cloud formation
  if (textP > 0) {
    const fontSize = Math.min(w * 0.042, 44)
    const lineH = fontSize * 1.3
    const textX = w / 2
    const textY = blockY + blockH * 0.25

    // Text with soft cloud-like glow
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

    // Label
    ctx.globalAlpha = fade * textP * (1 - disperseP) * 0.55
    ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
    ctx.fillStyle = rgb([255, 230, 180], 1)
    ctx.fillText(stop.label, textX, textY - fontSize * 0.8)

    // Sub
    ctx.globalAlpha = fade * textP * (1 - disperseP) * 0.5
    ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
    ctx.fillStyle = rgb([255, 245, 225], 1)
    ctx.fillText(stop.sub, textX, textY + stop.text.length * lineH + fontSize * 0.5)

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 3: SUN BEAM
// Light cone from sun illuminates text carved into mountain
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
  ctx.fillText(stop.sub, textX, textY + fontSize * 0.3)

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 4: MIST / FOG
// Fog rolls in as natural landscape, then clears to reveal text
// The fog is already present before the reveal starts
// ═══════════════════════════════════════════
function drawFogRevealText(ctx, w, h, revealP, stop, fogPatches) {
  const horizonY = h * 0.46

  const fontSize = Math.min(w * 0.048, 50)
  const lineH = fontSize * 1.3
  const textX = w * 0.5
  const textY = horizonY - fontSize * 0.3

  // Slow reveal: fog takes a long time to clear enough to read the text
  // revealP 0-0.35: fog is thick, text barely visible
  // revealP 0.35-0.70: fog drifts apart, text becomes clear
  // revealP 0.70-1.0: text fully readable, fog thins further, then fades
  const clearance = easeInOutCubic(clamp01((revealP - 0.10) / 0.55))

  const fade = revealP < 0.06 ? revealP / 0.06
    : revealP > 0.88 ? (1 - revealP) / 0.12 : 1
  if (fade < 0.01) return

  ctx.save()
  ctx.globalAlpha = fade

  // Draw the text underneath (warm golden, at treeline)
  ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(220, 160, 50, 0.6)'
  ctx.shadowBlur = 12 * clearance
  ctx.fillStyle = rgb([255, 230, 160], clearance * 0.95)

  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textY - (stop.text.length - 1 - i) * lineH)
  })

  // Label
  ctx.globalAlpha = fade * clearance * 0.6
  ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  ctx.fillStyle = rgb([255, 210, 120], 1)
  ctx.fillText(stop.label, textX, textY - stop.text.length * lineH - fontSize * 0.4)

  // Sub
  ctx.globalAlpha = fade * clearance * 0.5
  ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
  ctx.textBaseline = 'top'
  ctx.fillStyle = rgb([255, 240, 200], 1)
  ctx.fillText(stop.sub, textX, textY + fontSize * 0.3)

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  // Dense fog ON TOP of text — drifts outward to reveal
  const fogDensity = (1 - clearance) * 0.95
  if (fogDensity > 0.02) {
    for (let i = 0; i < fogPatches.length; i++) {
      const p = fogPatches[i]
      // Fog patches drift outward from text center as clearance increases
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
function drawReflectionReveal(ctx, w, h, revealP, stop, sprites) {
  const horizonY = h * 0.46
  const waterH = h - horizonY

  const fade = revealP < 0.12 ? revealP / 0.12
    : revealP > 0.82 ? (1 - revealP) / 0.18 : 1
  if (fade < 0.01) return

  const revealEased = easeInOutCubic(clamp01(revealP < 0.5 ? revealP / 0.5 : 1))
  const fontSize = Math.min(w * 0.05, 52)
  const lineH = fontSize * 1.3

  // ═══ BOLD TEXT ABOVE WATER ═══
  const textX = w / 2
  const textBaseY = horizonY - fontSize * 0.6

  ctx.save()
  ctx.globalAlpha = fade * revealEased

  // Label
  ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = rgb([200, 180, 220], 0.65)
  ctx.letterSpacing = '0.15em'
  ctx.fillText(stop.label, textX, textBaseY - stop.text.length * lineH - fontSize * 0.4)
  ctx.letterSpacing = '0'

  // Main text — bold, prominent, like a statement
  ctx.font = `600 ${fontSize}px "Instrument Serif", Georgia, serif`
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(180, 160, 220, 0.5)'
  ctx.shadowBlur = 18
  ctx.fillStyle = rgb([235, 225, 245], 0.95)

  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textBaseY - (stop.text.length - 1 - i) * lineH)
  })

  // Sub text
  ctx.globalAlpha = fade * revealEased * 0.6
  ctx.shadowBlur = 8
  ctx.font = `400 ${Math.min(w * 0.018, 16)}px "Crimson Text", Georgia, serif`
  ctx.textBaseline = 'top'
  ctx.fillStyle = rgb([200, 190, 220], 0.75)
  ctx.fillText(stop.sub, textX, textBaseY + fontSize * 0.35)

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.restore()

  // ═══ WAVY REFLECTION IN WATER ═══
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

  // Draw to main canvas: flipped, strip by strip with wave distortion
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizonY, w, waterH)
  ctx.clip()

  const destX = (w - offW) / 2
  const destY = horizonY + waterH * 0.05
  const stripH = 2

  ctx.globalAlpha = fade * revealEased * 0.45

  for (let y = 0; y < offH; y += stripH) {
    const waveOffset = Math.sin(y * 0.08 + revealP * 12) * (3 + y * 0.05)
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
    const ringP = (revealP * 3 + ring * 0.2) % 1
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
// LOON — silhouette swimming across the lake
// ═══════════════════════════════════════════
function drawLoon(ctx, w, h, progress) {
  const horizonY = h * 0.46

  // Loon is a daytime creature: appears morning, exits before dusk
  const loonStart = 0.20
  const loonEnd = 0.72
  if (progress < loonStart || progress > loonEnd) return

  const loonP = (progress - loonStart) / (loonEnd - loonStart)
  const fadeIn = clamp01(loonP / 0.06)
  const fadeOut = clamp01((1 - loonP) / 0.06)
  const loonFade = fadeIn * fadeOut
  if (loonFade < 0.01) return

  // Swim from right to left
  const loonX = w * (0.85 - loonP * 0.70)
  const loonBaseY = horizonY + (h - horizonY) * 0.12
  const bobY = Math.sin(progress * 35) * 1.2

  const s = Math.min(w, h) * 0.0018

  ctx.save()
  ctx.translate(loonX, loonBaseY + bobY)
  ctx.scale(s, s)
  ctx.globalAlpha = loonFade * 0.65

  // Loon body color (dark silhouette)
  const bodyColor = rgb([12, 18, 12], 1)
  ctx.fillStyle = bodyColor

  // Body: elongated hull shape
  ctx.beginPath()
  ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Tail (slight uptick at back)
  ctx.beginPath()
  ctx.moveTo(16, -1)
  ctx.quadraticCurveTo(22, -4, 24, -3)
  ctx.quadraticCurveTo(22, 0, 18, 1)
  ctx.fill()

  // Neck (curved)
  ctx.beginPath()
  ctx.moveTo(-15, -2)
  ctx.quadraticCurveTo(-18, -6, -17, -11)
  ctx.quadraticCurveTo(-16, -13, -14, -11)
  ctx.quadraticCurveTo(-15, -6, -12, -2)
  ctx.fill()

  // Head
  ctx.beginPath()
  ctx.ellipse(-17, -13, 4, 3.5, -0.2, 0, Math.PI * 2)
  ctx.fill()

  // Beak
  ctx.beginPath()
  ctx.moveTo(-20, -14)
  ctx.lineTo(-26, -13)
  ctx.lineTo(-20, -12)
  ctx.closePath()
  ctx.fill()

  // Eye (tiny bright dot)
  ctx.fillStyle = rgb([180, 180, 160], loonFade * 0.6)
  ctx.beginPath()
  ctx.arc(-18, -13.5, 0.8, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  // Wake: V-shaped ripples trailing behind
  ctx.save()
  ctx.globalAlpha = loonFade * 0.12
  const wakeSpread = 8
  for (let i = 1; i <= 6; i++) {
    const t = i / 6
    const wx = loonX + t * w * 0.05 + 10 * s
    const spread = t * wakeSpread * s
    const wAlpha = loonFade * 0.08 * (1 - t)
    ctx.strokeStyle = rgb([200, 210, 220], wAlpha)
    ctx.lineWidth = 0.6
    ctx.beginPath()
    // Upper wake line
    ctx.moveTo(loonX + 10 * s, loonBaseY + bobY)
    ctx.quadraticCurveTo(
      wx - w * 0.01, loonBaseY + bobY - spread * 0.3,
      wx, loonBaseY + bobY - spread
    )
    ctx.stroke()
    ctx.beginPath()
    // Lower wake line
    ctx.moveTo(loonX + 10 * s, loonBaseY + bobY)
    ctx.quadraticCurveTo(
      wx - w * 0.01, loonBaseY + bobY + spread * 0.3,
      wx, loonBaseY + bobY + spread
    )
    ctx.stroke()
  }
  ctx.restore()
}

// ═══════════════════════════════════════════
// LAKE TEXTURE — dynamic waves that change with time of day
// Glass smooth at dawn/dusk, choppy at midday
// ═══════════════════════════════════════════
function drawLakeTexture(ctx, w, h, progress) {
  const horizonY = h * 0.46
  const waterH = h - horizonY

  // Day cycle: 0 = night, peaks around 0.45 = midday
  const dayP = clamp01((progress - 0.10) / 0.70)
  // Choppiness: bell curve peaking at midday
  const choppiness = Math.sin(dayP * Math.PI) * 0.85
  if (choppiness < 0.01) return

  ctx.save()

  // Wave lines — batched into single path for performance
  const spacing = 5 + (1 - choppiness) * 8
  ctx.beginPath()
  for (let y = horizonY + 4; y < h; y += spacing) {
    const depth = (y - horizonY) / waterH
    const localChop = choppiness * (0.15 + depth * 0.85)
    const amp1 = localChop * 3
    const amp2 = localChop * 1.8
    const freq1 = 0.018 + depth * 0.008
    const freq2 = 0.007

    for (let x = 0; x <= w; x += 4) {
      const wave = Math.sin(x * freq1 + y * 0.12 + progress * 18) * amp1
        + Math.sin(x * freq2 + progress * 10 + y * 0.05) * amp2
      if (x === 0) ctx.moveTo(x, y + wave)
      else ctx.lineTo(x, y + wave)
    }
  }
  ctx.strokeStyle = rgb([255, 255, 255], choppiness * 0.03)
  ctx.lineWidth = 0.4 + choppiness * 0.4
  ctx.stroke()

  // Glints / sparkles on choppy water (midday sunlight)
  if (choppiness > 0.35) {
    const glintIntensity = (choppiness - 0.35) * 1.5
    const noonBright = Math.sin(dayP * Math.PI)
    ctx.fillStyle = rgb([255, 255, 240], glintIntensity * noonBright * 0.12)
    for (let i = 0; i < 50; i++) {
      const phase = progress * 15 + i * 7.3
      const twinkle = (Math.sin(phase) * 0.5 + 0.5) * (Math.sin(phase * 1.7 + 2) * 0.5 + 0.5)
      if (twinkle < 0.3) continue
      const gx = srand(i * 7 + 600 + Math.floor(progress * 8) * 3) * w
      const gy = horizonY + srand(i * 13 + 601) * waterH * 0.65 + waterH * 0.04
      const gs = (1 + srand(i * 19 + 602) * 2) * choppiness
      ctx.globalAlpha = twinkle * glintIntensity * noonBright * 0.15
      ctx.fillRect(gx, gy, gs * 2.5, gs * 0.4)
    }
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// MAIN DRAW FUNCTION
// ═══════════════════════════════════════════
function drawHorizon(ctx, w, h, rawProgress, sceneData, sprites) {
  ctx.clearRect(0, 0, w, h)

  // ═══════ PROGRESS REMAPPING ═══════
  // Raw progress: 0 = section top at viewport bottom, 1 = section bottom at viewport top
  // The section is fully in view (sticky pinned) at raw ~0.125
  // It starts leaving at raw ~0.875
  // Remap to 0..1 for the scene so animations only play when visible
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
    progress < 0.06 ? 1 :
    progress < 0.15 ? 1 - clamp01((progress - 0.06) / 0.09) :
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
  const dawnGlow = clamp01((progress - 0.06) / 0.08) * (1 - clamp01((progress - 0.22) / 0.10))
  const goldenGlow = clamp01((progress - 0.55) / 0.08) * (1 - clamp01((progress - 0.78) / 0.08))
  const glowIntensity = Math.max(dawnGlow, goldenGlow)

  if (glowIntensity > 0.01) {
    const sunArc = clamp01((progress - 0.08) / 0.72)
    const gSunX = w * (0.15 + sunArc * 0.7)
    const gg = ctx.createRadialGradient(gSunX, horizonY, 0, gSunX, horizonY, w * 0.5)
    gg.addColorStop(0, rgb([255, 170, 50], glowIntensity * 0.25))
    gg.addColorStop(0.2, rgb([255, 140, 40], glowIntensity * 0.12))
    gg.addColorStop(0.5, rgb([220, 100, 30], glowIntensity * 0.04))
    gg.addColorStop(1, 'rgba(220,100,30,0)')
    ctx.fillStyle = gg
    ctx.fillRect(0, 0, w, h)
  }

  // ═══════ CLOUD REVEAL (dawn) ═══════
  const c1 = CONTENT_STOPS[1]
  const c1p = clamp01((progress - c1.at) / c1.duration)
  if (c1p > 0 && c1p < 1) {
    drawCloudReveal(ctx, w, h, c1p, c1, sceneData.cloud, sprites)
  }

  // ═══════ SUN ═══════
  const sunVisible = progress > 0.08 && progress < 0.82
  let sunX = 0, sunY = 0, sunR = 0

  if (sunVisible) {
    const sunArc = clamp01((progress - 0.08) / 0.72)
    sunX = w * (0.15 + sunArc * 0.7)
    const arcHeight = h * 0.35
    sunY = horizonY - Math.sin(sunArc * Math.PI) * arcHeight
    const riseP = clamp01((progress - 0.08) / 0.06)
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

  // ═══════ SUN BEAM REVEAL (noon) ═══════
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

  // ═══════ FOG REVEAL TEXT (golden hour — before landscape mist draws) ═══════
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
    const sunArc = clamp01((progress - 0.08) / 0.72)
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

  // ═══════ REFLECTION REVEAL (dusk — bold text + water reflection) ═══════
  const c4 = CONTENT_STOPS[4]
  const c4p = clamp01((progress - c4.at) / c4.duration)
  if (c4p > 0 && c4p < 1) {
    drawReflectionReveal(ctx, w, h, c4p, c4, sprites)
  }

  // ═══════ SUN REFLECTION ON WATER ═══════
  if (sunVisible) {
    const colW = sunR * 1.2
    const waterH = h - horizonY
    for (let i = 0; i < 40; i++) {
      const t = i / 40
      const stripY = horizonY + t * waterH * 0.8
      const stripH = (waterH * 0.8) / 40
      const waveX = Math.sin(t * 14 + progress * 10) * (2 + t * 12)
      const alpha = 0.28 * (1 - t * 0.85)
      const stripW = colW * (1.5 + t * 3)
      const noonness = Math.sin(clamp01((progress - 0.08) / 0.72) * Math.PI)
      const refColor = lerpColor([255, 180, 80], [255, 240, 200], noonness)
      ctx.fillStyle = rgb(refColor, alpha)
      ctx.fillRect(sunX - stripW / 2 + waveX, stripY, stripW, stripH + 1)
    }
  }

  // ═══════ LAKE TEXTURE (dynamic waves) ═══════
  drawLakeTexture(ctx, w, h, progress)

  // ═══════ LOON ═══════
  drawLoon(ctx, w, h, progress)

  // ═══════ LANDSCAPE MIST / FOG ═══════
  // Morning mist (brief, at dawn)
  const morningMist = clamp01((progress - 0.12) / 0.08) * (1 - clamp01((progress - 0.28) / 0.08))
  // Fog rolls in before and during the fog text reveal (starts at ~0.48, peaks ~0.62, clears ~0.76)
  const fogRollIn = clamp01((progress - 0.48) / 0.10) * (1 - clamp01((progress - 0.72) / 0.08))
  // Evening mist
  const eveningMist = clamp01((progress - 0.76) / 0.06) * (1 - clamp01((progress - 0.86) / 0.06))
  const mistAlpha = Math.max(morningMist, fogRollIn * 1.4, eveningMist)

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

    // Extra dense fog around treeline during fogRollIn phase
    if (fogRollIn > 0.1) {
      for (let i = 0; i < 18; i++) {
        const fx = srand(i * 23 + 700) * w
        const fy = horizonY + (srand(i * 31 + 701) - 0.5) * h * 0.06
        const fw = (0.06 + srand(i * 37 + 702) * 0.10) * w
        const windDrift = Math.sin(i * 1.7 + progress * 3) * 25
        const fg = ctx.createRadialGradient(fx + windDrift, fy, 0, fx + windDrift, fy, fw)
        const fAlpha = fogRollIn * (0.5 + srand(i * 41 + 703) * 0.5)
        fg.addColorStop(0, rgb([200, 195, 180], fAlpha * 0.12))
        fg.addColorStop(0.4, rgb([200, 195, 180], fAlpha * 0.07))
        fg.addColorStop(1, 'rgba(200,195,180,0)')
        ctx.fillStyle = fg
        ctx.fillRect(fx + windDrift - fw, fy - fw * 0.35, fw * 2, fw * 0.7)
      }
    }
  }

  // ═══════ VIGNETTE ═══════
  const dayBrightness = Math.sin(clamp01((progress - 0.08) / 0.72) * Math.PI)
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

  // Squeeze: always squeezed (like other NDS squeeze sections)
  const squeezeRef = useRef(null)
  const { scrollYProgress: squeezeProgress } = useScroll({
    target: squeezeRef,
    offset: ['start 0.85', 'start 0.15'],
  })
  const rawScale = useTransform(squeezeProgress, [0, 1], [1, 0.88])
  const rawRadius = useTransform(squeezeProgress, [0, 1], [0, 24])
  const scale = useSpring(rawScale, { stiffness: 120, damping: 30 })
  const borderRadius = useSpring(rawRadius, { stiffness: 120, damping: 30 })

  // Pre-generate all scene data
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

    // Text particles for constellation reveal
    const constellationPoints = sampleTextPixels(
      CONTENT_STOPS[0].text, 44, 5, 1000
    )
    const constellationLines = computeConstellationLines(constellationPoints, 0.06, 350)
    const constellation = { points: constellationPoints, lines: constellationLines }

    // Cloud blob targets (coarse text sampling for cloud convergence points)
    const cloudTargets = sampleTextPixels(
      CONTENT_STOPS[1].text, 42, 20, 2000
    )
    const cloudBlobs = generateCloudBlobs(cloudTargets, Math.max(cloudTargets.length, 30))
    const cloud = { blobs: cloudBlobs }

    // Pre-generated fog patch data for the mist reveal
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

    return { stars, mountains, treeline, mist, constellation, cloud, fogPatches }
  }, [])

  // Scroll listener
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

    // Create sprites
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
      drawHorizon(ctx, cw, ch, progressRef.current, sceneData, sprites)
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
