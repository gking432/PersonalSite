import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import './GlobeSection.css'

const ndsEase = [0.22, 1, 0.36, 1]

// ─── JOURNEY DATA ───
const journeyPins = [
  {
    lat: 43.20, lng: -89.00,
    city: "Cambridge, WI",
    chapter: "The Beginning",
    story: "Born and raised in small-town Wisconsin.",
  },
  {
    lat: 43.04, lng: -87.91,
    city: "Milwaukee, WI",
    chapter: "College",
    story: "Marquette University. Marketing degree, business mindset.",
  },
  {
    lat: 43.07, lng: -89.40,
    city: "Madison, WI",
    chapter: "First Real Job",
    story: "Sub-Zero Group. Sales rotational program — learned how enterprise works.",
  },
  {
    lat: 33.49, lng: -111.93,
    city: "Scottsdale, AZ",
    chapter: "New Territory",
    story: "Relocated with Sub-Zero. Managed dealer networks across the Southwest.",
  },
  {
    lat: 32.78, lng: -79.93,
    city: "Charleston, SC",
    chapter: "Going Independent",
    story: "Started my marketing consultancy. First taste of building something from nothing.",
  },
  {
    lat: 39.74, lng: -104.99,
    city: "Denver, CO",
    chapter: "Scaling Up",
    story: "Moved the business to Denver. Built products, served clients, shipped fast.",
  },
  {
    lat: 43.50, lng: -89.50,
    city: "Wisconsin",
    chapter: "Full Circle",
    story: "AI changed everything. Came home to regroup and figure out what's next.",
  },
]

// ─── SIMPLIFIED LAND REGIONS ───
// [latMin, latMax, lngMin, lngMax] — rough continent shapes
const landRegions = [
  // North America
  [50, 85, -170, -55], [25, 50, -130, -65], [15, 30, -120, -82],
  [55, 72, -170, -135], [7, 20, -92, -77],
  // South America
  [-5, 13, -82, -34], [-25, -5, -75, -35], [-40, -25, -72, -48],
  [-56, -40, -75, -63],
  // Europe
  [36, 60, -10, 30], [55, 72, 5, 42], [36, 48, 20, 45],
  // Africa
  [20, 37, -18, 40], [-5, 20, -18, 52], [-35, -5, 12, 52],
  // Asia
  [40, 75, 28, 180], [25, 45, 25, 82], [5, 40, 65, 130],
  [-8, 8, 95, 141], [30, 46, 125, 146],
  // Australia
  [-40, -11, 110, 155],
  // Greenland
  [60, 84, -75, -12],
]

function isOnLand(lat, lng) {
  for (const [latMin, latMax, lngMin, lngMax] of landRegions) {
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) return true
  }
  return false
}

// ─── FIBONACCI SPHERE — LAND DOTS ONLY ───
function generateLandPoints(count) {
  const points = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2

  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / count)
    const phi = 2 * Math.PI * i / goldenRatio

    const lat = 90 - theta * 180 / Math.PI
    let lng = (phi * 180 / Math.PI) % 360
    if (lng > 180) lng -= 360

    if (isOnLand(lat, lng)) {
      points.push({ lat, lng })
    }
  }
  return points
}

// ─── ORTHOGRAPHIC PROJECTION ───
function projectPoint(lat, lng, centerLat, centerLng, radius) {
  const toRad = Math.PI / 180
  const λ = lng * toRad
  const φ = lat * toRad
  const λ0 = centerLng * toRad
  const φ0 = centerLat * toRad

  const cosφ = Math.cos(φ)
  const sinφ = Math.sin(φ)
  const cosφ0 = Math.cos(φ0)
  const sinφ0 = Math.sin(φ0)
  const cosΔλ = Math.cos(λ - λ0)

  const x = radius * cosφ * Math.sin(λ - λ0)
  const y = radius * (cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ)
  const z = sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ

  return { x, y, visible: z > 0 }
}

// ─── INTERPOLATION HELPERS ───
function lerp(a, b, t) { return a + (b - a) * t }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4) }
function clamp01(t) { return Math.max(0, Math.min(1, t)) }

// ═══════════════════════════════════════════
// GLOBE SECTION COMPONENT
// ═══════════════════════════════════════════
function GlobeSection() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const pinRefs = useRef([])
  const progressRef = useRef(0)
  const [visiblePins, setVisiblePins] = useState(0)
  const [hoveredPin, setHoveredPin] = useState(null)
  const [showHeader, setShowHeader] = useState(false)
  const animFrameRef = useRef(null)
  const paramsRef = useRef({ centerLat: 20, centerLng: 0, radius: 200, cx: 0, cy: 0 })

  const landPoints = useMemo(() => generateLandPoints(5000), [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Background fades in as section enters, fades out as it exits
  const bgOpacity = useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [0, 1, 1, 0])

  // ─── SCROLL LISTENER ───
  useEffect(() => {
    let prevPinCount = 0
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v

      // Show header when section enters view
      if (v > 0.08 && !showHeader) setShowHeader(true)

      // Pins appear in phase 4
      if (v < 0.62) {
        if (prevPinCount !== 0) {
          setVisiblePins(0)
          prevPinCount = 0
        }
      } else {
        const pinProgress = (v - 0.62) / 0.32
        const count = Math.min(
          Math.floor(pinProgress * (journeyPins.length + 1)),
          journeyPins.length
        )
        if (count !== prevPinCount) {
          setVisiblePins(count)
          prevPinCount = count
        }
      }
    })
    return () => unsub()
  }, [scrollYProgress, showHeader])

  // ─── CANVAS SETUP + RENDER LOOP ───
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
      if (!w || !h) { animFrameRef.current = requestAnimationFrame(render); return }

      const p = progressRef.current
      ctx.clearRect(0, 0, w, h)

      const baseRadius = Math.min(w, h) * 0.33
      const cx = w / 2
      const cy = h / 2

      // ── SCROLL PHASES ──
      let centerLng, centerLat, radius

      if (p < 0.22) {
        // Phase 1: Globe slowly rotating
        const t = clamp01(p / 0.22)
        centerLng = 40 - t * 160  // Rotate from Asia toward Atlantic
        centerLat = 20
        radius = baseRadius
      } else if (p < 0.45) {
        // Phase 2: Pan + rotate to center on North America
        const t = easeOutCubic(clamp01((p - 0.22) / 0.23))
        const startLng = 40 - 160
        centerLng = lerp(startLng, -95, t)
        centerLat = lerp(20, 39, t)
        radius = baseRadius
      } else if (p < 0.62) {
        // Phase 3: Zoom into the US
        const t = easeOutQuart(clamp01((p - 0.45) / 0.17))
        centerLng = -95
        centerLat = 39
        radius = lerp(baseRadius, baseRadius * 4, t)
      } else {
        // Phase 4: Zoomed in, pins dropping
        centerLng = -95
        centerLat = 39
        radius = baseRadius * 4
      }

      // Store for pin positioning
      paramsRef.current = { centerLat, centerLng, radius, cx, cy }

      // ── ATMOSPHERIC GLOW ──
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.25)
      glowGrad.addColorStop(0, 'rgba(26, 58, 46, 0.25)')
      glowGrad.addColorStop(0.5, 'rgba(26, 58, 46, 0.08)')
      glowGrad.addColorStop(1, 'rgba(26, 58, 46, 0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2)
      ctx.fill()

      // ── GLOBE BODY ──
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.25, cy - radius * 0.25, 0,
        cx, cy, radius
      )
      bodyGrad.addColorStop(0, 'rgba(50, 50, 50, 0.4)')
      bodyGrad.addColorStop(0.6, 'rgba(30, 30, 30, 0.45)')
      bodyGrad.addColorStop(1, 'rgba(15, 15, 15, 0.5)')
      ctx.fillStyle = bodyGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()

      // ── GLOBE RIM ──
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.08)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.stroke()

      // ── GRID LINES (subtle) ──
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.03)'
      ctx.lineWidth = 0.5

      // Latitude lines
      for (let lat = -60; lat <= 80; lat += 20) {
        ctx.beginPath()
        let started = false
        for (let lng = -180; lng <= 180; lng += 2) {
          const { x, y, visible } = projectPoint(lat, lng, centerLat, centerLng, radius)
          if (visible) {
            const sx = cx + x
            const sy = cy - y
            if (!started) { ctx.moveTo(sx, sy); started = true }
            else ctx.lineTo(sx, sy)
          } else {
            started = false
          }
        }
        ctx.stroke()
      }

      // Longitude lines
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath()
        let started = false
        for (let lat = -90; lat <= 90; lat += 2) {
          const { x, y, visible } = projectPoint(lat, lng, centerLat, centerLng, radius)
          if (visible) {
            const sx = cx + x
            const sy = cy - y
            if (!started) { ctx.moveTo(sx, sy); started = true }
            else ctx.lineTo(sx, sy)
          } else {
            started = false
          }
        }
        ctx.stroke()
      }

      // ── LAND DOTS ──
      const dotRadius = Math.max(1.2, radius / 200)

      // Clip to globe circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2)
      ctx.clip()

      for (const pt of landPoints) {
        const { x, y, visible } = projectPoint(pt.lat, pt.lng, centerLat, centerLng, radius)
        if (!visible) continue

        const sx = cx + x
        const sy = cy - y

        // Skip if outside canvas (with margin)
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue

        const dist = Math.sqrt(x * x + y * y) / radius
        const alpha = 0.6 * Math.max(0, 1 - dist * dist * dist * 1.2)

        if (alpha < 0.02) continue

        ctx.fillStyle = `rgba(244, 241, 234, ${alpha})`
        ctx.beginPath()
        ctx.arc(sx, sy, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      // ── JOURNEY PATH (connecting line between visible pins) ──
      if (p >= 0.65) {
        const pathPoints = []
        for (let i = 0; i < journeyPins.length; i++) {
          const pin = journeyPins[i]
          const { x, y, visible } = projectPoint(pin.lat, pin.lng, centerLat, centerLng, radius)
          if (visible) {
            pathPoints.push({ sx: cx + x, sy: cy - y, index: i })
          }
        }

        if (pathPoints.length > 1) {
          ctx.save()
          ctx.beginPath()
          ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2)
          ctx.clip()

          ctx.strokeStyle = 'rgba(26, 58, 46, 0.35)'
          ctx.lineWidth = 1.5
          ctx.setLineDash([6, 4])
          ctx.beginPath()
          ctx.moveTo(pathPoints[0].sx, pathPoints[0].sy)
          for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].sx, pathPoints[i].sy)
          }
          ctx.stroke()
          ctx.setLineDash([])
          ctx.restore()
        }
      }

      // ── UPDATE PIN DOM POSITIONS ──
      for (let i = 0; i < journeyPins.length; i++) {
        const el = pinRefs.current[i]
        if (!el) continue

        const pin = journeyPins[i]
        const { x, y, visible } = projectPoint(pin.lat, pin.lng, centerLat, centerLng, radius)
        const sx = cx + x
        const sy = cy - y

        el.style.left = sx + 'px'
        el.style.top = sy + 'px'
        el.dataset.onscreen = visible ? '1' : '0'
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [landPoints])

  // ── DETERMINE CARD DIRECTION (avoid going off-screen) ──
  const getCardDirection = useCallback((index) => {
    // Eastern US pins → card on right, Western → card on left
    const pin = journeyPins[index]
    if (pin.lng < -100) return 'left'  // Scottsdale, Denver
    return 'right'  // WI, Milwaukee, Madison, Charleston
  }, [])

  return (
    <section className="globe-section" ref={sectionRef}>
      {/* Dark background that fades in/out with scroll */}
      <motion.div
        className="globe-bg"
        style={{ opacity: bgOpacity }}
      />

      <div className="globe-sticky">
        {/* Header */}
        <div className="globe-header-container">
          <motion.div
            className="globe-header"
            initial={{ opacity: 0, y: 30 }}
            animate={showHeader ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: ndsEase }}
          >
            <p className="globe-label">Journey</p>
            <h2 className="globe-heading">Where I've Been</h2>
          </motion.div>
        </div>

        {/* Canvas + Pin Container */}
        <div className="globe-canvas-container" ref={containerRef}>
          <canvas ref={canvasRef} />

          {/* Pin Overlays */}
          {journeyPins.map((pin, i) => (
            <div
              key={i}
              ref={el => pinRefs.current[i] = el}
              className={`globe-pin ${i < visiblePins ? 'globe-pin-visible' : ''} ${hoveredPin === i ? 'globe-pin-hovered' : ''}`}
              onMouseEnter={() => setHoveredPin(i)}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={() => setHoveredPin(hoveredPin === i ? null : i)}
            >
              <div className="globe-pin-dot" />
              <div className="globe-pin-ring" />

              <AnimatePresence>
                {hoveredPin === i && (
                  <motion.div
                    className={`globe-pin-card globe-pin-card-${getCardDirection(i)}`}
                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: ndsEase }}
                  >
                    <span className="globe-pin-chapter">{pin.chapter}</span>
                    <h4 className="globe-pin-city">{pin.city}</h4>
                    <p className="globe-pin-story">{pin.story}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Prompt text (appears when pins start showing) */}
        <motion.div
          className="globe-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: visiblePins > 0 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: ndsEase }}
        >
          <p>Hover over a pin to explore</p>
        </motion.div>
      </div>
    </section>
  )
}

export default GlobeSection
