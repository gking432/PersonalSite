import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './CrmCaseStudy.css'

// ─────────────────────────────────────────────────────────────────────────────
// NOTE (Gunnar): the two tables below describe how the demo is designed to
// behave. Check every row against what the build actually does before this goes
// to production. A row that overstates the demo costs more credibility here than
// a missing row would, because the whole point of this page is disciplined
// claims. Where the demo does not yet implement a behaviour, either cut the row
// or move it into "How I would build this for a real business".
// ─────────────────────────────────────────────────────────────────────────────

const ndsEase = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

// The workflow, in order. `owner` drives the color coding and the legend.
const workflow = [
  { step: 'Inbound call', owner: 'ai' },
  { step: 'Intake conversation', owner: 'ai' },
  { step: 'Detail capture', owner: 'mixed' },
  { step: 'Job classification', owner: 'ai' },
  { step: 'CRM record', owner: 'software' },
  { step: 'Technician assignment', owner: 'software' },
  { step: 'Quote preparation', owner: 'human' },
  { step: 'Follow-up draft', owner: 'mixed' },
  { step: 'Scheduling', owner: 'software' },
  { step: 'Customer message', owner: 'human' },
  { step: 'Review request', owner: 'mixed' }
]

const ownerLabels = {
  ai: 'AI',
  software: 'Software',
  human: 'Human',
  mixed: 'AI, then human'
}

const decisions = [
  {
    step: 'Answer the inbound call',
    owner: 'ai',
    why: 'Open-ended conversation. A phone tree cannot handle "my water heater is leaking and I have a dog in the yard."'
  },
  {
    step: 'Capture name, address, and phone',
    owner: 'mixed',
    why: 'A language model extracts the details. A deterministic lookup validates the address before the workflow uses it.'
  },
  {
    step: 'Classify job type and urgency',
    owner: 'ai',
    why: 'AI can interpret an unstructured description and map it to a defined job type and urgency level.'
  },
  {
    step: 'Assign a technician',
    owner: 'software',
    why: 'Deterministic rules handle skills, geography, and availability with clear, explainable results.'
  },
  {
    step: 'Set the price on a quote',
    owner: 'human',
    why: 'Pricing carries liability. The system assembles line items, and a person sets and owns the final number.'
  },
  {
    step: 'Draft the follow-up message',
    owner: 'mixed',
    why: 'Drafting saves real time. Sending is consequential, so the draft waits for approval before it reaches anyone.'
  },
  {
    step: 'Book the appointment',
    owner: 'software',
    why: 'Ordinary scheduling logic handles calendar conflicts accurately and consistently.'
  },
  {
    step: 'Flag a review for a response',
    owner: 'mixed',
    why: 'AI can flag the review type, while a person approves any public response.'
  }
]

const failures = [
  {
    failure: 'The address is unclear or misheard',
    detection: 'Validation lookup fails',
    behaviour: 'Asks once more, then records the lead as address unconfirmed and sends it to a person',
    surfaced: 'Office manager, before dispatch'
  },
  {
    failure: 'Low-confidence job classification',
    detection: 'Confidence below threshold',
    behaviour: 'Creates the lead and routes it to human triage for assignment',
    surfaced: 'Triage queue'
  },
  {
    failure: 'Calendar service is unavailable',
    detection: 'Booking call returns an error',
    behaviour: 'Says it cannot confirm a time, takes the request, and promises a callback. Never invents a slot',
    surfaced: 'Lead flagged needs scheduling'
  },
  {
    failure: 'Request falls outside supported scope',
    detection: 'Intent classified as unsupported',
    behaviour: 'Stops trying to solve it and offers a callback from a person',
    surfaced: 'Escalation queue'
  },
  {
    failure: 'Caller is angry or threatening to cancel',
    detection: 'Sentiment flag on the transcript',
    behaviour: 'No automated message is sent at all. The workflow stops and hands the whole thing over',
    surfaced: 'Owner, directly'
  }
]

const pilot = [
  {
    phase: 'Days 1–30',
    title: 'Understand and measure',
    detail: 'Sit with whoever answers the phone. Map the real path from call to booked job, including the parts that only exist in someone’s head. Measure the baseline before touching anything: missed calls, time to first response, how often intake is incomplete.',
    gate: 'A baseline everyone agrees is accurate'
  },
  {
    phase: 'Days 31–60',
    title: 'One narrow use case',
    detail: 'After-hours missed calls only. Every AI output is reviewed by a person before it reaches a customer. Keeping the scope narrow makes it easier to compare the pilot against the existing process.',
    gate: 'Review shows the extraction is trustworthy and staff are not working around it'
  },
  {
    phase: 'Days 61–90',
    title: 'Extend or stop',
    detail: 'Extend to business-hours overflow. Loosen approval on the single lowest-risk step and nothing else. Train the full team with hands-on sessions. Re-measure against the baseline.',
    gate: 'Metrics moved and staff would object if you removed it; expand, adjust, or stop'
  }
]

const metrics = [
  { metric: 'Missed-call recovery rate', baseline: 'Phone log, 30 days prior', decision: 'The core value case. If this does not move, stop the project' },
  { metric: 'Time to first response', baseline: 'Lead created → first contact timestamp', decision: 'Whether speed is genuinely improving or just moving somewhere else' },
  { metric: 'Intake completeness', baseline: 'Share of leads with every required field', decision: 'Whether AI intake captures the required information more consistently' },
  { metric: 'Edit rate on AI drafts', baseline: 'Share of drafts changed before sending', decision: 'Quality signal. High and staying high means the drafts are not earning their place' },
  { metric: 'Escalation rate', baseline: 'Share of calls handed to a person', decision: 'Scope signal. Tells you where the real boundary sits' },
  { metric: 'Staff adoption and confidence', baseline: 'Structured staff interviews before launch and at day 90', decision: 'Whether the workflow fits how the team actually works or needs to change' }
]

function Section({ id, kicker, heading, intro, children, assistantSection }) {
  return (
    <section className="cs-section" id={id} data-assistant-section={assistantSection}>
      <div className="container">
        <motion.div
          className="cs-section__head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          {kicker && <motion.p className="cs-kicker" variants={fadeUp}>{kicker}</motion.p>}
          <motion.h2 variants={fadeUp}>{heading}</motion.h2>
          {intro && <motion.p className="cs-intro" variants={fadeUp}>{intro}</motion.p>}
        </motion.div>
        {children}
      </div>
    </section>
  )
}

function CrmCaseStudy() {
  return (
    <PageTransition>
      <div className="case-study" data-assistant-section="crm-case-overview">

        {/* ═══════ HERO ═══════ */}
        <section className="cs-hero">
          <div className="container">
            <motion.p
              className="cs-eyebrow"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: ndsEase }}
            >
              Case study · AI implementation
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: ndsEase }}
            >
              Putting AI inside a home-services workflow
            </motion.h1>
            <motion.p
              className="cs-standfirst"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.25, ease: ndsEase }}
            >
              A working AI-enhanced CRM demonstration showing what AI handles, what
              ordinary software handles, where people keep control, and how I would
              evaluate the result.
            </motion.p>

            {/* The honesty banner. First thing anyone reads. */}
            <motion.aside
              className="cs-disclosure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: ndsEase }}
            >
              <span className="cs-disclosure__tag">What this is</span>
              <p>
                <strong>A self-directed functional demonstration built with fictional
                data.</strong> It shows how AI, software, and human review can work
                together across a home-services customer workflow.
              </p>
            </motion.aside>

            <motion.div
              className="cs-hero__actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: ndsEase }}
            >
              <a
                className="btn btn-primary"
                href="https://new-teal-delta.vercel.app/app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the demo ↗
              </a>
              <Link className="btn btn-secondary" to="/projects">All projects</Link>
            </motion.div>
          </div>
        </section>

        {/* ═══════ THE PROBLEM ═══════ */}
        <Section
          id="problem"
          assistantSection="crm-case-problem"
          kicker="The problem"
          heading="A missed call can become a lost job."
        >
          <motion.div
            className="cs-prose"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeUp}>
              A small home-services business runs on the phone. The people best
              equipped to answer it are the people who are under a sink, on a roof, or
              driving between jobs. So calls go to voicemail, and a homeowner with a
              leak calls the next company on the list.
            </motion.p>
            <motion.p variants={fadeUp}>
              The knock-on problems all come from the same place. Intake is
              inconsistent, because whoever picks up asks whatever they remember to
              ask. Follow-up is slow, because it depends on someone finding time at the
              end of a long day. Quotes take days for jobs that were quoted in someone’s
              head on the drive home. Review requests get sent when someone remembers.
            </motion.p>
            <motion.p variants={fadeUp}>
              Limited capacity creates inconsistent data and slow follow-up. The workflow
              design follows from choosing the appropriate role for AI, ordinary software,
              and human judgment at each step.
            </motion.p>
          </motion.div>
        </Section>

        {/* ═══════ WORKFLOW ═══════ */}
        <Section
          id="workflow"
          assistantSection="crm-case-workflow"
          kicker="The workflow"
          heading="One path, from ringing phone to review request."
          intro="Color shows who owns each step. Gray marks deterministic software, green marks AI, and gold marks human review."
        >
          <motion.div
            className="cs-flow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {workflow.map((node) => (
              <motion.div className={`cs-node is-${node.owner}`} key={node.step} variants={fadeUp}>
                <span className="cs-node__owner">{ownerLabels[node.owner]}</span>
                <span className="cs-node__step">{node.step}</span>
              </motion.div>
            ))}
          </motion.div>
          <div className="cs-legend">
            <span className="cs-legend__item is-ai">AI</span>
            <span className="cs-legend__item is-software">Ordinary software</span>
            <span className="cs-legend__item is-human">Human decision</span>
            <span className="cs-legend__item is-mixed">AI drafts, human approves</span>
          </div>
        </Section>

        {/* ═══════ DECISION TABLE ═══════ */}
        <SqueezeSection className="cs-band">
          <div className="container">
            <div className="cs-section__head">
              <p className="cs-kicker">The decisions</p>
              <h2>How each step is implemented.</h2>
              <p className="cs-intro">
                Some steps use ordinary software even though AI could handle them.
                Those choices matter as much as the AI features.
              </p>
            </div>
            <div className="cs-table-scroll">
              <table className="cs-table">
                <thead>
                  <tr>
                    <th scope="col">Step</th>
                    <th scope="col">Handled by</th>
                    <th scope="col">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((row) => (
                    <tr key={row.step}>
                      <th scope="row">{row.step}</th>
                      <td><span className={`cs-owner is-${row.owner}`}>{ownerLabels[row.owner]}</span></td>
                      <td>{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SqueezeSection>

        {/* ═══════ FAILURE MODES ═══════ */}
        <Section
          id="failures"
          assistantSection="crm-case-failures"
          kicker="When it goes wrong"
          heading="Important failure paths need a defined response."
          intro="These examples show how a production implementation should detect problems, stop safely, and route work to a person."
        >
          <div className="cs-table-scroll">
            <table className="cs-table">
              <thead>
                <tr>
                  <th scope="col">Failure scenario</th>
                  <th scope="col">Detection rule</th>
                  <th scope="col">Expected response</th>
                  <th scope="col">Human owner</th>
                </tr>
              </thead>
              <tbody>
                {failures.map((row) => (
                  <tr key={row.failure}>
                    <th scope="row">{row.failure}</th>
                    <td>{row.detection}</td>
                    <td>{row.behaviour}</td>
                    <td className="cs-cell-quiet">{row.surfaced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cs-footnote">
            When confidence drops, the system routes the work to a person. Confidence
            directly controls the next step in the workflow.
          </p>
        </Section>

        {/* ═══════ PILOT ═══════ */}
        <Section
          id="pilot"
          assistantSection="crm-case-pilot"
          kicker="Rollout"
          heading="How I would put this into a real business."
          intro="For a small home-services team, I would start with one narrow use case and expand only after the workflow proves useful."
        >
          <motion.div
            className="cs-phases"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {pilot.map((phase) => (
              <motion.article className="cs-phase" key={phase.phase} variants={fadeUp}>
                <span className="cs-phase__when">{phase.phase}</span>
                <h3>{phase.title}</h3>
                <p>{phase.detail}</p>
                <div className="cs-phase__gate">
                  <span>Gate to continue</span>
                  <p>{phase.gate}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        {/* ═══════ METRICS ═══════ */}
        <Section
          id="measurement"
          assistantSection="crm-case-measurement"
          kicker="Measurement"
          heading="What I would measure, and what each number would decide."
          intro="These are proposed measures. The demonstration has no operating business or baseline, so there are no measured results."
        >
          <div className="cs-table-scroll">
            <table className="cs-table">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">How you’d baseline it</th>
                  <th scope="col">The decision it drives</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((row) => (
                  <tr key={row.metric}>
                    <th scope="row">{row.metric}</th>
                    <td className="cs-cell-quiet">{row.baseline}</td>
                    <td>{row.decision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ═══════ LIMITS ═══════ */}
        <SqueezeSection className="cs-limits">
          <div className="container">
            <motion.div
              className="cs-limits__inner"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={staggerContainer}
            >
              <motion.p className="cs-kicker" variants={fadeUp}>Limits</motion.p>
              <motion.h2 variants={fadeUp}>Current limits.</motion.h2>
              <motion.p variants={fadeUp}>
                This demonstration uses fictional data. It does not include real customers,
                live call volume, production schedules, measured results, or a security review.
              </motion.p>
              <motion.p variants={fadeUp}>
                This demonstration tests the workflow and implementation choices. It does
                not prove team adoption inside an established process.
              </motion.p>
              <motion.div className="cs-limits__actions" variants={fadeUp}>
                <Link className="btn btn-primary" to="/contact">Get in touch</Link>
                <Link className="btn btn-secondary" to="/about">How I work</Link>
              </motion.div>
            </motion.div>
          </div>
        </SqueezeSection>

      </div>
    </PageTransition>
  )
}

export default CrmCaseStudy
