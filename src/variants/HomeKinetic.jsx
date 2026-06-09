import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { identity, proofItems } from '../data/homeContent'
import VariantSections from './VariantSections'
import VariantSwitcher from './VariantSwitcher'
import './variants.css'
import './HomeKinetic.css'

const ease = [0.22, 1, 0.36, 1]

// Sparse rising spark field behind the giant type.
function SparkField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, w, h
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize(); window.addEventListener('resize', resize)
    const sparks = Array.from({ length: 90 }, () => ({
      x: Math.random() * (w || window.innerWidth),
      y: Math.random() * (h || window.innerHeight),
      vy: -(0.2 + Math.random() * 0.8),
      r: 0.5 + Math.random() * 1.8,
      a: 0.2 + Math.random() * 0.6,
      hue: 18 + Math.random() * 26,
      tw: Math.random() * 6
    }))
    let t = 0
    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const s of sparks) {
        if (!reduce) {
          s.y += s.vy
          s.x += Math.sin(t + s.tw) * 0.25
          if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w }
        }
        const tw = 0.6 + Math.sin(t * 2 + s.tw) * 0.4
        ctx.fillStyle = `hsla(${s.hue}, 95%, 60%, ${s.a * tw})`
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="kin-sparks" aria-hidden="true" />
}

function HomeKinetic() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const nameY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const marquee = [...identity.roles, ...identity.roles]

  return (
    <div className="variant v-kinetic">
      <VariantSwitcher />

      <section className="kin-hero" ref={heroRef}>
        <SparkField />
        <div className="kin-hero__glow" aria-hidden="true" />

        <motion.div className="kin-hero__stack" style={{ y: nameY, scale: nameScale, opacity: fade }}>
          <motion.span
            className="kin-hero__eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {identity.eyebrow.join('  /  ')}
          </motion.span>

          <h1 className="kin-hero__name" aria-label={identity.name}>
            {['Gunnar', 'Neuman'].map((word, wi) => (
              <span className="kin-hero__word" key={word}>
                {word.split('').map((ch, ci) => (
                  <motion.span
                    className="kin-hero__char"
                    key={ci}
                    initial={{ opacity: 0, y: 120, rotate: wi ? 4 : -4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.25 + (wi * 6 + ci) * 0.04 }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            className="kin-hero__statement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.8 }}
          >
            {identity.statement}
          </motion.p>

          <motion.div
            className="kin-hero__actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 1 }}
          >
            <Link to="/projects" className="v-btn v-btn-primary">View the work <span aria-hidden="true">&rarr;</span></Link>
            <Link to="/contact" className="v-btn v-btn-ghost">Get in touch</Link>
          </motion.div>
        </motion.div>

        <div className="kin-marquee" aria-hidden="true">
          <div className="kin-marquee__track">
            {marquee.map((r, i) => (
              <span className="kin-marquee__item" key={i}>{r}<i>✦</i></span>
            ))}
          </div>
        </div>
      </section>

      <VariantSections />
    </div>
  )
}

export default HomeKinetic
