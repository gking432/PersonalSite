import { motion, AnimatePresence, useScroll, useTransform, useAnimationControls } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import './PokerTable.css'

// Import your SVG files
// Place Pokertable.svg, Cardback.svg, and Shadow.svg in /public/images/
const POKER_TABLE_SVG = '/images/Pokertable.svg'
const CARD_BACK_SVG = '/images/Cardback.svg'
const SHADOW_SVG = '/images/Shadow.svg'

function PokerTable() {
  const [inspectingCard, setInspectingCard] = useState(null) // null or card index (0, 1, 2)
  const [cardsDealt, setCardsDealt] = useState(false) // Track if cards should start dealing
  const [showPrompt, setShowPrompt] = useState(false) // Track if prompt should be visible
  const sectionRef = useRef(null)
  const containerRef = useRef(null)
  const cardRefs = [useRef(null), useRef(null), useRef(null)] // Refs for each card to get their positions
  
  // Function to get card position - called when needed
  const getCardPosition = (index) => {
    const cardElement = cardRefs[index]?.current
    if (!cardElement) return { x: 0, y: 0, rotate: 0 }
    
    const rect = cardElement.getBoundingClientRect()
    // Get the card's center position
    const cardCenterX = rect.left + rect.width / 2
    const cardCenterY = rect.top + rect.height / 2
    
    // The inspected-card is positioned with left: 50% (center), so we need to calculate
    // position relative to that center point
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2
    
    // Get the card's current rotation - cards-area is rotated -45deg, and each card has its own rotation
    // Card 1: -15deg, Card 2: -3deg, Card 3: 9deg (these are relative to the cards-area)
    // So total rotation = cards-area rotation (-45deg) + card's own rotation
    const cardRotation = cardPositions[index].rotate // This is the card's rotation relative to cards-area
    const cardsAreaRotation = -45 // Cards-area is rotated -45deg
    const totalRotation = cardsAreaRotation + cardRotation // Total: Card1=-60, Card2=-48, Card3=-36
    
    return {
      x: cardCenterX - viewportCenterX, // Position relative to viewport center (where left: 50% is)
      y: cardCenterY - viewportCenterY, // Position relative to viewport center (where top: 50% is)
      rotate: totalRotation // Total rotation including cards-area rotation
    }
  }
  
  // Animation controls for each card - set initial state to off-screen
  const card1Controls = useAnimationControls()
  const card2Controls = useAnimationControls()
  const card3Controls = useAnimationControls()
  
  // Initialize cards to off-screen position
  useEffect(() => {
    card1Controls.set({ x: 3000, y: 0, rotate: 99, opacity: 1 })
    card2Controls.set({ x: 3000, y: 0, rotate: 99, opacity: 1 })
    card3Controls.set({ x: 3000, y: 0, rotate: 99, opacity: 1 })
  }, [card1Controls, card2Controls, card3Controls])
  // Scroll animation for poker table - slides in from right
  // Uses same sticky scroll pattern as PhotoSection - section "sticks" for 200vh of scroll
  // Start tracking much earlier - when section is still below viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"] // Track from when section start reaches viewport bottom to when section end reaches viewport top
  })
  
  // Map scroll progress (0-1) to x position
  // Animation starts much earlier - when section is approaching viewport
  // Table starts completely off-screen to the right and slides into position
  // The container already has right: -200px, so we add transform to move it further right initially
  const tableX = useTransform(
    scrollYProgress,
    [0, 0.4], // Animation happens in first 40% of scroll (starts when section is approaching)
    [1800, 0] // X position: start 1800px to the right (completely off-screen), end at 0 (final position)
  )
  
  // Shadow fade-in animation - matches table slide-in exactly
  const shadowOpacity = useTransform(
    scrollYProgress,
    [0, 0.4], // Same range as table animation - starts much earlier
    [0, 1] // Fade in from transparent to fully visible
  )
  
  // Trigger card dealing animations after table animation completes
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= 0.4 && !cardsDealt) {
        setCardsDealt(true)
        // Start dealing cards with delays
        // Final positions match the original CSS layout
        card1Controls.start({
          x: 0,
          y: 0,
          rotate: -15,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        })
        
        setTimeout(() => {
          card2Controls.start({
            x: 120, // 120px from left (matches original)
            y: -18, // -18px from top (matches original)
            rotate: -3,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          })
        }, 500) // 0.5 second delay
        
        setTimeout(() => {
          card3Controls.start({
            x: 240, // 240px from left - final position for rightmost card
            y: -5, // -5px from top - slight vertical offset
            rotate: 9, // 9 degrees rotation - final angle
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          })
          // Show prompt 1.5 seconds after card 3 animation completes (0.8s animation + 1.5s delay = 2.3s total)
          setTimeout(() => {
            setShowPrompt(true)
          }, 2300) // 0.8s (card 3 animation) + 1.5s delay = 2.3s after card 3 starts
        }, 1000) // 1 second delay (0.5s after card 2)
      }
    })
    
    return () => unsubscribe()
  }, [scrollYProgress, cardsDealt, card1Controls, card2Controls, card3Controls])
  
  // All projects data
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
  
  // Card positions for inspection modal - match actual table positions
  // These positions are relative to the cards-area container
  const cardPositions = [
    { x: 0, y: 0, rotate: -15 },    // Card 1 (left): matches final animation position
    { x: 120, y: -18, rotate: -3 },  // Card 2 (middle): matches final animation position
    { x: 240, y: -5, rotate: 9 }     // Card 3 (right): matches final animation position
  ]
  
  // Handle card click
  const handleCardClick = (index) => {
    setInspectingCard(index)
  }
  
  // Handle dismiss
  const handleDismiss = () => {
    setInspectingCard(null)
  }
  
  return (
    <section className="poker-table-section" ref={sectionRef}>
      <div className="poker-table-wrapper">
        {/* Shadow Overlay - inside wrapper so it sticks with content, fades in with table */}
        <motion.div 
          className="poker-table-shadow-overlay"
          style={{ opacity: shadowOpacity }}
        >
          <img src={SHADOW_SVG} alt="" />
        </motion.div>
        {/* Left Column - Text Content */}
        <div className="poker-content-column">
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
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p>GO AHEAD, PICK ONE</p>
            </motion.div>
          </div>
        </div>
        
        {/* Right Column - Poker Table */}
        <div className="poker-table-column">
          <motion.div 
            className="poker-table-container"
            style={{ x: tableX }}
          >
            {/* Poker Table SVG */}
            <div className="poker-table-image">
              <img src={POKER_TABLE_SVG} alt="Poker Table" />
            </div>
            
            {/* Cards - dealt one by one after table animation */}
            <div className="cards-area">
              {projects.map((project, i) => {
                // Get the appropriate animation controls for each card
                const cardControls = i === 0 ? card1Controls : i === 1 ? card2Controls : card3Controls
                
                return (
                  <motion.div
                    key={i}
                    ref={cardRefs[i]}
                    className="card-container"
                    animate={cardControls}
                    initial={{
                      x: 3000, // Start off-screen to the right
                      y: 0,
                      rotate: 99, // Start at 99 degrees
                      opacity: 1 // Fully visible, just off-screen
                    }}
                    whileHover={{
                      scale: 1.05, // Slightly larger on hover
                      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                    }}
                    onClick={() => handleCardClick(i)}
                  >
                    {/* Shadow */}
                    <img src={SHADOW_SVG} className="card-shadow" alt="" />
                    
                    {/* Card Back */}
                    <img src={CARD_BACK_SVG} className="card-back" alt="Card back" />
                  </motion.div>
                )
              })}
            </div>
            
            {/* Shuffle Button */}
            <button className="shuffle-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <span>SHUFFLE</span>
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Inspection Modal */}
      <AnimatePresence>
        {inspectingCard !== null && (
          <>
            {/* Dark Overlay */}
            <motion.div
              className="inspection-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
            />
            
            {/* Inspected Card */}
            <motion.div
              key={inspectingCard} // Force re-initialization when card changes
              className="inspected-card"
              initial={(() => {
                // Calculate position dynamically when component mounts
                const pos = getCardPosition(inspectingCard)
                return {
                  x: pos.x,
                  y: pos.y,
                  rotate: pos.rotate,
                  rotateY: 180, // Start mirrored (showing back of card)
                  scale: 1
                }
              })()}
              animate={{
                x: 'calc(50vw - 200px - 10%)', // Position on right side, over poker table (50vw - half card width - 10% offset)
                y: 0, // Already centered by CSS translate(-50%, -50%)
                rotate: 0,     // Straighten
                rotateY: 0,    // Flip to front (flip over on long edge)
                scale: 1.2,    // Scale up
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
              }}
              exit={(() => {
                // Calculate position dynamically when component unmounts
                const pos = getCardPosition(inspectingCard)
                return {
                  x: pos.x,
                  y: pos.y,
                  rotate: pos.rotate,
                  rotateY: 180, // Flip back to mirrored when closing
                  scale: 1,
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                }
              })()}
            >
              {/* X Button */}
              <button className="close-btn" onClick={handleDismiss}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              
              {/* Project Info */}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

export default PokerTable
