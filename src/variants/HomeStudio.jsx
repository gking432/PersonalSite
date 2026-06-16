import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  identity,
  approachPrinciples,
  resumeTimeline,
  resumeHighlights,
  cta
} from '../data/homeContent'
import HorizonJourney from '../components/HorizonJourney'
import SqueezeSection from '../components/SqueezeSection'
import './HomeStudio.css'

const ease = [0.22, 1, 0.36, 1]

const places = [
  { name: 'Milwaukee', lat: 43.04, lon: -87.91, home: true },
  { name: 'Madison', lat: 43.07, lon: -89.4 },
  { name: 'Denver', lat: 39.74, lon: -104.99 },
  { name: 'Rome', lat: 41.9, lon: 12.5 }
]

// A clean, gilded wireframe globe — slowly rotating, marking the places.
// NDS's signature delightful object, done light on warm white.
function Globe() {
  const canvasRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, w, h, R, cx, cy

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = Math.min(w, h) * 0.4
      cx = w / 2; cy = h / 2
    }
    resize(); window.addEventListener('resize', resize)

    const toXYZ = (lat, lon, ry, rx) => {
      const la = (lat * Math.PI) / 180
      const lo = (lon * Math.PI) / 180 + ry
      const x = Math.cos(la) * Math.sin(lo)
      const y = Math.sin(la)
      const z = Math.cos(la) * Math.cos(lo)
      const y2 = y * Math.cos(rx) - z * Math.sin(rx)
      const z2 = y * Math.sin(rx) + z * Math.cos(rx)
      return { x, y: y2, z: z2 }
    }
    const baseVec = (lat, lon) => {
      const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180
      return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) }
    }
    const rot = (v, ry, rx) => {
      const x = v.x * Math.cos(ry) + v.z * Math.sin(ry)
      const z0 = -v.x * Math.sin(ry) + v.z * Math.cos(ry)
      const y2 = v.y * Math.cos(rx) - z0 * Math.sin(rx)
      const z2 = v.y * Math.sin(rx) + z0 * Math.cos(rx)
      return { x, y: y2, z: z2 }
    }
    const slerp = (a, b, tt) => {
      let d = a.x * b.x + a.y * b.y + a.z * b.z
      d = Math.max(-1, Math.min(1, d))
      const o = Math.acos(d)
      if (o < 1e-4) return a
      const s = Math.sin(o), k0 = Math.sin((1 - tt) * o) / s, k1 = Math.sin(tt * o) / s
      return { x: a.x * k0 + b.x * k1, y: a.y * k0 + b.y * k1, z: a.z * k0 + b.z * k1 }
    }
    // gilded travel arcs tracing the path between places
    const placeBase = places.map((p) => baseVec(p.lat, p.lon))
    const arcs = []
    for (let i = 0; i < placeBase.length - 1; i++) {
      const seg = []
      for (let s = 0; s <= 44; s++) {
        const tt = s / 44
        const m = slerp(placeBase[i], placeBase[i + 1], tt)
        const lift = 1 + 0.17 * Math.sin(Math.PI * tt)
        seg.push({ x: m.x * lift, y: m.y * lift, z: m.z * lift })
      }
      arcs.push(seg)
    }

    let t = 0
    const draw = () => {
      if (!reduce) t += 0.0016
      const ry = t + pointer.current.x * 0.6
      const rx = -0.35 + pointer.current.y * 0.25
      ctx.clearRect(0, 0, w, h)

      // soft sphere shading
      const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 1.1)
      grad.addColorStop(0, 'rgba(255, 252, 244, 0.9)')
      grad.addColorStop(0.7, 'rgba(244, 240, 230, 0.55)')
      grad.addColorStop(1, 'rgba(232, 226, 212, 0)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2); ctx.fill()

      // outline ring (gilded)
      ctx.strokeStyle = 'rgba(160, 130, 70, 0.45)'
      ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()

      // meridians + parallels
      const line = (pts) => {
        ctx.beginPath()
        let started = false
        pts.forEach((p) => {
          const sx = cx + p.x * R
          const sy = cy - p.y * R
          const front = p.z >= -0.02
          if (front) {
            if (!started) { ctx.moveTo(sx, sy); started = true } else ctx.lineTo(sx, sy)
          } else { started = false }
        })
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(26, 26, 23, 0.13)'
      ctx.lineWidth = 1
      for (let lon = -180; lon < 180; lon += 30) {
        const pts = []
        for (let lat = -90; lat <= 90; lat += 4) pts.push(toXYZ(lat, lon, ry, rx))
        line(pts)
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts = []
        for (let lon = -180; lon <= 180; lon += 4) pts.push(toXYZ(lat, lon, ry, rx))
        line(pts)
      }

      // gilded travel arcs
      ctx.lineWidth = 1.4
      arcs.forEach((seg) => {
        ctx.beginPath()
        let started = false
        seg.forEach((bp) => {
          const p = rot(bp, ry, rx)
          const sx = cx + p.x * R, sy = cy - p.y * R
          if (p.z >= -0.02) {
            if (!started) { ctx.moveTo(sx, sy); started = true } else ctx.lineTo(sx, sy)
          } else started = false
        })
        ctx.strokeStyle = 'rgba(168, 130, 60, 0.6)'
        ctx.stroke()
      })
      // travelling glint along the path
      if (arcs.length) {
        const prog = (t * 0.05) % 1
        const ai = Math.min(arcs.length - 1, Math.floor(prog * arcs.length))
        const seg = arcs[ai]
        const local = prog * arcs.length - ai
        const bp = seg[Math.floor(local * (seg.length - 1))]
        const p = rot(bp, ry, rx)
        if (p.z >= -0.02) {
          const sx = cx + p.x * R, sy = cy - p.y * R
          ctx.fillStyle = 'rgba(206, 166, 86, 0.95)'
          ctx.beginPath(); ctx.arc(sx, sy, 2.8, 0, Math.PI * 2); ctx.fill()
        }
      }

      // place markers
      places.forEach((pl) => {
        const p = toXYZ(pl.lat, pl.lon, ry, rx)
        if (p.z < -0.05) return
        const sx = cx + p.x * R
        const sy = cy - p.y * R
        const alpha = 0.4 + (p.z + 1) * 0.3
        ctx.fillStyle = pl.home ? `rgba(180, 140, 60, ${alpha})` : `rgba(31, 64, 52, ${alpha})`
        ctx.beginPath(); ctx.arc(sx, sy, pl.home ? 5 : 3.5, 0, Math.PI * 2); ctx.fill()
        if (pl.home) {
          ctx.strokeStyle = `rgba(180, 140, 60, ${alpha * 0.5})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.arc(sx, sy, 9 + Math.sin(t * 60) * 1.5, 0, Math.PI * 2); ctx.stroke()
        }
        if (p.z > 0.2) {
          ctx.fillStyle = `rgba(26, 26, 23, ${alpha})`
          ctx.font = '600 12px Inter, sans-serif'
          ctx.fillText(pl.name, sx + 10, sy + 4)
        }
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      pointer.current.x = (e.clientX - r.left) / r.width - 0.5
      pointer.current.y = (e.clientY - r.top) / r.height - 0.5
    }
    canvas.addEventListener('pointermove', onMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas.removeEventListener('pointermove', onMove) }
  }, [])

  return <canvas ref={canvasRef} className="studio-globe" aria-label="Globe marking Milwaukee, Madison, Denver and Rome" />
}

function HomeStudio() {
  const [barHidden, setBarHidden] = useState(false)

  // Hide the top bar while the full-bleed Horizon Journey is pinned on screen,
  // so the cinematic statement piece plays uninterrupted.
  useEffect(() => {
    const onScroll = () => {
      const runway = document.querySelector('.horizon-scroll-runway')
      if (!runway) return
      const r = runway.getBoundingClientRect()
      setBarHidden(r.top <= 1 && r.bottom >= window.innerHeight - 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="studio">
      <header className={`studio-topbar ${barHidden ? 'is-hidden' : ''}`}>
        <div className="studio-topbar__inner">
          <Link to="/" className="studio-mark">Gunnar&nbsp;Neuman</Link>
          <nav className="studio-nav">
            <Link to="/about">About</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/client-work">Client Work</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="studio-hero">
        <div className="studio-hero__copy">
          <motion.span className="studio-status"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}>
            <i /> Available for AI, systems &amp; operations roles
          </motion.span>

          <motion.h1 className="studio-headline"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}>
            I build the path from idea to launch.
          </motion.h1>

          <motion.p className="studio-sub"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}>
            I&apos;m Gunnar — a builder and operator who wants to put AI to work inside a
            business: turning manual work into automations, assistants, and dashboards,
            and connecting the systems a team already runs on.
          </motion.p>

          <motion.div className="studio-hero__actions"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}>
            <Link to="/projects" className="studio-btn studio-btn--primary">View the work</Link>
            <Link to="/contact" className="studio-btn studio-btn--ghost">Get in touch &rarr;</Link>
          </motion.div>
        </div>

        <motion.div className="studio-hero__globe"
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.3 }}>
          <Globe />
          <span className="studio-hero__globe-cap">Midwest roots · building for everywhere</span>
        </motion.div>
      </section>

      {/* ─── PROOF STRIP ─── */}
      <section className="studio-proof">
        {resumeHighlights.map((h) => (
          <div className="studio-proof__item" key={h.label}>
            <span className="studio-proof__value">{h.value}</span>
            <span className="studio-proof__label">{h.label}</span>
          </div>
        ))}
      </section>

      {/* ─── APPROACH (tinted squeeze panel) ─── */}
      <section className="studio-band studio-approach">
        <SqueezeSection className="studio-panel studio-panel--tint">
          <div className="studio-panel__inner">
            <div className="studio-section__head">
              <span className="studio-kicker">Approach</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                I help ideas survive contact with customers, markets, and the build itself.
              </motion.h2>
            </div>
            <div className="studio-approach__grid">
              {approachPrinciples.map((item, i) => (
                <motion.div className="studio-card" key={item.number}
                  initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: i * 0.1 }}>
                  <span className="studio-card__num">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </SqueezeSection>
      </section>

      {/* ─── STATEMENT PIECE — HORIZON JOURNEY ─── */}
      <section className="studio-statement" aria-label="The build journey">
        <div className="studio-statement__intro">
          <span className="studio-kicker">The Build Journey</span>
          <h2>From first light to launch — keep scrolling.</h2>
        </div>
        <HorizonJourney />
      </section>

      {/* ─── EXPERIENCE (tinted squeeze panel) ─── */}
      <section className="studio-band">
        <SqueezeSection className="studio-panel studio-panel--tint">
          <div className="studio-panel__inner">
            <div className="studio-section__head">
              <span className="studio-kicker">Experience</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                Built across product, growth, and market execution.
              </motion.h2>
            </div>
            <div className="studio-exp__list">
              {resumeTimeline.map((item) => (
                <motion.article className="studio-exp" key={item.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease }}>
                  <div className="studio-exp__meta">
                    <span className="studio-exp__year">{item.year}</span>
                    <span className="studio-exp__loc">{item.location}</span>
                  </div>
                  <div className="studio-exp__body">
                    <h3>{item.title}</h3>
                    <span className="studio-exp__role">{item.role}</span>
                    <p>{item.desc}</p>
                    <div className="studio-tags">
                      {item.tags.map((tg) => <span key={tg}>{tg}</span>)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </SqueezeSection>
      </section>

      {/* ─── CTA (plain, parchment — the page resolves calm) ─── */}
      <section className="studio-section studio-cta">
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          {cta.heading}
        </motion.h2>
        <p>{cta.body}</p>
        <Link to="/contact" className="studio-btn studio-btn--lg studio-btn--primary">Get in touch &rarr;</Link>
      </section>

      <footer className="studio-footer">
        <span>© {new Date().getFullYear()} Gunnar Neuman</span>
        <div className="studio-footer__links">
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="mailto:gunnarneuman14@gmail.com">Email</a>
        </div>
      </footer>
    </div>
  )
}

export default HomeStudio
