import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import AssistantActionPanel from './AssistantActionPanel'
import usePortfolioAssistant, { currentPortfolioScreen } from '../features/ai-demos/usePortfolioAssistant'
import './GlobalAssistantLauncher.css'

const pageNames = {
  '/': 'homepage',
  '/about': 'About page',
  '/projects': 'Projects page',
  '/client-work': 'Client Work page',
  '/contact': 'Contact page',
  '/writing': 'Writing page',
}

function GlobalAssistantLauncher({ hidden = false }) {
  const location = useLocation()
  const assistant = usePortfolioAssistant()
  const [open, setOpen] = useState(true)
  const [pendingContext, setPendingContext] = useState('')
  const previousPath = useRef(location.pathname)
  const previousSection = useRef('')

  const minimize = () => {
    setOpen(false)
  }

  const endConversation = () => {
    assistant.end()
    setOpen(false)
  }

  useEffect(() => {
    if (hidden) endConversation()
  // End any hidden microphone session when entering the focused assistant page.
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

  const start = useCallback(async () => {
    setOpen(false)
    previousPath.current = location.pathname
    const connected = await assistant.connect()
    if (!connected) setOpen(true)
    if (connected && pendingContext) {
      assistant.sendApplicationEvent(pendingContext)
      setPendingContext('')
    }
  }, [assistant.connect, assistant.sendApplicationEvent, location.pathname, pendingContext])

  useEffect(() => {
    const openForSupport = (event) => {
      const context = String(event.detail?.context || '').slice(0, 500)
      setOpen(true)
      if (assistant.active && context) {
        assistant.sendApplicationEvent(context)
      } else {
        setPendingContext(context)
      }
    }

    window.addEventListener('portfolio-assistant:open', openForSupport)
    return () => window.removeEventListener('portfolio-assistant:open', openForSupport)
  }, [assistant.active, assistant.sendApplicationEvent])

  if (hidden) return null

  return (
    <aside className="global-ai" aria-label="Gunnar's AI assistant">
      <AnimatePresence>
      {open && (
          <motion.div
            className="global-ai__panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="global-ai__head">
              <span className={`global-ai__orb${assistant.active ? ' is-live' : ''}`}><i /><i /><i /></span>
              <span>
                <strong>Gunnar's AI assistant</strong>
                <small>{assistant.connecting ? 'Connecting…' : assistant.active ? (assistant.assistantSpeaking ? 'Speaking' : assistant.userSpeaking ? 'Listening' : 'Live') : 'Voice conversation'}</small>
              </span>
              <button type="button" onClick={minimize} aria-label="Minimize AI assistant">×</button>
            </div>

            <div className="global-ai__body">
              {assistant.active ? (
                <>
                  <p>The assistant is listening. Ask about Gunnar, his projects, or where to go on the site.</p>
                  <AssistantActionPanel assistant={assistant} compact />
                  <small>Microphone on · Speak naturally</small>
                </>
              ) : (
                <>
                  <p>{assistant.error || (pendingContext ? 'Tell the assistant which project you are using and what is happening. It knows the intended workflow and common failure points.' : 'Want the quickest tour? My AI assistant can answer questions about me, explain my projects, and move through the site with you.')}</p>
                  <div className="global-ai__welcome-actions">
                    <button type="button" className="global-ai__start" onClick={start} disabled={assistant.connecting}>{assistant.connecting ? 'Connecting…' : 'Speak with my AI assistant'}</button>
                    <button type="button" className="global-ai__continue" onClick={minimize}>Continue to site</button>
                  </div>
                  <small>Microphone permission required</small>
                </>
              )}
            </div>

            {assistant.active && <button type="button" className="global-ai__end" onClick={endConversation}>End conversation</button>}
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          type="button"
          className={`global-ai__launcher${assistant.active || assistant.connecting ? ' is-live' : ''}`}
          onClick={() => setOpen(true)}
          aria-label={assistant.active ? 'Open live AI assistant controls' : 'Open Gunnar’s AI assistant'}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="global-ai__launcher-orb"><i /><i /><i /></span>
        </motion.button>
      )}
    </aside>
  )
}

export default GlobalAssistantLauncher
