import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useState, useRef, useEffect, useMemo } from 'react'
import './GlobeSection.css'

const ndsEase = [0.22, 1, 0.36, 1]

// ═══════════════════════════════════════════
// JOURNEY STOPS — sequential zoom storytelling
// ═══════════════════════════════════════════
const journeyStops = [
  {
    lat: 43.20, lng: -89.00, zoom: 6,
    city: "Cambridge, WI",
    chapter: "The Beginning",
    story: "Born and raised in small-town Wisconsin. The kind of place where everyone knows your name and nobody locks their doors.",
    stateId: "55",
  },
  {
    lat: 43.04, lng: -87.91, zoom: 7,
    city: "Milwaukee, WI",
    chapter: "College",
    story: "Marquette University. Marketing degree, business mindset. Learned how to think strategically and sell an idea.",
    stateId: "55",
  },
  {
    lat: 43.07, lng: -89.40, zoom: 7,
    city: "Madison, WI",
    chapter: "First Real Job",
    story: "Sub-Zero Group. Inaugural candidate in their sales rotational program. Learned how enterprise actually works from the inside.",
    stateId: "55",
  },
  {
    lat: 33.49, lng: -111.93, zoom: 5,
    city: "Scottsdale, AZ",
    chapter: "New Territory",
    story: "Relocated with Sub-Zero to manage dealer networks across the Southwest. First time living somewhere that wasn't Wisconsin.",
    stateId: "04",
  },
  {
    lat: 32.78, lng: -79.93, zoom: 5,
    city: "Charleston, SC",
    chapter: "Going Independent",
    story: "Started my own marketing consultancy. First taste of building something from nothing. Terrifying and addictive in equal measure.",
    stateId: "45",
  },
  {
    lat: 39.74, lng: -104.99, zoom: 5,
    city: "Denver, CO",
    chapter: "Scaling Up",
    story: "Moved the business to Denver. Built products, served clients, shipped fast. Learned what it means to wear every hat.",
    stateId: "08",
  },
  {
    lat: 43.40, lng: -89.30, zoom: 5,
    city: "Wisconsin",
    chapter: "Full Circle",
    story: "AI changed everything. The consultancy model got disrupted overnight. Came home to regroup and figure out what's next.",
    stateId: "55",
  },
]

// ═══════════════════════════════════════════
// SCROLL TIMING
// ═══════════════════════════════════════════
const INTRO_START = 0.08
const INTRO_END = 0.18
const STOPS_START = INTRO_END
const STOPS_END = 0.88
const OUTRO_START = STOPS_END
const OUTRO_END = 0.96
const NUM_STOPS = journeyStops.length
const PER_STOP = (STOPS_END - STOPS_START) / NUM_STOPS
const FLY_RATIO = 0.3
const DWELL_RATIO = 0.7

function getScrollPhase(p) {
  if (p < INTRO_START) return { phase: 'hidden' }
  if (p < INTRO_END) return { phase: 'intro', t: (p - INTRO_START) / (INTRO_END - INTRO_START) }
  if (p >= OUTRO_START && p < OUTRO_END) return { phase: 'outro', t: (p - OUTRO_START) / (OUTRO_END - OUTRO_START) }
  if (p >= OUTRO_END) return { phase: 'done' }

  // Within stops range
  const stopProgress = p - STOPS_START
  const stopIndex = Math.min(Math.floor(stopProgress / PER_STOP), NUM_STOPS - 1)
  const within = (stopProgress - stopIndex * PER_STOP) / PER_STOP

  if (within < FLY_RATIO) {
    return { phase: 'fly', stopIndex, t: within / FLY_RATIO }
  }
  return { phase: 'dwell', stopIndex, t: (within - FLY_RATIO) / DWELL_RATIO }
}

// ═══════════════════════════════════════════
// CAMERA STATE from scroll progress
// ═══════════════════════════════════════════
function getCameraState(p) {
  const { phase, stopIndex, t } = getScrollPhase(p)

  if (phase === 'hidden') {
    return { lat: 20, lng: 40, zoom: 1, activeStop: -1 }
  }

  if (phase === 'intro') {
    const eased = easeOutCubic(t)
    return { lat: 20, lng: 40 - eased * 140, zoom: 1, activeStop: -1 }
  }

  if (phase === 'fly') {
    const eased = easeInOutCubic(t)
    const target = journeyStops[stopIndex]

    let prevLat, prevLng, prevZoom
    if (stopIndex === 0) {
      // Flying from intro end position
      prevLat = 20; prevLng = 40 - 140; prevZoom = 1
    } else {
      const prev = journeyStops[stopIndex - 1]
      prevLat = prev.lat; prevLng = prev.lng; prevZoom = prev.zoom
    }

    return {
      lat: lerp(prevLat, target.lat, eased),
      lng: lerp(prevLng, target.lng, eased),
      zoom: lerp(prevZoom, target.zoom, eased),
      activeStop: -1,
    }
  }

  if (phase === 'dwell') {
    const stop = journeyStops[stopIndex]
    return { lat: stop.lat, lng: stop.lng, zoom: stop.zoom, activeStop: stopIndex }
  }

  if (phase === 'outro') {
    const last = journeyStops[NUM_STOPS - 1]
    const eased = easeOutCubic(t)
    return {
      lat: lerp(last.lat, 39, eased),
      lng: lerp(last.lng, -96, eased),
      zoom: lerp(last.zoom, 3.2, eased),
      activeStop: -2, // Special: show all pins
    }
  }

  // 'done'
  return { lat: 39, lng: -96, zoom: 3.2, activeStop: -2 }
}

// ═══════════════════════════════════════════
// TOPOJSON → GEOJSON DECODER (inline, no dependency)
// ═══════════════════════════════════════════
function decodeTopoJSON(topology, objectName) {
  const obj = topology.objects[objectName]
  const { arcs, transform } = topology

  const decodedArcs = arcs.map(arc => {
    let x = 0, y = 0
    return arc.map(([dx, dy]) => {
      x += dx; y += dy
      return transform
        ? [x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]]
        : [x, y]
    })
  })

  function resolveArc(index) {
    return index >= 0 ? decodedArcs[index] : decodedArcs[~index].slice().reverse()
  }

  function resolveRing(indices) {
    let coords = []
    for (const idx of indices) {
      const arc = resolveArc(idx)
      coords.push(...(coords.length > 0 ? arc.slice(1) : arc))
    }
    return coords
  }

  const geometries = obj.type === 'GeometryCollection' ? obj.geometries : [obj]

  return geometries.map(geom => {
    if (!geom.arcs) return null
    let coordinates
    if (geom.type === 'Polygon') {
      coordinates = geom.arcs.map(resolveRing)
    } else if (geom.type === 'MultiPolygon') {
      coordinates = geom.arcs.map(poly => poly.map(resolveRing))
    } else return null

    return { type: geom.type, coordinates, id: geom.id, properties: geom.properties || {} }
  }).filter(Boolean)
}

// ═══════════════════════════════════════════
// PROJECTION + MATH
// ═══════════════════════════════════════════
const TO_RAD = Math.PI / 180

function projectPoint(lat, lng, centerLat, centerLng, radius) {
  const λ = lng * TO_RAD, φ = lat * TO_RAD
  const λ0 = centerLng * TO_RAD, φ0 = centerLat * TO_RAD
  const cosφ = Math.cos(φ), sinφ = Math.sin(φ)
  const cosφ0 = Math.cos(φ0), sinφ0 = Math.sin(φ0)
  const cosΔλ = Math.cos(λ - λ0)

  return {
    x: radius * cosφ * Math.sin(λ - λ0),
    y: radius * (cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ),
    visible: sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ > 0,
  }
}

function lerp(a, b, t) { return a + (b - a) * t }
function easeOutCubic(t) { return 1 - (1 - t) ** 3 }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2 }

// ── LAND DOT GENERATION (fibonacci sphere, rectangle-based land check) ──
const landRegions = [
  [50,85,-170,-55],[25,50,-130,-65],[15,30,-120,-82],[55,72,-170,-135],[7,20,-92,-77],
  [-5,13,-82,-34],[-25,-5,-75,-35],[-40,-25,-72,-48],[-56,-40,-75,-63],
  [36,60,-10,30],[55,72,5,42],[36,48,20,45],
  [20,37,-18,40],[-5,20,-18,52],[-35,-5,12,52],
  [40,75,28,180],[25,45,25,82],[5,40,65,130],[-8,8,95,141],[30,46,125,146],
  [-40,-11,110,155],[60,84,-75,-12],
]

function isOnLand(lat, lng) {
  for (const [a, b, c, d] of landRegions) {
    if (lat >= a && lat <= b && lng >= c && lng <= d) return true
  }
  return false
}

function generateLandPoints(count) {
  const pts = [], gr = (1 + Math.sqrt(5)) / 2
  for (let i = 0; i < count; i++) {
    const θ = Math.acos(1 - 2 * (i + 0.5) / count)
    const φ = 2 * Math.PI * i / gr
    const lat = 90 - θ * 180 / Math.PI
    let lng = (φ * 180 / Math.PI) % 360; if (lng > 180) lng -= 360
    if (isOnLand(lat, lng)) pts.push({ lat, lng })
  }
  return pts
}

// ═══════════════════════════════════════════
// CANVAS DRAWING HELPERS
// ═══════════════════════════════════════════
function drawGeoFeatures(ctx, features, cLat, cLng, R, cx, cy, opts = {}) {
  const { fill, stroke, lineWidth = 0.8, highlightId, highlightFill, highlightStroke } = opts

  for (const feat of features) {
    const isHighlight = highlightId && String(feat.id) === String(highlightId)
    const polygons = feat.type === 'Polygon' ? [feat.coordinates] :
                     feat.type === 'MultiPolygon' ? feat.coordinates : []

    for (const polygon of polygons) {
      ctx.beginPath()
      for (const ring of polygon) {
        let started = false, prevVis = false
        for (const [lng, lat] of ring) {
          const { x, y, visible } = projectPoint(lat, lng, cLat, cLng, R)
          if (visible) {
            const sx = cx + x, sy = cy - y
            if (!started || !prevVis) { ctx.moveTo(sx, sy); started = true }
            else ctx.lineTo(sx, sy)
          }
          prevVis = visible
        }
        if (started) ctx.closePath()
      }

      // Fill
      if (isHighlight && highlightFill) {
        ctx.fillStyle = highlightFill
        ctx.fill('evenodd')
      } else if (fill) {
        ctx.fillStyle = fill
        ctx.fill('evenodd')
      }

      // Stroke
      if (isHighlight && highlightStroke) {
        ctx.strokeStyle = highlightStroke
        ctx.lineWidth = lineWidth * 2
        ctx.stroke()
      } else if (stroke) {
        ctx.strokeStyle = stroke
        ctx.lineWidth = lineWidth
        ctx.stroke()
      }
    }
  }
}

function drawPin(ctx, lat, lng, cLat, cLng, R, cx, cy, opts = {}) {
  const { size = 5, glow = false, visited = false } = opts
  const { x, y, visible } = projectPoint(lat, lng, cLat, cLng, R)
  if (!visible) return

  const sx = cx + x, sy = cy - y

  if (glow) {
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 4)
    g.addColorStop(0, 'rgba(244, 241, 234, 0.35)')
    g.addColorStop(1, 'rgba(244, 241, 234, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(sx, sy, size * 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Outer ring
  ctx.strokeStyle = visited ? 'rgba(244, 241, 234, 0.5)' : 'rgba(244, 241, 234, 0.9)'
  ctx.lineWidth = visited ? 1.5 : 2
  ctx.beginPath()
  ctx.arc(sx, sy, visited ? size * 0.7 : size, 0, Math.PI * 2)
  ctx.stroke()

  // Inner dot
  ctx.fillStyle = visited ? 'rgba(244, 241, 234, 0.4)' : 'rgba(244, 241, 234, 0.95)'
  ctx.beginPath()
  ctx.arc(sx, sy, visited ? size * 0.3 : size * 0.45, 0, Math.PI * 2)
  ctx.fill()
}

// ═══════════════════════════════════════════
// GLOBE SECTION COMPONENT
// ═══════════════════════════════════════════
function GlobeSection() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const progressRef = useRef(0)
  const animFrameRef = useRef(null)
  const geoRef = useRef({ world: null, states: null })

  const [geoLoaded, setGeoLoaded] = useState(false)
  const [activeStop, setActiveStop] = useState(-1)
  const [showHeader, setShowHeader] = useState(false)

  const landPoints = useMemo(() => generateLandPoints(3000), [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const bgOpacity = useTransform(scrollYProgress, [0.04, 0.12, 0.90, 0.98], [0, 1, 1, 0])

  // ─── LOAD GEOJSON DATA ───
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [worldRes, statesRes] = await Promise.all([
          fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
          fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'),
        ])
        const worldTopo = await worldRes.json()
        const statesTopo = await statesRes.json()

        if (cancelled) return

        geoRef.current = {
          world: decodeTopoJSON(worldTopo, 'countries'),
          states: decodeTopoJSON(statesTopo, 'states'),
        }
        setGeoLoaded(true)
      } catch (err) {
        console.warn('Globe: failed to load geo data, falling back to dots only', err)
        setGeoLoaded(true) // proceed with dots fallback
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ─── SCROLL LISTENER ───
  useEffect(() => {
    let prev = -1
    const unsub = scrollYProgress.on("change", (v) => {
      progressRef.current = v
      if (v > 0.06 && !showHeader) setShowHeader(true)

      const cam = getCameraState(v)
      if (cam.activeStop !== prev) {
        setActiveStop(cam.activeStop)
        prev = cam.activeStop
      }
    })
    return () => unsub()
  }, [scrollYProgress, showHeader])

  // ─── CANVAS RENDER LOOP ───
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
      const cam = getCameraState(p)
      const baseRadius = Math.min(w, h) * 0.33
      const radius = baseRadius * cam.zoom
      const cx = w / 2
      const cy = h / 2
      const { lat: cLat, lng: cLng } = cam

      ctx.clearRect(0, 0, w, h)

      // ── ATMOSPHERIC GLOW ──
      // Only draw when globe edge is visible
      if (radius < Math.max(w, h) * 1.2) {
        const gg = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.2)
        gg.addColorStop(0, 'rgba(26, 58, 46, 0.25)')
        gg.addColorStop(0.5, 'rgba(26, 58, 46, 0.08)')
        gg.addColorStop(1, 'rgba(26, 58, 46, 0)')
        ctx.fillStyle = gg
        ctx.beginPath()
        ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── GLOBE BODY ──
      const bg = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius)
      bg.addColorStop(0, 'rgba(40, 45, 42, 0.5)')
      bg.addColorStop(0.6, 'rgba(25, 28, 26, 0.55)')
      bg.addColorStop(1, 'rgba(12, 14, 13, 0.6)')
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()

      // ── GLOBE RIM ──
      if (radius < Math.max(w, h) * 1.2) {
        ctx.strokeStyle = 'rgba(244, 241, 234, 0.07)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // ── CLIP TO GLOBE ──
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2)
      ctx.clip()

      // ── GRID LINES ──
      const gridAlpha = cam.zoom > 4 ? 0.015 : 0.03
      ctx.strokeStyle = `rgba(244, 241, 234, ${gridAlpha})`
      ctx.lineWidth = 0.5

      const gridStep = cam.zoom > 3 ? 10 : 20
      for (let lat = -80; lat <= 80; lat += gridStep) {
        ctx.beginPath()
        let started = false
        for (let lng = -180; lng <= 180; lng += 3) {
          const { x, y, visible } = projectPoint(lat, lng, cLat, cLng, radius)
          if (visible) {
            const sx = cx + x, sy = cy - y
            if (!started) { ctx.moveTo(sx, sy); started = true }
            else ctx.lineTo(sx, sy)
          } else started = false
        }
        ctx.stroke()
      }
      for (let lng = -180; lng < 180; lng += (cam.zoom > 3 ? 10 : 30)) {
        ctx.beginPath()
        let started = false
        for (let lat = -90; lat <= 90; lat += 3) {
          const { x, y, visible } = projectPoint(lat, lng, cLat, cLng, radius)
          if (visible) {
            const sx = cx + x, sy = cy - y
            if (!started) { ctx.moveTo(sx, sy); started = true }
            else ctx.lineTo(sx, sy)
          } else started = false
        }
        ctx.stroke()
      }

      // ── LAND: GEOJSON OUTLINES ──
      const { world, states } = geoRef.current
      const currentStateId = cam.activeStop >= 0 ? journeyStops[cam.activeStop].stateId : null

      if (world) {
        drawGeoFeatures(ctx, world, cLat, cLng, radius, cx, cy, {
          fill: 'rgba(244, 241, 234, 0.06)',
          stroke: 'rgba(244, 241, 234, 0.12)',
          lineWidth: cam.zoom > 3 ? 0.5 : 0.8,
        })
      }

      // US state boundaries (fade in when zoomed)
      if (states && cam.zoom > 2) {
        const stateAlpha = Math.min(1, (cam.zoom - 2) / 2)
        drawGeoFeatures(ctx, states, cLat, cLng, radius, cx, cy, {
          fill: `rgba(244, 241, 234, ${0.03 * stateAlpha})`,
          stroke: `rgba(244, 241, 234, ${0.15 * stateAlpha})`,
          lineWidth: 0.6,
          highlightId: currentStateId,
          highlightFill: `rgba(26, 58, 46, ${0.35 * stateAlpha})`,
          highlightStroke: `rgba(244, 241, 234, ${0.4 * stateAlpha})`,
        })
      }

      // ── LAND DOTS (texture layer) ──
      const dotR = Math.max(1, radius / 220)
      const dotAlpha = world ? 0.25 : 0.5 // Dimmer when outlines present
      for (const pt of landPoints) {
        const { x, y, visible } = projectPoint(pt.lat, pt.lng, cLat, cLng, radius)
        if (!visible) continue
        const sx = cx + x, sy = cy - y
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue
        const dist = Math.sqrt(x * x + y * y) / radius
        const a = dotAlpha * Math.max(0, 1 - dist ** 3 * 1.2)
        if (a < 0.01) continue
        ctx.fillStyle = `rgba(244, 241, 234, ${a})`
        ctx.beginPath()
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── JOURNEY PATH (connecting visited stops) ──
      const visitedCount = cam.activeStop === -2 ? NUM_STOPS :
                           cam.activeStop >= 0 ? cam.activeStop + 1 : 0

      if (visitedCount > 1) {
        ctx.strokeStyle = 'rgba(244, 241, 234, 0.2)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        let pathStarted = false
        for (let i = 0; i < visitedCount; i++) {
          const s = journeyStops[i]
          const { x, y, visible } = projectPoint(s.lat, s.lng, cLat, cLng, radius)
          if (visible) {
            const sx = cx + x, sy = cy - y
            if (!pathStarted) { ctx.moveTo(sx, sy); pathStarted = true }
            else ctx.lineTo(sx, sy)
          } else pathStarted = false
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      // ── PINS ──
      // Visited stops: small, dimmed
      for (let i = 0; i < visitedCount; i++) {
        if (i === cam.activeStop) continue // Draw active one last (on top)
        const s = journeyStops[i]
        drawPin(ctx, s.lat, s.lng, cLat, cLng, radius, cx, cy, {
          size: 5, visited: true,
        })
      }

      // Active stop: large, glowing
      if (cam.activeStop >= 0) {
        const s = journeyStops[cam.activeStop]
        drawPin(ctx, s.lat, s.lng, cLat, cLng, radius, cx, cy, {
          size: 7, glow: true,
        })
      }

      // Outro: show all pins prominently
      if (cam.activeStop === -2) {
        for (let i = 0; i < NUM_STOPS; i++) {
          const s = journeyStops[i]
          drawPin(ctx, s.lat, s.lng, cLat, cLng, radius, cx, cy, {
            size: 5, glow: false,
          })
        }
      }

      ctx.restore() // End globe clip

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [landPoints, geoLoaded])

  return (
    <section className="globe-section" ref={sectionRef}>
      <motion.div className="globe-bg" style={{ opacity: bgOpacity }} />

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

        {/* Canvas */}
        <div className="globe-canvas-container" ref={containerRef}>
          <canvas ref={canvasRef} />
        </div>

        {/* Story Card — positioned bottom-left */}
        <AnimatePresence mode="wait">
          {activeStop >= 0 && (
            <motion.div
              key={activeStop}
              className="globe-story-card"
              initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: ndsEase }}
            >
              <span className="globe-story-index">
                {String(activeStop + 1).padStart(2, '0')} / {String(NUM_STOPS).padStart(2, '0')}
              </span>
              <span className="globe-story-chapter">{journeyStops[activeStop].chapter}</span>
              <h3 className="globe-story-city">{journeyStops[activeStop].city}</h3>
              <p className="globe-story-text">{journeyStops[activeStop].story}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outro summary */}
        <AnimatePresence>
          {activeStop === -2 && (
            <motion.div
              className="globe-story-card globe-outro-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              <span className="globe-story-chapter">Seven Cities. One Thread.</span>
              <h3 className="globe-story-city">The common thread?</h3>
              <p className="globe-story-text">
                Every move taught me something new. Every chapter made me more dangerous.
                Marketing, product, AI — it all compounds.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default GlobeSection
