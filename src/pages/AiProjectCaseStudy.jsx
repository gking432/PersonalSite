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
    eyebrow: 'AI implementation case study · Functional demo',
    title: 'PrepMe',
    headline: 'An AI interview workflow that turns practice into a clear next step.',
    summary:
      'PrepMe combines live conversation, structured interview evidence, rubric-based feedback, and targeted workshops. Each stage passes context into the next, helping candidates move from an interview answer to focused practice.',
    demonstrates:
      'Connecting AI capabilities into a workflow people can start, understand, and continue.',
    footerHeading: 'Try an interview or explore the sample, then follow the feedback into practice.',
    disclosure:
      'Self-directed demo of one complete HR-screen workflow. Use your own résumé and real job details, or explore the provided fictional sample.',
    demoUrl: 'https://prepme.gunnarneuman.com/',
    image: '/images/project-prepme.png',
    imageAlt: 'PrepMe interview setup screen',
    stats: [
      ['5', 'Connected stages'],
      ['6', 'HR signals'],
      ['27 / 27', 'Local automated tests · Sep 6, 2026']
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
      ['From evidence to a next step', 'Feedback carries source questions and answer excerpts into targeted workshops. Candidates can revisit the answer behind a weakness and practice the relevant skill.'],
      ['Make the workflow easy to try', 'Typed replies provide another way to participate. A completed fictional sample lets visitors explore feedback and workshops before committing to a live interview.'],
      ['Preserve progress through practice', 'Demo session feedback and workshop completion persist in browser storage, so candidates can move between feedback and practice without losing their place.'],
      ['Handle insufficient evidence explicitly', 'Sessions with insufficient interview evidence bypass model grading and follow a defined practice path. The workflow distinguishes missing evidence from a substantive interview.']
    ],
    proves: [
      'Translating interview preparation into connected AI tasks',
      'Coordinating conversation, assessment, and coaching through shared context',
      'Reducing friction with typed replies and a complete sample experience',
      'Turning feedback into focused practice with preserved progress',
      'Defining output contracts and insufficient-evidence paths',
      'Separating automated workflow checks from live-model quality evaluation'
    ],
    panels: {
      flow: {
        title: 'One connected pipeline',
        intro: 'Candidate context and interview evidence carry through to feedback and practice, so users do not have to reconstruct the session at every step.',
        items: [
          ['01', 'Build context', 'Normalize the candidate and role into one interview profile.'],
          ['02', 'Run interview', 'Maintain one conversation state across voice and typed replies.'],
          ['03', 'Structure evidence', 'Preserve interviewer questions and candidate answers as traceable turns.'],
          ['04', 'Grade', 'Evaluate six named signals and reject malformed model output.'],
          ['05', 'Coach', 'Map weak signals to workshops with source evidence, then preserve completed practice in the browser.']
        ]
      },
      safety: {
        title: 'Designed failure paths',
        intro: 'The workflow provides alternatives for participation and explicit handling for insufficient evidence or invalid output.',
        items: [
          ['Validated model contracts', 'Zod schemas check grading, rewrites, and coaching output before rendering.'],
          ['Sparse-session handling', 'Sessions with insufficient interview evidence bypass model grading and follow a defined practice path.'],
          ['Public-input controls', 'Request limits, throttling, and private-network URL rejection reduce abuse risk on public endpoints.'],
          ['Fictional sample isolation', 'The provided sample uses fictional candidate and employer details; users can supply their own résumé and real job information. Automated checks look for leakage of the portfolio owner’s work history into the sample.']
        ]
      },
      evals: {
        title: 'Dated checks, clearly scoped',
        intro: 'On September 6, 2026, the local working tree passed 27/27 automated tests. This includes eight fixture-based scenarios covering contracts, coverage, and routing. These are not eight live-model conversations or a verification of the deployed build.',
        metric: '27 / 27 local automated tests passed',
        items: [
          ['Fictional data isolation', 'Sample context stays separate from Gunnar’s background.'],
          ['Sparse and complete coverage', 'Short and substantive sessions take different, defined paths.'],
          ['Six-area repair mapping', 'Every HR signal maps to one coaching route.'],
          ['Contract validation', 'Valid feedback passes; malformed output is rejected.'],
          ['Coaching contract', 'A coaching fixture is checked against the expected output structure; this does not measure the quality of live coaching.'],
          ['Safe JSON recovery', 'Wrapped valid JSON is recovered and checked before use.'],
          ['Evidence limits', 'The tested local working tree includes uncommitted changes. Automated checks establish specific application behavior; live interview quality and coaching usefulness require separate evaluation.']
        ]
      }
    }
  },
  steward: {
    "eyebrow": "AI implementation case study · Functional demo",
    "title": "Steward",
    "headline": "An AI financial planning workflow that turns conversation into reviewable decisions.",
    "summary": "Steward interprets goals, corrections, and purchase questions, invokes validated planning tools, and helps users explore trade-offs. Deterministic software calculates the amounts and projected dates; users approve changes before they become part of the saved plan.",
    "demonstrates": "Turning AI capability into a usable workflow with clear controls and testable behavior.",
    "footerHeading": "Try a goal, revise a detail, and see how conversation becomes a reviewable plan.",
    "disclosure": "Self-directed functional demo using synthetic account data. Opening account analysis is deterministic. No real bank activity, money movement, or financial advice.",
    "demoUrl": "https://steward.gunnarneuman.com/demo",
    "image": "/images/project-steward.jpg",
    "imageAlt": "Steward financial planning demo using sample account data",
    "stats": [
        [
            "5 tools",
            "Validated planning actions"
        ],
        [
            "Human",
            "Final plan approval"
        ],
        [
            "255 / 255",
            "Automated tests · Sep 6, 2026"
        ]
    ],
    "flow": [
        [
            "Starting picture",
            "Software analyzes sample accounts, obligations, and spending to establish the planning context.",
            "software"
        ],
        [
            "Conversation",
            "AI interprets goals, corrections, and purchase questions while retaining the evolving draft.",
            "ai"
        ],
        [
            "Tool calls",
            "AI requests validated planning actions and receives application-calculated results.",
            "ai"
        ],
        [
            "Calculations",
            "The engine calculates allocations, affordability, and projected dates for scenario comparisons.",
            "software"
        ],
        [
            "Review & approval",
            "The user reviews calculated figures and explicitly approves changes to the saved plan.",
            "mixed"
        ]
    ],
    "boundaries": [
        {
            "label": "AI handles",
            "owner": "ai",
            "text": "Interpreting intent, asking for clarification, requesting planning tools, and explaining trade-offs using their results."
        },
        {
            "label": "Software handles",
            "owner": "software",
            "text": "Argument validation, financial calculations, scenario comparisons, draft state, approval checks, and persistence."
        },
        {
            "label": "Human controls",
            "owner": "human",
            "text": "Goals, corrections, priorities, and final approval. Tool calls produce proposals; the user decides what becomes part of the saved plan."
        }
    ],
    "decisions": [
        [
            "Connect conversation to actions",
            "Five tools let the model read context, propose updates, calculate a plan, compare scenarios, and prepare review. Application results return to the model to inform its next response."
        ],
        [
            "Validate and allow bounded repair",
            "Invalid arguments return feedback so the model can correct them within explicit limits. Unsupported tools are rejected, required steps are enforced, and requests have a timeout."
        ],
        [
            "Keep the plan editable across turns",
            "Users can revise goals, contributions, deadlines, and scheduled bill changes without restarting. For example, a future rent increase affects eligible future bills while retaining the current bill and existing goals."
        ],
        [
            "Separate financial figures from model prose",
            "Application-rendered cards supply calculated amounts and projected dates. The conversation path replaces model prose containing digits, dollar signs, or specified consequential phrases with a neutral follow-up."
        ],
        [
            "Make failure and approval explicit",
            "If the conversation service is unavailable, it reports the failure and preserves the draft. Deterministic calculations remain separate from AI availability; saved plan changes still require user approval."
        ],
        [
            "Evaluate behavior, then refine the workflow",
            "Automated checks cover rules and failure handling. An earlier live-model evaluation exposed interpretation and missing-tool failures; tool descriptions and required-step enforcement were refined before the final 18-case rerun passed."
        ]
    ],
    "proves": [
        "Translating a user need into a complete AI-assisted workflow",
        "Connecting model tool calls to validated application logic",
        "Designing corrections and review steps that keep users in control",
        "Handling ambiguity and service failures without losing the draft",
        "Using evaluation failures to improve the implementation",
        "Distinguishing demonstrated capability from production readiness"
    ],
    "panels": {
        "flow": {
            "title": "From conversation to a reviewable decision",
            "intro": "The model can request application actions and use their results. Tools never independently commit the financial plan.",
            "items": [
                [
                    "01",
                    "read_context",
                    "Read the financial context and its confirmation status. Imported records are data, not instructions."
                ],
                [
                    "02",
                    "propose_update",
                    "Submit a candidate draft for validation and receive engine-calculated proposal results."
                ],
                [
                    "03",
                    "calculate_plan",
                    "Calculate the current candidate with the deterministic financial engine."
                ],
                [
                    "04",
                    "compare_scenarios",
                    "Compare the previous draft with the candidate, including allocations and projected goal dates."
                ],
                [
                    "05",
                    "prepare_review",
                    "Prepare calculated proposal information for review. The user still confirms the details and approves in the interface."
                ]
            ]
        },
        "safety": {
            "title": "Controls around model actions",
            "intro": "Validation, calculation, and approval are application responsibilities. These controls bound model behavior without treating every model response as reliable.",
            "items": [
                [
                    "Bounded repair",
                    "Rejected arguments return validation feedback. The tool loop allows up to four rounds and six tool attempts, with a 40-second provider-loop timeout."
                ],
                [
                    "Required tool steps",
                    "Every turn requires a successful proposed update; the trade-off stage also requires scenario comparison. Unsupported tools are rejected."
                ],
                [
                    "Figures come from the application",
                    "The conversation path filters digits, dollar signs, and specified claims from model-written prose. Calculated cards supply financial figures; this targeted filter is not a universal factual guarantee."
                ],
                [
                    "Conversation failure",
                    "AI unavailability is reported and the draft is preserved. The endpoint does not promise a replacement conversational answer; calculation availability is a separate concern."
                ],
                [
                    "Untrusted imported text",
                    "Merchant names, notes, and other imported records are treated as data. The earlier live evaluation includes a case testing embedded instructions."
                ],
                [
                    "Approval before saving",
                    "Model proposals update the planning draft. The user must approve the reviewed plan before it changes the saved plan."
                ]
            ]
        },
        "evals": {
            "title": "Dated evidence, with clear limits",
            "intro": "On September 6, 2026, commit e627472 passed 255/255 automated tests. The separate live-model result below is from an earlier build, not a fresh evaluation of this release.",
            "metric": "255 / 255 automated tests passed",
            "items": [
                [
                    "Current automated suite · Sep 6, 2026",
                    "255 passed, zero failed. Coverage includes financial rules, conversation state, scheduled bill corrections, approval behavior, and mocked-provider protocol failures."
                ],
                [
                    "Earlier live-model evaluation · Sep 5, 2026",
                    "18/18 cases passed using gpt-5.6-sol against application commit dfbdddf. This is distinct from the automated suite and has not been rerun for e627472."
                ],
                [
                    "Real conversation cases",
                    "The live suite covered corrections, ambiguity, competing priorities, purchase questions, deadline changes, and untrusted imported text."
                ],
                [
                    "Failures informed the design",
                    "Earlier runs exposed misclassified goals, missing comparisons, and unsupported draft changes. Validation feedback, tool descriptions, and required tool steps were refined before the final successful rerun."
                ],
                [
                    "Evaluation limits",
                    "A small synthetic functional suite demonstrates specific behavior. It is not a statistical accuracy estimate, a comprehensive security benchmark, or evidence of customer adoption."
                ],
                [
                    "Demonstration scope",
                    "Opening account analysis uses deterministic sample-data processing. Real bank integration and receipt reading are not presented here as verified live capabilities."
                ]
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
              {study.stats.map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong><span>{label}</span>
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
