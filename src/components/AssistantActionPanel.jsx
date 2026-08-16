import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AssistantActionPanel.css'

function Notes({ notes }) {
  const entries = Array.isArray(notes.entries) ? notes.entries : []
  const visitor = [notes.visitorName, notes.visitorRole, notes.organization].filter(Boolean).join(' · ')
  const discussion = [...(notes.interests || []), ...(notes.relevantProof || [])]
    .filter((item, index, items) => item && items.indexOf(item) === index)

  return (
    <section className="assistant-action assistant-action--notes">
      <div className="assistant-notes__head">
        <span><i /> Meeting notes</span><small>Live</small>
      </div>

      <div className="assistant-notes" aria-live="polite">
        {entries.length ? (
          <ol className="assistant-notes__entries">
            {entries.map((entry, index) => (
              <li key={entry.id || `${index}-${entry.text}`} className={entry.complete === false ? 'is-live' : ''}>
                <span>{index + 1}</span><p>{entry.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="assistant-notes__empty">Questions and discussion points will appear here as the conversation develops.</p>
        )}

        {(visitor || notes.reasonForVisit || notes.hiringContext) && (
          <dl className="assistant-notes__context">
            {visitor && <div><dt>Visitor</dt><dd>{visitor}</dd></div>}
            {notes.reasonForVisit && <div><dt>Reason for visiting</dt><dd>{notes.reasonForVisit}</dd></div>}
            {notes.hiringContext && <div><dt>Opportunity</dt><dd>{notes.hiringContext}</dd></div>}
          </dl>
        )}

        {!!discussion.length && (
          <div className="assistant-notes__summary">
            <strong>Points discussed</strong>
            <ul>{discussion.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        )}

        {notes.nextStep && notes.nextStep !== 'Continue the conversation' && (
          <div className="assistant-notes__next"><strong>Next step</strong><p>{notes.nextStep}</p></div>
        )}
      </div>
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
      <Notes notes={assistant.notes} />
      <Destination destination={assistant.destination} onNavigate={onNavigate} />
      {assistant.emailOffered && <EmailRecap state={assistant.emailState} onSend={assistant.sendRecap} />}
      <Calendar state={assistant.calendarState} bookingState={assistant.bookingState} onBook={assistant.bookInterview} />
    </div>
  )
}
