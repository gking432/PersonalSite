import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValueEvent } from 'framer-motion'
import './StoryChronicle.css'

// The full story — preserved, organized as a chronicle.
const CHAPTERS = [
  {
    id: 'foundation',
    era: 'Where it began',
    title: 'The Foundation',
    blocks: [
      { type: 'lead', text: 'I started my career at Sub-Zero Group, Inc. in a rotational program that moved through sales operations, product marketing, product launch, showroom sales, and external dealer sales. It was an unusually good seat for learning how premium products move through a market.' },
      { type: 'p', text: 'I saw the parts most people only talk about in pieces: the product story, the sales team, the dealer network, the showroom experience, the launch material, and the discipline required to make a brand feel consistent at every touchpoint.' },
    ],
  },
  {
    id: 'on-my-own',
    era: 'The leap',
    title: 'On My Own',
    blocks: [
      { type: 'quote', text: 'As the rotational program came to an end, I decided to take a risk and bet on myself.' },
      { type: 'p', text: 'I started doing freelance marketing work, and that slowly became a small agency. I was sitting across the table from business owners, founders, and aspiring entrepreneurs trying to make their ideas feel real enough for customers to trust.' },
      { type: 'p', text: 'That was the first time I understood what kind of work actually pulls me in. It wasn’t the deliverables. It wasn’t being my own boss. It was building.' },
      { type: 'p', text: 'Running that agency forced me to learn the practical stack of growth: positioning, web, content, SEO, paid media, eCommerce, reporting, and the uncomfortable art of deciding what is actually worth doing.' },
    ],
  },
  {
    id: 'the-shift',
    era: 'When everything moved',
    title: 'The Shift',
    blocks: [
      { type: 'p', text: 'Then the tools changed. As AI and modern builder tools became widely available, the industry changed fast. At first, it felt like a gift: more speed, more leverage, more ways to make small teams powerful.' },
      { type: 'p', text: 'Then the economics of basic marketing production collapsed. Websites, copy, and ad creative became cheaper and easier to produce. That made the average deliverable less defensible, and it forced me to ask a better question: what still matters when almost everyone can make something?' },
    ],
  },
  {
    id: 'the-lever',
    era: 'A sharper question',
    title: 'The Lever',
    blocks: [
      { type: 'quote', text: 'In a world where tools make everyone fast, judgment becomes the real lever.' },
      { type: 'p', text: 'The winners will not be the teams that make the most stuff. They will be the teams that know what is worth making, why it should exist, and how to execute above the noise.' },
      { type: 'p', text: 'So I went deeper into the technology behind the shift — large language models, data infrastructure, compute economics, adoption cycles, and the cultural questions that come with powerful tools becoming ordinary.' },
    ],
  },
  {
    id: 'building-now',
    era: 'Today',
    title: 'Building Now',
    blocks: [
      { type: 'p', text: 'More importantly, I started building. I created Terralis Print Studio, MoveMint, an interview practice platform, and this portfolio as a living product. Each one forced the same questions: who is this for, why now, what should it feel like, how does it launch, and what would make it worth using?' },
      { type: 'emph', text: 'I’m looking for a team with serious problems, a strong product instinct, and the ambition to build things that matter. That is where I do my best work.' },
    ],
  },
]
const N = CHAPTERS.length
const INTRO = 1 / (N + 1) // intro occupies the first segment
const SEG = (1 - INTRO) / N

function Block({ block, lead }) {
  if (block.type === 'quote') {
    return <blockquote className="chron__quote">{block.text}</blockquote>
  }
  const cls = block.type === 'emph' ? 'chron__p chron__p--emph' : 'chron__p'
  return <p className={`${cls}${lead ? ' chron__p--lead' : ''}`}>{block.text}</p>
}

function Chapter({ progress, i }) {
  const c = INTRO + SEG * (i + 0.5)
  const last = i === N - 1
  const inA = c - SEG * 0.55, inB = c - SEG * 0.18
  const outA = c + SEG * 0.18, outB = c + SEG * 0.55
  const opacity = useTransform(
    progress,
    last ? [inA, inB, 1.1, 1.2] : [inA, inB, outA, outB],
    last ? [0, 1, 1, 1] : [0, 1, 1, 0]
  )
  const y = useTransform(
    progress,
    last ? [inA, inB, 1.1, 1.2] : [inA, inB, outA, outB],
    last ? [34, 0, 0, 0] : [34, 0, 0, -34]
  )
  const ch = CHAPTERS[i]
  return (
    <motion.article className="chron__chapter" style={{ opacity, y }}>
      <header className="chron__chapter-head">
        <span className="chron__chapter-era">{ch.era}</span>
        <h3 className="chron__chapter-title">
          <span className="chron__chapter-num">{String(i + 1).padStart(2, '0')}</span>
          {ch.title}
        </h3>
      </header>
      {ch.blocks.map((b, bi) => (
        <Block key={bi} block={b} lead={i === 0 && b.type === 'lead'} />
      ))}
    </motion.article>
  )
}

function RailMarker({ progress, i, active }) {
  const s = INTRO + SEG * i
  const opacity = useTransform(progress, [s - 0.005, s + 0.03], [0, 1])
  const x = useTransform(progress, [s - 0.005, s + 0.03], [-10, 0])
  return (
    <motion.div className={`chron__marker${active ? ' is-active' : ''}`} style={{ opacity, x }}>
      <span className="chron__dot" />
      <span className="chron__marker-text">
        <span className="chron__marker-num">{String(i + 1).padStart(2, '0')}</span>
        <span className="chron__marker-title">{CHAPTERS[i].title}</span>
      </span>
    </motion.div>
  )
}

export default function StoryChronicle() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(-1)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = v < INTRO ? -1 : Math.min(N - 1, Math.floor((v - INTRO) / SEG + 1e-6))
    if (idx !== active) setActive(idx)
  })

  // Intro heading: present immediately on arrival (so jumping here from the
  // "Read the full story" button never lands on a blank screen), then a gentle
  // settle, then dissolve away as the chapters take over.
  const introOpacity = useTransform(scrollYProgress, [0, INTRO - 0.05, INTRO - 0.005], [1, 1, 0])
  const introScale = useTransform(scrollYProgress, [0, 0.07], [0.96, 1])
  const introBlurPx = useTransform(scrollYProgress, [0, 0.05], [3, 0])
  const introBlur = useMotionTemplate`blur(${introBlurPx}px)`
  const introY = useTransform(scrollYProgress, [INTRO - 0.06, INTRO - 0.005], [0, -50])

  // Chapters frame fades in as the heading leaves
  const stageOpacity = useTransform(scrollYProgress, [INTRO - 0.05, INTRO + 0.02], [0, 1])
  const railFill = active < 0 ? 0 : (active / (N - 1)) * 100

  return (
    <section className="chron" id="my-story" aria-label="My story" ref={ref} style={{ height: `${(N + 1) * 95}vh` }}>
      <div className="chron__stage">
        {/* Intro heading — blooms in, dissolves away */}
        <motion.div className="chron__intro" style={{ opacity: introOpacity, scale: introScale, filter: introBlur, y: introY }}>
          <p className="chron__eyebrow">My Story</p>
          <h2 className="chron__title">How I got here.</h2>
          <p className="chron__deck">
            A path from inside a premium brand, to building on my own, to making
            judgment the thing I lead with.
          </p>
        </motion.div>

        {/* Chapters frame */}
        <motion.div className="chron__frame" style={{ opacity: stageOpacity }}>
          <nav className="chron__rail" aria-label="Chapters">
            <span className="chron__rail-track" />
            <span className="chron__rail-fill" style={{ height: `${railFill}%` }} />
            {CHAPTERS.map((c, i) => (
              <RailMarker key={c.id} progress={scrollYProgress} i={i} active={i === active} />
            ))}
          </nav>
          <div className="chron__article">
            {CHAPTERS.map((c, i) => (
              <Chapter key={c.id} progress={scrollYProgress} i={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
