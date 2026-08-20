import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import { aiAssistantEnabled } from '../config/features'
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
    assistantSection: 'projects-crm',
    elementId: 'project-crm',
    name: 'Home-Services AI CRM',
    type: 'Business Workflow',
    status: 'Functional Demonstration',
    shortDesc:
      'A home-services command center that models AI-assisted workflows across leads, calls, quotes, appointments, and follow-up while keeping customer communication under human control.',
    image: '/images/project-northstar.png',
    imagePosition: 'top center',
    imageAlt: 'Home-services CRM dashboard showing lead pipeline, task management, AI insights, and business metrics',
    caseStudy: '/projects/home-services-crm',
    caseStudyLabel: 'Read the case study',
    url: 'https://new-teal-delta.vercel.app/app',
    buttonLabel: 'Open the demo',
    tech: ['AI Workflows', 'CRM', 'Human Approval']
  },
  {
    assistantSection: 'projects-prepme',
    elementId: 'project-prepme',
    name: 'PrepMe',
    type: 'AI Interview Demo',
    status: 'Functional Demo',
    shortDesc:
      'PrepMe is a functional demo that turns a résumé and target job description into a tailored AI interview with structured feedback.',
    image: '/images/project-prepme.png',
    imagePosition: 'center center',
    imageAlt: 'PrepMe dashboard showing interview setup flow',
    url: 'https://prep-me-wheat.vercel.app/',
    buttonLabel: 'Open the demo',
    tech: ['Résumé Analysis', 'AI Interview', 'Feedback']
  },
  {
    assistantSection: 'projects-terralis',
    elementId: 'project-terralis',
    name: 'Terralis Print Studio',
    type: 'Print Commerce',
    status: 'Functional Prototype',
    shortDesc:
      'Terralis is an in-progress functional prototype that turns a meaningful location into a customizable topographic print and demo ordering flow.',
    image: '/images/project-terralis.png',
    imagePosition: 'center center',
    imageAlt: 'Terralis landing page preview',
    url: 'https://cartoprint.vercel.app/',
    buttonLabel: 'Open the prototype',
    tech: ['Generated Design', 'Customization', 'eCommerce']
  },
  {
    assistantSection: 'projects-movemint',
    elementId: 'project-movemint',
    name: 'MoveMint',
    type: 'Technical Range',
    status: 'Aptos Testnet Prototype',
    shortDesc:
      'MoveMint is a functional Aptos testnet prototype built to test token launches, bonding-curve mechanics, wallet interactions, and concurrent activity.',
    image: '/images/project-movemint.png',
    imagePosition: 'top center',
    imageAlt: 'MoveMint landing page preview',
    url: 'https://movemint.fun',
    buttonLabel: 'Open the testnet prototype',
    tech: ['Aptos', 'Bonding Curves', 'Stress Testing']
  }
]

function ProjectVisual({ project }) {
  return (
    <div className="project-card-media">
      <img
        src={project.image}
        alt={project.imageAlt}
        loading="lazy"
        style={{ objectPosition: project.imagePosition }}
      />
    </div>
  )
}

function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      id={project.elementId}
      data-assistant-section={project.assistantSection}
      className="project-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.08, ease: ndsEase }}
    >
      <ProjectVisual project={project} />
      <div className="project-card-content">
        <div className="project-card-heading">
          <span className="project-card-number">{number}</span>
          <div>
            <p className="project-card-meta">{project.type} · {project.status}</p>
            <h2>{project.name}</h2>
          </div>
        </div>
        <p className="project-card-description">{project.shortDesc}</p>
        <div className="project-card-footer">
          <div className="project-card-tech">
            {project.tech.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          <div className="project-card-links">
            {project.caseStudy && (
              <Link to={project.caseStudy} className="project-card-link">
                {project.caseStudyLabel} <span aria-hidden="true">→</span>
              </Link>
            )}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`project-card-link${project.caseStudy ? ' project-card-link-muted' : ''}`}
            >
              {project.buttonLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function Projects() {
  const openProjectSupport = () => {
    window.dispatchEvent(new CustomEvent('portfolio-assistant:open', {
      detail: {
        context: 'The visitor opened you from the Projects support notice. Ask which public project they are using and what is happening. Troubleshoot one step at a time without claiming you can see their other tab or screen.'
      }
    }))
  }

  return (
    <PageTransition>
      <div className="projects">
        <section className="projects-hero section" data-assistant-section="projects-overview">
          <div className="container">
            <div className="hero-split">
              <div className="hero-split-left">
                <motion.p
                  className="label"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: ndsEase }}
                >
                  Products &amp; Systems
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
                  I build to answer questions that are hard to resolve on paper. These projects show how I move from a business problem or unfamiliar domain to a working product people can use.
                </motion.p>
              </div>
              <motion.div
                className="hero-meta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
              >
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Starting point</span>
                  <span className="hero-meta-value">A real workflow or unanswered question</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Strongest proof</span>
                  <span className="hero-meta-value">Home-services CRM case study</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Focus</span>
                  <span className="hero-meta-value">Business value, workflow, product</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Range</span>
                  <span className="hero-meta-value hero-meta-status">AI, business systems, commerce, Web3</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="projects-gallery">
          {aiAssistantEnabled && (
            <div className="container">
              <motion.aside
                className="projects-support"
                aria-label="Project demo support"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: ndsEase }}
              >
                <span className="projects-support-label">Demo support</span>
                <div>
                  <h2>Trying one of the projects?</h2>
                  <p>If something does not work the way you expect, come back here and ask my AI assistant. It knows the intended workflows, the common failure points, and what to try next.</p>
                </div>
                <button type="button" onClick={openProjectSupport}>Ask the assistant for help</button>
              </motion.aside>
            </div>
          )}
          <div className="container projects-grid">
            {projects.map((project, index) => (
              <ProjectCard key={project.name} project={project} index={index} />
            ))}
          </div>
        </section>

        {/* ═══════ CLOSING CTA; green squeeze panel ═══════ */}
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
                What I want to do next
              </motion.p>
              <motion.h2 className="projects-cta-heading" variants={fadeUp}>
                Bring me the problem before the solution is obvious.
              </motion.h2>
              <motion.p className="projects-cta-sub" variants={fadeUp}>
                I am looking for a team where I can understand the work, help shape the system, and stay close enough to execution to make it useful.
              </motion.p>
              <motion.div className="projects-cta-actions" variants={fadeUp}>
                <Link to="/contact" className="btn btn-primary">
                  Get in Touch
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
