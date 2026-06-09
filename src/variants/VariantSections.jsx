import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  approachPrinciples,
  resumeHighlights,
  resumeTimeline,
  cta
} from '../data/homeContent'

const ease = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease, delay: i * 0.1 }
  })
}

// Themed by the parent .variant class; the same content, restyled per direction.
function VariantSections() {
  return (
    <div className="v-sections">
      {/* APPROACH */}
      <section className="v-section v-approach">
        <div className="v-container">
          <motion.span
            className="v-eyebrow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Approach
          </motion.span>
          <motion.h2
            className="v-approach__statement"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            I help ideas survive contact with customers, markets, and the build itself.
          </motion.h2>
          <div className="v-approach__grid">
            {approachPrinciples.map((item, i) => (
              <motion.div
                className="v-approach__item"
                key={item.number}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <span className="v-approach__num">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="v-section v-highlights">
        <div className="v-container">
          <motion.span
            className="v-eyebrow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            What I bring
          </motion.span>
          <div className="v-highlights__grid">
            {resumeHighlights.map((item, i) => (
              <motion.div
                className="v-highlight"
                key={item.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <span className="v-highlight__value">{item.value}</span>
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="v-section v-timeline">
        <div className="v-container">
          <motion.span
            className="v-eyebrow"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Experience
          </motion.span>
          <div className="v-timeline__list">
            {resumeTimeline.map((item, i) => (
              <motion.div
                className="v-timeline__item"
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-12%' }}
                variants={fadeUp}
              >
                <div className="v-timeline__meta">
                  <span className="v-timeline__year">{item.year}</span>
                  <span className="v-timeline__loc">{item.location}</span>
                </div>
                <div className="v-timeline__body">
                  <h3>{item.title}</h3>
                  <span className="v-timeline__role">{item.role}</span>
                  <p>{item.desc}</p>
                  <div className="v-timeline__tags">
                    {item.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="v-section v-cta">
        <div className="v-container">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {cta.heading}
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {cta.body}
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <Link to="/contact" className="v-btn v-btn-primary">
              Get in touch <span aria-hidden="true">&rarr;</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default VariantSections
