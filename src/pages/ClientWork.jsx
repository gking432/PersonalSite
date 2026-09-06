import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

// Clean vanity URLs shown in the browser chrome (hides the host platform)
const SITE_DISPLAY = {
  petunis: 'petunis.com',
  weatherfixers: 'weatherfixers.com',
  'elevate-apparel': 'elevateoutfits.com',
  'gts-revolution': 'gtsrevolution.com',
  'hospice-nonprofit': 'pattimeansministry.org',
  'blue-lizard': 'bluelizardbargrill.com',
}

// Height (px) of the host-platform banner to mask at the top of each live site
const BANNER_COVER = {
  petunis: 62,
  weatherfixers: 32,
  'elevate-apparel': 32,
  'gts-revolution': 32,
  'hospice-nonprofit': 62,
  'blue-lizard': 62,
}

// Short tab label for a module based on the kind of surface it holds
function moduleTabLabel(mod) {
  if (mod.websiteUrl) return 'Live Site'
  if (mod.adsImagesFolder) return 'Ads'
  if (mod.postcardsImagesFolder) return 'Direct Mail'
  if (mod.externalLinkUrl) return mod.label || 'Social'
  return 'Merchandising'
}

const clientProjects = [
  {
    id: 'petunis',
    // Delivery record. Fill these in with what actually happened; these are the
    // fields that turn this page from a design gallery into evidence of working
    // with stakeholders and handing something over. Empty fields are not rendered.
    engagement: {
      workedWith: '',
      handoff: ''
    },
    year: '2024',
    name: 'PetUnis',
    type: 'Brand Design & eCommerce',
    shortDesc: 'NFL-inspired dog uniforms with a complete brand, storefront, product catalog, and ad system across all 32 teams.',
    about: 'A full brand and eCommerce build from zero: logo, identity system, 32 team designs, storefront, and ad creative for a print-on-demand dog apparel concept.',
    description: 'Create a complete brand identity and eCommerce presence for a print-on-demand dog apparel line featuring NFL team-inspired designs across all 32 franchises.',
    brief: 'Build a cohesive brand from scratch: logo, identity system, product designs for all 32 NFL teams, and a full eCommerce storefront ready for print-on-demand fulfillment.',
    strategy: 'Built the concept around an easy customer truth: pet owners who are sports fans love visible team identity. The work turned that into team-specific product mockups, a storefront, and social creative.',
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
    // Delivery record. Fill these in with what actually happened; these are the
    // fields that turn this page from a design gallery into evidence of working
    // with stakeholders and handing something over. Empty fields are not rendered.
    engagement: {
      workedWith: '',
      handoff: ''
    },
    year: '2024',
    name: 'WeatherFixers.com',
    type: 'Lead Aggregation Website',
    shortDesc: 'Lead aggregation site for storm damage professionals, supported by digital ads and direct mail.',
    about: 'A lead-gen build for storm damage contractors, designed to capture and qualify homeowners in geographic areas hit by severe weather.',
    description: 'Designed a lead aggregation website that connects storm damage contractors with homeowners in affected areas. Created the website, digital advertisements, and direct door mailing postcards.',
    brief: 'Build a lead aggregation website for storm damage pros. Design the site, run digital ad campaigns, and create direct mail postcards for door-to-door outreach.',
    strategy: 'Focused the site and outreach around urgency, local relevance, and a simple conversion path for homeowners who needed help after severe weather.',
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
    // Delivery record. Fill these in with what actually happened; these are the
    // fields that turn this page from a design gallery into evidence of working
    // with stakeholders and handing something over. Empty fields are not rendered.
    engagement: {
      workedWith: '',
      handoff: ''
    },
    year: '2024',
    name: 'Elevate Apparel',
    type: 'eCommerce & Merchandising',
    shortDesc: 'Online storefront and merchandising system for a print-on-demand activewear concept.',
    about: 'Built the Elevate Outfits shop and produced the merchandising visuals and design files needed to make the catalog feel coherent.',
    description: 'Design and launch a shoppable eCommerce site for a print-on-demand gymwear brand, and deliver merchandising imagery and design files aligned with the collections.',
    brief: 'Ship a full eCommerce experience and provide merchandising assets and design-ready files for products and collections.',
    strategy: 'Organized the store around product discovery and collection browsing, then kept the merchandising visuals consistent across the shopping experience.',
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
    // Delivery record. Fill these in with what actually happened; these are the
    // fields that turn this page from a design gallery into evidence of working
    // with stakeholders and handing something over. Empty fields are not rendered.
    engagement: {
      workedWith: '',
      handoff: ''
    },
    year: '2024',
    name: 'GTS Revolution',
    type: 'Merch & eCommerce',
    shortDesc:
      'Merch storefront for an Instagram-driven brand, with product pages and collections built to match the way the audience already discovers drops.',
    description:
      'Design and launch a shoppable merch site for a social-first brand: clear product storytelling, drop-friendly layout, and a path from Instagram to purchase.',
    brief:
      'Ship a merch eCommerce experience aligned to an existing Instagram audience: fast to scan, easy to buy, and consistent with the account’s look and voice.',
    strategy:
      'Structured the store around social discovery: strong visuals, simple navigation, and a short path from Instagram interest to mobile checkout.',
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
    // Delivery record. Fill these in with what actually happened; these are the
    // fields that turn this page from a design gallery into evidence of working
    // with stakeholders and handing something over. Empty fields are not rendered.
    engagement: {
      workedWith: '',
      handoff: ''
    },
    year: '2023',
    name: 'Patti Means Ministry',
    type: 'Website Redesign',
    shortDesc:
      'My first paid client outside family and friends. This early project marks where the hands-on operating experience started.',
    about:
      'Patti Means Ministry was the first real project I landed outside family and friends. The project marks the beginning of my independent client work, and I would make different design choices today.',
    description:
      'Patti Means Ministry was my first paid project outside family and friends. It documents the start of the client-services chapter and the early lessons that came with it.',
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
    // Delivery record. Fill these in with what actually happened; these are the
    // fields that turn this page from a design gallery into evidence of working
    // with stakeholders and handing something over. Empty fields are not rendered.
    engagement: {
      workedWith: '',
      handoff: ''
    },
    year: '2023',
    name: 'Blue Lizard Bar & Grill',
    type: 'Website Redesign',
    shortDesc:
      'Pitch-only restaurant website redesign. The client declined it. The live spec site shows how I prototype before a deal closes.',
    about:
      'This was an unsold sales pitch. I am including it because a clickable spec site clearly shows the direction I presented in the room.',
    description:
      'Unsold website redesign pitch for a bar & grill, built as a live hosted site to demonstrate layout, tone, and flow during sales conversations.',
    brief: 'Pitch a full restaurant website redesign covering the homepage, menu, hours, reviews, and contact flow without a signed engagement.',
    strategy: 'Treat the site as a leave-behind: clear navigation, appetizing visuals, and obvious paths to menu, location, and third-party ordering, so a prospect can feel the direction before committing.',
    scope: 'Website redesign concept only (pitch). No menu design or branding packages, just the proposed site.',
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

/* ─── Ads / Direct-mail galleries (image-only, no padded lists) ─── */
function AdsGallery({ project, mod }) {
  const list = project.id === 'weatherfixers' ? weatherfixersAds : petunisAds
  return (
    <div className="client-module-masonry">
      {list.map((filename) => {
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
  )
}

function PostcardGallery({ mod }) {
  return (
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
  )
}

/* ─── Browser frame; the live site, made to feel deliberate ───
   Render the iframe at a full desktop width and scale it down so the embedded
   site uses its DESKTOP layout (no mobile breakpoint, no horizontal scroll),
   then fits whatever column it lives in. */
const BF_DESKTOP_W = 1280
const BF_VIS_H = 800 // 16:10 visible window of the desktop site

function BrowserFrame({ project, url }) {
  const cover = BANNER_COVER[project.id] || 0
  const display = SITE_DISPLAY[project.id] || ''
  const viewRef = useRef(null)
  const [scale, setScale] = useState(0.55)

  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const update = () => setScale(el.clientWidth / BF_DESKTOP_W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="bf">
      <div className="bf-chrome">
        <span className="bf-dots"><i /><i /><i /></span>
        <span className="bf-url">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 10V8a6 6 0 1112 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          </svg>
          {display}
        </span>
      </div>
      <div className="bf-viewport" ref={viewRef}>
        <div
          className="bf-scaler"
          style={{ width: BF_DESKTOP_W, height: BF_VIS_H, transform: `scale(${scale})` }}
        >
          <iframe
            src={url}
            title={`${project.name}: live site`}
            className="bf-iframe"
            loading="lazy"
            style={{ width: BF_DESKTOP_W, height: BF_VIS_H + cover, marginTop: -cover }}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Surface renderer; one module = one surface in the viewer ─── */
function renderSurface(project, mod) {
  if (mod.websiteUrl) return <BrowserFrame project={project} url={mod.websiteUrl} />
  if (mod.adsImagesFolder) return <AdsGallery project={project} mod={mod} />
  if (mod.postcardsImagesFolder) return <PostcardGallery mod={mod} />
  if (mod.merchandisingFolder && mod.merchandisingFiles && mod.designFilesImages)
    return <ElevateMerchandisingTabs mod={mod} />
  if (mod.merchandisingSingleTab && mod.merchandisingFiles?.length > 0)
    return <SingleMerchandisingTab mod={mod} />
  if (mod.teamsImagesFolder) return <MerchandisingTabs mod={mod} />
  if (mod.externalLinkUrl) {
    return (
      <div className="cw-surface-link">
        <p>This work lived on social. Take a look at the live account.</p>
        <a href={mod.externalLinkUrl} className="client-module-external-link" target="_blank" rel="noopener noreferrer">
          {mod.externalLinkLabel || 'View work'}
        </a>
      </div>
    )
  }
  return null
}

/* ─── Surface viewer; flat tabs, live site shown first ─── */
function SurfaceViewer({ project }) {
  const mods = project.modules
  const siteIdx = mods.findIndex((m) => m.websiteUrl)
  const [active, setActive] = useState(siteIdx >= 0 ? siteIdx : 0)
  const mod = mods[active] || mods[0]

  return (
    <div className="cw-viewer">
      {mods.length > 1 && (
        <div className="cw-viewer-tabs" role="tablist">
          {mods.map((m, i) => (
            <button
              key={m.id}
              type="button"
              className={`cw-viewer-tab ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              {moduleTabLabel(m)}
            </button>
          ))}
        </div>
      )}
      <div className="cw-viewer-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={mod.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: ndsEase }}
          >
            {renderSurface(project, mod)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Featured case; full, live-site-forward treatment ─── */
function FeaturedCase({ project, index, alt }) {
  const number = String(index + 1).padStart(2, '0')

  const content = (
    <div className="container">
      <div className="cw-case-layout">
        <motion.aside
          className="cw-case-aside"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div className="cw-case-head-left">
            <motion.span className="cw-case-number" variants={fadeUp}>{number}</motion.span>
            <div>
              <motion.h2 className="cw-case-name" variants={fadeUp}>{project.name}</motion.h2>
              <motion.p className="cw-case-tagline" variants={fadeUp}>
                {project.type} · {project.year}
              </motion.p>
            </div>
          </div>
          <motion.div className="cw-case-about" variants={fadeUp}>
            <span className="cw-case-about-label">About this project</span>
            <p>{project.about || project.shortDesc}</p>
          </motion.div>
        </motion.aside>

        <motion.div
          className="cw-case-main"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: ndsEase }}
        >
          <SurfaceViewer project={project} />
        </motion.div>
      </div>

      <div className="cw-case-meta">
        <div className="cw-case-meta-item">
          <span>The Brief</span>
          <p>{project.brief}</p>
        </div>
        <div className="cw-case-meta-item">
          <span>Strategy</span>
          <p>{project.strategy}</p>
        </div>
        <div className="cw-case-meta-item">
          <span>Scope</span>
          <p>{project.scope}</p>
        </div>
        {project.engagement?.workedWith && (
          <div className="cw-case-meta-item">
            <span>Who I worked with</span>
            <p>{project.engagement.workedWith}</p>
          </div>
        )}
        {project.engagement?.handoff && (
          <div className="cw-case-meta-item">
            <span>How it handed off</span>
            <p>{project.engagement.handoff}</p>
          </div>
        )}
      </div>
    </div>
  )

  if (alt) {
    return <SqueezeSection className="cw-case cw-case-alt">{content}</SqueezeSection>
  }
  return <section className="cw-case">{content}</section>
}

/* ─── Index card; compact, expands into the same surface viewer ─── */
function IndexCard({ project, number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`cw-index-card ${open ? 'open' : ''}`}>
      <button type="button" className="cw-index-head" onClick={() => setOpen((o) => !o)}>
        <div className="cw-index-thumb">
          {project.screenshotImage && <img src={project.screenshotImage} alt="" loading="lazy" />}
        </div>
        <div className="cw-index-info">
          <span className="cw-index-number">{number}</span>
          <h3 className="cw-index-name">{project.name}</h3>
          <p className="cw-index-tagline">{project.type} · {project.year}</p>
          <p className="cw-index-desc">{project.shortDesc}</p>
          <div className="cw-index-tags">
            {project.tech.map((t) => (
              <span key={t} className="tech-badge">{t}</span>
            ))}
          </div>
        </div>
        <span className="cw-index-toggle">
          {open ? 'Close' : 'Open live site'}
          <svg className={`cw-index-chevron ${open ? 'open' : ''}`} width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="cw-index-viewer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: ndsEase }}
          >
            <div className="cw-index-viewer-inner">
              <SurfaceViewer project={project} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ClientWork() {
  return (
    <PageTransition>
      <div className="client-work">
        {/* Hero */}
        <section className="client-work-hero" data-assistant-section="client-work-overview">
          <div className="container">
            <div className="hero-split">
              <div className="hero-split-left">
                <motion.p
                  className="label"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: ndsEase }}
                >
                  Marketing Agency · 2023–2025
                </motion.p>
                <h1>
                  {'Client Delivery'.split(' ').map((word, i, words) => (
                    <motion.span
                      key={i}
                      style={{ display: 'inline-block' }}
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ndsEase }}
                    >
                      {word}{i < words.length - 1 ? ' ' : ''}
                    </motion.span>
                  ))}
                </h1>
                <motion.p
                  className="client-work-subtitle"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: ndsEase }}
                >
                  I ran TouchPoint Marketing Solutions from 2023 to 2025, before shifting my
                  focus to building AI products. This is a selection of my website, e-commerce,
                  and marketing work from that period. I handled discovery, scope, delivery,
                  and client communication; that experience still shapes how I build today.
                </motion.p>
              </div>
              <motion.div
                className="hero-meta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
              >
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Period</span>
                  <span className="hero-meta-value">2023–2025</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">The loop</span>
                  <span className="hero-meta-value">Discover · scope · build · launch · report</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">What I owned</span>
                  <span className="hero-meta-value">The engagement, from first conversation through handoff</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Shown here</span>
                  <span className="hero-meta-value hero-meta-status">Six selections from a broader body of work</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* One consistent archive; no project receives showcase treatment. */}
        <section className="cw-index-section section">
          <div className="container">
            <motion.p
              className="cw-index-label"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: ndsEase }}
            >
              Selected archive
            </motion.p>
            <motion.h2
              className="cw-index-heading"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08, ease: ndsEase }}
            >
              Six examples of how I delivered.
            </motion.h2>
            <motion.p
              className="cw-index-intro"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.14, ease: ndsEase }}
            >
              The six entries come from a larger client roster. Open any project to browse the work in context.
            </motion.p>
            <div className="cw-index-grid">
              {clientProjects.map((project, i) => (
                <IndexCard key={project.id} project={project} number={String(i + 1).padStart(2, '0')} />
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <SqueezeSection className="cw-cta section">
          <div className="container">
            <motion.div
              className="cw-cta-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
            >
              <motion.p className="cw-cta-eyebrow" variants={fadeUp}>From clients to products</motion.p>
              <motion.h2 className="cw-cta-heading" variants={fadeUp}>
                This is the foundation. The product work is where it's headed.
              </motion.h2>
              <motion.div className="cw-cta-actions" variants={fadeUp}>
                <Link to="/projects" className="btn btn-primary">See Product Projects</Link>
                <Link to="/contact" className="btn btn-outline-light">Get in Touch</Link>
              </motion.div>
            </motion.div>
          </div>
        </SqueezeSection>
      </div>
    </PageTransition>
  )
}

export default ClientWork
