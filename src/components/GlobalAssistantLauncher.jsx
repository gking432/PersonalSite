import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import AssistantActionPanel from './AssistantActionPanel'
import usePortfolioAssistant, { assistantDestinations, currentPortfolioScreen } from '../features/ai-demos/usePortfolioAssistant'
import useTextPortfolioAssistant from '../features/ai-demos/useTextPortfolioAssistant'
import './GlobalAssistantLauncher.css'

const pageNames = {
  '/': 'homepage',
  '/about': 'About page',
  '/projects': 'Projects page',
  '/client-work': 'Client Work page',
  '/contact': 'Contact page',
  '/writing': 'Writing page',
}

function initialInviteState() {
  try { return sessionStorage.getItem('gunnar-ai-intro-seen') !== 'true' } catch { return true }
}

function TextDestination({ id, onNavigate }) {
  const destination = assistantDestinations[id]
  if (!destination) return null
  const contents = <>{destination.label}<span>{destination.external ? '↗' : '→'}</span></>
  return destination.external
    ? <a href={destination.href} target="_blank" rel="noreferrer">{contents}</a>
    : <Link to={destination.href} onClick={onNavigate}>{contents}</Link>
}

function TextAssistant({ chat, onNavigate }) {
  const [draft, setDraft] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat.messages, chat.sending])

  const submit = async (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    const message = draft
    setDraft('')
    await chat.sendMessage(message)
  }

  return <div className="global-ai__text">
    <div className="global-ai__messages" ref={messagesRef} aria-live="polite">
      {chat.messages.map((message, index) => <article key={`${message.role}-${index}`} className={`is-${message.role}`}><span>{message.role === 'assistant' ? 'Gunnar AI' : 'You'}</span><p>{message.content}</p>{message.role === 'assistant' && message.destinations?.length > 0 && <div className="global-ai__text-links">{message.destinations.map((id) => <TextDestination key={id} id={id} onNavigate={onNavigate} />)}</div>}</article>)}
      {chat.sending && <div className="global-ai__typing"><i /><i /><i /><span>Working on that</span></div>}
      {chat.error && <p className="global-ai__text-error">{chat.error}</p>}
    </div>
    {!!chat.suggestions.length && <div className="global-ai__suggestions">{chat.suggestions.slice(0, 2).map((suggestion) => <button type="button" key={suggestion} onClick={() => chat.sendMessage(suggestion)} disabled={chat.sending}>{suggestion}</button>)}</div>}
    <form className="global-ai__composer" onSubmit={submit}><label htmlFor="global-ai-message">Ask Gunnar's AI assistant</label><div><input id="global-ai-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about Gunnar…" autoComplete="off" autoFocus /><button type="submit" disabled={chat.sending || !draft.trim()} aria-label="Send message">↑</button></div></form>
  </div>
}

function GlobalAssistantLauncher({ hidden = false }) {
  const location = useLocation()
  const assistant = usePortfolioAssistant()
  const chat = useTextPortfolioAssistant()
  const [inviteOpen, setInviteOpen] = useState(initialInviteState)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('choose')
  const [pendingContext, setPendingContext] = useState('')
  const previousPath = useRef(location.pathname)
  const previousSection = useRef('')

  const dismissInvite = useCallback(() => {
    setInviteOpen(false)
    try { sessionStorage.setItem('gunnar-ai-intro-seen', 'true') } catch { /* Session storage can be unavailable in strict privacy modes. */ }
  }, [])

  useEffect(() => {
    if (!inviteOpen) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') dismissInvite() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [dismissInvite, inviteOpen])

  const minimize = () => setOpen(false)

  const openAssistant = () => {
    dismissInvite()
    setOpen(true)
  }

  const endConversation = () => {
    assistant.end()
    setMode('choose')
    setOpen(false)
  }

  useEffect(() => {
    if (hidden) {
      assistant.end()
      setOpen(false)
      setInviteOpen(false)
    }
  // End any hidden microphone session when the assistant is disabled.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden])

  useEffect(() => {
    if (!assistant.active || hidden || previousPath.current === location.pathname) {
      previousPath.current = location.pathname
      return
    }
    const pageName = pageNames[location.pathname] || location.pathname
    window.setTimeout(() => {
      const screen = currentPortfolioScreen(location.pathname)
      assistant.sendContextEvent(`The visitor is now viewing the ${pageName}, section "${screen.section}". This is trusted portfolio state. Do not repeat the greeting.`)
      previousSection.current = screen.section
    }, 180)
    previousPath.current = location.pathname
  }, [assistant.active, assistant.sendContextEvent, hidden, location.pathname])

  useEffect(() => {
    if (!assistant.active || hidden) return undefined
    let timer
    const reportSection = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const screen = currentPortfolioScreen(location.pathname)
        if (screen.section === previousSection.current) return
        previousSection.current = screen.section
        assistant.sendContextEvent(`The visitor is now viewing section "${screen.section}" on ${screen.page}. This is trusted portfolio state.`)
      }, 350)
    }
    reportSection()
    window.addEventListener('scroll', reportSection, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', reportSection)
    }
  }, [assistant.active, assistant.sendContextEvent, hidden, location.pathname])

  const startVoice = useCallback(async (contextOverride = '', openingInstructions = '') => {
    dismissInvite()
    setMode('voice')
    setOpen(true)
    previousPath.current = location.pathname
    const context = typeof contextOverride === 'string' && contextOverride ? contextOverride : pendingContext
    const connected = await assistant.connect({ additionalContext: context, openingInstructions })
    if (!connected) setMode('choose')
    if (connected && context) setPendingContext('')
  }, [assistant.connect, dismissInvite, location.pathname, pendingContext])

  useEffect(() => {
    const openForSupport = (event) => {
      const context = String(event.detail?.context || '').slice(0, 1500)
      const openingInstructions = String(event.detail?.openingInstructions || '').slice(0, 900)
      const autoStart = event.detail?.autoStart === true
      dismissInvite()
      if (assistant.active && context) {
        setOpen(false)
        assistant.sendApplicationEvent(`${context}${openingInstructions ? `\nFor your next response: ${openingInstructions}` : ''}`)
      } else if (autoStart) {
        startVoice(context, openingInstructions)
      } else {
        setMode('choose')
        setOpen(true)
        setPendingContext(context)
      }
    }

    window.addEventListener('portfolio-assistant:open', openForSupport)
    return () => window.removeEventListener('portfolio-assistant:open', openForSupport)
  }, [assistant.active, assistant.sendApplicationEvent, dismissInvite, startVoice])

  if (hidden) return null

  const status = assistant.connecting ? 'Connecting…' : mode === 'text' ? 'Text conversation' : assistant.active ? (assistant.assistantSpeaking ? 'Speaking' : assistant.userSpeaking ? 'Listening' : 'Voice live') : 'Voice or text'

  return (
    <aside className="global-ai" aria-label="Gunnar's AI assistant">
      <AnimatePresence>
        {inviteOpen && (
          <motion.div className="global-ai__intro-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
            <motion.section className="global-ai__intro" role="dialog" aria-modal="true" aria-labelledby="global-ai-intro-title" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} transition={{ duration: .34, ease: [0.22, 1, 0.36, 1] }}>
              <button type="button" className="global-ai__intro-close" onClick={dismissInvite} aria-label="Close introduction">×</button>
              <span className="global-ai__intro-label">A note from Gunnar</span>
              <h2 id="global-ai-intro-title">Hey, I’m Gunnar.</h2>
              <p>For the best way to experience the site, I’d love for you to try my AI assistant. It can answer questions about my background and experience, explain my projects, and help you navigate the website.</p>
              <p>Click the icon in the bottom-right corner to get started. I recommend voice mode for the full experience, but you can type instead.</p>
              <button type="button" className="global-ai__intro-continue" onClick={dismissInvite}>Continue to site</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div className={`global-ai__panel is-${mode}`} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <div className="global-ai__head">
              <span className={`global-ai__orb${assistant.active ? ' is-live' : ''}`}><i /><i /><i /></span>
              <span><strong>Gunnar's AI assistant</strong><small>{status}</small></span>
              <button type="button" onClick={minimize} aria-label="Minimize AI assistant">×</button>
            </div>

            <div className="global-ai__body">
              {mode === 'voice' && assistant.active ? <><p>The assistant is listening. Ask about Gunnar, his projects, or where to go on the site.</p><AssistantActionPanel assistant={assistant} compact /><small>Microphone on · Speak naturally</small></> : mode === 'text' ? <TextAssistant chat={chat} onNavigate={minimize} /> : <><p>{assistant.error || (pendingContext ? 'The assistant has the project context and can help you work through what is happening.' : 'Ask about Gunnar’s background, experience, projects, or where to go on the site.')}</p><div className="global-ai__welcome-actions"><button type="button" className="global-ai__start" onClick={() => startVoice()} disabled={assistant.connecting}>{assistant.connecting ? 'Connecting…' : 'Start voice conversation'}</button><button type="button" className="global-ai__continue" onClick={() => setMode('text')}>Type instead</button></div><small>Voice mode requires microphone permission</small></>}
            </div>

            {mode === 'voice' && assistant.active && <button type="button" className="global-ai__end" onClick={endConversation}>End conversation</button>}
            {mode === 'text' && <button type="button" className="global-ai__end" onClick={() => setMode('choose')}>Back to voice or text</button>}
          </motion.div>
        )}
      </AnimatePresence>

      {!open && <motion.button type="button" className={`global-ai__launcher${assistant.active || assistant.connecting ? ' is-live' : ''}`} onClick={openAssistant} aria-label={assistant.active ? 'Open live AI assistant controls' : 'Open Gunnar’s AI assistant'} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}><span className="global-ai__launcher-orb"><i /><i /><i /></span></motion.button>}
    </aside>
  )
}

export default GlobalAssistantLauncher
