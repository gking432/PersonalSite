import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './VaultDoor.css'

const ndsEase = [0.22, 1, 0.36, 1]

const featuredWork = [
  {
    number: '01',
    title: 'Aptos Token Launcher',
    tag: 'Web3 · Product',
    desc: 'Built a user-friendly interface for creating and deploying tokens on the Aptos blockchain.',
    link: '/projects',
  },
  {
    number: '02',
    title: 'PrepMe',
    tag: 'AI · Product',
    desc: 'AI-powered interview practice platform with real-time feedback using Claude.',
    link: '/projects',
  },
  {
    number: '03',
    title: 'Client Work',
    tag: 'Brand · Strategy',
    desc: 'Brand identities, eCommerce builds, and go-to-market campaigns for early-stage companies.',
    link: '/client-work',
  },
]

// ═══════════════════════════════════════════
// CANVAS VAULT RENDERER
// ═══════════════════════════════════════════
function drawVault(ctx, w, h, progress, dpr) {
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const radius = Math.min(w, h) * 0.38

  // ── SCROLL PHASES ──
  // 0.0–0.15: fade in
  // 0.15–0.38: dial spins
  // 0.38–0.42: bolts retract
  // 0.42–0.60: door swings open (perspective rotation)
  // 0.60+: hold open

  const doorAlpha = progress < 0.08 ? 0 : progress < 0.15 ? (progress - 0.08) / 0.07 : 1
  if (doorAlpha <= 0) return

  // Dial rotation (degrees)
  const dialP = Math.max(0, Math.min(1, (progress - 0.12) / 0.26))
  const dialAngle = easeInOutCubic(dialP) * 900

  // Bolt retraction (0 = extended, 1 = retracted)
  const boltP = Math.max(0, Math.min(1, (progress - 0.36) / 0.06))
  const boltRetract = easeOutCubic(boltP)

  // Door swing (0 = closed, 1 = open)
  const swingP = Math.max(0, Math.min(1, (progress - 0.42) / 0.18))
  const doorSwing = easeInOutCubic(swingP)

  ctx.save()
  ctx.globalAlpha = doorAlpha

  // ── SHADOW under the door ──
  if (doorSwing < 0.95) {
    const shadowBlur = 40 + doorSwing * 20
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
    ctx.shadowBlur = shadowBlur
    ctx.shadowOffsetX = 4 + doorSwing * 10
    ctx.shadowOffsetY = 8 + doorSwing * 6
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(180, 180, 180, 0.01)'
    ctx.fill()
    ctx.restore()
  }

  // ── DOOR FRAME (dark ring behind the door) ──
  const frameGrad = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.06)
  frameGrad.addColorStop(0, '#3a3a3a')
  frameGrad.addColorStop(0.5, '#2a2a2a')
  frameGrad.addColorStop(1, '#1a1a1a')
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 1.04, 0, Math.PI * 2)
  ctx.fillStyle = frameGrad
  ctx.fill()

  // Frame bevel highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 1.04, -Math.PI * 0.8, -Math.PI * 0.2)
  ctx.stroke()

  // ── VAULT INTERIOR (visible when door opens) ──
  if (doorSwing > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2)
    ctx.clip()

    // Dark interior
    const intGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    intGrad.addColorStop(0, '#1a1c1a')
    intGrad.addColorStop(1, '#0e100e')
    ctx.fillStyle = intGrad
    ctx.fill()

    // Shelves/depth lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 3; i++) {
      const shelfY = cy - radius * 0.5 + i * radius * 0.25
      ctx.beginPath()
      ctx.moveTo(cx - radius * 0.7, shelfY)
      ctx.lineTo(cx + radius * 0.7, shelfY)
      ctx.stroke()
    }

    ctx.restore()
  }

  // ── THE DOOR ITSELF (with swing perspective) ──
  if (doorSwing < 0.95) {
    ctx.save()

    // Simulate perspective swing by scaling X and shifting
    // Door hinges on the left side
    const hingeX = cx - radius
    const scaleX = 1 - doorSwing * 0.85
    const shiftX = -doorSwing * radius * 0.9
    const skewAmount = doorSwing * 0.15

    ctx.translate(hingeX, cy)
    ctx.transform(scaleX, skewAmount, 0, 1 + skewAmount * 0.1, shiftX, 0)
    ctx.translate(-hingeX, -cy)

    // Main door surface
    const doorGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
    doorGrad.addColorStop(0, '#e8e4de')
    doorGrad.addColorStop(0.15, '#d4d0ca')
    doorGrad.addColorStop(0.3, '#c8c4be')
    doorGrad.addColorStop(0.5, '#bdb9b3')
    doorGrad.addColorStop(0.7, '#c2beb8')
    doorGrad.addColorStop(0.85, '#d0ccc6')
    doorGrad.addColorStop(1, '#bcb8b2')

    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = doorGrad
    ctx.fill()

    // Brushed metal texture (horizontal lines)
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.globalAlpha = 0.04
    for (let y = cy - radius; y < cy + radius; y += 2) {
      ctx.beginPath()
      ctx.moveTo(cx - radius, y)
      ctx.lineTo(cx + radius, y)
      ctx.strokeStyle = y % 4 === 0 ? '#000' : '#fff'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
    ctx.restore()

    // Outer beveled ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 2, -Math.PI * 0.75, Math.PI * 0.1)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 2, Math.PI * 0.2, Math.PI * 1.3)
    ctx.stroke()

    // Inner decorative ring
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.87, -Math.PI * 0.8, Math.PI * 0.1)
    ctx.stroke()

    // ── RIVETS around the perimeter ──
    const rivetCount = 24
    for (let i = 0; i < rivetCount; i++) {
      const angle = (i / rivetCount) * Math.PI * 2
      const rx = cx + Math.cos(angle) * radius * 0.93
      const ry = cy + Math.sin(angle) * radius * 0.93
      const rivetR = radius * 0.018

      // Rivet body
      const rivetGrad = ctx.createRadialGradient(
        rx - rivetR * 0.3, ry - rivetR * 0.3, 0,
        rx, ry, rivetR
      )
      rivetGrad.addColorStop(0, '#d8d4ce')
      rivetGrad.addColorStop(0.6, '#a8a4a0')
      rivetGrad.addColorStop(1, '#8a8680')
      ctx.beginPath()
      ctx.arc(rx, ry, rivetR, 0, Math.PI * 2)
      ctx.fillStyle = rivetGrad
      ctx.fill()

      // Rivet highlight
      ctx.beginPath()
      ctx.arc(rx - rivetR * 0.2, ry - rivetR * 0.2, rivetR * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fill()
    }

    // ── LOCKING BOLTS (4 cardinal directions) ──
    const boltPositions = [0, Math.PI / 2, Math.PI, Math.PI * 1.5]
    for (const angle of boltPositions) {
      const boltLength = radius * 0.1
      const boltWidth = radius * 0.035
      const retractDist = boltRetract * boltLength * 1.2

      const boltDist = radius * 0.82 - retractDist
      const bx = cx + Math.cos(angle) * boltDist
      const by = cy + Math.sin(angle) * boltDist

      ctx.save()
      ctx.translate(bx, by)
      ctx.rotate(angle)

      // Bolt body
      const boltGrad = ctx.createLinearGradient(-boltLength / 2, -boltWidth, boltLength / 2, boltWidth)
      boltGrad.addColorStop(0, '#9a9690')
      boltGrad.addColorStop(0.3, '#b0aca6')
      boltGrad.addColorStop(0.7, '#a09c96')
      boltGrad.addColorStop(1, '#8a8680')

      ctx.fillStyle = boltGrad
      ctx.beginPath()
      ctx.roundRect(-boltLength / 2, -boltWidth / 2, boltLength, boltWidth, 2)
      ctx.fill()

      // Bolt shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.restore()
    }

    // ── SPOKED HANDLE WHEEL ──
    const handleR = radius * 0.28
    const handleCx = cx
    const handleCy = cy

    // Handle shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 15
    ctx.shadowOffsetY = 4

    // Handle outer ring
    const handleGrad = ctx.createLinearGradient(
      handleCx - handleR, handleCy - handleR,
      handleCx + handleR, handleCy + handleR
    )
    handleGrad.addColorStop(0, '#c0bcb6')
    handleGrad.addColorStop(0.25, '#a8a4a0')
    handleGrad.addColorStop(0.5, '#98948e')
    handleGrad.addColorStop(0.75, '#a8a4a0')
    handleGrad.addColorStop(1, '#908c88')
    ctx.lineWidth = radius * 0.04
    ctx.strokeStyle = handleGrad
    ctx.beginPath()
    ctx.arc(handleCx, handleCy, handleR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // Handle ring highlight (top)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(handleCx, handleCy, handleR, -Math.PI * 0.8, -Math.PI * 0.2)
    ctx.stroke()

    // ── SPOKES (5 spokes, rotated by dial angle) ──
    const spokeCount = 5
    const spokeAngleOffset = (dialAngle * Math.PI) / 180
    for (let i = 0; i < spokeCount; i++) {
      const angle = spokeAngleOffset + (i / spokeCount) * Math.PI * 2
      const innerR = radius * 0.06
      const outerR = handleR - radius * 0.015

      const x1 = handleCx + Math.cos(angle) * innerR
      const y1 = handleCy + Math.sin(angle) * innerR
      const x2 = handleCx + Math.cos(angle) * outerR
      const y2 = handleCy + Math.sin(angle) * outerR

      // Spoke body
      ctx.strokeStyle = '#a09c96'
      ctx.lineWidth = radius * 0.025
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Spoke highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Spoke grip (small ball at end)
      const gripX = handleCx + Math.cos(angle) * handleR
      const gripY = handleCy + Math.sin(angle) * handleR
      const gripR = radius * 0.025

      const gripGrad = ctx.createRadialGradient(
        gripX - gripR * 0.3, gripY - gripR * 0.3, 0,
        gripX, gripY, gripR
      )
      gripGrad.addColorStop(0, '#c8c4be')
      gripGrad.addColorStop(0.5, '#a09c96')
      gripGrad.addColorStop(1, '#88847e')
      ctx.beginPath()
      ctx.arc(gripX, gripY, gripR, 0, Math.PI * 2)
      ctx.fillStyle = gripGrad
      ctx.fill()
    }

    // Center hub
    const hubR = radius * 0.065
    const hubGrad = ctx.createRadialGradient(
      handleCx - hubR * 0.3, handleCy - hubR * 0.3, 0,
      handleCx, handleCy, hubR
    )
    hubGrad.addColorStop(0, '#d0ccc6')
    hubGrad.addColorStop(0.4, '#b0aca6')
    hubGrad.addColorStop(1, '#908c88')
    ctx.beginPath()
    ctx.arc(handleCx, handleCy, hubR, 0, Math.PI * 2)
    ctx.fillStyle = hubGrad
    ctx.fill()
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Hub highlight
    ctx.beginPath()
    ctx.arc(handleCx - hubR * 0.2, handleCy - hubR * 0.2, hubR * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fill()

    // ── COMBINATION DIAL (below handle) ──
    const dialCy = handleCy + handleR + radius * 0.18
    const dialR = radius * 0.1
    const dialCx = handleCx

    // Dial housing
    ctx.beginPath()
    ctx.arc(dialCx, dialCy, dialR * 1.25, 0, Math.PI * 2)
    ctx.fillStyle = '#3a3836'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Dial face
    const dialFaceGrad = ctx.createRadialGradient(
      dialCx - dialR * 0.2, dialCy - dialR * 0.2, 0,
      dialCx, dialCy, dialR
    )
    dialFaceGrad.addColorStop(0, '#c0bcb6')
    dialFaceGrad.addColorStop(0.5, '#a8a4a0')
    dialFaceGrad.addColorStop(1, '#908c88')
    ctx.beginPath()
    ctx.arc(dialCx, dialCy, dialR, 0, Math.PI * 2)
    ctx.fillStyle = dialFaceGrad
    ctx.fill()

    // Dial numbers
    ctx.fillStyle = '#4a4846'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const fontSize = Math.max(8, dialR * 0.35)
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    for (let i = 0; i < 12; i++) {
      const numAngle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const numR = dialR * 0.72
      const nx = dialCx + Math.cos(numAngle + (dialAngle * Math.PI) / 180) * numR
      const ny = dialCy + Math.sin(numAngle + (dialAngle * Math.PI) / 180) * numR
      ctx.fillText(String(i * 5), nx, ny)
    }

    // Dial tick marks
    for (let i = 0; i < 60; i++) {
      const tickAngle = (i / 60) * Math.PI * 2
      const tickOuter = dialR * 0.95
      const tickInner = i % 5 === 0 ? dialR * 0.82 : dialR * 0.88
      const tx1 = dialCx + Math.cos(tickAngle) * tickInner
      const ty1 = dialCy + Math.sin(tickAngle) * tickInner
      const tx2 = dialCx + Math.cos(tickAngle) * tickOuter
      const ty2 = dialCy + Math.sin(tickAngle) * tickOuter
      ctx.strokeStyle = i % 5 === 0 ? '#6a6866' : '#8a8886'
      ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.5
      ctx.beginPath()
      ctx.moveTo(tx1, ty1)
      ctx.lineTo(tx2, ty2)
      ctx.stroke()
    }

    // Dial pointer (fixed, top)
    ctx.fillStyle = '#c44'
    ctx.beginPath()
    ctx.moveTo(dialCx, dialCy - dialR * 1.25)
    ctx.lineTo(dialCx - 3, dialCy - dialR * 1.35)
    ctx.lineTo(dialCx + 3, dialCy - dialR * 1.35)
    ctx.closePath()
    ctx.fill()

    // ── MANUFACTURER PLATE ──
    const plateY = handleCy - handleR - radius * 0.22
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const plateFont = Math.max(8, radius * 0.04)
    ctx.font = `700 ${plateFont}px Inter, sans-serif`
    ctx.letterSpacing = '0.15em'
    ctx.fillText('SELECTED WORKS', handleCx, plateY)

    // Thin line below text
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 0.5
    const textW = ctx.measureText('SELECTED WORKS').width
    ctx.beginPath()
    ctx.moveTo(handleCx - textW / 2 - 10, plateY + plateFont * 0.8)
    ctx.lineTo(handleCx + textW / 2 + 10, plateY + plateFont * 0.8)
    ctx.stroke()

    ctx.restore()
  }

  ctx.restore()
}

function easeOutCubic(t) { return 1 - (1 - t) ** 3 }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2 }

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

  // Header text
  const headerOpacity = useTransform(scrollYProgress, [0.06, 0.14], [0, 1])
  const headerY = useTransform(scrollYProgress, [0.06, 0.14], [30, 0])

  // Tagline swap
  const taglineBefore = useTransform(scrollYProgress, [0.40, 0.48], [1, 0])
  const taglineAfter = useTransform(scrollYProgress, [0.52, 0.60], [0, 1])

  // Cards (HTML overlay, revealed after door opens)
  const cardsOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1])
  const cardsY = useTransform(scrollYProgress, [0.55, 0.65], [40, 0])
  const smoothCardsY = useSpring(cardsY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v
      setIsRevealed(v > 0.6)
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
      drawVault(ctx, w, h, progressRef.current, dpr)
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
        {/* Header */}
        <motion.div
          className="vault-header"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p className="label">Selected Work</p>
          <div className="vault-tagline-wrapper">
            <motion.p className="vault-tagline" style={{ opacity: taglineBefore }}>
              Some things are worth protecting.
            </motion.p>
            <motion.p className="vault-tagline vault-tagline-after" style={{ opacity: taglineAfter }}>
              Here's what I've built.
            </motion.p>
          </div>
        </motion.div>

        {/* Canvas (the vault door) */}
        <div className="vault-canvas-container" ref={containerRef}>
          <canvas ref={canvasRef} />
        </div>

        {/* Cards (HTML overlay, visible once door is open) */}
        <motion.div
          className="vault-cards"
          style={{ opacity: cardsOpacity, y: smoothCardsY }}
        >
          {featuredWork.map((project, i) => (
            <motion.div
              key={i}
              className="vault-card"
              initial={false}
              whileHover={isRevealed ? { y: -8, scale: 1.03 } : {}}
              transition={{ duration: 0.35, ease: ndsEase }}
            >
              <Link to={project.link} className="vault-card-link">
                <span className="vault-card-number">{project.number}</span>
                <span className="vault-card-tag">{project.tag}</span>
                <h3 className="vault-card-title">{project.title}</h3>
                <p className="vault-card-desc">{project.desc}</p>
                <span className="vault-card-arrow">&rarr;</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default VaultDoor
