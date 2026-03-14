import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import petunisTeams from '../data/petunis-teams.json'
import petunisForPeople from '../data/petunis-for-people.json'
import petunisAds from '../data/petunis-ads.json'
import petunisDesignFiles from '../data/petunis-designfiles.json'
import weatherfixersAds from '../data/weatherfixers-ads.json'
import weatherfixersPostcards from '../data/weatherfixers-postcards.json'
import './ClientWork.css'

const ndsEase = [0.22, 1, 0.36, 1]

const clientProjects = [
  {
    id: 'petunis',
    year: '2023',
    name: 'PetUnis',
    type: 'Brand Design & eCommerce',
    shortDesc: 'NFL-inspired dog uniforms. Full brand identity, product design, and eCommerce buildout across all 32 teams.',
    featured: true,
    description: 'Create a complete brand identity and eCommerce presence for a print-on-demand dog apparel line featuring NFL team-inspired designs across all 32 franchises.',
    brief: 'Build a cohesive brand from scratch — logo, identity system, product designs for all 32 NFL teams, and a full eCommerce storefront ready for print-on-demand fulfillment.',
    strategy: 'Developed cohesive brand guidelines, designed team-specific product mockups, built the storefront, and created marketing assets for social media campaigns targeting pet owners who are sports fans.',
    scope: '32 unique team designs, complete brand guidelines, full eCommerce site, social ad campaigns, and print-on-demand integration.',
    screenshotLabel: 'PetUnis Storefront',
    screenshotImage: '/images/petunis-storefront.png',
    modules: [
      {
        id: 'ads',
        label: 'Advertisements',
        adsImagesFolder: 'petunis-ads',
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
        websiteUrl: 'https://gunnarneuman7.wixsite.com/my-site-18',
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
        heroImage: '/images/petunis-merchandising-hero.png',
        teamsImagesFolder: 'petunis-teams',
        designFilesFolder: 'petunis-designfiles',
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
    year: '2024',
    name: 'WeatherFixers.com',
    type: 'Lead Aggregation Website',
    shortDesc: 'Lead aggregation website for storm damage professionals. Website design, digital ads, and direct mail postcards.',
    description: 'Designed a lead aggregation website that connects storm damage contractors with homeowners in affected areas. Created the website, digital advertisements, and direct door mailing postcards.',
    brief: 'Build a lead aggregation website for storm damage pros. Design the site, run digital ad campaigns, and create direct mail postcards for door-to-door outreach.',
    strategy: 'Designed the website to capture and qualify leads for storm damage contractors. Created targeted digital ad campaigns and direct mail postcards for geographic areas hit by severe weather.',
    scope: 'Website design, digital advertisements, direct door mailing postcards, and lead capture system.',
    screenshotLabel: 'WeatherFixers Website',
    screenshotImage: '/WeatherFixers/Storefront.png',
    modules: [
      {
        id: 'ads',
        label: 'Digital Advertisements',
        adsImagesFolder: 'WeatherFixers/Ads',
        adsBasePath: '',
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
        label: 'Website',
        websiteUrl: 'https://gunnarneuman7.wixstudio.com/my-site-21',
        items: [
          'Website design and build',
          'Lead capture forms',
          'Contractor-focused landing pages',
          'Homeowner-facing content',
          'Mobile-responsive layout'
        ]
      },
      {
        id: 'directmail',
        label: 'Direct Mail',
        postcardsImagesFolder: 'WeatherFixers/Ads',
        postcardsBasePath: '',
        items: [
          'Direct door mailing postcard design',
          'Geo-targeted mail campaigns',
          'Post-storm outreach creative'
        ]
      }
    ],
    tech: ['Web Design', 'Digital Ads', 'Direct Mail', 'Lead Gen']
  },
  {
    id: 'elevate-apparel',
    year: '2024',
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
    year: '2023',
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
    year: '2023',
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
    year: '2023',
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

/* ─── Tabbed Gallery for Merchandising ─── */
function MerchandisingTabs({ mod }) {
  const [activeTab, setActiveTab] = useState('pets')
  const scrollRef = useRef(null)

  const tabs = [
    { id: 'pets', label: 'For Pets' },
    { id: 'people', label: 'For People' },
    ...(mod.designFilesFolder ? [{ id: 'designs', label: 'Design Files' }] : [])
  ]

  // Reset scroll when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  return (
    <div className="merch-tabs">
      <div className="merch-tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`merch-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="merch-tabs-viewport" ref={scrollRef}>
        <AnimatePresence mode="wait">
          {activeTab === 'pets' && (
            <motion.div
              key="pets"
              className="merch-tabs-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: ndsEase }}
            >
              <div className="client-module-teams-grid">
                {petunisTeams.map((filename) => (
                  <img
                    key={filename}
                    src={`/pdfs/${mod.teamsImagesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`}
                    alt=""
                    loading="lazy"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'people' && (
            <motion.div
              key="people"
              className="merch-tabs-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: ndsEase }}
            >
              <div className="client-module-teams-grid">
                {petunisForPeople.map((filename) => (
                  <img
                    key={filename}
                    src={`/pdfs/${mod.teamsImagesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`}
                    alt=""
                    loading="lazy"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'designs' && mod.designFilesFolder && (
            <motion.div
              key="designs"
              className="merch-tabs-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: ndsEase }}
            >
              {(() => {
                const byTeam = petunisDesignFiles.reduce((acc, path) => {
                  const team = path.split('/')[0]
                  if (!acc[team]) acc[team] = []
                  acc[team].push(path)
                  return acc
                }, {})
                const teamDisplayName = (name) => name === 'Ravens' ? 'Bengals' : name
                return Object.entries(byTeam)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([team, files]) => (
                    <div key={team} className="client-module-design-team">
                      <span className="client-module-design-team-label">{teamDisplayName(team)}</span>
                      <div className="client-module-design-grid">
                        {files.map((filename) => (
                          <div key={filename} className="client-module-design-item">
                            <img
                              src={`/pdfs/${mod.designFilesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`}
                              alt=""
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Inline Project Section ─── */
function ProjectSection({ project, index, isExpanded, onToggle }) {
  const isAlt = index % 2 !== 0
  const number = String(index + 1).padStart(2, '0')
  const sectionRef = useRef(null)
  const [expandedModules, setExpandedModules] = useState({})
  const moduleRefs = useRef({})
  const moduleButtonRefs = useRef({})

  const toggleModule = (modId) => {
    const wasExpanded = expandedModules[modId]
    
    // If opening a new module, close all others first
    if (!wasExpanded) {
      setExpandedModules({ [modId]: true })
      
      // Wait for DOM to update and animations to settle before scrolling
      // Use requestAnimationFrame to ensure layout has updated
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const buttonRef = moduleButtonRefs.current[modId]
            if (buttonRef) {
              const headerHeight = 80 // --header-height from CSS
              const buttonPosition = buttonRef.getBoundingClientRect().top + window.pageYOffset
              const offsetPosition = buttonPosition - headerHeight
              
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              })
            }
          }, 450) // Wait for module close animation (400ms) + buffer
        })
      })
    } else {
      // Closing the module
      setExpandedModules(prev => ({ ...prev, [modId]: false }))
    }
  }

  const handleToggle = () => {
    if (isExpanded) {
      onToggle(null)
      setExpandedModules({})
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      onToggle(project.id)
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const content = (
    <div className="container" ref={sectionRef}>
      {/* Header — always visible */}
      <motion.div
        className="client-feature-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.span className="client-feature-number" variants={fadeUp}>
          {number}
        </motion.span>
        <motion.h2 className="client-feature-name" variants={fadeUp}>
          {project.name}
        </motion.h2>
        <motion.p className="client-feature-tagline" variants={fadeUp}>
          {project.type} · {project.year}
        </motion.p>
      </motion.div>

      {/* Body — swaps between default and expanded */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* ─── DEFAULT VIEW ─── */
          <motion.div
            key="default"
            className="client-feature-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: ndsEase }}
          >
            <motion.div
              className="client-feature-left"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              {project.featured && project.screenshotImage ? (
                <div className="client-feature-preview">
                  <div className="client-feature-preview-slot">
                    <img src="/pdfs/Test%20PetUnis%20Ads.png" alt="" />
                  </div>
                  <div className="client-feature-preview-slot">
                    <img src={project.screenshotImage} alt="" />
                  </div>
                  <div className="client-feature-preview-slot">
                    <img src="/pdfs/For%20People%20Background.png" alt="" />
                  </div>
                </div>
              ) : project.screenshotImage ? (
                <div className="client-feature-screenshot">
                  <img src={project.screenshotImage} alt={project.screenshotLabel} />
                </div>
              ) : (
                <div className="client-feature-scope">
                  <span className="client-feature-scope-label">Scope</span>
                  <div className="client-feature-scope-list">
                    {project.modules.map((mod) => (
                      <span key={mod.id} className="client-feature-scope-item">{mod.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
            <div className="client-feature-details">
              <p className="client-feature-desc">{project.shortDesc}</p>
              <div className="client-feature-tech">
                {project.tech.map((tech) => (
                  <span key={tech} className="tech-badge">{tech}</span>
                ))}
              </div>
              <button className="client-feature-cta" onClick={handleToggle}>
                View Project
              </button>
            </div>
          </motion.div>
        ) : (
          /* ─── EXPANDED VIEW — replaces body ─── */
          <motion.div
            key="expanded"
            className="client-expand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: ndsEase }}
          >
            {/* Brief / Strategy / Scope — 3-column */}
            <div className="client-expand-meta">
              <motion.div
                className="client-expand-meta-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: ndsEase }}
              >
                <span className="client-expand-meta-label">The Brief</span>
                <p>{project.brief}</p>
              </motion.div>
              <motion.div
                className="client-expand-meta-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: ndsEase }}
              >
                <span className="client-expand-meta-label">Strategy</span>
                <p>{project.strategy}</p>
              </motion.div>
              <motion.div
                className="client-expand-meta-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: ndsEase }}
              >
                <span className="client-expand-meta-label">Scope</span>
                <p>{project.scope}</p>
              </motion.div>
            </div>

            {/* Modules — expandable subsections */}
            <div className="client-expand-modules">
              <span className="client-expand-section-label">What I Built</span>

              {project.modules.map((mod, mi) => {
                const modExpanded = expandedModules[mod.id]

                return (
                  <motion.div
                    key={mod.id}
                    ref={(el) => { if (el) moduleRefs.current[mod.id] = el }}
                    className="client-module-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + mi * 0.06, ease: ndsEase }}
                  >
                    <button
                      ref={(el) => { if (el) moduleButtonRefs.current[mod.id] = el }}
                      className={`client-module-row ${modExpanded ? 'active' : ''}`}
                      onClick={() => toggleModule(mod.id)}
                    >
                      <div className="client-module-row-left">
                        <span className="client-module-number">{String(mi + 1).padStart(2, '0')}</span>
                        <span className="client-module-name">{mod.label}</span>
                      </div>
                      <div className="client-module-row-right">
                        <span className="client-module-count">{mod.items.length} deliverables</span>
                        <svg className={`client-module-chevron ${modExpanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    <AnimatePresence>
                      {modExpanded && (
                        <motion.div
                          className="client-module-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: ndsEase }}
                        >
                          <div className="client-module-content-inner">
                            {/* Website iframe */}
                            {mod.websiteUrl && (
                              <div className="client-module-iframe-container">
                                <div className="client-module-iframe-bar"></div>
                                <div className="client-module-iframe-wrap">
                                  <iframe
                                    src={mod.websiteUrl}
                                    title={`${project.name} — ${mod.label}`}
                                    className="client-module-iframe"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Deliverables list */}
                            <div className="client-module-deliverables">
                              {mod.items.map((item, i) => (
                                <div key={i} className="client-module-deliverable">
                                  <span className="client-module-deliverable-num">{String(i + 1).padStart(2, '0')}</span>
                                  <p>{item}</p>
                                </div>
                              ))}
                            </div>

                            {/* Hero image */}
                            {mod.heroImage && (
                              <div className="client-module-hero-img">
                                <img src={mod.heroImage} alt={mod.label} />
                              </div>
                            )}

                            {/* Ads masonry */}
                            {mod.adsImagesFolder && (
                              <div className="client-module-masonry">
                                {(project.id === 'weatherfixers' ? weatherfixersAds : petunisAds).map((filename) => {
                                  const base = mod.adsBasePath === '' ? '' : (mod.adsBasePath || 'pdfs')
                                  const encoded = filename.split('/').map(encodeURIComponent).join('/')
                                  const src = base ? `/${base}/${mod.adsImagesFolder}/${encoded}` : `/${mod.adsImagesFolder}/${encoded}`
                                  return (
                                    <div key={filename} className="client-module-masonry-item">
                                      <img src={src} alt="" loading="lazy" />
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Postcards grid */}
                            {mod.postcardsImagesFolder && (
                              <div className="client-module-postcards">
                                {weatherfixersPostcards.map((filename) => {
                                  const base = mod.postcardsBasePath === '' ? '' : (mod.postcardsBasePath || 'pdfs')
                                  const encoded = filename.split('/').map(encodeURIComponent).join('/')
                                  const src = base ? `/${base}/${mod.postcardsImagesFolder}/${encoded}` : `/${mod.postcardsImagesFolder}/${encoded}`
                                  return (
                                    <div key={filename} className="client-module-postcard-item">
                                      <img src={src} alt="" loading="lazy" />
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Tabbed gallery — For Pets / For People / Design Files */}
                            {mod.teamsImagesFolder && (
                              <MerchandisingTabs mod={mod} />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Close button */}
            <button className="client-expand-close" onClick={handleToggle}>
              Close Project
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (isAlt) {
    return (
      <SqueezeSection key={project.id} className="client-feature client-feature-alt">
        {content}
      </SqueezeSection>
    )
  }

  return (
    <section key={project.id} className="client-feature">
      {content}
    </section>
  )
}

function ClientWork() {
  const [expandedProject, setExpandedProject] = useState(null)

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
                  {'Marketing That Converts'.split(' ').map((word, i) => (
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
                  <span className="hero-meta-value">eCommerce, Lead Gen, Food, Nonprofit</span>
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

        {/* Projects */}
        {clientProjects.map((project, index) => (
          <ProjectSection
            key={project.id}
            project={project}
            index={index}
            isExpanded={expandedProject === project.id}
            onToggle={setExpandedProject}
          />
        ))}
      </div>
    </PageTransition>
  )
}

export default ClientWork
