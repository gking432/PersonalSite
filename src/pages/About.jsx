import { motion } from 'framer-motion'
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
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ndsEase } }
}

function About() {
  return (
    <PageTransition>
    <div className="about">
      <section className="about-hero section">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            About
          </motion.p>
          <h1>
            {'About'.split('').map((char, i) => (
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
            I'm wired to see the big picture and break it into executable pieces.
          </motion.p>
        </div>
      </section>

      {/* Foundation */}
      <section className="about-section section">
        <div className="container">
          <motion.div
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>Foundation</motion.h2>
            <motion.p variants={fadeUp}>
              BBA in Marketing + Supply Chain Management from UW-Milwaukee. I graduated with a 3.54 GPA and served as an International Business Rep.
              This foundation taught me to think systematically and execute strategically.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Learning the Craft — Squeezed */}
      <SqueezeSection className="about-section section alt">
        <div className="container">
          <motion.div
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>Learning the Craft (Sub-Zero Group, Inc.)</motion.h2>
            <motion.p variants={fadeUp}>
              As an inaugural candidate in a 2.5-year rotational program, I learned to navigate complexity and execute across functions.
              This is where I learned to translate strategy into results.
            </motion.p>
            <motion.ul className="achievement-list" variants={fadeUp}>
              <li>Trained sales teams on custom Power BI reports</li>
              <li>Managed national product launches</li>
              <li>Sold luxury kitchen packages to high-end clientele</li>
            </motion.ul>
          </motion.div>
        </div>
      </SqueezeSection>

      {/* The Explorer Years */}
      <section className="about-section section">
        <div className="container">
          <motion.div
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>The Explorer Years (2023-2025)</motion.h2>
            <motion.p className="highlight-text" variants={fadeUp}>
              I chose the harder path. Instead of climbing a ladder, I built my own playground.
            </motion.p>
            <motion.p variants={fadeUp}>
              As an independent contractor at Touchpoint Marketing Solutions, I didn't just do the work—I built capability.
              I moved from doing the work → outsourcing → strategic management.
            </motion.p>
            <motion.div
              className="explorer-themes"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div className="theme-card" variants={staggerItem}>
                <h4>Multi-disciplinary Mastery</h4>
                <p>Marketing, eCommerce, SEO, paid ads, branding, web development</p>
              </motion.div>
              <motion.div className="theme-card" variants={staggerItem}>
                <h4>Client Diversity</h4>
                <p>Multiple industries, different challenges, varied solutions</p>
              </motion.div>
              <motion.div className="theme-card" variants={staggerItem}>
                <h4>Self-directed Learning</h4>
                <p>Taught myself to code, build apps, understand blockchain</p>
              </motion.div>
              <motion.div className="theme-card" variants={staggerItem}>
                <h4>AI Immersion</h4>
                <p>Daily user, observer, educator of emerging technology</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What I Bring Now — Squeezed */}
      <SqueezeSection className="about-section section alt">
        <div className="container">
          <motion.div
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>What I Bring Now</motion.h2>
            <motion.p className="highlight-text" variants={fadeUp}>
              I'm not just pitching ideas. I'm shipping them.
            </motion.p>
            <motion.p variants={fadeUp}>
              A marketing leader who can conceptualize campaigns, build the tools to execute them, train teams on emerging technology,
              and move fast and iterate.
            </motion.p>
          </motion.div>
        </div>
      </SqueezeSection>

      {/* Personal Philosophy */}
      <section className="about-section section">
        <div className="container">
          <motion.div
            className="about-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>Personal Philosophy</motion.h2>
            <motion.div className="philosophy-quotes" variants={fadeUp}>
              <p className="quote">"Curiosity + execution = capability"</p>
              <p className="quote">"I don't wait for permission to learn something new"</p>
            </motion.div>
            <motion.p variants={fadeUp}>
              I'm not an AI expert—I'm an observer and user. That gives me something valuable: I understand how normal people
              interact with this technology.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Skills Grid — Squeezed */}
      <SqueezeSection className="skills-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            Skills
          </motion.h2>
          <motion.div
            className="skills-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div className="skill-item" variants={staggerItem}>Marketing Strategy & Execution</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>Digital Marketing (SEO, SEM, Social)</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>Web Development & eCommerce</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>Data Analysis & Reporting (Google Analytics, Power BI)</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>AI Tools & Applications</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>Product Launch & Go-to-Market</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>Content Creation & Branding</motion.div>
            <motion.div className="skill-item" variants={staggerItem}>Code (Python, JavaScript)</motion.div>
          </motion.div>
        </div>
      </SqueezeSection>

      {/* Timeline */}
      <section className="timeline-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            Timeline
          </motion.h2>
          <div className="timeline">
            {[
              { year: '2015-2020', content: 'Education' },
              { year: '2020-2023', content: 'Sub-Zero rotations' },
              { year: '2023-2025', content: 'Independent exploration & building' },
              { year: '2026', content: 'Ready for the right challenge' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="timeline-item"
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: ndsEase }}
              >
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-content">{item.content}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </PageTransition>
  )
}

export default About
