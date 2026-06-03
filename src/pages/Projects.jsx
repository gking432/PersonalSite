import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Projects.css'

const ndsEase = [0.22, 1, 0.36, 1]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ndsEase } }
}

const projects = [
  {
    name: 'MoveMint',
    eyebrow: 'Live Product',
    type: 'Token Launcher',
    description:
      'A token launch experience for Aptos projects, built around bonding curve mechanics, clearer launch flows, and a more understandable path from token creation to market.',
    image: '/images/project-movemint.png',
    url: 'https://movemint.fun',
    buttonLabel: 'Visit MoveMint',
    tags: ['Aptos', 'Bonding Curves', 'Launch Systems']
  },
  {
    name: 'Terralis Print Studio',
    eyebrow: 'Live Product',
    type: 'Print Commerce',
    description:
      'A topographic map print studio that turns place-based memory into custom wall art, with the product, brand, and buying experience built as one system.',
    image: '/images/project-terralis.png',
    url: 'https://terralis.space',
    buttonLabel: 'Visit Terralis',
    tags: ['eCommerce', 'Cartography', 'Brand']
  },
  {
    name: 'PrepMe',
    eyebrow: 'Private Prototype',
    type: 'Interview Practice',
    description:
      'A candidate-prep product concept focused on realistic interview reps, structured feedback, and the confidence gap before high-stakes conversations.',
    preview: 'prepme',
    tags: ['Interview Prep', 'Feedback Loops', 'AI Workflow']
  },
  {
    name: 'Productivity Dashboard',
    eyebrow: 'Concept Build',
    type: 'Decision Surface',
    description:
      'A workflow dashboard concept for turning scattered tasks, priorities, and signals into a cleaner operating surface for daily decisions.',
    preview: 'dashboard',
    tags: ['Dashboard', 'Workflow', 'UX']
  },
  {
    name: 'This Portfolio',
    eyebrow: 'Live Build',
    type: 'Personal Site',
    description:
      'A living portfolio built as a product in its own right, with an interactive homepage, navigation spine, project language, and evolving positioning.',
    preview: 'portfolio',
    url: '/',
    buttonLabel: 'View Homepage',
    tags: ['React', 'Framer Motion', 'Positioning']
  }
]

function ProjectPreview({ project }) {
  if (project.image) {
    return (
      <div className="project-card-preview project-card-preview-image">
        <img src={project.image} alt={`${project.name} landing page preview`} loading="lazy" />
      </div>
    )
  }

  return (
    <div className={`project-card-preview project-card-preview-${project.preview || 'default'}`} aria-hidden="true">
      <div className="project-preview-bar">
        <span />
        <span />
        <span />
      </div>
      <div className="project-preview-stage">
        <span className="project-preview-kicker">{project.type}</span>
        <strong>{project.name}</strong>
        <div className="project-preview-line project-preview-line-long" />
        <div className="project-preview-line" />
      </div>
    </div>
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
                  A compact look at the products, prototypes, and experiments I have built. Each card is meant to be scanned quickly, then opened if it earns the click.
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
                  <span className="hero-meta-value">Portfolio index</span>
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

        <SqueezeSection className="project-gallery section">
          <div className="container">
            <motion.div
              className="project-gallery-heading"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: ndsEase }}
            >
              <p className="label">Project Index</p>
              <h2>Open the build, not the dissertation.</h2>
            </motion.div>

            <motion.div
              className="project-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {projects.map((project) => (
                <motion.article className="project-card" key={project.name} variants={staggerItem}>
                  <ProjectPreview project={project} />
                  <div className="project-card-body">
                    <div className="project-card-meta">
                      <span>{project.eyebrow}</span>
                      <span>{project.type}</span>
                    </div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="project-tags" aria-label={`${project.name} tags`}>
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="project-card-action">
                      {project.url ? (
                        <a
                          href={project.url}
                          target={project.url.startsWith('http') ? '_blank' : undefined}
                          rel={project.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="project-button"
                        >
                          {project.buttonLabel}
                        </a>
                      ) : (
                        <span className="project-button project-button-muted">Private Prototype</span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </SqueezeSection>
      </div>
    </PageTransition>
  )
}

export default Projects
