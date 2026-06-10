import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { journeyStops } from './journeyData'
import './JourneyMap.css'

// Fixed continental-US projection so map + pins always align.
const W = 900, H = 560
const LON0 = -125, LON1 = -66.5, LAT0 = 24.5, LAT1 = 49.5
const projX = (lon) => ((lon - LON0) / (LON1 - LON0)) * W
const projY = (lat) => ((LAT1 - lat) / (LAT1 - LAT0)) * H
const inBox = (lon, lat) => lon >= LON0 - 3 && lon <= LON1 + 3 && lat >= LAT0 - 3 && lat <= LAT1 + 3

export default function JourneyMap() {
  const [paths, setPaths] = useState([])
  const [active, setActive] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('/us-states.json')
      .then(r => r.json())
      .then(geo => {
        if (cancelled) return
        const d = []
        for (const f of geo.features) {
          const g = f.geometry
          const polys = g.type === 'Polygon' ? [g.coordinates]
            : g.type === 'MultiPolygon' ? g.coordinates : []
          for (const poly of polys) {
            for (const ring of poly) {
              // Skip rings outside the continental box (Alaska / Hawaii).
              if (!ring.some(([lon, lat]) => inBox(lon, lat))) continue
              let s = ''
              ring.forEach(([lon, lat], i) => {
                s += (i === 0 ? 'M' : 'L') + projX(lon).toFixed(1) + ' ' + projY(lat).toFixed(1)
              })
              d.push(s + 'Z')
            }
          }
        }
        setPaths(d)
      })
      .catch(() => setPaths([]))
    return () => { cancelled = true }
  }, [])

  const pts = journeyStops.map(s => ({ x: projX(s.lng), y: projY(s.lat) }))
  const route = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ')
  const stop = active != null ? journeyStops[active] : null

  return (
    <div className="jm" ref={ref}>
      <div className="jm__stage">
        <svg className="jm__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map of places I've lived">
          <g className="jm__states">
            {paths.map((d, i) => <path key={i} d={d} />)}
          </g>
          <path className="jm__route" d={route} />
          {journeyStops.map((s, i) => {
            const p = pts[i]
            const on = i === active
            return (
              <motion.g
                key={s.city}
                className={`jm__pin ${on ? 'is-active' : ''}`}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.25 + i * 0.13, type: 'spring', stiffness: 420, damping: 16 }}
                onClick={() => setActive(i)}
                style={{ cursor: 'pointer', transformOrigin: `${p.x}px ${p.y}px` }}
              >
                {on && <circle cx={p.x} cy={p.y} r="18" className="jm__pin-halo" />}
                <circle cx={p.x} cy={p.y} r={on ? 7 : 5.5} className="jm__pin-dot" />
                <text x={p.x} y={p.y - 14} className="jm__pin-label">{s.city}</text>
              </motion.g>
            )
          })}
        </svg>
      </div>

      <div className="jm__panel">
        <AnimatePresence mode="wait">
          {stop ? (
            <motion.div
              key={active}
              className="jm__card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="jm__card-index">{String(active + 1).padStart(2, '0')} / {String(journeyStops.length).padStart(2, '0')}</span>
              <span className="jm__card-chapter">{stop.chapter}</span>
              <h3 className="jm__card-city">{stop.city}</h3>
              <p className="jm__card-story">{stop.story}</p>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              className="jm__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Tap a pin to follow the path.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
