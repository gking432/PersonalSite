import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import './TheBook.css'

// ── Story, set as book chapters ──
const CHAPTERS = [
  {
    num: 'I', title: 'The Seat', drop: 'I',
    body: [
      "started my career at Sub-Zero Group in a rotational program — sales operations, product marketing, launch, showroom, dealer sales. An unusually good seat for learning how premium products move through a market.",
      "I saw the parts most people only discuss in pieces: the product story, the sales team, the dealer network, the showroom, the launch material — and the discipline to make a brand feel consistent at every touchpoint.",
    ],
  },
  {
    num: 'II', title: 'Betting on Myself', drop: 'A',
    body: [
      "s the program ended, I decided to take a risk and bet on myself.",
      "Freelance work slowly became a small agency. I was across the table from founders and owners, trying to make their ideas feel real enough for customers to trust.",
    ],
  },
  {
    num: 'III', title: 'It Was Building', drop: 'T',
    body: [
      "hat was the first time I understood what actually pulls me in. It wasn't the deliverables. It wasn't being my own boss. It was building.",
      "The best moments were never the handoff. They were the messy middle — the pivots, the rough drafts, the first version of a site, the moment a client could finally see the shape of what they'd been describing.",
    ],
  },
  {
    num: 'IV', title: 'The Stack', drop: 'R',
    body: [
      "unning the agency forced me to learn the practical stack of growth: positioning, web, content, SEO, paid media, eCommerce, reporting, client management —",
      "— and the uncomfortable art of deciding what is actually worth doing.",
    ],
  },
  {
    num: 'V', title: 'The Tools Changed', drop: 'T',
    body: [
      "hen the tools changed. As AI and modern builder tools arrived, the industry shifted fast. At first it felt like a gift — more speed, more leverage.",
      "Then the economics of basic production collapsed. Websites, copy, and ad creative became cheap to produce, and the average deliverable stopped being defensible.",
    ],
  },
  {
    num: 'VI', title: 'The Lever', drop: 'I',
    body: [
      "t forced a better question: what still matters when almost everyone can make something?",
      "In a world where tools make everyone fast, judgment becomes the real lever. The winners won't be the teams that make the most stuff — they'll be the ones who know what is worth making, and why.",
    ],
  },
  {
    num: 'VII', title: 'Building Again', drop: 'S',
    body: [
      "o I went deeper — language models, data infrastructure, compute economics, adoption cycles. More importantly, I started building: Terralis Print Studio, MoveMint, an interview-practice platform, this site as a living product.",
      "Technology is part of my operating system now, but it isn't the point. The point is still the work — finding a real problem, shaping the offer, building the first version, improving it with evidence. I'm looking for a team with serious problems and the ambition to build things that matter.",
    ],
  },
]
const N = CHAPTERS.length
const smooth = (t) => t * t * (3 - 2 * t)

// ── Right column: gold contour field that calms as the story resolves ──
function buildStrand(i, S, raw) {
  const t = smooth(Math.max(0, Math.min(1, raw)))
  const baseY = 20 + (i * 60) / (S - 1)
  const amp = 15 * (1 - t) + 2.5
  const chaos = (1 - t) * 9
  const freq = 0.085 - 0.03 * t
  const phase = i * 1.27
  let d = ''
  for (let x = -4; x <= 104; x += 2.5) {
    const y =
      baseY +
      amp * Math.sin(freq * x + phase) +
      chaos * Math.sin(freq * 1.9 * x + phase * 2.1) * 0.5
    d += (x === -4 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(2) + ' '
  }
  return d
}

function Strand({ t, i, S }) {
  const d = useTransform(t, (v) => buildStrand(i, S, v))
  const focal = i === Math.floor(S / 2)
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={focal ? 'var(--accent)' : 'rgba(168,130,60,0.45)'}
      strokeWidth={focal ? 0.7 : 0.4}
      strokeLinecap="round"
    />
  )
}

function Motif({ t }) {
  const S = 7
  const nodeR = useTransform(t, [0.45, 1], [0, 3.4])
  const nodeOp = useTransform(t, [0.45, 0.9], [0, 1])
  const ringR = useTransform(t, [0.5, 1], [2, 13])
  const ringOp = useTransform(t, [0.6, 1], [0, 0.5])
  return (
    <svg className="book__motif-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: S }).map((_, i) => (
        <Strand key={i} t={t} i={i} S={S} />
      ))}
      <motion.circle cx="50" cy="50" r={ringR} fill="none" stroke="var(--accent)" strokeWidth="0.4" style={{ opacity: ringOp }} />
      <motion.circle cx="50" cy="50" r={nodeR} fill="var(--accent)" style={{ opacity: nodeOp }} />
    </svg>
  )
}

// ── A single book page ──
function Page({ chapter, rotate, z, dim }) {
  return (
    <motion.article className="book__page" style={{ rotateY: rotate, zIndex: z }}>
      <div className="book__page-face">
        <header className="book__chapter-head">
          <span className="book__numeral">{chapter.num}</span>
          <span className="book__chapter-title">{chapter.title}</span>
        </header>
        <p className="book__body book__body--first">
          <span className="book__drop">{chapter.drop}</span>
          {chapter.body[0]}
        </p>
        {chapter.body.slice(1).map((p, i) => (
          <p key={i} className="book__body">{p}</p>
        ))}
        <footer className="book__folio">{chapter.num}</footer>
      </div>
      {dim && <motion.div className="book__shade" style={{ opacity: dim }} />}
    </motion.article>
  )
}

export default function TheBook() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [idx, setIdx] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const seg = 1 / N
    const i = Math.max(0, Math.min(N - 1, Math.floor(v / seg + 1e-6)))
    if (i !== idx) setIdx(i)
  })

  // Current page flip (0 → -158deg over the first ~80% of each segment, then dwell)
  const flip = useTransform(scrollYProgress, (v) => {
    const seg = 1 / N
    const f = v / seg - Math.floor(v / seg)
    return -158 * smooth(Math.min(1, f / 0.8))
  })
  // Shade on the turning page as it lifts
  const turnShade = useTransform(scrollYProgress, (v) => {
    const seg = 1 / N
    const f = v / seg - Math.floor(v / seg)
    return Math.min(0.35, smooth(Math.min(1, f / 0.8)) * 0.35)
  })

  const next = idx < N - 1 ? CHAPTERS[idx + 1] : null
  const isLast = idx === N - 1

  return (
    <section className="book" ref={ref} style={{ height: `${N * 92 + 40}vh` }} id="my-story" aria-label="My story">
      <div className="book__stage container">
        <div className="book__head">
          <p className="book__eyebrow">My Story</p>
        </div>

        <div className="book__spread">
          {/* LEFT — turning pages */}
          <div className="book__left">
            <div className="book__binding" />
            <div className="book__pages">
              {next && <Page chapter={next} rotate={0} z={1} />}
              <Page
                chapter={CHAPTERS[idx]}
                rotate={isLast ? 0 : flip}
                z={3}
                dim={isLast ? undefined : turnShade}
              />
            </div>
            <div className="book__progress">
              <span className="book__progress-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className="book__progress-sep">/</span>
              <span className="book__progress-tot">{String(N).padStart(2, '0')}</span>
            </div>
          </div>

          {/* RIGHT — abstract motif */}
          <div className="book__right">
            <Motif t={scrollYProgress} />
            <p className="book__caption">{CHAPTERS[idx].title}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
