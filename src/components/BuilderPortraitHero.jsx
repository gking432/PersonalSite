import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion'
import './BuilderPortraitHero.css'

const ndsEase = [0.22, 1, 0.36, 1]

const proofItems = [
  {
    label: 'Client Systems',
    title: 'Brands into working channels',
    body: 'Storefronts, campaigns, and digital systems for teams that need traction.',
    image: '/images/petunis-storefront.png',
    to: '/client-work'
  },
  {
    label: 'Product Builds',
    title: 'Ideas into interfaces',
    body: 'Zero-to-one product work across launch flows, APIs, and feedback loops.',
    image: '/WeatherFixers/Storefront.png',
    to: '/projects'
  },
  {
    label: 'Technology',
    title: 'Useful leverage',
    body: 'Automation, analytics, and AI where they make the work sharper.',
    image: '/GTS/GTS Site shot.png',
    to: '/about'
  }
]

const metrics = [
  { value: '3+', label: 'Years Building' },
  { value: '5+', label: 'Products Launched' },
  { value: '100+', label: 'People Educated' }
]

function BuilderPortraitHero() {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 24, mass: 0.45 })
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 24, mass: 0.45 })
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [3.5, -3.5])
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5])
  const portraitX = useTransform(smoothX, [-0.5, 0.5], [-12, 12])
  const portraitY = useTransform(smoothY, [-0.5, 0.5], [-8, 8])
  const proofShift = useTransform(smoothX, [-0.5, 0.5], [12, -12])
  const spotlightX = useTransform(smoothX, (value) => `${58 + value * 16}%`)
  const spotlightY = useTransform(smoothY, (value) => `${42 + value * 14}%`)

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
      className="portrait-hero"
      style={{ '--spotlight-x': spotlightX, '--spotlight-y': spotlightY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={settlePointer}
    >
      <div className="portrait-hero__grain" aria-hidden="true" />
      <div className="portrait-hero__container">
        <motion.div
          className="portrait-hero__copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: ndsEase }}
        >
          <p className="portrait-hero__label">
            Marketing Leader &middot; Product Builder &middot; Emerging Technology
          </p>
          <h1 className="portrait-hero__name">Gunnar Neuman</h1>
          <p className="portrait-hero__line">I turn ideas into working systems.</p>
          <p className="portrait-hero__dek">
            Strategy, product thinking, and technical execution for teams building
            from zero to one.
          </p>

          <div className="portrait-hero__actions">
            <Link to="/projects" className="btn btn-primary btn-magnetic">
              See What I've Built
              <span className="btn-arrow">&rarr;</span>
            </Link>
            <Link to="/contact" className="btn portrait-hero__secondary-action">
              Get in Touch
            </Link>
          </div>

          <div className="portrait-hero__metrics" aria-label="Builder metrics">
            {metrics.map((metric) => (
              <div className="portrait-hero__metric" key={metric.label}>
                <span>{metric.value}</span>
                <small>{metric.label}</small>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="portrait-hero__visual"
          style={reduceMotion ? undefined : { rotateX, rotateY }}
          initial={{ opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.12, ease: ndsEase }}
          aria-label="Portrait surrounded by work evidence"
        >
          <div className="portrait-hero__plate" aria-hidden="true" />
          <motion.div
            className="portrait-hero__portrait"
            style={reduceMotion ? undefined : { x: portraitX, y: portraitY }}
          >
            <img src="/images/gunnar-headshot.webp" alt="Gunnar Neuman" />
          </motion.div>

          <motion.div
            className="portrait-hero__proofs"
            style={reduceMotion ? undefined : { x: proofShift }}
          >
            {proofItems.map((item, index) => (
              <motion.article
                className={`portrait-proof portrait-proof--${index + 1}`}
                key={item.title}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.3 + index * 0.13, ease: ndsEase }}
              >
                <Link to={item.to} className="portrait-proof__link">
                  <span className="portrait-proof__label">{item.label}</span>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                  <img src={item.image} alt="" aria-hidden="true" />
                </Link>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            className="portrait-hero__tag portrait-hero__tag--strategy"
            animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Strategy
          </motion.div>
          <motion.div
            className="portrait-hero__tag portrait-hero__tag--product"
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          >
            Product
          </motion.div>
          <motion.div
            className="portrait-hero__tag portrait-hero__tag--technology"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            Technology
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default BuilderPortraitHero
