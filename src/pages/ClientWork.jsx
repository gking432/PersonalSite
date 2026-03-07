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
    description: 'Create a complete brand identity and eCommerce presence for a print-on-demand dog apparel line featuring NFL team-inspired designs across all 32 franchises.',
    brief: 'Build a cohesive brand from scratch — logo, identity system, product designs for all 32 NFL teams, and a full eCommerce storefront ready for print-on-demand fulfillment.',
    strategy: 'Developed cohesive brand guidelines, designed team-specific product mockups, built the storefront, and created marketing assets for social media campaigns targeting pet owners who are sports fans.',
    scope: '32 unique team designs, complete brand guidelines, full eCommerce site, social ad campaigns, and print-on-demand integration.',
    screenshotLabel: 'PetUnis Storefront',
    modules: [
      {
        id: 'ads',
        label: 'Advertisements',
        items: [
          'Facebook carousel ads for each NFL division',
          'Instagram story ads targeting pet owners',
          'Retargeting ad creative for abandoned carts',
          'Seasonal promo ads (Super Bowl, Draft Day)',
          'A/B tested ad copy variations',
          'Video ads for product showcase'
        ]
      },
      {
        id: 'website',
        label: 'Website Content',
        items: [
          'Full eCommerce storefront on Shopify',
          'Product pages for all 32 team designs',
          'Homepage hero & featured collections',
          'About page & brand story',
          'Size guide & FAQ pages',
          'Blog posts for SEO'
        ]
      },
      {
        id: 'merchandising',
        label: 'Merchandising',
        items: [
          'Product mockups for all 32 teams',
          'Lifestyle photography concepts',
          'Product photography & flat lays',
          'Collection groupings by division',
          'Seasonal product bundles',
          'Print-on-demand spec sheets'
        ]
      }
    ],
    tech: ['eCommerce', 'Brand Design', 'Print on Demand', 'Social Media']
  },
  {
    id: 'weatherfixers',
    number: '02',
    name: 'WeatherFixers.com',
    type: 'Web App & Content Strategy',
    shortDesc: 'Storm damage weather aggregator connecting homeowners with local contractors after severe weather events.',
    description: 'Build a weather aggregation platform that identifies storm damage events and connects affected homeowners with vetted local contractors for repairs.',
    brief: 'Create a platform that pulls real-time weather data, detects storm damage events, and serves localized content to connect homeowners with contractors.',
    strategy: 'Designed the platform to pull weather data, identify damage-prone events, and serve localized content. Created the content strategy and marketing funnel to drive organic traffic from storm-affected areas.',
    scope: 'Full-stack web platform, weather API integration, content marketing system, local SEO strategy, and lead generation pipeline.',
    screenshotLabel: 'WeatherFixers Platform',
    modules: [
      {
        id: 'ads',
        label: 'Advertisements',
        items: [
          'Google Ads campaigns for storm-related keywords',
          'Facebook geo-targeted ads post-storm',
          'Local service ads for contractor partners',
          'Retargeting campaigns for return visitors',
          'Landing page ad creative'
        ]
      },
      {
        id: 'website',
        label: 'Website Content',
        items: [
          'Homepage with live weather feed',
          'Storm tracker dashboard',
          'Contractor directory pages',
          'Localized landing pages by city',
          'Blog content for SEO',
          'Lead capture forms'
        ]
      },
      {
        id: 'content',
        label: 'Content Strategy',
        items: [
          'SEO keyword research & mapping',
          'Localized content templates',
          'Storm damage resource guides',
          'Email nurture sequences',
          'Social media content calendar',
          'Contractor onboarding materials'
        ]
      }
    ],
    tech: ['Web Development', 'SEO', 'Content Strategy', 'API Integration']
  },
  {
    id: 'elevate-apparel',
    number: '03',
    name: 'Elevate Apparel',
    type: 'Brand & Ad Creative',
    shortDesc: 'Print-on-demand gymwear brand. Brand identity design with targeted ad creative for fitness enthusiasts.',
    description: 'Create brand identity and advertising creative for a print-on-demand activewear brand targeting gym-goers and fitness enthusiasts.',
    brief: 'Design a bold, high-energy brand that stands out in the crowded activewear market with aspirational messaging and clean product visuals.',
    strategy: 'Developed a bold, high-energy brand aesthetic that stands out in the crowded activewear market. Focused on aspirational messaging and clean product photography for ad campaigns.',
    scope: 'Complete brand package, ad creative suite, social media templates, and full product line designs.',
    screenshotLabel: 'Elevate Apparel Brand',
    modules: [
      {
        id: 'ads',
        label: 'Advertisements',
        items: [
          'Instagram feed ads with lifestyle imagery',
          'Facebook dynamic product ads',
          'TikTok short-form video ads',
          'Ad copy & campaign structure',
          'A/B tested creative variations'
        ]
      },
      {
        id: 'brand',
        label: 'Brand Design',
        items: [
          'Logo & wordmark system',
          'Color palette & typography',
          'Brand guidelines document',
          'Social media templates',
          'Packaging mockups',
          'Pattern & textile designs'
        ]
      },
      {
        id: 'product',
        label: 'Product Mockups',
        items: [
          'Leggings & shorts designs',
          'Tank top & sports bra designs',
          'Hoodie & jacket designs',
          'Lifestyle mockup renders',
          'Flat lay compositions',
          'Size chart graphics'
        ]
      }
    ],
    tech: ['Brand Design', 'Ad Creative', 'Print on Demand', 'Paid Social']
  },
  {
    id: 'hospice-nonprofit',
    number: '04',
    name: 'Hospice Nonprofit',
    type: 'Website Redesign',
    shortDesc: 'Complete homepage redesign for a hospice care nonprofit. Modernized their web presence with compassionate, clear design.',
    description: 'Redesign the homepage for a hospice care nonprofit that needed a modern, compassionate web presence to better serve families and attract donors.',
    brief: 'Modernize a dated nonprofit website to better serve families seeking hospice care information while also improving the donation experience.',
    strategy: 'Focused on warmth, clarity, and trust. Redesigned the information architecture to prioritize the most common visitor needs: understanding services, contacting the organization, and donating.',
    scope: 'Modernized visual identity, clearer navigation, better mobile experience, improved donation flow, and professional credibility.',
    screenshotLabel: 'Hospice Homepage Redesign',
    modules: [
      {
        id: 'website',
        label: 'Website Design',
        items: [
          'Complete homepage redesign',
          'Services overview section',
          'Team & about page',
          'Contact & referral forms',
          'Donation page redesign',
          'Resource library layout'
        ]
      },
      {
        id: 'ux',
        label: 'UX & Navigation',
        items: [
          'Information architecture audit',
          'Simplified navigation structure',
          'Clear calls-to-action placement',
          'Mobile-responsive layouts',
          'Accessibility improvements',
          'User flow optimization'
        ]
      },
      {
        id: 'content',
        label: 'Content',
        items: [
          'Compassionate copywriting',
          'Service descriptions',
          'FAQ content',
          'Testimonial layouts',
          'Blog post templates'
        ]
      }
    ],
    tech: ['Web Design', 'UX', 'Nonprofit', 'Responsive Design']
  },
  {
    id: 'blue-lizard',
    number: '05',
    name: 'Blue Lizard Bar & Grill',
    type: 'Website Redesign',
    shortDesc: 'Modern website redesign for a bar and grill. Clean, appetizing design that drives reservations and foot traffic.',
    description: 'Design a modern, visually appealing website for a bar and grill that showcases the atmosphere, menu, and drives customer visits.',
    brief: 'Create an inviting web presence that captures the restaurant\'s energy, showcases the menu, and makes it easy for customers to find hours, location, and reserve a table.',
    strategy: 'Built around the dining experience. Bold food photography, easy-to-find hours and location, and a design that captures the energy of the restaurant without being cluttered.',
    scope: 'Full website mockup, responsive design, brand-aligned visuals, and optimized user flow.',
    screenshotLabel: 'Blue Lizard Homepage',
    modules: [
      {
        id: 'website',
        label: 'Website Design',
        items: [
          'Homepage with hero imagery',
          'Menu presentation pages',
          'Events & specials section',
          'Location & hours module',
          'Photo gallery of atmosphere',
          'Mobile-first responsive layout'
        ]
      },
      {
        id: 'menu',
        label: 'Menu Design',
        items: [
          'Digital menu layout',
          'Category organization',
          'Featured items highlights',
          'Drink menu presentation',
          'Seasonal specials template'
        ]
      },
      {
        id: 'branding',
        label: 'Branding',
        items: [
          'Web color palette refinement',
          'Typography selections',
          'Photography art direction',
          'Social media cover images',
          'Brand-consistent iconography'
        ]
      }
    ],
    tech: ['Web Design', 'Restaurant', 'Responsive Design']
  },
  {
    id: 'mc-seafood',
    number: '06',
    name: 'M&C Seafood',
    type: 'Website Redesign',
    shortDesc: 'Website redesign for a seafood restaurant. Fresh, ocean-inspired design highlighting the menu and coastal brand.',
    description: 'Create a fresh, modern website design for a seafood restaurant that conveys quality, freshness, and coastal charm.',
    brief: 'Design a coastal-inspired website that puts the menu front and center while conveying the freshness and quality of the seafood offerings.',
    strategy: 'Leaned into the coastal aesthetic with clean blues and whites. Designed around the menu as the centerpiece, with easy ordering flow and location information front and center.',
    scope: 'Full website mockup, brand-aligned design, responsive layout, and menu presentation system.',
    screenshotLabel: 'M&C Seafood Homepage',
    modules: [
      {
        id: 'website',
        label: 'Website Design',
        items: [
          'Homepage with ocean-inspired hero',
          'Menu-focused layout design',
          'Online ordering flow',
          'Location & hours section',
          'Catering inquiry page',
          'Mobile-responsive design'
        ]
      },
      {
        id: 'menu',
        label: 'Menu Design',
        items: [
          'Digital seafood menu layout',
          'Daily specials section',
          'Market price display system',
          'Combo & family meal layouts',
          'Seasonal menu template'
        ]
      },
      {
        id: 'branding',
        label: 'Branding',
        items: [
          'Coastal color palette',
          'Typography & web fonts',
          'Photography style direction',
          'Brand pattern elements',
          'Social media templates'
        ]
      }
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
  const [activeModule, setActiveModule] = useState(null)

  useEffect(() => {
    if (activeProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeProject])

  const handleClose = () => {
    setActiveProject(null)
    setActiveModule(null)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <PageTransition>
      <div className="client-work">
        {/* Hero */}
        <section className="client-work-hero">
          <div className="container">
            <div className="hero-split">
              <div className="hero-split-left">
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
              <motion.div
                className="hero-meta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Clients</span>
                  <span className="hero-meta-value">6 Projects</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Industries</span>
                  <span className="hero-meta-value">eCommerce, SaaS, Food, Nonprofit</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Services</span>
                  <span className="hero-meta-value">Brand, Web, Ads, Strategy</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Approach</span>
                  <span className="hero-meta-value hero-meta-status">End-to-end delivery</span>
                </div>
              </motion.div>
            </div>
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
                      {project.modules.slice(0, 4).map((mod, i) => (
                        <div key={i} className="featured-preview-slot">
                          {mod.label}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Project Modal */}
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
              <div className="modal-layout" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="modal-close-btn" onClick={handleClose}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                <AnimatePresence mode="wait">
                  {activeModule ? (
                    /* ===== DRILL-DOWN VIEW ===== */
                    <motion.div
                      key="drilldown"
                      className="modal-drilldown"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: ndsEase }}
                    >
                      {/* Back button card */}
                      <motion.div
                        className="modal-card modal-back-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: ndsEase }}
                      >
                        <button className="modal-back-btn" onClick={() => setActiveModule(null)}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Back to {activeProject.name}
                        </button>
                        <h2>{activeModule.label}</h2>
                        <p className="drilldown-subtitle">{activeProject.name} — {activeProject.type}</p>
                      </motion.div>

                      {/* Items grid */}
                      <motion.div
                        className="drilldown-items-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        {activeModule.items.map((item, i) => (
                          <motion.div
                            key={i}
                            className="modal-card drilldown-item"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 * i, ease: ndsEase }}
                          >
                            <div className="drilldown-item-number">{String(i + 1).padStart(2, '0')}</div>
                            <p>{item}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* ===== MAIN PROJECT VIEW ===== */
                    <motion.div
                      key="overview"
                      className="modal-overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: ndsEase }}
                    >
                      {/* Title Card */}
                      <motion.div
                        className="modal-card modal-title-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: ndsEase }}
                      >
                        <h2>{activeProject.name}</h2>
                        <p className="modal-type">{activeProject.type}</p>
                        <p className="modal-desc">{activeProject.description}</p>
                      </motion.div>

                      {/* Middle Row: Screenshot + Brief/Strategy/Scope */}
                      <div className="modal-middle-row">
                        <motion.div
                          className="modal-card modal-screenshot-card"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.08, ease: ndsEase }}
                        >
                          <div className="screenshot-placeholder">
                            {activeProject.screenshotLabel}
                          </div>
                        </motion.div>

                        <motion.div
                          className="modal-card modal-brief-card"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.15, ease: ndsEase }}
                        >
                          <div className="brief-section">
                            <span className="brief-label">The Brief</span>
                            <p>{activeProject.brief}</p>
                          </div>
                          <div className="brief-section">
                            <span className="brief-label">Strategy</span>
                            <p>{activeProject.strategy}</p>
                          </div>
                          <div className="brief-section">
                            <span className="brief-label">Scope</span>
                            <p>{activeProject.scope}</p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Bottom Row: What I Built — Drill-Down Modules */}
                      <div className="modal-modules-row">
                        <motion.span
                          className="modules-row-label"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          What I Built
                        </motion.span>
                        <div className="modal-modules-grid">
                          {activeProject.modules.map((mod, i) => (
                            <motion.div
                              key={mod.id}
                              className="modal-card modal-module-card"
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease: ndsEase }}
                              onClick={() => setActiveModule(mod)}
                            >
                              <span className="module-label">{mod.label}</span>
                              <span className="module-count">{mod.items.length} items</span>
                              <svg className="module-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

export default ClientWork
