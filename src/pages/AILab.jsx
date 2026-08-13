import { useEffect, useRef, useState } from 'react'
import PageTransition from '../components/PageTransition'
import { complaintSample, reputationSample, roleMatchSample } from '../data/aiLabSamples'
import './AILab.css'

function normalizePublicUrl(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const parsed = new URL(candidate)
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) throw new Error('Invalid public URL')
  return parsed.toString()
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'That action could not be completed right now.')
  return payload
}

async function runAnalysis(body) {
  const payload = await requestJson('/api/lab-analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!payload.result) throw new Error('The custom analysis endpoint is available on the deployed preview. The complete sample still works locally.')
  return payload.result
}

function Badge({ children, tone = '' }) { return <span className={`lab-badge${tone ? ` lab-badge--${tone.toLowerCase()}` : ''}`}>{children}</span> }
function ErrorNotice({ message }) { return message ? <div className="lab-error" role="alert"><strong>That did not finish.</strong><span>{message}</span></div> : null }
function Section({ title, children }) { return <section className="lab-result-section"><h3>{title}</h3>{children}</section> }

function downloadResult(filename, result) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url)
}

function ResultHeader({ eyebrow, title, summary, filename, result, onReset }) {
  return <div className="lab-result-head"><div><span className="lab-result-kicker">{eyebrow}</span><h2>{title}</h2><p>{summary}</p></div><div className="lab-result-actions"><button type="button" onClick={() => downloadResult(filename, result)}>Download</button><button type="button" onClick={onReset}>Start over</button></div></div>
}

function WorkflowProgress({ labels }) {
  const [active, setActive] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => Math.min(labels.length - 1, value + 1)), 850); return () => window.clearInterval(timer) }, [labels.length])
  return <div className="lab-live-process" role="status"><div className="lab-live-process__head"><span className="lab-live-dot" />Automation running</div>{labels.map((label, index) => <div key={label} className={index < active ? 'is-done' : index === active ? 'is-active' : ''}><i>{index < active ? '✓' : index + 1}</i><span>{label}</span></div>)}</div>
}

function EmailDelivery({ type, result, defaultEmail = '', schedule = '', autoSend = false }) {
  const [email, setEmail] = useState(defaultEmail)
  const [state, setState] = useState({ status: 'idle', message: '' })
  const sentRef = useRef(false)

  const send = async (address = email) => {
    setState({ status: 'sending', message: '' })
    try {
      const payload = await requestJson('/api/lab-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, result, email: address, schedule }) })
      setState({ status: 'sent', message: payload.message })
    } catch (error) { setState({ status: 'error', message: error.message }) }
  }

  useEffect(() => {
    if (autoSend && defaultEmail && !sentRef.current) { sentRef.current = true; send(defaultEmail) }
  // The one-time delivery intentionally runs once for the completed result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.status === 'sent') return <div className="lab-delivery is-sent"><strong>✓ Report delivered</strong><p>{state.message}</p></div>
  return <form className="lab-delivery" onSubmit={(event) => { event.preventDefault(); send() }}><div><strong>{type === 'reputation' ? 'One-time automated delivery' : 'Send this result'}</strong><p>{type === 'reputation' ? `This is the report that would arrive ${schedule}. This demo sends it once and creates no recurring subscription.` : 'Email a copy of this completed workflow.'}</p></div><div className="lab-delivery__form"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /><button type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Email report'}</button></div>{state.status === 'error' && <small>{state.message}</small>}</form>
}

function ComplaintResult({ result, email, onReset }) {
  return <div className="lab-result" aria-live="polite">
    <ResultHeader eyebrow={`Case ${result.caseId}`} title={`${result.urgency} priority · ${result.category}`} summary={result.summary} filename="customer-issue-workflow.json" result={result} onReset={onReset} />
    <div className="lab-decision-strip"><div><span>Intent</span><strong>{result.customerIntent}</strong></div><div><span>Route</span><strong>{result.department}</strong></div><div><span>Escalation</span><strong>{result.escalation.required ? 'Required' : 'Not required'}</strong></div></div>
    <Section title="Automation log"><div className="lab-automation-log">{result.automationLog.map((item, index) => <article key={`${item.label}-${index}`}><i>✓</i><div><strong>{item.label}</strong><p>{item.detail}</p></div></article>)}</div></Section>
    <Section title="Internal ticket"><div className="lab-ticket-grid"><div><h4>Recommended action</h4><p>{result.recommendedAction}</p></div><div><h4>Internal note</h4><p>{result.internalNote}</p></div><div><h4>Known facts</h4><ul>{result.facts.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Missing information</h4><ul>{result.missingInformation.length ? result.missingInformation.map((item) => <li key={item}>{item}</li>) : <li>Nothing material detected</li>}</ul></div></div></Section>
    <Section title="Draft customer response"><blockquote>{result.draftResponse}</blockquote><small className="lab-human-note">Human approval required before a customer-facing response is sent.</small></Section>
    <EmailDelivery type="complaint" result={result} defaultEmail={email} />
  </div>
}

function CustomerIssueHandler() {
  const [form, setForm] = useState({ customerName: '', product: '', orderReference: '', complaint: '', email: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [channels, setChannels] = useState({ configured: false, phoneNumber: '' })
  const processing = ['Communication received', 'Intent and sentiment classified', 'Risk and urgency checked', 'Correct owner selected', 'Internal ticket assembled', 'Response prepared for approval']
  useEffect(() => { requestJson('/api/lab-channel-config').then(setChannels).catch(() => {}) }, [])
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (form.complaint.trim().length < 30) { setError('Describe the issue in a little more detail so the system has something real to route.'); return }
    setLoading(true)
    try { setResult(await runAnalysis({ demo: 'complaint', channel: 'Web form', ...form })) } catch (runError) { setError(runError.message) } finally { setLoading(false) }
  }

  if (result) return <ComplaintResult result={result} email={form.email} onReset={() => setResult(null)} />
  return <div className="lab-form-wrap">
    <div className="lab-channel-row"><span className="is-live">Web form · live</span>{channels.configured ? <><a href={`sms:${channels.phoneNumber}`}>Text {channels.phoneNumber}</a><a href={`tel:${channels.phoneNumber}`}>Call {channels.phoneNumber}</a></> : <span>SMS + phone workflow ready when a Twilio number is connected</span>}</div>
    <form className="lab-form" onSubmit={submit}>
      <div className="lab-form__intro"><h3>Leave a realistic customer complaint.</h3><p>Watch the system classify it, route it, build the internal ticket, and draft the response.</p></div>
      <label>Customer name <span>Optional</span><input value={form.customerName} onChange={update('customerName')} placeholder="Jordan Lee" /></label>
      <label>Product or service <span>Optional</span><input value={form.product} onChange={update('product')} placeholder="Dining chair, installation, delivery…" /></label>
      <label>Order or account reference <span>Optional</span><input value={form.orderReference} onChange={update('orderReference')} placeholder="ORDER-1042" /></label>
      <label>Email for the finished report <span>Optional</span><input type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" /></label>
      <label>Customer message<textarea rows="6" value={form.complaint} onChange={update('complaint')} placeholder="I ordered two chairs and both arrived damaged. I was promised a replacement last week…" maxLength="6000" required /></label>
      <ErrorNotice message={error} />
      <div className="lab-form__actions"><button className="lab-run" type="submit" disabled={loading}>Handle the complaint <span>→</span></button><button className="lab-sample" type="button" onClick={() => setResult(complaintSample)}>Run sample complaint</button></div>
      <small>This demonstration creates a proposed internal workflow. It does not contact a real customer or issue a refund.</small>
    </form>
    {loading && <WorkflowProgress labels={processing} />}
  </div>
}

function RoleResult({ result, onReset }) {
  return <div className="lab-result" aria-live="polite">
    <ResultHeader eyebrow="Recruiter brief" title={result.role} summary={result.interviewCase} filename="gunnar-neuman-role-match.json" result={result} onReset={onReset} />
    <Section title="Strongest verified matches"><div className="lab-match-grid">{result.strongestMatches.map((item) => <article key={item.title}><h4>{item.title}</h4><p>{item.evidence}</p><span>{item.relevance}</span></article>)}</div></Section>
    <Section title="Best proof to inspect"><div className="lab-proof-links">{result.relevantProjects.map((item) => <a key={item.name} href={item.href} target="_blank" rel="noreferrer"><strong>{item.name}</strong><span>{item.reason}</span><i>↗</i></a>)}</div></Section>
    <Section title="Areas to explore"><ul className="lab-clean-list">{result.discussionAreas.map((item) => <li key={item}>{item}</li>)}</ul></Section>
    <Section title="Questions worth asking"><ol className="lab-number-list">{result.interviewQuestions.map((item) => <li key={item}>{item}</li>)}</ol></Section>
    <EmailDelivery type="role" result={result} />
    <CalendarBooking />
    <p className="lab-evidence-note">{result.truthBoundary}</p>
  </div>
}

function CalendarBooking() {
  const [state, setState] = useState({ status: 'idle', slots: [], message: '' })
  const [selected, setSelected] = useState(null)
  const [visitor, setVisitor] = useState({ name: '', email: '' })
  const check = async () => { setState({ status: 'loading', slots: [], message: '' }); try { const data = await requestJson('/api/calendar-availability'); setState({ status: 'ready', slots: data.slots || [], message: '' }) } catch (error) { setState({ status: 'error', slots: [], message: error.message }) } }
  const book = async (event) => { event.preventDefault(); setState((value) => ({ ...value, status: 'booking' })); try { const data = await requestJson('/api/book-interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start: selected.start, ...visitor }) }); setState({ status: 'booked', slots: [], message: `Interview scheduled for ${data.event?.label || selected.label}.` }) } catch (error) { setState((value) => ({ ...value, status: 'error', message: error.message })) } }
  return <div className="lab-calendar"><div><strong>Real calendar handoff</strong><p>Check Gunnar’s actual availability. Nothing is booked without explicit confirmation.</p></div>{state.status === 'idle' && <button type="button" onClick={check}>Check availability</button>}{state.status === 'loading' && <span>Looking at calendar…</span>}{state.status === 'ready' && <><div className="lab-slot-list">{state.slots.map((slot) => <button type="button" key={slot.start} className={selected?.start === slot.start ? 'is-selected' : ''} onClick={() => setSelected(slot)}>{slot.label}</button>)}</div>{selected && <form onSubmit={book}><input value={visitor.name} onChange={(event) => setVisitor((value) => ({ ...value, name: event.target.value }))} placeholder="Your name" required /><input type="email" value={visitor.email} onChange={(event) => setVisitor((value) => ({ ...value, email: event.target.value }))} placeholder="you@company.com" required /><button type="submit">Confirm interview</button></form>}</>}{state.status === 'booking' && <span>Creating calendar event…</span>}{state.status === 'booked' && <strong className="lab-success">✓ {state.message}</strong>}{state.status === 'error' && <small>{state.message}</small>}</div>
}

function RoleMatch() {
  const [form, setForm] = useState({ jobUrl: '', companyWebsite: '', jobDescription: '', companyContext: '' })
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!form.jobUrl.trim() && !form.companyWebsite.trim() && form.jobDescription.trim().length < 80) { setError('Add a job link, company website, or pasted job description.'); return }
    let jobUrl = ''; let companyWebsite = ''
    try { jobUrl = normalizePublicUrl(form.jobUrl); companyWebsite = normalizePublicUrl(form.companyWebsite) } catch { setError('Use a valid company or job URL, such as company.com/careers/role.'); return }
    setLoading(true); try { setResult(await runAnalysis({ demo: 'role', ...form, jobUrl, companyWebsite })) } catch (runError) { setError(runError.message) } finally { setLoading(false) }
  }
  if (result) return <RoleResult result={result} onReset={() => setResult(null)} />
  return <div className="lab-form-wrap"><form className="lab-form" onSubmit={submit}><div className="lab-form__intro"><h3>Give it a real company and role.</h3><p>The system researches the context, builds the strongest truthful interview case, and packages the proof.</p></div><label>Job posting URL <span>Optional</span><input type="text" inputMode="url" value={form.jobUrl} onChange={update('jobUrl')} placeholder="company.com/careers/role" /></label><label>Company website <span>Optional</span><input type="text" inputMode="url" value={form.companyWebsite} onChange={update('companyWebsite')} placeholder="company.com" /></label><label>Job description <span>Paste when available</span><textarea rows="8" value={form.jobDescription} onChange={update('jobDescription')} placeholder="Paste responsibilities and requirements…" maxLength="18000" /></label><label>What matters most to the team? <span>Optional</span><textarea rows="3" value={form.companyContext} onChange={update('companyContext')} placeholder="Implementation, adoption, customer operations…" /></label><ErrorNotice message={error} /><div className="lab-form__actions"><button className="lab-run" type="submit" disabled={loading}>Build the recruiter brief <span>→</span></button><button className="lab-sample" type="button" onClick={() => setResult(roleMatchSample)}>View sample</button></div><small>No fit score and no invented credentials. Direct and transferable evidence remain separate.</small></form>{loading && <WorkflowProgress labels={['Researching the company and role', 'Reading verified experience', 'Matching direct evidence', 'Selecting project proof', 'Building recruiter brief']} />}</div>
}

function ReputationResult({ result, email, schedule, emailStateKey, onReset }) {
  return <div className="lab-result" aria-live="polite">
    <ResultHeader eyebrow={result.reportSchedule} title={`${result.businessName} reputation report`} summary={result.executiveSummary} filename="reputation-report.json" result={result} onReset={onReset} />
    <Section title="Public sources checked"><div className="lab-source-list">{result.sources.map((item) => <a key={`${item.url}-${item.title}`} href={item.url} target="_blank" rel="noreferrer"><strong>{item.title}</strong><span>{item.finding}</span><i>↗</i></a>)}</div></Section>
    <Section title="Recurring themes"><div className="lab-theme-grid">{result.themes.map((item) => <article key={item.theme}><div><h4>{item.theme}</h4><Badge tone={item.sentiment === 'Positive' ? 'safe' : item.sentiment === 'Negative' ? 'risk' : ''}>{item.sentiment}</Badge></div><strong>{item.frequency}</strong><p>{item.evidence}</p></article>)}</div></Section>
    <Section title="Operational issues"><div className="lab-issue-list">{result.operationalIssues.map((item) => <article key={item.issue}><div><h4>{item.issue}</h4><p>{item.signal}</p></div><span>Likely owner · {item.likelyOwner}</span></article>)}</div></Section>
    <Section title="Recommended action"><div className="lab-action-table">{result.recommendations.map((item) => <article key={item.action}><div><h4>{item.action}</h4><p>{item.impact}</p></div><dl><div><dt>Owner</dt><dd>{item.owner}</dd></div><div><dt>Timing</dt><dd>{item.timing}</dd></div></dl></article>)}</div></Section>
    <Section title="Draft public responses"><div className="lab-response-list">{result.draftResponses.map((item) => <article key={item.situation}><span>{item.situation}</span><p>“{item.response}”</p></article>)}</div></Section>
    <div className="lab-next-move"><span>Best next move</span><p>{result.nextMove}</p></div>
    <EmailDelivery key={emailStateKey} type="reputation" result={result} defaultEmail={email} schedule={schedule} autoSend />
    <p className="lab-evidence-note">{result.evidenceNote}</p>
  </div>
}

function ReputationMonitor() {
  const [form, setForm] = useState({ business: '', email: '', cadence: 'every Monday', deliveryTime: '8:00 AM' })
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))
  const schedule = `${form.cadence} at ${form.deliveryTime}`
  const submit = async (event) => { event.preventDefault(); setError(''); if (form.business.trim().length < 3) { setError('Enter a business name, website, or Google Business Profile link.'); return } setLoading(true); try { setResult(await runAnalysis({ demo: 'reputation', ...form })) } catch (runError) { setError(runError.message) } finally { setLoading(false) } }
  if (result) return <ReputationResult result={result} email={form.email} schedule={schedule} emailStateKey={`${form.email}-${schedule}`} onReset={() => setResult(null)} />
  return <div className="lab-form-wrap"><form className="lab-form" onSubmit={submit}><div className="lab-form__intro"><h3>Set up a one-time version of an automated reputation report.</h3><p>Give it only the business and delivery details. The system finds the public signals, builds the report, and emails the demonstration.</p></div><label>Business name, website, or Google profile<input value={form.business} onChange={update('business')} placeholder="Business name or company.com" required /></label><label>Your email<input type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" required /></label><label>Hypothetical frequency<select value={form.cadence} onChange={update('cadence')}><option>every weekday</option><option>every Monday</option><option>every Friday</option><option>every day</option></select></label><label>Delivery time<input value={form.deliveryTime} onChange={update('deliveryTime')} placeholder="8:00 AM" required /></label><div className="lab-demo-disclosure"><strong>Demo only</strong><span>One report will be sent now. Nothing will repeat, and no subscription will be created.</span></div><ErrorNotice message={error} /><div className="lab-form__actions"><button className="lab-run" type="submit" disabled={loading}>Research and send report <span>→</span></button><button className="lab-sample" type="button" onClick={() => setResult(reputationSample)}>View sample</button></div></form>{loading && <WorkflowProgress labels={['Resolving the correct business', 'Searching public reputation sources', 'Extracting review signals', 'Finding operating patterns', 'Building executive report', 'Preparing one-time email']} />}</div>
}

function AILab() {
  return <PageTransition><div className="ai-lab" data-assistant-section="lab-overview"><header className="lab-simple-header"><div className="container"><h1>AI Lab</h1><p>Three working business workflows. Add real context and watch what the system does with it.</p></div></header><main className="lab-simple-list container"><section className="lab-demo" id="lab-complaint" data-assistant-section="lab-complaint"><div className="lab-demo__heading"><span>01</span><div><h2>Customer Issue Handler</h2><p>Turn an inbound complaint into a routed case, internal ticket, escalation decision, and response draft.</p></div></div><CustomerIssueHandler /></section><section className="lab-demo" id="lab-reputation" data-assistant-section="lab-reputation"><div className="lab-demo__heading"><span>02</span><div><h2>Automated Reputation Report</h2><p>Research a real business, generate its reputation brief, and deliver the one-time report by email.</p></div></div><ReputationMonitor /></section><section className="lab-demo" id="lab-role" data-assistant-section="lab-role"><div className="lab-demo__heading"><span>03</span><div><h2>Role Match Brief</h2><p>Research a company and role, package the strongest verified evidence, email the brief, and check real interview availability.</p></div></div><RoleMatch /></section></main></div></PageTransition>
}

export default AILab
