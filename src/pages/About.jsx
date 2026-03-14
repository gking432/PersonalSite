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
                className="label about-tagline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: ndsEase }}
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
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: ndsEase }}
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
              My career has lived at the intersection of marketing, product, and emerging technology. I take ideas from zero to one and figure out how to capture their audience. I'm a marketer who builds things.
            </motion.p>

            <p>
              I started my career with Sub-Zero Group, Inc. in a rotating program that took me through sales operations, product marketing, product launch, and external dealer sales. It was a masterclass in how premium brands are built and maintained at scale. I saw firsthand how product ideas sweep through markets, how distribution works on a national level, and how marketing, sales, and product must align for a brand to thrive.
            </p>
            <p>
              Working inside a company functioning at the highest level gave me an appreciation for the operational side of growth; how strategy translates into real revenue through sales teams, distribution networks, and a disciplined brand/product relationship.
            </p>
            <p>
              As the rotational program came to an end, I decided to take a risk and bet on myself.
            </p>

            {showFullStory && (
              <>
                <p>
                  I started doing freelance marketing work, which turned into a small but legitimate agency. I found myself sitting across the table from aspiring entrepreneurs, trying to figure out how to bring their ideas to life. We'd talk branding, campaigns, websites, and customer acquisition, always eager to start something new.
                </p>
                <p>
                  That was the first time I realized what kind of work I actually love.
                </p>
                <p>
                  It wasn't the deliverables. It wasn't being my own boss. It was building.
                </p>
                <p>
                  The brainstorming sessions, the strategy pivots, and the moment a client saw their idea start to take shape made all the late nights, repetitive designs, and cold calls worth it. I love taking something from zero to one.
                </p>
                <p>
                  Running my agency forced me to learn the full stack of marketing in a way traditional roles rarely require. Operating in that world gave me strong instincts about what actually drives growth and what is just noise.
                </p>
                <p>
                  Then AI arrived.
                </p>
                <p>
                  As more AI tools became widely available and dramatically cheaper, it initially felt like a gift to the industry.
                </p>
                <p>
                  For me, it was the opposite.
                </p>
                <p>
                  Almost overnight, what had been a marketing business became a sales operation for AI tools. Anybody could generate basic websites, good-enough copy, and sloppy (but cheap) creative in a matter of minutes. I was now in a race with other agencies to the lowest price, and the margins on my core offerings dropped by more than 80%. This wasn't a winning strategy long-term as AI was changing the economics and behaviors of the entire industry faster than I was able to adapt.
                </p>
                <p>
                  This led me to a new way of thinking about modern marketing: in a world where AI makes everyone fast, quality becomes the real lever. The winners won't be those producing the most content or running the most campaigns. The winners will possess the judgment to know what's worth building and have the ability to execute above the noise.
                </p>
                <p>
                  So I went deep into AI, aiming to understand the ecosystem behind this new tech. Large language models, data infrastructure, emerging companies, the economics of compute, energy consumption, the adoption cycle, psychological side effects, and political concerns were all areas I wanted to explore.
                </p>
                <p>
                  I wrote research papers, articles, and lectures on these topics. More importantly, I started building with the use of AI. I created a cartography print studio, a cryptocurrency launchpad, and an AI-powered interview platform.
                  I treated each project like a product with hours of market research, positioning, brand development, product design, and a launch strategy.
                </p>
                <p>
                  Today, AI is part of how I operate. I use it daily, write about it, speak on it, and build with it. However, the core of what I do hasn't changed. I take ideas from zero to one and figure out how to get them in front of people.
                  I can build the landing page, write the positioning, design the brand, structure the campaign, and set up the analytics. I don't need to do it all myself (I'd prefer not to), but understanding every layer makes me better at leading the people responsible for them.
                </p>
                <p>
                  I'm looking for a team that values strategic thinking, bias toward action, and the ambition to build something that matters. If that sounds like your team, I'd love to hear from you.
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
                <span className="hero-meta-value">Marketing · Product · AI</span>
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
              <StatementGiantText scrollYProgress={statementTextScroll} lineBreakAfter={2}>
                Zero to one. That's the job.
              </StatementGiantText>
              <p className="statement-paragraph">
                Marketing strategy, product ownership, and AI — not as separate disciplines, but as one integrated approach to building things that matter.
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
