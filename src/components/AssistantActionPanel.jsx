import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AssistantActionPanel.css'

function Notes({ notes }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <section className="assistant-action assistant-action--notes">
      <button type="button" className="assistant-action__toggle" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span><i /> AI notes</span><small>{expanded ? 'Hide' : 'View'}</small>
      </button>
      {expanded && (
        <dl className="assistant-notes">
          {(notes.visitorName || notes.organization || notes.visitorRole) && (
            <div><dt>Visitor</dt><dd>{[notes.visitorName, notes.visitorRole, notes.organization].filter(Boolean).join(' · ')}</dd></div>
          )}
          {notes.reasonForVisit && <div><dt>Context</dt><dd>{notes.reasonForVisit}</dd></div>}
          {notes.hiringContext && <div><dt>Opportunity</dt><dd>{notes.hiringContext}</dd></div>}
          <div><dt>Goal</dt><dd>{notes.goal}</dd></div>
          <div><dt>Questions</dt><dd>{notes.questions.length ? notes.questions.join(' · ') : 'Listening for the important questions'}</dd></div>
          <div><dt>Relevant proof</dt><dd>{notes.relevantProof.length ? notes.relevantProof.join(' · ') : 'Matching Gunnar’s experience to the conversation'}</dd></div>
          <div><dt>Next step</dt><dd>{notes.nextStep}</dd></div>
        </dl>
      )}
    </section>
  )
}

// The audit trail. Always visible: the point of the panel is that a visitor can
// see what the assistant is allowed to do and where a person has to intervene.
const statusLabels = { ok: 'done', running: 'running', error: 'failed' }

function ActionLog({ actions, onSimulateFailure, canSimulate }) {
  return (
    <section className="assistant-action assistant-action--log">
      <div className="assistant-log__head">
        <span className="assistant-action__label">Action log</span>
        {canSimulate && (
          <button type="button" className="assistant-log__simulate" onClick={onSimulateFailure}>
            Simulate a tool failure
          </button>
        )}
      </div>

      {actions.length === 0 ? (
        <p className="assistant-log__empty">
          Every action this assistant takes appears here as it happens.
        </p>
      ) : (
        <ol className="assistant-log" aria-live="polite">
          {actions.map((action) => (
            <li key={action.id} className={`is-${action.status} is-kind-${action.kind}`}>
              <span className="assistant-log__kind">{action.kind}</span>
              <div>
                <strong>
                  {action.label}
                  {action.simulated && <em className="assistant-log__sim">simulated</em>}
                </strong>
                <small>{action.detail}</small>
              </div>
              <span className="assistant-log__status">{statusLabels[action.status] || action.status}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="assistant-log__note">
        Reads happen automatically. Email and calendar actions wait for your
        confirmation. The model decides what to say; the application decides what is allowed.
      </p>
    </section>
  )
}

function Destination({ destination, onNavigate }) {
  if (!destination) return null
  const contents = <>{destination.label}<span>→</span></>
  return destination.external
    ? <a className="assistant-destination" href={destination.href} target="_blank" rel="noreferrer">{contents}</a>
    : <Link className="assistant-destination" to={destination.href} onClick={() => onNavigate?.(destination)}>{contents}</Link>
}

function EmailRecap({ state, onSend }) {
  const [email, setEmail] = useState('')
  const [shareWithGunnar, setShareWithGunnar] = useState(false)
  const submit = (event) => {
    event.preventDefault()
    onSend({ email, shareWithGunnar })
  }
  return (
    <section className="assistant-action">
      <span className="assistant-action__label">Conversation recap</span>
      <p>Send the notes and relevant portfolio links to your inbox.</p>
      {state.status !== 'sent' ? (
        <form className="assistant-email-form" onSubmit={submit}>
          <label htmlFor="assistant-recap-email">Email address</label>
          <div><input id="assistant-recap-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@company.com" /><button type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Send notes'}</button></div>
          <label className="assistant-share-consent">
            <input type="checkbox" checked={shareWithGunnar} onChange={(event) => setShareWithGunnar(event.target.checked)} />
            <span>Share this recap and my email with Gunnar so he can follow up.</span>
          </label>
        </form>
      ) : <strong className="assistant-action__success">✓ {state.message}</strong>}
      {state.status === 'error' && <small className="assistant-action__error">{state.message}</small>}
    </section>
  )
}

function Calendar({ state, bookingState, onBook }) {
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const submit = (event) => {
    event.preventDefault()
    onBook({ start: selected.start, name, email })
  }

  if (state.status === 'idle') return null
  return (
    <section className="assistant-action">
      <span className="assistant-action__label">Interview availability</span>
      {state.status === 'checking' && <div className="assistant-calendar-loading"><i /><span>Looking at Gunnar’s calendar…</span></div>}
      {['unavailable', 'empty'].includes(state.status) && <p>{state.message}</p>}
      {state.status === 'ready' && bookingState.status !== 'booked' && (
        <>
          <p>Select a genuine available time. Nothing is booked until you confirm below.</p>
          <div className="assistant-slots">
            {state.slots.map((slot) => <button type="button" key={slot.start} className={selected?.start === slot.start ? 'is-selected' : ''} onClick={() => setSelected(slot)}>{slot.label}</button>)}
          </div>
          {selected && (
            <form className="assistant-booking-form" onSubmit={submit}>
              <strong>{selected.label}</strong>
              <label htmlFor="assistant-booking-name">Name</label>
              <input id="assistant-booking-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              <label htmlFor="assistant-booking-email">Email address</label>
              <input id="assistant-booking-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              <button type="submit" disabled={bookingState.status === 'booking'}>{bookingState.status === 'booking' ? 'Scheduling…' : 'Confirm interview'}</button>
            </form>
          )}
        </>
      )}
      {bookingState.status === 'booked' && <strong className="assistant-action__success">✓ {bookingState.message}</strong>}
      {bookingState.status === 'error' && <small className="assistant-action__error">{bookingState.message}</small>}
    </section>
  )
}

export default function AssistantActionPanel({ assistant, compact = false, onNavigate }) {
  return (
    <div className={`assistant-actions${compact ? ' is-compact' : ''}`}>
      <ActionLog
        actions={assistant.actions || []}
        onSimulateFailure={assistant.armCalendarFailure}
        canSimulate={Boolean(assistant.armCalendarFailure) && assistant.calendarState?.status !== 'ready'}
      />
      <Notes notes={assistant.notes} />
      <Destination destination={assistant.destination} onNavigate={onNavigate} />
      {assistant.emailOffered && <EmailRecap state={assistant.emailState} onSend={assistant.sendRecap} />}
      <Calendar state={assistant.calendarState} bookingState={assistant.bookingState} onBook={assistant.bookInterview} />
    </div>
  )
}
