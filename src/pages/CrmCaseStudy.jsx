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

// The workflow, in order. `owner` drives the colour coding and the legend.
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
    why: 'Extraction is a language problem; validation is not. The address is checked against a lookup rather than trusted from the transcript.'
  },
  {
    step: 'Classify job type and urgency',
    owner: 'ai',
    why: 'Judgment over a fuzzy description of a problem. This is what models are genuinely good at.'
  },
  {
    step: 'Assign a technician',
    owner: 'software',
    why: 'Not AI. Skills, geography, and availability are rules. A model would be less accurate and impossible to explain when it got it wrong.'
  },
  {
    step: 'Set the price on a quote',
    owner: 'human',
    why: 'Not AI. Pricing carries liability. The system can assemble line items; a person sets the number and owns it.'
  },
  {
    step: 'Draft the follow-up message',
    owner: 'mixed',
    why: 'Drafting saves real time. Sending is consequential, so the draft waits for approval before it reaches anyone.'
  },
  {
    step: 'Book the appointment',
    owner: 'software',
    why: 'Not AI. Calendar conflict resolution is a solved problem. There is no reason to hand a solved problem to a model.'
  },
  {
    step: 'Flag a review for a response',
    owner: 'mixed',
    why: 'Classification is cheap. The reply is public and reputational, and the volume is low enough that automating the send buys nothing.'
  }
]

const failures = [
  {
    failure: 'The address is unclear or misheard',
    detection: 'Validation lookup fails',
    behaviour: 'Asks once more, then records the lead as address unconfirmed rather than guessing',
    surfaced: 'Office manager, before dispatch'
  },
  {
    failure: 'Low-confidence job classification',
    detection: 'Confidence below threshold',
    behaviour: 'The lead is still created, but routed to human triage instead of automatic assignment',
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
    detail: 'After-hours missed calls only. Every AI output is reviewed by a person before it reaches a customer. Nothing else about the business changes, so anything that moves can be attributed.',
    gate: 'Review shows the extraction is trustworthy and staff are not working around it'
  },
  {
    phase: 'Days 61–90',
    title: 'Extend or stop',
    detail: 'Extend to business-hours overflow. Loosen approval on the single lowest-risk step and nothing else. Train the full team properly rather than sending a link. Re-measure against the baseline.',
    gate: 'Metrics moved and staff would object if you removed it — expand, adjust, or stop'
  }
]

const metrics = [
  { metric: 'Missed-call recovery rate', baseline: 'Phone log, 30 days prior', decision: 'The core value case. If this does not move, stop the project' },
  { metric: 'Time to first response', baseline: 'Lead created → first contact timestamp', decision: 'Whether speed is genuinely improving or just moving somewhere else' },
  { metric: 'Intake completeness', baseline: 'Share of leads with every required field', decision: 'Whether AI intake actually beats a person taking the call' },
  { metric: 'Edit rate on AI drafts', baseline: 'Share of drafts changed before sending', decision: 'Quality signal. High and staying high means the drafts are not earning their place' },
  { metric: 'Escalation rate', baseline: 'Share of calls handed to a person', decision: 'Scope signal. Tells you where the real boundary sits' },
  { metric: 'What the staff say at day 90', baseline: 'Ask them', decision: 'The adoption question. Everything else can look fine while this quietly fails' }
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
              A working demonstration of an AI-enhanced CRM, and the reasoning behind
              every decision in it: what the model handles, what stays ordinary
              software, where a person keeps control, and how I would find out whether
              any of it worked.
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
                <strong>A self-built demonstration.</strong> No client, no users, no
                production data, and no commercial results. I built it to work through
                how AI should sit inside a real operational workflow, and to have
                something concrete to argue about instead of a slide.
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
                Open the live demo ↗
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
          heading="A missed call is a lost job."
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
              leak does not leave a voicemail — they call the next company on the list.
            </motion.p>
            <motion.p variants={fadeUp}>
              The knock-on problems all come from the same place. Intake is
              inconsistent, because whoever picks up asks whatever they remember to
              ask. Follow-up is slow, because it depends on someone finding time at the
              end of a long day. Quotes take days for jobs that were quoted in someone’s
              head on the drive home. Review requests get sent when someone remembers.
            </motion.p>
            <motion.p variants={fadeUp}>
              None of that is a technology problem in origin. It is a capacity problem
              that shows up as a data problem. That distinction is what determines
              where AI belongs in the fix and where it does not.
            </motion.p>
          </motion.div>
        </Section>

        {/* ═══════ WORKFLOW ═══════ */}
        <Section
          id="workflow"
          assistantSection="crm-case-workflow"
          kicker="The workflow"
          heading="One path, from ringing phone to review request."
          intro="Colour shows who owns each step. The interesting parts of this diagram are the grey ones — the places where the answer was ordinary software."
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
              <h2>Where AI is used, and where it deliberately isn’t.</h2>
              <p className="cs-intro">
                Three of these steps could have used a model and don’t. Those are the
                rows I would want to be asked about.
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
          heading="Every step has a defined way to fail."
          intro="A demo that only shows the happy path has not been designed, it has been staged. These are the paths that matter in a real business, where the cost of a confident wrong answer lands on a customer."
        >
          <div className="cs-table-scroll">
            <table className="cs-table">
              <thead>
                <tr>
                  <th scope="col">What goes wrong</th>
                  <th scope="col">How it’s detected</th>
                  <th scope="col">What the system does</th>
                  <th scope="col">Who finds out</th>
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
            The common thread: when the system is unsure, it degrades to a person
            rather than guessing. Confidence is a routing input, not a display value.
          </p>
        </Section>

        {/* ═══════ PILOT ═══════ */}
        <Section
          id="pilot"
          assistantSection="crm-case-pilot"
          kicker="Rollout"
          heading="How I would put this into a real business."
          intro="This has not been deployed anywhere. If I were implementing it inside a twelve-person home-services company, this is the plan I would bring to the first meeting."
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
          intro="Proposed, not achieved. None of these have been measured, because there is no business behind the demo to measure them in."
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
              <motion.h2 variants={fadeUp}>What this doesn’t prove.</motion.h2>
              <motion.p variants={fadeUp}>
                It has never run against real customers, real call volume, or a real
                technician’s schedule. I have not measured whether AI intake beats a
                person answering the phone, because there is no baseline to measure it
                against. Nothing here has been through a security review, and no data
                in it belongs to anyone.
              </motion.p>
              <motion.p variants={fadeUp}>
                And the hardest part of this work is the part a demonstration cannot
                test: getting a team that already has a system to switch to a new one.
                I have done that before, with Power BI reporting at Sub-Zero, and it
                took far longer than building the thing did.
              </motion.p>
              <motion.p variants={fadeUp}>
                What this does show is the reasoning — what I would build, what I
                deliberately would not, where I would keep people in control, what I
                would do when it fails, and how I would find out whether it was working.
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
