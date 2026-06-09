import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  identity,
  approachPrinciples,
  resumeTimeline,
  cta
} from '../data/homeContent'
import './HomeOpus.css'

const ease = [0.22, 1, 0.36, 1]
const romans = ['I', 'II', 'III', 'IV', 'V', 'VI']

// ── Golden-hour Northwoods lake: receding pines, still water, low sun,
//    drifting gold light-motes. Ambient + gentle cursor parallax. ──
function VespersCanvas() {
  const canvasRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, w, h, ridges = []

    const buildRidges = () => {
      const make = (baseY, count, amp, seed) => {
        const pts = []
        for (let i = 0; i <= count; i++) {
          const n =
            Math.sin(i * 0.7 + seed) * 0.5 +
            Math.sin(i * 1.9 + seed * 2) * 0.3 +
            Math.sin(i * 0.31 + seed) * 0.2
          pts.push({ x: (i / count) * w, h: amp * (0.55 + (n + 1) * 0.5) })
        }
        return { baseY, pts }
      }
      ridges = [
        make(h * 0.6, 14, h * 0.05, 1.3),
        make(h * 0.625, 18, h * 0.09, 4.1),
        make(h * 0.655, 22, h * 0.15, 7.7)
      ]
    }

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildRidges()
    }
    resize(); window.addEventListener('resize', resize)

    const motes = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 1.8,
      vy: -(0.02 + Math.random() * 0.06),
      drift: Math.random() * 6,
      a: 0.15 + Math.random() * 0.5
    }))

    let t = 0
    const draw = () => {
      t += 0.0045
      const px = pointer.current.x, py = pointer.current.y
      const horizon = h * 0.66
      const sunX = w * (0.5 + px * 0.02)
      const sunY = horizon - h * 0.02

      // ── Sky: oxblood → ember → gold at the horizon ──
      const sky = ctx.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, '#240a12')
      sky.addColorStop(0.4, '#5e1d1c')
      sky.addColorStop(0.72, '#b4532a')
      sky.addColorStop(0.9, '#e89a45')
      sky.addColorStop(1, '#f6cf7e')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, horizon + 2)

      // ── Sun glow + disc ──
      const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, h * 0.5)
      glow.addColorStop(0, 'rgba(255, 236, 180, 0.9)')
      glow.addColorStop(0.12, 'rgba(255, 214, 130, 0.55)')
      glow.addColorStop(0.4, 'rgba(232, 150, 70, 0.18)')
      glow.addColorStop(1, 'rgba(232, 150, 70, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, horizon + h * 0.1)
      ctx.fillStyle = 'rgba(255, 244, 214, 0.95)'
      ctx.beginPath(); ctx.arc(sunX, sunY - h * 0.06, h * 0.05, 0, Math.PI * 2); ctx.fill()

      // ── Mist bands near the horizon ──
      for (let i = 0; i < 4; i++) {
        const my = horizon - h * 0.14 + i * h * 0.035 + Math.sin(t * 2 + i) * 4
        const mg = ctx.createLinearGradient(0, my - 12, 0, my + 12)
        mg.addColorStop(0, 'rgba(246, 207, 126, 0)')
        mg.addColorStop(0.5, `rgba(248, 220, 170, ${0.06 + i * 0.015})`)
        mg.addColorStop(1, 'rgba(246, 207, 126, 0)')
        ctx.fillStyle = mg
        ctx.fillRect(0, my - 12, w, 24)
      }

      // ── Receding pine ridgelines ──
      const shades = ['#3a2418', '#241a16', '#140f10']
      ridges.forEach((ridge, ri) => {
        const off = px * (6 + ri * 8)
        ctx.fillStyle = shades[ri]
        ctx.beginPath()
        ctx.moveTo(-20, ridge.baseY)
        ridge.pts.forEach((p) => {
          // little triangular pines along the ridge
          ctx.lineTo(p.x + off - 8, ridge.baseY - p.h * 0.7)
          ctx.lineTo(p.x + off, ridge.baseY - p.h)
          ctx.lineTo(p.x + off + 8, ridge.baseY - p.h * 0.7)
        })
        ctx.lineTo(w + 20, ridge.baseY)
        ctx.lineTo(w + 20, horizon + 2)
        ctx.lineTo(-20, horizon + 2)
        ctx.closePath()
        ctx.fill()
      })

      // ── Lake: mirrored sky + sun column + shimmer ──
      const water = ctx.createLinearGradient(0, horizon, 0, h)
      water.addColorStop(0, '#caa15a')
      water.addColorStop(0.18, '#9a5a2f')
      water.addColorStop(0.5, '#3f1c1c')
      water.addColorStop(1, '#1a0c10')
      ctx.fillStyle = water
      ctx.fillRect(0, horizon, w, h - horizon)

      // sun reflection column
      const col = ctx.createLinearGradient(0, horizon, 0, h)
      col.addColorStop(0, 'rgba(255, 232, 170, 0.5)')
      col.addColorStop(1, 'rgba(255, 232, 170, 0)')
      ctx.fillStyle = col
      const colW = h * 0.06
      ctx.fillRect(sunX - colW, horizon, colW * 2, h - horizon)

      // shimmer lines
      ctx.strokeStyle = 'rgba(255, 236, 190, 0.10)'
      ctx.lineWidth = 1
      for (let i = 0; i < 26; i++) {
        const ly = horizon + (i / 26) * (h - horizon)
        const amp = 6 + i * 1.4
        const wob = Math.sin(t * 6 + i * 0.6) * amp
        ctx.globalAlpha = 0.6 - (i / 26) * 0.5
        ctx.beginPath()
        ctx.moveTo(sunX - colW - 20 + wob, ly)
        ctx.lineTo(sunX + colW + 20 + wob, ly)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // ── Gold light-motes drifting up through the air ──
      if (!reduce) {
        ctx.globalCompositeOperation = 'lighter'
        for (const m of motes) {
          m.y += m.vy * 0.01
          if (m.y < -0.02) { m.y = 1.02; m.x = Math.random() }
          const mxp = (m.x + Math.sin(t * 3 + m.drift) * 0.01 + px * 0.01) * w
          const myp = m.y * horizon
          const tw = 0.6 + Math.sin(t * 8 + m.drift) * 0.4
          ctx.fillStyle = `rgba(255, 224, 150, ${m.a * tw})`
          ctx.beginPath(); ctx.arc(mxp, myp, m.r, 0, Math.PI * 2); ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      // ── Vignette for depth & focus ──
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.2, w * 0.5, h * 0.5, h * 0.85)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(20, 6, 10, 0.72)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

      raf = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      pointer.current.x = (e.clientX - r.left) / r.width - 0.5
      pointer.current.y = (e.clientY - r.top) / r.height - 0.5
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="opus-canvas" aria-hidden="true" />
}

function HomeOpus() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const archY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div className="opus">
      {/* slim classical top bar */}
      <header className="opus-topbar">
        <Link to="/" className="opus-mark">GN</Link>
        <nav className="opus-nav">
          <Link to="/projects">Work</Link>
          <Link to="/writing">Writing</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      {/* ═══════ HERO — THE OVERTURE ═══════ */}
      <section className="opus-hero" ref={heroRef}>
        <motion.div className="opus-hero__scene" style={{ scale: sceneScale }}>
          <VespersCanvas />
        </motion.div>

        <motion.div className="opus-hero__frame" style={{ y: archY, opacity: heroFade }}>
          {/* Roman arch */}
          <svg className="opus-arch" viewBox="0 0 600 720" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
            <path className="opus-arch__line"
              d="M40 720 L40 300 A260 260 0 0 1 560 300 L560 720" />
            <path className="opus-arch__line opus-arch__line--inner"
              d="M70 720 L70 305 A230 230 0 0 1 530 305 L530 720" />
            <circle className="opus-arch__key" cx="300" cy="64" r="5" />
          </svg>

          <div className="opus-hero__copy">
            <motion.span className="opus-eyebrow"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.3 }}>
              {identity.eyebrow.join('  ·  ')}
            </motion.span>

            <motion.h1 className="opus-name"
              initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease, delay: 0.45 }}>
              <span className="opus-name__first">Gunnar</span>
              <span className="opus-name__last">Neuman</span>
            </motion.h1>

            <motion.p className="opus-statement"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.7 }}>
              {identity.statement}
            </motion.p>

            <motion.div className="opus-hero__actions"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.9 }}>
              <Link to="/projects" className="opus-btn opus-btn--gold">Enter the work</Link>
              <Link to="/contact" className="opus-btn opus-btn--ghost">Get in touch</Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="opus-hero__scroll" aria-hidden="true">
          <span>Scroll</span><i />
        </div>
      </section>

      {/* ═══════ CHAPTER I — THE TENETS ═══════ */}
      <section className="opus-chapter opus-tenets">
        <div className="opus-wrap">
          <div className="opus-chapter__head">
            <span className="opus-numeral">I</span>
            <div>
              <span className="opus-kicker">The Tenets</span>
              <motion.h2 className="opus-chapter__title"
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.9, ease }}>
                I help ideas survive contact with customers, markets, and the build itself.
              </motion.h2>
            </div>
          </div>

          <div className="opus-tenets__grid">
            {approachPrinciples.map((item, i) => (
              <motion.article className="opus-tenet" key={item.number}
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: i * 0.12 }}>
                <span className="opus-tenet__num">{romans[i]}</span>
                <hr className="opus-hr" />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CHAPTER II — THE RECORD ═══════ */}
      <section className="opus-chapter opus-record">
        <div className="opus-wrap">
          <div className="opus-chapter__head">
            <span className="opus-numeral">II</span>
            <div>
              <span className="opus-kicker">The Record</span>
              <h2 className="opus-chapter__title">Built across product, growth, and market execution.</h2>
            </div>
          </div>

          <div className="opus-record__list">
            {resumeTimeline.map((item, i) => (
              <motion.article className="opus-entry" key={item.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.85, ease }}>
                <div className="opus-entry__meta">
                  <span className="opus-entry__year">{item.year}</span>
                  <span className="opus-entry__loc">{item.location}</span>
                </div>
                <div className="opus-entry__body">
                  <h3>{item.title}</h3>
                  <span className="opus-entry__role">{item.role}</span>
                  <p>{item.desc}</p>
                  <div className="opus-tags">
                    {item.tags.map((tg) => <span key={tg}>{tg}</span>)}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ THE INVITATION ═══════ */}
      <section className="opus-chapter opus-invite">
        <div className="opus-wrap">
          <span className="opus-numeral opus-numeral--center">III</span>
          <motion.h2 className="opus-invite__title"
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9, ease }}>
            {cta.heading}
          </motion.h2>
          <p className="opus-invite__body">{cta.body}</p>
          <Link to="/contact" className="opus-btn opus-btn--gold opus-btn--lg">Begin a conversation</Link>
        </div>
      </section>
    </div>
  )
}

export default HomeOpus
