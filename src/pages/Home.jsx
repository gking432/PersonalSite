import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'


import PageTransition from '../components/PageTransition'
import HorizonJourney from '../components/HorizonJourney'
import BuilderNotebookHero from '../components/BuilderNotebookHero'
import './Home.css'

// ─── NDS EASING ───
const ndsEase = [0.22, 1, 0.36, 1]

const approachPrinciples = [
  {
    number: '01',
    title: 'Find the real problem',
    desc: 'I start with customer conversations, sales context, competitive research, and analytics so the work is aimed at behavior, not vibes.'
  },
  {
    number: '02',
    title: 'Build a testable version',
    desc: 'I turn positioning, pricing, and product ideas into working prototypes quickly enough to learn from something real.'
  },
  {
    number: '03',
    title: 'Connect it to traction',
    desc: 'Launch only counts when the market can respond. SEO, paid media, content, eCommerce, and reporting all serve that feedback loop.'
  }
]

const resumeHighlights = [
  {
    value: '0 to 1',
    label: 'Product Development',
    detail: 'MoveMint, Terralis Print Studio, interview practice, and dashboard concepts moved from rough idea to working product surfaces.'
  },
  {
    value: 'Full-cycle',
    label: 'Client Strategy',
    detail: 'Discovery, strategy, execution, reporting, and iteration across websites, acquisition campaigns, and conversion work.'
  },
  {
    value: '2.5 yrs',
    label: 'Rotational Training',
    detail: 'Sales operations, product marketing, launches, showroom sales, and dealer sales inside a premium brand.'
  },
  {
    value: 'GTM',
    label: 'Role Fit',
    detail: 'Product marketing, growth, or operator roles that need someone comfortable between the customer, the market, and the build.'
  }
]

const resumeTimeline = [
  {
    year: 'Oct 2025-Present',
    title: 'GunnarNeuman.com',
    role: 'Product Developer',
    location: 'Milwaukee, WI',
    desc: 'Created and launched early-stage products while sharpening a product direction around customer problems, launch mechanics, and measurable growth.',
    bullets: [
      'Built prototypes with AI-assisted development workflows, React, and TypeScript.',
      'Explored concepts including an interview simulation app, MoveMint token launcher, Terralis Print Studio, and productivity dashboard.',
      'Evaluated customer problems, pricing structures, positioning, and launch potential across software, commerce, and media concepts.',
      'Developed hands-on fluency with Claude Code, Cursor, Codex, and modern development stacks.'
    ],
    tags: ['React', 'TypeScript', 'Prototyping', 'Product Strategy'],
    side: 'left'
  },
  {
    year: 'Mar 2023-Oct 2025',
    title: 'TouchPoint Marketing Solutions',
    role: 'Founder',
    location: 'Denver, CO',
    desc: 'Managed the full client lifecycle across strategy, execution, reporting, and optimization for businesses looking to turn marketing spend into measurable outcomes.',
    bullets: [
      'Owned discovery, strategy, campaign execution, reporting, and ongoing client optimization.',
      'Drove acquisition through SEO, paid advertising, content strategy, eCommerce improvements, and conversion-focused campaigns.',
      'Managed digital, audio, traditional, relational, and direct mail channels depending on the client problem.',
      'Used Google Analytics and campaign reporting to refine strategy, communicate ROI, and guide budget decisions.'
    ],
    tags: ['Customer Acquisition', 'Analytics', 'SEO', 'Paid Media'],
    side: 'right'
  },
  {
    year: 'Jun 2020-Feb 2023',
    title: 'Sub-Zero Group, Inc.',
    role: 'Sales Rotational Program',
    location: 'Madison, WI',
    desc: 'Selected as the inaugural candidate for a 2.5-year rotational program across sales operations, product marketing, product launch, showroom sales, and dealer sales.',
    bullets: [
      'Supported product positioning and launch execution through competitive research, naming, imagery, copy, and sales materials.',
      'Trained external sales teams on custom Power BI reports, improving access to sales insights and data-informed decisions.',
      'Delivered luxury showroom sales experiences and helped customers evaluate product fit, design choices, and full kitchen packages.',
      'Supported dealer relationships through training, sales materials, product knowledge, and market-facing support.'
    ],
    tags: ['Product Marketing', 'Launches', 'Power BI', 'Premium Brand'],
    side: 'left'
  }
]

// ─── SCROLL PROGRESS INDICATOR ───
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div className="scroll-progress" style={{ scaleY }} />
  )
}

// ─── SQUEEZE SECTION — NDS SIGNATURE ───
// Squeeze starts as soon as the top ~15% of the section is visible on screen.
function SqueezeSection({ children, className, as: Tag = 'section' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.15"]
  })

  // Squeeze begins immediately (0) and is fully squeezed by the time the
  // top of the section reaches ~15% from the top of the viewport.
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 0.88])
  const rawRadius = useTransform(scrollYProgress, [0, 1], [0, 24])

  const scale = useSpring(rawScale, { stiffness: 120, damping: 30 })
  const borderRadius = useSpring(rawRadius, { stiffness: 120, damping: 30 })

  return (
    <div ref={ref} className="squeeze-wrapper">
      <motion.div
        className={`squeeze-inner ${className || ''}`}
        style={{ scale, borderRadius }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ─── GIANT TEXT (word-by-word color reveal on scroll) ───
function GiantText({ children, scrollYProgress }) {
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
    <h2 className="giant-text">
      {words.map((word, index) => (
        <motion.span
          key={index}
          style={{ color: wordColors[index] }}
          className="giant-text-word"
        >
          {word}
          {index < words.length - 1 && ' '}
        </motion.span>
      ))}
    </h2>
  )
}

// ─── TYPING TEXT (scroll-driven) ───
function TypingText({ text, scrollYProgress, startProgress = 0.2, endProgress = 0.8 }) {
  const [visibleChars, setVisibleChars] = useState(0)
  const totalChars = text.length

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < startProgress) {
        setVisibleChars(0)
      } else if (latest >= endProgress) {
        setVisibleChars(totalChars)
      } else {
        const progress = (latest - startProgress) / (endProgress - startProgress)
        setVisibleChars(Math.min(Math.floor(progress * totalChars), totalChars))
      }
    })

    const current = scrollYProgress.get()
    if (current < startProgress) setVisibleChars(0)
    else if (current >= endProgress) setVisibleChars(totalChars)
    else {
      const progress = (current - startProgress) / (endProgress - startProgress)
      setVisibleChars(Math.min(Math.floor(progress * totalChars), totalChars))
    }

    return () => unsubscribe()
  }, [scrollYProgress, startProgress, endProgress, totalChars])

  return (
    <div className="photo-section-text-wrapper">
      <p className="photo-section-text-invisible" aria-hidden="true">{text}</p>
      <p className="photo-section-text">
        {text.slice(0, visibleChars)}
        {visibleChars < totalChars && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            style={{ display: 'inline-block' }}
          >
            |
          </motion.span>
        )}
      </p>
    </div>
  )
}

// ─── PHOTO SECTION (squeeze + parallax + scroll text) ───
function PhotoSection({ sectionNumber, imageStyle, label, giantText, paragraph }) {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  // Squeeze: starts as soon as section top is ~15% visible
  const squeezeRef = useRef(null)
  const { scrollYProgress: squeezeProgress } = useScroll({
    target: squeezeRef,
    offset: ["start 0.85", "start 0.15"]
  })

  const rawSqueezeScale = useTransform(squeezeProgress, [0, 1], [1, 0.88])
  const rawSqueezeRadius = useTransform(squeezeProgress, [0, 1], [0, 24])
  const squeezeScale = useSpring(rawSqueezeScale, { stiffness: 120, damping: 30 })
  const squeezeBorderRadius = useSpring(rawSqueezeRadius, { stiffness: 120, damping: 30 })

  // Parallax: background moves slower
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section
      ref={squeezeRef}
      className={`photo-section photo-section-${sectionNumber}`}
    >
      <div ref={sectionRef} className="photo-section-scroll-runway">
        <motion.div
          className="photo-section-wrapper"
          style={{ scale: squeezeScale, borderRadius: squeezeBorderRadius }}
        >
          <motion.div
            className="photo-section-image"
            style={{ ...imageStyle, y: bgY, scale: bgScale }}
          />
          <div className="photo-section-overlay" />
          <div className="container">
            <div className="photo-section-content">
              <p className="subtitle" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>
                {label}
              </p>
              <GiantText scrollYProgress={scrollYProgress}>{giantText}</GiantText>
              <TypingText
                text={paragraph}
                scrollYProgress={scrollYProgress}
                startProgress={0.15}
                endProgress={0.65}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── REVEAL SECTION (clip-path wipe) ───
function RevealSection({ children, className, direction = 'bottom' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-15%" })

  const clipPaths = {
    bottom: { hidden: 'inset(100% 0 0 0)', visible: 'inset(0 0 0 0)' },
    top: { hidden: 'inset(0 0 100% 0)', visible: 'inset(0 0 0 0)' },
    left: { hidden: 'inset(0 100% 0 0)', visible: 'inset(0 0 0 0)' },
    right: { hidden: 'inset(0 0 0 100%)', visible: 'inset(0 0 0 0)' },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: clipPaths[direction].hidden, opacity: 0 }}
      animate={isInView ? { clipPath: clipPaths[direction].visible, opacity: 1 } : {}}
      transition={{ duration: 1.2, ease: ndsEase }}
    >
      {children}
    </motion.div>
  )
}

// ─── HERO LETTER ANIMATION ───
function AnimatedTitle({ text }) {
  const letters = text.split('')

  return (
    <motion.h1
      className="hero-headline"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } }
      }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="hero-letter"
          variants={{
            hidden: { opacity: 0, y: 80, rotateX: -90, scale: 0.5 },
            visible: {
              opacity: 1, y: 0, rotateX: 0, scale: 1,
              transition: { duration: 0.8, ease: ndsEase }
            }
          }}
          style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  )
}

// ═══════════════════════════════════════════
// HOME COMPONENT
// ═══════════════════════════════════════════
function Home() {
  return (
    <PageTransition>
    <div className="home">
      <ScrollProgress />

      {/* ═══════ HERO ═══════ */}
      <BuilderNotebookHero />

      {/* ═══════ APPROACH — EDITORIAL ═══════ */}
      <section className="approach" id="approach">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Approach
          </motion.p>
          <motion.h2
            className="approach-statement"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: ndsEase }}
          >
            I help ideas survive contact with customers, markets, and the build itself.
          </motion.h2>
          <div className="approach-principles">
            {approachPrinciples.map((item, i) => (
              <motion.div
                key={i}
                className="approach-principle"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: ndsEase }}
              >
                <span className="approach-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HORIZON JOURNEY — Full day-cycle scroll experience ═══════ */}
      <div className="home-anchor" id="builds">
        <HorizonJourney />
      </div>

      {/* ═══════ EXPERIENCE TIMELINE ═══════ */}
      <section className="background" id="background">
        <div className="container">
          <div className="timeline-header">
            <motion.p
              className="label"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: ndsEase }}
            >
              Resume
            </motion.p>
            <motion.h2
              className="section-heading"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: ndsEase }}
            >
              Built across product, growth, and market execution.
            </motion.h2>
            <motion.p
              className="timeline-summary"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.18, ease: ndsEase }}
            >
              I have worked across premium product marketing, client acquisition,
              eCommerce, software prototypes, and early-stage launch strategy. I fit
              teams that need someone who can understand the customer, shape the offer,
              build the first version, and keep the work tied to growth.
            </motion.p>
            <div className="resume-highlights">
              {resumeHighlights.map((item, i) => (
                <motion.div
                  className="resume-highlight"
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: ndsEase }}
                >
                  <span className="resume-highlight-value">{item.value}</span>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="timeline">
            {resumeTimeline.map((item, i) => (
              <motion.div
                key={i}
                className={`timeline-item timeline-${item.side}`}
                initial={{ opacity: 0, x: item.side === 'left' ? -80 : 80, rotateY: item.side === 'left' ? -15 : 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.9, ease: ndsEase, delay: i * 0.15 }}
              >
                <span className="timeline-year">{item.year}</span>
                <div className="timeline-content">
                  <div className="timeline-content-header">
                    <div>
                      <h4>{item.title}</h4>
                      <p className="timeline-role">{item.role}</p>
                    </div>
                    <span className="timeline-location">{item.location}</span>
                  </div>
                  <p>{item.desc}</p>
                  <ul className="timeline-bullets">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="timeline-tags">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA — SQUEEZE ═══════ */}
      <SqueezeSection className="cta">
        <div className="container">
          <div className="cta-content">
            <motion.h2
              initial={{ opacity: 0, scale: 0.85, y: 60 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, ease: ndsEase }}
            >
              Let's build something.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: ndsEase }}
            >
              I'm looking for a team with a real problem, a high bar, and the patience to
              build something useful. If that sounds like your world, let's talk.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
            >
              <Link to="/contact" className="btn btn-primary btn-lg">
                Get in Touch
                <span className="btn-arrow">&rarr;</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Home
