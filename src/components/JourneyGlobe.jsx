import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { journeyStops } from './journeyData'
import './JourneyGlobe.css'

const DEG = Math.PI / 180

// Great-circle interpolation for the gilded travel arcs.
function slerp(a, b, t) {
  let d = a.x * b.x + a.y * b.y + a.z * b.z
  d = Math.max(-1, Math.min(1, d))
  const o = Math.acos(d)
  if (o < 1e-4) return a
  const s = Math.sin(o), k0 = Math.sin((1 - t) * o) / s, k1 = Math.sin(t * o) / s
  return { x: a.x * k0 + b.x * k1, y: a.y * k0 + b.y * k1, z: a.z * k0 + b.z * k1 }
}
const baseVec = (lat, lon) => {
  const la = lat * DEG, lo = lon * DEG
  return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) }
}

export default function JourneyGlobe() {
  const canvasRef = useRef(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, cx = 0, cy = 0, R = 0, dpr = 1

    function resize() {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = w / 2; cy = h / 2; R = Math.min(w, h) * 0.42
    }
    resize()
    window.addEventListener('resize', resize)

    // Precompute arc segments between consecutive cities.
    const placeBase = journeyStops.map(p => baseVec(p.lat, p.lng))
    const arcs = []
    for (let i = 0; i < placeBase.length - 1; i++) {
      const seg = []
      for (let s = 0; s <= 44; s++) {
        const tt = s / 44
        const m = slerp(placeBase[i], placeBase[i + 1], tt)
        const lift = 1 + 0.16 * Math.sin(Math.PI * tt)
        seg.push({ x: m.x * lift, y: m.y * lift, z: m.z * lift })
      }
      arcs.push(seg)
    }

    // Current + target rotation. Target faces the active city.
    let ry = -journeyStops[0].lng * DEG
    let rx = journeyStops[0].lat * DEG
    let raf
    let t = 0

    const rotPt = (v) => {
      const x = v.x * Math.cos(ry) + v.z * Math.sin(ry)
      const z0 = -v.x * Math.sin(ry) + v.z * Math.cos(ry)
      const y2 = v.y * Math.cos(rx) - z0 * Math.sin(rx)
      const z2 = v.y * Math.sin(rx) + z0 * Math.cos(rx)
      return { x, y: y2, z: z2 }
    }
    const project = (lat, lon) => rotPt(baseVec(lat, lon))

    function draw() {
      t += 0.016
      const a = activeRef.current
      const tgtRy = -journeyStops[a].lng * DEG
      const tgtRx = journeyStops[a].lat * DEG
      // shortest-path ease toward target longitude
      let dRy = tgtRy - ry
      while (dRy > Math.PI) dRy -= 2 * Math.PI
      while (dRy < -Math.PI) dRy += 2 * Math.PI
      ry += dRy * 0.06
      rx += (tgtRx - rx) * 0.06

      ctx.clearRect(0, 0, w, h)

      // soft sphere shading
      const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 1.1)
      grad.addColorStop(0, 'rgba(255, 252, 244, 0.9)')
      grad.addColorStop(0.7, 'rgba(244, 240, 230, 0.5)')
      grad.addColorStop(1, 'rgba(232, 226, 212, 0)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2); ctx.fill()

      // gilded outline ring
      ctx.strokeStyle = 'rgba(160, 130, 70, 0.45)'
      ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()

      // meridians + parallels
      const line = (pts) => {
        ctx.beginPath()
        let started = false
        pts.forEach((p) => {
          const sx = cx + p.x * R, sy = cy - p.y * R
          if (p.z >= -0.02) {
            if (!started) { ctx.moveTo(sx, sy); started = true } else ctx.lineTo(sx, sy)
          } else started = false
        })
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(26, 26, 23, 0.12)'
      ctx.lineWidth = 1
      for (let lon = -180; lon < 180; lon += 30) {
        const pts = []
        for (let lat = -90; lat <= 90; lat += 4) pts.push(rotPt(baseVec(lat, lon)))
        line(pts)
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = []
        for (let lon = -180; lon <= 180; lon += 4) pts.push(rotPt(baseVec(lat, lon)))
        line(pts)
      }

      // travel arcs up to the active stop
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(168, 130, 60, 0.7)'
      for (let i = 0; i < Math.min(a, arcs.length); i++) {
        ctx.beginPath()
        let started = false
        arcs[i].forEach((bp) => {
          const p = rotPt(bp)
          const sx = cx + p.x * R, sy = cy - p.y * R
          if (p.z >= -0.02) {
            if (!started) { ctx.moveTo(sx, sy); started = true } else ctx.lineTo(sx, sy)
          } else started = false
        })
        ctx.stroke()
      }

      // pins
      journeyStops.forEach((pl, i) => {
        const p = project(pl.lat, pl.lng)
        if (p.z < -0.05) return
        const sx = cx + p.x * R, sy = cy - p.y * R
        const alpha = 0.4 + (p.z + 1) * 0.3
        const isActive = i === a
        const visited = i <= a
        ctx.fillStyle = isActive
          ? `rgba(180, 140, 60, ${alpha})`
          : visited ? `rgba(31, 64, 52, ${alpha})` : `rgba(31, 64, 52, ${alpha * 0.5})`
        ctx.beginPath(); ctx.arc(sx, sy, isActive ? 5 : 3, 0, Math.PI * 2); ctx.fill()
        if (isActive) {
          ctx.strokeStyle = `rgba(180, 140, 60, ${alpha * 0.55})`
          ctx.lineWidth = 1.2
          const pulse = reduce ? 10 : 9 + Math.sin(t * 3) * 2.5
          ctx.beginPath(); ctx.arc(sx, sy, pulse, 0, Math.PI * 2); ctx.stroke()
          if (p.z > 0.1) {
            ctx.fillStyle = `rgba(26, 26, 23, ${alpha})`
            ctx.font = '600 13px Inter, sans-serif'
            ctx.fillText(pl.city, sx + 13, sy + 4)
          }
        }
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const stop = journeyStops[active]

  return (
    <div className="jg">
      <ol className="jg__list">
        {journeyStops.map((s, i) => (
          <li key={s.city}>
            <button
              className={`jg__item ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="jg__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="jg__item-text">
                <span className="jg__item-chapter">{s.chapter}</span>
                <span className="jg__item-city">{s.city}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="jg__stage">
        <canvas ref={canvasRef} className="jg__canvas" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="jg__card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="jg__card-index">{String(active + 1).padStart(2, '0')} / {String(journeyStops.length).padStart(2, '0')}</span>
            <span className="jg__card-chapter">{stop.chapter}</span>
            <h3 className="jg__card-city">{stop.city}</h3>
            <p className="jg__card-story">{stop.story}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
