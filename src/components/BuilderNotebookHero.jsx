import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion'
import './BuilderNotebookHero.css'

const ndsEase = [0.22, 1, 0.36, 1]

const metrics = [
  { value: '3+', label: 'Years Building' },
  { value: '5+', label: 'Products Launched' },
  { value: '100+', label: 'People Educated' }
]

const notes = [
  {
    text: 'P_octas(s) = 19029514756 / (800000000 - s) + 61.9053276',
    className: 'notebook-note--formula'
  },
  {
    text: 'P_APT = P_octas / 1e8',
    className: 'notebook-note--convert'
  },
  {
    text: 'launch -> early -> midpoint -> late -> graduation',
    className: 'notebook-note--flow'
  },
  {
    text: 'graduation ~= 792,260,950 tokens',
    className: 'notebook-note--graduation'
  },
  {
    text: 'price rise ~= 29.41x',
    className: 'notebook-note--rise'
  },
  {
    text: 'LP raised ~= 1283.7 APT',
    className: 'notebook-note--liquidity'
  },
  {
    text: '800M curve + 200M liquidity',
    className: 'notebook-note--supply'
  },
  {
    text: 'price_numerator = 19_029_514_756u128',
    className: 'notebook-note--move'
  }
]

function BuilderNotebookHero() {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 24, mass: 0.45 })
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 24, mass: 0.45 })
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [3.5, -3.5])
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5])
  const fieldX = useTransform(smoothX, [-0.5, 0.5], [-18, 18])
  const fieldY = useTransform(smoothY, [-0.5, 0.5], [-10, 10])
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

  const pathTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 1.4, delay: 0.45, ease: ndsEase }

  return (
    <motion.section
      className="notebook-hero"
      style={{ '--spotlight-x': spotlightX, '--spotlight-y': spotlightY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={settlePointer}
    >
      <div className="notebook-hero__grain" aria-hidden="true" />
      <div className="notebook-hero__container">
        <motion.div
          className="notebook-hero__copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: ndsEase }}
        >
          <p className="notebook-hero__label">
            Marketing Leader &middot; Product Builder &middot; Emerging Technology
          </p>
          <h1 className="notebook-hero__name">Gunnar Neuman</h1>
          <p className="notebook-hero__line">I turn ideas into working systems.</p>
          <p className="notebook-hero__dek">
            Strategy, product thinking, and technical execution for teams building
            from zero to one.
          </p>

          <div className="notebook-hero__actions">
            <Link to="/projects" className="btn btn-primary btn-magnetic">
              See What I've Built
              <span className="btn-arrow">&rarr;</span>
            </Link>
            <Link to="/contact" className="btn notebook-hero__secondary-action">
              Get in Touch
            </Link>
          </div>

          <div className="notebook-hero__metrics" aria-label="Builder metrics">
            {metrics.map((metric) => (
              <div className="notebook-hero__metric" key={metric.label}>
                <span>{metric.value}</span>
                <small>{metric.label}</small>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="notebook-hero__visual"
          style={reduceMotion ? undefined : { rotateX, rotateY }}
          initial={{ opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.12, ease: ndsEase }}
          aria-label="Builder notebook formulas and launch mechanics"
        >
          <motion.div
            className="notebook-hero__field"
            style={reduceMotion ? undefined : { x: fieldX, y: fieldY }}
          >
            <svg
              className="notebook-hero__curve"
              viewBox="0 0 620 420"
              role="img"
              aria-label="Hand drawn bonding curve sketch"
            >
              <motion.path
                className="notebook-hero__axis"
                d="M72 340 C162 345 256 344 540 338"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={pathTransition}
              />
              <motion.path
                className="notebook-hero__axis"
                d="M84 342 C75 260 72 178 78 76"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ ...pathTransition, delay: 0.55 }}
              />
              <motion.path
                className="notebook-hero__curve-line"
                d="M95 316 C170 314 245 310 318 296 C392 281 448 244 482 180 C506 134 526 89 548 58"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ ...pathTransition, duration: 1.7, delay: 0.72 }}
              />
              <motion.path
                className="notebook-hero__scratch"
                d="M112 94 C178 73 260 88 320 66 C380 45 440 52 502 28"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ ...pathTransition, delay: 0.95 }}
              />
              <motion.path
                className="notebook-hero__scratch notebook-hero__scratch--dim"
                d="M410 108 C446 122 494 121 532 140 M426 126 C461 138 498 140 548 158"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ ...pathTransition, delay: 1.08 }}
              />
              <motion.circle
                className="notebook-hero__dot"
                cx="548"
                cy="58"
                r="7"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : 1.55, ease: ndsEase }}
              />
              <text x="94" y="64">price</text>
              <text x="408" y="374">tokens sold</text>
              <text x="457" y="50">graduation</text>
            </svg>

            {notes.map((note, index) => (
              <motion.p
                className={`notebook-note ${note.className}`}
                key={note.text}
                initial={{ opacity: 0, y: 10, rotate: -1 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 + index * 0.08, ease: ndsEase }}
              >
                {note.text}
              </motion.p>
            ))}

            <div className="notebook-hero__smudge notebook-hero__smudge--one" aria-hidden="true" />
            <div className="notebook-hero__smudge notebook-hero__smudge--two" aria-hidden="true" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default BuilderNotebookHero
