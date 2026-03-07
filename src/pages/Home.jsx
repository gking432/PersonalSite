import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useEffect, useState, useCallback } from 'react'
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

// ─── 3D TILT CARD ───
function TiltCard({ children, className, style }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-12, 12])

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100])
  const glareOpacity = useMotionValue(0)

  const handleMouse = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect()
    const centerX = (e.clientX - rect.left) / rect.width - 0.5
    const centerY = (e.clientY - rect.top) / rect.height - 0.5
    x.set(centerX)
    y.set(centerY)
    glareOpacity.set(0.15)
  }, [x, y, glareOpacity])

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    glareOpacity.set(0)
  }, [x, y, glareOpacity])

  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className || ''}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div className="tilt-card-inner" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
      <motion.div
        className="tilt-card-glare"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.25), transparent 60%)`
          ),
          opacity: glareOpacity,
        }}
      />
    </motion.div>
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

  // Horizontal scroll for capabilities
  const horizontalRef = useRef(null)
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalRef,
    offset: ["start start", "end end"]
  })
  const horizontalX = useTransform(horizontalProgress, [0, 0.85], ["2%", "-62%"])
  const horizontalOpacity = useTransform(horizontalProgress, [0, 0.08, 0.9, 1], [0.5, 1, 1, 0.5])

  // Capabilities squeeze — starts immediately, fully squeezed by ~20% through
  const rawCapScale = useTransform(horizontalProgress, [0, 0.2], [1, 0.88])
  const rawCapRadius = useTransform(horizontalProgress, [0, 0.2], [0, 24])
  const capSqueezeScale = useSpring(rawCapScale, { stiffness: 120, damping: 30 })
  const capSqueezeRadius = useSpring(rawCapRadius, { stiffness: 120, damping: 30 })

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
              Marketing Leader &middot; Builder &middot; AI Practitioner
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
              I don't pitch ideas — I ship them. Three years building at the intersection
              of marketing, technology, and AI. Midwest work ethic. Real results.
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
              { target: 5, suffix: '+', label: 'Products Shipped' },
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

      {/* ═══════ CAPABILITIES — SQUEEZE + HORIZONTAL SCROLL ═══════ */}
      <section ref={horizontalRef} className="capabilities-scroll-container">
        <motion.div
          className="capabilities-sticky"
          style={{ scale: capSqueezeScale, borderRadius: capSqueezeRadius }}
        >
          <motion.div className="capabilities-track" style={{ x: horizontalX, opacity: horizontalOpacity }}>

            <div className="capability-header-card">
              <p className="label">What I Do</p>
              <h2 className="section-heading">Capabilities</h2>
              <p className="capability-header-desc">
                Not a specialist. A full-stack marketing leader who builds.
              </p>
            </div>

            <TiltCard className="capability-card-3d">
              <div className="capability-card-number">01</div>
              <h3>Growth Engine</h3>
              <p>
                National campaigns for Sub-Zero. Acquisition strategies that convert.
                I've seen what moves the needle at scale — and I've done it myself.
              </p>
              <div className="capability-card-tags">
                <span>Campaigns</span>
                <span>eCommerce</span>
                <span>Analytics</span>
              </div>
            </TiltCard>

            <TiltCard className="capability-card-3d">
              <div className="capability-card-number">02</div>
              <h3>Builder</h3>
              <p>
                Blockchain token launcher. AI interview platform. Productivity tools.
                I don't wait for engineering — I am engineering.
              </p>
              <div className="capability-card-tags">
                <span>React</span>
                <span>Python</span>
                <span>APIs</span>
              </div>
            </TiltCard>

            <TiltCard className="capability-card-3d">
              <div className="capability-card-number">03</div>
              <h3>AI Practitioner</h3>
              <p>
                Daily user since day one. Created education programs teaching real
                workflows to real people. Not hype — utility.
              </p>
              <div className="capability-card-tags">
                <span>AI Tools</span>
                <span>Education</span>
                <span>Workflow</span>
              </div>
            </TiltCard>

          </motion.div>
        </motion.div>
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
        paragraph="I don't wait for permission to learn something new. When I wanted to understand blockchain, I built a token launcher. When I saw AI transforming how people work, I created a lecture series. The last three years weren't a gap—they were deliberate exploration."
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
        paragraph="I see systems, not just tasks. Whether it's a product launch, a marketing campaign, or a new application—I break complex goals into clear deliverables and ship them."
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
                role: 'Builder & Client Marketing Manager',
                desc: 'Drove acquisition campaigns for multiple clients. Built blockchain and AI applications. Designed digital strategies. Taught AI literacy. Moved from doing the work → outsourcing → strategic management.',
                side: 'right'
              },
              {
                year: '2026',
                title: 'Next Chapter',
                role: 'Marketing Leadership',
                desc: 'Targeting Director or CMO roles with ambitious companies where I can combine strategic thinking with hands-on execution. Ready to build something that matters.',
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
              I'm looking for a marketing leadership role at a company that values
              craft, speed, and substance. If that's you — let's talk.
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
