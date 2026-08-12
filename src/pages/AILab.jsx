import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import {
  opportunitySample,
  reputationSample,
  reputationSampleReviews,
  roleMatchSample
} from '../data/aiLabSamples'
import './AILab.css'

const ease = [0.22, 1, 0.36, 1]

const demos = [
  { id: 'opportunity', number: '01', title: 'AI Opportunity Mapper', description: 'Find a useful first AI pilot inside a real company.', proof: 'Workflow analysis · prioritization · guardrails' },
  { id: 'role', number: '02', title: 'Role Match Brief', description: 'Turn a job description into an evidence-based case for an interview.', proof: 'Business translation · positioning · honest evidence' },
  { id: 'reputation', number: '03', title: 'Reputation Intelligence', description: 'Turn raw customer reviews into an operating brief.', proof: 'Classification · pattern finding · recommended action' }
]

const mapperQuestions = [
  'Where could this company use AI?',
  'Which workflow should it pilot first?',
  'Where could AI save employees the most time?',
  'How could AI improve the customer experience?',
  'How could AI support sales or service teams?',
  'What should remain human-controlled?',
  'Ask my own question'
]

function Badge({ children, tone = '' }) {
  return <span className={`lab-badge${tone ? ` lab-badge--${tone.toLowerCase()}` : ''}`}>{children}</span>
}

function ErrorNotice({ message }) {
  if (!message) return null
  return <div className="lab-error" role="alert"><strong>The custom analysis did not run.</strong><span>{message}</span></div>
}

function ResultHeader({ eyebrow, title, summary, onDownload, onReset }) {
  useEffect(() => {
    window.requestAnimationFrame(() => {
      const workspace = document.querySelector('.lab-workspace')
      if (!workspace) return
      const top = workspace.getBoundingClientRect().top + window.scrollY - 92
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
  }, [])

  return (
    <div className="lab-result-head">
      <div>
        <span className="lab-result-kicker">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>
      <div className="lab-result-actions">
        <button type="button" onClick={onDownload}>Download brief</button>
        <button type="button" onClick={onReset}>Start over</button>
      </div>
    </div>
  )
}

function Section({ title, children, className = '' }) {
  return <section className={`lab-result-section ${className}`.trim()}><h3>{title}</h3>{children}</section>
}

function LoadingState({ steps }) {
  return (
    <div className="lab-loading" role="status">
      <span className="lab-loading__orb"><i /><i /><i /></span>
      <div><strong>Building the brief</strong><p>{steps}</p></div>
    </div>
  )
}

function downloadResult(filename, result) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function runAnalysis(body) {
  const response = await fetch('/api/lab-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'The analysis service is unavailable right now.')
  if (!payload.result) throw new Error('The custom analysis endpoint is available on the deployed preview. The complete sample result works locally.')
  return payload.result
}

function OpportunityResult({ result, onReset }) {
  return (
    <div className="lab-result" aria-live="polite">
      <ResultHeader eyebrow="Opportunity brief" title={result.organization} summary={result.executiveSummary} onDownload={() => downloadResult('ai-opportunity-brief.json', result)} onReset={onReset} />
      <Section title="Ranked opportunities" className="lab-result-section--wide">
        <div className="lab-opportunity-list">
          {result.opportunities.map((item, index) => (
            <article key={`${item.title}-${index}`} className="lab-opportunity">
              <div className="lab-opportunity__rank">0{index + 1}</div>
              <div className="lab-opportunity__body">
                <h4>{item.title}</h4>
                <p>{item.workflow}</p>
                <div className="lab-badges"><Badge tone={item.value}>Value {item.value}</Badge><Badge>Complexity {item.complexity}</Badge><Badge tone={item.risk === 'High' ? 'risk' : 'safe'}>Risk {item.risk}</Badge></div>
                <dl><div><dt>Why it matters</dt><dd>{item.why}</dd></div><div><dt>Human checkpoint</dt><dd>{item.humanControl}</dd></div></dl>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Recommended first pilot">
        <div className="lab-pilot"><h4>{result.recommendedPilot.title}</h4><p>{result.recommendedPilot.reason}</p><ol>{result.recommendedPilot.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="lab-metric"><span>Measure</span>{result.recommendedPilot.successMetric}</div></div>
      </Section>
      <Section title="Guardrails"><ul className="lab-clean-list">{result.guardrails.map((item) => <li key={item}>{item}</li>)}</ul></Section>
      {result.evidenceNote && <p className="lab-evidence-note">{result.evidenceNote}</p>}
    </div>
  )
}

function OpportunityMapper() {
  const [website, setWebsite] = useState('')
  const [department, setDepartment] = useState('')
  const [question, setQuestion] = useState(mapperQuestions[1])
  const [customQuestion, setCustomQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault(); setError('')
    let parsed
    try { parsed = new URL(website) } catch { setError('Enter a complete public URL, including https://.'); return }
    if (!['http:', 'https:'].includes(parsed.protocol)) { setError('Enter a public http or https URL.'); return }
    const finalQuestion = question === 'Ask my own question' ? customQuestion.trim() : question
    if (!finalQuestion) { setError('Write the question you want the analysis to answer.'); return }
    setLoading(true)
    try { setResult(await runAnalysis({ demo: 'opportunity', website, department, question: finalQuestion })) }
    catch (runError) { setError(runError.message) }
    finally { setLoading(false) }
  }

  if (result) return <OpportunityResult result={result} onReset={() => setResult(null)} />
  return (
    <div className="lab-workspace-grid">
      <form className="lab-form" onSubmit={submit}>
        <div className="lab-form__intro"><span>Bring the context</span><h2>Where should this company use AI first?</h2><p>Give the mapper a public company site and a real question. It will look for an implementable workflow—not a list of generic AI ideas.</p></div>
        <label>Company website<input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://company.com" required /></label>
        <label>Department or team <span>Optional</span><input value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Customer service, sales, operations…" /></label>
        <label>Question<select value={question} onChange={(event) => setQuestion(event.target.value)}>{mapperQuestions.map((item) => <option key={item}>{item}</option>)}</select></label>
        {question === 'Ask my own question' && <label>Ask your own<textarea rows="4" value={customQuestion} onChange={(event) => setCustomQuestion(event.target.value)} placeholder="What would you want an AI implementation lead to investigate?" maxLength="800" required /></label>}
        <ErrorNotice message={error} />
        <div className="lab-form__actions"><button className="lab-run" type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Map the opportunity'}<span>→</span></button><button className="lab-sample" type="button" onClick={() => setResult(opportunitySample)}>View complete sample</button></div>
        <small>Public information only. The analysis is directional and should be validated with the people doing the work.</small>
      </form>
      <aside className="lab-process"><span>What happens</span><ol><li><b>01</b><div><strong>Read the business</strong><p>Understand what the company sells, who it serves, and how work likely moves.</p></div></li><li><b>02</b><div><strong>Find the workflow</strong><p>Look for repeated knowledge work, handoffs, delays, and inconsistent manual AI use.</p></div></li><li><b>03</b><div><strong>Choose a pilot</strong><p>Balance business value, technical complexity, risk, and the need for human control.</p></div></li></ol></aside>
      {loading && <LoadingState steps="Reading the company · mapping workflows · ranking a pilot" />}
    </div>
  )
}

function RoleResult({ result, onReset }) {
  return (
    <div className="lab-result" aria-live="polite">
      <ResultHeader eyebrow="Interview case" title={result.role} summary={result.interviewCase} onDownload={() => downloadResult('gunnar-neuman-role-match.json', result)} onReset={onReset} />
      <Section title="Strongest verified matches" className="lab-result-section--wide"><div className="lab-match-grid">{result.strongestMatches.map((item) => <article key={item.title}><h4>{item.title}</h4><p>{item.evidence}</p><span>{item.relevance}</span></article>)}</div></Section>
      <Section title="Best proof to inspect"><div className="lab-proof-links">{result.relevantProjects.map((item) => <a key={item.name} href={item.href} target="_blank" rel="noreferrer"><strong>{item.name}</strong><span>{item.reason}</span><i>↗</i></a>)}</div></Section>
      <Section title="Transferable evidence"><div className="lab-chip-list">{result.transferableEvidence.map((item) => <span key={item}>{item}</span>)}</div></Section>
      <Section title="Areas to explore during an interview"><ul className="lab-clean-list">{result.discussionAreas.map((item) => <li key={item}>{item}</li>)}</ul></Section>
      <Section title="Questions worth asking"><ol className="lab-number-list">{result.interviewQuestions.map((item) => <li key={item}>{item}</li>)}</ol></Section>
      <Section title="Keep exploring"><div className="lab-page-links">{result.recommendedPages.map((item) => <a key={item.label} href={item.href} target={item.href.endsWith('.pdf') ? '_blank' : undefined} rel="noreferrer">{item.label}<span>→</span></a>)}</div></Section>
      <p className="lab-evidence-note">{result.truthBoundary}</p>
    </div>
  )
}

function RoleMatch() {
  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [companyContext, setCompanyContext] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!jobUrl.trim() && jobDescription.trim().length < 80) { setError('Paste the job description or provide a public job-posting URL.'); return }
    if (jobUrl.trim()) { try { new URL(jobUrl) } catch { setError('Enter a complete public job URL, including https://.'); return } }
    setLoading(true)
    try { setResult(await runAnalysis({ demo: 'role', jobUrl, jobDescription, companyContext })) }
    catch (runError) { setError(runError.message) }
    finally { setLoading(false) }
  }

  if (result) return <RoleResult result={result} onReset={() => setResult(null)} />
  return (
    <div className="lab-workspace-grid">
      <form className="lab-form" onSubmit={submit}>
        <div className="lab-form__intro"><span>Bring the role</span><h2>Is Gunnar worth interviewing for this?</h2><p>This does not produce a fake fit score. It builds the strongest truthful case from the requirements, then surfaces what a hiring team should explore directly.</p></div>
        <label>Public job-posting URL <span>Optional if pasted below</span><input type="url" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://company.com/careers/role" /></label>
        <label>Job description <span>Recommended</span><textarea rows="9" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the responsibilities and requirements here…" maxLength="18000" /></label>
        <label>What matters most to your team? <span>Optional</span><textarea rows="3" value={companyContext} onChange={(event) => setCompanyContext(event.target.value)} placeholder="A workflow, implementation challenge, team need, or concern…" maxLength="1600" /></label>
        <ErrorNotice message={error} />
        <div className="lab-form__actions"><button className="lab-run" type="submit" disabled={loading}>{loading ? 'Building brief…' : 'Build the interview case'}<span>→</span></button><button className="lab-sample" type="button" onClick={() => setResult(roleMatchSample)}>View complete sample</button></div>
        <small>The brief advocates for Gunnar without inventing experience, results, or enterprise deployments.</small>
      </form>
      <aside className="lab-process"><span>What it evaluates</span><ol><li><b>01</b><div><strong>Direct evidence</strong><p>Verified experience and finished work that map cleanly to the role.</p></div></li><li><b>02</b><div><strong>Transferable evidence</strong><p>Adjacent experience that makes the next step credible without pretending it is identical.</p></div></li><li><b>03</b><div><strong>Interview value</strong><p>The specific questions and project proof that can resolve uncertainty in a real conversation.</p></div></li></ol></aside>
      {loading && <LoadingState steps="Reading the role · matching verified evidence · assembling the interview case" />}
    </div>
  )
}

function ReputationResult({ result, onReset }) {
  return (
    <div className="lab-result" aria-live="polite">
      <ResultHeader eyebrow="Reputation brief" title="What the reviews are really saying" summary={result.executiveSummary} onDownload={() => downloadResult('reputation-intelligence-brief.json', result)} onReset={onReset} />
      <Section title="Recurring themes" className="lab-result-section--wide"><div className="lab-theme-grid">{result.themes.map((item) => <article key={item.theme}><div><h4>{item.theme}</h4><Badge tone={item.sentiment === 'Positive' ? 'safe' : 'risk'}>{item.sentiment}</Badge></div><strong>{item.frequency}</strong><p>{item.evidence}</p></article>)}</div></Section>
      <Section title="Operational issues"><div className="lab-issue-list">{result.operationalIssues.map((item) => <article key={item.issue}><h4>{item.issue}</h4><p>{item.signal}</p><span>Likely owner · {item.likelyOwner}</span></article>)}</div></Section>
      <Section title="Reputation risks"><ul className="lab-clean-list">{result.risks.map((item) => <li key={item}>{item}</li>)}</ul></Section>
      <Section title="Recommended action"><div className="lab-action-table">{result.recommendations.map((item) => <article key={item.action}><div><h4>{item.action}</h4><p>{item.impact}</p></div><dl><div><dt>Owner</dt><dd>{item.owner}</dd></div><div><dt>Timing</dt><dd>{item.timing}</dd></div></dl></article>)}</div></Section>
      <Section title="Draft public responses"><div className="lab-response-list">{result.draftResponses.map((item) => <article key={item.situation}><span>{item.situation}</span><p>“{item.response}”</p></article>)}</div></Section>
      <div className="lab-next-move"><span>Best next move</span><p>{result.nextMove}</p></div>
      {result.evidenceNote && <p className="lab-evidence-note">{result.evidenceNote}</p>}
    </div>
  )
}

function ReputationIntelligence() {
  const fileRef = useRef(null)
  const [reviews, setReviews] = useState('')
  const [businessContext, setBusinessContext] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const reviewCount = useMemo(() => reviews.trim() ? reviews.trim().split(/\n+/).filter(Boolean).length : 0, [reviews])

  const readFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 250000) { setError('Use a CSV or text file smaller than 250 KB.'); return }
    const text = await file.text()
    setReviews(text.slice(0, 100000)); setError('')
  }

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (reviews.trim().length < 120) { setError('Paste several real reviews or load the sample set so there is enough evidence to analyze.'); return }
    setLoading(true)
    try { setResult(await runAnalysis({ demo: 'reputation', reviews, businessContext })) }
    catch (runError) { setError(runError.message) }
    finally { setLoading(false) }
  }

  if (result) return <ReputationResult result={result} onReset={() => setResult(null)} />
  return (
    <div className="lab-workspace-grid">
      <form className="lab-form" onSubmit={submit}>
        <div className="lab-form__intro"><span>Bring the evidence</span><h2>Turn customer feedback into an operating brief.</h2><p>Paste reviews or upload a simple CSV. The system separates writing problems from actual workflow problems and recommends what to fix first.</p></div>
        <label>Business context <span>Optional</span><input value={businessContext} onChange={(event) => setBusinessContext(event.target.value)} placeholder="Home services, hospitality, healthcare…" maxLength="500" /></label>
        <label>Customer reviews <span>{reviewCount ? `${reviewCount} lines loaded` : 'One review per line works best'}</span><textarea rows="12" value={reviews} onChange={(event) => setReviews(event.target.value)} placeholder="Paste public reviews here…" maxLength="100000" /></label>
        <input ref={fileRef} className="lab-file-input" type="file" accept=".csv,.txt,text/csv,text/plain" onChange={readFile} />
        <div className="lab-input-tools"><button type="button" onClick={() => fileRef.current?.click()}>Upload CSV or text</button><button type="button" onClick={() => { setReviews(reputationSampleReviews); setError('') }}>Load sample reviews</button><button type="button" onClick={() => setReviews('')} disabled={!reviews}>Clear</button></div>
        <ErrorNotice message={error} />
        <div className="lab-form__actions"><button className="lab-run" type="submit" disabled={loading}>{loading ? 'Analyzing reviews…' : 'Build the reputation brief'}<span>→</span></button><button className="lab-sample" type="button" onClick={() => setResult(reputationSample)}>View complete sample</button></div>
        <small>Review text is analyzed for this request and is not stored by this site.</small>
      </form>
      <aside className="lab-process"><span>What it finds</span><ol><li><b>01</b><div><strong>Patterns</strong><p>Recurring positive and negative themes—not just a list of sentiments.</p></div></li><li><b>02</b><div><strong>Operating causes</strong><p>The handoffs, ownership gaps, or policies likely producing the customer experience.</p></div></li><li><b>03</b><div><strong>Action</strong><p>Prioritized fixes, responsible teams, timing, risks, and draft public responses.</p></div></li></ol></aside>
      {loading && <LoadingState steps="Classifying reviews · finding operating patterns · prioritizing action" />}
    </div>
  )
}

function AILab() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedDemo = searchParams.get('demo')
  const activeDemo = demos.some((demo) => demo.id === requestedDemo) ? requestedDemo : 'opportunity'
  const ActiveDemo = activeDemo === 'opportunity' ? OpportunityMapper : activeDemo === 'role' ? RoleMatch : ReputationIntelligence

  const chooseDemo = (id) => {
    setSearchParams({ demo: id }, { replace: true })
  }

  return (
    <PageTransition>
      <div className="ai-lab" data-assistant-section="lab-overview">
        <section className="lab-hero">
          <div className="container">
            <motion.span className="lab-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease }}>AI Lab · Working demonstrations</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease, delay: .05 }}>Bring real context.<br /><em>Leave with something useful.</em></motion.h1>
            <motion.div className="lab-hero__bottom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease, delay: .2 }}><p>Three focused demonstrations of how I approach AI implementation: start with a real input, structure the reasoning, keep important decisions visible, and produce an output someone can actually use.</p><div><span>03</span><small>Live workflows</small></div></motion.div>
          </div>
        </section>

        <section className="lab-shell">
          <div className="container">
            <nav className="lab-tabs" aria-label="AI Lab demonstrations">
              {demos.map((demo) => <button key={demo.id} type="button" className={activeDemo === demo.id ? 'is-active' : ''} onClick={() => chooseDemo(demo.id)} aria-pressed={activeDemo === demo.id}><span>{demo.number}</span><div><strong>{demo.title}</strong><small>{demo.description}</small></div></button>)}
            </nav>
            <div className="lab-proof-line"><span>What this demo proves</span><strong>{demos.find((demo) => demo.id === activeDemo)?.proof}</strong></div>
            <motion.div key={activeDemo} className="lab-workspace" data-assistant-section={`lab-${activeDemo}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, ease }}><ActiveDemo /></motion.div>
          </div>
        </section>

        <section className="lab-footer-note"><div className="container"><span>Not a magic trick</span><h2>The model is only one part of the system.</h2><p>The useful work is deciding what context to collect, what the output should contain, which claims are supportable, what a person still needs to control, and how the result fits into the next decision.</p></div></section>
      </div>
    </PageTransition>
  )
}

export default AILab
