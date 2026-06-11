import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import './CinematicStory.css'

// ── Story as film-title beats ──
const BEATS = [
  { num: 'I',   line: 'Everyone knew your name.',            sub: 'Cambridge, Wisconsin — where it started.' },
  { num: 'II',  line: 'I started inside the machine.',       sub: 'Sub-Zero. Learning how premium products really move.' },
  { num: 'III', line: 'Then I bet on myself.',               sub: 'Freelance work that slowly became an agency.' },
  { num: 'IV',  line: 'The best part was the building.',      sub: 'Never the handoff — the messy middle.' },
  { num: 'V',   line: 'Then the tools changed.',             sub: 'The economics of making things collapsed.' },
  { num: 'VI',  line: 'Judgment is the real lever.',         sub: 'In a world where everyone is fast.' },
  { num: 'VII', line: 'So I went deeper — and built.',       sub: 'Terralis. MoveMint. This site, as a living product.' },
  { num: '',    line: 'Bring me a problem worth building.',  sub: '', close: true },
]
const N = BEATS.length

// ── Warm ambient light field on espresso — drifting "aurora" ──
function useAtmosphere(canvasRef, reduced) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, w, h
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const blobs = [
      { c: [184, 150, 84],  x: 0.28, y: 0.30, rx: 0.10, ry: 0.07, sx: 0.55, ph: 0.0 },
      { c: [176, 108, 52],  x: 0.70, y: 0.38, rx: 0.09, ry: 0.06, sx: 0.40, ph: 1.7 },
      { c: [150, 74,  52],  x: 0.55, y: 0.68, rx: 0.07, ry: 0.05, sx: 0.62, ph: 3.1 },
      { c: [46,  78,  58],  x: 0.20, y: 0.72, rx: 0.10, ry: 0.06, sx: 0.33, ph: 4.4 },
      { c: [86,  60,  80],  x: 0.82, y: 0.74, rx: 0.08, ry: 0.05, sx: 0.48, ph: 2.2 },
      { c: [196, 168, 110], x: 0.46, y: 0.18, rx: 0.11, ry: 0.06, sx: 0.28, ph: 5.5 },
    ]

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (t) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#191510'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const time = t * 0.00007
      for (const b of blobs) {
        const cx = (b.x + Math.sin(time * b.sx * 6 + b.ph) * 0.05) * w
        const cy = (b.y + Math.cos(time * b.sx * 5 + b.ph * 1.3) * 0.05) * h
        const r = Math.max(w, h) * (b.rx + Math.sin(time * 4 + b.ph) * 0.012) * 3.4
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        const [cr, cg, cb] = b.c
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0.42)`)
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.12)`)
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      }
    }

    if (reduced) { draw(8000); return () => window.removeEventListener('resize', resize) }
    const loop = (t) => { draw(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [canvasRef, reduced])
}

function Beat({ progress, i, beat }) {
  const c = (i + 0.5) / N
  const w = 1 / N
  const inOut = beat.close
    ? [c - w * 0.6, c - w * 0.2, 1.1, 1.2]
    : [c - w * 0.62, c - w * 0.22, c + w * 0.22, c + w * 0.62]
  const opacity = useTransform(progress, inOut, beat.close ? [0, 1, 1, 1] : [0, 1, 1, 0])
  const y = useTransform(progress, inOut, beat.close ? [26, 0, 0, 0] : [26, 0, 0, -26])
  return (
    <motion.div className={`cine__beat${beat.close ? ' cine__beat--close' : ''}`} style={{ opacity, y }}>
      {beat.num && (
        <p className="cine__num"><span>{beat.num}</span></p>
      )}
      <h3 className="cine__line">{beat.line}</h3>
      {beat.sub && <p className="cine__sub">{beat.sub}</p>}
    </motion.div>
  )
}

export default function CinematicStory() {
  const ref = useRef(null)
  const canvasRef = useRef(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  useAtmosphere(canvasRef, reduced)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Cream wash: fade in from cream at the open, dissolve back to cream at the close
  const cream = useTransform(scrollYProgress, [0, 0.06, 0.84, 0.95], [1, 0, 0, 1])
  // Slow cinematic zoom on the field
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18])

  return (
    <section className="cine" ref={ref} style={{ height: `${N * 90}vh` }} id="my-story" aria-label="My story">
      <div className="cine__stage">
        <motion.canvas ref={canvasRef} className="cine__canvas" style={{ scale }} />
        <div className="cine__grain" />
        <div className="cine__vignette" />
        <motion.div className="cine__cream" style={{ opacity: cream }} />

        <p className="cine__eyebrow">My Story</p>

        <div className="cine__beats">
          {BEATS.map((b, i) => (
            <Beat key={i} progress={scrollYProgress} i={i} beat={b} />
          ))}
        </div>
      </div>
    </section>
  )
}
