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
  const portraitX = useTransform(smoothX, [-0.5, 0.5], [-18, 18])
  const portraitY = useTransform(smoothY, [-0.5, 0.5], [-10, 10])
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
          aria-label="Gunnar Neuman portrait"
        >
          <motion.div
            className="portrait-hero__portrait"
            style={reduceMotion ? undefined : { x: portraitX, y: portraitY }}
          >
            <img src="/images/gunnar-headshot.webp" alt="Gunnar Neuman" />
          </motion.div>
          <div className="portrait-hero__halo" aria-hidden="true" />
        </motion.div>
      </div>
    </motion.section>
  )
}

export default BuilderPortraitHero
