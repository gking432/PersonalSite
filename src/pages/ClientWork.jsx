import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

const staggerItem = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ndsEase } }
}

// Preload images function
function preloadImages(imageUrls) {
  imageUrls.forEach((url) => {
    const img = new Image()
    img.src = url
  })
}

// Get image URLs for a specific module
function getModuleImageUrls(module, project) {
  const imageUrls = []

  // Ads images
  if (module.adsImagesFolder) {
    const ads = project?.id === 'weatherfixers' ? weatherfixersAds : petunisAds
    ads.forEach((filename) => {
      const base = module.adsBasePath === '' ? '' : (module.adsBasePath || 'pdfs')
      const encoded = filename.split('/').map(encodeURIComponent).join('/')
      const src = base ? `/${base}/${module.adsImagesFolder}/${encoded}` : `/${module.adsImagesFolder}/${encoded}`
      imageUrls.push(src)
    })
  }

  // Postcards images
  if (module.postcardsImagesFolder) {
    weatherfixersPostcards.forEach((filename) => {
      const base = module.postcardsBasePath === '' ? '' : (module.postcardsBasePath || 'pdfs')
      const encoded = filename.split('/').map(encodeURIComponent).join('/')
      const src = base ? `/${base}/${module.postcardsImagesFolder}/${encoded}` : `/${module.postcardsImagesFolder}/${encoded}`
      imageUrls.push(src)
    })
  }

  // Teams images
  if (module.teamsImagesFolder) {
    petunisTeams.forEach((filename) => {
      const src = `/pdfs/${module.teamsImagesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`
      imageUrls.push(src)
    })
    petunisForPeople.forEach((filename) => {
      const src = `/pdfs/${module.teamsImagesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`
      imageUrls.push(src)
    })
  }

  // Design files images
  if (module.designFilesFolder) {
    petunisDesignFiles.forEach((filename) => {
      const src = `/pdfs/${module.designFilesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`
      imageUrls.push(src)
    })
  }

  // Hero image
  if (module.heroImage) {
    imageUrls.push(module.heroImage)
  }

  return imageUrls
}

function ClientWork() {
  const [activeProject, setActiveProject] = useState(null)
  const [activeModule, setActiveModule] = useState(null)
  const [showTeamsImages, setShowTeamsImages] = useState(false)
  const [showForPeopleImages, setShowForPeopleImages] = useState(false)
  const [showDesignFiles, setShowDesignFiles] = useState(false)
  const [websitePreviewUrl, setWebsitePreviewUrl] = useState(null)

  useEffect(() => {
    const locked = activeProject || showTeamsImages || showForPeopleImages || showDesignFiles || websitePreviewUrl
    document.documentElement.classList.toggle('modal-open', locked)
    return () => document.documentElement.classList.remove('modal-open')
  }, [activeProject, showTeamsImages, showForPeopleImages, showDesignFiles, websitePreviewUrl])

  // Preload images when activeModule changes (throttled to avoid performance issues)
  useEffect(() => {
    if (!activeModule || !activeProject) return

    // Use requestIdleCallback to preload during idle time, avoiding animation lag
    const schedulePreload = (callback) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 1000 })
      } else {
        setTimeout(callback, 200)
      }
    }

    schedulePreload(() => {
      const imageUrls = getModuleImageUrls(activeModule, activeProject)

      // Start preloading (batch to avoid overwhelming the browser)
      const batchSize = 8 // Smaller batches
      for (let i = 0; i < imageUrls.length; i += batchSize) {
        setTimeout(() => {
          preloadImages(imageUrls.slice(i, i + batchSize))
        }, i * 80) // Increased stagger time to reduce load
      }
    })
  }, [activeModule, activeProject])

  const handleClose = () => {
    setActiveProject(null)
    setActiveModule(null)
    setShowTeamsImages(false)
    setShowForPeopleImages(false)
    setShowDesignFiles(false)
    setWebsitePreviewUrl(null)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const websiteModuleForActiveProject =
    activeProject?.modules?.find((mod) => mod.websiteUrl)

  return (
    <PageTransition>
      <div className="client-work">
        {showTeamsImages && activeModule?.teamsImagesFolder && createPortal(
          <div
            className="teams-images-overlay"
            onClick={() => setShowTeamsImages(false)}
          >
            <button className="teams-images-close" onClick={(e) => { e.stopPropagation(); setShowTeamsImages(false); }} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="teams-images-header">
              <h2 className="teams-images-title">PetUnis — All 32 Teams</h2>
              <p className="teams-images-subtitle">Product mockups for every NFL franchise</p>
            </div>
            <div className="teams-images-scroll" onClick={(e) => e.stopPropagation()}>
              {petunisTeams
                .filter((filename) => !filename.startsWith('For People/'))
                .map((filename) => (
                <img
                  key={filename}
                  src={`/pdfs/${activeModule.teamsImagesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`}
                  alt=""
                />
              ))}
            </div>
          </div>,
          document.body
        )}
        {showForPeopleImages && activeModule?.teamsImagesFolder && createPortal(
          <div
            className="teams-images-overlay"
            onClick={() => setShowForPeopleImages(false)}
          >
            <button className="teams-images-close" onClick={(e) => { e.stopPropagation(); setShowForPeopleImages(false); }} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="teams-images-header">
              <h2 className="teams-images-title">PetUnis — For People</h2>
              <p className="teams-images-subtitle">Product mockups for people apparel</p>
            </div>
            <div className="teams-images-scroll" onClick={(e) => e.stopPropagation()}>
              {petunisForPeople.map((filename) => (
                <img
                  key={filename}
                  src={`/pdfs/${activeModule.teamsImagesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`}
                  alt=""
                />
              ))}
            </div>
          </div>,
          document.body
        )}
        {showDesignFiles && activeModule?.designFilesFolder && createPortal(
          <div
            className="teams-images-overlay"
            onClick={() => setShowDesignFiles(false)}
          >
            <button className="teams-images-close" onClick={(e) => { e.stopPropagation(); setShowDesignFiles(false); }} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="teams-images-header">
              <h2 className="teams-images-title">PetUnis — Design Files</h2>
              <p className="teams-images-subtitle">Design assets for all 32 NFL teams</p>
            </div>
            <div className="design-files-scroll" onClick={(e) => e.stopPropagation()}>
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
                  <div key={team} className="design-files-team-section">
                    <h3 className="design-files-team-label">{teamDisplayName(team)}</h3>
                    <div className="design-files-masonry">
                      {files.map((filename) => (
                        <div key={filename} className="design-files-masonry-item">
                          <img
                            src={`/pdfs/${activeModule.designFilesFolder}/${filename.split('/').map(encodeURIComponent).join('/')}`}
                            alt=""
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>,
          document.body
        )}
        {websitePreviewUrl && createPortal(
          <div
            className="teams-images-overlay website-preview-overlay"
            onClick={() => setWebsitePreviewUrl(null)}
          >
            <button className="teams-images-close" onClick={(e) => { e.stopPropagation(); setWebsitePreviewUrl(null); }} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="website-preview-header">
              <h2 className="teams-images-title">{activeProject?.name || 'Website'} — Website</h2>
              <p className="teams-images-subtitle">Live preview</p>
            </div>
            <div
              className={`website-preview-iframe-wrap white-bar-${activeProject?.id === 'petunis' ? 'petunis' : 'weatherfixers'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="website-preview-white-bar"></div>
              <iframe
                src={websitePreviewUrl}
                title={`${activeProject?.name || 'Website'} website preview`}
                className="website-preview-iframe"
              />
            </div>
          </div>,
          document.body
        )}
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

        {/* Featured Projects — Editorial Layout */}
        {clientProjects.map((project, index) => {
          const isAlt = index % 2 !== 0
          const number = String(index + 1).padStart(2, '0')

          const projectContent = (
            <div className="container">
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

              <div className="client-feature-body">
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
                <motion.div
                  className="client-feature-details"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={staggerContainer}
                >
                  <motion.p className="client-feature-desc" variants={fadeUp}>{project.shortDesc}</motion.p>
                  <motion.div className="client-feature-tech" variants={fadeUp}>
                    {project.tech.map((tech) => (
                      <span key={tech} className="tech-badge">{tech}</span>
                    ))}
                  </motion.div>
                  <motion.button
                    className="client-feature-cta"
                    variants={fadeUp}
                    onClick={() => setActiveProject(project)}
                  >
                    View Project
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )

          if (isAlt) {
            return (
              <SqueezeSection key={project.id} className="client-feature client-feature-alt">
                {projectContent}
              </SqueezeSection>
            )
          }

          return (
            <section key={project.id} className="client-feature">
              {projectContent}
            </section>
          )
        })}

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
                        <div className="modal-back-card-header">
                          <button className="modal-back-btn modal-icon-btn" onClick={() => setActiveModule(null)} aria-label={`Back to ${activeProject.name}`}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M12 16l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="modal-close-btn modal-icon-btn" onClick={handleClose} aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                        <h2>{activeModule.label}</h2>
                        <p className="drilldown-subtitle">{activeProject.name} — {activeProject.type}</p>
                      </motion.div>

                      {/* Hero section with banner */}
                      {activeModule.heroImage && (
                        <motion.div
                          className="drilldown-hero"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05, ease: ndsEase }}
                        >
                          <img src={activeModule.heroImage} alt={activeModule.label} />
                        </motion.div>
                      )}

                      {/* Ads masonry, postcards masonry, OR 3 category cards */}
                      {activeModule.adsImagesFolder ? (
                        <motion.div
                          className="drilldown-ads-masonry"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: ndsEase }}
                        >
                          {(activeProject?.id === 'weatherfixers' ? weatherfixersAds : petunisAds).map((filename) => {
                            const base = activeModule.adsBasePath === '' ? '' : (activeModule.adsBasePath || 'pdfs')
                            const encoded = filename.split('/').map(encodeURIComponent).join('/')
                            const src = base ? `/${base}/${activeModule.adsImagesFolder}/${encoded}` : `/${activeModule.adsImagesFolder}/${encoded}`
                            return (
                              <div key={filename} className="drilldown-ads-masonry-item">
                                <img src={src} alt="" />
                              </div>
                            )
                          })}
                        </motion.div>
                      ) : activeModule.postcardsImagesFolder ? (
                        <motion.div
                          className="drilldown-ads-masonry drilldown-postcards-masonry"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: ndsEase }}
                        >
                          {weatherfixersPostcards.map((filename) => {
                            const base = activeModule.postcardsBasePath === '' ? '' : (activeModule.postcardsBasePath || 'pdfs')
                            const encoded = filename.split('/').map(encodeURIComponent).join('/')
                            const src = base ? `/${base}/${activeModule.postcardsImagesFolder}/${encoded}` : `/${activeModule.postcardsImagesFolder}/${encoded}`
                            return (
                              <div key={filename} className="drilldown-ads-masonry-item">
                                <img src={src} alt="" />
                              </div>
                            )
                          })}
                        </motion.div>
                      ) : (
                        <div className="drilldown-categories-grid">
                          {(() => {
                            const items = activeModule.items
                            const chunkSize = Math.ceil(items.length / 3)
                            const chunks = [0, 1, 2].map(i => items.slice(i * chunkSize, (i + 1) * chunkSize))
                            return chunks.map((chunk, chunkIdx) => {
                              const isTeamsCard = activeModule.teamsImagesFolder && chunkIdx === 0
                              const isForPeopleCard = activeModule.teamsImagesFolder && chunkIdx === 1
                              const isDesignFilesCard = activeModule.designFilesFolder && chunkIdx === 2
                              const heroBgUrl = isTeamsCard
                                ? `/pdfs/${encodeURIComponent('Test PetUnis Ads.png')}`
                                : isForPeopleCard
                                  ? `/pdfs/${encodeURIComponent('For People Background.png')}`
                                  : isDesignFilesCard
                                    ? (() => {
                                        const firstRavens = petunisDesignFiles.find((p) => p.startsWith('Ravens/'))
                                        return firstRavens
                                          ? `/pdfs/${activeModule.designFilesFolder}/${firstRavens.split('/').map(encodeURIComponent).join('/')}`
                                          : null
                                      })()
                                    : null
                              const isHeroCard = isTeamsCard || isForPeopleCard || isDesignFilesCard
                              return (
                                <motion.div
                                  key={chunkIdx}
                                  className={`modal-card drilldown-category-card ${isHeroCard ? 'clickable teams-hero-card' : ''} ${isForPeopleCard ? 'for-people-hero-card' : ''}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.1 + chunkIdx * 0.05, ease: ndsEase }}
                                  onClick={isTeamsCard ? () => setShowTeamsImages(true) : isForPeopleCard ? () => setShowForPeopleImages(true) : isDesignFilesCard ? () => setShowDesignFiles(true) : undefined}
                                >
                                  {isTeamsCard ? (
                                    <>
                                      <img
                                        src={heroBgUrl}
                                        alt=""
                                        className="teams-hero-card-bg"
                                      />
                                      <div className="teams-hero-card-overlay">
                                        <span className="teams-hero-card-text">For Pets</span>
                                      </div>
                                    </>
                                  ) : isForPeopleCard ? (
                                    <>
                                      <img
                                        src={heroBgUrl}
                                        alt=""
                                        className="teams-hero-card-bg"
                                      />
                                      <div className="teams-hero-card-overlay">
                                        <span className="teams-hero-card-text">For People</span>
                                      </div>
                                    </>
                                  ) : isDesignFilesCard ? (
                                    <>
                                      <img
                                        src={heroBgUrl}
                                        alt=""
                                        className="teams-hero-card-bg"
                                      />
                                      <div className="teams-hero-card-overlay">
                                        <span className="teams-hero-card-text">Design Files</span>
                                      </div>
                                    </>
                                  ) : (
                                    chunk.map((item, i) => (
                                      <div key={i} className="drilldown-category-item">
                                        <span className="drilldown-item-number">{String(chunkIdx * chunkSize + i + 1).padStart(2, '0')}</span>
                                        <p>{item}</p>
                                      </div>
                                    ))
                                  )}
                                </motion.div>
                              )
                            })
                          })()}
                        </div>
                      )}
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
                        <div className="modal-title-card-header">
                          <h2>{activeProject.name}</h2>
                          <button className="modal-close-btn modal-icon-btn" onClick={handleClose} aria-label="Close">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                        <p className="modal-type">{activeProject.type}</p>
                        <p className="modal-desc">{activeProject.description}</p>
                      </motion.div>

                      {/* Content Grid: Screenshot (rect) + Brief (spans full height) + Modules (under screenshot) */}
                      <div className="modal-content-grid">
                        <motion.div
                          className="modal-card modal-screenshot-card"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.08, ease: ndsEase }}
                        >
                          <div
                            className={`screenshot-placeholder ${websiteModuleForActiveProject ? 'clickable' : ''}`}
                            onClick={
                              websiteModuleForActiveProject
                                ? () => setWebsitePreviewUrl(websiteModuleForActiveProject.websiteUrl)
                                : undefined
                            }
                          >
                            {activeProject.screenshotImage ? (
                              <img src={activeProject.screenshotImage} alt={activeProject.screenshotLabel} />
                            ) : (
                              activeProject.screenshotLabel
                            )}
                            {websiteModuleForActiveProject && (
                              <span className="screenshot-placeholder-hover">
                                {activeProject?.id === 'petunis' ? 'View Storefront' : 'View Website'}
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            )}
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

                        <div className="modal-modules-row">
                          <div className={`modal-modules-grid ${websiteModuleForActiveProject ? 'filtered' : ''}`}>
                            {activeProject.modules
                              .filter((mod) => !websiteModuleForActiveProject || !mod.websiteUrl)
                              .map((mod, i) => (
                              <motion.div
                                key={mod.id}
                                className="modal-card modal-module-card"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease: ndsEase }}
                                onClick={() => mod.websiteUrl ? setWebsitePreviewUrl(mod.websiteUrl) : setActiveModule(mod)}
                                onMouseEnter={() => {
                                  // Preload images on hover for faster loading (throttled to avoid performance issues)
                                  if (!mod.websiteUrl) {
                                    // Use requestIdleCallback if available, otherwise setTimeout with delay
                                    const schedulePreload = (callback) => {
                                      if ('requestIdleCallback' in window) {
                                        requestIdleCallback(callback, { timeout: 2000 })
                                      } else {
                                        setTimeout(callback, 100)
                                      }
                                    }
                                    
                                    schedulePreload(() => {
                                      const imageUrls = getModuleImageUrls(mod, activeProject)
                                      const batchSize = 10 // Reduced batch size
                                      for (let i = 0; i < imageUrls.length; i += batchSize) {
                                        setTimeout(() => {
                                          preloadImages(imageUrls.slice(i, i + batchSize))
                                        }, i * 50) // Increased stagger time
                                      }
                                    })
                                  }
                                }}
                              >
                                <span className="module-label">{mod.label}</span>
                                <svg className="module-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                  <path d="M7 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </motion.div>
                            ))}
                          </div>
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
