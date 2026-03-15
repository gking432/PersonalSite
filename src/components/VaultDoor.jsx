import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './VaultDoor.css'

const ndsEase = [0.22, 1, 0.36, 1]

const featuredWork = [
  {
    number: '01',
    title: 'Aptos Token Launcher',
    tag: 'Web3 · Product',
    desc: 'Built a user-friendly interface for creating and deploying tokens on the Aptos blockchain.',
    link: '/projects',
  },
  {
    number: '02',
    title: 'PrepMe',
    tag: 'AI · Product',
    desc: 'AI-powered interview practice platform with real-time feedback using Claude.',
    link: '/projects',
  },
  {
    number: '03',
    title: 'Client Work',
    tag: 'Brand · Strategy',
    desc: 'Brand identities, eCommerce builds, and go-to-market campaigns for early-stage companies.',
    link: '/client-work',
  },
]

function VaultDoor() {
  const sectionRef = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  // Phase 1 (0 → 0.35): Dial spins, section comes into view
  // Phase 2 (0.35 → 0.55): Door opens (splits apart)
  // Phase 3 (0.55 → 0.75): Cards reveal behind door
  // Phase 4 (0.75 → 1): Hold + scroll out

  // Dial rotation: continuous spin through phase 1
  const dialRotation = useTransform(scrollYProgress, [0.1, 0.38], [0, 720])
  const smoothDial = useSpring(dialRotation, { stiffness: 80, damping: 25 })

  // Dial tick marks glow
  const dialGlow = useTransform(scrollYProgress, [0.28, 0.35], [0, 1])

  // Door opening: left and right halves split apart
  const leftDoorX = useTransform(scrollYProgress, [0.35, 0.52], [0, -105])
  const rightDoorX = useTransform(scrollYProgress, [0.35, 0.52], [0, 105])
  const smoothLeftDoor = useSpring(leftDoorX, { stiffness: 60, damping: 20 })
  const smoothRightDoor = useSpring(rightDoorX, { stiffness: 60, damping: 20 })

  // Door opacity (fade out as they open wide)
  const doorOpacity = useTransform(scrollYProgress, [0.48, 0.58], [1, 0])

  // Vault frame scale: slight pull-back as door opens
  const frameScale = useTransform(scrollYProgress, [0.35, 0.55], [1, 0.92])

  // Cards reveal
  const cardsOpacity = useTransform(scrollYProgress, [0.48, 0.58], [0, 1])
  const cardsY = useTransform(scrollYProgress, [0.48, 0.60], [60, 0])

  // Header text
  const headerOpacity = useTransform(scrollYProgress, [0.08, 0.18], [0, 1])
  const headerY = useTransform(scrollYProgress, [0.08, 0.18], [40, 0])

  // Tagline swap: "Some things are worth protecting" → "Here's what I've built"
  const taglineBefore = useTransform(scrollYProgress, [0.42, 0.50], [1, 0])
  const taglineAfter = useTransform(scrollYProgress, [0.52, 0.60], [0, 1])

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      setIsRevealed(v > 0.55)
    })
    return unsub
  }, [scrollYProgress])

  return (
    <section className="vault-section" ref={sectionRef}>
      <div className="vault-sticky">
        {/* Header */}
        <motion.div
          className="vault-header"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p className="label">Selected Work</p>
          <motion.p
            className="vault-tagline"
            style={{ opacity: taglineBefore }}
          >
            Some things are worth protecting.
          </motion.p>
          <motion.p
            className="vault-tagline vault-tagline-after"
            style={{ opacity: taglineAfter }}
          >
            Here's what I've built.
          </motion.p>
        </motion.div>

        {/* Vault Assembly */}
        <motion.div className="vault-assembly" style={{ scale: frameScale }}>
          {/* Vault Frame (the border/arch around the door) */}
          <div className="vault-frame">
            {/* Left Door */}
            <motion.div
              className="vault-door vault-door-left"
              style={{ x: smoothLeftDoor, opacity: doorOpacity }}
            >
              <div className="vault-door-inner">
                <div className="vault-door-bolts">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="vault-bolt" />
                  ))}
                </div>
                <div className="vault-door-hinge vault-hinge-top" />
                <div className="vault-door-hinge vault-hinge-bottom" />
              </div>
            </motion.div>

            {/* Right Door (with dial) */}
            <motion.div
              className="vault-door vault-door-right"
              style={{ x: smoothRightDoor, opacity: doorOpacity }}
            >
              <div className="vault-door-inner">
                <div className="vault-door-bolts vault-door-bolts-right">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="vault-bolt" />
                  ))}
                </div>
                {/* Combination Dial */}
                <div className="vault-dial-housing">
                  <motion.div
                    className="vault-dial"
                    style={{ rotate: smoothDial }}
                  >
                    {/* Tick marks around the dial */}
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className={`vault-tick ${i % 5 === 0 ? 'vault-tick-major' : ''}`}
                        style={{ transform: `rotate(${i * 6}deg)` }}
                      />
                    ))}
                    <div className="vault-dial-center" />
                    <div className="vault-dial-handle" />
                  </motion.div>
                  <motion.div
                    className="vault-dial-glow"
                    style={{ opacity: dialGlow }}
                  />
                </div>
                <div className="vault-door-hinge vault-hinge-top" />
                <div className="vault-door-hinge vault-hinge-bottom" />
              </div>
            </motion.div>

            {/* Behind the door: the reveal content */}
            <div className="vault-interior">
              <motion.div
                className="vault-cards"
                style={{ opacity: cardsOpacity, y: cardsY }}
              >
                {featuredWork.map((project, i) => (
                  <motion.div
                    key={i}
                    className="vault-card"
                    initial={false}
                    whileHover={isRevealed ? { y: -6, scale: 1.02 } : {}}
                    transition={{ duration: 0.3, ease: ndsEase }}
                  >
                    <Link to={project.link} className="vault-card-link">
                      <span className="vault-card-number">{project.number}</span>
                      <span className="vault-card-tag">{project.tag}</span>
                      <h3 className="vault-card-title">{project.title}</h3>
                      <p className="vault-card-desc">{project.desc}</p>
                      <span className="vault-card-arrow">&rarr;</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default VaultDoor
