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
// ═══════════════════════════════════════════
const CONTENT_STOPS = [
  {
    at: 0.03, duration: 0.09, reveal: 'constellation',
    label: 'PHILOSOPHY',
    text: ['Every system has', 'a pattern. I find it.'],
    sub: 'Markets, products, teams — I map the terrain before I move.',
  },
  {
    at: 0.16, duration: 0.09, reveal: 'cloud',
    label: 'CAPABILITY',
    text: ['I build what others', 'just talk about.'],
    sub: 'From strategy to code to AI — I close the gap between vision and execution.',
  },
  {
    at: 0.40, duration: 0.10, reveal: 'sunbeam',
    label: 'IDENTITY',
    text: ['Marketing. Product. AI.'],
    sub: 'Three disciplines, one operator.',
  },
  {
    at: 0.58, duration: 0.10, reveal: 'mist',
    label: 'PROOF',
    text: ['Five products.', 'Zero handoffs.'],
    sub: 'Conceived, built, branded, and shipped by one person.',
  },
  {
    at: 0.72, duration: 0.10, reveal: 'reflection',
    label: 'NEXT',
    text: ['The sun sets on', 'the solo chapter.'],
    sub: "I'm looking for a team that values builders.",
  },
]

// ═══════════════════════════════════════════
// TEXT PARTICLE SAMPLING
// Renders text to a temp canvas, samples filled pixels
// Returns normalized {x, y} points
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
          // Scattered position (for cloud / constellation assembly)
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
// SPRITE CREATION (offscreen canvases for perf)
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

  // Position: centered in sky
  const blockW = w * 0.65
  const blockH = horizonY * 0.6
  const blockX = (w - blockW) / 2
  const blockY = horizonY * 0.12

  // Fade envelope
  const fade = revealP < 0.12 ? revealP / 0.12
    : revealP > 0.85 ? (1 - revealP) / 0.15 : 1

  if (fade < 0.01) return

  ctx.save()
  ctx.globalAlpha = fade

  // Phase 1: Stars appear (0 → 0.4)
  const starsP = clamp01(revealP / 0.4)
  // Phase 2: Lines connect (0.2 → 0.6)
  const linesP = clamp01((revealP - 0.2) / 0.4)
  // Phase 3: Text glow fills (0.4 → 0.7)
  const glowP = clamp01((revealP - 0.4) / 0.3)

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

  // Filled text glow (the text becomes readable)
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

    // Label
    ctx.shadowBlur = 10 * glowP
    ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
    ctx.letterSpacing = '0.2em'
    ctx.fillStyle = rgb([150, 180, 255], glowP * 0.6)
    ctx.fillText(stop.label, textX, textY - fontSize * 0.8)
    ctx.letterSpacing = '0'

    // Sub text
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
// Cloud particles drift together to form text
// ═══════════════════════════════════════════
function drawCloudReveal(ctx, w, h, revealP, stop, data, sprites) {
  const horizonY = h * 0.46

  // Position: in the dawn sky
  const blockW = w * 0.6
  const blockH = horizonY * 0.5
  const blockX = (w - blockW) / 2
  const blockY = horizonY * 0.1

  const fade = revealP < 0.1 ? revealP / 0.1
    : revealP > 0.82 ? (1 - revealP) / 0.18 : 1

  if (fade < 0.01) return

  ctx.save()

  // Convergence: scattered (0) → formed (0.5) → dispersing (1)
  const convergeP = revealP < 0.55
    ? easeInOutCubic(clamp01(revealP / 0.55))
    : 1 - easeInOutCubic(clamp01((revealP - 0.7) / 0.3))

  for (const p of data.points) {
    // Per-particle delay for organic feel
    const particleConv = clamp01((convergeP - p.delay * 0.3) / (1 - p.delay * 0.3))

    // Interpolate between scattered and target positions
    const px = blockX + lerp(p.sx * blockW + (w - blockW) * 0.15, p.x * blockW, particleConv)
    const py = blockY + lerp(p.sy * blockH + horizonY * 0.05, p.y * blockH, particleConv)
    const size = (2 + p.size) * (1.5 - particleConv * 0.7)

    ctx.globalAlpha = fade * (0.25 + particleConv * 0.55)
    ctx.drawImage(sprites.cloudPuff, px - size, py - size, size * 2, size * 2)
  }

  // When converged, reinforce text readability with subtle fillText
  if (convergeP > 0.6) {
    const textAlpha = (convergeP - 0.6) / 0.4 * fade
    const fontSize = Math.min(w * 0.042, 44)
    const lineH = fontSize * 1.3
    ctx.globalAlpha = textAlpha * 0.35
    ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = rgb([255, 245, 230], 1)
    ctx.shadowColor = 'rgba(255, 200, 100, 0.5)'
    ctx.shadowBlur = 15

    const textX = w / 2
    const textY = blockY + blockH * 0.25
    stop.text.forEach((line, i) => {
      ctx.fillText(line, textX, textY + i * lineH)
    })

    // Label
    ctx.globalAlpha = textAlpha * 0.5
    ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
    ctx.fillStyle = rgb([255, 210, 120], 1)
    ctx.fillText(stop.label, textX, textY - fontSize * 0.8)

    // Sub
    ctx.globalAlpha = textAlpha * 0.45
    ctx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
    ctx.fillStyle = rgb([255, 240, 210], 1)
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

  // Text position: on the mountain face, right of center
  const fontSize = Math.min(w * 0.05, 52)
  const lineH = fontSize * 1.3
  const textX = w * 0.5
  const textY = horizonY - h * 0.06

  // Light beam: cone from sun to mountain text area
  // The beam "sweeps" from left to right as revealP increases
  const beamWidth = w * 0.35 * easeOutCubic(clamp01(revealP / 0.7))
  const beamLeft = textX - w * 0.2
  const beamRight = beamLeft + beamWidth

  // Draw the light beam (subtle)
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

  // Clip to beam area and draw text
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(sunX, sunY)
  ctx.lineTo(beamLeft - 10, horizonY + 20)
  ctx.lineTo(beamRight + 10, horizonY + 20)
  ctx.closePath()
  ctx.clip()

  // "Carved" text illuminated by sun
  ctx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.shadowColor = 'rgba(255, 220, 150, 0.9)'
  ctx.shadowBlur = 25
  ctx.fillStyle = rgb([255, 240, 200], 0.95)

  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textY - (stop.text.length - 1 - i) * lineH)
  })

  // Double-draw for stronger glow
  ctx.shadowBlur = 40
  ctx.globalAlpha = fade * 0.4
  stop.text.forEach((line, i) => {
    ctx.fillText(line, textX, textY - (stop.text.length - 1 - i) * lineH)
  })

  ctx.restore() // pop clip

  // Label (above text, always visible when faded in)
  ctx.globalAlpha = fade * 0.7
  ctx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = rgb([255, 220, 150], 1)
  ctx.fillText(stop.label, textX, textY - stop.text.length * lineH - fontSize * 0.5)

  // Sub text (below, on the mountain face)
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
// REVEAL 4: MIST
// Text exists at treeline, hidden by mist that clears
// ═══════════════════════════════════════════
function drawMistRevealText(ctx, w, h, revealP, stop) {
  const horizonY = h * 0.46

  // Mist clearing: thickest at 0, clearest at 0.5, returns by 1
  const clearance = revealP < 0.55
    ? easeOutCubic(clamp01(revealP / 0.55))
    : 1 - easeOutCubic(clamp01((revealP - 0.7) / 0.3))

  const fade = revealP < 0.08 ? revealP / 0.08
    : revealP > 0.88 ? (1 - revealP) / 0.12 : 1

  if (fade < 0.01) return

  const fontSize = Math.min(w * 0.048, 50)
  const lineH = fontSize * 1.3
  const textX = w * 0.5
  const textY = horizonY - fontSize * 0.3

  ctx.save()
  ctx.globalAlpha = fade

  // Draw text (warm golden, at treeline)
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

  // Dense mist ON TOP of text (obscures it when clearance is low)
  const mistDensity = (1 - clearance) * 0.9
  if (mistDensity > 0.02) {
    for (let i = 0; i < 20; i++) {
      const mx = textX + (srand(i * 17 + 800) - 0.5) * w * 0.5
      const my = textY - fontSize * 0.5 + (srand(i * 23 + 801) - 0.4) * fontSize * 3
      const mw = (0.08 + srand(i * 29 + 802) * 0.15) * w
      const drift = Math.sin(srand(i * 31 + 803) * 10 + revealP * 3) * 30 * (1 - clearance)

      const mg = ctx.createRadialGradient(mx + drift, my, 0, mx + drift, my, mw)
      mg.addColorStop(0, rgb([210, 200, 180], mistDensity * 0.18))
      mg.addColorStop(0.4, rgb([200, 190, 170], mistDensity * 0.10))
      mg.addColorStop(1, 'rgba(200,190,170,0)')
      ctx.globalAlpha = fade
      ctx.fillStyle = mg
      ctx.fillRect(mx + drift - mw, my - mw * 0.4, mw * 2, mw * 0.8)
    }
  }

  ctx.restore()
}

// ═══════════════════════════════════════════
// REVEAL 5: REFLECTION
// Text visible ONLY in the water, upside down with wave distortion
// ═══════════════════════════════════════════
function drawReflectionReveal(ctx, w, h, revealP, stop, sprites) {
  const horizonY = h * 0.46
  const waterH = h - horizonY

  const fade = revealP < 0.12 ? revealP / 0.12
    : revealP > 0.82 ? (1 - revealP) / 0.18 : 1

  if (fade < 0.01) return

  const revealEased = easeInOutCubic(clamp01(revealP < 0.5 ? revealP / 0.5 : 1))
  const fontSize = Math.min(w * 0.045, 48)
  const lineH = fontSize * 1.3

  // Render text to offscreen canvas, then draw strip-by-strip with wave distortion
  const offscreen = sprites.reflectionCanvas
  const offCtx = sprites.reflectionCtx
  const offW = Math.min(w, 900)
  const offH = fontSize * (stop.text.length + 2) * 1.5

  offscreen.width = offW
  offscreen.height = offH
  offCtx.clearRect(0, 0, offW, offH)

  // Draw text on offscreen (right-side-up, we'll flip when drawing to main canvas)
  offCtx.font = `300 ${fontSize}px "Instrument Serif", Georgia, serif`
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'top'
  offCtx.fillStyle = rgb([180, 160, 200], 0.9)

  const textYOff = fontSize * 0.5
  stop.text.forEach((line, i) => {
    offCtx.fillText(line, offW / 2, textYOff + i * lineH)
  })

  // Label on offscreen
  offCtx.font = `700 ${Math.min(w * 0.012, 11)}px "Inter", sans-serif`
  offCtx.fillStyle = rgb([160, 150, 180], 0.6)
  offCtx.fillText(stop.label, offW / 2, 2)

  // Sub text on offscreen
  const subY = textYOff + stop.text.length * lineH + fontSize * 0.4
  offCtx.font = `400 ${Math.min(w * 0.016, 15)}px "Crimson Text", Georgia, serif`
  offCtx.fillStyle = rgb([170, 155, 190], 0.5)
  offCtx.fillText(stop.sub, offW / 2, subY)

  // Draw to main canvas: flipped, strip by strip with wave distortion
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizonY, w, waterH)
  ctx.clip()

  const destX = (w - offW) / 2
  const destY = horizonY + waterH * 0.08
  const stripH = 2

  ctx.globalAlpha = fade * revealEased * 0.7

  for (let y = 0; y < offH; y += stripH) {
    const waveOffset = Math.sin(y * 0.08 + revealP * 12) * (3 + y * 0.04)
    // Draw flipped: source from bottom-up, dest from top-down
    const srcY = offH - y - stripH
    ctx.drawImage(
      offscreen,
      0, srcY, offW, stripH,
      destX + waveOffset, destY + y, offW, stripH
    )
  }

  // Ripple rings emanating from text center
  const rippleCX = w / 2
  const rippleCY = destY + offH / 2
  for (let ring = 0; ring < 5; ring++) {
    const ringP = (revealP * 3 + ring * 0.2) % 1
    const ringR = ringP * Math.min(w, h) * 0.2
    const ringA = fade * (1 - ringP) * 0.1

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
// MAIN DRAW FUNCTION
// ═══════════════════════════════════════════
function drawHorizon(ctx, w, h, progress, sceneData, sprites) {
  ctx.clearRect(0, 0, w, h)

  const horizonY = h * 0.46
  const { stars, mountains, treeline, mist } = sceneData

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

  // ═══════ SUN BEAM REVEAL (noon — on mountain face) ═══════
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

  // ═══════ MIST REVEAL TEXT (golden hour — at treeline, BEFORE mist draws) ═══════
  const c3 = CONTENT_STOPS[3]
  const c3p = clamp01((progress - c3.at) / c3.duration)
  if (c3p > 0 && c3p < 1) {
    drawMistRevealText(ctx, w, h, c3p, c3)
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

  // ═══════ REFLECTION REVEAL (dusk — text only in water) ═══════
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

  // ═══════ WATER TEXTURE ═══════
  const dayBrightness = Math.sin(clamp01((progress - 0.08) / 0.72) * Math.PI)
  if (dayBrightness > 0.05) {
    ctx.beginPath()
    for (let y = horizonY + 3; y < h; y += 7) {
      ctx.moveTo(0, y); ctx.lineTo(w, y)
    }
    ctx.strokeStyle = rgb([255, 255, 255], dayBrightness * 0.015)
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // ═══════ MIST ═══════
  const morningMist = clamp01((progress - 0.12) / 0.08) * (1 - clamp01((progress - 0.30) / 0.10))
  const eveningMist = clamp01((progress - 0.68) / 0.08) * (1 - clamp01((progress - 0.82) / 0.06))
  const mistAlpha = Math.max(morningMist, eveningMist)

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
  }

  // ═══════ VIGNETTE ═══════
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
  // Entry squeeze: scales from 1 → 0.88 as section enters viewport
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

    // Text particles for cloud reveal
    const cloudPoints = sampleTextPixels(
      CONTENT_STOPS[1].text, 42, 3, 2000
    )
    const cloud = { points: cloudPoints }

    return { stars, mountains, treeline, mist, constellation, cloud }
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
    const starGlow = createStarGlow()
    const reflectionCanvas = document.createElement('canvas')
    const reflectionCtx = reflectionCanvas.getContext('2d')
    const sprites = { cloudPuff, starGlow, reflectionCanvas, reflectionCtx }

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
