import './About.css'

function About() {
  return (
    <div className="about">
      <section className="about-hero section">
        <div className="container">
          <h1>About</h1>
          <p className="about-intro">
            I'm wired to see the big picture and break it into executable pieces.
          </p>
        </div>
      </section>

      {/* Foundation */}
      <section className="about-section section">
        <div className="container">
          <div className="about-content">
            <h2>Foundation</h2>
            <p>
              BBA in Marketing + Supply Chain Management from UW-Milwaukee. I graduated with a 3.54 GPA and served as an International Business Rep. 
              This foundation taught me to think systematically and execute strategically.
            </p>
          </div>
        </div>
      </section>

      {/* Learning the Craft */}
      <section className="about-section section alt">
        <div className="container">
          <div className="about-content">
            <h2>Learning the Craft (Sub-Zero Group, Inc.)</h2>
            <p>
              As an inaugural candidate in a 2.5-year rotational program, I learned to navigate complexity and execute across functions. 
              This is where I learned to translate strategy into results.
            </p>
            <ul className="achievement-list">
              <li>Trained sales teams on custom Power BI reports</li>
              <li>Managed national product launches</li>
              <li>Sold luxury kitchen packages to high-end clientele</li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Explorer Years */}
      <section className="about-section section">
        <div className="container">
          <div className="about-content">
            <h2>The Explorer Years (2023-2025)</h2>
            <p className="highlight-text">
              I chose the harder path. Instead of climbing a ladder, I built my own playground.
            </p>
            <p>
              As an independent contractor at Touchpoint Marketing Solutions, I didn't just do the work—I built capability. 
              I moved from doing the work → outsourcing → strategic management.
            </p>
            <div className="explorer-themes">
              <div className="theme-card">
                <h4>Multi-disciplinary Mastery</h4>
                <p>Marketing, eCommerce, SEO, paid ads, branding, web development</p>
              </div>
              <div className="theme-card">
                <h4>Client Diversity</h4>
                <p>Multiple industries, different challenges, varied solutions</p>
              </div>
              <div className="theme-card">
                <h4>Self-directed Learning</h4>
                <p>Taught myself to code, build apps, understand blockchain</p>
              </div>
              <div className="theme-card">
                <h4>AI Immersion</h4>
                <p>Daily user, observer, educator of emerging technology</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What I Bring Now */}
      <section className="about-section section alt">
        <div className="container">
          <div className="about-content">
            <h2>What I Bring Now</h2>
            <p className="highlight-text">
              I'm not just pitching ideas. I'm shipping them.
            </p>
            <p>
              A marketing leader who can conceptualize campaigns, build the tools to execute them, train teams on emerging technology, 
              and move fast and iterate.
            </p>
          </div>
        </div>
      </section>

      {/* Personal Philosophy */}
      <section className="about-section section">
        <div className="container">
          <div className="about-content">
            <h2>Personal Philosophy</h2>
            <div className="philosophy-quotes">
              <p className="quote">"Curiosity + execution = capability"</p>
              <p className="quote">"I don't wait for permission to learn something new"</p>
            </div>
            <p>
              I'm not an AI expert—I'm an observer and user. That gives me something valuable: I understand how normal people 
              interact with this technology.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <section className="skills-section section alt">
        <div className="container">
          <h2 className="section-title">Skills</h2>
          <div className="skills-grid">
            <div className="skill-item">Marketing Strategy & Execution</div>
            <div className="skill-item">Digital Marketing (SEO, SEM, Social)</div>
            <div className="skill-item">Web Development & eCommerce</div>
            <div className="skill-item">Data Analysis & Reporting (Google Analytics, Power BI)</div>
            <div className="skill-item">AI Tools & Applications</div>
            <div className="skill-item">Product Launch & Go-to-Market</div>
            <div className="skill-item">Content Creation & Branding</div>
            <div className="skill-item">Code (Python, JavaScript)</div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section section">
        <div className="container">
          <h2 className="section-title">Timeline</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-year">2015-2020</div>
              <div className="timeline-content">Education</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2020-2023</div>
              <div className="timeline-content">Sub-Zero rotations</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2023-2025</div>
              <div className="timeline-content">Independent exploration & building</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2026</div>
              <div className="timeline-content">Ready for the right challenge</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
