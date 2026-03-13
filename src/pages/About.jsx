import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './About.css'

const ndsEase = [0.22, 1, 0.36, 1]

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
  { number: '01', title: 'Understand', desc: 'Sit across the table. Learn the business, the audience, the constraints. Strategy without context is just guessing.' },
  { number: '02', title: 'Build', desc: 'Design it, code it, launch it. No handoffs to wonder about — I go from concept to working product.' },
  { number: '03', title: 'Deliver', desc: 'Get it live, measure what happens, iterate fast. The work isn\'t done until it\'s performing.' },
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

function About() {
  const [showFullStory, setShowFullStory] = useState(false)
  const processRef = useRef(null)
  const statementRef = useRef(null)

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

  return (
    <PageTransition>
    <div className="about">
      <section className="about-hero section">
        <div className="container">
          <div className="hero-split">
            <div className="hero-split-left">
              <motion.p
                className="label"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: ndsEase }}
              >
                About
              </motion.p>
              <h1>
                {'My Story'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    style={{ display: 'inline-block' }}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: ndsEase }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
            <motion.p
              className="about-intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: ndsEase }}
            >
              I started my career at Sub-Zero Group, Inc., where I rotated through sales operations, product marketing, and dealer sales — learning how
              premium brands are built and maintained at scale. After that, I did what a lot of marketers talk about but few actually do: I went out on
              my own. I started a marketing consultancy, working with early-stage companies on branding, digital strategy, and customer acquisition. I sat
              across the table from founders with ideas and figured out how to make those ideas real. That's when I discovered what I actually cared about.
              Not the title, not being my own boss — but <em>building</em>.
            </motion.p>

            {showFullStory && (
              <>
                <p>
                  Running my own shop taught me everything a corporate role never could. I handled strategy, creative, client management, and execution —
                  simultaneously, with no safety net. I learned how to scope work, manage expectations, and deliver under constraints that would make most
                  agency teams blink. More importantly, I learned what happens when you're the one responsible for every outcome, not just one piece of the funnel.
                </p>
                <p>
                  As the marketing landscape evolved, I realized I wanted to get closer to the product side of the work. I didn't just want to market things — I wanted
                  to build them. So I started building. A cryptocurrency token launchpad with full go-to-market strategy. An AI-powered interview prep platform. A
                  cartography print studio. Each one a complete product: brand identity, positioning, development, and acquisition strategy, all done by me.
                </p>
                <p>
                  That range is the point. I'm a marketing leader who can go from whiteboard to working product. I can build the landing page, write the copy,
                  design the brand, set up the analytics, and launch the campaign — not because I <em>have</em> to, but because understanding every layer makes me
                  better at leading the ones I delegate. I've spent years learning modern tools, including AI, not as a novelty but because they fundamentally
                  change how fast a small team can move. I treat them the way a good carpenter treats power tools: they don't replace the craft, they accelerate it.
                </p>
                <p>
                  The through-line of my career has always been the same: take something from zero to one. Whether that's a client's first website, a product idea
                  that didn't exist yesterday, or a brand that needs to find its audience — I'm at my best when I'm building from scratch and figuring it out as I go.
                </p>
                <p>
                  Now I'm looking for the right team. A company that's serious about growth and wants a marketing leader who doesn't just think strategically but
                  executes on it — someone who understands how ideas become products, how products find customers, and how to build momentum without burning budget on
                  guesswork. I've done the solo chapter. I'm ready to bring everything I've learned to a team that's building something worth building.
                </p>
                <p>
                  Whether that's a leadership role, a consulting engagement, or something I haven't considered yet — I'm open to the conversation.
                  I just want to be in the room where things are getting built.
                </p>
              </>
            )}
            <motion.button
              type="button"
              className="my-story-toggle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: ndsEase }}
              onClick={() => setShowFullStory(prev => !prev)}
            >
              {showFullStory ? 'Show less' : 'Read more'}
            </motion.button>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Location</span>
                <span className="hero-meta-value">Madison, WI</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Education</span>
                <span className="hero-meta-value">BBA, UW-Milwaukee</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Focus</span>
                <span className="hero-meta-value">Marketing + Technology</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Status</span>
                <span className="hero-meta-value hero-meta-status">Open to opportunities</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
              <StatementGiantText scrollYProgress={statementTextScroll} lineBreakAfter={1}>
                Build. Measure. Iterate.
              </StatementGiantText>
              <p className="statement-paragraph">
                Strategy meets execution. No handoffs. No guessing. Just the work of making ideas real.
              </p>
            </motion.div>
          </div>
        </SqueezeSection>
        </div>
      </div>

      {/* ═══════ TOOLKIT MARQUEE ═══════ */}
      <section className="toolkit-section section">
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
              Let's Work Together
            </motion.h2>
            <motion.p className="cta-sub" variants={fadeUp}>
              Looking for someone who can think strategically and build what they envision? Let's talk.
            </motion.p>
            <motion.a
              href="mailto:gking432@gmail.com"
              className="cta-button"
              variants={fadeUp}
            >
              Get In Touch
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
    </PageTransition>
  )
}

export default About
