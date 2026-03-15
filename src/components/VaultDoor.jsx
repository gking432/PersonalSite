import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './VaultDoor.css'

const ndsEase = [0.22, 1, 0.36, 1]

const featuredWork = [
  {
    number: '01',
    title: 'Aptos Token Launcher',
    tag: 'Blockchain · Product · Web3',
    desc: 'Built a user-friendly interface for creating and deploying tokens on the Aptos blockchain. Simplified a complex technical process into an accessible web application.',
    link: '/projects',
  },
  {
    number: '02',
    title: 'PrepMe',
    tag: 'AI · Interview Practice · Product',
    desc: 'AI-powered interview practice platform. Conducts realistic job interviews using Claude, provides real-time feedback, and helps users improve through deliberate practice.',
    link: '/projects',
  },
  {
    number: '03',
    title: 'Client Portfolio',
    tag: 'Brand · Strategy · Go-to-Market',
    desc: 'Brand identities, eCommerce builds, and go-to-market campaigns for early-stage companies. Full lifecycle — from market research to launch to iteration.',
    link: '/client-work',
  },
]

// ═══════════════════════════════════════════
// CANVAS: FULL-VIEWPORT VAULT DOOR
// ═══════════════════════════════════════════
function drawVaultDoor(ctx, w, h, progress) {
  ctx.clearRect(0, 0, w, h)

  // ── SCROLL PHASES ──
  // 0.00–0.10: section enters, door appears
  // 0.10–0.30: wheel handle rotates
  // 0.30–0.38: bolts retract
  // 0.38–0.56: door swings open on left hinge
  // 0.56+: door fully open, gallery visible

  const doorAlpha = progress < 0.04 ? 0 : progress < 0.10 ? (progress - 0.04) / 0.06 : 1
  if (doorAlpha <= 0) return

  // Phases
  const wheelP = clamp01((progress - 0.08) / 0.24)
  const wheelAngle = easeInOutCubic(wheelP) * 1080

  const boltP = clamp01((progress - 0.30) / 0.08)
  const boltRetract = easeOutCubic(boltP)

  const swingP = clamp01((progress - 0.38) / 0.18)
  const doorSwing = easeInOutQuart(swingP)

  // Door disappears once fully swung
  if (doorSwing >= 0.99) return

  ctx.save()
  ctx.globalAlpha = doorAlpha

  // ── DIMENSIONS ──
  // Door is inset slightly from viewport edges for the frame
  const frameInset = Math.min(w, h) * 0.03
  const doorL = frameInset
  const doorT = frameInset
  const doorW = w - frameInset * 2
  const doorH = h - frameInset * 2
  const doorR = doorL + doorW
  const doorB = doorT + doorH
  const cornerR = 4

  // ── DOOR FRAME (visible behind door, creates depth) ──
  // Thick dark frame
  ctx.fillStyle = '#1a1c1b'
  ctx.beginPath()
  ctx.roundRect(doorL - 6, doorT - 6, doorW + 12, doorH + 12, cornerR + 2)
  ctx.fill()

  // Inner frame edge (slight bevel)
  const frameBevel = ctx.createLinearGradient(doorL, doorT, doorL, doorB)
  frameBevel.addColorStop(0, '#2a2c2b')
  frameBevel.addColorStop(1, '#141614')
  ctx.fillStyle = frameBevel
  ctx.beginPath()
  ctx.roundRect(doorL - 3, doorT - 3, doorW + 6, doorH + 6, cornerR + 1)
  ctx.fill()

  // ── VAULT INTERIOR (dark room behind door) ──
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(doorL, doorT, doorW, doorH, cornerR)
  ctx.clip()

  // Deep dark interior
  const intGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6)
  intGrad.addColorStop(0, '#141816')
  intGrad.addColorStop(0.5, '#0e110f')
  intGrad.addColorStop(1, '#080a09')
  ctx.fillStyle = intGrad
  ctx.fillRect(doorL, doorT, doorW, doorH)

  // Subtle top light (gallery lighting)
  if (doorSwing > 0.1) {
    const lightAlpha = Math.min(0.08, doorSwing * 0.1)
    const topLight = ctx.createLinearGradient(w / 2, doorT, w / 2, doorT + doorH * 0.4)
    topLight.addColorStop(0, `rgba(244, 241, 234, ${lightAlpha})`)
    topLight.addColorStop(1, 'rgba(244, 241, 234, 0)')
    ctx.fillStyle = topLight
    ctx.fillRect(doorL, doorT, doorW, doorH * 0.4)
  }

  ctx.restore()

  // ── THE DOOR (with perspective swing) ──
  ctx.save()

  // Perspective swing: door hinges on the LEFT edge
  const hingeX = doorL
  const scaleX = 1 - doorSwing * 0.92
  const perspSkew = doorSwing * 0.12

  ctx.translate(hingeX, h / 2)
  ctx.transform(scaleX, perspSkew, 0, 1 + perspSkew * 0.05, 0, 0)
  ctx.translate(-hingeX, -h / 2)

  // Door shadow (cast to the right as it opens)
  if (doorSwing > 0.05 && doorSwing < 0.95) {
    const shadowAlpha = 0.3 * (1 - doorSwing)
    ctx.save()
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`
    ctx.shadowBlur = 60 + doorSwing * 40
    ctx.shadowOffsetX = 20 + doorSwing * 30
    ctx.fillStyle = 'rgba(0,0,0,0.01)'
    ctx.beginPath()
    ctx.roundRect(doorL, doorT, doorW, doorH, cornerR)
    ctx.fill()
    ctx.restore()
  }

  // ── MAIN DOOR SURFACE ──
  const metalGrad = ctx.createLinearGradient(doorL, doorT, doorR, doorB)
  metalGrad.addColorStop(0, '#d6d2cc')
  metalGrad.addColorStop(0.08, '#c8c4be')
  metalGrad.addColorStop(0.2, '#bab6b0')
  metalGrad.addColorStop(0.35, '#b0aca6')
  metalGrad.addColorStop(0.5, '#a8a4a0')
  metalGrad.addColorStop(0.65, '#b0aca6')
  metalGrad.addColorStop(0.8, '#bcb8b2')
  metalGrad.addColorStop(0.92, '#c2beb8')
  metalGrad.addColorStop(1, '#b4b0aa')

  ctx.beginPath()
  ctx.roundRect(doorL, doorT, doorW, doorH, cornerR)
  ctx.fillStyle = metalGrad
  ctx.fill()

  // ── BRUSHED METAL TEXTURE ──
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(doorL, doorT, doorW, doorH, cornerR)
  ctx.clip()

  // Horizontal brush lines
  ctx.globalAlpha = 0.025
  for (let y = doorT; y < doorB; y += 1.5) {
    const lineAlpha = Math.random() * 0.5 + 0.5
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(0,0,0,${lineAlpha})` : `rgba(255,255,255,${lineAlpha * 0.6})`
    ctx.lineWidth = 0.3 + Math.random() * 0.3
    ctx.beginPath()
    ctx.moveTo(doorL, y)
    ctx.lineTo(doorR, y)
    ctx.stroke()
  }

  // Subtle vertical variation for realism
  ctx.globalAlpha = 0.012
  for (let x = doorL; x < doorR; x += 40 + Math.random() * 60) {
    const bandW = 20 + Math.random() * 40
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)'
    ctx.fillRect(x, doorT, bandW, doorH)
  }

  ctx.restore()

  // ── PANEL LINES (recessed rectangles on door face) ──
  // Creates the industrial look of welded steel panels
  const panelInset = Math.min(doorW, doorH) * 0.06
  const panelMidX = doorL + doorW * 0.48 // slightly left of center (handle area)

  // Left panel
  drawRecessedPanel(ctx, doorL + panelInset, doorT + panelInset,
    panelMidX - doorL - panelInset * 1.5, doorH - panelInset * 2)

  // Right panel (narrower, where bolts are)
  drawRecessedPanel(ctx, panelMidX + panelInset * 0.5, doorT + panelInset,
    doorR - panelMidX - panelInset * 1.5, doorH - panelInset * 2)

  // ── LOCKING BOLTS (right side, horizontal bars) ──
  const boltCount = 4
  const boltZoneTop = doorT + doorH * 0.15
  const boltZoneH = doorH * 0.7
  const boltSpacing = boltZoneH / (boltCount - 1)

  for (let i = 0; i < boltCount; i++) {
    const by = boltZoneTop + i * boltSpacing
    const boltW = Math.min(doorW * 0.08, 60)
    const boltH = Math.min(doorH * 0.018, 14)
    const retractX = boltRetract * boltW * 1.3
    const bx = doorR - panelInset * 1.8 - retractX

    // Bolt shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.beginPath()
    ctx.roundRect(bx + 1, by - boltH / 2 + 1, boltW, boltH, 2)
    ctx.fill()

    // Bolt body
    const boltGrad = ctx.createLinearGradient(bx, by - boltH / 2, bx, by + boltH / 2)
    boltGrad.addColorStop(0, '#a09c96')
    boltGrad.addColorStop(0.3, '#8a8680')
    boltGrad.addColorStop(0.7, '#7a7670')
    boltGrad.addColorStop(1, '#908c86')
    ctx.fillStyle = boltGrad
    ctx.beginPath()
    ctx.roundRect(bx, by - boltH / 2, boltW, boltH, 2)
    ctx.fill()

    // Bolt highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(bx + 2, by - boltH / 2 + 1)
    ctx.lineTo(bx + boltW - 2, by - boltH / 2 + 1)
    ctx.stroke()

    // Bolt slot
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.roundRect(bx + boltW * 0.3, by - 1.5, boltW * 0.4, 3, 1)
    ctx.fill()

    // Bolt housing (on the door edge)
    ctx.fillStyle = '#6a6864'
    ctx.beginPath()
    ctx.roundRect(doorR - panelInset * 0.8, by - boltH * 0.8, panelInset * 0.6, boltH * 1.6, 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // ── HINGES (left side) ──
  const hingeCount = 3
  const hingeZoneTop = doorT + doorH * 0.1
  const hingeZoneH = doorH * 0.8
  const hingeSpacing = hingeZoneH / (hingeCount - 1)

  for (let i = 0; i < hingeCount; i++) {
    const hy = hingeZoneTop + i * hingeSpacing
    const hingeW = Math.min(doorW * 0.035, 28)
    const hingeH = Math.min(doorH * 0.06, 48)
    const hx = doorL + panelInset * 0.5

    // Hinge plate
    const hingeGrad = ctx.createLinearGradient(hx, hy - hingeH / 2, hx + hingeW, hy + hingeH / 2)
    hingeGrad.addColorStop(0, '#7a7670')
    hingeGrad.addColorStop(0.5, '#6a6660')
    hingeGrad.addColorStop(1, '#5a5650')
    ctx.fillStyle = hingeGrad
    ctx.beginPath()
    ctx.roundRect(hx, hy - hingeH / 2, hingeW, hingeH, 3)
    ctx.fill()

    // Hinge bolts
    const hingeBoltR = Math.min(3, hingeW * 0.12)
    for (const offset of [-hingeH * 0.3, 0, hingeH * 0.3]) {
      const hbGrad = ctx.createRadialGradient(
        hx + hingeW / 2 - 1, hy + offset - 1, 0,
        hx + hingeW / 2, hy + offset, hingeBoltR
      )
      hbGrad.addColorStop(0, '#a09c96')
      hbGrad.addColorStop(1, '#6a6660')
      ctx.beginPath()
      ctx.arc(hx + hingeW / 2, hy + offset, hingeBoltR, 0, Math.PI * 2)
      ctx.fillStyle = hbGrad
      ctx.fill()
    }

    // Hinge pin
    ctx.fillStyle = '#5a5650'
    ctx.beginPath()
    ctx.arc(hx - 2, hy, hingeBoltR * 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }

  // ── SPOKED WHEEL HANDLE ──
  const wheelCx = doorL + doorW * 0.48
  const wheelCy = doorT + doorH * 0.5
  const wheelR = Math.min(doorW, doorH) * 0.14

  // Wheel shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 6

  // Outer ring
  const ringW = wheelR * 0.12
  const ringGrad = ctx.createLinearGradient(
    wheelCx - wheelR, wheelCy - wheelR,
    wheelCx + wheelR, wheelCy + wheelR
  )
  ringGrad.addColorStop(0, '#c0bcb6')
  ringGrad.addColorStop(0.25, '#9a9690')
  ringGrad.addColorStop(0.5, '#88847e')
  ringGrad.addColorStop(0.75, '#9a9690')
  ringGrad.addColorStop(1, '#7a7670')
  ctx.lineWidth = ringW
  ctx.strokeStyle = ringGrad
  ctx.beginPath()
  ctx.arc(wheelCx, wheelCy, wheelR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // Ring highlight (top half)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(wheelCx, wheelCy, wheelR + ringW * 0.3, -Math.PI * 0.85, -Math.PI * 0.15)
  ctx.stroke()

  // Ring shadow (bottom half)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(wheelCx, wheelCy, wheelR - ringW * 0.3, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()

  // ── SPOKES (5) ──
  const spokeCount = 5
  const spokeAngle = (wheelAngle * Math.PI) / 180
  const spokeW = wheelR * 0.07

  for (let i = 0; i < spokeCount; i++) {
    const angle = spokeAngle + (i / spokeCount) * Math.PI * 2
    const innerR = wheelR * 0.18
    const outerR = wheelR - ringW * 0.6

    const x1 = wheelCx + Math.cos(angle) * innerR
    const y1 = wheelCy + Math.sin(angle) * innerR
    const x2 = wheelCx + Math.cos(angle) * outerR
    const y2 = wheelCy + Math.sin(angle) * outerR

    // Spoke shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.lineWidth = spokeW + 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1 + 1, y1 + 1)
    ctx.lineTo(x2 + 1, y2 + 1)
    ctx.stroke()

    // Spoke body
    ctx.strokeStyle = '#98948e'
    ctx.lineWidth = spokeW
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Spoke highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    // Grip ball at spoke end
    const gripX = wheelCx + Math.cos(angle) * wheelR
    const gripY = wheelCy + Math.sin(angle) * wheelR
    const gripR = wheelR * 0.06

    const gripGrad = ctx.createRadialGradient(
      gripX - gripR * 0.3, gripY - gripR * 0.3, 0,
      gripX, gripY, gripR * 1.2
    )
    gripGrad.addColorStop(0, '#c8c4be')
    gripGrad.addColorStop(0.5, '#98948e')
    gripGrad.addColorStop(1, '#78746e')
    ctx.beginPath()
    ctx.arc(gripX, gripY, gripR, 0, Math.PI * 2)
    ctx.fillStyle = gripGrad
    ctx.fill()
  }

  // Center hub
  const hubR = wheelR * 0.18
  const hubGrad = ctx.createRadialGradient(
    wheelCx - hubR * 0.25, wheelCy - hubR * 0.25, 0,
    wheelCx, wheelCy, hubR
  )
  hubGrad.addColorStop(0, '#c0bcb6')
  hubGrad.addColorStop(0.3, '#a09c96')
  hubGrad.addColorStop(0.7, '#88847e')
  hubGrad.addColorStop(1, '#78746e')
  ctx.beginPath()
  ctx.arc(wheelCx, wheelCy, hubR, 0, Math.PI * 2)
  ctx.fillStyle = hubGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Hub inner circle
  ctx.beginPath()
  ctx.arc(wheelCx, wheelCy, hubR * 0.5, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // ── NAMEPLATE (above wheel) ──
  const plateY = wheelCy - wheelR - Math.min(doorH * 0.08, 60)
  const plateW = Math.min(doorW * 0.28, 200)
  const plateH = Math.min(doorH * 0.04, 32)

  // Plate background
  const plateGrad = ctx.createLinearGradient(
    wheelCx - plateW / 2, plateY - plateH / 2,
    wheelCx + plateW / 2, plateY + plateH / 2
  )
  plateGrad.addColorStop(0, '#9a968f')
  plateGrad.addColorStop(0.5, '#8a8680')
  plateGrad.addColorStop(1, '#7a7670')
  ctx.fillStyle = plateGrad
  ctx.beginPath()
  ctx.roundRect(wheelCx - plateW / 2, plateY - plateH / 2, plateW, plateH, 2)
  ctx.fill()

  // Plate border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Plate text
  ctx.fillStyle = 'rgba(244, 241, 234, 0.7)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const plateFont = Math.max(8, Math.min(plateH * 0.45, 13))
  ctx.font = `600 ${plateFont}px Inter, -apple-system, sans-serif`
  ctx.fillText('SELECTED WORKS', wheelCx, plateY)

  // Plate mounting screws
  for (const xOff of [-plateW / 2 + 8, plateW / 2 - 8]) {
    const screwX = wheelCx + xOff
    const screwR = 2.5
    ctx.beginPath()
    ctx.arc(screwX, plateY, screwR, 0, Math.PI * 2)
    ctx.fillStyle = '#6a6660'
    ctx.fill()
    // Phillips head
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(screwX - 1.5, plateY)
    ctx.lineTo(screwX + 1.5, plateY)
    ctx.moveTo(screwX, plateY - 1.5)
    ctx.lineTo(screwX, plateY + 1.5)
    ctx.stroke()
  }

  // ── EDGE BEVEL (around entire door) ──
  // Top edge (light)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(doorL + cornerR, doorT + 0.5)
  ctx.lineTo(doorR - cornerR, doorT + 0.5)
  ctx.stroke()

  // Bottom edge (shadow)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(doorL + cornerR, doorB - 0.5)
  ctx.lineTo(doorR - cornerR, doorB - 0.5)
  ctx.stroke()

  ctx.restore() // end door perspective transform
  ctx.restore() // end globalAlpha
}

// ── HELPER: draw recessed panel outline ──
function drawRecessedPanel(ctx, x, y, w, h) {
  if (w <= 0 || h <= 0) return
  const r = 2

  // Shadow edge (top + left = shadow for recessed look)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.stroke()

  // Inner highlight edge (bottom + right)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.moveTo(x + r, y + h)
  ctx.lineTo(x + w - r, y + h)
  ctx.stroke()
}

function clamp01(t) { return Math.max(0, Math.min(1, t)) }
function easeOutCubic(t) { return 1 - (1 - t) ** 3 }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2 }
function easeInOutQuart(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2 }

// ═══════════════════════════════════════════
// VAULT DOOR COMPONENT
// ═══════════════════════════════════════════
function VaultDoor() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const progressRef = useRef(0)
  const animFrameRef = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Gallery room fades in as door opens
  const galleryOpacity = useTransform(scrollYProgress, [0.50, 0.62], [0, 1])
  const galleryScale = useTransform(scrollYProgress, [0.50, 0.62], [0.96, 1])

  // Gallery items stagger in
  const item1Y = useTransform(scrollYProgress, [0.54, 0.64], [60, 0])
  const item2Y = useTransform(scrollYProgress, [0.58, 0.68], [60, 0])
  const item3Y = useTransform(scrollYProgress, [0.62, 0.72], [60, 0])
  const itemYs = [item1Y, item2Y, item3Y]

  const item1Op = useTransform(scrollYProgress, [0.54, 0.62], [0, 1])
  const item2Op = useTransform(scrollYProgress, [0.58, 0.66], [0, 1])
  const item3Op = useTransform(scrollYProgress, [0.62, 0.70], [0, 1])
  const itemOps = [item1Op, item2Op, item3Op]

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v
      setIsRevealed(v > 0.62)
    })
    return unsub
  }, [scrollYProgress])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0

    function resize() {
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    function render() {
      drawVaultDoor(ctx, w, h, progressRef.current)
      animFrameRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <section className="vault-section" ref={sectionRef}>
      <div className="vault-sticky">
        {/* Canvas layer (the door) */}
        <div className="vault-canvas-container" ref={containerRef}>
          <canvas ref={canvasRef} />
        </div>

        {/* Gallery room (revealed behind door) */}
        <motion.div
          className="vault-gallery"
          style={{ opacity: galleryOpacity, scale: galleryScale }}
        >
          <div className="vault-gallery-inner">
            <p className="vault-gallery-label">Selected Work</p>
            <h2 className="vault-gallery-heading">What I've Built</h2>

            <div className="vault-gallery-grid">
              {featuredWork.map((project, i) => (
                <motion.div
                  key={i}
                  className="vault-gallery-item"
                  style={{ y: itemYs[i], opacity: itemOps[i] }}
                >
                  <Link to={project.link} className="vault-gallery-link">
                    <div className="vault-gallery-item-header">
                      <span className="vault-gallery-number">{project.number}</span>
                      <span className="vault-gallery-arrow">&rarr;</span>
                    </div>
                    <span className="vault-gallery-tag">{project.tag}</span>
                    <h3 className="vault-gallery-title">{project.title}</h3>
                    <p className="vault-gallery-desc">{project.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default VaultDoor
