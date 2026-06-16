import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Contact.css'

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ndsEase } }
}

const subjectOptions = [
  { value: 'fulltime', label: 'Full-time role' },
  { value: 'ai-systems', label: 'AI / automation / systems' },
  { value: 'product-gtm', label: 'Product / GTM challenge' },
  { value: 'workshop', label: 'Workshop / briefing' },
  { value: 'client-project', label: 'Client project' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'general', label: 'General note' }
]

const contactIntents = [
  {
    title: 'Role or Team Fit',
    text: 'Product marketing, growth, strategy, or operator roles where customer understanding and builder fluency both matter.'
  },
  {
    title: 'Process / Systems Problem',
    text: 'Manual work, scattered data, or disconnected tools that could be automated, tracked on a dashboard, or turned into a smarter system.'
  },
  {
    title: 'Briefing or Workshop',
    text: 'A session for teams trying to understand what technology changes, what to build, and how to make better decisions.'
  }
]

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const subjectLabel = subjectOptions.find((option) => option.value === formData.subject)?.label || 'General note'
    const emailSubject = `Inquiry: ${subjectLabel}`
    const emailBody = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Reason: ${subjectLabel}`,
      '',
      formData.message
    ].join('\n')

    window.location.href = `mailto:gunnarneuman14@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    setSubmitted(true)
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <PageTransition>
    <div className="contact">
      <section className="contact-hero section">
        <div className="container">
          <div className="hero-split">
            <div className="hero-split-left">
              <motion.p
                className="label"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: ndsEase }}
              >
                Get in Touch
              </motion.p>
              <h1>
                {'Start Here'.split(' ').map((word, i, words) => (
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
                className="contact-subtitle"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: ndsEase }}
              >
                Full-time, contract, or consulting — send the role, product, or problem. I&apos;ll read the context and respond with a useful next step.
              </motion.p>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Email</span>
                <span className="hero-meta-value">gunnarneuman14@gmail.com</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Based in</span>
                <span className="hero-meta-value">Milwaukee, WI</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Response</span>
                <span className="hero-meta-value">Within 24 hours</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Open to</span>
                <span className="hero-meta-value hero-meta-status">On-site in SE Wisconsin</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Content — Squeezed */}
      <SqueezeSection className="contact-content section">
        <div className="container">
          <motion.div
            className="contact-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Contact Form */}
            <motion.div className="contact-form-section" variants={fadeUp}>
              <h2>Send a Message</h2>
              <p className="form-intro">
                The most useful notes include the situation, what matters most, and what a good next step would look like.
              </p>
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="form-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: ndsEase }}
                  >
                    <div className="success-icon">&#10003;</div>
                    <h3>Email Draft Opened</h3>
                    <p>
                      Your email client should have the message ready. If it did not open, email me directly at{' '}
                      <a href="mailto:gunnarneuman14@gmail.com">gunnarneuman14@gmail.com</a>.
                    </p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="contact-form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div className="form-group" variants={staggerItem}>
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                    <motion.div className="form-group" variants={staggerItem}>
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </motion.div>
                    <motion.div className="form-group" variants={staggerItem}>
                      <label htmlFor="subject">Reason</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a reason</option>
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </motion.div>
                    <motion.div className="form-group" variants={staggerItem}>
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="What are you trying to build, decide, launch, or hire for?"
                        required
                      ></textarea>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <button type="submit" className="btn btn-primary">
                        Open Email Draft
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact Info */}
            <motion.div className="contact-info-section" variants={fadeUp}>
              <h2>Useful Reasons to Reach Out</h2>
              <div className="contact-intents">
                {contactIntents.map((intent) => (
                  <div className="contact-intent" key={intent.title}>
                    <h3>{intent.title}</h3>
                    <p>{intent.text}</p>
                  </div>
                ))}
              </div>
              <div className="contact-info">
                <div className="info-item">
                  <h3>Email</h3>
                  <a href="mailto:gunnarneuman14@gmail.com">gunnarneuman14@gmail.com</a>
                </div>
                <div className="info-item">
                  <h3>Location</h3>
                  <p>Milwaukee, WI</p>
                  <p className="location-note">On-site in SE Wisconsin · open to hybrid</p>
                </div>
              </div>

              <div className="availability-section">
                <h2>Availability</h2>
                <div className="availability-content">
                  <p className="availability-text">
                    <strong>Currently seeking:</strong> Full-time roles in AI, business systems, operations, or product — where I can automate the busywork and turn data into decisions
                  </p>
                  <p className="availability-text">
                    <strong>Also available for:</strong> Product/GTM consulting, briefings, workshops, and selective build projects
                  </p>
                </div>
              </div>

              <div className="response-expectation">
                <p>I typically respond within 24 hours</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Contact
