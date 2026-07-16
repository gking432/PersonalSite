import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Projects.css'

const ndsEase = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const projects = [
  {
    name: 'Northstar',
    type: 'Business Systems',
    status: 'Live Demo',
    shortDesc:
      'An AI-assisted command center showing how a home-improvement business can capture leads, prioritize follow-up, track jobs, and turn scattered customer signals into daily action.',
    image: '/images/project-northstar.png',
    imageFit: 'contain',
    imageAlt: 'Northstar command center dashboard showing lead pipeline, task management, AI insights, and business metrics',
    url: 'https://new-gking432s-projects.vercel.app/app',
    buttonLabel: 'View Northstar',
    tech: ['AI Assistant', 'CRM', 'Workflow Automation', 'Dashboards']
  },
  {
    name: 'Productivity Dashboard',
    type: 'Decision Surface',
    status: 'Concept Build',
    shortDesc:
      'A dashboard concept for turning scattered tasks, data, and signals into clear KPIs and a single surface for daily decisions.',
    preview: 'dashboard',
    tech: ['Dashboards', 'KPIs', 'Automation']
  },
  {
    name: 'PrepMe',
    type: 'Interview Practice',
    status: 'Private Prototype',
    shortDesc:
      'An interview practice concept built around realistic reps, structured feedback, and the nervous gap before high-stakes conversations.',
    preview: 'prepme',
    tech: ['AI Assistant', 'Feedback Loops', 'AI Workflow']
  },
  {
    name: 'Terralis Print Studio',
    type: 'Print Commerce',
    status: 'Live Product',
    shortDesc:
      'A topographic print studio that turns meaningful places into custom wall art, with the product, brand, and buying flow designed as one system.',
    image: '/images/project-terralis.png',
    imageAlt: 'Terralis landing page preview',
    url: 'https://terralis.space',
    buttonLabel: 'Visit Terralis',
    tech: ['eCommerce', 'Full-Stack Build', 'Brand']
  },
  {
    name: 'MoveMint',
    type: 'Token Launcher',
    status: 'Live Product',
    shortDesc:
      'A live Aptos token launcher built around bonding curve mechanics, graduation logic, and a cleaner path from token idea to public market.',
    image: '/images/project-movemint.png',
    imageAlt: 'MoveMint landing page preview',
    url: 'https://movemint.fun',
    buttonLabel: 'Visit MoveMint',
    tech: ['Full-Stack Build', 'Payments', 'Launch Systems']
  },
  {
    name: 'This Portfolio',
    type: 'Personal Site',
    status: 'Live Build',
    shortDesc:
      'A personal site treated like a product: interactive homepage, evolving positioning, real project links, and a visual system built to keep improving.',
    preview: 'portfolio',
    url: '/',
    buttonLabel: 'View Homepage',
    tech: ['React', 'Framer Motion', 'Positioning']
  }
]

function ProjectVisual({ project }) {
  if (project.image) {
    return (
      <div className={`dev-project-screenshot${project.imageFit === 'contain' ? ' dev-project-screenshot-contain' : ''}`}>
        <img src={project.image} alt={project.imageAlt} loading="lazy" />
      </div>
    )
  }

  return (
    <div className={`dev-project-concept dev-project-concept-${project.preview || 'default'}`} aria-hidden="true">
      <span className="dev-concept-status">{project.status}</span>
      <div className="dev-concept-body">
        <span className="dev-concept-eyebrow">{project.type}</span>
        <strong className="dev-concept-name">{project.name}</strong>
      </div>
    </div>
  )
}

function ProjectSection({ project, index }) {
  const number = String(index + 1).padStart(2, '0')
  const isAlt = index % 2 !== 0

  const content = (
    <div className="container">
      <motion.div
        className="dev-project-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="dev-project-header-left">
          <motion.span className="dev-project-number" variants={fadeUp}>
            {number}
          </motion.span>
          <div className="dev-project-header-text">
            <motion.h2 className="dev-project-name" variants={fadeUp}>
              {project.name}
            </motion.h2>
            <motion.p className="dev-project-tagline" variants={fadeUp}>
              {project.type} · {project.status}
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={`dev-project-body${project.image ? ' dev-project-body-screenshot' : ''}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: ndsEase }}
      >
        <div className="dev-project-left">
          <ProjectVisual project={project} />
        </div>
        <div className="dev-project-details">
          <p className="dev-project-desc">{project.shortDesc}</p>
          <div className="dev-project-tech">
            {project.tech.map((tech) => (
              <span key={tech} className="tech-badge">{tech}</span>
            ))}
          </div>
          {project.url ? (
            <a
              href={project.url}
              target={project.url.startsWith('http') ? '_blank' : undefined}
              rel={project.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="btn btn-primary"
            >
              {project.buttonLabel}
            </a>
          ) : (
            <span className="btn btn-secondary dev-project-disabled">Private Prototype</span>
          )}
        </div>
      </motion.div>
    </div>
  )

  if (isAlt) {
    return (
      <SqueezeSection className="dev-project dev-project-alt">
        {content}
      </SqueezeSection>
    )
  }

  return (
    <section className="dev-project">
      {content}
    </section>
  )
}

function Projects() {
  return (
    <PageTransition>
      <div className="projects">
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
                  Dev Projects
                </motion.p>
                <h1>
                  {'Selected Builds'.split(' ').map((word, i, words) => (
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
                  A small collection of products and prototypes. Each one started as a question, became a working surface, and taught me something about building for a market.
                </motion.p>
              </div>
              <motion.div
                className="hero-meta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
              >
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Format</span>
                  <span className="hero-meta-value">Portfolio rows</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Includes</span>
                  <span className="hero-meta-value">Live products and prototypes</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Focus</span>
                  <span className="hero-meta-value">Product, UX, GTM</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Live</span>
                  <span className="hero-meta-value hero-meta-status">MoveMint and Terralis</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {projects.map((project, index) => (
          <ProjectSection key={project.name} project={project} index={index} />
        ))}

        {/* ═══════ CLOSING CTA — green squeeze panel ═══════ */}
        <SqueezeSection className="projects-cta section">
          <div className="container">
            <motion.div
              className="projects-cta-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <motion.p className="projects-cta-eyebrow" variants={fadeUp}>
                More where this came from
              </motion.p>
              <motion.h2 className="projects-cta-heading" variants={fadeUp}>
                Let's build the next one together.
              </motion.h2>
              <motion.p className="projects-cta-sub" variants={fadeUp}>
                These started as questions I wanted answered. If you have one worth building around, I'd like to hear it.
              </motion.p>
              <motion.div className="projects-cta-actions" variants={fadeUp}>
                <Link to="/contact" className="btn btn-primary">
                  Get in Touch
                </Link>
                <Link to="/client-work" className="btn btn-outline-light">
                  See Client Work
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </SqueezeSection>
      </div>
    </PageTransition>
  )
}

export default Projects
