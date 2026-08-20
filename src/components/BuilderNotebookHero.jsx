import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion'
import './BuilderNotebookHero.css'

const ndsEase = [0.22, 1, 0.36, 1]
const curvePath = 'M95 316 C170 314 245 310 318 296 C392 281 448 244 482 180 C506 134 526 89 548 58'
const curveSupply = 800_000_000
const graduationTokens = 792_260_950
const priceNumerator = 19_029_514_756
const baseOctas = 61.9053276
const graduationRaisedApt = 1283.7
const defaultCurveProgress = 0.46

const curveSegments = [
  {
    p0: { x: 95, y: 316 },
    p1: { x: 170, y: 314 },
    p2: { x: 245, y: 310 },
    p3: { x: 318, y: 296 }
  },
  {
    p0: { x: 318, y: 296 },
    p1: { x: 392, y: 281 },
    p2: { x: 448, y: 244 },
    p3: { x: 482, y: 180 }
  },
  {
    p0: { x: 482, y: 180 },
    p1: { x: 506, y: 134 },
    p2: { x: 526, y: 89 },
    p3: { x: 548, y: 58 }
  }
]

const spineStages = [
  {
    id: 'thesis',
    number: '01',
    label: 'Thesis',
    progress: 0.06,
    target: '#approach',
    signal: 'the customer problem',
    output: 'a sharper thesis',
    nextLabel: 'Approach'
  },
  {
    id: 'workbench',
    number: '02',
    label: 'Workbench',
    progress: 0.24,
    target: '#builds',
    signal: 'the fastest useful test',
    output: 'a working surface',
    nextLabel: 'Build Journey'
  },
  {
    id: 'projects',
    number: '03',
    label: 'Projects',
    progress: 0.46,
    target: '/projects',
    signal: 'proof over polish',
    output: 'working prototypes',
    nextLabel: 'Products & Systems'
  },
  {
    id: 'market',
    number: '04',
    label: 'Market',
    progress: 0.64,
    target: '/client-work',
    signal: 'the market has to respond',
    output: 'brand, web, and acquisition',
    nextLabel: 'Client Work'
  },
  {
    id: 'voice',
    number: '05',
    label: 'Voice',
    progress: 0.81,
    target: '/writing',
    signal: 'the pattern worth naming',
    output: 'field notes and briefings',
    nextLabel: 'Writing'
  },
  {
    id: 'contact',
    number: '06',
    label: 'Contact',
    progress: 0.96,
    target: '/contact',
    signal: 'the next real problem',
    output: 'a useful conversation',
    nextLabel: 'Contact'
  }
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
    text: 'price_numerator = 19_029_514_756u128',
    className: 'notebook-note--move'
  }
]

function cubicPoint({ p0, p1, p2, p3 }, t) {
  const inverse = 1 - t
  const inverse2 = inverse * inverse
  const t2 = t * t

  return {
    x: inverse2 * inverse * p0.x + 3 * inverse2 * t * p1.x + 3 * inverse * t2 * p2.x + t2 * t * p3.x,
    y: inverse2 * inverse * p0.y + 3 * inverse2 * t * p1.y + 3 * inverse * t2 * p2.y + t2 * t * p3.y
  }
}

function buildCurveSamples() {
  const samples = []

  curveSegments.forEach((segment, segmentIndex) => {
    for (let index = 0; index <= 72; index += 1) {
      if (segmentIndex > 0 && index === 0) continue
      samples.push(cubicPoint(segment, index / 72))
    }
  })

  let distance = 0
  const measured = samples.map((point, index) => {
    if (index > 0) {
      const previous = samples[index - 1]
      distance += Math.hypot(point.x - previous.x, point.y - previous.y)
    }

    return { ...point, distance }
  })

  const totalDistance = measured[measured.length - 1].distance
  return measured.map((point) => ({
    ...point,
    progress: point.distance / totalDistance
  }))
}

const curveSamples = buildCurveSamples()
const graduationIntegral =
  priceNumerator * Math.log(curveSupply / (curveSupply - graduationTokens)) +
  baseOctas * graduationTokens
const startPriceApt = (priceNumerator / curveSupply + baseOctas) / 1e8

function nearestCurveSample(x, y) {
  return curveSamples.reduce((closest, sample) => {
    const distance = Math.hypot(sample.x - x, sample.y - y)
    return distance < closest.distance ? { sample, distance } : closest
  }, { sample: curveSamples[0], distance: Number.POSITIVE_INFINITY }).sample
}

function curvePointAt(progress) {
  return curveSamples.reduce((closest, sample) => {
    const distance = Math.abs(sample.progress - progress)
    return distance < closest.distance ? { sample, distance } : closest
  }, { sample: curveSamples[0], distance: Number.POSITIVE_INFINITY }).sample
}

function curveStatsAt(progress) {
  const tokensSold = graduationTokens * progress
  const priceApt = (priceNumerator / (curveSupply - tokensSold) + baseOctas) / 1e8
  const raisedIntegral =
    priceNumerator * Math.log(curveSupply / (curveSupply - tokensSold)) +
    baseOctas * tokensSold
  const raisedApt = (raisedIntegral / graduationIntegral) * graduationRaisedApt

  return {
    tokensSold,
    priceApt,
    raisedApt,
    multiple: priceApt / startPriceApt
  }
}

function nearestSpineStage(progress) {
  return spineStages.reduce((closest, stage) => {
    const distance = Math.abs(stage.progress - progress)
    return distance < closest.distance ? { stage, distance } : closest
  }, { stage: spineStages[0], distance: Number.POSITIVE_INFINITY }).stage
}

function formatTokens(tokens) {
  return `${(tokens / 1_000_000).toLocaleString('en-US', {
    maximumFractionDigits: tokens >= 100_000_000 ? 0 : 1
  })}M`
}

function formatApt(value) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value >= 100 ? 1 : 2
  })
}

function formatPrice(value) {
  return value.toFixed(8)
}

function BuilderNotebookHero() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [curveProgress, setCurveProgress] = useState(defaultCurveProgress)
  const [isCurveActive, setIsCurveActive] = useState(false)
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
  const curvePoint = useMemo(() => curvePointAt(curveProgress), [curveProgress])
  const curveStats = useMemo(() => curveStatsAt(curveProgress), [curveProgress])
  const activeStage = useMemo(() => nearestSpineStage(curveProgress), [curveProgress])
  const stagePoints = useMemo(() => (
    spineStages.map((stage) => ({
      ...stage,
      point: curvePointAt(stage.progress)
    }))
  ), [])

  const handlePointerMove = (event) => {
    if (reduceMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  const handleCurveMove = (event) => {
    const svg = event.currentTarget.ownerSVGElement || event.currentTarget
    if (!svg) return

    const bounds = svg.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 620
    const y = ((event.clientY - bounds.top) / bounds.height) * 420
    const sample = nearestCurveSample(x, y)

    setCurveProgress(sample.progress)
    setIsCurveActive(true)
  }

  const openStage = (stage) => {
    if (stage.target.startsWith('#')) {
      document.querySelector(stage.target)?.scrollIntoView({ block: 'start' })
      return
    }

    navigate(stage.target)
  }

  const activateStage = (stage, shouldOpen = false) => {
    setCurveProgress(stage.progress)
    setIsCurveActive(true)

    if (shouldOpen) {
      openStage(stage)
    }
  }

  const handleStageKeyDown = (event, stage) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    activateStage(stage, true)
  }

  const settlePointer = () => {
    pointerX.set(0)
    pointerY.set(0)
    setIsCurveActive(false)
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
            Product-minded marketer &middot; builder &middot; operator
          </p>
          <h1 className="notebook-hero__name">Gunnar Neuman</h1>
          <p className="notebook-hero__line">I build the path from idea to launch.</p>
          <p className="notebook-hero__dek">
            I use customer insight, product strategy, and modern development tools to
            turn rough opportunities into products, campaigns, and growth systems.
          </p>

          <div className="notebook-hero__spine-nav" aria-label="Explore the site by builder stage">
            {spineStages.map((stage) => (
              <button
                className={`notebook-hero__spine-button ${activeStage.id === stage.id ? 'is-active' : ''}`}
                key={stage.id}
                type="button"
                onClick={() => activateStage(stage, true)}
                onPointerEnter={() => activateStage(stage)}
                onFocus={() => activateStage(stage)}
              >
                <span>{stage.number}</span>
                {stage.label}
              </button>
            ))}
          </div>

          <div className="notebook-hero__actions">
            <button
              className="btn btn-primary btn-magnetic notebook-hero__stage-action"
              type="button"
              onClick={() => openStage(activeStage)}
            >
              Open {activeStage.nextLabel}
              <span className="btn-arrow">&rarr;</span>
            </button>
            <Link to="/contact" className="btn notebook-hero__secondary-action">
              Get in Touch
            </Link>
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
              onPointerEnter={handleCurveMove}
              onPointerMove={handleCurveMove}
            >
              <defs>
                <filter id="notebook-chalk-rough" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="2"
                    seed="11"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="1.15"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>
              <rect
                className="notebook-hero__curve-scrub-zone"
                x="52"
                y="44"
                width="528"
                height="340"
              />
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
                d={curvePath}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ ...pathTransition, duration: 1.7, delay: 0.72 }}
              />
              <motion.g
                className="notebook-hero__tracker"
                animate={{ opacity: isCurveActive ? 1 : 0.52 }}
                transition={{ duration: isCurveActive ? 0.18 : 0.28 }}
              >
                <line
                  className="notebook-hero__tracker-line"
                  x1="84"
                  y1={curvePoint.y}
                  x2={curvePoint.x}
                  y2={curvePoint.y}
                />
                <line
                  className="notebook-hero__tracker-line"
                  x1={curvePoint.x}
                  y1={curvePoint.y}
                  x2={curvePoint.x}
                  y2="339"
                />
                <circle
                  className="notebook-hero__tracker-glow"
                  cx={curvePoint.x}
                  cy={curvePoint.y}
                  r="18"
                />
                <circle
                  className="notebook-hero__tracker-dot"
                  cx={curvePoint.x}
                  cy={curvePoint.y}
                  r="7"
                />
              </motion.g>
              {stagePoints.map((stage) => (
                <g
                  className={`notebook-hero__spine-marker ${activeStage.id === stage.id ? 'is-active' : ''}`}
                  key={stage.id}
                  role="link"
                  tabIndex="0"
                  aria-label={`Open ${stage.nextLabel}`}
                  transform={`translate(${stage.point.x} ${stage.point.y})`}
                  onClick={() => activateStage(stage, true)}
                  onPointerEnter={() => activateStage(stage)}
                  onFocus={() => activateStage(stage)}
                  onKeyDown={(event) => handleStageKeyDown(event, stage)}
                >
                  <circle className="notebook-hero__spine-marker-halo" r="17" />
                  <circle className="notebook-hero__spine-marker-dot" r="8" />
                  <text x="0" y="-24">{stage.number}</text>
                </g>
              ))}
              <motion.g
                className="notebook-hero__board-data"
                initial={{ opacity: 0, rotate: -2 }}
                animate={{ opacity: 1, rotate: -2 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : 1.25, ease: ndsEase }}
              >
                <text x="146" y="154">
                  <tspan>{activeStage.number} / {activeStage.label}</tspan>
                  <tspan x="142" dy="24">signal: {activeStage.signal}</tspan>
                  <tspan x="156" dy="24">output: {activeStage.output}</tspan>
                  <tspan x="148" dy="24">sold ~= {formatTokens(curveStats.tokensSold)} tokens</tspan>
                  <tspan x="162" dy="24">raised ~= {formatApt(curveStats.raisedApt)} APT</tspan>
                </text>
                <path d="M141 188 C209 173 276 181 351 169" />
                <path d="M145 258 C224 273 297 264 368 274" />
              </motion.g>
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
              <path
                className="notebook-hero__curve-hitbox"
                d={curvePath}
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
              <text x="420" y="398">tokens sold</text>
              <text x="457" y="50">graduation</text>
            </svg>

            {notes.map((note, index) => (
              <motion.p
                className={`notebook-note ${note.className}`}
                data-text={note.text}
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
