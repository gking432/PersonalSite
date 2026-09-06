import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { approachPrinciples } from '../data/homeContent'
import './Somewhere.css'

const places = [
  { id: 'library', number: '01', name: 'The Library', label: 'Case studies', x: 23, y: 48, description: 'The thinking behind the things I build.' },
  { id: 'workshop', number: '02', name: 'The Workshop', label: 'Working demos', x: 73, y: 47, description: 'A few things you can actually try.' },
  { id: 'garden', number: '03', name: 'The Garden', label: 'A little about me', x: 17, y: 72, description: 'Rooted in the Midwest. Curious about what comes next.' },
  { id: 'post', number: '04', name: 'The Post Office', label: 'Get in touch', x: 84, y: 72, description: 'Good things often start with a conversation.' },
]
const projects = [
  { name: 'Home-Services AI CRM', type: 'Business workflow system', description: 'From a new lead to a reviewed follow-up: AI assistance, operational records, and human approval in one workflow.', image: '/images/project-northstar.png', study: '/projects/home-services-crm', demo: 'https://crmdemo.gunnarneuman.com/' },
  { name: 'PrepMe', type: 'AI interview practice', description: 'Candidate context, live interviews, evidence-linked feedback, and focused practice in a connected product.', image: '/images/project-prepme.png', study: '/projects/prepme', demo: 'https://prepme.gunnarneuman.com/' },
  { name: 'Steward', type: 'AI planning demonstration', description: 'Goals become reviewable plans through validated tools, deterministic calculations, and human decisions.', image: '/images/project-steward.jpg', study: '/projects/steward', demo: 'https://steward.gunnarneuman.com/demo' },
]

// Audio is synthesized locally, and only starts after the visitor opts in.
function useBells() {
  const audio = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const chime = () => {
    const context = audio.current
    if (!context || context.state !== 'running') return
    const now = context.currentTime
    ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.035, now + index * 0.3 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.3 + 3.5)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now + index * 0.3)
      oscillator.stop(now + index * 0.3 + 3.6)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    })
  }
  const toggle = async () => {
    try {
      if (enabled) {
        await audio.current?.suspend()
        setEnabled(false)
      } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) { setUnavailable(true); return }
        if (!audio.current) audio.current = new AudioContext()
        await audio.current.resume()
        setEnabled(true)
        chime()
      }
    } catch { setUnavailable(true); setEnabled(false) }
  }
  useEffect(() => () => { audio.current?.close().catch(() => {}); audio.current = null }, [])
  useEffect(() => {
    const quiet = () => {
      if (document.hidden) { audio.current?.suspend().catch(() => {}); setEnabled(false) }
    }
    document.addEventListener('visibilitychange', quiet)
    return () => document.removeEventListener('visibilitychange', quiet)
  }, [])
  return { enabled, unavailable, toggle, chime }
}

function PlaceContent({ place }) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  if (place.id === 'library' || place.id === 'workshop') return (
    <>
      <div className="somewhere-projects">
        {projects.map((project, index) => (
          <article className="somewhere-project" key={project.name}>
            <img src={project.image} alt={`${project.name} application preview`} loading="lazy" />
            <div>
              <span className="somewhere-eyebrow">0{index + 1} / {project.type}</span>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="somewhere-project-links">
                {place.id === 'workshop' ? <a href={project.demo} target="_blank" rel="noreferrer">Open demo ↗</a> : <Link to={project.study}>Read case study <span aria-hidden="true">↗</span></Link>}
                {place.id === 'workshop' && <Link to={project.study}>Case study</Link>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="somewhere-note">These are functional demonstrations. Each case study separates deployed capabilities, local checks, and dated live-model evaluations.</p>
      <Link className="somewhere-text-link" to={place.id === 'library' ? '/client-work' : '/projects'}>{place.id === 'library' ? 'Explore my client work' : 'See all projects'} ↗</Link>
    </>
  )
  if (place.id === 'garden') return (
    <div className="somewhere-garden-copy">
      <p className="somewhere-large-copy">I’m Gunnar. I turn business problems into working products and systems, then use them to learn what works.</p>
      <p>I’m based in Milwaukee, Wisconsin, and looking for an AI adoption or implementation role. My background runs through sales operations, product launches, client work, and hands-on AI product building.</p>
      <div className="somewhere-principles">{approachPrinciples.map((item) => <article key={item.number}><span className="somewhere-eyebrow">{item.number}</span><h3>{item.title}</h3><p>{item.desc}</p></article>)}</div>
      <div className="somewhere-project-links"><Link to="/about">More about me ↗</Link><a href="/Gunnar-Neuman-Resume.pdf" target="_blank" rel="noreferrer">Read my résumé ↗</a><Link to="/writing">Writing ↗</Link></div>
    </div>
  )
  return (
    <div className="somewhere-post-copy">
      <span className="somewhere-postmark" aria-hidden="true">MILWAUKEE, WI<br />✳<br />A NOTE GOES A LONG WAY</span>
      <p className="somewhere-large-copy">Have something worth untangling?</p>
      <p>I’d love to hear about your team, a useful AI workflow, or an idea that needs someone to help make it real.</p>
      <a className="somewhere-email" href="mailto:gunnarneuman14@gmail.com">gunnarneuman14@gmail.com</a>
      <div className="somewhere-project-links"><a href="mailto:gunnarneuman14@gmail.com">Write a note ↗</a><button type="button" onClick={async () => { try { await navigator.clipboard.writeText('gunnarneuman14@gmail.com'); setCopied(true); setCopyFailed(false) } catch { setCopyFailed(true) } }}>{copied ? 'Address copied ✓' : 'Copy email address'}</button></div>
      <p className="somewhere-note" role="status">{copyFailed ? 'You can select and copy the email address above.' : copied ? 'Email address copied to your clipboard.' : 'Open to AI adoption and implementation opportunities.'}</p>
      <Link className="somewhere-text-link" to="/contact">More ways to start a conversation ↗</Link>
    </div>
  )
}

export default function Somewhere() {
  const [entered, setEntered] = useState(false)
  const [night, setNight] = useState(false)
  const [selected, setSelected] = useState(null)
  const [visited, setVisited] = useState([])
  const [wish, setWish] = useState(false)
  const [still, setStill] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const noMotion = reducedMotion || still
  const world = useRef(null)
  const dialog = useRef(null)
  const arrivalButton = useRef(null)
  const firstPlace = useRef(null)
  const sound = useBells()

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (selected && dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [selected])

  const enter = () => {
    setEntered(true)
    sound.chime()
    // The new screen has a clear keyboard starting point, without a motion delay.
    requestAnimationFrame(() => firstPlace.current?.focus({ preventScroll: true }))
  }
  const leave = () => {
    setEntered(false)
    requestAnimationFrame(() => arrivalButton.current?.focus({ preventScroll: true }))
  }
  const visit = (place) => {
    setSelected(place)
    setVisited((previous) => previous.includes(place.id) ? previous : [...previous, place.id])
    sound.chime()
  }
  const close = () => { dialog.current?.close(); setSelected(null) }
  const move = (event) => {
    if (noMotion || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    world.current?.style.setProperty('--look-x', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}px`)
    world.current?.style.setProperty('--look-y', `${((event.clientY - bounds.top) / bounds.height - 0.5) * 8}px`)
  }
  const resetLook = () => { world.current?.style.setProperty('--look-x', '0px'); world.current?.style.setProperty('--look-y', '0px') }

  return (
    <div ref={world} className={`somewhere ${entered ? 'is-entered' : ''} ${night ? 'is-evening' : ''} ${noMotion ? 'is-still' : ''}`} onPointerMove={move} onPointerLeave={resetLook}>
      <a className="somewhere-skip" href="#somewhere-navigation">Skip to portfolio navigation</a>
      <div className="somewhere-environment" aria-hidden="true">
        <img className="somewhere-arrival-art" src="/images/somewhere-arrival.webp" alt="" fetchpriority="high" />
        <img className="somewhere-courtyard-art" src="/images/somewhere-courtyard.webp" alt="" />
        <div className="somewhere-light" />
        <div className="somewhere-motes">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ '--i': index, left: `${(index * 37 + 7) % 100}%`, top: `${(index * 23 + 41) % 100}%` }} />)}</div>
      </div>

      <header className="somewhere-header">
        <Link to="/" className="somewhere-brand" onClick={leave}><span className="somewhere-brand-symbol" aria-hidden="true">✳</span><span>Gunnar Neuman<small>A LITTLE WORLD. A BODY OF WORK.</small></span></Link>
        <nav id="somewhere-navigation" aria-label="Portfolio navigation" tabIndex={-1}>
          <Link to="/projects">Work <span aria-hidden="true">↗</span></Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Say hello <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <main className="somewhere-main">
        {!entered ? (
          <section className="somewhere-arrival" aria-labelledby="somewhere-title">
            <p className="somewhere-eyebrow">A PORTFOLIO BY GUNNAR NEUMAN</p>
            <h1 id="somewhere-title">Somewhere<br />in the <em>Midwest.</em></h1>
            <p className="somewhere-intro">A little farther down the road.<br />A little closer to something good.</p>
            <div className="somewhere-entry-actions"><button ref={arrivalButton} type="button" className="somewhere-enter" onClick={enter}>Come on in <span aria-hidden="true">↗</span></button><Link to="/projects">Just here for the work?</Link></div>
            <p className="somewhere-identity">AI implementation. Useful systems. Human curiosity.</p>
          </section>
        ) : (
          <section className="somewhere-square" aria-labelledby="somewhere-square-title">
            <div className="somewhere-square-heading"><p className="somewhere-eyebrow">YOU MADE IT. STAY A LITTLE.</p><h1 id="somewhere-square-title">The world is yours to <em>explore.</em></h1><p>Choose a place. See what’s inside.</p></div>
            <img className="somewhere-mobile-scene" src="/images/somewhere-courtyard.webp" alt="A sunlit Roman courtyard with a chapel, fountain, library, workshop, and garden among Midwestern fields." />
            <div className="somewhere-places">
              {places.map((place, index) => <button ref={index === 0 ? firstPlace : undefined} key={place.id} type="button" className={`somewhere-place somewhere-place--${place.id} ${visited.includes(place.id) ? 'was-visited' : ''}`} style={{ '--x': `${place.x}%`, '--y': `${place.y}%` }} onClick={() => visit(place)} aria-haspopup="dialog"><span className="somewhere-place-number" aria-hidden="true">{visited.includes(place.id) ? '✓' : place.number}</span><span><strong>{place.name}</strong><small>{place.label}</small></span><span className="somewhere-place-arrow" aria-hidden="true">↗</span></button>)}
            </div>
            <button className={`somewhere-wish ${wish ? 'has-wish' : ''}`} type="button" onClick={() => { setWish(true); sound.chime() }} aria-label="Make a wish at the fountain"><span aria-hidden="true">✧</span>{wish ? 'May something good find you.' : 'Make a little wish'}</button>
            <p className="somewhere-sr-only" role="status">{wish ? 'May something good find you.' : ''}</p>
          </section>
        )}
      </main>

      <footer className="somewhere-footer">
        <div className="somewhere-location"><span aria-hidden="true">✧</span><span>{entered ? 'THE COURTYARD' : 'AT THE END OF THE ROAD'}<small>{entered ? `${visited.length} of 4 places visited` : 'Somewhere near Milwaukee, Wisconsin'}</small></span></div>
        <div className="somewhere-controls">
          {entered && <button type="button" onClick={leave} aria-label="Return to the arrival scene"><span aria-hidden="true">↶</span><span>The road</span></button>}
          <button type="button" onClick={() => setNight(!night)} aria-pressed={night} aria-label="Evening light"><span aria-hidden="true">{night ? '☾' : '☼'}</span><span>{night ? 'Evening' : 'Golden hour'}</span></button>
          <button type="button" onClick={sound.toggle} aria-pressed={sound.enabled} disabled={sound.unavailable} aria-label="Chime sounds"><span aria-hidden="true">♫</span><span>{sound.unavailable ? 'Sound unavailable' : sound.enabled ? 'Sound on' : 'Sound off'}</span></button>
          <button type="button" onClick={() => { setStill(!still); resetLook() }} aria-pressed={Boolean(noMotion)} disabled={Boolean(reducedMotion)} aria-label="Pause ambient motion"><span aria-hidden="true">{noMotion ? '▷' : 'Ⅱ'}</span><span>{noMotion ? 'Still' : 'Motion'}</span></button>
        </div>
      </footer>

      <dialog ref={dialog} className="somewhere-dialog" aria-labelledby="somewhere-place-title" onCancel={close} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close() } }}>
        {selected && <><div className="somewhere-dialog-top"><span className="somewhere-eyebrow">SOMEWHERE IN THE MIDWEST / {selected.number}</span><button type="button" onClick={close} autoFocus aria-label="Close and return to the courtyard">Close <span aria-hidden="true">×</span></button></div><div className="somewhere-dialog-heading"><p className="somewhere-eyebrow">{selected.label}</p><h2 id="somewhere-place-title">{selected.name}<em>.</em></h2><p>{selected.description}</p></div><PlaceContent key={selected.id} place={selected} /><div className="somewhere-dialog-bottom"><span>Made with curiosity. Rooted in the Midwest.</span><button type="button" onClick={close}>Back to the courtyard ↶</button></div></>}
      </dialog>
    </div>
  )
}
