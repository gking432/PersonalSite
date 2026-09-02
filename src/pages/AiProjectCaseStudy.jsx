import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import './AiProjectCaseStudy.css'

const ease = [0.22, 1, 0.36, 1]

const ownerLabels = {
  ai: 'AI',
  software: 'Software',
  mixed: 'AI with human control'
}

const studies = {
  prepme: {
    eyebrow: 'Implementation breakdown · Functional demo',
    title: 'PrepMe',
    headline: 'Answers become targeted coaching.',
    summary:
      'PrepMe runs a live AI interview, structures the transcript, evaluates answers against six defined HR-screen signals, and routes weaker areas into targeted practice.',
    demonstrates:
      'PrepMe coordinates interviewing, evaluation, feedback, and coaching in one connected workflow.',
    footerHeading: 'Try PrepMe, then see how the workflow is built.',
    disclosure:
      'Self-directed demo of one complete HR-screen workflow. All sample candidate and employer information is fictional.',
    demoUrl: 'https://prep-me-wheat.vercel.app/',
    image: '/images/project-prepme.png',
    imageAlt: 'PrepMe interview setup screen',
    stats: [
      ['5', 'Connected stages'],
      ['6', 'HR signals'],
      ['8 / 8', 'AI scenarios passed', 'evals']
    ],
    flow: [
      ['Context', 'A résumé and job description become one interview profile.', 'software'],
      ['Interview', 'OpenAI Realtime runs the HR screen through voice or text.', 'ai'],
      ['Transcript', 'The conversation becomes structured question-and-answer turns.', 'software'],
      ['Evaluation', 'A grading task checks six explicit HR-screen signals.', 'ai'],
      ['Coaching', 'Weak signals route to the matching interactive workshop.', 'mixed']
    ],
    boundaries: [
      {
        label: 'AI handles',
        owner: 'ai',
        text: 'Realtime conversation, rubric grading, feedback synthesis, and coaching suggestions.'
      },
      {
        label: 'Software handles',
        owner: 'software',
        text: 'Context assembly, transcript structure, task routing, state, validation, and workshop mapping.'
      },
      {
        label: 'Human controls',
        owner: 'human',
        text: 'The candidate controls the information they provide, whether to continue, and how they use the feedback. PrepMe does not make a hiring decision.'
      }
    ],
    decisions: [
      ['Task-based routing', 'Interviewing, transcription, grading, reporting, and coaching use a central task registry. The product can change one capability without scattering model choices across the application.'],
      ['Structured contracts', 'Grading and coaching responses are parsed and schema checked before the interface can use them. A malformed response fails cleanly instead of rendering a partial result.'],
      ['Evidence before advice', 'Feedback remains tied to the transcript excerpt and question that produced it. The product can explain why a signal was flagged and route that exact weakness into practice.'],
      ['Useful fallbacks', 'Typed replies cover microphone problems. Sparse interviews follow a defined repair path. A completed fictional sample lets visitors inspect the full feedback and coaching loop.']
    ],
    proves: [
      'Realtime AI inside a complete product workflow',
      'Several model tasks coordinated through shared state',
      'Validated outputs instead of unchecked generated text',
      'Failure paths designed alongside the happy path',
      'Evaluation claims tied to executable tests'
    ],
    panels: {
      flow: {
        title: 'One connected pipeline',
        intro: 'The output from each stage becomes controlled input for the next.',
        items: [
          ['01', 'Build context', 'Normalize the candidate and role into one interview profile.'],
          ['02', 'Run interview', 'Maintain one conversation state across voice and typed replies.'],
          ['03', 'Structure evidence', 'Preserve interviewer questions and candidate answers as traceable turns.'],
          ['04', 'Grade', 'Evaluate six named signals and reject malformed model output.'],
          ['05', 'Coach', 'Map each weak signal to a specific workshop and source evidence.']
        ]
      },
      safety: {
        title: 'Designed failure paths',
        intro: 'The demo stays usable when the model, microphone, or user input does not follow the ideal path.',
        items: [
          ['Validated model contracts', 'Zod schemas check grading, rewrites, and coaching output before rendering.'],
          ['Sparse-session handling', 'An interrupted interview cannot receive inflated or invented feedback.'],
          ['Public-input controls', 'Request limits, throttling, and private-network URL rejection reduce abuse risk on public endpoints.'],
          ['Fictional sample isolation', 'Demo data is labeled and checked so it cannot be confused with Gunnar’s work history.']
        ]
      },
      evals: {
        title: 'Tested behavior',
        intro: 'The reviewed build includes eight checked-in AI evaluation scenarios plus broader application tests.',
        metric: '8 / 8 AI scenarios passed',
        items: [
          ['Fictional data isolation', 'Sample context stays separate from Gunnar’s background.'],
          ['Sparse and complete coverage', 'Short and substantive sessions take different, defined paths.'],
          ['Six-area repair mapping', 'Every HR signal maps to one coaching route.'],
          ['Contract validation', 'Valid feedback passes; malformed output is rejected.'],
          ['Coaching validation', 'Generated coaching follows its expected structure.'],
          ['Safe JSON recovery', 'Wrapped valid JSON is recovered and checked before use.']
        ]
      }
    }
  },
  steward: {
    eyebrow: 'Implementation breakdown · Functional demo',
    title: 'Steward',
    headline: 'Rules own the math. AI explains it.',
    summary:
      'Steward pairs deterministic financial planning with a bounded AI layer for questions, explanations, and guided setup.',
    demonstrates:
      'Steward separates financial calculation from AI explanation and keeps plan changes under user control.',
    footerHeading: 'Try Steward, then see how the system separates calculation, explanation, and approval.',
    disclosure:
      'Self-directed functional demo using controlled data. It does not move money or provide financial advice.',
    demoUrl: 'https://steward-financial-os.vercel.app/demo',
    image: '/images/project-steward.jpg',
    imageAlt: 'Steward financial planning demo',
    stats: [
      ['Rules first', 'Calculation model'],
      ['Human', 'Final approval'],
      ['185 / 185', 'Tests passed', 'evals']
    ],
    flow: [
      ['Activity', 'Controlled sample account and transaction data create the financial workspace.', 'software'],
      ['Observations', 'Rules identify patterns, obligations, and missing facts.', 'software'],
      ['Conversation', 'Steward asks only for context the data cannot establish.', 'ai'],
      ['Plan', 'A deterministic engine calculates buckets, tradeoffs, and safe-to-spend.', 'software'],
      ['Explanation', 'AI explains the verified result without replacing the calculation.', 'mixed']
    ],
    boundaries: [
      {
        label: 'AI handles',
        owner: 'ai',
        text: 'Natural-language intent, focused onboarding dialogue, and concise explanations of verified results.'
      },
      {
        label: 'Software handles',
        owner: 'software',
        text: 'Paydays, obligations, allocations, affordability, reconciliation, data rules, and persistence.'
      },
      {
        label: 'Human controls',
        owner: 'human',
        text: 'The user controls goals, corrections, priorities, and whether a proposed plan change is applied. Steward never moves money.'
      }
    ],
    decisions: [
      ['Calculation and explanation split', 'Financial arithmetic runs in deterministic code. The model receives the finished answer and a bounded context, then explains it without recalculating.'],
      ['Grounded-number guard', 'If a model response introduces a figure the system did not supply, the response is discarded and Steward uses the deterministic fallback.'],
      ['Questions from real uncertainty', 'The system asks about irregular deposits, unclear recurring charges, and missing goals. It does not ask for facts it already derived or invent facts it cannot know.'],
      ['Approval before change', 'A recommendation can become a proposal, but nothing is applied until the user confirms it. Stale and repeated proposals have explicit handling.']
    ],
    proves: [
      'AI and deterministic rules assigned to different jobs',
      'Model output constrained by verified business logic',
      'Conversation driven by system state and missing context',
      'Human approval attached to consequential changes',
      'Extensive automated checks across the complete workflow'
    ],
    panels: {
      flow: {
        title: 'A rules-first financial workflow',
        intro: 'AI makes the system easier to use; deterministic code remains the source of truth.',
        items: [
          ['01', 'Read activity', 'Build the workspace from controlled sample account and transaction data.'],
          ['02', 'Find patterns', 'Derive income, obligations, spending, and open questions.'],
          ['03', 'Collect intent', 'Translate natural language into a draft the user can confirm.'],
          ['04', 'Calculate', 'Run allocations and tradeoffs through the financial engine.'],
          ['05', 'Explain', 'Let AI communicate the verified answer in plain language.']
        ]
      },
      safety: {
        title: 'Trust boundaries',
        intro: 'The system limits what the model can decide and keeps every material change reviewable.',
        items: [
          ['No invented figures', 'A numeric grounding check rejects figures that are absent from the verified context.'],
          ['Deterministic fallback', 'The product still returns a useful answer when the AI layer is unavailable or rejected.'],
          ['Untrusted financial text', 'Merchant names, notes, and other records are treated as data, never instructions.'],
          ['Explicit confirmation', 'The user must approve a proposal before the system applies it.']
        ]
      },
      evals: {
        title: 'Tested rules and failure cases',
        intro: 'The reviewed build passed 185 automated checks across planning, AI safeguards, onboarding, data conversion, and approval behavior.',
        metric: '185 / 185 tests passed',
        items: [
          ['AI grounding', 'Invented figures are rejected while grounded restatements pass.'],
          ['Missing-data honesty', 'Unknown paydays, rates, and amounts remain unknown instead of becoming guesses.'],
          ['Plan reconciliation', 'Allocations balance and no money appears or disappears.'],
          ['Approval gates', 'Ignored proposals change nothing; confirmation is the only path that applies them.'],
          ['Conversation state', 'User choices survive model failure and cannot be silently reversed.'],
          ['Persistence', 'Confirmed plans, corrections, and user rules survive save and reload.']
        ]
      }
    }
  }
}

function ImplementationDrawer({ study, open, onClose, initialPanel = 'flow' }) {
  const [active, setActive] = useState('flow')

  useEffect(() => {
    if (!open) return undefined
    setActive(initialPanel)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKey)
    }
  }, [initialPanel, open, onClose])

  if (!open) return null
  const panel = study.panels[active]

  return (
    <div className="ai-study-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="ai-study-drawer" role="dialog" aria-modal="true" aria-labelledby="ai-study-drawer-title">
        <header className="ai-study-drawer__header">
          <div>
            <p>Implementation notes</p>
            <h2 id="ai-study-drawer-title">How {study.title} uses AI</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close implementation notes">×</button>
        </header>

        <div className="ai-study-tabs" role="tablist" aria-label="AI implementation details">
          {[
            ['flow', 'Flow'],
            ['safety', 'Safety'],
            ['evals', 'Testing']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              className={active === key ? 'is-active' : ''}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ai-study-panel" role="tabpanel">
          <div className="ai-study-panel__intro">
            <h3>{panel.title}</h3>
            <p>{panel.intro}</p>
            {panel.metric && <strong>{panel.metric}</strong>}
          </div>
          <div className="ai-study-panel__items">
            {panel.items.map((item) => {
              const [marker, title, text] = item.length === 3 ? item : ['✓', item[0], item[1]]
              return (
              <article key={`${marker}-${title}`}>
                <span>{marker}</span>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </article>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function AiProjectCaseStudy({ project }) {
  const study = studies[project]
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPanel, setDrawerPanel] = useState('flow')

  const openDrawer = (panel = 'flow') => {
    setDrawerPanel(panel)
    setDrawerOpen(true)
  }

  return (
    <PageTransition>
      <main className="ai-study">
        <section className="ai-study-hero">
          <div className="container ai-study-hero__grid">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease }}
            >
              <Link to="/projects" className="ai-study-back">← Projects</Link>
              <p className="ai-study-eyebrow">{study.eyebrow}</p>
              <h1>{study.headline}</h1>
              <p className="ai-study-summary">{study.summary}</p>
              <div className="ai-study-actions">
                <a href={study.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Open live demo <span aria-hidden="true">↗</span>
                </a>
                <button type="button" className="btn btn-secondary ai-study-system-button" onClick={() => openDrawer('flow')} aria-label={`See how ${study.title} uses AI`}>
                  How the AI works <span aria-hidden="true">→</span>
                </button>
              </div>
            </motion.div>

            <motion.aside
              className="ai-study-preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease }}
            >
              <div className="ai-study-preview__image">
                <img src={study.image} alt={study.imageAlt} />
              </div>
              <div className="ai-study-preview__label">
                <span>{study.title}</span>
                <strong>Functional demo</strong>
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="ai-study-proof">
          <div className="container">
            <div className="ai-study-disclosure">
              <span>Scope</span>
              <p>{study.disclosure}</p>
            </div>
            <div className="ai-study-stats">
              {study.stats.map(([value, label, panel]) => (
                <div key={label}>
                  {panel ? (
                    <button
                      type="button"
                      className="ai-study-stat-button"
                      onClick={() => openDrawer(panel)}
                      aria-label={`View ${study.title} tests`}
                    >
                      <span className="ai-study-stat-value"><strong>{value}</strong><span>{label}</span></span>
                      <span className="ai-study-stat-action">View tests →</span>
                    </button>
                  ) : (
                    <><strong>{value}</strong><span>{label}</span></>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ai-study-section">
          <div className="container">
            <div className="ai-study-section__head">
              <p>System flow</p>
              <h2>Where AI fits in the product.</h2>
            </div>
            <div className="ai-study-flow">
              {study.flow.map(([title, text, owner], index) => (
                <article key={title} className={`owner-${owner}`}>
                  <div className="ai-study-flow__meta">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{ownerLabels[owner]}</strong>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className="ai-study-legend" aria-label="Workflow ownership legend">
              <span className="owner-ai">AI</span>
              <span className="owner-software">Software</span>
              <span className="owner-mixed">AI with human control</span>
            </div>
          </div>
        </section>

        <section className="ai-study-section ai-study-section--tint">
          <div className="container">
            <div className="ai-study-section__head">
              <p>Responsibility</p>
              <h2>AI, software, and human control.</h2>
            </div>
            <div className="ai-study-boundaries">
              {study.boundaries.map((boundary) => (
                <article key={boundary.label} className={`boundary-${boundary.owner}`}>
                  <span>{boundary.label}</span>
                  <p>{boundary.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ai-study-section">
          <div className="container ai-study-detail-grid">
            <div>
              <div className="ai-study-section__head">
                <p>Implementation choices</p>
                <h2>The decisions behind the demo.</h2>
              </div>
              <div className="ai-study-decisions">
                {study.decisions.map(([title, text]) => (
                  <article key={title}><h3>{title}</h3><p>{text}</p></article>
                ))}
              </div>
            </div>
            <aside className="ai-study-proves">
              <p>What the system demonstrates</p>
              <h2>{study.demonstrates}</h2>
              <ul>
                {study.proves.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <button type="button" onClick={() => openDrawer('flow')}>
                Explore flow, safety, and testing <span aria-hidden="true">→</span>
              </button>
            </aside>
          </div>
        </section>

        <section className="ai-study-footer">
          <div className="container">
            <div>
              <p>See the system directly</p>
              <h2>{study.footerHeading}</h2>
            </div>
            <div className="ai-study-footer__actions">
              <a href={study.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open live demo ↗</a>
              <button type="button" className="btn btn-secondary" onClick={() => openDrawer('flow')}>How the AI works</button>
            </div>
          </div>
        </section>

        <ImplementationDrawer study={study} open={drawerOpen} onClose={() => setDrawerOpen(false)} initialPanel={drawerPanel} />
      </main>
    </PageTransition>
  )
}

export function PrepMeCaseStudy() {
  return <AiProjectCaseStudy project="prepme" />
}

export function StewardCaseStudy() {
  return <AiProjectCaseStudy project="steward" />
}
