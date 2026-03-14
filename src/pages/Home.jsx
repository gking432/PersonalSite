import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import PokerTable from '../../PokerTable'
import PageTransition from '../components/PageTransition'
import './Home.css'

// ─── NDS EASING ───
const ndsEase = [0.22, 1, 0.36, 1]

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

// ─── ANIMATED NUMBER ───
function AnimatedNumber({ target, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return
    let startTime
    let animationFrame
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const linear = Math.min((currentTime - startTime) / (duration * 1000), 1)
      const progress = easeOut(linear)
      setCount(Math.floor(progress * target))
      if (progress < 1) animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
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

// ─── STAGGER VARIANTS ───
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.92 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.8, ease: ndsEase }
  }
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
  const { scrollYProgress } = useScroll()

  // Hero parallax
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroPerspective = useTransform(scrollYProgress, [0, 0.15], [0, 8])

  return (
    <PageTransition>
    <div className="home">
      <ScrollProgress />

      {/* ═══════ HERO ═══════ */}
      <motion.section
        className="hero"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="hero-grid-bg" />

        <div className="container">
          <div className="hero-content">
            <motion.p
              className="hero-label"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              Marketing Executive &middot; Product Manager &middot; AI Strategist
            </motion.p>

            <motion.div
              className="hero-title-wrapper"
              style={{ rotateX: heroPerspective, transformPerspective: 1200 }}
            >
              <AnimatedTitle text="Gunnar Neuman" />
            </motion.div>

            <motion.p
              className="hero-subheadline"
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.8, ease: ndsEase }}
            >
              From corporate marketing to founding my own consultancy to taking products from
              zero to one — I combine marketing leadership, product management, and AI to build what others just talk about.
            </motion.p>

            <motion.div
              className="hero-cta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: ndsEase }}
            >
              <Link to="/projects" className="btn btn-primary btn-magnetic">
                See What I've Built
                <span className="btn-arrow">&rarr;</span>
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get in Touch
              </Link>
            </motion.div>

            <motion.div
              className="scroll-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              <motion.div
                className="scroll-indicator-line"
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span>Scroll</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ═══════ STATS — SQUEEZE ═══════ */}
      <SqueezeSection className="stats-bar">
        <div className="container">
          <motion.div
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { target: 3, suffix: '+', label: 'Years Building' },
              { target: 5, suffix: '+', label: 'Products Launched' },
              { target: 100, suffix: '+', label: 'People Educated' },
            ].map((stat, i) => (
              <motion.div className="stat-item" key={i} variants={itemVariants}>
                <div className="stat-number">
                  <AnimatedNumber target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="stat-label-line" />
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SqueezeSection>

      {/* ═══════ APPROACH — EDITORIAL ═══════ */}
      <section className="approach">
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
            I find the gap between strategy and execution — then I close it.
          </motion.h2>
          <div className="approach-principles">
            {[
              {
                number: '01',
                title: 'See the system',
                desc: 'Markets, products, users — I map the full picture before making a move.'
              },
              {
                number: '02',
                title: 'Build, don\'t brief',
                desc: 'If I can prototype it, I will. Speed compounds when you eliminate handoffs.'
              },
              {
                number: '03',
                title: 'Measure what matters',
                desc: 'Vanity metrics are noise. I track the numbers that move the business.'
              }
            ].map((item, i) => (
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

      {/* ═══════ PHOTO SECTION 1 — SQUEEZE + PARALLAX ═══════ */}
      <PhotoSection
        sectionNumber={1}
        imageStyle={{
          backgroundColor: '#2d5016',
          backgroundImage: 'linear-gradient(135deg, #1a3a2e 0%, #2d5016 100%)'
        }}
        label="Philosophy"
        giantText="Curiosity plus execution equals capability"
        paragraph="I don't wait for permission to learn something new. When I wanted to understand crypto, I built a token launchpad. When I needed an interview prep tool, I built one with AI. Every project started the same way: I identified a problem, managed it from concept to launch, and shipped a real product."
      />

      <PokerTable slideFrom="right" />

      {/* ═══════ PHOTO SECTION 2 — SQUEEZE + PARALLAX ═══════ */}
      <PhotoSection
        sectionNumber={2}
        imageStyle={{
          backgroundColor: '#1e3a5f',
          backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #2d5278 100%)'
        }}
        label="Approach"
        giantText="Think big picture. Compartmentalize. Execute."
        paragraph="I see systems, not just tasks. Whether it's a product launch, a marketing campaign, or a new application—I break complex goals into clear deliverables and deliver them."
      />

      {/* ═══════ EXPERIENCE TIMELINE ═══════ */}
      <section className="background">
        <div className="container">
          <RevealSection className="timeline-header" direction="left">
            <p className="label">Experience</p>
            <h2 className="section-heading">Background</h2>
          </RevealSection>

          <div className="timeline">
            {[
              {
                year: '2020–2023',
                title: 'Sub-Zero Group, Inc.',
                role: 'Sales Rotational Program',
                desc: 'Inaugural candidate in 2.5-year program. Rotated through sales operations, product marketing, and dealer sales for luxury kitchen appliances. Trained teams on Power BI. Managed national product launches.',
                side: 'left'
              },
              {
                year: '2023–2025',
                title: 'Independent Work',
                role: 'Marketing Consultant & Product Manager',
                desc: 'Ran a marketing consultancy serving early-stage companies while independently taking multiple products from zero to one. Owned the full lifecycle — market research, roadmap, branding, development, and go-to-market — leveraging AI to move at startup speed.',
                side: 'right'
              },
              {
                year: '2026',
                title: 'Next Chapter',
                role: 'Marketing & Product Leadership',
                desc: 'Seeking leadership roles where marketing strategy, product thinking, and AI fluency converge. Ready to bring zero-to-one experience to a team building something that matters.',
                side: 'left'
              }
            ].map((item, i) => (
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
                  <h4>{item.title}</h4>
                  <p className="timeline-role">{item.role}</p>
                  <p>{item.desc}</p>
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
              I'm looking for a leadership role at a company that values marketing strategy,
              product thinking, and the leverage that AI brings. If that's you — let's talk.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
            >
              <Link to="/contact" className="btn btn-primary cta-btn">
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
