import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { identity, proofItems } from '../data/homeContent'
import VariantSections from './VariantSections'
import VariantSwitcher from './VariantSwitcher'
import './variants.css'
import './HomeCinematic.css'

const ease = [0.22, 1, 0.36, 1]

// Living hearth: flickering firelight + embers rising and drifting toward the cursor.
function HearthCanvas() {
  const canvasRef = useRef(null)
  const pointer = useRef({ x: 0.5, y: 0.7, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const embers = []
    const spawn = () => {
      const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.22
      embers.push({
        x: cx,
        y: h * 0.92 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.5 + Math.random() * 1.1),
        life: 0,
        max: 120 + Math.random() * 160,
        size: 0.8 + Math.random() * 2.2,
        hue: 20 + Math.random() * 24
      })
    }

    let t = 0
    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)

      // Flickering hearth glow near the bottom center
      const flicker = 0.82 + Math.sin(t * 7.3) * 0.05 + Math.sin(t * 13.1) * 0.04 + Math.random() * 0.04
      const gx = w * 0.5
      const gy = h * 0.96
      const radius = Math.min(w, h) * (0.95 + Math.sin(t * 2.1) * 0.03)
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius)
      glow.addColorStop(0, `rgba(255, 150, 60, ${0.42 * flicker})`)
      glow.addColorStop(0.25, `rgba(220, 90, 30, ${0.22 * flicker})`)
      glow.addColorStop(0.55, 'rgba(120, 40, 20, 0.08)')
      glow.addColorStop(1, 'rgba(10, 8, 7, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      // Secondary cool light (winter through a window, upper corner)
      const cool = ctx.createRadialGradient(w * 0.86, h * 0.1, 0, w * 0.86, h * 0.1, Math.min(w, h) * 0.6)
      cool.addColorStop(0, 'rgba(150, 180, 200, 0.07)')
      cool.addColorStop(1, 'rgba(150, 180, 200, 0)')
      ctx.fillStyle = cool
      ctx.fillRect(0, 0, w, h)

      if (!reduce) {
        if (embers.length < 150) { spawn(); spawn() }
        const px = pointer.current.x * w
        const py = pointer.current.y * h
        ctx.globalCompositeOperation = 'lighter'
        for (let i = embers.length - 1; i >= 0; i--) {
          const e = embers[i]
          e.life += 1
          // gentle drift + attraction toward pointer when active
          if (pointer.current.active) {
            const dx = px - e.x
            const dy = py - e.y
            const d2 = dx * dx + dy * dy
            const f = 1400 / (d2 + 4000)
            e.vx += (dx > 0 ? 1 : -1) * f * 0.02
            e.vy += (dy > 0 ? 1 : -1) * f * 0.02
          }
          e.vx += Math.sin(t * 2 + e.y * 0.01) * 0.012
          e.x += e.vx
          e.y += e.vy
          e.vy *= 0.995
          const p = e.life / e.max
          if (p >= 1 || e.y < -20) { embers.splice(i, 1); continue }
          const alpha = Math.sin(p * Math.PI) * 0.9
          ctx.fillStyle = `hsla(${e.hue}, 95%, ${58 + p * 12}%, ${alpha})`
          ctx.beginPath()
          ctx.arc(e.x, e.y, e.size * (1 - p * 0.4), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (ev) => {
      const r = canvas.getBoundingClientRect()
      pointer.current = {
        x: (ev.clientX - r.left) / r.width,
        y: (ev.clientY - r.top) / r.height,
        active: true
      }
    }
    const onLeave = () => { pointer.current.active = false }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="hearth-canvas" aria-hidden="true" />
}

function HomeCinematic() {
  return (
    <div className="variant v-cinematic">
      <VariantSwitcher />

      <section className="cin-hero">
        <HearthCanvas />
        <div className="cin-hero__vignette" aria-hidden="true" />

        <div className="cin-hero__content">
          <motion.span
            className="cin-hero__eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
          >
            {identity.eyebrow.join('  ·  ')}
          </motion.span>

          <motion.h1
            className="cin-hero__name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
          >
            {identity.name}
          </motion.h1>

          <motion.p
            className="cin-hero__statement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.55 }}
          >
            {identity.statement}
          </motion.p>

          <motion.div
            className="cin-hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.75 }}
          >
            <Link to="/projects" className="v-btn v-btn-primary">
              View the work <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link to="/contact" className="v-btn v-btn-ghost">Get in touch</Link>
          </motion.div>

          <motion.div
            className="cin-hero__proof"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease, delay: 1 }}
          >
            {proofItems.map((p) => (
              <div className="cin-hero__proof-item" key={p.key}>
                <span>{p.key}</span>
                {p.value}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="cin-hero__hint" aria-hidden="true">Move your cursor to stoke the fire</div>
      </section>

      <VariantSections />
    </div>
  )
}

export default HomeCinematic
