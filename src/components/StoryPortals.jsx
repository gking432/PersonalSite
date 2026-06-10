import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './StoryPortals.css'

// Each portal = a window into the same world at a different time of day,
// mapped to a chapter of the story.
const PORTALS = [
  { x: 17, y: 26, size: 27, scene: 'dawn',   num: '01', ch: 'The Beginning',        place: 'Cambridge, WI',   line: 'Small-town Wisconsin — where everyone knows your name.' },
  { x: 63, y: 18, size: 20, scene: 'morning', num: '02', ch: 'Learning to Sell',     place: 'Marquette',       line: 'I learned to think strategically and make people believe an idea.' },
  { x: 39, y: 52, size: 31, scene: 'midday',  num: '03', ch: 'Inside the Machine',    place: 'Sub-Zero, Madison', line: 'How enterprise actually works — learned from the inside.' },
  { x: 79, y: 50, size: 19, scene: 'golden',  num: '04', ch: 'Building From Nothing',  place: 'On my own',       line: 'My own consultancy — making something from nothing.' },
  { x: 23, y: 74, size: 22, scene: 'dusk',    num: '05', ch: 'Everything Changed',     place: 'Then came AI',    line: 'The old model disrupted overnight. I came home to regroup.' },
  { x: 67, y: 76, size: 25, scene: 'night',   num: '06', ch: 'The Lever',              place: 'Now',             line: 'Judgment becomes the real lever. That’s what I build around.' },
]
const N = PORTALS.length

function Portal({ progress, index, data }) {
  const start = 0.04 + (index / N) * 0.78
  const end = start + 0.12
  const scale = useTransform(progress, [start, (start + end) / 2, end], [0, 1.06, 1])
  const opacity = useTransform(progress, [start, start + 0.04], [0, 1])
  const labelOpacity = useTransform(progress, [end - 0.02, end + 0.03], [0, 1])

  return (
    <motion.div
      className="sp__portal"
      style={{
        left: `${data.x}%`, top: `${data.y}%`,
        width: `${data.size}vmin`, height: `${data.size}vmin`,
        scale, opacity,
        animationDelay: `${index * -1.7}s`,
      }}
    >
      <div className={`sp__scene sp__scene--${data.scene}`}>
        <span className="sp__sun" />
        <span className="sp__land" />
      </div>
      <span className="sp__ring" />
      <motion.div className="sp__label" style={{ opacity: labelOpacity }}>
        <span className="sp__num">{data.num}</span>
        <span className="sp__ch">{data.ch}</span>
        <span className="sp__place">{data.place}</span>
      </motion.div>
    </motion.div>
  )
}

export default function StoryPortals() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    <section className="sp" ref={ref} style={{ height: `${N * 78 + 50}vh` }} aria-label="My story">
      <div className="sp__stage">
        <div className="sp__head">
          <p className="sp__eyebrow">My Story</p>
          <h2 className="sp__title">One world, turning.</h2>
        </div>
        <div className="sp__field">
          {PORTALS.map((d, i) => (
            <Portal key={i} progress={scrollYProgress} index={i} data={d} />
          ))}
        </div>
        <div className="sp__caption">
          {PORTALS.map((d, i) => {
            const c = 0.04 + (i / N) * 0.78 + 0.06
            const half = 0.78 / N * 0.5
            return <CaptionLine key={i} progress={scrollYProgress} c={c} half={half} line={d.line} last={i === N - 1} />
          })}
        </div>
      </div>
    </section>
  )
}

function CaptionLine({ progress, c, half, line, last }) {
  const opacity = useTransform(progress, [c - half, c - half * 0.5, c + half * 0.5, last ? 1.2 : c + half], [0, 1, 1, last ? 1 : 0])
  return <motion.p className="sp__caption-line" style={{ opacity }}>{line}</motion.p>
}
