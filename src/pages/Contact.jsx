import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import './Contact.css'

// NDS animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
}

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
    // TODO: Implement form submission (EmailJS, Formspree, etc.)
    console.log('Form submitted:', formData)
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
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Get In Touch
          </motion.h1>
          <motion.p
            className="contact-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Have a question, opportunity, or just want to connect? I'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <section className="contact-content section">
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
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="form-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="success-icon">&#10003;</div>
                    <h3>Message Sent</h3>
                    <p>Thank you for reaching out. I'll get back to you within 24 hours.</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
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
                      <label htmlFor="subject">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="speaking">Speaking Engagement</option>
                        <option value="consulting">Consulting/Freelance Opportunity</option>
                        <option value="fulltime">Full-Time Opportunity</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
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
                        required
                      ></textarea>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <button type="submit" className="btn btn-primary">
                        Send Message
                      </button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact Info */}
            <motion.div className="contact-info-section" variants={fadeUp}>
              <h2>Other Ways to Reach Me</h2>
              <div className="contact-info">
                <div className="info-item">
                  <h3>Email</h3>
                  <a href="mailto:gunnarneuman14@gmail.com">gunnarneuman14@gmail.com</a>
                </div>
                <div className="info-item">
                  <h3>LinkedIn</h3>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    Connect on LinkedIn
                  </a>
                </div>
                <div className="info-item">
                  <h3>Location</h3>
                  <p>Madison, WI</p>
                  <p className="location-note">Open to relocation/remote</p>
                </div>
              </div>

              <div className="availability-section">
                <h2>Availability</h2>
                <div className="availability-content">
                  <p className="availability-text">
                    <strong>Currently seeking:</strong> Full-time marketing leadership roles with ambitious, growing companies
                  </p>
                  <p className="availability-text">
                    <strong>Also available for:</strong> Consulting, speaking engagements, partnerships
                  </p>
                </div>
              </div>

              <div className="response-expectation">
                <p>I typically respond within 24 hours</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
    </PageTransition>
  )
}

export default Contact
