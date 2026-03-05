import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import './ClientWork.css'

const ndsEase = [0.22, 1, 0.36, 1]

const clientProjects = [
  {
    id: 'petunis',
    number: '01',
    name: 'PetUnis',
    type: 'Brand Design & eCommerce',
    shortDesc: 'NFL-inspired dog uniforms. Full brand identity, product design, and eCommerce buildout across all 32 teams.',
    featured: true,
    quadrant: {
      challenge: {
        title: 'The Brief',
        text: 'Create a complete brand identity and eCommerce presence for a print-on-demand dog apparel line featuring NFL team-inspired designs across all 32 franchises.'
      },
      strategy: {
        title: 'Strategy',
        text: 'Developed cohesive brand guidelines, designed team-specific product mockups, built the storefront, and created marketing assets for social media campaigns targeting pet owners who are sports fans.'
      },
      execution: {
        title: 'What I Built',
        items: [
          'Full brand identity & logo system',
          'Product designs for all 32 NFL teams',
          'eCommerce storefront',
          'Social media ad creative',
          'Product photography & mockups',
          'Marketing copy & campaigns'
        ]
      },
      results: {
        title: 'Scope',
        items: [
          '32 unique team designs',
          'Complete brand guidelines',
          'Full eCommerce site',
          'Social ad campaigns',
          'Print-on-demand integration'
        ]
      }
    },
    gallery: [
      { label: 'Team Design 1' },
      { label: 'Team Design 2' },
      { label: 'Team Design 3' },
      { label: 'Team Design 4' },
      { label: 'Storefront' },
      { label: 'Ad Creative' }
    ],
    tech: ['eCommerce', 'Brand Design', 'Print on Demand', 'Social Media']
  },
  {
    id: 'weatherfixers',
    number: '02',
    name: 'WeatherFixers.com',
    type: 'Web App & Content Strategy',
    shortDesc: 'Storm damage weather aggregator connecting homeowners with local contractors after severe weather events.',
    quadrant: {
      challenge: {
        title: 'The Brief',
        text: 'Build a weather aggregation platform that identifies storm damage events and connects affected homeowners with vetted local contractors for repairs.'
      },
      strategy: {
        title: 'Strategy',
        text: 'Designed the platform to pull weather data, identify damage-prone events, and serve localized content. Created the content strategy and marketing funnel to drive organic traffic from storm-affected areas.'
      },
      execution: {
        title: 'What I Built',
        items: [
          'Weather data aggregation system',
          'Localized landing pages',
          'Contractor directory & matching',
          'SEO content strategy',
          'Marketing funnel & campaigns',
          'Full website design & development'
        ]
      },
      results: {
        title: 'Scope',
        items: [
          'Full-stack web platform',
          'Weather API integration',
          'Content marketing system',
          'Local SEO strategy',
          'Lead generation pipeline'
        ]
      }
    },
    gallery: [
      { label: 'Homepage' },
      { label: 'Storm Tracker' },
      { label: 'Contractor Directory' },
      { label: 'Landing Page' }
    ],
    tech: ['Web Development', 'SEO', 'Content Strategy', 'API Integration']
  },
  {
    id: 'elevate-apparel',
    number: '03',
    name: 'Elevate Apparel',
    type: 'Brand & Ad Creative',
    shortDesc: 'Print-on-demand gymwear brand. Brand identity design with targeted ad creative for fitness enthusiasts.',
    quadrant: {
      challenge: {
        title: 'The Brief',
        text: 'Create brand identity and advertising creative for a print-on-demand activewear brand targeting gym-goers and fitness enthusiasts.'
      },
      strategy: {
        title: 'Strategy',
        text: 'Developed a bold, high-energy brand aesthetic that stands out in the crowded activewear market. Focused on aspirational messaging and clean product photography for ad campaigns.'
      },
      execution: {
        title: 'What I Built',
        items: [
          'Brand identity & visual system',
          'Product mockup designs',
          'Paid social ad creative',
          'Ad copy & campaign structure',
          'Print-on-demand store setup'
        ]
      },
      results: {
        title: 'Deliverables',
        items: [
          'Complete brand package',
          'Ad creative suite',
          'Social media templates',
          'Product line designs'
        ]
      }
    },
    gallery: [
      { label: 'Brand Identity' },
      { label: 'Ad Creative 1' },
      { label: 'Ad Creative 2' },
      { label: 'Product Mockups' }
    ],
    tech: ['Brand Design', 'Ad Creative', 'Print on Demand', 'Paid Social']
  },
  {
    id: 'hospice-nonprofit',
    number: '04',
    name: 'Hospice Nonprofit',
    type: 'Website Redesign',
    shortDesc: 'Complete homepage redesign for a hospice care nonprofit. Modernized their web presence with compassionate, clear design.',
    quadrant: {
      challenge: {
        title: 'The Brief',
        text: 'Redesign the homepage for a hospice care nonprofit that needed a modern, compassionate web presence to better serve families and attract donors.'
      },
      strategy: {
        title: 'Strategy',
        text: 'Focused on warmth, clarity, and trust. Redesigned the information architecture to prioritize the most common visitor needs: understanding services, contacting the organization, and donating.'
      },
      execution: {
        title: 'What I Built',
        items: [
          'Complete homepage redesign',
          'Improved information architecture',
          'Mobile-responsive layout',
          'Clear calls-to-action',
          'Compassionate visual design'
        ]
      },
      results: {
        title: 'Improvements',
        items: [
          'Modernized visual identity',
          'Clearer navigation',
          'Better mobile experience',
          'Improved donation flow',
          'Professional credibility'
        ]
      }
    },
    gallery: [
      { label: 'Homepage Redesign' },
      { label: 'Services Section' }
    ],
    tech: ['Web Design', 'UX', 'Nonprofit', 'Responsive Design']
  },
  {
    id: 'blue-lizard',
    number: '05',
    name: 'Blue Lizard Bar & Grill',
    type: 'Website Redesign',
    shortDesc: 'Modern website redesign for a bar and grill. Clean, appetizing design that drives reservations and foot traffic.',
    quadrant: {
      challenge: {
        title: 'The Brief',
        text: 'Design a modern, visually appealing website for a bar and grill that showcases the atmosphere, menu, and drives customer visits.'
      },
      strategy: {
        title: 'Strategy',
        text: 'Built around the dining experience. Bold food photography, easy-to-find hours and location, and a design that captures the energy of the restaurant without being cluttered.'
      },
      execution: {
        title: 'What I Built',
        items: [
          'Complete website redesign',
          'Menu presentation',
          'Location & hours integration',
          'Mobile-first approach',
          'Visual atmosphere showcase'
        ]
      },
      results: {
        title: 'Deliverables',
        items: [
          'Full website mockup',
          'Responsive design',
          'Brand-aligned visuals',
          'Optimized user flow'
        ]
      }
    },
    gallery: [
      { label: 'Homepage Design' }
    ],
    tech: ['Web Design', 'Restaurant', 'Responsive Design']
  },
  {
    id: 'mc-seafood',
    number: '06',
    name: 'M&C Seafood',
    type: 'Website Redesign',
    shortDesc: 'Website redesign for a seafood restaurant. Fresh, ocean-inspired design highlighting the menu and coastal brand.',
    quadrant: {
      challenge: {
        title: 'The Brief',
        text: 'Create a fresh, modern website design for a seafood restaurant that conveys quality, freshness, and coastal charm.'
      },
      strategy: {
        title: 'Strategy',
        text: 'Leaned into the coastal aesthetic with clean blues and whites. Designed around the menu as the centerpiece, with easy ordering flow and location information front and center.'
      },
      execution: {
        title: 'What I Built',
        items: [
          'Complete website redesign',
          'Menu-focused layout',
          'Coastal brand aesthetic',
          'Mobile-responsive design',
          'Order flow optimization'
        ]
      },
      results: {
        title: 'Deliverables',
        items: [
          'Full website mockup',
          'Brand-aligned design',
          'Responsive layout',
          'Menu presentation system'
        ]
      }
    },
    gallery: [
      { label: 'Homepage Design' }
    ],
    tech: ['Web Design', 'Restaurant', 'Brand Design']
  }
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ndsEase } }
}

function ClientWork() {
  const [activeProject, setActiveProject] = useState(null)

  useEffect(() => {
    if (activeProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeProject])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setActiveProject(null)
    }
  }

  return (
    <PageTransition>
      <div className="client-work">
        {/* Hero */}
        <section className="client-work-hero">
          <div className="container">
            <motion.p
              className="label"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: ndsEase }}
            >
              Client Work
            </motion.p>
            <h1>
              {'Marketing That Ships'.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  style={{ display: 'inline-block', marginRight: '0.3em' }}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ndsEase }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="hero-desc"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: ndsEase }}
            >
              Brand design, website builds, ad creative, and full marketing strategy
              for clients across industries. Click any project to explore the work.
            </motion.p>
          </div>
        </section>

        {/* Project Grid */}
        <section className="client-projects-section">
          <div className="container">
            <motion.div
              className="client-projects-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {clientProjects.map((project) => (
                <motion.div
                  key={project.id}
                  className={`client-project-card ${project.featured ? 'featured' : ''}`}
                  variants={staggerItem}
                  onClick={() => setActiveProject(project)}
                >
                  <div>
                    <span className="client-card-number">{project.number}</span>
                    {project.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                    <h3 className="client-card-name">{project.name}</h3>
                    <p className="client-card-type">{project.type}</p>
                    <p className="client-card-desc">{project.shortDesc}</p>
                  </div>
                  {project.featured && (
                    <div className="featured-preview">
                      {project.gallery.slice(0, 4).map((item, i) => (
                        <div key={i} className="featured-preview-slot">
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Quadrant Modal */}
        <AnimatePresence>
          {activeProject && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleBackdropClick}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: ndsEase }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setActiveProject(null)}
                >
                  Close
                </button>

                {/* Modal Header */}
                <div className="modal-header">
                  <h2>{activeProject.name}</h2>
                  <p className="modal-type">{activeProject.type}</p>
                  <p className="modal-description">{activeProject.quadrant.challenge.text}</p>
                </div>

                {/* Quadrant Grid */}
                <div className="modal-quadrant">
                  {/* Top Left — Challenge */}
                  <div className="quadrant-cell">
                    <span className="quadrant-label">{activeProject.quadrant.challenge.title}</span>
                    <p>{activeProject.quadrant.challenge.text}</p>
                  </div>

                  {/* Top Right — Strategy */}
                  <div className="quadrant-cell">
                    <span className="quadrant-label">{activeProject.quadrant.strategy.title}</span>
                    <p>{activeProject.quadrant.strategy.text}</p>
                  </div>

                  {/* Bottom Left — Execution */}
                  <div className="quadrant-cell">
                    <span className="quadrant-label">{activeProject.quadrant.execution.title}</span>
                    {activeProject.quadrant.execution.items ? (
                      <ul>
                        {activeProject.quadrant.execution.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{activeProject.quadrant.execution.text}</p>
                    )}
                  </div>

                  {/* Bottom Right — Results */}
                  <div className="quadrant-cell">
                    <span className="quadrant-label">{activeProject.quadrant.results.title}</span>
                    {activeProject.quadrant.results.items ? (
                      <ul>
                        {activeProject.quadrant.results.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{activeProject.quadrant.results.text}</p>
                    )}
                  </div>
                </div>

                {/* Gallery */}
                {activeProject.gallery.length > 0 && (
                  <div className="modal-gallery">
                    <span className="modal-gallery-label">Work Samples</span>
                    <div className="modal-gallery-grid">
                      {activeProject.gallery.map((item, i) => (
                        <div key={i} className="modal-gallery-item">
                          {item.label}
                        </div>
                      ))}
                    </div>
                    <div className="modal-tech">
                      {activeProject.tech.map((t) => (
                        <span key={t} className="modal-tech-badge">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default ClientWork
