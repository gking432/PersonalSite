import { motion, AnimatePresence, useScroll, useTransform, useAnimationControls } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import './PokerTable.css'

const ndsEase = [0.22, 1, 0.36, 1]

function PokerTable() {
  const [inspectingCard, setInspectingCard] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const sectionRef = useRef(null)
  const cardRefs = [useRef(null), useRef(null), useRef(null)]
  const cardPositionRef = useRef(null)
  const cardsDealtRef = useRef(false)

  const card1Controls = useAnimationControls()
  const card2Controls = useAnimationControls()
  const card3Controls = useAnimationControls()
  const cardControls = [card1Controls, card2Controls, card3Controls]

  // Initialize cards off-screen
  useEffect(() => {
    card1Controls.set({ x: 3000, y: 0, rotate: 99, opacity: 1 })
    card2Controls.set({ x: 3000, y: 0, rotate: 99, opacity: 1 })
    card3Controls.set({ x: 3000, y: 0, rotate: 99, opacity: 1 })
  }, [card1Controls, card2Controls, card3Controls])

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const tableX = useTransform(scrollYProgress, [0, 0.4, 0.7, 0.88], [1800, 0, 0, 1800])
  const contentOpacity = useTransform(scrollYProgress, [0.58, 0.7], [1, 0])

  const scrollReadyRef = useRef(false)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= 0.4) scrollReadyRef.current = true
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  // Deal cards
  useEffect(() => {
    if (cardsDealtRef.current) return

    if (scrollReadyRef.current) {
      dealCards()
      return
    }

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= 0.4 && !cardsDealtRef.current) {
        dealCards()
        unsubscribe()
      }
    })
    return () => unsubscribe()

    function dealCards() {
      cardsDealtRef.current = true

      card1Controls.start({
        x: 0, y: 0, rotate: -15,
        transition: { duration: 0.8, ease: ndsEase }
      })

      setTimeout(() => {
        card2Controls.start({
          x: 120, y: -18, rotate: -3,
          transition: { duration: 0.8, ease: ndsEase }
        })
      }, 500)

      setTimeout(() => {
        card3Controls.start({
          x: 240, y: -5, rotate: 9,
          transition: { duration: 0.8, ease: ndsEase }
        })
        setTimeout(() => setShowPrompt(true), 2300)
      }, 1000)
    }
  }, [scrollYProgress, card1Controls, card2Controls, card3Controls])

  const projects = [
    {
      name: "Aptos Token Launcher",
      description: "Web application for creating and deploying tokens on Aptos blockchain. Simplified a complex technical process into an accessible interface.",
      stat: "100+",
      statLabel: "Tokens Deployed",
      tech: ["React", "Aptos SDK", "Web3"],
      link: "/projects/aptos"
    },
    {
      name: "PrepMe AI",
      description: "Interview practice platform using Claude AI with real-time feedback. Helps users improve their interview skills through realistic simulations.",
      stat: "50+",
      statLabel: "Active Users",
      tech: ["React", "Anthropic API", "Voice"],
      link: "/projects/prepme"
    },
    {
      name: "AI Literacy Lectures",
      description: "Educational program teaching everyday users about AI fundamentals. Breaking down complex concepts into digestible, actionable knowledge.",
      stat: "100+",
      statLabel: "Attendees",
      tech: ["Education", "Public Speaking", "AI"],
      link: "/projects/lectures"
    }
  ]

  const handleCardClick = (index) => {
    const cardEl = cardRefs[index]?.current
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    cardPositionRef.current = {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    }
    setInspectingCard(index)
  }

  const handleDismiss = () => {
    setInspectingCard(null)
  }

  return (
    <section className="poker-table-section" ref={sectionRef}>
      <div className="poker-table-wrapper">
        {/* Left Column */}
        <motion.div className="poker-content-column" style={{ opacity: contentOpacity }}>
          <div className="container">
            <motion.p
              className="label"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Work
            </motion.p>
            <motion.h2
              className="section-heading"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Project Highlights
            </motion.h2>
            <motion.div
              className="poker-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: showPrompt ? 1 : 0 }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              <p>Select a project</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column — Card Surface */}
        <div className="poker-table-column">
          <motion.div
            className="poker-table-container"
            style={{ x: tableX }}
          >
            {/* Cards */}
            <div className="cards-area">
              {projects.map((project, i) => (
                <motion.div
                  key={i}
                  ref={cardRefs[i]}
                  className={`card-container ${inspectingCard === i ? 'card-hidden' : ''}`}
                  animate={cardControls[i]}
                  initial={{ x: 3000, y: 0, rotate: 99, opacity: 1 }}
                  onClick={() => handleCardClick(i)}
                >
                  <motion.div
                    className="card-hover-layer"
                    whileHover={{
                      scale: 1.08,
                      y: -10,
                      transition: { duration: 0.2, ease: ndsEase }
                    }}
                  >
                    {/* Playing Card Back */}
                    <div className="card-back">
                      <div className="card-back-edge">
                        <div className="card-back-frame">
                          <svg className="card-back-pattern" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice">
                            <defs>
                              <pattern id={`diamonds${i}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="20" height="20" fill="none" />
                                <rect x="8" y="8" width="4" height="4" rx="0.5" fill="rgba(244,241,234,0.08)" transform="rotate(45 10 10)" />
                                <circle cx="0" cy="0" r="1" fill="rgba(244,241,234,0.05)" />
                                <circle cx="20" cy="0" r="1" fill="rgba(244,241,234,0.05)" />
                                <circle cx="0" cy="20" r="1" fill="rgba(244,241,234,0.05)" />
                                <circle cx="20" cy="20" r="1" fill="rgba(244,241,234,0.05)" />
                              </pattern>
                              <pattern id={`filigree${i}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <rect width="40" height="40" fill="none" />
                                <path d="M20 0 Q25 10 20 20 Q15 10 20 0Z" fill="rgba(244,241,234,0.04)" />
                                <path d="M0 20 Q10 25 20 20 Q10 15 0 20Z" fill="rgba(244,241,234,0.04)" />
                                <path d="M20 20 Q25 30 20 40 Q15 30 20 20Z" fill="rgba(244,241,234,0.04)" />
                                <path d="M20 20 Q30 25 40 20 Q30 15 20 20Z" fill="rgba(244,241,234,0.04)" />
                              </pattern>
                            </defs>
                            <rect width="200" height="300" fill={`url(#diamonds${i})`} />
                            <rect width="200" height="300" fill={`url(#filigree${i})`} />
                          </svg>
                          <div className="card-back-medallion">
                            <div className="card-back-medallion-ring">
                              <span className="card-back-monogram">G</span>
                            </div>
                          </div>
                          {/* Corner pips */}
                          <svg className="card-back-pip card-back-pip-tl" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                          </svg>
                          <svg className="card-back-pip card-back-pip-tr" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                          </svg>
                          <svg className="card-back-pip card-back-pip-bl" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                          </svg>
                          <svg className="card-back-pip card-back-pip-br" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════ INSPECTION — 3D CARD FLIP ═══════ */}
      <AnimatePresence>
        {inspectingCard !== null && cardPositionRef.current && (
          <>
            {/* Parchment blur overlay */}
            <motion.div
              key="overlay"
              className="inspection-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              onClick={handleDismiss}
            />

            {/* Card — flies from table to center, flips */}
            <motion.div
              key={`inspect-${inspectingCard}`}
              className="inspected-card"
              initial={{
                left: cardPositionRef.current.centerX,
                top: cardPositionRef.current.centerY,
                x: '-50%',
                y: '-50%',
                width: cardPositionRef.current.width,
                height: cardPositionRef.current.height,
              }}
              animate={{
                left: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
                top: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
                x: '-50%',
                y: '-50%',
                width: 400,
                height: 580,
                transition: { duration: 0.6, ease: ndsEase }
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15, ease: ndsEase }
              }}
            >
              <motion.div
                className="inspected-card-inner"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180, transition: { duration: 0.6, ease: ndsEase } }}
                exit={{ rotateY: 0, transition: { duration: 0.25, ease: ndsEase } }}
              >
                {/* BACK FACE */}
                <div className="inspected-face inspected-face-back">
                  <div className="card-back">
                    <div className="card-back-edge">
                      <div className="card-back-frame">
                        <svg className="card-back-pattern" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice">
                          <defs>
                            <pattern id="diamondsInspect" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                              <rect width="20" height="20" fill="none" />
                              <rect x="8" y="8" width="4" height="4" rx="0.5" fill="rgba(244,241,234,0.08)" transform="rotate(45 10 10)" />
                              <circle cx="0" cy="0" r="1" fill="rgba(244,241,234,0.05)" />
                              <circle cx="20" cy="0" r="1" fill="rgba(244,241,234,0.05)" />
                              <circle cx="0" cy="20" r="1" fill="rgba(244,241,234,0.05)" />
                              <circle cx="20" cy="20" r="1" fill="rgba(244,241,234,0.05)" />
                            </pattern>
                            <pattern id="filigreeInspect" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                              <rect width="40" height="40" fill="none" />
                              <path d="M20 0 Q25 10 20 20 Q15 10 20 0Z" fill="rgba(244,241,234,0.04)" />
                              <path d="M0 20 Q10 25 20 20 Q10 15 0 20Z" fill="rgba(244,241,234,0.04)" />
                              <path d="M20 20 Q25 30 20 40 Q15 30 20 20Z" fill="rgba(244,241,234,0.04)" />
                              <path d="M20 20 Q30 25 40 20 Q30 15 20 20Z" fill="rgba(244,241,234,0.04)" />
                            </pattern>
                          </defs>
                          <rect width="200" height="300" fill="url(#diamondsInspect)" />
                          <rect width="200" height="300" fill="url(#filigreeInspect)" />
                        </svg>
                        <div className="card-back-medallion">
                          <div className="card-back-medallion-ring">
                            <span className="card-back-monogram">G</span>
                          </div>
                        </div>
                        <svg className="card-back-pip card-back-pip-tl" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                        </svg>
                        <svg className="card-back-pip card-back-pip-tr" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                        </svg>
                        <svg className="card-back-pip card-back-pip-bl" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                        </svg>
                        <svg className="card-back-pip card-back-pip-br" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="rgba(244,241,234,0.1)" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FRONT FACE — NDS editorial project card */}
                <div className="inspected-face inspected-face-front">
                  <button className="close-btn" onClick={(e) => { e.stopPropagation(); handleDismiss() }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <div className="project-info">
                    <div className="project-stat-group">
                      <span className="project-stat-number">{projects[inspectingCard].stat}</span>
                      <span className="project-stat-label">{projects[inspectingCard].statLabel}</span>
                    </div>
                    <div className="project-divider" />
                    <h3>{projects[inspectingCard].name}</h3>
                    <p>{projects[inspectingCard].description}</p>
                    <div className="project-tech">
                      {projects[inspectingCard].tech.map((tech, idx) => (
                        <span key={idx}>{tech}</span>
                      ))}
                    </div>
                    <a href={projects[inspectingCard].link} className="project-link">
                      View Project
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default PokerTable
