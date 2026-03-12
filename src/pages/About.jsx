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
  { number: '03', title: 'Ship', desc: 'Get it live, measure what happens, iterate fast. The work isn\'t done until it\'s performing.' },
]

function ProcessStep({ step, scrollYProgress, index, total }) {
  // Each step gets a third of the scroll range
  const segment = 1 / total
  const start = index * segment
  const center = start + segment * 0.5
  const end = start + segment

  // Cylinder rotation: rotate in from below (70deg), sit flat (0), rotate out above (-70deg)
  const rotateX = useTransform(
    scrollYProgress,
    [start, center - segment * 0.15, center, center + segment * 0.15, end],
    [70, 10, 0, -10, -70]
  )

  // Opacity: fade in, full, fade out
  const opacity = useTransform(
    scrollYProgress,
    [start, center - segment * 0.25, center, center + segment * 0.25, end],
    [0, 1, 1, 1, 0]
  )

  // Y translation to reinforce the cylinder feel
  const y = useTransform(
    scrollYProgress,
    [start, center, end],
    [80, 0, -80]
  )

  // Scale slightly smaller when rotated away
  const scale = useTransform(
    scrollYProgress,
    [start, center - segment * 0.2, center, center + segment * 0.2, end],
    [0.85, 0.98, 1, 0.98, 0.85]
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
              After beginning my career with Sub-Zero Group, Inc. I decided to take a chance on myself and began doing freelance marketing work.
              This bloomed into a small but legitimate agency. I instantly realized I loved the work of building brands, launching campaigns,
              designing websites, and sitting across the table from someone with an idea, trying to figure out how to make it real. Building was the thing.
              Not the deliverables, not being my own boss, but the process I had created. It was the brainstorming sessions, the strategy pivots, and the
              moment a client saw their vision take shape.
            </motion.p>
            <motion.p
              className="my-story-cut"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
            >
              Cut to Artificial Intelligence…
            </motion.p>

            {showFullStory && (
              <>
                <p>
                  As more and more AI tools became readily available and much, much cheaper (think one-click website builders, automated advertising
                  campaigns, instantaneous copy and creative for any product/service/idea/niche, etc.), you’d think my job would become easier and more
                  profitable, which was my initial thought as well.
                </p>
                <p>
                  However, it became increasingly clear that as costs lessened, so did my value; and what started as a marketing agency, almost overnight,
                  became a sales agency for tools built upon artificial intelligence. The worst part? These tools were absolutely faster, cheaper, and better
                  than what I was offering. Suddenly, instead of building, I was pitching cheap software, paying for services to sell to others, and racing
                  competitor agencies to the lowest price. The race to $0 is real, and it happened very, very quickly. As the margin on my core offerings
                  shrank by more than 80%, I had to take a step back to realize I was no longer growing; in fact, I was shrinking.
                </p>
                <p>
                  So I had to ask an honest question: What do I actually want to do?
                  The answer was obvious. I want to build, and I'd always wanted to build. Having an agency was always less about having an agency and more
                  about having a vehicle for the work I enjoyed: collaborating with people, solving real problems, and creating things that didn't exist before.
                </p>
                <p>
                  I had to pivot. I started reading about everything AI: LLMs, data centers, complex models, new companies, cooling processes, political angles,
                  energy consumption, AI psychosis (yes it’s real, and it’s shockingly common). I wrote research papers, blog posts, articles, and lectures.
                  I built my own tools with AI: a to-do list app for myself, a workout tracker, and a marathon prep application all designed specifically for me.
                  I then branched out and built a cryptocurrency token launchpad, an AI interview prep platform, and a cartography print studio. Each of these
                  projects complete with a full brand kit and customer acquisition strategy.
                </p>
                <p>
                  Through this process, I realized the skills I gathered while running an agency didn’t become less valuable, they were simply misaligned.
                  When you combine marketing strategy with the ability to actually build things, you stop guessing. You can test ideas, customize software,
                  launch products, experiment with positioning, and see what works in real time.
                </p>
                <p>
                  Now, some people may read this and say, “Well, anyone can do that stuff with AI.” So I’ll pose a question: could you do it? Right now, could
                  you build any of these things? Would you even know where to start? With enough time and practice, of course you could. But with enough time
                  and practice, I could do your job too. The difference is that I’ve already put in the time. I understand how these tools work, why they change
                  the economics of customer connection, and how companies can actually use them to build better products and reach consumers more effectively.
                </p>
                <p>
                  That perspective is why I’m interested in working with organizations that are serious about growth. Companies that don’t just want someone to
                  run campaigns, but someone who can think strategically about how ideas become products, how products become brands, and how brands become momentum.
                  All this to say, I'm not looking for just any opportunity, and I've already done the say yes to everything chapter. I'm looking for a company that's
                  serious about growth, eager for strategic thinkers, and values the kind of person who prefers to do something rather than talk about doing something.
                </p>
                <p>
                  If that sounds like your team, I'd like to hear about it. Whether that's a full-time role, a consulting engagement, or a speaking opportunity —
                  I'm open to the conversation. I just want to be in the room where things are getting built.
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
              {showFullStory ? 'Read less' : 'Read more'}
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
            <p className="label">Process</p>
            <h2 className="section-heading">How I Work</h2>
          </div>
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
      </section>

      {/* ═══════ STATEMENT MOMENT ═══════ */}
      <div ref={statementRef}>
        <SqueezeSection className="statement-section section">
          <motion.div
            className="statement-inner"
            style={{ y: statementY }}
          >
            <motion.p
              className="statement-text"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: ndsEase }}
            >
              I don't pitch ideas.<br />I ship them.
            </motion.p>
          </motion.div>
        </SqueezeSection>
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
