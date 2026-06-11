import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
      { type: 'p', text: 'The best moments were not the handoff moments. They were the messy middle: the strategy pivots, the rough drafts, the first version of a site, the moment a client could finally see the shape of what they had been describing.' },
      { type: 'p', text: 'Running that agency forced me to learn the practical stack of growth: positioning, web, content, SEO, paid media, eCommerce, reporting, client management, and the uncomfortable art of deciding what is actually worth doing.' },
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
      { type: 'p', text: 'So I went deeper into the technology behind the shift. I studied large language models, data infrastructure, emerging companies, compute economics, adoption cycles, and the cultural questions that come with powerful tools becoming ordinary.' },
    ],
  },
  {
    id: 'building-now',
    era: 'Today',
    title: 'Building Now',
    blocks: [
      { type: 'p', text: 'More importantly, I started building. I created Terralis Print Studio, MoveMint, an interview practice platform, and this portfolio as a living product. Each one forced the same questions: who is this for, why now, what should it feel like, how does it launch, and what would make it worth using?' },
      { type: 'p', text: 'Today, technology is part of my operating system, but it is not the point. The point is still the work: finding a real problem, shaping the offer, building the first version, putting it in front of people, and improving it with evidence.' },
      { type: 'emph', text: 'I’m looking for a team with serious problems, a strong product instinct, and the ambition to build things that matter. That is where I do my best work.' },
    ],
  },
]

function Block({ block, lead }) {
  if (block.type === 'quote') {
    return (
      <motion.blockquote
        className="chron__quote"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {block.text}
      </motion.blockquote>
    )
  }
  const cls = block.type === 'emph' ? 'chron__p chron__p--emph' : 'chron__p'
  return (
    <motion.p
      className={`${cls}${lead ? ' chron__p--lead' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {block.text}
    </motion.p>
  )
}

export default function StoryChronicle() {
  const [active, setActive] = useState(CHAPTERS[0].id)
  const refs = useRef({})

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.dataset.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    )
    Object.values(refs.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const jump = (id) =>
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const activeIndex = CHAPTERS.findIndex((c) => c.id === active)

  return (
    <section className="chron" id="my-story" aria-label="My story">
      <div className="chron__inner">
        <header className="chron__header">
          <p className="chron__eyebrow">My Story</p>
          <h2 className="chron__title">How I got here.</h2>
          <p className="chron__deck">
            A path from inside a premium brand, to building on my own, to making
            judgment the thing I lead with.
          </p>
        </header>

        <div className="chron__body">
          {/* Timeline spine */}
          <nav className="chron__rail" aria-label="Chapters">
            <span
              className="chron__rail-fill"
              style={{ height: `${(activeIndex / (CHAPTERS.length - 1)) * 100}%` }}
            />
            {CHAPTERS.map((c, i) => (
              <button
                key={c.id}
                className={`chron__marker${c.id === active ? ' is-active' : ''}`}
                onClick={() => jump(c.id)}
              >
                <span className="chron__dot" />
                <span className="chron__marker-text">
                  <span className="chron__marker-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="chron__marker-title">{c.title}</span>
                </span>
              </button>
            ))}
          </nav>

          {/* Article */}
          <div className="chron__article">
            {CHAPTERS.map((c, ci) => (
              <article
                key={c.id}
                className="chron__chapter"
                data-id={c.id}
                ref={(el) => (refs.current[c.id] = el)}
              >
                <header className="chron__chapter-head">
                  <span className="chron__chapter-era">{c.era}</span>
                  <h3 className="chron__chapter-title">
                    <span className="chron__chapter-num">{String(ci + 1).padStart(2, '0')}</span>
                    {c.title}
                  </h3>
                </header>
                {c.blocks.map((b, bi) => (
                  <Block key={bi} block={b} lead={ci === 0 && b.type === 'lead'} />
                ))}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
