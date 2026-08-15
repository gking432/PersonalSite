import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  identity,
  approachPrinciples,
  resumeTimeline,
  cta
} from '../data/homeContent'
import SqueezeSection from '../components/SqueezeSection'
import './HomeStudio.css'

const ease = [0.22, 1, 0.36, 1]

// The three phases of the work, in the order they happen. This replaced a
// numeric stat strip ("4 functional builds") that invited the wrong question.
const capabilityPhases = [
  {
    title: 'Find the workflow',
    detail: 'Discovery, process mapping, and the people actually doing the job'
  },
  {
    title: 'Decide what AI should touch',
    detail: 'And what stays deterministic, and what stays human'
  },
  {
    title: 'Build it and get it used',
    detail: 'Working systems, narrow pilots, training, adoption'
  }
]

// The rubric, stated as criteria rather than principles so a reader can apply
// it to their own workflow while scanning. Previews the CRM decision table.
const decisionRubric = [
  {
    when: 'Use AI when',
    detail: 'the input is unstructured, interpretation matters, or several different outputs would all be reasonable.'
  },
  {
    when: 'Use ordinary software when',
    detail: 'the rules are already known, the output has to be exact, or permissions, transactions, and records are involved.'
  },
  {
    when: 'Keep a person in it when',
    detail: "the consequences are significant, confidence is low, or the context can't be reliably verified."
  }
]

const featuredSystems = [
  {
    number: '01',
    type: 'Business workflow system',
    title: 'Home-Services AI CRM',
    description: 'A functional command center connecting lead analysis, call summaries, follow-up, quotes, appointments, reviews, and human approval.',
    image: '/images/project-northstar.png',
    imageAlt: 'Home-services CRM dashboard with lead pipeline, tasks, AI insights, and business metrics',
    caseStudy: '/projects/home-services-crm',
    caseStudyAction: 'Read the case study',
    href: 'https://new-teal-delta.vercel.app/app',
    action: 'Open the live demo',
    tags: ['AI workflows', 'Operational system', 'Human approval']
  },
  {
    number: '02',
    type: 'Live AI product',
    title: 'PrepMe',
    description: 'A résumé and target job description become a tailored AI interview, structured practice experience, and actionable feedback.',
    image: '/images/project-prepme.png',
    imageAlt: 'PrepMe interview platform dashboard and setup workflow',
    href: 'https://prep-me-wheat.vercel.app/',
    action: 'Try PrepMe',
    tags: ['Personalized AI', 'Product workflow', 'Live platform']
  }
]

const fallbackLand = [
  [[[-168, 72], [-140, 70], [-120, 58], [-103, 52], [-96, 42], [-82, 31], [-82, 24], [-98, 18], [-116, 23], [-128, 42], [-151, 58], [-168, 72]]],
  [[[-82, 12], [-68, 8], [-52, -6], [-40, -24], [-54, -55], [-72, -52], [-80, -22], [-82, 12]]],
  [[[-18, 35], [5, 37], [30, 31], [44, 12], [37, -35], [15, -35], [-5, -10], [-18, 35]]],
  [[[-10, 58], [22, 70], [52, 58], [100, 62], [144, 48], [132, 24], [78, 8], [45, 26], [12, 45], [-10, 58]]],
  [[[112, -10], [154, -23], [146, -43], [116, -35], [112, -10]]],
  [[[-45, 82], [-20, 74], [-35, 60], [-55, 64], [-45, 82]]]
]

const cityLights = [
  [40.71, -74.01, 1], [34.05, -118.24, 0.95], [41.88, -87.63, 0.82],
  [29.76, -95.37, 0.7], [33.75, -84.39, 0.68], [25.76, -80.19, 0.66],
  [19.43, -99.13, 0.95], [-23.55, -46.63, 0.92], [-34.6, -58.38, 0.82],
  [51.51, -0.13, 0.95], [48.86, 2.35, 0.9], [52.52, 13.4, 0.78],
  [40.42, -3.7, 0.74], [41.9, 12.5, 0.72], [55.76, 37.62, 0.82],
  [30.04, 31.24, 0.86], [6.52, 3.38, 0.78], [-26.2, 28.05, 0.7],
  [25.2, 55.27, 0.8], [24.71, 46.68, 0.64], [28.61, 77.21, 1],
  [19.08, 72.88, 0.95], [13.08, 80.27, 0.82], [23.81, 90.41, 0.9],
  [13.76, 100.5, 0.82], [1.35, 103.82, 0.85], [-6.21, 106.85, 0.88],
  [14.6, 120.98, 0.86], [22.32, 114.17, 0.88], [31.23, 121.47, 1],
  [39.9, 116.41, 0.94], [35.68, 139.69, 1], [37.57, 126.98, 0.94],
  [-33.87, 151.21, 0.78], [-37.81, 144.96, 0.68]
]

const cloudBands = [
  { lat: 52, lon: -145, width: 44, height: 9, speed: 0.55 },
  { lat: 34, lon: -55, width: 36, height: 8, speed: 0.72 },
  { lat: 11, lon: 28, width: 54, height: 7, speed: 1 },
  { lat: -18, lon: 92, width: 42, height: 9, speed: 0.82 },
  { lat: -42, lon: -12, width: 48, height: 8, speed: 0.48 },
  { lat: 68, lon: 70, width: 32, height: 7, speed: 0.38 }
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const radians = (value) => (value * Math.PI) / 180
const normalizeLongitude = (lon) => ((((lon + 180) % 360) + 360) % 360) - 180
const smoothstep = (edge0, edge1, value) => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return x * x * (3 - 2 * x)
}
const formatUtc = (date) => `${date.toISOString().slice(11, 19)} UTC`

const getSubsolarPoint = (date) => {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const day = (date.getTime() - start) / 86400000
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  return {
    lat: 23.44 * Math.sin(radians((360 / 365) * (day - 81))),
    lon: normalizeLongitude((12 - hour) * 15)
  }
}

const decodeWorld = (topology) => {
  const { scale, translate } = topology.transform
  const arcs = topology.arcs.map((arc) => {
    let x = 0
    let y = 0
    return arc.map(([dx, dy]) => {
      x += dx
      y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
  })
  const readArc = (index) => {
    const arc = arcs[index < 0 ? ~index : index]
    return index < 0 ? [...arc].reverse() : arc
  }
  const readRing = (ring) => ring.flatMap((index, i) => {
    const arc = readArc(index)
    return i === 0 ? arc : arc.slice(1)
  })
  return topology.objects.countries.geometries.flatMap((geometry) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.arcs] : geometry.arcs
    return polygons.map((polygon) => polygon.map(readRing))
  })
}

// Live Earth: country outlines, UTC sunlight, city lights and drifting clouds.
function Globe() {
  const canvasRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })
  const landRef = useRef(fallbackLand)
  const [utcTime, setUtcTime] = useState(() => formatUtc(new Date()))

  useEffect(() => {
    const tick = () => setUtcTime(formatUtc(new Date()))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const shadeCanvas = document.createElement('canvas')
    const shadeCtx = shadeCanvas.getContext('2d')
    let raf, w, h, R, cx, cy

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = Math.min(w, h) * 0.4
      cx = w / 2; cy = h / 2
    }
    resize(); window.addEventListener('resize', resize)

    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((response) => response.json())
      .then((topology) => { landRef.current = decodeWorld(topology) })
      .catch(() => {})

    const project = (lat, lon, centerLat, centerLng) => {
      const la = radians(lat)
      const dlon = radians(normalizeLongitude(lon - centerLng))
      const center = radians(centerLat)
      const cosLa = Math.cos(la)
      const x = cosLa * Math.sin(dlon)
      const y = Math.cos(center) * Math.sin(la) - Math.sin(center) * cosLa * Math.cos(dlon)
      const z = Math.sin(center) * Math.sin(la) + Math.cos(center) * cosLa * Math.cos(dlon)
      return { x, y, z, sx: cx + x * R, sy: cy - y * R }
    }

    const clipSphere = () => {
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
    }

    const drawLand = (centerLat, centerLng) => {
      ctx.save()
      clipSphere()
      landRef.current.forEach((polygon) => {
        polygon.forEach((ring) => {
          ctx.beginPath()
          let started = false
          ring.forEach(([lon, lat]) => {
            const p = project(lat, lon, centerLat, centerLng)
            if (p.z < -0.02) {
              started = false
              return
            }
            if (!started) {
              ctx.moveTo(p.sx, p.sy)
              started = true
            } else {
              ctx.lineTo(p.sx, p.sy)
            }
          })
          ctx.closePath()
          ctx.fillStyle = 'rgba(31, 78, 57, 0.95)'
          ctx.fill()
        })
      })
      ctx.restore()
    }

    const drawNight = (sunCam) => {
      const size = 220
      shadeCanvas.width = size
      shadeCanvas.height = size
      const image = shadeCtx.createImageData(size, size)
      const data = image.data
      const half = size / 2
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const nx = (x + 0.5 - half) / half
          const ny = -(y + 0.5 - half) / half
          const rr = nx * nx + ny * ny
          const offset = (y * size + x) * 4
          if (rr > 1) continue
          const nz = Math.sqrt(1 - rr)
          const light = nx * sunCam.x + ny * sunCam.y + nz * sunCam.z
          const night = smoothstep(0.12, -0.08, light)
          const edge = smoothstep(1, 0.74, rr)
          data[offset] = 4
          data[offset + 1] = 12
          data[offset + 2] = 20
          data[offset + 3] = Math.round(176 * night * edge)
        }
      }
      shadeCtx.putImageData(image, 0, 0)
      ctx.save()
      clipSphere()
      ctx.drawImage(shadeCanvas, cx - R, cy - R, R * 2, R * 2)
      ctx.restore()
    }

    const drawLights = (centerLat, centerLng, sun) => {
      cityLights.forEach(([lat, lon, strength]) => {
        const p = project(lat, lon, centerLat, centerLng)
        if (p.z < 0) return
        const sunHit = Math.sin(radians(lat)) * Math.sin(radians(sun.lat)) +
          Math.cos(radians(lat)) * Math.cos(radians(sun.lat)) * Math.cos(radians(lon - sun.lon))
        const night = smoothstep(0.05, -0.2, sunHit)
        if (night <= 0.05) return
        const alpha = night * (0.35 + p.z * 0.65) * strength
        ctx.fillStyle = `rgba(194, 151, 76, ${alpha * 0.92})`
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, 1.15 + strength * 1.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(212, 179, 107, ${alpha * 0.18})`
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, 5 + strength * 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawClouds = (centerLat, centerLng, elapsed) => {
      ctx.save()
      clipSphere()
      cloudBands.forEach((cloud, index) => {
        const lon = normalizeLongitude(cloud.lon + elapsed * cloud.speed)
        for (let i = 0; i < 12; i++) {
          const progress = i / 11
          const pointLon = normalizeLongitude(lon + (progress - 0.5) * cloud.width)
          const pointLat = cloud.lat + Math.sin((progress + index) * Math.PI * 2) * cloud.height * 0.35
          const p = project(pointLat, pointLon, centerLat, centerLng)
          if (p.z < 0.03) continue
          ctx.fillStyle = `rgba(252, 250, 244, ${0.11 + p.z * 0.1})`
          ctx.beginPath()
          ctx.ellipse(p.sx, p.sy, R * 0.035, R * 0.012, radians(pointLon), 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.restore()
    }

    let t = 0
    const draw = () => {
      if (!reduce) t += 0.012
      const sun = getSubsolarPoint(new Date())
      const centerLng = normalizeLongitude(-98 + t * 1.15 + pointer.current.x * 18)
      const centerLat = clamp(37 - pointer.current.y * 12, -24, 42)
      const sunCam = project(sun.lat, sun.lon, centerLat, centerLng)
      ctx.clearRect(0, 0, w, h)

      const ocean = ctx.createRadialGradient(cx - R * 0.36, cy - R * 0.42, R * 0.12, cx, cy, R)
      ocean.addColorStop(0, '#386f75')
      ocean.addColorStop(0.34, '#16475c')
      ocean.addColorStop(0.78, '#092d43')
      ocean.addColorStop(1, '#061a2a')
      ctx.fillStyle = ocean
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()

      drawLand(centerLat, centerLng)
      drawClouds(centerLat, centerLng, t)
      drawNight(sunCam)
      drawLights(centerLat, centerLng, sun)

      const rim = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.04)
      rim.addColorStop(0, 'rgba(255,255,255,0)')
      rim.addColorStop(0.72, 'rgba(255,255,255,0)')
      rim.addColorStop(1, 'rgba(232, 222, 194, 0.32)')
      ctx.fillStyle = rim
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(232, 222, 194, 0.38)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      pointer.current.x = (e.clientX - r.left) / r.width - 0.5
      pointer.current.y = (e.clientY - r.top) / r.height - 0.5
    }
    canvas.addEventListener('pointermove', onMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas.removeEventListener('pointermove', onMove) }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="studio-globe" aria-label="Live Earth view with real-time daylight and city lights" />
      <span className="studio-hero__globe-cap">{utcTime}</span>
    </>
  )
}

function HomeStudio() {
  return (
    <div className="studio">
      <header className="studio-topbar">
        <div className="studio-topbar__inner">
          <Link to="/" className="studio-mark">Gunnar&nbsp;Neuman</Link>
          <nav className="studio-nav">
            <Link to="/about">About</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/client-work">Client Work</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="studio-hero" data-assistant-section="home-overview">
        <div className="studio-hero__copy">
          <motion.span className="studio-status"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}>
            <i /> Open to AI implementation, adoption, and product roles
          </motion.span>

          <motion.h1 className="studio-headline"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}>
            <span className="studio-headline__wide">
              <span>I turn business problems</span>
              <span>into working systems.</span>
            </span>
            <span className="studio-headline__narrow">
              <span>I turn business</span>
              <span>problems into</span>
              <span>working systems.</span>
            </span>
          </motion.h1>

          <motion.p className="studio-sub"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}>
            Five years in sales operations, product launches, and client delivery
            taught me how the work actually gets done. Now I build the systems around
            it &mdash; deciding where AI genuinely helps, where plain software is
            better, and where a person needs to stay in control.
          </motion.p>

          <motion.div className="studio-hero__actions"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}>
            <Link to="/projects" className="studio-btn studio-btn--primary">View the work</Link>
            <a href="/Gunnar-Neuman-Resume.pdf" className="studio-btn studio-btn--ghost" target="_blank" rel="noreferrer">Resume</a>
            <Link to="/contact" className="studio-btn studio-btn--ghost">Get in touch &rarr;</Link>
          </motion.div>
        </div>

        <motion.div className="studio-hero__globe"
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.3 }}>
          <Globe />
        </motion.div>
      </section>

      {/* ─── WHY THE TRANSITION ─── */}
      {/* The question every recruiter has, answered before they have to dig for
          it. The long version still lives on the About page. */}
      <section className="studio-pivot">
        <motion.p
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          I spent five years close to customers, sales teams, and client delivery.
          When AI made building cheap, I learned to build &mdash; not to become an
          engineer, but so I could take an idea past the slide and find out whether
          it actually improves the work.
        </motion.p>
      </section>

      {/* ─── WHAT THE WORK IS ─── */}
      <section className="studio-proof studio-proof--phases">
        {capabilityPhases.map((phase) => (
          <div className="studio-proof__item" key={phase.title}>
            <span className="studio-proof__value">{phase.title}</span>
            <span className="studio-proof__label">{phase.detail}</span>
          </div>
        ))}
      </section>

      {/* ─── APPROACH (tinted squeeze panel) ─── */}
      <section className="studio-band studio-approach" data-assistant-section="home-approach">
        <SqueezeSection className="studio-panel studio-panel--tint">
          <div className="studio-panel__inner">
            <div className="studio-section__head">
              <span className="studio-kicker">Approach</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                I understand the business problem, shape the workflow, and build enough of the solution to prove it.
              </motion.h2>
            </div>
            <div className="studio-approach__grid">
              {approachPrinciples.map((item, i) => (
                <motion.div className="studio-card" key={item.number}
                  initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: i * 0.1 }}>
                  <span className="studio-card__num">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </SqueezeSection>
      </section>

      {/* ─── DECISION RUBRIC ─── */}
      {/* Criteria, not principles: a reader can hold these against a workflow in
          their own company while scanning. */}
      <section className="studio-section studio-rubric" data-assistant-section="home-rubric">
        <div className="studio-section__head">
          <span className="studio-kicker">Judgment</span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
            How I decide what a system should do.
          </motion.h2>
        </div>
        <div className="studio-rubric__grid">
          {decisionRubric.map((rule, i) => (
            <motion.div className="studio-rubric__rule" key={rule.when}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: i * 0.1 }}>
              <h3>{rule.when}</h3>
              <p>{rule.detail}</p>
            </motion.div>
          ))}
        </div>
        <motion.p className="studio-rubric__close"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: 0.3 }}>
          And then the part that decides whether any of it mattered:{' '}
          <strong>a system nobody adopts didn&rsquo;t work.</strong> The hardest
          problem is usually not the build &mdash; it&rsquo;s the person who already
          has a working spreadsheet and no reason to trust your new thing.
        </motion.p>
      </section>

      {/* ─── WORKING PROOF (calm bridge between the two system panels) ─── */}
      <section className="studio-work" data-assistant-section="home-projects">
        <div className="studio-work__head">
          <div>
            <span className="studio-kicker">Working proof</span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
              The systems are there to use, not just read about.
            </motion.h2>
          </div>
          <p>These are self-directed builds, presented honestly. They show how I turn an AI capability into a complete workflow with an interface, decisions, and a useful outcome.</p>
        </div>

        <div className="studio-work__grid">
          {featuredSystems.map((project, index) => (
            <motion.article className="studio-system" key={project.title}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.75, ease, delay: index * 0.1 }}>
              {project.caseStudy ? (
                <Link className="studio-system__visual" to={project.caseStudy} aria-label={project.caseStudyAction}>
                  <img src={project.image} alt={project.imageAlt} loading="lazy" />
                  <span>{project.number}</span>
                </Link>
              ) : (
                <a className="studio-system__visual" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.action} in a new tab`}>
                  <img src={project.image} alt={project.imageAlt} loading="lazy" />
                  <span>{project.number}</span>
                </a>
              )}
              <div className="studio-system__copy">
                <span className="studio-system__type">{project.type}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="studio-tags">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="studio-system__actions">
                  {project.caseStudy && (
                    <Link className="studio-system__link" to={project.caseStudy}>{project.caseStudyAction} <span>→</span></Link>
                  )}
                  <a className={`studio-system__link${project.caseStudy ? ' studio-system__link--muted' : ''}`} href={project.href} target="_blank" rel="noreferrer">{project.action} <span>↗</span></a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <Link className="studio-work__all" to="/projects">See all projects <span>→</span></Link>
      </section>

      {/* ─── EXPERIENCE (tinted squeeze panel) ─── */}
      <section className="studio-band" data-assistant-section="home-experience">
        <SqueezeSection className="studio-panel studio-panel--tint">
          <div className="studio-panel__inner">
            <div className="studio-section__head">
              <span className="studio-kicker">Experience</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                Business experience first. Technical capability added on top.
              </motion.h2>
            </div>
            <div className="studio-exp__list">
              {resumeTimeline.map((item) => (
                <motion.article className="studio-exp" key={item.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease }}>
                  <div className="studio-exp__meta">
                    <span className="studio-exp__year">{item.year}</span>
                    <span className="studio-exp__loc">{item.location}</span>
                  </div>
                  <div className="studio-exp__body">
                    <h3>{item.title}</h3>
                    <span className="studio-exp__role">{item.role}</span>
                    <p>{item.desc}</p>
                    <div className="studio-tags">
                      {item.tags.map((tg) => <span key={tg}>{tg}</span>)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </SqueezeSection>
      </section>

      {/* ─── CTA (plain, parchment; the page resolves calm) ─── */}
      <section className="studio-section studio-cta">
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          {cta.heading}
        </motion.h2>
        <p>{cta.body}</p>
        <Link to="/contact" className="studio-btn studio-btn--lg studio-btn--primary">Get in touch &rarr;</Link>
      </section>

      <footer className="studio-footer">
        <div className="studio-footer__inner">
          <span>© {new Date().getFullYear()} Gunnar Neuman</span>
          <div className="studio-footer__links">
            <a href="mailto:gunnarneuman14@gmail.com">Email</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeStudio
