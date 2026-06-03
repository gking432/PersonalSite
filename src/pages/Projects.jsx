import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Projects.css'

const ndsEase = [0.22, 1, 0.36, 1]

function AnimatedNumber({ target, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return
    let startTime
    let animationFrame
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const linear = Math.min((currentTime - startTime) / (duration * 1000), 1)
      const progress = easeOut(linear)
      setCount(Math.floor(progress * target))
      if (linear < 1) animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ndsEase } }
}

function Projects() {
  const featuredProjects = [
    {
      number: '01',
      name: 'MoveMint Launchpad',
      tagline: 'Aptos · Bonding Curves · Market Mechanics',
      description: 'A crypto token launchpad concept built around the hard part of product work: turning incentives, pricing, liquidity, and user behavior into something understandable enough to ship.',
      tech: ['Aptos', 'React', 'TypeScript', 'Bonding Curves'],
      url: 'https://movemint.fun',
      linkLabel: 'Visit MoveMint',
      domain: 'movemint.fun',
      stat: { number: 792, suffix: 'M', label: 'Graduation Tokens Modeled' },
      proof: [
        { label: 'Problem', value: 'Token launches are usually technically dense, financially opaque, and hard for nontechnical teams to reason about.' },
        { label: 'Build', value: 'Modeled bonding-curve mechanics, price progression, graduation thresholds, and user-facing launch flows.' },
        { label: 'GTM Lens', value: 'Treated the product as a trust problem: users need to understand what happens before they commit capital.' },
        { label: 'Learning', value: 'The interface matters as much as the mechanism. Complex markets need translation, not just execution.' }
      ]
    },
    {
      number: '02',
      name: 'PrepMe',
      tagline: 'Interview Simulation · Feedback Loops · Candidate Prep',
      description: 'An interview-practice product concept focused on realistic repetition, structured feedback, and the confidence gap candidates feel before high-stakes conversations.',
      tech: ['React', 'Claude API', 'JavaScript', 'Feedback Systems'],
      stat: { number: 50, suffix: '+', label: 'Interview Paths Tested' },
      proof: [
        { label: 'Problem', value: 'Most interview prep is passive. Candidates read advice but do not get enough realistic reps.' },
        { label: 'Build', value: 'Designed a simulation flow with role-specific questions, response evaluation, and improvement prompts.' },
        { label: 'GTM Lens', value: 'Positioned around practice quality, not novelty: better reps, clearer feedback, less anxiety.' },
        { label: 'Learning', value: 'A useful tool has to feel human enough to reduce nerves and structured enough to improve performance.' }
      ]
    }
  ]

  const moreProjects = [
    {
      name: 'Terralis Print Studio',
      desc: 'A live print studio for turning place-based memory into custom topographic map art, with product positioning, visual identity, and fulfillment assumptions considered from the start.',
      tech: ['Product Concept', 'Print Commerce', 'Brand'],
      url: 'https://terralis.space',
      linkLabel: 'Visit Terralis',
      domain: 'terralis.space'
    },
    {
      name: 'Productivity Dashboard',
      desc: 'A decision-support dashboard concept for turning scattered tasks, priorities, and signals into a cleaner operating surface.',
      tech: ['Dashboard', 'Workflow', 'UX']
    },
    {
      name: 'This Portfolio',
      desc: 'A living portfolio built as a product in its own right: interactive homepage, navigation spine, case-study structure, and evolving positioning.',
      tech: ['React', 'Framer Motion', 'Positioning']
    }
  ]

  const evaluationCards = [
    { title: 'Customer Signal', text: 'What problem does this solve, and how painful is it for the person living with it?' },
    { title: 'Mechanism', text: 'What has to be true technically, economically, or behaviorally for the product to work?' },
    { title: 'Market Path', text: 'How would someone discover it, trust it, try it, and eventually pay for it?' }
  ]

  return (
    <PageTransition>
    <div className="projects">
      {/* Hero */}
      <section className="projects-hero section">
        <div className="container">
          <div className="hero-split">
            <div className="hero-split-left">
              <motion.p
                className="label"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: ndsEase }}
              >
                Projects
              </motion.p>
              <h1>
                {'The Workbench'.split(' ').map((word, i, words) => (
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
                className="projects-subtitle"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                Product experiments, market mechanics, and working prototypes. This is where ideas get pressure-tested before they become real businesses.
              </motion.p>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Mode</span>
                <span className="hero-meta-value">Prototype to proof</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Domains</span>
                <span className="hero-meta-value">Marketplaces, tools, launch systems</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Stack</span>
                <span className="hero-meta-value">React, TypeScript, APIs</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Lens</span>
                <span className="hero-meta-value hero-meta-status">Problem to prototype to GTM</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Projects — Editorial Layout */}
      {featuredProjects.map((project, index) => {
        const isAlt = index % 2 !== 0

        const projectContent = (
          <div className="container">
            <motion.div
              className="project-feature-header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.span className="project-feature-number" variants={fadeUp}>
                {project.number}
              </motion.span>
              <motion.h2 className="project-feature-name" variants={fadeUp}>
                {project.name}
              </motion.h2>
              <motion.p className="project-feature-tagline" variants={fadeUp}>
                {project.tagline}
              </motion.p>
            </motion.div>

            <div className="project-feature-body">
              <motion.div
                className="project-feature-stat"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: ndsEase }}
              >
                <span className="stat-number">
                  <AnimatedNumber target={project.stat.number} suffix={project.stat.suffix} />
                </span>
                <span className="stat-label">{project.stat.label}</span>
              </motion.div>
              <motion.div
                className="project-feature-details"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
              >
                <motion.p variants={fadeUp}>{project.description}</motion.p>
                <motion.div className="project-proof-grid" variants={staggerContainer}>
                  {project.proof.map((item) => (
                    <motion.div className="project-proof-card" key={item.label} variants={staggerItem}>
                      <span>{item.label}</span>
                      <p>{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div className="project-tech" variants={fadeUp}>
                  {project.tech.map((tech) => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </motion.div>
                {project.url && (
                  <motion.div className="project-links" variants={fadeUp}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-live-link"
                    >
                      <span>{project.linkLabel}</span>
                      <small>{project.domain}</small>
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        )

        if (isAlt) {
          return (
            <SqueezeSection key={project.number} className="project-feature project-feature-alt">
              {projectContent}
            </SqueezeSection>
          )
        }

        return (
          <section key={project.number} className="project-feature">
            {projectContent}
          </section>
        )
      })}

      {/* More Projects */}
      <SqueezeSection className="more-projects-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            More Work
          </motion.h2>
          <motion.div
            className="more-projects-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {moreProjects.map((project) => (
              <motion.div className="more-project-card" key={project.name} variants={staggerItem}>
                <h3>{project.name}</h3>
                <p>{project.desc}</p>
                <div className="project-tech">
                  {project.tech.map((tech) => (
                    <span className="tech-badge" key={tech}>{tech}</span>
                  ))}
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link-text"
                  >
                    {project.linkLabel} <span>{project.domain}</span>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SqueezeSection>

      {/* Case Studies */}
      <section className="case-studies-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            How I Evaluate Builds
          </motion.h2>
          <motion.div
            className="case-studies"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {evaluationCards.map((card) => (
              <motion.div className="case-study" key={card.title} variants={staggerItem}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What's Next */}
      <SqueezeSection className="whats-next-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: ndsEase }}
          >
            The workbench stays open.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: ndsEase }}
          >
            I use projects to sharpen judgment: what to build, how to explain it, where the market lives, and what proof is still missing.
          </motion.p>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Projects
