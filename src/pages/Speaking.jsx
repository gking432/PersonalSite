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
    { q: "Do I need technical knowledge?", a: "No. These lectures are designed for everyday users and business professionals, not computer scientists." },
    { q: "Will I get the slides/materials?", a: "Yes. All materials, slides, and resources are included with your purchase." },
    { q: "Can I get a refund?", a: "Refund policy details will be provided at checkout. We want you to be satisfied with your purchase." },
    { q: "Do you do custom workshops?", a: "Yes! Contact me to discuss custom workshops tailored to your organization's needs." },
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
                {'AI for Everyday Users'.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    style={{ display: 'inline-block', marginRight: '0.25em' }}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ndsEase }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className="speaking-subtitle"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                I'm not a computer scientist—I'm an observer, user, and translator. I help normal people understand what AI means for their lives and businesses.
              </motion.p>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Lectures</span>
                <span className="hero-meta-value">2 Available</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Format</span>
                <span className="hero-meta-value">Virtual, In-Person, Download</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Audience</span>
                <span className="hero-meta-value">Everyday users & businesses</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Custom</span>
                <span className="hero-meta-value hero-meta-status">Workshops available</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lecture 1 */}
      <section className="lecture-section section">
        <div className="container">
          <motion.div
            className="lecture-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            <div className="lecture-header">
              <h2>Lecture 1: AI Basics for Everyday Users</h2>
              <div className="lecture-thumbnail">
                <div className="thumbnail-placeholder">AI Basics</div>
              </div>
            </div>
            <div className="lecture-content">
              <div className="lecture-meta">
                <span className="duration">Duration: ~90 minutes</span>
              </div>
              <div className="lecture-section-content">
                <h3>What You'll Learn</h3>
                <ul className="learning-list">
                  <li>What AI actually is (and isn't)</li>
                  <li>What LLMs can do exceptionally well</li>
                  <li>Critical limitations and dangers</li>
                  <li>How to use AI responsibly</li>
                  <li>Real-world examples you can use immediately</li>
                </ul>
              </div>
              <div className="lecture-section-content">
                <h3>Who It's For</h3>
                <p>Anyone curious about AI, parents concerned about their kids, professionals wanting to understand the tool</p>
              </div>
              <div className="pricing-section">
                <h3>Pricing</h3>
                <motion.div
                  className="pricing-tiers"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <motion.div className="pricing-tier" variants={staggerItem}>
                    <div className="tier-name">Virtual Live Event</div>
                    <div className="tier-price">$7<span className="tier-cents">.49</span></div>
                    <div className="tier-note">Includes Q&A session</div>
                  </motion.div>
                  <motion.div className="pricing-tier" variants={staggerItem}>
                    <div className="tier-name">Download Only</div>
                    <div className="tier-price">$2<span className="tier-cents">.99</span></div>
                    <div className="tier-note">Video + slide deck</div>
                  </motion.div>
                  <motion.div className="pricing-tier" variants={staggerItem}>
                    <div className="tier-name">In-Person</div>
                    <div className="tier-price">$24<span className="tier-cents">.99</span></div>
                    <div className="tier-note">When available</div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lecture 2 — Squeezed (alt bg) */}
      <SqueezeSection className="lecture-section section alt">
        <div className="container">
          <motion.div
            className="lecture-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            <div className="lecture-header">
              <h2>Lecture 2: AI for Business - Building Tools That Scale</h2>
              <div className="lecture-thumbnail">
                <div className="thumbnail-placeholder">AI for Business</div>
              </div>
            </div>
            <div className="lecture-content">
              <div className="lecture-meta">
                <span className="duration">Duration: ~3 hours (hands-on workshop)</span>
              </div>
              <div className="lecture-section-content">
                <h3>What You'll Learn</h3>
                <ul className="learning-list">
                  <li>Building custom AI tools for your business</li>
                  <li>Customer data analysis automation</li>
                  <li>Marketing content systems</li>
                  <li>Workflow automation</li>
                  <li>Decision-support dashboards</li>
                  <li>You'll build actual tools during the session</li>
                </ul>
              </div>
              <div className="lecture-section-content">
                <h3>Who It's For</h3>
                <p>Business owners, marketers, operations professionals, entrepreneurs</p>
              </div>
              <div className="pricing-section">
                <h3>Pricing</h3>
                <motion.div
                  className="pricing-tiers"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <motion.div className="pricing-tier" variants={staggerItem}>
                    <div className="tier-name">Virtual Live Workshop</div>
                    <div className="tier-price">$49<span className="tier-cents">.99</span></div>
                    <div className="tier-note">Includes Q&A + follow-up support</div>
                  </motion.div>
                  <motion.div className="pricing-tier" variants={staggerItem}>
                    <div className="tier-name">Download Only</div>
                    <div className="tier-price">$149<span className="tier-cents">.99</span></div>
                    <div className="tier-note">Full video + all code/templates/resources</div>
                  </motion.div>
                  <motion.div className="pricing-tier" variants={staggerItem}>
                    <div className="tier-name">In-Person Workshop</div>
                    <div className="tier-price">$299<span className="tier-cents">.99</span></div>
                    <div className="tier-note">Limited availability</div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </SqueezeSection>

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
              Interested in bringing these talks to your organization?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: ndsEase }}
            >
              Corporate/group rates available. Custom workshops tailored to your team.
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
