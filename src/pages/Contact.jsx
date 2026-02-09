import { useState } from 'react'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

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
    alert('Thank you for your message! I\'ll get back to you within 24 hours.')
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="contact">
      <section className="contact-hero section">
        <div className="container">
          <h1>Get In Touch</h1>
          <p className="contact-subtitle">
            Have a question, opportunity, or just want to connect? I'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="contact-content section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
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
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
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
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
