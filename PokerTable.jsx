import { motion, AnimatePresence, useScroll, useTransform, useAnimationControls } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import './PokerTable.css'

const POKER_TABLE_SVG = '/images/Pokertable.svg'
const CARD_BACK_SVG = '/images/Cardback.svg'
const SHADOW_SVG = '/images/Shadow.svg'

const IMAGE_SRCS = [POKER_TABLE_SVG, CARD_BACK_SVG, SHADOW_SVG]

const ndsEase = [0.22, 1, 0.36, 1]

function PokerTable() {
  const [inspectingCard, setInspectingCard] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const sectionRef = useRef(null)
  const cardRefs = [useRef(null), useRef(null), useRef(null)]
  const cardPositionRef = useRef(null)
  const cardsDealtRef = useRef(false)

  // Animation controls for each card
  const card1Controls = useAnimationControls()
  const card2Controls = useAnimationControls()
  const card3Controls = useAnimationControls()
  const cardControls = [card1Controls, card2Controls, card3Controls]

  // Preload all images
  useEffect(() => {
    let cancelled = false
    Promise.all(
      IMAGE_SRCS.map(src => new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = resolve // don't block on failure
        img.src = src
      }))
    ).then(() => {
      if (!cancelled) setImagesLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

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

  // Table slides in from right, then slides back out on continued scroll
  const tableX = useTransform(scrollYProgress, [0, 0.4, 0.7, 0.88], [1800, 0, 0, 1800])

  // Shadow fades in with table, fades out BEFORE table starts sliding out
  const shadowOpacity = useTransform(scrollYProgress, [0.1, 0.4, 0.58, 0.7], [0, 1, 1, 0])

  // Text column fades out alongside the shadow
  const contentOpacity = useTransform(scrollYProgress, [0.58, 0.7], [1, 0])

  // Track whether scroll has reached the deal threshold
  const scrollReadyRef = useRef(false)

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= 0.4) scrollReadyRef.current = true
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  // Deal cards once BOTH images are loaded AND scroll has reached threshold
  useEffect(() => {
    if (!imagesLoaded || cardsDealtRef.current) return

    // If scroll already past threshold, deal immediately
    if (scrollReadyRef.current) {
      dealCards()
      return
    }

    // Otherwise wait for scroll to reach threshold
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
  }, [imagesLoaded, scrollYProgress, card1Controls, card2Controls, card3Controls])

  // Projects data
  const projects = [
    {
      name: "Aptos Token Launcher",
      description: "Web application for creating and deploying tokens on Aptos blockchain.",
      stat: "100+ Tokens Deployed",
      tech: ["React", "Aptos SDK", "Web3"],
      link: "/projects/aptos"
    },
    {
      name: "PrepMe AI",
      description: "Interview practice platform using Claude AI with real-time feedback.",
      stat: "50+ Active Users",
      tech: ["React", "Anthropic API", "Voice"],
      link: "/projects/prepme"
    },
    {
      name: "AI Literacy Lectures",
      description: "Educational program teaching everyday users about AI fundamentals.",
      stat: "100+ Attendees",
      tech: ["Education", "Public Speaking", "AI"],
      link: "/projects/lectures"
    }
  ]

  // Handle card click — capture the card's visual center + size
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
        {/* Shadow Overlay */}
        <motion.div
          className="poker-table-shadow-overlay"
          style={{ opacity: shadowOpacity }}
        >
          <img src={SHADOW_SVG} alt="" />
        </motion.div>

        {/* Left Column - Text Content */}
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
              Selected Projects
            </motion.h2>
            <motion.div
              className="poker-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: showPrompt ? 1 : 0 }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              <p>GO AHEAD, PICK ONE</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Poker Table */}
        <div className="poker-table-column">
          <motion.div
            className="poker-table-container"
            style={{ x: tableX }}
          >
            <div className="poker-table-image">
              <img src={POKER_TABLE_SVG} alt="Poker Table" />
            </div>

            {/* Cards */}
            <div className="cards-area">
              {projects.map((project, i) => (
                <motion.div
                  key={i}
                  ref={cardRefs[i]}
                  className={`card-container ${inspectingCard === i ? 'card-hidden' : ''}`}
                  animate={cardControls[i]}
                  initial={{ x: 3000, y: 0, rotate: 99, opacity: 1 }}
                  whileHover={{
                    scale: 1.08,
                    y: -10,
                    transition: { duration: 0.2, ease: ndsEase }
                  }}
                  onClick={() => handleCardClick(i)}
                >
                  <img src={SHADOW_SVG} className="card-shadow" alt="" />
                  <img src={CARD_BACK_SVG} className="card-back" alt="Card back" />
                </motion.div>
              ))}
            </div>

            <button className="shuffle-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <span>SHUFFLE</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ═══════ INSPECTION MODAL — TRUE 3D CARD FLIP ═══════ */}
      <AnimatePresence>
        {inspectingCard !== null && cardPositionRef.current && (
          <>
            {/* Dark overlay */}
            <motion.div
              key="overlay"
              className="inspection-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              onClick={handleDismiss}
            />

            {/* The card — starts at table card position, flies to center, flips */}
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
                width: 380,
                height: 520,
                transition: { duration: 0.6, ease: ndsEase }
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15, ease: ndsEase }
              }}
            >
              {/* Inner — flips to reveal project, reverses on close */}
              <motion.div
                className="inspected-card-inner"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180, transition: { duration: 0.6, ease: ndsEase } }}
                exit={{ rotateY: 0, transition: { duration: 0.25, ease: ndsEase } }}
              >
                {/* BACK FACE — card back image (visible at rotateY: 0) */}
                <div className="inspected-face inspected-face-back">
                  <img src={CARD_BACK_SVG} alt="Card back" />
                </div>

                {/* FRONT FACE — project info (visible at rotateY: 180) */}
                <div className="inspected-face inspected-face-front">
                  <button className="close-btn" onClick={(e) => { e.stopPropagation(); handleDismiss() }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                  <div className="project-info">
                    <div className="project-stat">{projects[inspectingCard].stat}</div>
                    <h3>{projects[inspectingCard].name}</h3>
                    <p>{projects[inspectingCard].description}</p>
                    <div className="project-tech">
                      {projects[inspectingCard].tech.map((tech, idx) => (
                        <span key={idx}>{tech}</span>
                      ))}
                    </div>
                    <a href={projects[inspectingCard].link} className="project-link">
                      View Project →
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
