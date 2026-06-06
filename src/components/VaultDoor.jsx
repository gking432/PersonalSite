import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './VaultDoor.css'

const PROJECTS = [
  {
    number: '01',
    title: 'Aptos Token Launcher',
    tag: 'Blockchain · Product · Web3',
    desc: 'Built a user-friendly interface for creating and deploying tokens on the Aptos blockchain. Simplified a complex technical process into an accessible web application.',
    link: '/projects',
  },
  {
    number: '02',
    title: 'PrepMe',
    tag: 'Interview Practice · Feedback Systems · Product',
    desc: 'Interview practice platform concept. Runs realistic interview reps, provides structured feedback, and helps users improve through deliberate practice.',
    link: '/projects',
  },
  {
    number: '03',
    title: 'Client Portfolio',
    tag: 'Brand · Strategy · Launch',
    desc: 'Brand identities, eCommerce builds, and launch campaigns for early-stage companies. Full lifecycle - from market research to launch to iteration.',
    link: '/client-work',
  },
]

// 5-spoke wheel positions (pre-computed)
const SPOKES = [0, 72, 144, 216, 288].map(deg => {
  const rad = (deg * Math.PI) / 180
  return {
    x1: 100 + Math.cos(rad) * 22,
    y1: 100 + Math.sin(rad) * 22,
    x2: 100 + Math.cos(rad) * 76,
    y2: 100 + Math.sin(rad) * 76,
    gx: 100 + Math.cos(rad) * 85,
    gy: 100 + Math.sin(rad) * 85,
  }
})

function VaultDoor() {
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // ═══════════════════════════════════════════
  // SCROLL TIMELINE (over 600vh)
  //
  // 0.00–0.06  Section enters, door fades in
  // 0.06–0.18  Wheel rotates 720°
  // 0.14–0.20  Bolts retract
  // 0.22–0.48  Door swings outward (heavy, slow)
  // 0.44–0.54  Spotlight fades in
  // 0.48–0.58  Door layer fades out + frame expands
  // 0.52–0.85  Walk toward table (translateZ + rotateX)
  // 0.76–0.88  Project cards stagger in
  // 0.90–1.00  Section exits
  // ═══════════════════════════════════════════

  // ── DOOR ──
  const doorFadeIn = useTransform(scrollYProgress, [0.02, 0.06], [0, 1])
  const wheelAngle = useTransform(scrollYProgress, [0.06, 0.18], [0, 720])
  const boltX = useTransform(scrollYProgress, [0.14, 0.20], [0, -80])
  const doorAngle = useTransform(scrollYProgress, [0.22, 0.48], [0, -105])
  const doorLayerOp = useTransform(scrollYProgress, [0.46, 0.54], [1, 0])

  // ── ROOM ──
  const roomOp = useTransform(scrollYProgress, [0.36, 0.48], [0, 1])
  const spotOp = useTransform(scrollYProgress, [0.44, 0.56], [0, 1])

  // ── FRAME (expands as we walk through it) ──
  const frameScale = useTransform(scrollYProgress, [0.50, 0.64], [1, 3])
  const frameOp = useTransform(scrollYProgress, [0.50, 0.62], [1, 0])

  // ── WALK-IN (first-person approach) ──
  const walkZ = useTransform(scrollYProgress, [0.52, 0.85], [-700, 280])
  const walkRotX = useTransform(scrollYProgress, [0.52, 0.85], [8, 62])
  const walkY = useTransform(scrollYProgress, [0.52, 0.85], [120, -300])

  // ── CARD REVEALS (staggered) ──
  const c1Op = useTransform(scrollYProgress, [0.74, 0.80], [0, 1])
  const c2Op = useTransform(scrollYProgress, [0.77, 0.83], [0, 1])
  const c3Op = useTransform(scrollYProgress, [0.80, 0.86], [0, 1])
  const cardOps = [c1Op, c2Op, c3Op]

  const c1Y = useTransform(scrollYProgress, [0.74, 0.80], [40, 0])
  const c2Y = useTransform(scrollYProgress, [0.77, 0.83], [40, 0])
  const c3Y = useTransform(scrollYProgress, [0.80, 0.86], [40, 0])
  const cardYs = [c1Y, c2Y, c3Y]

  return (
    <section className="vault-section" ref={sectionRef}>
      <div className="vault-sticky">

        {/* ════════════ BLACK ROOM (z:0) ════════════ */}
        <motion.div className="vault-room" style={{ opacity: roomOp }}>
          <motion.div className="vault-spotlight" style={{ opacity: spotOp }} />
          <motion.div className="vault-spotlight-cone" style={{ opacity: spotOp }} />
        </motion.div>

        {/* ════════════ WALK-IN CAMERA (z:1) ════════════ */}
        <div className="vault-walk-perspective">
          <motion.div
            className="vault-walk-transform"
            style={{
              rotateX: walkRotX,
              z: walkZ,
              y: walkY,
            }}
          >
            {/* ── THE TABLE ── */}
            <div className="vault-table">
              <div className="vault-table-surface">
                <div className="vault-table-sheen" />
                <div className="vault-dossiers">
                  {PROJECTS.map((p, i) => (
                    <motion.div
                      key={i}
                      className="vault-dossier"
                      style={{ opacity: cardOps[i], y: cardYs[i] }}
                    >
                      <Link to={p.link} className="vault-dossier-link">
                        <div className="vault-dossier-header">
                          <span className="vault-dossier-number">{p.number}</span>
                          <span className="vault-dossier-arrow">&rarr;</span>
                        </div>
                        <span className="vault-dossier-tag">{p.tag}</span>
                        <h3 className="vault-dossier-title">{p.title}</h3>
                        <p className="vault-dossier-desc">{p.desc}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="vault-table-edge" />
            </div>
          </motion.div>
        </div>

        {/* ════════════ VAULT FRAME (z:2) ════════════ */}
        <motion.div
          className="vault-frame"
          style={{ scale: frameScale, opacity: frameOp }}
        />

        {/* ════════════ THE DOOR (z:3) ════════════ */}
        <motion.div className="vault-door-layer" style={{ opacity: doorLayerOp }}>
          <motion.div className="vault-door-fade" style={{ opacity: doorFadeIn }}>
            <div className="vault-door-perspective">
              <motion.div
                className="vault-door-body"
                style={{ rotateY: doorAngle }}
              >
                {/* ── FRONT FACE ── */}
                <div className="vault-door-front">
                  {/* Panel recesses */}
                  <div className="vault-panel vault-panel-left" />
                  <div className="vault-panel vault-panel-right" />

                  {/* Locking bolts (right side) */}
                  {[0.18, 0.36, 0.64, 0.82].map((pos, i) => (
                    <motion.div
                      key={i}
                      className="vault-bolt"
                      style={{ top: `${pos * 100}%`, x: boltX }}
                    >
                      <div className="vault-bolt-bar" />
                      <div className="vault-bolt-housing" />
                    </motion.div>
                  ))}

                  {/* Hinges (left side) */}
                  {[0.15, 0.5, 0.85].map((pos, i) => (
                    <div
                      key={i}
                      className="vault-hinge"
                      style={{ top: `${pos * 100}%` }}
                    >
                      <div className="vault-hinge-plate" />
                      <div className="vault-hinge-pin" />
                    </div>
                  ))}

                  {/* Spoked wheel handle */}
                  <motion.div
                    className="vault-wheel-wrap"
                    style={{ rotate: wheelAngle }}
                  >
                    <svg
                      viewBox="0 0 200 200"
                      className="vault-wheel-svg"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="vRing" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#c0bcb6" />
                          <stop offset="30%" stopColor="#9a9690" />
                          <stop offset="60%" stopColor="#88847e" />
                          <stop offset="100%" stopColor="#a09c96" />
                        </linearGradient>
                        <radialGradient id="vHub">
                          <stop offset="0%" stopColor="#b8b4ae" />
                          <stop offset="60%" stopColor="#98948e" />
                          <stop offset="100%" stopColor="#78746e" />
                        </radialGradient>
                        <radialGradient id="vGrip">
                          <stop offset="0%" stopColor="#d0ccc6" />
                          <stop offset="40%" stopColor="#a8a4a0" />
                          <stop offset="100%" stopColor="#78746e" />
                        </radialGradient>
                      </defs>

                      {/* Outer ring */}
                      <circle cx="100" cy="100" r="82" fill="none" stroke="url(#vRing)" strokeWidth="11" />
                      <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />

                      {/* Spokes + grip balls */}
                      {SPOKES.map((s, i) => (
                        <g key={i}>
                          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                            stroke="#8a8680" strokeWidth="5" strokeLinecap="round" />
                          <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                            stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                          <circle cx={s.gx} cy={s.gy} r="8" fill="url(#vGrip)" />
                        </g>
                      ))}

                      {/* Center hub */}
                      <circle cx="100" cy="100" r="20" fill="url(#vHub)" />
                      <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                      <circle cx="100" cy="100" r="8" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
                    </svg>
                  </motion.div>

                  {/* Nameplate */}
                  <div className="vault-nameplate">
                    <span className="vault-nameplate-text">SELECTED WORKS</span>
                    <div className="vault-nameplate-screw vault-screw-l" />
                    <div className="vault-nameplate-screw vault-screw-r" />
                  </div>
                </div>

                {/* ── DOOR EDGE (thickness — the money detail) ── */}
                <div className="vault-door-edge">
                  {[0.18, 0.36, 0.64, 0.82].map((pos, i) => (
                    <div
                      key={i}
                      className="vault-edge-channel"
                      style={{ top: `${pos * 100}%` }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}

export default VaultDoor
