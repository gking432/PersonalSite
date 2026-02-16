import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import './Writing.css'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

function Writing() {
  return (
    <PageTransition>
    <div className="writing">
      <section className="writing-hero section">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Thoughts on Marketing, AI, and Building
          </motion.h1>
          <motion.p
            className="writing-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            I write about whatever I'm curious about—usually at the intersection of technology and human behavior.
          </motion.p>
        </div>
      </section>

      {/* Substack Integration */}
      <motion.section
        className="substack-section section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container">
          <div className="substack-content">
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
          </div>
        </div>
      </motion.section>

      {/* Recent Articles Placeholder */}
      <section className="articles-section section alt">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Recent Articles
          </motion.h2>
          <motion.div
            className="articles-list"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Categories */}
      <section className="categories-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
      </section>
    </div>
    </PageTransition>
  )
}

export default Writing
