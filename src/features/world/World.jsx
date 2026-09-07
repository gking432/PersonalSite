import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlaceContent, places } from '../../variants/Somewhere'
import './World.css'
import { locations } from './worldNavigation'

const names = Object.fromEntries(Object.entries(locations).map(([id, node]) => [id, node.label]))
const links = Object.fromEntries(Object.entries(locations).map(([id, node]) => [id, node.links]))
const rooms = Object.fromEntries(Object.entries(locations).filter(([, node]) => node.room).map(([id, node]) => [id, node.room]))

export default function World() {
  const host = useRef(null), engine = useRef(null), dialog = useRef(null)
  const [ready, setReady] = useState(false), [error, setError] = useState(''), [location, setLocation] = useState('road'), [moving, setMoving] = useState(false), [selected, setSelected] = useState(null), [mapOpen, setMapOpen] = useState(false), [night, setNight] = useState(false), [reduced, setReduced] = useState(false), [started, setStarted] = useState(false)
  useEffect(() => {
    let cancelled = false, instance
    import('./worldScene').then(({ createWorld }) => {
      if (cancelled) return
      try { instance = createWorld(host.current, { onReady: () => setReady(true), onLocation: setLocation, onTravel: value => { setMoving(value); if (value) setStarted(true) }, onOpen: id => setSelected(places.find(p => p.id === id)), onError: setError }); engine.current = instance; instance.setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }
      catch { setError('This browser could not start the 3D world. You can still explore all of my work below.') }
    }).catch(() => setError('The world could not load. Reload to try again, or open the portfolio below.'))
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => { setReduced(media.matches); engine.current?.setReduced(media.matches) }; update(); media.addEventListener('change', update)
    return () => { cancelled = true; instance?.dispose(); engine.current = null; media.removeEventListener('change', update) }
  }, [])
  useEffect(() => { engine.current?.setPaused(Boolean(selected)); if (selected && !dialog.current.open) dialog.current.showModal() }, [selected])
  const go = id => { setStarted(true); setMapOpen(false); engine.current?.go(id) }
  const close = () => { dialog.current?.close(); setSelected(null) }
  return (
    <div className="somewhere world3d">
      <a className="somewhere-skip" href="#world-travel">Skip to movement controls</a>
      <div ref={host} className="world-canvas" />
      <header className="world-header"><Link className="world-brand" to="/">✳ <span>Somewhere<small>BY GUNNAR NEUMAN</small></span></Link><nav aria-label="Portfolio"><Link to="/projects">Portfolio ↗</Link><Link to="/contact">Say hello ↗</Link></nav></header>
      <main className="world-interface">
        {!started && !error && <section className="world-welcome"><p>A LITTLE WAY OFF THE BEATEN PATH</p><h1>Welcome to<br /><em>Somewhere.</em></h1><p>A small world in the Midwest.<br />Take the road. See where it leads.</p><button disabled={!ready} onClick={() => go('gate')}>{ready ? 'Start walking →' : 'Bringing the world to life…'}</button><span>Drag to look · Click a glowing circle to walk</span></section>}
        {error && <section className="world-welcome" role="alert"><h1>A different<br />way in.</h1><p>{error}</p><Link to="/projects">Explore the portfolio ↗</Link><button onClick={() => window.location.reload()}>Reload world</button></section>}
        {started && !error && <><div className="world-location" aria-live="polite"><span>{moving ? 'ON YOUR WAY' : 'YOU ARE HERE'}</span><h1>{names[location]}</h1></div><div className="world-crosshair" aria-hidden="true">·</div></>}
        {started && rooms[location] && !moving && <button className="world-room-action" onClick={() => setSelected(places.find(p => p.id === rooms[location]))}>{location === 'workshop' ? 'Explore the working demos' : location === 'library' ? 'Open the case studies' : location === 'west' ? 'Meet Gunnar' : 'Leave a note'} ↗</button>}
      </main>
      <aside className={`world-map ${mapOpen ? 'is-open' : ''}`} aria-label="World map">
        <button className="world-map-toggle" aria-expanded={mapOpen} onClick={() => setMapOpen(!mapOpen)}>⌘ {mapOpen ? 'Close map' : 'Map & destinations'}</button>
        {mapOpen && <div className="world-map-content"><p>Every path is connected.</p>{['road', 'gate', 'square', 'west', 'library', 'workshop', 'chapelInside'].map(id => <button key={id} disabled={!ready || moving || location === id} aria-current={location === id ? 'location' : undefined} onClick={() => go(id)}><span>{location === id ? '●' : '○'}</span>{names[id]}</button>)}<small>Choose a destination to follow the paths there.</small></div>}
      </aside>
      <footer className="world-bottom">
        <div className="world-look"><button aria-label="Look left" disabled={!ready || moving} onClick={() => engine.current?.turn(Math.PI / 4)}>↶</button><span>DRAG TO LOOK</span><button aria-label="Look right" disabled={!ready || moving} onClick={() => engine.current?.turn(-Math.PI / 4)}>↷</button></div>
        <nav id="world-travel" className="world-travel" aria-label="Walk to nearby places" tabIndex={-1}>{links[location].map(id => <button key={id} disabled={!ready || moving || !!error} onClick={() => go(id)}>{moving ? 'Walking…' : names[id]} <span aria-hidden="true">↑</span></button>)}</nav>
        <div className="world-settings"><button aria-pressed={night} onClick={() => { setNight(!night); engine.current?.setNight(!night) }}> {night ? '☾ Evening' : '☼ Golden hour'}</button><button aria-pressed={reduced} onClick={() => { setReduced(!reduced); engine.current?.setReduced(!reduced) }}>{reduced ? 'Motion reduced' : 'Reduce motion'}</button></div>
      </footer>
      <dialog ref={dialog} className="somewhere-dialog" aria-labelledby="world-room-title" onCancel={close} onClose={() => setSelected(null)}>{selected && <><div className="somewhere-dialog-top"><span className="somewhere-eyebrow">SOMEWHERE / {names[location]}</span><button onClick={close} autoFocus aria-label="Close and return to the world">Return to the world ×</button></div><div className="somewhere-dialog-heading"><h2 id="world-room-title">{selected.name}</h2><p>{selected.description}</p></div><PlaceContent key={selected.id} place={selected} /></>}</dialog>
    </div>
  )
}
