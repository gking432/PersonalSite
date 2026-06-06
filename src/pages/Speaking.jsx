import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Speaking.css'

const ndsEase = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ndsEase } }
}

const briefingModules = [
  {
    title: 'Executive Briefing: Technology Without Theater',
    format: '45-75 minute talk',
    description: 'A practical briefing for teams trying to separate durable technology shifts from noise, with emphasis on customer behavior, operating leverage, and the new quality bar.',
    outcomes: [
      'Separate durable technology shifts from hype cycles',
      'Understand where AI and automation create practical leverage',
      'Identify the customer behaviors most likely to change',
      'Leave with a sharper vocabulary for strategic decisions'
    ],
    audience: 'Leadership teams, marketing teams, operators, founders'
  },
  {
    title: 'Operator Workshop: Build the First Useful Tool',
    format: 'Half-day hands-on workshop',
    description: 'A working session for teams that want to leave with a first useful prototype, workflow map, or decision surface instead of another abstract discussion.',
    outcomes: [
      'Map one high-friction workflow in the business',
      'Design a lightweight tool around real constraints',
      'Prototype a first version with modern builder workflows',
      'Define the measurement plan and next iteration'
    ],
    audience: 'Marketing, sales, operations, and product teams'
  }
]

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className={`faq-item ${isOpen ? 'is-open' : ''}`}
      variants={staggerItem}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="faq-question">
        <h3>{question}</h3>
        <span className="faq-toggle">{isOpen ? '\u2212' : '+'}</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: ndsEase }}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Speaking() {
  const faqs = [
    { q: "Is this only about AI?", a: "No. AI is part of the conversation, but the real focus is what technology changes for customers, teams, cost structures, quality, and launch decisions." },
    { q: "Do teams need technical knowledge?", a: "No. These sessions are built for operators, marketers, founders, and business teams. Technical ideas get translated into decisions and workflows." },
    { q: "Can this be customized?", a: "Yes. The best version starts with your actual customer, workflow, market, or strategic decision." },
    { q: "Can workshops produce something tangible?", a: "Yes. For hands-on sessions, the goal is to leave with a first useful prototype, workflow map, or decision framework." },
  ]

  return (
    <PageTransition>
    <div className="speaking">
      <section className="speaking-hero section">
        <div className="container">
          <div className="hero-split">
            <div className="hero-split-left">
              <motion.p
                className="label"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: ndsEase }}
              >
                Speaking
              </motion.p>
              <h1>
                {'The Briefing Room'.split(' ').map((word, i, words) => (
                  <motion.span
                    key={i}
                    style={{ display: 'inline-block' }}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ndsEase }}
                  >
                    {word}{i < words.length - 1 ? '\u00a0' : ''}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className="speaking-subtitle"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                Practical talks and workshops for teams trying to understand what technology changes, what still matters, and what to build next.
              </motion.p>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Formats</span>
                <span className="hero-meta-value">Briefings & workshops</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Audience</span>
                <span className="hero-meta-value">Operators, marketers, founders</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Focus</span>
                <span className="hero-meta-value">Technology, behavior, leverage</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Output</span>
                <span className="hero-meta-value hero-meta-status">Shared decisions</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {briefingModules.map((module, index) => {
        const content = (
          <div className="container">
            <motion.div
              className="lecture-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              <div className="lecture-header">
                <h2>{module.title}</h2>
                <div className="lecture-thumbnail">
                  <div className="thumbnail-placeholder">{index === 0 ? 'Briefing' : 'Workshop'}</div>
                </div>
              </div>
              <div className="lecture-content">
                <div className="lecture-meta">
                  <span className="duration">{module.format}</span>
                </div>
                <div className="lecture-section-content">
                  <h3>What It Is</h3>
                  <p>{module.description}</p>
                </div>
                <div className="lecture-section-content">
                  <h3>What The Team Leaves With</h3>
                  <ul className="learning-list">
                    {module.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div className="lecture-section-content">
                  <h3>Who It's For</h3>
                  <p>{module.audience}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )

        return index === 0 ? (
          <section className="lecture-section section" key={module.title}>
            {content}
          </section>
        ) : (
          <SqueezeSection className="lecture-section section alt" key={module.title}>
            {content}
          </SqueezeSection>
        )
      })}

      {/* Booking Section — Squeezed (green bg) */}
      <SqueezeSection className="booking-section section">
        <div className="container">
          <div className="booking-content">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: ndsEase }}
            >
              Need a sharper read on what technology means for your team?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: ndsEase }}
            >
              I can shape the session around your market, customer, workflow, or the decision your team needs to make next.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: ndsEase }}
            >
              <Link to="/contact" className="btn btn-primary">
                Request Booking
              </Link>
            </motion.div>
          </div>
        </div>
      </SqueezeSection>

      {/* FAQ Section — Squeezed */}
      <SqueezeSection className="faq-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div
            className="faq-list"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </motion.div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Speaking
