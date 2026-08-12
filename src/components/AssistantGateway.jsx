import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import AssistantActionPanel from './AssistantActionPanel'
import usePortfolioAssistant, { assistantDestinations } from '../features/ai-demos/usePortfolioAssistant'
import useTextPortfolioAssistant from '../features/ai-demos/useTextPortfolioAssistant'
import './AssistantGateway.css'

const ease = [0.22, 1, 0.36, 1]

function SignalCore({ active = false, listening = false }) {
  return (
    <div className={`gateway-core${active ? ' is-active' : ''}${listening ? ' is-listening' : ''}`} aria-hidden="true">
      <span className="gateway-core__orbit gateway-core__orbit--one" />
      <span className="gateway-core__orbit gateway-core__orbit--two" />
      <span className="gateway-core__halo" />
      <span className="gateway-core__eye"><i /><i /><i /><i /></span>
    </div>
  )
}

function DestinationCards({ ids, onEnterSite }) {
  if (!ids?.length) return null
  return (
    <div className="gateway-destinations">
      {ids.map((id) => {
        const destination = assistantDestinations[id]
        if (!destination) return null
        if (destination.external) {
          return <a key={id} href={destination.href} target="_blank" rel="noreferrer"><span>{destination.label}</span><i>↗</i></a>
        }
        return <button key={id} type="button" onClick={() => onEnterSite(destination.href)}><span>{destination.label}</span><i>→</i></button>
      })}
    </div>
  )
}

function TextConversation({ chat, onEnterSite, onVoice }) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat.messages, chat.sending])

  const submit = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    chat.sendMessage(draft)
    setDraft('')
  }

  return (
    <motion.section className="gateway-chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <header className="gateway-chat__header">
        <span><i /> Text channel connected</span>
        <button type="button" onClick={onVoice}>Switch to voice</button>
      </header>

      <div className="gateway-chat__messages" ref={scrollRef} aria-live="polite">
        {chat.messages.map((message, index) => (
          <motion.article
            key={`${message.role}-${index}`}
            className={`gateway-message gateway-message--${message.role}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <span>{message.role === 'assistant' ? 'Gunnar AI' : 'You'}</span>
            <p>{message.content}</p>
            {message.role === 'assistant' && <DestinationCards ids={message.destinations} onEnterSite={onEnterSite} />}
          </motion.article>
        ))}
        {chat.sending && <div className="gateway-thinking"><i /><i /><i /><span>Working through that</span></div>}
        {chat.error && <p className="gateway-chat__error">{chat.error}</p>}
      </div>

      <div className="gateway-chat__composer">
        {!!chat.suggestions.length && (
          <div className="gateway-suggestions">
            {chat.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => chat.sendMessage(suggestion)} disabled={chat.sending}>{suggestion}</button>)}
          </div>
        )}
        <form onSubmit={submit}>
          <label htmlFor="gateway-message">Ask about Gunnar</label>
          <input id="gateway-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about his experience, projects, or fit…" autoComplete="off" autoFocus />
          <button type="submit" disabled={chat.sending || !draft.trim()} aria-label="Send message">↑</button>
        </form>
      </div>
    </motion.section>
  )
}

function VoiceConversation({ assistant, onEnterSite, onEnd, onText }) {
  return (
    <motion.section className="gateway-voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="gateway-voice__status">
        <span><i /> {assistant.connecting ? 'Establishing voice channel' : assistant.active ? 'Voice channel live' : 'Voice unavailable'}</span>
        <button type="button" onClick={onText}>Use text instead</button>
      </div>
      <div className="gateway-voice__stage">
        <SignalCore active={assistant.active || assistant.connecting} listening={assistant.userSpeaking} />
        <span className="gateway-system-label">{assistant.assistantSpeaking ? 'Assistant speaking' : assistant.userSpeaking ? 'Listening' : assistant.connecting ? 'Connecting' : assistant.active ? 'Ready' : 'Connection ended'}</span>
        <p>{assistant.transcript || (assistant.connecting ? 'Opening a secure live-audio connection…' : assistant.error || 'Ask about Gunnar’s background, work, or projects.')}</p>
        {assistant.active && <AssistantActionPanel assistant={assistant} onNavigate={(destination) => !destination.external && onEnterSite(destination.href)} />}
        {!assistant.active && !assistant.connecting && assistant.error && <button type="button" className="gateway-inline-action" onClick={onText}>Continue with text</button>}
      </div>
      <button type="button" className="gateway-end-voice" onClick={onEnd}>{assistant.active ? 'End voice conversation' : 'Back'}</button>
    </motion.section>
  )
}

export default function AssistantGateway({ onEnterSite }) {
  const [mode, setMode] = useState('intro')
  const assistant = usePortfolioAssistant()
  const chat = useTextPortfolioAssistant()

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      assistant.end()
      document.body.style.overflow = originalOverflow
    }
  // The assistant end handler is stable for the lifetime of the gateway.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startVoice = async () => {
    setMode('voice')
    await assistant.connect()
  }

  const switchToText = () => {
    assistant.end()
    setMode('text')
  }

  const exitGateway = (target) => {
    assistant.end()
    onEnterSite(target)
  }

  return (
    <div className={`assistant-gateway is-${mode}`}>
      <div className="gateway-space" aria-hidden="true"><i /><i /><i /></div>
      <div className="gateway-grid" aria-hidden="true" />

      <header className="gateway-topbar">
        <span className="gateway-brand">Gunnar Neuman</span>
        <span className="gateway-system"><i /> AI portfolio interface · Online</span>
      </header>

      <AnimatePresence mode="wait">
        {mode === 'intro' && (
          <motion.main className="gateway-intro" key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45 }}>
            <div className="gateway-telemetry gateway-telemetry--left" aria-hidden="true">
              <span>Knowledge</span><strong>Verified</strong>
              <span>Projects</span><strong>04 online</strong>
              <span>Support</span><strong>Active</strong>
            </div>
            <div className="gateway-telemetry gateway-telemetry--right" aria-hidden="true">
              <span>Interface</span><strong>Voice + text</strong>
              <span>Purpose</span><strong>Explore · Ask · Navigate</strong>
              <span>Access</span><strong>Public</strong>
            </div>

            <SignalCore />
            <motion.div className="gateway-intro__copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease }}>
              <span className="gateway-eyebrow">Portfolio intelligence, ready</span>
              <h1>Hi. I’m Gunnar’s<br />AI assistant.</h1>
              <p>Ask me about his background, pull up the right work, or let me help you decide where to look first.</p>
            </motion.div>
            <motion.div className="gateway-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease }}>
              <button type="button" className="gateway-action gateway-action--voice" onClick={startVoice} disabled={assistant.connecting}>
                <span className="gateway-wave"><i /><i /><i /></span>
                <span><strong>Start with voice</strong><small>Microphone access begins after this click</small></span>
                <b>→</b>
              </button>
              <button type="button" className="gateway-action gateway-action--text" onClick={() => setMode('text')}>
                <span className="gateway-text-icon">Aa</span>
                <span><strong>Type instead</strong><small>Quiet mode · no microphone</small></span>
                <b>→</b>
              </button>
            </motion.div>
          </motion.main>
        )}

        {mode === 'voice' && <VoiceConversation key="voice" assistant={assistant} onEnterSite={exitGateway} onEnd={() => { assistant.end(); setMode('intro') }} onText={switchToText} />}
        {mode === 'text' && <TextConversation key="text" chat={chat} onEnterSite={exitGateway} onVoice={startVoice} />}
      </AnimatePresence>

      <button type="button" className="gateway-enter-site" onClick={() => exitGateway()}><span>Skip assistant</span> Enter the site <i>↓</i></button>
    </div>
  )
}
