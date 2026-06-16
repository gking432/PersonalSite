import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import StoryChronicle from '../components/StoryChronicle'
import './About.css'

const ndsEase = [0.22, 1, 0.36, 1]
const SHOW_ASK_AI = false

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ndsEase } }
}

// Operating thesis — the point of view that drives the work.
// Accent words light up gold; the rest reveal charcoal word-by-word on scroll.
const thesisWords = [
  'Tools', 'made', 'everyone', 'fast.', { w: 'Judgment', accent: true },
  'is', 'the', { w: 'lever', accent: true }, "that's", 'left.',
]

const capabilities = [
  {
    group: 'Strategy',
    desc: 'Find the real problem and shape the offer before anyone writes a line of code.',
    tools: ['Customer Research', 'Positioning', 'GTM', 'Analytics', 'Power BI', 'KPIs'],
  },
  {
    group: 'Build',
    desc: 'Turn the idea into something people can actually use and react to.',
    tools: ['React', 'TypeScript', 'Python', 'APIs', 'Claude Code', 'Vite'],
  },
  {
    group: 'Operate',
    desc: 'Wire the work into daily operations so it runs without babysitting.',
    tools: ['AI Assistants', 'Workflow Automation', 'CRM', 'Integrations', 'Dashboards', 'Reporting'],
  },
]

const builderProfile = [
  {
    stage: 'Find the Problem',
    proof: 'Showroom sales, client discovery, and analytics taught me to look for the behavior and the bottleneck before the opinion.'
  },
  {
    stage: 'Build the Tool',
    proof: 'React, TypeScript, Python, and AI-assisted development let me turn an idea into a working app, assistant, or internal tool — fast.'
  },
  {
    stage: 'Automate the Workflow',
    proof: 'The goal is less busywork: connecting the tools a team already uses so data and tasks move without the manual copy-paste.'
  },
  {
    stage: 'Measure & Run',
    proof: 'Dashboards, KPIs, and reporting keep the system honest, so people can see what is working and decide from it.'
  }
]

// ── OPERATING THESIS — pinned, scroll-driven word reveal ──
// A single opinionated statement that lights up word-by-word as you scroll,
// with the point-of-view paragraph resolving underneath it.
function ThesisReveal({ progress }) {
  const total = thesisWords.length
  const colors = thesisWords.map((_, i) => {
    const start = 0.14 + (i / total) * 0.5
    const end = start + 0.1
    const accent = typeof thesisWords[i] === 'object' && thesisWords[i].accent
    return useTransform(
      progress,
      [start, end],
      accent
        ? ['rgba(168, 130, 60, 0.18)', 'rgba(168, 130, 60, 1)']
        : ['rgba(42, 42, 42, 0.14)', 'rgba(42, 42, 42, 1)']
    )
  })

  const kickerOpacity = useTransform(progress, [0, 0.08], [0, 1])
  const kickerY = useTransform(progress, [0, 0.1], [24, 0])
  const supportOpacity = useTransform(progress, [0.7, 0.86], [0, 1])
  const supportY = useTransform(progress, [0.7, 0.9], [30, 0])

  return (
    <div className="thesis-inner">
      <motion.p className="thesis-kicker" style={{ opacity: kickerOpacity, y: kickerY }}>
        Point of View
      </motion.p>
      <h2 className="thesis-statement">
        {thesisWords.map((item, i) => {
          const word = typeof item === 'object' ? item.w : item
          return (
            <span key={i}>
              <motion.span style={{ color: colors[i] }}>{word}</motion.span>
              {i < total - 1 ? ' ' : ''}
            </span>
          )
        })}
      </h2>
      <motion.p className="thesis-support" style={{ opacity: supportOpacity, y: supportY }}>
        The teams that win won't make the most. They'll know what's worth building,
        what's worth automating, and how to execute above the noise. That's the work
        I want to be in the room for.
      </motion.p>
    </div>
  )
}

// Word-by-word color reveal on scroll (same as Home photo sections)
function StatementGiantText({ children, scrollYProgress, lineBreakAfter }) {
  const words = typeof children === 'string' ? children.split(' ') : [children]
  const totalWords = words.length

  const wordColors = words.map((_, index) => {
    const wordStart = (index / totalWords) * 0.45
    const wordEnd = 0.05 + (index / totalWords) * 0.45
    return useTransform(
      scrollYProgress,
      [wordStart, wordEnd],
      ['rgba(244, 241, 234, 0.3)', 'rgba(244, 241, 234, 1)']
    )
  })

  return (
    <p className="statement-text">
      {words.map((word, index) => (
        <span key={index}>
          <motion.span
            style={{ color: wordColors[index] }}
            className="statement-text-word"
          >
            {word}
          </motion.span>
          {index < words.length - 1 && (index === lineBreakAfter ? <br /> : ' ')}
        </span>
      ))}
    </p>
  )
}

// Story content — each item is either a paragraph, a pullQuote (breakout), or a moment (big display text)
const storyBlocks = [
  { text: 'I started my career at Sub-Zero Group, Inc. in a rotational program that moved through sales operations, product marketing, product launch, showroom sales, and external dealer sales. It was an unusually good seat for learning how premium products move through a market.', first: true },
  { text: 'I saw the parts most people only talk about in pieces: the product story, the sales team, the dealer network, the showroom experience, the launch material, and the discipline required to make a brand feel consistent at every touchpoint.' },
  { text: 'As the rotational program came to an end, {I decided to take a risk and bet on myself.}', highlight: 'pullQuote' },
  { text: 'I started doing freelance marketing work, and that slowly became a small agency. I was sitting across the table from business owners, founders, and aspiring entrepreneurs trying to make their ideas feel real enough for customers to trust.' },
  { text: 'That was the first time I understood what kind of work actually pulls me in.' },
  { text: 'It wasn\'t the deliverables. It wasn\'t being my own boss. {It was building.}', highlight: 'moment' },
  { text: 'The best moments were not the handoff moments. They were the messy middle: the strategy pivots, the rough drafts, the first version of a site, the moment a client could finally see the shape of what they had been describing.' },
  { text: 'Running that agency forced me to learn the practical stack of growth: positioning, web, content, SEO, paid media, eCommerce, reporting, client management, and the uncomfortable art of deciding what is actually worth doing.' },
  { text: '{Then the tools changed.}', highlight: 'moment' },
  { text: 'As AI and modern builder tools became widely available, the industry changed fast. At first, it felt like a gift: more speed, more leverage, more ways to make small teams powerful.' },
  { text: '{For me, it was the opposite.}', highlight: 'emphasis' },
  { text: 'Then the economics of basic marketing production collapsed. Websites, copy, and ad creative became cheaper and easier to produce. That made the average deliverable less defensible, and it forced me to ask a better question: what still matters when almost everyone can make something?' },
  { text: 'This led me to a new way of thinking about modern marketing: {in a world where tools make everyone fast, judgment becomes the real lever.} The winners will not be the teams that make the most stuff. They will be the teams that know what is worth making, why it should exist, and how to execute above the noise.', highlight: 'pullQuote' },
  { text: 'So I went deeper into the technology behind the shift. I studied large language models, data infrastructure, emerging companies, compute economics, adoption cycles, and the cultural questions that come with powerful tools becoming ordinary.' },
  { text: 'More importantly, I started building. I created Terralis Print Studio, MoveMint, an interview practice platform, and this portfolio as a living product. Each one forced the same questions: who is this for, why now, what should it feel like, how does it launch, and what would make it worth using?' },
  { text: 'Today, technology is part of my operating system, but it is not the point. The point is still the work: finding a real problem, shaping the offer, building the first version, putting it in front of people, and improving it with evidence.' },
  { text: 'I\'m looking for a team with serious problems, a strong product instinct, and the ambition to build things that matter. That is where I do my best work.' },
]

function renderStoryText(text, highlight) {
  if (!highlight) return text
  const match = text.match(/^(.*?)\{(.*?)\}(.*)$/s)
  if (!match) return text
  const [, before, highlighted, after] = match
  return (
    <>
      {before && <span>{before}</span>}
      <span className={`story-inline-${highlight}`}>{highlighted}</span>
      {after && <span>{after}</span>}
    </>
  )
}

function About() {
  const storyRunwayRef = useRef(null)
  const storyContentRef = useRef(null)
  const processRef = useRef(null)
  const statementRef = useRef(null)
  const philosophyRef = useRef(null)

  // Story scroll — content scrolls through pinned squeeze container
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRunwayRef,
    offset: ["start start", "end end"]
  })

  const storyContentY = useTransform(storyScroll, (v) => {
    if (!storyContentRef.current) return 0
    const contentH = storyContentRef.current.offsetHeight
    const containerH = window.innerHeight * 0.85
    return -v * Math.max(0, contentH - containerH)
  })

  // Dynamically size the scroll runway to match content length
  useEffect(() => {
    const update = () => {
      if (!storyContentRef.current || !storyRunwayRef.current) return
      const contentH = storyContentRef.current.offsetHeight
      const viewportH = window.innerHeight
      const containerH = viewportH * 0.85
      const travel = Math.max(0, contentH - containerH)
      storyRunwayRef.current.style.height = `${viewportH + travel}px`
    }
    const t = setTimeout(update, 150)
    window.addEventListener('resize', update)
    return () => { clearTimeout(t); window.removeEventListener('resize', update) }
  }, [])

  const { scrollYProgress: thesisScroll } = useScroll({
    target: processRef,
    offset: ["start start", "end end"]
  })

  const { scrollYProgress: statementScroll } = useScroll({
    target: statementRef,
    offset: ["start end", "end start"]
  })
  const { scrollYProgress: statementTextScroll } = useScroll({
    target: statementRef,
    offset: ["start start", "end start"]
  })
  const statementY = useTransform(statementScroll, [0, 1], [60, -60])

  // PhotoSection1 — Philosophy (moved from Home)
  const { scrollYProgress: philosophyScroll } = useScroll({
    target: philosophyRef,
    offset: ["start end", "end start"]
  })
  const { scrollYProgress: philosophyTextScroll } = useScroll({
    target: philosophyRef,
    offset: ["start start", "end start"]
  })
  const philosophyY = useTransform(philosophyScroll, [0, 1], [60, -60])

  return (
    <PageTransition>
    <div className="about">
      <section className="about-hero section">
        <div className="container">
          <div className="hero-split">
            <div className="hero-split-left">
              <motion.p
                className="label about-tagline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: ndsEase }}
              >
                Builder Profile
              </motion.p>
              <h1>
                {'How I Work'.split(' ').map((word, i, words) => (
                  <motion.span
                    key={i}
                    style={{ display: 'inline-block' }}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: ndsEase }}
                  >
                    {word}{i < words.length - 1 ? '\u00a0' : ''}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className="about-hook"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                I work best when the problem is still messy and someone needs to turn it into a working system — an automation, a dashboard, a tool the team actually uses.
              </motion.p>
              <motion.a
                href="#my-story"
                className="about-read-more"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: ndsEase }}
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById('my-story')
                  if (!el) return
                  // Land a touch into the section so the intro heading arrives
                  // mid-bloom (fully formed) rather than at progress 0 (blank).
                  const top = el.getBoundingClientRect().top + window.scrollY
                  const scrollable = el.offsetHeight - window.innerHeight
                  window.scrollTo({ top: top + scrollable * 0.09, behavior: 'smooth' })
                }}
              >
                Read the full story
              </motion.a>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Location</span>
                <span className="hero-meta-value">Milwaukee, WI</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Education</span>
                <span className="hero-meta-value">BBA, UW-Milwaukee</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Operating Range</span>
                <span className="hero-meta-value">Problem · Build · Automate · Measure</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Status</span>
                <span className="hero-meta-value hero-meta-status">Open to opportunities</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ BUILDER DOSSIER — colored squeeze ═══════ */}
      <SqueezeSection className="builder-dossier section">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Operating Manual
          </motion.p>
          <motion.h2
            className="builder-dossier-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: ndsEase }}
          >
            The useful version of me is the person who can find the manual work, build the fix, and make it run without babysitting.
          </motion.h2>
          <motion.div
            className="builder-dossier-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {builderProfile.map((item, index) => (
              <motion.div className="builder-dossier-card" key={item.stage} variants={staggerItem}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.stage}</h3>
                <p>{item.proof}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SqueezeSection>

      {/* ═══════ MY STORY — Editorial chronicle ═══════ */}
      <StoryChronicle />

      {/* ═══════ OPERATING THESIS — pinned word reveal ═══════ */}
      <section className="thesis-scroll" ref={processRef}>
        <div className="thesis-sticky">
          <div className="container">
            <ThesisReveal progress={thesisScroll} />
          </div>
        </div>
      </section>

      {/* ═══════ STATEMENT MOMENT ═══════ */}
      <div ref={statementRef} className="statement-scroll-runway">
        <div className="statement-sticky-wrapper">
          <SqueezeSection className="statement-section section">
          <video
            className="statement-section-video"
            autoPlay
            loop
            muted
            playsInline
            src="/Photo Sections/Brown.mp4"
          />
          <div className="container">
            <motion.div
              className="statement-inner"
              style={{ y: statementY }}
            >
              <p className="statement-subtitle">What's Next</p>
              <StatementGiantText scrollYProgress={statementTextScroll} lineBreakAfter={3}>
                I want in on problems that actually matter.
              </StatementGiantText>
              <p className="statement-paragraph">
                A team with a high bar, a real product instinct, and the ambition to build things worth building.
              </p>
            </motion.div>
          </div>
        </SqueezeSection>
        </div>
      </div>

      {/* ═══════ CAPABILITIES — what I actually do ═══════ */}
      <section className="capabilities-section section">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Capabilities
          </motion.p>
          <motion.h2
            className="section-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: ndsEase }}
          >
            Strategy, build, and growth — under one roof.
          </motion.h2>
          <div className="capabilities-grid">
            {capabilities.map((cap, i) => (
              <motion.div
                className="capability"
                key={cap.group}
                initial={{ opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: ndsEase }}
              >
                <span className="capability-index">{String(i + 1).padStart(2, '0')}</span>
                <h3>{cap.group}</h3>
                <p className="capability-desc">{cap.desc}</p>
                <ul className="capability-tools">
                  {cap.tools.map((tool, ti) => (
                    <motion.li
                      key={tool}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.4, delay: i * 0.12 + 0.2 + ti * 0.05, ease: ndsEase }}
                    >
                      {tool}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ASK AI PHOTO SECTION ═══════ */}
      {SHOW_ASK_AI && (
      <div ref={philosophyRef} className="philosophy-photo-scroll-runway">
        <div className="philosophy-photo-sticky-wrapper">
          <SqueezeSection className="philosophy-photo-section section">
            <div className="philosophy-photo-bg" />
            <div className="philosophy-photo-overlay" />
            <div className="container">
              <motion.div
                className="statement-inner"
                style={{ y: philosophyY }}
              >
                <p className="statement-subtitle">Ask AI</p>
                <StatementGiantText scrollYProgress={philosophyTextScroll} lineBreakAfter={2}>
                  Don't take my word for it.
                </StatementGiantText>
                <p className="statement-paragraph">
                  Open any AI and ask: "Tell me about Gunnar Neuman"
                </p>
                <div className="ask-ai-photo-links">
                  {[
                    { name: 'ChatGPT', url: 'https://chatgpt.com/' },
                    { name: 'Gemini', url: 'https://gemini.google.com/' },
                    { name: 'Claude', url: 'https://claude.ai/' },
                    { name: 'Perplexity', url: 'https://www.perplexity.ai/' },
                    { name: 'Grok', url: 'https://grok.com/' },
                  ].map((llm) => (
                    <a
                      key={llm.name}
                      href={llm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-light btn-sm"
                    >
                      {llm.name} →
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </SqueezeSection>
        </div>
      </div>
      )}

      {/* ═══════ LET'S WORK TOGETHER CTA — green squeeze panel ═══════ */}
      <SqueezeSection className="cta-section section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.h2 className="cta-heading" variants={fadeUp}>
              Let's Work Together
            </motion.h2>
            <motion.p className="cta-sub" variants={fadeUp}>
              I'm looking for my next role — full-time, contract, or consulting. If you have a problem worth solving and a high bar for the people solving it, let's talk.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/contact" className="btn btn-primary">
                Get in Touch
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default About
