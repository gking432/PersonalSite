import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import AssistantActionPanel from '../components/AssistantActionPanel'
import usePortfolioAssistant from '../features/ai-demos/usePortfolioAssistant'
import './AIAssistant.css'

const ease = [0.22, 1, 0.36, 1]

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function CallControl({ assistant, onEnd }) {
  return (
    <motion.aside
      className="ai-call-control"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease }}
      aria-label="Live AI conversation controls"
    >
      <div className="ai-call-control__bar">
        <div className="ai-call-control__summary">
          <span className="ai-call-avatar"><i /><i /><i /></span>
          <span className="ai-call-copy">
            <strong>AI Assistant</strong>
            <small><i /> {assistant.assistantSpeaking ? 'Speaking' : assistant.userSpeaking ? 'Listening' : 'Live'} · {formatDuration(assistant.duration)}</small>
          </span>
          <span className="ai-call-note-status">AI notetaking in progress</span>
        </div>
        <button type="button" className="ai-end-call" onClick={onEnd} aria-label="End AI conversation"><span>⌕</span><small>End</small></button>
      </div>
    </motion.aside>
  )
}

function AIDemos() {
  const assistant = usePortfolioAssistant()

  return (
    <PageTransition>
      <div className={`ai-assistant-page${assistant.active ? ' is-connected' : ''}`}>
        {!assistant.active && (
          <section className="ai-assistant-landing">
            <div className="ai-assistant-landing__glow" />
            <motion.div className="ai-assistant-intro" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
              <span className="ai-assistant-kicker"><i /> Live AI assistant</span>
              <h1>Ask about me.<br />Get a real answer.</h1>
              <p>Speak with an AI assistant grounded in my verified résumé, experience, and projects. It knows what I have done, what I can build, and where the boundaries are.</p>
              <div className="ai-assistant-entry-actions">
                <button type="button" className="ai-assistant-primary" onClick={assistant.connect} disabled={assistant.connecting}>
                  <span className="ai-button-orb">◉</span>
                  <span><strong>{assistant.connecting ? 'Connecting…' : 'Start a conversation'}</strong><small>No download · microphone required</small></span>
                </button>
              </div>
              <small className="ai-assistant-disclosure">The assistant takes structured notes. It does not have access to private conversations or unverified information.</small>
              {assistant.error && <small className="ai-connection-error">{assistant.error}</small>}
            </motion.div>
          </section>
        )}

        {assistant.active && (
          <section className="ai-conversation-room">
            <div className="ai-conversation-room__ambient ai-conversation-room__ambient--one" />
            <div className="ai-conversation-room__ambient ai-conversation-room__ambient--two" />
            <motion.div className="ai-conversation-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <div className="ai-speaking-mark" aria-hidden="true"><span /><span /><span /><span /></div>
              <span className="ai-speaking-label">AI Assistant · {assistant.userSpeaking ? 'Listening' : assistant.assistantSpeaking ? 'Speaking' : 'Connected'}</span>
              <p className="ai-latest-response">{assistant.transcript ? `“${assistant.transcript}”` : 'The assistant is ready. Speak naturally.'}</p>
              <AssistantActionPanel assistant={assistant} />
              <small className="ai-voice-pending">Live voice connected · Speak naturally</small>
            </motion.div>
            <CallControl assistant={assistant} onEnd={assistant.end} />
          </section>
        )}
      </div>
    </PageTransition>
  )
}

export default AIDemos
