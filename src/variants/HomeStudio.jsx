import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  identity,
  approachPrinciples,
  resumeTimeline,
  cta
} from '../data/homeContent'
import SqueezeSection from '../components/SqueezeSection'
import TrafficCity from '../features/traffic/TrafficCity'
import './HomeStudio.css'

const ease = [0.22, 1, 0.36, 1]

// The three phases of the work, in the order they happen. This replaced a
// numeric stat strip ("4 functional builds") that invited the wrong question.
const capabilityPhases = [
  {
    title: 'Find the workflow',
    detail: 'Discovery, process mapping, and the people doing the job'
  },
  {
    title: 'Decide what AI should touch',
    detail: 'And what stays deterministic, and what stays human'
  },
  {
    title: 'Build it and get it used',
    detail: 'Working systems, narrow pilots, training, adoption'
  }
]

// The rubric, stated as criteria rather than principles so a reader can apply
// it to their own workflow while scanning. Previews the CRM decision table.
const decisionRubric = [
  {
    when: 'Use AI when',
    detail: 'the input is unstructured, interpretation matters, or several different outputs would all be reasonable.'
  },
  {
    when: 'Use ordinary software when',
    detail: 'the rules are already known, the output has to be exact, or permissions, transactions, and records are involved.'
  },
  {
    when: 'Keep a person in it when',
    detail: "the consequences are significant, confidence is low, or the context can't be reliably verified."
  }
]

const featuredSystems = [
  {
    number: '01',
    type: 'Business workflow system',
    title: 'Home-Services AI CRM',
    description: 'A functional command center connecting lead analysis, call summaries, follow-up, quotes, appointments, reviews, and human approval.',
    image: '/images/project-northstar.png',
    imageAlt: 'Home-services CRM dashboard with lead pipeline, tasks, AI insights, and business metrics',
    caseStudy: '/projects/home-services-crm',
    caseStudyAction: 'Read the case study',
    href: 'https://crmdemo.gunnarneuman.com/',
    action: 'Open the demo',
    tags: ['AI workflows', 'Operational system', 'Human approval']
  },
  {
    number: '02',
    type: 'Functional AI demo',
    title: 'PrepMe',
    description: 'An AI interview workflow that connects candidate context, live conversation, evidence-linked feedback, and targeted workshops with preserved practice progress.',
    image: '/images/project-prepme.png',
    imageAlt: 'PrepMe interview platform dashboard and setup workflow',
    href: 'https://prepme.gunnarneuman.com/',
    action: 'Open the demo',
    tags: ['Personalized AI', 'Product workflow', 'Functional demo']
  },
  {
    number: '03',
    type: 'Functional AI demonstration',
    title: 'Steward',
    description: 'An AI planning workflow that turns goals and corrections into reviewable decisions, with validated tools, deterministic calculations, and human approval.',
    image: '/images/project-steward.jpg',
    imageAlt: 'Steward financial planning demonstration showing imported account analysis and planning insights',
    href: 'https://steward.gunnarneuman.com/demo',
    action: 'Open the demo',
    tags: ['AI tool calling', 'Human approval', 'Workflow evaluation']
  }
]

const flagshipSystem = featuredSystems[0]
const supportingSystems = featuredSystems.slice(1)

function HomeStudio() {
  return (
    <div className="studio">
      {/* ─── HERO ─── */}
      <section className="studio-hero" data-assistant-section="home-overview">
        <div className="studio-hero__copy">
          <motion.span className="studio-status"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}>
            <i /> Open to AI implementation roles
          </motion.span>

          <motion.h1 className="studio-headline"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}>
            <span className="studio-headline__wide">
              <span>I turn business problems</span>
              <span>into working systems.</span>
            </span>
            <span className="studio-headline__narrow">
              <span>I turn business</span>
              <span>problems into</span>
              <span>working systems.</span>
            </span>
          </motion.h1>

          <motion.p className="studio-sub"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.35 }}>
            My background is in customers, sales teams, product launches, and client
            problems. Today I pair that business experience with hands-on product
            development to build working systems, often with AI at the center.
          </motion.p>

          <motion.div className="studio-hero__actions"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}>
            <Link to="/projects/home-services-crm" className="studio-btn studio-btn--primary">Read the CRM case study</Link>
            <Link to="/projects" className="studio-btn studio-btn--ghost">All projects</Link>
          </motion.div>
        </div>

        <motion.div className="studio-hero__city"
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease, delay: 0.3 }}>
          <TrafficCity />
        </motion.div>
      </section>

      {/* ─── WHAT THE WORK IS ─── */}
      <section className="studio-proof studio-proof--phases">
        {capabilityPhases.map((phase) => (
          <div className="studio-proof__item" key={phase.title}>
            <span className="studio-proof__value">{phase.title}</span>
            <span className="studio-proof__label">{phase.detail}</span>
          </div>
        ))}
      </section>

      {/* ─── APPROACH (tinted squeeze panel) ─── */}
      <section className="studio-band studio-approach" data-assistant-section="home-approach">
        <SqueezeSection className="studio-panel studio-panel--tint">
          <div className="studio-panel__inner">
            <div className="studio-section__head">
              <span className="studio-kicker">Approach</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                I understand the business problem, shape the workflow, and build enough of the solution to prove it.
              </motion.h2>
            </div>
            <div className="studio-approach__grid">
              {approachPrinciples.map((item, i) => (
                <motion.div className="studio-card" key={item.number}
                  initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: i * 0.1 }}>
                  <span className="studio-card__num">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </SqueezeSection>
      </section>

      {/* ─── DECISION RUBRIC ─── */}
      {/* Criteria, not principles: a reader can hold these against a workflow in
          their own company while scanning. */}
      <section className="studio-section studio-rubric" data-assistant-section="home-rubric">
        <div className="studio-section__head">
          <span className="studio-kicker">Judgment</span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
            How I decide what a system should do.
          </motion.h2>
        </div>
        <div className="studio-rubric__grid">
          {decisionRubric.map((rule, i) => (
            <motion.div className="studio-rubric__rule" key={rule.when}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: i * 0.1 }}>
              <h3>{rule.when}</h3>
              <p>{rule.detail}</p>
            </motion.div>
          ))}
        </div>
        <motion.p className="studio-rubric__close"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: 0.3 }}>
          Adoption decides whether any of it mattered:{' '}
          <strong>a system nobody adopts didn&rsquo;t work.</strong> The hardest problem
          is often earning trust from someone whose spreadsheet already works for them.
        </motion.p>
      </section>

      {/* ─── WORKING PROOF (calm bridge between the two system panels) ─── */}
      <section className="studio-work" data-assistant-section="home-projects">
        <div className="studio-work__head">
          <div>
            <span className="studio-kicker">Working proof</span>
            <motion.h2
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
              You can use the systems yourself.
            </motion.h2>
          </div>
          <p>These are self-directed builds, presented honestly. They show how I turn an AI capability into a complete workflow with an interface, decisions, and a useful outcome.</p>
        </div>

        <motion.article className="studio-work__feature"
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.75, ease }}>
          <Link className="studio-work__feature-visual" to={flagshipSystem.caseStudy} aria-label={flagshipSystem.caseStudyAction}>
            <img src={flagshipSystem.image} alt={flagshipSystem.imageAlt} loading="lazy" />
          </Link>
          <div className="studio-work__feature-copy">
            <span className="studio-system__type">Flagship case study</span>
            <h3>{flagshipSystem.title}</h3>
            <p>A working AI system across an end-to-end customer workflow.</p>
            <div className="studio-work__case-points">
              <div><span>Workflow</span><p>Lead to follow-up</p></div>
              <div><span>AI role</span><p>Analyze and recommend</p></div>
              <div><span>Control</span><p>Human approval</p></div>
            </div>
            <div className="studio-system__actions">
              <Link className="studio-system__link" to={flagshipSystem.caseStudy}>Case study <span>→</span></Link>
              <a className="studio-system__link studio-system__link--muted" href={flagshipSystem.href} target="_blank" rel="noreferrer">Live demo <span>↗</span></a>
            </div>
          </div>
        </motion.article>

        <div className="studio-work__support-head">
          <span>Other AI builds</span>
          <p>Smaller products that demonstrate focused AI workflows.</p>
        </div>
        <div className="studio-work__supporting">
          {supportingSystems.map((project, index) => (
            <motion.article className="studio-system-compact" key={project.title}
              initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }} transition={{ duration: 0.65, ease, delay: index * 0.08 }}>
              <a className="studio-system-compact__visual" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.action} in a new tab`}>
                <img src={project.image} alt={project.imageAlt} loading="lazy" />
              </a>
              <div className="studio-system-compact__copy">
                <span className="studio-system__type">{project.type}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a className="studio-system__link" href={project.href} target="_blank" rel="noreferrer">{project.action} <span>↗</span></a>
              </div>
            </motion.article>
          ))}
        </div>

        <Link className="studio-work__all" to="/projects">See all projects <span>→</span></Link>
      </section>

      {/* ─── EXPERIENCE (tinted squeeze panel) ─── */}
      <section className="studio-band" data-assistant-section="home-experience">
        <SqueezeSection className="studio-panel studio-panel--tint">
          <div className="studio-panel__inner">
            <div className="studio-section__head">
              <span className="studio-kicker">Experience</span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
                Business experience first. Technical capability added on top.
              </motion.h2>
            </div>
            <div className="studio-exp__list">
              {resumeTimeline.map((item) => (
                <motion.article className="studio-exp" key={item.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease }}>
                  <div className="studio-exp__meta">
                    <span className="studio-exp__year">{item.year}</span>
                    <span className="studio-exp__loc">{item.location}</span>
                  </div>
                  <div className="studio-exp__body">
                    <h3>{item.title}</h3>
                    <span className="studio-exp__role">{item.role}</span>
                    <p>{item.desc}</p>
                    <div className="studio-tags">
                      {item.tags.map((tg) => <span key={tg}>{tg}</span>)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </SqueezeSection>
      </section>

      {/* ─── CTA (plain, parchment; the page resolves calm) ─── */}
      <section className="studio-section studio-cta">
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          {cta.heading}
        </motion.h2>
        <p>{cta.body}</p>
        <Link to="/contact" className="studio-btn studio-btn--lg studio-btn--primary">Get in touch &rarr;</Link>
      </section>

    </div>
  )
}

export default HomeStudio
