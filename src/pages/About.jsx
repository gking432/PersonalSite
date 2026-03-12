import { useState } from 'react'
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
  const [showFullStory, setShowFullStory] = useState(false)

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
