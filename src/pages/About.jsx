import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import CinematicStory from '../components/CinematicStory'
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

const toolkitRow1 = [
  'React', 'JavaScript', 'Python', 'Figma', 'Claude AI', 'Power BI',
  'Google Analytics', 'Shopify', 'WordPress', 'Git', 'Node.js', 'Framer Motion',
]

const toolkitRow2 = [
  'Photoshop', 'Illustrator', 'Meta Ads', 'Google Ads', 'Mailchimp',
  'HubSpot', 'Aptos SDK', 'Vite', 'CSS/SASS', 'SEO', 'Midjourney', 'Canva',
]

const processSteps = [
  { number: '01', title: 'Understand', desc: 'Get close to the customer, the business, and the constraints. Most bad strategy starts too far away from the people it is supposed to move.' },
  { number: '02', title: 'Build', desc: 'Turn the idea into something people can react to. A sketch, a page, a prototype, a launch flow - whatever gets the question into the real world.' },
  { number: '03', title: 'Deliver', desc: 'Ship it, measure it, and improve it. The work is not done when it looks good. It is done when it starts teaching us something.' },
]

const builderProfile = [
  {
    stage: 'Customer Insight',
    proof: 'Showroom sales, client discovery, analytics, and market research taught me to look for behavior before opinions.'
  },
  {
    stage: 'Positioning',
    proof: 'Product launches, campaign strategy, naming, copy, and brand work taught me how to make a market understand why something matters now.'
  },
  {
    stage: 'Prototype',
    proof: 'React, TypeScript, modern development tools, and rapid iteration let me make ideas testable without waiting for a giant handoff.'
  },
  {
    stage: 'Launch',
    proof: 'eCommerce, SEO, paid media, content, and reporting keep the work connected to distribution, learning, and revenue.'
  }
]

const STEP_HEIGHTS = [0, 200, 368] // px per step - tighter gap between 2 and 3 to match 0-1
const HEADER_SCROLL = 0.2 // Label + heading animate first, steps start after

// Label + heading animate in first, before process steps
function ProcessLabelHeading({ processScroll }) {
  const labelRotateX = useTransform(processScroll, [0, 0.07], [60, 0])
  const labelOpacity = useTransform(processScroll, [0, 0.05], [0, 1])
  const labelY = useTransform(processScroll, [0, 0.07], [40, 0])

  const headingRotateX = useTransform(processScroll, [0.06, 0.14], [60, 0])
  const headingOpacity = useTransform(processScroll, [0.07, 0.12], [0, 1])
  const headingY = useTransform(processScroll, [0.06, 0.14], [50, 0])

  return (
    <>
      <motion.p
        className="label"
        style={{
          rotateX: labelRotateX,
          opacity: labelOpacity,
          y: labelY,
          transformOrigin: 'center center'
        }}
      >
        Process
      </motion.p>
      <motion.h2
        className="section-heading"
        style={{
          rotateX: headingRotateX,
          opacity: headingOpacity,
          y: headingY,
          transformOrigin: 'center center'
        }}
      >
        How I Work
      </motion.h2>
    </>
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

function ProcessStep({ step, scrollYProgress, index, total }) {
  const segment = (1 - HEADER_SCROLL) / total
  const start = HEADER_SCROLL + index * segment
  const arrive = start + segment * 0.5
  const landedY = STEP_HEIGHTS[index]

  // Roll in from below, land at stacked position, stay (starts after label+heading)
  const rotateX = useTransform(
    scrollYProgress,
    [start, arrive],
    [70, 0]
  )

  const opacity = useTransform(
    scrollYProgress,
    [start, start + segment * 0.25],
    [0, 1]
  )

  // Slide up from below into stacked position, then hold
  const y = useTransform(
    scrollYProgress,
    [start, arrive],
    [landedY + 100, landedY]
  )

  const scale = useTransform(
    scrollYProgress,
    [start, arrive],
    [0.9, 1]
  )

  return (
    <motion.div
      className="process-step"
      style={{ rotateX, opacity, y, scale, transformOrigin: 'center center' }}
    >
      <span className="process-number">{step.number}</span>
      <div className="process-content">
        <h3>{step.title}</h3>
        <p>{step.desc}</p>
      </div>
    </motion.div>
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

  const { scrollYProgress: processScroll } = useScroll({
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
                I work best when the problem is still messy and someone needs to turn it into a product, a story, and a plan.
              </motion.p>
              <motion.a
                href="#my-story"
                className="about-read-more"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: ndsEase }}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('my-story')?.scrollIntoView({ behavior: 'smooth' })
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
                <span className="hero-meta-value">Insight · Positioning · Prototype · Launch</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Status</span>
                <span className="hero-meta-value hero-meta-status">Open to opportunities</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ BUILDER DOSSIER ═══════ */}
      <section className="builder-dossier section">
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
            The useful version of me is the person who can move between the customer, the market, and the build.
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
      </section>

      {/* ═══════ MY STORY — Cinematic ambient sequence ═══════ */}
      <CinematicStory />

      {/* ═══════ HOW I WORK — Scroll-driven cylinder picker ═══════ */}
      <section className="how-i-work-scroll" ref={processRef}>
        <div className="process-sticky">
          <div className="container">
            <ProcessLabelHeading processScroll={processScroll} />
            <div className="process-cylinder">
              {processSteps.map((step, i) => (
                <ProcessStep
                  key={i}
                  step={step}
                  scrollYProgress={processScroll}
                  index={i}
                  total={processSteps.length}
                />
              ))}
            </div>
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
              <p className="statement-subtitle">Philosophy</p>
              <StatementGiantText scrollYProgress={statementTextScroll} lineBreakAfter={2}>
                Zero to one. That's the job.
              </StatementGiantText>
              <p className="statement-paragraph">
                Find the problem, shape the offer, build the first version, and learn from the market.
              </p>
            </motion.div>
          </div>
        </SqueezeSection>
        </div>
      </div>

      {/* ═══════ TOOLKIT MARQUEE — full viewport ═══════ */}
      <section className="toolkit-section">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Toolkit
          </motion.p>
          <motion.h2
            className="section-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: ndsEase }}
          >
            What I Use
          </motion.h2>
        </div>
        <div className="marquee-wrap">
          <div className="marquee-track marquee-forward">
            {[...toolkitRow1, ...toolkitRow1].map((tool, i) => (
              <span className="marquee-item" key={i}>{tool}</span>
            ))}
          </div>
          <div className="marquee-track marquee-reverse">
            {[...toolkitRow2, ...toolkitRow2].map((tool, i) => (
              <span className="marquee-item" key={i}>{tool}</span>
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

      {/* ═══════ LET'S WORK TOGETHER CTA ═══════ */}
      <section className="cta-section section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            <motion.h2 className="cta-heading" variants={fadeUp}>
              Bring Me a Problem
            </motion.h2>
            <motion.p className="cta-sub" variants={fadeUp}>
              Have a customer problem, a product bet, or a launch that needs sharper thinking and real execution? Start with the context.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/contact" className="btn btn-primary">
                Start a Build Brief
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
    </PageTransition>
  )
}

export default About
