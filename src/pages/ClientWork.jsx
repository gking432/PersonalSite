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
import elevateMerchandising from '../data/elevate-merchandising.json'
import elevateDesignFiles from '../data/elevate-designfiles.json'
import pmmMerchandising from '../data/pmm-merchandising.json'
import gtsRevolutionMerchandising from '../data/gts-revolution-merchandising.json'
import './ClientWork.css'

const ndsEase = [0.22, 1, 0.36, 1]

function merchandisingAssetSrc(mod, filename) {
  const folder = (mod.merchandisingFolder || '').trim()
  const enc = (s) => s.split('/').map(encodeURIComponent).join('/')
  if (!folder) return `/${enc(filename)}`
  return `/${enc(folder)}/${enc(filename)}`
}

function iframeBarClassForProject(projectId) {
  switch (projectId) {
    case 'weatherfixers':
    case 'gts-revolution':
      return 'weatherfixers'
    case 'elevate-apparel':
      return 'elevate'
    case 'hospice-nonprofit':
    case 'blue-lizard':
      return 'hospice'
    default:
      return 'petunis'
  }
}

const clientProjects = [
  {
    id: 'petunis',
    year: '2024',
    name: 'PetUnis',
    type: 'Brand Design & eCommerce',
    shortDesc: 'NFL-inspired dog uniforms. Full brand identity, product design, and eCommerce buildout across all 32 teams.',
    about: 'A full-stack brand and eCommerce build from zero. Logo, identity system, 32 team designs, storefront, and ad creative — all built for print-on-demand. One of my most complete end-to-end projects.',
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
    about: 'Lead-gen site for storm damage contractors. Website, digital ads, and direct mail postcards — designed to capture and qualify leads in geographic areas hit by severe weather.',
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
    type: 'eCommerce & Merchandising',
    shortDesc: 'Online storefront for a print-on-demand activewear line, plus merchandising and design-file imagery for the catalog.',
    about: 'Built the Elevate Outfits shop and produced merchandising visuals and design files to support the product line and online store.',
    description: 'Design and launch a shoppable eCommerce site for a print-on-demand gymwear brand, and deliver merchandising imagery and design files aligned with the collections.',
    brief: 'Ship a full eCommerce experience and provide merchandising assets and design-ready files for products and collections.',
    strategy: 'Organized the site around collections and product discovery, then delivered consistent merchandising imagery and design files that match how the products appear in the store.',
    scope: 'Website design and build, merchandising imagery, and design file outputs for the catalog.',
    screenshotLabel: 'Elevate Outfits',
    screenshotImage: '/Elevate%20Merchandising/elevate-card-preview.png',
    modules: [
      {
        id: 'website',
        label: 'Website',
        websiteUrl: 'https://gunnarneuman7.wixstudio.com/my-site-19',
        items: [
          'eCommerce storefront (Elevate Outfits)',
          'Collections: Astro, Joggers, Retro, Classic',
          'Homepage hero & brand story',
          'Shop navigation, quick view & product pages',
          'Mobile-responsive layout',
          'Checkout & payment methods'
        ]
      },
      {
        id: 'merchandising',
        label: 'Merchandising',
        merchandisingFolder: 'Elevate Merchandising',
        merchandisingFiles: elevateMerchandising,
        designFilesImages: elevateDesignFiles,
        items: [
          'Merchandising imagery for collections and PDPs',
          'Design files for catalog and production handoff',
          'Consistent product presentation across SKUs',
          'Hero and collection-ready visuals',
          'Assets sized for eCommerce and social use'
        ]
      }
    ],
    tech: ['Web Design', 'eCommerce', 'Merchandising']
  },
  {
    id: 'gts-revolution',
    year: '2024',
    name: 'GTS Revolution',
    type: 'Merch & eCommerce',
    shortDesc:
      'Merch storefront for an Instagram-driven brand—product presentation, collections, and checkout built to match the feed.',
    description:
      'Design and launch a shoppable merch site for a social-first brand: clear product storytelling, drop-friendly layout, and a path from Instagram to purchase.',
    brief:
      'Ship a merch eCommerce experience aligned to an existing Instagram audience—fast to scan, easy to buy, and consistent with the account’s look and voice.',
    strategy:
      'Structured the store around how followers discover drops on social: strong visuals on collection and product pages, simple navigation, and friction-light checkout on mobile.',
    scope: 'Merch storefront build, collection and product presentation, and supporting merchandising imagery for the catalog.',
    screenshotLabel: 'GTS Revolution storefront',
    screenshotImage: '/GTS/GTS%20Site%20shot.png',
    modules: [
      {
        id: 'website',
        label: 'Website',
        websiteUrl: 'https://gunnarneuman7.wixstudio.com/gts-revolution',
        items: [
          'Merch storefront (collections & product pages)',
          'Homepage tuned for campaign and drop messaging',
          'Mobile-first layout and checkout flow',
          'Brand-aligned typography, color, and imagery',
          'Navigation that mirrors how the Instagram account presents products'
        ]
      },
      {
        id: 'merchandising',
        label: 'Merchandising',
        merchandisingSingleTab: true,
        merchandisingTabLabel: 'Merchandising',
        merchandisingFolder: 'GTS',
        merchandisingFiles: gtsRevolutionMerchandising,
        items: [
          'Product and collection imagery for the store',
          'Consistent PDP-ready visuals across SKUs',
          'Hero and grid assets sized for eCommerce and social',
          'Merch presentation aligned to Instagram campaigns'
        ]
      }
    ],
    tech: ['Web Design', 'eCommerce', 'Merchandising']
  },
  {
    id: 'hospice-nonprofit',
    year: '2023',
    name: 'Patti Means Ministry',
    type: 'Website Redesign',
    shortDesc:
      'My first paid client outside family and friends—early work I wouldn’t ship today, but the start of my freelance story, so I’m keeping it here.',
    about:
      'Patti Means Ministry was the first real project I landed—not for family or friends. It isn’t work I’d hold up as portfolio quality today, but it’s an honest part of how I started, which is why I chose to include it.',
    description:
      'Patti Means Ministry was my first paid freelance project outside family and friends. The work itself isn’t what I’d highlight today, but it matters to my story—so it stays in the lineup.',
    brief: 'Modernize a dated nonprofit website to better serve families seeking hospice care information while also improving the donation experience.',
    strategy: 'Focused on warmth, clarity, and trust. Redesigned the information architecture to prioritize the most common visitor needs: understanding services, contacting the organization, and donating.',
    scope: 'Modernized visual identity, clearer navigation, better mobile experience, improved donation flow, and professional credibility.',
    screenshotLabel: 'Patti Means Ministry',
    screenshotImage: '/PMM%20Site%20shot.png',
    modules: [
      {
        id: 'website',
        label: 'Website Design',
        websiteUrl: 'https://gunnarneuman7.wixsite.com/website-4',
        items: [
          'Complete homepage redesign',
          'Services overview & information architecture',
          'Simplified navigation & clear CTAs',
          'Team, about, contact & referral flows',
          'Donation page redesign',
          'Mobile-responsive layouts & accessibility',
          'Resource library layout'
        ]
      },
      {
        id: 'social',
        label: 'Social Media',
        externalLinkUrl: 'https://www.instagram.com/pattimeansministry/',
        externalLinkLabel: 'View on Instagram',
        items: [
          'Feed & story templates for Facebook & Instagram',
          'Awareness & fundraising campaign graphics',
          'Community engagement post series',
          'Compassionate copy aligned to brand voice',
          'Testimonial & story layouts for social',
          'Event & giving-day promotional creative'
        ]
      },
      {
        id: 'merchandising',
        label: 'Merchandising',
        merchandisingSingleTab: true,
        merchandisingTabLabel: 'Merchandising',
        merchandisingFiles: pmmMerchandising,
        items: [
          'Brochures & flyers for outreach & events',
          'Donor & family leave-behind print pieces',
          'Event signage, banners & table displays',
          'Volunteer recognition & staff materials',
          'Branded merchandise concepts for fundraising',
          'Service one-pagers & FAQ handouts'
        ]
      }
    ],
    tech: ['Website Design', 'Social Media', 'Merchandising']
  },
  {
    id: 'blue-lizard',
    year: '2023',
    name: 'Blue Lizard Bar & Grill',
    type: 'Website Redesign',
    shortDesc:
      'Pitch-only website redesign—the client didn’t buy it. I’m showing the live spec site here as a sales sample: how I prototype and present before a deal closes.',
    about:
      'This was a sales pitch, not shipped work. The only deliverable was a proposed website redesign; it never got picked up. I’m including it anyway as a sales tactic—a clickable preview so you can see how I pitch restaurants and spec work in the room.',
    description:
      'Unsold website redesign pitch for a bar & grill, built as a live hosted site to demonstrate layout, tone, and flow during sales conversations.',
    brief: 'Pitch a full restaurant website redesign—homepage, menu, hours, reviews, and contact—without a signed engagement.',
    strategy: 'Treat the site as a leave-behind: clear navigation, appetizing visuals, and obvious paths to menu, location, and third-party ordering—so a prospect can feel the direction before committing.',
    scope: 'Website redesign concept only (pitch). No menu design or branding packages—just the proposed site.',
    screenshotLabel: 'Blue Lizard pitch site',
    screenshotImage: '/Blue%20Lizard/Blue%20Lizard%20Site%20shot.png',
    modules: [
      {
        id: 'website',
        label: 'Website Design',
        websiteUrl: 'https://gunnarneuman7.wixsite.com/blue-lizard-bar-and',
        items: [
          'Homepage & hero concept',
          'Menu, reviews & employment sections',
          'Hours, location & contact',
          'Social links & delivery callouts (Uber Eats, Grubhub, DoorDash)',
          'Mobile-responsive layout',
          'Built as a live pitch site'
        ]
      }
    ],
    tech: ['Web Design', 'Restaurant', 'Pitch']
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
                {petunisTeams.filter((f) => !f.startsWith('For People/')).map((filename) => (
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

/* ─── Single-tab merchandising (same chrome as PetUnis/Elevate tabs) ─── */
function SingleMerchandisingTab({ mod }) {
  const scrollRef = useRef(null)
  const label = mod.merchandisingTabLabel || 'Merchandising'

  return (
    <div className="merch-tabs">
      <div className="merch-tabs-header merch-tabs-header--single">
        <div className="merch-tab active merch-tab--single" role="presentation">
          {label}
        </div>
      </div>
      <div className="merch-tabs-viewport" ref={scrollRef}>
        <div className="merch-tabs-panel">
          <div className="client-module-teams-grid">
            {mod.merchandisingFiles.map((filename) => (
              <img
                key={filename}
                src={merchandisingAssetSrc(mod, filename)}
                alt=""
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Elevate: Merchandise + Design Files (two tabs) ─── */
function ElevateMerchandisingTabs({ mod }) {
  const [activeTab, setActiveTab] = useState('merchandise')
  const scrollRef = useRef(null)

  const tabs = [
    { id: 'merchandise', label: 'Merchandise' },
    { id: 'designs', label: 'Design Files' }
  ]

  const basePath = mod.merchandisingFolder.split('/').map(encodeURIComponent).join('/')
  const buildSrc = (relativePath) =>
    `/${basePath}/${relativePath.split('/').map(encodeURIComponent).join('/')}`

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
          {activeTab === 'merchandise' && (
            <motion.div
              key="merchandise"
              className="merch-tabs-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: ndsEase }}
            >
              <div className="client-module-teams-grid">
                {mod.merchandisingFiles.map((filename) => (
                  <img
                    key={filename}
                    src={buildSrc(filename)}
                    alt=""
                    loading="lazy"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'designs' && (
            <motion.div
              key="designs"
              className="merch-tabs-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: ndsEase }}
            >
              <div className="client-module-design-grid">
                {mod.designFilesImages
                  .slice()
                  .sort((a, b) => {
                    const folderCmp = a.split('/')[0].localeCompare(b.split('/')[0])
                    if (folderCmp !== 0) return folderCmp
                    const na = parseInt(a.split('/').pop().replace(/\D/g, ''), 10) || 0
                    const nb = parseInt(b.split('/').pop().replace(/\D/g, ''), 10) || 0
                    return na - nb
                  })
                  .map((filename) => (
                    <div key={filename} className="client-module-design-item">
                      <img
                        src={buildSrc(filename)}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                  ))}
              </div>
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
  const numberRef = useRef(null)
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
      if (project.modules.length === 1) {
        setExpandedModules({ [project.modules[0].id]: true })
      }
      setTimeout(() => {
        numberRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const content = (
    <div className={`container ${isExpanded ? 'client-expand-viewport' : ''}`} ref={sectionRef}>
      {/* Header — always visible; when expanded, About on right */}
      <motion.div
        className={`client-feature-header ${isExpanded ? 'client-feature-header-with-about' : ''}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {isExpanded ? (
          <>
            <div className="client-feature-header-left">
              <motion.span
                ref={numberRef}
                className="client-feature-number client-feature-number-full"
                variants={fadeUp}
                animate="visible"
                initial="hidden"
              >
                {number}
              </motion.span>
              <div className="client-feature-header-text">
                <motion.h2
                  className="client-feature-name"
                  variants={fadeUp}
                  animate="visible"
                  initial="hidden"
                >
                  {project.name}
                </motion.h2>
                <motion.p
                  className="client-feature-tagline"
                  variants={fadeUp}
                  animate="visible"
                  initial="hidden"
                >
                  {project.type} · {project.year}
                </motion.p>
              </div>
            </div>
            {(project.about || project.shortDesc) && (
              <motion.div
                className="client-feature-header-about"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: ndsEase }}
              >
                <span className="client-feature-header-about-label">About this project</span>
                <p>{project.about || project.shortDesc}</p>
              </motion.div>
            )}
          </>
        ) : (
          <div className="client-feature-header-left">
            <motion.span
              ref={numberRef}
              className="client-feature-number"
              variants={fadeUp}
              animate="visible"
              initial="hidden"
            >
              {number}
            </motion.span>
            <div className="client-feature-header-text">
              <motion.h2
                className="client-feature-name"
                variants={fadeUp}
                animate="visible"
                initial="hidden"
              >
                {project.name}
              </motion.h2>
              <motion.p
                className="client-feature-tagline"
                variants={fadeUp}
                animate="visible"
                initial="hidden"
              >
                {project.type} · {project.year}
              </motion.p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Body — swaps between default and expanded */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* ─── DEFAULT VIEW ─── */
          <motion.div
            key="default"
            className={`client-feature-body${!project.featured && project.screenshotImage ? ' client-feature-body--screenshot' : ''}`}
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
              <button type="button" className="btn btn-primary" onClick={handleToggle}>
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
            {/* Modules — expandable subsections (lead with the work) */}
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
                            {mod.websiteUrl && (
                              <div className="client-module-iframe-container">
                                <div
                                  className={`client-module-iframe-bar client-module-iframe-bar-${iframeBarClassForProject(project.id)}`}
                                />
                                <div className="client-module-iframe-wrap">
                                  <iframe
                                    src={mod.websiteUrl}
                                    title={`${project.name} — ${mod.label}`}
                                    className="client-module-iframe"
                                    loading="lazy"
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

                            {mod.externalLinkUrl && (
                              <a
                                href={mod.externalLinkUrl}
                                className="client-module-external-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {mod.externalLinkLabel || 'View work'}
                              </a>
                            )}

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

                            {/* Elevate — Merchandise / Design Files tabs */}
                            {mod.merchandisingFolder && mod.merchandisingFiles && mod.designFilesImages && (
                              <ElevateMerchandisingTabs mod={mod} />
                            )}

                            {/* Hospice (etc.) — one merchandising tab */}
                            {mod.merchandisingSingleTab && mod.merchandisingFiles?.length > 0 && (
                              <SingleMerchandisingTab mod={mod} />
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

            {/* Brief / Strategy / Scope — below the work */}
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

            {/* Close button */}
            <button type="button" className="btn btn-secondary client-expand-close" onClick={handleToggle}>
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
