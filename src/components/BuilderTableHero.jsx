import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion'
import './BuilderTableHero.css'

const ndsEase = [0.22, 1, 0.36, 1]

const dossiers = [
  {
    eyebrow: 'Product Builds',
    code: '01',
    title: 'Ideas made tangible',
    description: 'Zero-to-one product work across launch flows, feedback systems, and working interfaces.',
    to: '/projects',
    artifacts: [
      { type: 'text', value: 'React' },
      { type: 'text', value: 'APIs' },
      { type: 'text', value: 'Launch Ops' }
    ]
  },
  {
    eyebrow: 'Client Systems',
    code: '02',
    title: 'Brands turned into engines',
    description: 'Storefronts, campaigns, and digital systems for teams that need work to move.',
    to: '/client-work',
    artifacts: [
      { type: 'image', src: '/images/petunis-storefront.png', alt: 'PetUnis storefront preview' },
      { type: 'image', src: '/WeatherFixers/Storefront.png', alt: 'WeatherFixers storefront preview' },
      { type: 'image', src: '/GTS/GTS Site shot.png', alt: 'GTS site preview' }
    ]
  },
  {
    eyebrow: 'Technology',
    code: '03',
    title: 'Modern tools, useful leverage',
    description: 'Automation, analytics, interfaces, and AI where it makes the work sharper.',
    to: '/about',
    artifacts: [
      { type: 'text', value: 'Analytics' },
      { type: 'text', value: 'Automation' },
      { type: 'text', value: 'AI' }
    ]
  }
]

const metrics = [
  { value: '3+', label: 'Years Building' },
  { value: '5+', label: 'Products Launched' },
  { value: '100+', label: 'People Educated' }
]

function BuilderTableHero() {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 26, mass: 0.4 })
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 26, mass: 0.4 })
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7])
  const spotlightX = useTransform(smoothX, (value) => `${50 + value * 18}%`)
  const spotlightY = useTransform(smoothY, (value) => `${48 + value * 18}%`)

  const handlePointerMove = (event) => {
    if (reduceMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  const settlePointer = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <motion.section
      className="builder-hero"
      style={{ '--spotlight-x': spotlightX, '--spotlight-y': spotlightY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={settlePointer}
    >
      <div className="builder-hero__grain" aria-hidden="true" />
      <div className="builder-hero__container">
        <motion.div
          className="builder-hero__copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: ndsEase }}
        >
          <p className="builder-hero__label">
            Marketing Leader &middot; Product Builder &middot; Emerging Technology
          </p>
          <h1 className="builder-hero__name">Gunnar Neuman</h1>
          <p className="builder-hero__line">I turn ideas into working systems.</p>
          <p className="builder-hero__dek">
            Strategy, product thinking, and technical execution for teams building
            from zero to one.
          </p>

          <div className="builder-hero__actions">
            <Link to="/projects" className="btn btn-primary btn-magnetic">
              See What I've Built
              <span className="btn-arrow">&rarr;</span>
            </Link>
            <Link to="/contact" className="btn builder-hero__secondary-action">
              Get in Touch
            </Link>
          </div>

          <div className="builder-hero__metrics" aria-label="Builder metrics">
            {metrics.map((metric) => (
              <div className="builder-hero__metric" key={metric.label}>
                <span>{metric.value}</span>
                <small>{metric.label}</small>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="builder-hero__table-wrap"
          style={reduceMotion ? undefined : { rotateX, rotateY }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.12, ease: ndsEase }}
          aria-label="Builder table with project dossiers"
        >
          <div className="builder-hero__table" aria-hidden="true">
            <div className="builder-hero__table-felt" />
            <div className="builder-hero__table-rim" />
            <div className="builder-hero__table-line builder-hero__table-line--one" />
            <div className="builder-hero__table-line builder-hero__table-line--two" />
            <div className="builder-hero__brass-marker">GN</div>
          </div>

          <div className="builder-hero__dossiers">
            {dossiers.map((dossier, index) => (
              <motion.article
                className={`builder-dossier builder-dossier--${index + 1}`}
                key={dossier.title}
                initial={{ opacity: 0, y: 30, rotate: index === 1 ? 0 : index === 0 ? -7 : 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.14, ease: ndsEase }}
              >
                <Link to={dossier.to} className="builder-dossier__link">
                  <div className="builder-dossier__topline">
                    <span>{dossier.eyebrow}</span>
                    <span>{dossier.code}</span>
                  </div>
                  <h2>{dossier.title}</h2>
                  <p>{dossier.description}</p>
                  <div className="builder-dossier__artifacts">
                    {dossier.artifacts.map((artifact) => (
                      artifact.type === 'image' ? (
                        <img src={artifact.src} alt={artifact.alt} key={artifact.src} />
                      ) : (
                        <span key={artifact.value}>{artifact.value}</span>
                      )
                    ))}
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          <motion.div
            className="builder-hero__token builder-hero__token--strategy"
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Strategy
          </motion.div>
          <motion.div
            className="builder-hero__token builder-hero__token--product"
            animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          >
            Product
          </motion.div>
          <motion.div
            className="builder-hero__token builder-hero__token--software"
            animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            Software
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default BuilderTableHero
