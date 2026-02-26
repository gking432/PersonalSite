import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Writing.css'

const ndsEase = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ndsEase } }
}

function Writing() {
  return (
    <PageTransition>
    <div className="writing">
      <section className="writing-hero section">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Writing
          </motion.p>
          <h1>
            {'Thoughts on Marketing, AI, and Building'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: ndsEase }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="writing-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
          >
            I write about whatever I'm curious about—usually at the intersection of technology and human behavior.
          </motion.p>
        </div>
      </section>

      {/* Substack Integration — Squeezed */}
      <SqueezeSection className="substack-section section">
        <div className="container">
          <motion.div
            className="substack-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>Read on Substack</motion.h2>
            <motion.p className="substack-description" variants={fadeUp}>
              All my writing is published on Substack. Subscribe to get new articles delivered to your inbox.
            </motion.p>
            <motion.div className="substack-cta" variants={fadeUp}>
              <a
                href="https://substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Subscribe on Substack
              </a>
            </motion.div>
          </motion.div>
        </div>
      </SqueezeSection>

      {/* Recent Articles */}
      <section className="articles-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            Recent Articles
          </motion.h2>
          <motion.div
            className="articles-list"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            <div className="article-card">
              <div className="article-meta">
                <span className="article-date">Coming Soon</span>
              </div>
              <h3>Latest Article Title</h3>
              <p className="article-excerpt">
                Check back soon for articles on marketing strategy, AI applications, building products, and business observations.
              </p>
              <a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="article-link">
                Read on Substack →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories — Squeezed */}
      <SqueezeSection className="categories-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            Topics I Write About
          </motion.h2>
          <motion.div
            className="categories-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div className="category-card" variants={staggerItem}>
              <h3>AI & Technology</h3>
              <p>Practical insights on how AI is changing the way we work and live</p>
            </motion.div>
            <motion.div className="category-card" variants={staggerItem}>
              <h3>Marketing Strategy</h3>
              <p>Thoughts on customer acquisition, branding, and campaign execution</p>
            </motion.div>
            <motion.div className="category-card" variants={staggerItem}>
              <h3>Building & Shipping</h3>
              <p>Lessons learned from building products and turning ideas into reality</p>
            </motion.div>
            <motion.div className="category-card" variants={staggerItem}>
              <h3>Business Observations</h3>
              <p>Observations on business, strategy, and the intersection of technology and commerce</p>
            </motion.div>
          </motion.div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Writing
