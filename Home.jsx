import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      {/* Hero Section - Bold Introduction */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-headline">
              Gunnar Neuman
            </h1>
            <p className="hero-subheadline">
              Marketing strategist who builds. I've driven acquisition campaigns for luxury brands, 
              launched blockchain applications, and taught AI to hundreds of users. Now looking for 
              the right full-time opportunity with a growing company.
            </p>
            <div className="hero-cta">
              <Link to="/projects" className="btn btn-primary">
                See What I've Built
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities - Three Pillars */}
      <section className="capabilities">
        <div className="container">
          <div className="capabilities-grid">
            <div className="capability-item">
              <h4>Marketing & Growth</h4>
              <p>
                Managed multi-channel campaigns (SEO, paid ads, direct mail) driving customer acquisition. 
                Led national product launches at Sub-Zero. Built eCommerce sites that convert.
              </p>
            </div>
            <div className="capability-item">
              <h4>Building & Shipping</h4>
              <p>
                Created production apps: blockchain token launcher, AI interview simulator, productivity tools. 
                Comfortable with React, Python, APIs. I don't just strategize—I ship.
              </p>
            </div>
            <div className="capability-item">
              <h4>AI Applications</h4>
              <p>
                Daily AI user since ChatGPT launch. Created educational programs teaching practical AI use. 
                Not an expert—an observer who knows how real people actually use these tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Section 1 - Placeholder for outdoor/office photo */}
      <section className="photo-section">
        {/* This will be replaced with actual photo */}
        <div className="photo-section-image" style={{
          backgroundColor: '#2d5016',
          backgroundImage: 'linear-gradient(135deg, #1a3a2e 0%, #2d5016 100%)'
        }} />
        <div className="photo-section-overlay" />
        <div className="container">
          <div className="photo-section-content">
            <p className="subtitle" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>Philosophy</p>
            <h2>Curiosity plus execution equals capability</h2>
            <p>
              I don't wait for permission to learn something new. When I wanted to understand blockchain, 
              I built a token launcher. When I saw AI transforming how people work, I created a lecture 
              series. The last three years weren't a gap—they were deliberate exploration.
            </p>
          </div>
        </div>
      </section>

      {/* Selected Projects */}
      <section className="selected-projects">
        <div className="container">
          <p className="subtitle">Work</p>
          <h2>Selected Projects</h2>
          <div className="projects-list">
            <div className="project-item">
              <h3>Aptos Token Launcher</h3>
              <p>
                Built a web application for creating and deploying tokens on the Aptos blockchain. 
                Simplified complex smart contract interactions into a clean user interface.
              </p>
              <div className="project-meta">
                <span>React</span>
                <span>Aptos SDK</span>
                <span>Web3</span>
              </div>
            </div>

            <div className="project-item">
              <h3>PrepMe - AI Interview Simulator</h3>
              <p>
                Interview practice platform using Claude AI to conduct realistic mock interviews 
                with real-time feedback and performance analysis.
              </p>
              <div className="project-meta">
                <span>React</span>
                <span>Anthropic API</span>
                <span>Voice Integration</span>
              </div>
            </div>

            <div className="project-item">
              <h3>AI Basics Lecture Series</h3>
              <p>
                90-minute educational program teaching everyday users what AI actually is, what it 
                can and can't do, and how to use it responsibly. Designed for non-technical audiences.
              </p>
              <div className="project-meta">
                <span>Education</span>
                <span>Public Speaking</span>
              </div>
            </div>
          </div>
          <Link to="/projects" className="text-link">
            View all projects →
          </Link>
        </div>
      </section>

      {/* Photo Section 2 - Placeholder for speaking/presenting photo */}
      <section className="photo-section">
        {/* This will be replaced with actual photo */}
        <div className="photo-section-image" style={{
          backgroundColor: '#1e3a5f',
          backgroundImage: 'linear-gradient(135deg, #1e3a5f 0%, #2d5278 100%)'
        }} />
        <div className="photo-section-overlay" />
        <div className="container">
          <div className="photo-section-content">
            <p className="subtitle" style={{ color: 'rgba(244, 241, 234, 0.7)' }}>Approach</p>
            <h2>Think big picture. Compartmentalize. Execute.</h2>
            <p>
              I see systems, not just tasks. Whether it's a product launch, a marketing campaign, 
              or a new application—I break complex goals into clear deliverables and ship them.
            </p>
          </div>
        </div>
      </section>

      {/* Background Timeline */}
      <section className="background">
        <div className="container">
          <p className="subtitle">Experience</p>
          <h2>Background</h2>
          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-year">2020-2023</span>
              <div className="timeline-content">
                <h4>Sub-Zero Group, Inc.</h4>
                <p>Sales Rotational Program</p>
                <p>
                  Inaugural candidate in 2.5-year program rotating through sales operations, 
                  product marketing, launch management, and dealer sales for luxury kitchen appliances.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <span className="timeline-year">2023-2025</span>
              <div className="timeline-content">
                <h4>Independent Work</h4>
                <p>Client Marketing Manager</p>
                <p>
                  Drove acquisition campaigns for multiple clients. Designed and executed digital 
                  marketing strategies. Built applications. Explored AI tools daily.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <span className="timeline-year">2026</span>
              <div className="timeline-content">
                <h4>Looking for the right full-time role</h4>
                <p>Next Chapter</p>
                <p>
                  Targeting marketing leadership positions (Director, CMO) with ambitious, growing 
                  companies where I can build, strategize, and execute.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta">
        <div className="cta-content">
          <h2>I'm looking for a full-time marketing leadership role</h2>
          <p>
            I want to join a growing company where I can combine strategic thinking with 
            hands-on execution. If you're building something ambitious and need someone 
            who can plan it, build it, and market it—let's talk.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
