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

// A small, dismissible nudge that appears after the visitor has had a moment
// with the page. It replaced a full-screen modal that blocked scrolling on first
// load and asked a stranger to talk to a bot before they had seen anything.
const INVITE_DELAY_MS = 15000

function inviteAlreadySeen() {
  try { return sessionStorage.getItem('gunnar-ai-intro-seen') === 'true' } catch { return false }
}

function TextDestination({ id, onNavigate }) {
  const destination = assistantDestinations[id]
  if (!destination) return null
  const contents = <>{destination.label}<span>{destination.external ? '↗' : '→'}</span></>
  return destination.external
    ? <a href={destination.href} target="_blank" rel="noreferrer">{contents}</a>
    : <Link to={destination.href} onClick={onNavigate}>{contents}</Link>
}

function TextAssistant({ chat, onNavigate, onSessionStart }) {
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
    onSessionStart()
    await chat.sendMessage(message)
  }

  const sendSuggestion = (suggestion) => {
    onSessionStart()
    chat.sendMessage(suggestion)
  }

  return <div className="global-ai__text">
    <div className="global-ai__messages" ref={messagesRef} aria-live="polite">
      {chat.messages.map((message, index) => <article key={`${message.role}-${index}`} className={`is-${message.role}`}><span>{message.role === 'assistant' ? 'Gunnar AI' : 'You'}</span><p>{message.content}</p>{message.role === 'assistant' && message.destinations?.length > 0 && <div className="global-ai__text-links">{message.destinations.map((id) => <TextDestination key={id} id={id} onNavigate={onNavigate} />)}</div>}</article>)}
      {chat.sending && <div className="global-ai__typing"><i /><i /><i /><span>Working on that</span></div>}
      {chat.error && <p className="global-ai__text-error">{chat.error}</p>}
    </div>
    {!!chat.suggestions.length && <div className="global-ai__suggestions">{chat.suggestions.slice(0, 2).map((suggestion) => <button type="button" key={suggestion} onClick={() => sendSuggestion(suggestion)} disabled={chat.sending}>{suggestion}</button>)}</div>}
    <form className="global-ai__composer" onSubmit={submit}><label htmlFor="global-ai-message">Ask Gunnar's AI assistant</label><div><input id="global-ai-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about Gunnar…" autoComplete="off" autoFocus /><button type="submit" disabled={chat.sending || !draft.trim()} aria-label="Send message">↑</button></div></form>
  </div>
}

function GlobalAssistantLauncher({ hidden = false }) {
  const location = useLocation()
  const assistant = usePortfolioAssistant()
  const chat = useTextPortfolioAssistant()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [voiceSessionStarted, setVoiceSessionStarted] = useState(false)
  const [activitySource, setActivitySource] = useState('text')
  // Text is the default: a hiring manager is likely at work, possibly on a
  // phone. Voice is an upgrade they opt into, not a toll gate.
  const [mode, setMode] = useState('text')
  const [pendingContext, setPendingContext] = useState('')
  const previousPath = useRef(location.pathname)
  const previousSection = useRef('')

  const dismissInvite = useCallback(() => {
    setInviteOpen(false)
    try { sessionStorage.setItem('gunnar-ai-intro-seen', 'true') } catch { /* Session storage can be unavailable in strict privacy modes. */ }
  }, [])

  // Surface the nudge once the visitor has settled in, and never on first paint.
  useEffect(() => {
    if (hidden || inviteAlreadySeen()) return undefined
    const timer = window.setTimeout(() => setInviteOpen(true), INVITE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [hidden])

  useEffect(() => {
    if (!inviteOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') dismissInvite() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dismissInvite, inviteOpen])

  const minimize = () => setOpen(false)

  const openAssistant = () => {
    dismissInvite()
    setActivityOpen(false)
    setOpen(true)
  }

  const toggleAssistant = () => {
    dismissInvite()
    setActivityOpen(false)
    setOpen((value) => !value)
  }

  const toggleActivity = () => {
    dismissInvite()
    setOpen(false)
    setActivityOpen((value) => !value)
  }

  const endConversation = () => {
    assistant.end()
    setMode('text')
    setOpen(false)
  }

  useEffect(() => {
    if (hidden) {
      assistant.end()
      setOpen(false)
      setActivityOpen(false)
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
    if (connected) {
      setVoiceSessionStarted(true)
      setActivitySource('voice')
      if (context) setPendingContext('')
    }
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
  const activity = activitySource === 'voice' ? assistant : chat
  const sessionStarted = voiceSessionStarted || chat.started

  return (
    <aside className="global-ai" aria-label="Gunnar's AI assistant">
      <AnimatePresence>
        {inviteOpen && !open && (
          <motion.aside
            className="global-ai__nudge"
            initial={{ opacity: 0, y: 14, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: .98 }}
            transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="global-ai__nudge-open" onClick={openAssistant}>Talk with my AI assistant</button>
          </motion.aside>
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
              {mode === 'voice' && assistant.active ? (
                <>
                  <p>The assistant is listening. Ask about Gunnar, his projects, or where to go on the site.</p>
                  <small>Microphone on · Speak naturally</small>
                </>
              ) : mode === 'voice' ? (
                <>
                  <p>{assistant.error || 'Starting the voice conversation…'}</p>
                  <div className="global-ai__welcome-actions">
                    <button type="button" className="global-ai__continue" onClick={() => setMode('text')}>Type instead</button>
                  </div>
                </>
              ) : mode === 'text' ? (
                <TextAssistant chat={chat} onNavigate={minimize} onSessionStart={() => setActivitySource('text')} />
              ) : (
                <>
                  <p>{assistant.error || (pendingContext ? 'The assistant has the project context and can help you work through what is happening.' : 'Ask about Gunnar’s background, experience, projects, or where to go on the site.')}</p>
                  <div className="global-ai__welcome-actions">
                    <button type="button" className="global-ai__start" onClick={() => startVoice()} disabled={assistant.connecting}>{assistant.connecting ? 'Connecting…' : 'Start voice conversation'}</button>
                    <button type="button" className="global-ai__continue" onClick={() => setMode('text')}>Type instead</button>
                  </div>
                  <small>Voice mode requires microphone permission</small>
                </>
              )}
            </div>

            {mode === 'voice' && assistant.active && <button type="button" className="global-ai__end" onClick={endConversation}>End conversation</button>}
            {mode === 'text' && <button type="button" className="global-ai__end" onClick={() => startVoice()} disabled={assistant.connecting}>{assistant.connecting ? 'Connecting…' : 'Switch to voice'}</button>}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activityOpen && (
          <motion.div className="global-ai__activity" initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: .24, ease: [0.22, 1, 0.36, 1] }}>
            <div className="global-ai__activity-head">
              <span><strong>Conversation notes</strong><small>Notes and assistant activity</small></span>
              <button type="button" onClick={() => setActivityOpen(false)} aria-label="Close conversation notes">×</button>
            </div>
            <div className="global-ai__activity-body"><AssistantActionPanel assistant={activity} compact /></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="global-ai__launchers">
        <AnimatePresence>
          {sessionStarted && <motion.button type="button" className={`global-ai__notes-launcher${activityOpen ? ' is-open' : ''}`} onClick={toggleActivity} aria-label={activityOpen ? 'Close conversation notes' : 'Open conversation notes and activity'} initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .7 }} whileHover={{ y: -2 }} whileTap={{ scale: .92 }}><span className="global-ai__notes-icon"><i /><i /></span></motion.button>}
        </AnimatePresence>
        <motion.button type="button" className={`global-ai__launcher${assistant.active || assistant.connecting ? ' is-live' : ''}`} onClick={toggleAssistant} aria-label={open ? 'Minimize Gunnar’s AI assistant' : assistant.active ? 'Open live AI assistant controls' : 'Open Gunnar’s AI assistant'} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}><span className="global-ai__launcher-orb"><i /><i /><i /></span></motion.button>
      </div>
    </aside>
  )
}

export default GlobalAssistantLauncher
