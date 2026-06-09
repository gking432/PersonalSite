import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { identity, proofItems } from '../data/homeContent'
import VariantSections from './VariantSections'
import VariantSwitcher from './VariantSwitcher'
import './variants.css'
import './HomeImmersive.css'

const ease = [0.22, 1, 0.36, 1]

// Winter night beyond the glass: moon, stars, pine treeline, live falling snow.
function WinterWindowCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, w, h
    let pines = []
    let stars = []

    const buildScene = () => {
      stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.55,
        r: Math.random() * 1.3,
        a: 0.2 + Math.random() * 0.7,
        tw: Math.random() * 6
      }))
      // two pine ridgelines
      const ridge = (baseY, count, jitter) => {
        const arr = []
        for (let i = 0; i <= count; i++) {
          arr.push({ x: (i / count) * w, h: 40 + Math.random() * jitter })
        }
        return { baseY, trees: arr }
      }
      pines = [ridge(h * 0.74, 26, 60), ridge(h * 0.8, 20, 110)]
    }

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildScene()
    }
    resize(); window.addEventListener('resize', resize)

    const flakes = Array.from({ length: 220 }, () => ({
      x: Math.random() * (w || window.innerWidth),
      y: Math.random() * (h || window.innerHeight),
      r: 0.6 + Math.random() * 2.6,
      vy: 0.3 + Math.random() * 1.1,
      drift: Math.random() * 6,
      o: 0.3 + Math.random() * 0.6
    }))

    let t = 0
    const draw = () => {
      t += 0.016
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#0a1018')
      sky.addColorStop(0.45, '#121b25')
      sky.addColorStop(0.75, '#1b2230')
      sky.addColorStop(1, '#232026')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      // moon
      const mx = w * 0.74, my = h * 0.26
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, 150)
      halo.addColorStop(0, 'rgba(225, 235, 245, 0.5)')
      halo.addColorStop(0.2, 'rgba(200, 215, 230, 0.18)')
      halo.addColorStop(1, 'rgba(200, 215, 230, 0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#eef3f8'
      ctx.beginPath(); ctx.arc(mx, my, 46, 0, Math.PI * 2); ctx.fill()

      // stars
      for (const s of stars) {
        const tw = 0.6 + Math.sin(t * 2 + s.tw) * 0.4
        ctx.fillStyle = `rgba(220, 232, 245, ${s.a * tw})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
      }

      // pine ridgelines
      pines.forEach((ridge, ri) => {
        ctx.fillStyle = ri === 0 ? '#10171a' : '#0a0f12'
        ctx.beginPath()
        ctx.moveTo(0, h)
        ridge.trees.forEach((tr) => {
          ctx.lineTo(tr.x - 10, ridge.baseY)
          ctx.lineTo(tr.x, ridge.baseY - tr.h)
          ctx.lineTo(tr.x + 10, ridge.baseY)
        })
        ctx.lineTo(w, h)
        ctx.closePath()
        ctx.fill()
      })

      // snow ground glow
      const ground = ctx.createLinearGradient(0, h * 0.78, 0, h)
      ground.addColorStop(0, 'rgba(40, 48, 60, 0)')
      ground.addColorStop(1, 'rgba(120, 135, 155, 0.22)')
      ctx.fillStyle = ground
      ctx.fillRect(0, h * 0.78, w, h * 0.22)

      // falling snow
      for (const f of flakes) {
        if (!reduce) {
          f.y += f.vy
          f.x += Math.sin(t + f.drift) * 0.5
          if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w }
        }
        ctx.fillStyle = `rgba(238, 244, 250, ${f.o})`
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill()
      }

      // warm firelight spilling from inside (bottom edge)
      const fire = ctx.createLinearGradient(0, h, 0, h * 0.7)
      fire.addColorStop(0, `rgba(255, 140, 60, ${0.22 + Math.sin(t * 6) * 0.03})`)
      fire.addColorStop(1, 'rgba(255, 140, 60, 0)')
      ctx.fillStyle = fire
      ctx.fillRect(0, h * 0.7, w, h * 0.3)

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="imm-canvas" aria-hidden="true" />
}

function HomeImmersive() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const sceneX = useTransform(sx, [-0.5, 0.5], [18, -18])
  const sceneY = useTransform(sy, [-0.5, 0.5], [12, -12])
  const frameX = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const frameY = useTransform(sy, [-0.5, 0.5], [-7, 7])

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  return (
    <div className="variant v-immersive">
      <VariantSwitcher />

      <section className="imm-hero" onPointerMove={onMove}>
        <motion.div className="imm-scene" style={{ x: sceneX, y: sceneY }}>
          <WinterWindowCanvas />
        </motion.div>

        {/* Window frame (wood mullions) + frost */}
        <motion.div className="imm-frame" style={{ x: frameX, y: frameY }} aria-hidden="true">
          <div className="imm-frame__mullion imm-frame__mullion--v" />
          <div className="imm-frame__mullion imm-frame__mullion--h" />
          <div className="imm-frame__frost" />
        </motion.div>

        <div className="imm-hero__content">
          <motion.span
            className="imm-hero__eyebrow"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
          >
            {identity.eyebrow.join('  ·  ')}
          </motion.span>
          <motion.h1
            className="imm-hero__name"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.42 }}
          >
            {identity.name}
          </motion.h1>
          <motion.p
            className="imm-hero__statement"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.62 }}
          >
            {identity.statement}
          </motion.p>
          <motion.div
            className="imm-hero__actions"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.8 }}
          >
            <Link to="/projects" className="v-btn v-btn-primary">View the work <span aria-hidden="true">&rarr;</span></Link>
            <Link to="/contact" className="v-btn v-btn-ghost">Get in touch</Link>
          </motion.div>
        </div>

        <div className="imm-hero__hint" aria-hidden="true">Move to look through the glass · snow is live</div>
      </section>

      <VariantSections />
    </div>
  )
}

export default HomeImmersive
