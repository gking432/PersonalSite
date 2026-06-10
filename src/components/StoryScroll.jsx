import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './StoryScroll.css'

// Deterministic organic blob path generator (Catmull-Rom through perturbed points).
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function blobPath(seed, points = 7, R = 78) {
  const rng = mulberry32(seed)
  const v = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const rr = R * (0.74 + 0.34 * rng())
    v.push([100 + Math.cos(a) * rr, 100 + Math.sin(a) * rr])
  }
  let d = ''
  for (let i = 0; i < points; i++) {
    const p0 = v[(i - 1 + points) % points], p1 = v[i], p2 = v[(i + 1) % points], p3 = v[(i + 2) % points]
    if (i === 0) d += `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}

const BEATS = [
  { ch: 'The Beginning', headline: 'Small-town Wisconsin.', text: 'Born and raised where everyone knows your name and nobody locks their doors.', seed: 11 },
  { ch: 'Learning to Sell', headline: 'Marquette.', text: 'A marketing degree and a business mind. I learned to think strategically and make people believe in an idea.', seed: 29 },
  { ch: 'Inside the Machine', headline: 'Sub-Zero, Madison.', text: 'Inaugural candidate in their sales rotational program — I learned how enterprise actually works from the inside.', seed: 47 },
  { ch: 'Building From Nothing', headline: 'On my own.', text: 'I started my own consultancy. The first taste of making something from nothing — terrifying and addictive in equal measure.', seed: 63 },
  { ch: 'Everything Changed', headline: 'Then came AI.', text: 'The old model got disrupted overnight. I came home to regroup and figure out what was actually next.', seed: 88 },
  { ch: 'The Lever', headline: 'Now.', text: 'In a world where tools make everyone fast, judgment becomes the real lever. That’s what I build around.', seed: 101 },
]

// Per-beat blob colors for each theme [centerStop, edgeStop].
const COLORS = {
  dark: [
    ['#6fe0ad', '#1f8a5f'], ['#f2cf7a', '#c79232'], ['#7fd0c2', '#2f8f86'],
    ['#f0a878', '#c45f2f'], ['#a9c98a', '#5f7d42'], ['#ffe6a8', '#d8a24a'],
  ],
  cream: [
    ['#4f8c70', '#1f4034'], ['#d8b46a', '#a87f2c'], ['#6f9a8a', '#3a5a4c'],
    ['#d3996a', '#a85f30'], ['#9aab7a', '#5f7044'], ['#caa24a', '#8a6a1f'],
  ],
}

function Beat({ progress, index, total, beat, theme }) {
  const seg = 1 / total
  const c = (index + 0.5) * seg
  const w = seg * 0.5
  const opacity = useTransform(progress, [c - w, c - w * 0.58, c + w * 0.55, c + w], [0, 1, 1, 0])
  const blobScale = useTransform(progress, [c - w, c - w * 0.5, c - w * 0.18, c + w * 0.3, c + w], [0.15, 1.06, 1, 1, 1.45])
  const blobRot = useTransform(progress, [c - w, c + w], [-14, 14])
  const textY = useTransform(progress, [c - w * 0.72, c - w * 0.2], [34, 0])
  const textOpacity = useTransform(progress, [c - w * 0.7, c - w * 0.3, c + w * 0.45, c + w * 0.85], [0, 1, 1, 0])
  const d = blobPath(beat.seed)
  const [c0, c1] = COLORS[theme][index % COLORS[theme].length]
  const gid = `ss-${theme}-${index}`

  return (
    <motion.div className="ss__beat" style={{ opacity }}>
      <motion.div className="ss__blob" style={{ scale: blobScale, rotate: blobRot }}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <radialGradient id={gid} cx="38%" cy="34%" r="72%">
              <stop offset="0%" stopColor={c0} />
              <stop offset="100%" stopColor={c1} />
            </radialGradient>
          </defs>
          <path d={d} fill={`url(#${gid})`} />
        </svg>
      </motion.div>
      <motion.div className="ss__content" style={{ y: textY, opacity: textOpacity }}>
        <span className="ss__num">{String(index + 1).padStart(2, '0')}</span>
        <span className="ss__chapter">{beat.ch}</span>
        <h3 className="ss__headline">{beat.headline}</h3>
        <p className="ss__text">{beat.text}</p>
      </motion.div>
    </motion.div>
  )
}

export default function StoryScroll({ theme = 'cream' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const total = BEATS.length

  return (
    <div className={`ss ss--${theme}`} ref={ref} style={{ height: `${total * 85 + 40}vh` }}>
      <div className="ss__stage">
        {BEATS.map((beat, i) => (
          <Beat key={i} progress={scrollYProgress} index={i} total={total} beat={beat} theme={theme} />
        ))}
      </div>
    </div>
  )
}
