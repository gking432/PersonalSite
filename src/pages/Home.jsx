import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import PokerTable from '../../PokerTable'
import PageTransition from '../components/PageTransition'
import './Home.css'

// Number counter - NDS signature animation
function AnimatedNumber({ target, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return

    let startTime
    let animationFrame

    // NDS easeOut curve — fast start, smooth deceleration
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const linear = Math.min((currentTime - startTime) / (duration * 1000), 1)
      const progress = easeOut(linear)

      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// Giant text with progressive color word by word - always visible, just changes color
function GiantText({ children, scrollYProgress }) {
  // Always visible (opacity stays at 1)
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 1])
  
  // Split text into words
  const words = typeof children === 'string' ? children.split(' ') : [children]
  const totalWords = words.length
  
  // Create color transforms for each word (dark grey to white)
  // Spread words across 0% to 50% scroll progress
  const wordColors = words.map((_, index) => {
    const wordStart = 0 + (index / totalWords) * 0.45
    const wordEnd = 0.05 + (index / totalWords) * 0.45
    return useTransform(
      scrollYProgress, 
      [wordStart, wordEnd], 
      ['rgba(244, 241, 234, 0.4)', 'rgba(244, 241, 234, 1)']
    )
  })
  
  return (
    <motion.h2 
      className="giant-text"
      style={{ opacity }}
    >
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
    </motion.h2>
  )
}

// Typing animation component - scroll-based, reveals text character by character
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
        // Map scroll progress to character count
        const progress = (latest - startProgress) / (endProgress - startProgress)
        const chars = Math.min(Math.floor(progress * totalChars), totalChars)
        setVisibleChars(chars)
      }
    })
    
    // Set initial state
    const current = scrollYProgress.get()
    if (current < startProgress) {
      setVisibleChars(0)
    } else if (current >= endProgress) {
      setVisibleChars(totalChars)
    } else {
      const progress = (current - startProgress) / (endProgress - startProgress)
      const chars = Math.min(Math.floor(progress * totalChars), totalChars)
      setVisibleChars(chars)
    }
    
    return () => unsubscribe()
  }, [scrollYProgress, startProgress, endProgress, totalChars])
  
  return (
    <div className="photo-section-text-wrapper">
      <p className="photo-section-text-invisible" aria-hidden="true">
        {text}
      </p>
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

// Photo Section Component with coordinated animations
function PhotoSection({ sectionNumber, imageStyle, label, giantText, paragraph }) {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })
  
  // Label is always visible - no animation needed
  
  // Both animations happen at the same time
  // Giant text: 0.05 to 0.5 (5% to 50%)
  // Typing text: 0.15 to 0.65 (15% to 65%)
  const paragraphStart = 0.15
  const paragraphEnd = 0.65
  
  return (
    <section 
      ref={sectionRef}
      className={`photo-section photo-section-${sectionNumber}`}
    >
      <div className="photo-section-wrapper">
        <div 
          className="photo-section-image" 
          style={imageStyle}
        />
        <div className="photo-section-overlay" />
        <div className="container">
          <div className="photo-section-content">
            <p 
              className="subtitle"
              style={{ 
                color: 'rgba(244, 241, 234, 0.7)'
              }}
            >
              {label}
            </p>
            
            <GiantText scrollYProgress={scrollYProgress}>
              {giantText}
            </GiantText>
            
            <TypingText 
              text={paragraph}
              scrollYProgress={scrollYProgress}
              startProgress={paragraphStart}
              endProgress={paragraphEnd}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

function Home() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97])

  return (
    <PageTransition>
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="container">
          <div className="hero-content">
            <motion.h1 
              className="hero-headline"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Gunnar Neuman
            </motion.h1>
            
            <motion.p 
              className="hero-subheadline"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Marketing strategist who builds. I've driven campaigns for luxury brands, 
              launched blockchain apps, and taught AI literacy. Looking for the right 
              marketing leadership role.
            </motion.p>
            
            <motion.div 
              className="hero-cta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/projects" className="btn btn-primary">
                See What I've Built
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Bar - NDS Number Counters */}
      <motion.section 
        className="stats-bar"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedNumber target={3} suffix="+" />
              </div>
              <p className="stat-label">Years Building</p>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedNumber target={5} suffix="+" />
              </div>
              <p className="stat-label">Applications Shipped</p>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedNumber target={100} suffix="+" />
              </div>
              <p className="stat-label">Users Educated</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Capabilities - Card Grid */}
      <section className="capabilities">
        <div className="container">
          <motion.div 
            className="capabilities-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="capability-card" variants={itemVariants}>
              <h4>Marketing & Growth</h4>
              <p>
                Multi-channel campaigns driving customer acquisition. National product launches 
                at Sub-Zero. eCommerce sites that convert.
              </p>
            </motion.div>
            
            <motion.div className="capability-card" variants={itemVariants}>
              <h4>Building & Shipping</h4>
              <p>
                Blockchain token launcher. AI interview simulator. Productivity tools. 
                Comfortable with React, Python, APIs. I don't just strategize—I ship.
              </p>
            </motion.div>
            
            <motion.div className="capability-card" variants={itemVariants}>
              <h4>AI Applications</h4>
              <p>
                Daily AI user since ChatGPT launch. Created educational programs teaching 
                practical use. Not an expert—an observer who understands how people work.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Photo Section 1 - Giant Text Overlay + Supporting Text */}
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

      {/* Photo Section 2 - Giant Text + Supporting */}
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

      {/* Timeline - Prestige Section */}
      <section className="background">
        <div className="container">
          <motion.p 
            className="label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Experience
          </motion.p>
          
          <motion.h2
            className="section-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Background
          </motion.h2>
          
          <div className="timeline">
            <motion.div 
              className="timeline-item"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="timeline-year">2020-2023</span>
              <div className="timeline-content">
                <h4>Sub-Zero Group, Inc.</h4>
                <p className="timeline-role">Sales Rotational Program</p>
                <p>
                  Inaugural candidate in 2.5-year program rotating through sales operations, 
                  product marketing, and dealer sales for luxury kitchen appliances.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="timeline-item"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="timeline-year">2023-2025</span>
              <div className="timeline-content">
                <h4>Independent Work</h4>
                <p className="timeline-role">Client Marketing Manager</p>
                <p>
                  Drove acquisition campaigns for multiple clients. Designed and executed digital 
                  strategies. Built applications. Explored AI tools daily.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="timeline-item"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="timeline-year">2026</span>
              <div className="timeline-content">
                <h4>Looking for the right full-time role</h4>
                <p className="timeline-role">Next Chapter</p>
                <p>
                  Targeting marketing leadership positions (Director, CMO) with ambitious companies 
                  where I can build, strategize, and execute.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <motion.section 
        className="cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="container">
          <div className="cta-content">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              I'm looking for a marketing leadership role
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              I want to join a growing company where I can combine strategic thinking with 
              hands-on execution. If you're building something ambitious—let's talk.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/contact" className="btn btn-primary">
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
    </PageTransition>
  )
}

export default Home
