import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import './StoryThread.css'

// Story beats — each drops a node along the thread and never disappears.
const BEATS = [
  { ch: 'The Beginning', headline: 'Small-town Wisconsin.', text: 'Born and raised where everyone knows your name and nobody locks their doors.' },
  { ch: 'Learning to Sell', headline: 'Marquette.', text: 'A marketing degree and a business mind — I learned to think strategically and make people believe in an idea.' },
  { ch: 'Inside the Machine', headline: 'Sub-Zero, Madison.', text: 'Inaugural candidate in their sales rotational program. I learned how enterprise actually works from the inside.' },
  { ch: 'Building From Nothing', headline: 'On my own.', text: 'I started my own consultancy — the first taste of making something from nothing. Terrifying and addictive in equal measure.' },
  { ch: 'Everything Changed', headline: 'Then came AI.', text: 'The old model was disrupted overnight. I came home to regroup and figure out what was actually next.' },
  { ch: 'The Lever', headline: 'Now.', text: 'In a world where tools make everyone fast, judgment becomes the real lever. That’s what I build around.' },
]

// Normalised node positions — a rising weave from lower-left to upper-right.
const NODES = [
  { x: 0.16, y: 0.60 },
  { x: 0.32, y: 0.34 },
  { x: 0.46, y: 0.54 },
  { x: 0.60, y: 0.28 },
  { x: 0.74, y: 0.48 },
  { x: 0.86, y: 0.24 },
]
const NODE_COLORS = [
  [108, 196, 255], // cool dawn blue
  [150, 180, 255], // periwinkle
  [185, 160, 245], // violet
  [240, 200, 120], // gold
  [240, 160, 110], // amber
  [120, 215, 160], // green — home
]
const LEAD = 0.06, SPAN = 0.86
const N = NODES.length

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => t * t * (3 - 2 * t)

// Catmull-Rom sample between p1..p2 with neighbours p0,p3.
function cr(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  }
}
const SAMPLES_PER_SEG = 64
const samples = (() => {
  const pts = []
  for (let i = 0; i < N - 1; i++) {
    const p0 = NODES[i - 1] || NODES[i]
    const p1 = NODES[i], p2 = NODES[i + 1]
    const p3 = NODES[i + 2] || NODES[i + 1]
    for (let s = 0; s < SAMPLES_PER_SEG; s++) pts.push(cr(p0, p1, p2, p3, s / SAMPLES_PER_SEG))
  }
  pts.push(NODES[N - 1])
  return pts
})()

function ThreadBeat({ progress, index }) {
  const c = LEAD + (index / (N - 1)) * SPAN
  // Half the gap between beats — so each beat hits zero exactly where the next
  // begins, and no two texts are ever visible at once.
  const half = (SPAN / (N - 1)) * 0.5
  const isLast = index === N - 1
  const opacity = useTransform(
    progress,
    [c - half, c - half * 0.6, c + half * 0.6, isLast ? 1.2 : c + half],
    [0, 1, 1, isLast ? 1 : 0]
  )
  const y = useTransform(progress, [c - half, c - half * 0.5], [24, 0])
  const beat = BEATS[index]
  return (
    <motion.div className="st__beat" style={{ opacity, y }}>
      <span className="st__num">{String(index + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
      <span className="st__chapter">{beat.ch}</span>
      <h3 className="st__headline">{beat.headline}</h3>
      <p className="st__text">{beat.text}</p>
    </motion.div>
  )
}

export default function StoryThread() {
  const ref = useRef(null)
  const canvasRef = useRef(null)
  const progressRef = useRef(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => { progressRef.current = v })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1, raf, time = 0

    // ambient drifting motes
    const motes = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.4, ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.5,
    }))

    function resize() {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const lerp = (a, b, t) => a + (b - a) * t
    const mixArr = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]
    const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

    // evolving background stops [top, bottom] from night-blue -> deep green
    const BG = [
      [[8, 12, 26], [16, 20, 40]],
      [[14, 14, 34], [26, 22, 46]],
      [[20, 16, 34], [34, 26, 44]],
      [[24, 20, 28], [36, 30, 32]],
      [[12, 22, 22], [20, 34, 28]],
      [[8, 20, 16], [14, 30, 22]],
    ]
    const bgAt = (p, idx) => {
      const f = clamp(p) * (BG.length - 1)
      const i = Math.min(BG.length - 2, Math.floor(f))
      return mixArr(BG[i][idx], BG[i + 1][idx], f - i)
    }

    function draw() {
      time += 0.016
      const p = progressRef.current
      const pp = clamp((p - LEAD) / SPAN)

      // ── background ──
      const top = bgAt(p, 0), bot = bgAt(p, 1)
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, rgba(top, 1)); g.addColorStop(1, rgba(bot, 1))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      // vignette
      const vg = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.75)
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h)

      // ── motes ──
      for (const m of motes) {
        const mx = (m.x + (reduce ? 0 : time * 0.004 * m.sp)) % 1
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * m.sp + m.ph))
        ctx.fillStyle = rgba([220, 225, 235], 0.06 + tw * 0.12)
        ctx.beginPath(); ctx.arc(mx * w, m.y * h, m.r, 0, 6.283); ctx.fill()
      }

      // ── thread drawn up to pp ──
      const head = pp * (samples.length - 1)
      const lastIdx = Math.floor(head)
      const frac = head - lastIdx
      const pts = []
      for (let i = 0; i <= lastIdx; i++) pts.push({ x: samples[i].x * w, y: samples[i].y * h })
      if (lastIdx < samples.length - 1 && frac > 0) {
        const a = samples[lastIdx], b = samples[lastIdx + 1]
        pts.push({ x: lerp(a.x, b.x, frac) * w, y: lerp(a.y, b.y, frac) * h })
      }
      if (pts.length > 1) {
        const stroke = (lw, color, a, blur) => {
          ctx.save()
          ctx.lineJoin = 'round'; ctx.lineCap = 'round'
          ctx.lineWidth = lw; ctx.strokeStyle = rgba(color, a)
          ctx.shadowColor = rgba(color, a); ctx.shadowBlur = blur
          ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y)
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
          ctx.stroke(); ctx.restore()
        }
        stroke(13, [255, 225, 170], 0.10, 22)  // soft glow
        stroke(3.2, [255, 244, 220], 0.85, 8)   // bright core
      }

      // ── nodes (bloom when the thread reaches them, then stay) ──
      NODES.forEach((nd, i) => {
        const t_i = i / (N - 1)
        const bloom = ease(clamp((pp - t_i) / 0.05))
        if (bloom <= 0.001) return
        const x = nd.x * w, y = nd.y * h
        const col = NODE_COLORS[i]
        const pulse = reduce ? 1 : 1 + 0.06 * Math.sin(time * 1.6 + i)
        const baseR = Math.min(w, h) * 0.052 * bloom * pulse
        // outer glow
        const og = ctx.createRadialGradient(x, y, 0, x, y, baseR * 2.6)
        og.addColorStop(0, rgba(col, 0.5 * bloom))
        og.addColorStop(0.4, rgba(col, 0.18 * bloom))
        og.addColorStop(1, rgba(col, 0))
        ctx.fillStyle = og
        ctx.beginPath(); ctx.arc(x, y, baseR * 2.6, 0, 6.283); ctx.fill()
        // core orb
        const cg = ctx.createRadialGradient(x - baseR * 0.3, y - baseR * 0.3, baseR * 0.1, x, y, baseR)
        cg.addColorStop(0, rgba(mixArr(col, [255, 255, 255], 0.5), bloom))
        cg.addColorStop(1, rgba(col, 0.85 * bloom))
        ctx.fillStyle = cg
        ctx.beginPath(); ctx.arc(x, y, baseR, 0, 6.283); ctx.fill()
      })

      // ── travelling head glow (the 'pen') ──
      if (pp > 0.002 && pp < 0.999 && pts.length) {
        const hp = pts[pts.length - 1]
        const hg = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 26)
        hg.addColorStop(0, 'rgba(255,248,230,0.9)')
        hg.addColorStop(1, 'rgba(255,248,230,0)')
        ctx.fillStyle = hg
        ctx.beginPath(); ctx.arc(hp.x, hp.y, 26, 0, 6.283); ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section className="st" ref={ref} style={{ height: `${N * 95 + 60}vh` }} aria-label="My story">
      <div className="st__stage">
        <canvas ref={canvasRef} className="st__canvas" aria-hidden="true" />
        <div className="st__header">
          <p className="st__eyebrow">My Story</p>
          <p className="st__threadline">One thread, pulled all the way through.</p>
        </div>
        <div className="st__beats">
          {BEATS.map((_, i) => <ThreadBeat key={i} progress={scrollYProgress} index={i} />)}
        </div>
      </div>
    </section>
  )
}
