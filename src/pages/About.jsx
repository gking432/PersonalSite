import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
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

// Operating thesis; the point of view that drives the work.
// Accent words light up gold; the rest reveal charcoal word-by-word on scroll.
const thesisWords = [
  'Tools', 'made', 'everyone', 'fast.', { w: 'Judgment', accent: true },
  'is', 'the', { w: 'lever', accent: true }, "that's", 'left.',
]

const capabilities = [
  {
    group: 'Business',
    desc: 'Understand the people, process, constraint, and outcome before deciding what should be built.',
    tools: ['Customer Discovery', 'Workflow Analysis', 'Business Strategy', 'Analytics', 'Power BI', 'ROI'],
  },
  {
    group: 'Build',
    desc: 'Turn the workflow into a functional product people can use, question, and improve.',
    tools: ['AI Products', 'Business Systems', 'Prototyping', 'React', 'TypeScript', 'Python'],
  },
  {
    group: 'Implementation',
    desc: 'Fit the system to the people around it and keep the work connected to a real business result.',
    tools: ['Stakeholders', 'Human Approval', 'Handoffs', 'Launches', 'Training', 'Iteration'],
  },
]

const builderProfile = [
  {
    stage: 'Business Context',
    proof: 'Sales operations, client discovery, analytics, and market experience taught me to understand how the work gets done.'
  },
  {
    stage: 'Workflow',
    proof: 'I look for the decisions, handoffs, repeated work, and customer moments where a better system could make a real difference.'
  },
  {
    stage: 'Working System',
    proof: 'I can build enough of the product myself to make the idea testable and put it in front of people.'
  },
  {
    stage: 'Implementation',
    proof: 'The system still has to fit the people using it. I think about approval, adoption, handoffs, and what happens after the demo.'
  }
]

// ── OPERATING THESIS; pinned, scroll-driven word reveal ──
// A single opinionated statement that lights up word-by-word as you scroll,
// with the point-of-view paragraph resolving underneath it.
const ACCENT_FINAL = 'rgba(168, 130, 60, 1)'
const INK_FINAL = 'rgba(42, 42, 42, 1)'
const isAccent = (item) => typeof item === 'object' && item.accent

function ThesisReveal({ progress }) {
  // With motion reduced the scroll runway collapses, so there is no scroll left
  // to drive the reveal. The words have to start legible instead of at 14%
  // opacity, or the statement is simply unreadable.
  const reduce = useReducedMotion()
  const total = thesisWords.length
  const colors = thesisWords.map((_, i) => {
    const start = 0.14 + (i / total) * 0.5
    const end = start + 0.1
    return useTransform(
      progress,
      [start, end],
      isAccent(thesisWords[i])
        ? ['rgba(168, 130, 60, 0.18)', ACCENT_FINAL]
        : ['rgba(42, 42, 42, 0.14)', INK_FINAL]
    )
  })

  const kickerOpacity = useTransform(progress, [0, 0.08], [0, 1])
  const kickerY = useTransform(progress, [0, 0.1], [24, 0])
  const supportOpacity = useTransform(progress, [0.7, 0.86], [0, 1])
  const supportY = useTransform(progress, [0.7, 0.9], [30, 0])

  return (
    <div className="thesis-inner">
      <motion.p
        className="thesis-kicker"
        style={reduce ? undefined : { opacity: kickerOpacity, y: kickerY }}
      >
        Point of View
      </motion.p>
      <h2 className="thesis-statement">
        {thesisWords.map((item, i) => {
          const word = typeof item === 'object' ? item.w : item
          const color = reduce ? (isAccent(item) ? ACCENT_FINAL : INK_FINAL) : colors[i]
          return (
            <span key={i}>
              <motion.span style={{ color }}>{word}</motion.span>
              {i < total - 1 ? ' ' : ''}
            </span>
          )
        })}
      </h2>
      <motion.p
        className="thesis-support"
        style={reduce ? undefined : { opacity: supportOpacity, y: supportY }}
      >
        The teams that win won't make the most. They'll know what's worth making,
        why it should exist, and how to execute above the noise. That's the work
        I want to be in the room for.
      </motion.p>
    </div>
  )
}

// Word-by-word color reveal on scroll (same as Home photo sections)
const CREAM_FINAL = 'rgba(244, 241, 234, 1)'

function StatementGiantText({ children, scrollYProgress, lineBreakAfter }) {
  const reduce = useReducedMotion()
  const words = typeof children === 'string' ? children.split(' ') : [children]
  const totalWords = words.length

  const wordColors = words.map((_, index) => {
    const wordStart = (index / totalWords) * 0.45
    const wordEnd = 0.05 + (index / totalWords) * 0.45
    return useTransform(
      scrollYProgress,
      [wordStart, wordEnd],
      ['rgba(244, 241, 234, 0.3)', CREAM_FINAL]
    )
  })

  return (
    <p className="statement-text">
      {words.map((word, index) => (
        <span key={index}>
          <motion.span
            style={{ color: reduce ? CREAM_FINAL : wordColors[index] }}
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

function About() {
  const processRef = useRef(null)
  const statementRef = useRef(null)
  const philosophyRef = useRef(null)

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

  // PhotoSection1; Philosophy (moved from Home)
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
      <section className="about-hero section" data-assistant-section="about-overview">
        <div className="container">
          <div className="hero-split">
            <div className="hero-split-left">
              <motion.p
                className="label about-tagline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: ndsEase }}
              >
                Business + Build
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
                I work best when the business problem is still messy and someone needs to understand the work, shape a useful system, and get the first version moving.
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
                <span className="hero-meta-value">Business · Workflow · Product · Implementation</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Status</span>
                <span className="hero-meta-value hero-meta-status">Open to opportunities</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ BUILDER DOSSIER; colored squeeze ═══════ */}
      <SqueezeSection className="builder-dossier section" data-assistant-section="about-working-style">
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
            I can move between the person doing the work, the business decision behind it, and the system that could make it better.
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

      {/* ═══════ MY STORY; Editorial chronicle ═══════ */}
      <StoryChronicle />

      {/* ═══════ OPERATING THESIS; pinned word reveal ═══════ */}
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
                I want in on problems that matter.
              </StatementGiantText>
              <p className="statement-paragraph">
                A team with a high bar, a real product instinct, and the ambition to build things worth building.
              </p>
            </motion.div>
          </div>
        </SqueezeSection>
        </div>
      </div>

      {/* ═══════ ADOPTION STORY; the pre-AI proof ═══════ */}
      {/* NOTE (Gunnar): the middle paragraph is written from what the site already
          claims as verified (you built the reports and trained external sales teams
          on them). The characterisation of *why* adoption was hard is inference, not
          recorded fact. Replace it with what actually happened: how long it really
          took, what people resisted, and what finally moved it. That version will be
          both truer and more specific than this one. */}
      <section className="adoption-section section" data-assistant-section="about-adoption">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Adoption
          </motion.p>
          <motion.h2
            className="section-heading adoption-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: ndsEase }}
          >
            The closest thing I&rsquo;ve done to this job, before AI existed.
          </motion.h2>
          <motion.div
            className="adoption-body"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.p variants={staggerItem}>
              At Sub-Zero I built custom Power BI reporting tools for sales teams, and then had
              to get external dealers and reps to use them. The second part turned out
              to be the whole job.
            </motion.p>
            <motion.p variants={staggerItem}>
              Building the reports took less effort than changing how people accessed sales
              data. Everyone already had habits, existing
              spreadsheets, and no particular reason to trust something new from someone in a
              rotational program. Training people on the tools became most of the project.
            </motion.p>
            <motion.p variants={staggerItem}>
              The same failure mode appears with AI tools now. Model quality rarely stops a
              project. Adoption fails when the intended users quietly return to the old process.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CAPABILITIES; what I actually do ═══════ */}
      <SqueezeSection className="capabilities-section section" data-assistant-section="about-capabilities">
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
            Business judgment, working products, and implementation thinking.
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
      </SqueezeSection>

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

      {/* ═══════ LET'S WORK TOGETHER CTA; green squeeze panel ═══════ */}
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
              I'm looking for a team with a real operating problem, a high bar, and room for someone who can work across the business and the build.
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
