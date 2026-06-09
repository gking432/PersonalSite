import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import './EditorialHero.css'

const ndsEase = [0.22, 1, 0.36, 1]

// Real proof — cycled one line at a time, calmly.
const proofItems = [
  { key: 'Now', value: 'Building MoveMint, Terralis Print Studio & product concepts' },
  { key: 'Founded', value: 'TouchPoint Marketing Solutions — full client lifecycle' },
  { key: 'Shipped', value: 'Brand, web & acquisition for premium local businesses' },
  { key: 'Trained', value: '2.5-yr rotation across a premium product brand' }
]

function RotatingProof() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % proofItems.length)
    }, 3200)
    return () => clearInterval(id)
  }, [reduceMotion])

  const item = proofItems[index]

  return (
    <div className="editorial-hero__proof" aria-live="polite">
      <span className="editorial-hero__proof-rule" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.p
          key={item.key}
          className="editorial-hero__proof-line"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: 0.55, ease: ndsEase }}
        >
          <span className="editorial-hero__proof-key">{item.key}</span>
          <span className="editorial-hero__proof-value">{item.value}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

function EditorialHero() {
  return (
    <motion.section
      className="editorial-hero"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
      }}
    >
      <div className="editorial-hero__inner">
        <motion.p
          className="editorial-hero__eyebrow"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ndsEase } }
          }}
        >
          Product-minded marketer<span>·</span>builder<span>·</span>operator
        </motion.p>

        <motion.h1
          className="editorial-hero__name"
          variants={{
            hidden: { opacity: 0, y: 28 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: ndsEase } }
          }}
        >
          Gunnar Neuman
        </motion.h1>

        <motion.p
          className="editorial-hero__statement"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ndsEase } }
          }}
        >
          I build the path from idea to launch — turning customer insight and product
          strategy into products, campaigns, and measurable growth.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ndsEase } }
          }}
        >
          <RotatingProof />
        </motion.div>

        <motion.div
          className="editorial-hero__actions"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: ndsEase } }
          }}
        >
          <Link to="/projects" className="btn btn-primary btn-lg">
            View the work
            <span className="btn-arrow">&rarr;</span>
          </Link>
          <Link to="/contact" className="btn btn-secondary btn-lg">
            Get in touch
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="editorial-hero__scroll"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1, ease: ndsEase }}
      >
        <span className="editorial-hero__scroll-line" />
        <span className="editorial-hero__scroll-label">Scroll</span>
      </motion.div>
    </motion.section>
  )
}

export default EditorialHero
