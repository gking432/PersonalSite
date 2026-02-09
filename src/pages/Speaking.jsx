import { Link } from 'react-router-dom'
import './Speaking.css'

function Speaking() {
  return (
    <div className="speaking">
      <section className="speaking-hero section">
        <div className="container">
          <h1>AI for Everyday Users</h1>
          <p className="speaking-subtitle">
            I'm not a computer scientist—I'm an observer, user, and translator. I help normal people understand what AI means for their lives and businesses.
          </p>
        </div>
      </section>

      {/* Lecture 1 */}
      <section className="lecture-section section">
        <div className="container">
          <div className="lecture-card">
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
                <div className="pricing-tiers">
                  <div className="pricing-tier">
                    <div className="tier-name">Virtual Live Event</div>
                    <div className="tier-price">$7.49</div>
                    <div className="tier-note">Includes Q&A session</div>
                  </div>
                  <div className="pricing-tier">
                    <div className="tier-name">Download Only</div>
                    <div className="tier-price">$2.99</div>
                    <div className="tier-note">Video + slide deck</div>
                  </div>
                  <div className="pricing-tier">
                    <div className="tier-name">In-Person</div>
                    <div className="tier-price">$24.99</div>
                    <div className="tier-note">When available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lecture 2 */}
      <section className="lecture-section section alt">
        <div className="container">
          <div className="lecture-card">
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
                <div className="pricing-tiers">
                  <div className="pricing-tier">
                    <div className="tier-name">Virtual Live Workshop</div>
                    <div className="tier-price">$49.99</div>
                    <div className="tier-note">Includes Q&A + follow-up support</div>
                  </div>
                  <div className="pricing-tier">
                    <div className="tier-name">Download Only</div>
                    <div className="tier-price">$149.99</div>
                    <div className="tier-note">Full video + all code/templates/resources</div>
                  </div>
                  <div className="pricing-tier">
                    <div className="tier-name">In-Person Workshop</div>
                    <div className="tier-price">$299.99</div>
                    <div className="tier-note">Limited availability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-section section">
        <div className="container">
          <div className="booking-content">
            <h2>Interested in bringing these talks to your organization?</h2>
            <p>Corporate/group rates available. Custom workshops tailored to your team.</p>
            <Link to="/contact" className="btn btn-primary">
              Request Booking
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section alt">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>Do I need technical knowledge?</h3>
              <p>No. These lectures are designed for everyday users and business professionals, not computer scientists.</p>
            </div>
            <div className="faq-item">
              <h3>Will I get the slides/materials?</h3>
              <p>Yes. All materials, slides, and resources are included with your purchase.</p>
            </div>
            <div className="faq-item">
              <h3>Can I get a refund?</h3>
              <p>Refund policy details will be provided at checkout. We want you to be satisfied with your purchase.</p>
            </div>
            <div className="faq-item">
              <h3>Do you do custom workshops?</h3>
              <p>Yes! Contact me to discuss custom workshops tailored to your organization's needs.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Speaking
