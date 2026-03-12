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
      name: 'Aptos Token Launcher',
      tagline: 'Blockchain · Token Creation · Web3',
      description: 'Built a user-friendly interface for creating and deploying tokens on the Aptos blockchain. Simplified a complex technical process into an accessible web application that anyone can use.',
      tech: ['Aptos blockchain', 'React', 'TypeScript'],
      stat: { number: 1, suffix: '', label: 'Blockchain Launched' },
      links: { github: '#', documentation: '#' }
    },
    {
      number: '02',
      name: 'PrepMe',
      tagline: 'AI · Interview Practice · Real-time Feedback',
      description: 'Developed an application that conducts realistic job interviews using Claude AI, provides real-time feedback, and helps users improve their interview skills through practice.',
      tech: ['React', 'Anthropic API', 'JavaScript'],
      stat: { number: 50, suffix: '+', label: 'Interviews Simulated' },
      links: { demo: '#', github: '#' }
    }
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
                {'I Build What I Imagine'.split(' ').map((word, i) => (
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
                className="projects-subtitle"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                From blockchain applications to AI-powered tools, here's what happens when curiosity meets execution.
              </motion.p>
            </div>
            <motion.div
              className="hero-meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
            >
              <div className="hero-meta-item">
                <span className="hero-meta-label">Featured</span>
                <span className="hero-meta-value">2 Projects</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Domains</span>
                <span className="hero-meta-value">Blockchain, AI, Web</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Stack</span>
                <span className="hero-meta-value">React, Python, APIs</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-meta-label">Status</span>
                <span className="hero-meta-value hero-meta-status">Always building</span>
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
                <motion.div className="project-tech" variants={fadeUp}>
                  {project.tech.map((tech) => (
                    <span key={tech} className="tech-badge">{tech}</span>
                  ))}
                </motion.div>
                <motion.div className="project-links" variants={fadeUp}>
                  {project.links.demo && (
                    <a href={project.links.demo} className="project-link-btn">Live Demo</a>
                  )}
                  {project.links.github && (
                    <a href={project.links.github} className="project-link-btn">GitHub</a>
                  )}
                  {project.links.documentation && (
                    <a href={project.links.documentation} className="project-link-btn">Docs</a>
                  )}
                </motion.div>
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
            <motion.div className="more-project-card" variants={staggerItem}>
              <h3>To-Do List App</h3>
              <p>A clean, functional to-do list application built to practice core development skills.</p>
              <div className="project-tech">
                <span className="tech-badge">React</span>
                <span className="tech-badge">JavaScript</span>
              </div>
              <a href="#" className="project-link-text">GitHub →</a>
            </motion.div>
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
            Client Campaign Results
          </motion.h2>
          <motion.div
            className="case-studies"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div className="case-study" variants={staggerItem}>
              <h3>Challenge</h3>
              <p>Drive customer acquisition across multiple channels for diverse client portfolio.</p>
            </motion.div>
            <motion.div className="case-study" variants={staggerItem}>
              <h3>Strategy</h3>
              <p>Integrated digital, audio, and direct mail campaigns with data-driven optimization.</p>
            </motion.div>
            <motion.div className="case-study" variants={staggerItem}>
              <h3>Results</h3>
              <p>Generated high-quality leads and improved conversion rates across all channels.</p>
            </motion.div>
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
            What I'm Building Next
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: ndsEase }}
          >
            Always launching. Check back soon for new projects and updates.
          </motion.p>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Projects
