import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './Videos.css'

const ndsEase = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ndsEase } }
}

function Videos() {
  return (
    <PageTransition>
    <div className="videos">
      <section className="videos-hero section">
        <div className="container">
          <motion.p
            className="label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ndsEase }}
          >
            Videos
          </motion.p>
          <h1>
            {'Video Notes'.split(' ').map((word, i, words) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ndsEase }}
              >
                {word}{i < words.length - 1 ? '\u00a0' : ''}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="videos-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
          >
            Short video work will live here when the format is ready. For now, the writing and briefings carry the thinking.
          </motion.p>
        </div>
      </section>

      {/* YouTube Integration — Squeezed */}
      <SqueezeSection className="youtube-section section">
        <div className="container">
          <motion.div
            className="youtube-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>Video Channel Coming Soon</motion.h2>
            <motion.p className="youtube-description" variants={fadeUp}>
              I am holding this page until the videos are strong enough to deserve a place on the site.
            </motion.p>
            <motion.div className="youtube-cta" variants={fadeUp}>
              <a href="/writing" className="btn btn-primary">
                View Writing
              </a>
            </motion.div>
          </motion.div>
        </div>
      </SqueezeSection>

      {/* Featured Video */}
      <section className="featured-video-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            First Feature
          </motion.h2>
          <motion.div
            className="featured-video-container"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            <div className="video-placeholder">
              <div className="video-placeholder-content">
                <p>First video will appear here</p>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Coming Soon
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Grid — Squeezed */}
      <SqueezeSection className="videos-grid-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            Recent Videos
          </motion.h2>
          <motion.div
            className="videos-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[1, 2, 3, 4].map((num) => (
              <motion.div key={num} className="video-card" variants={staggerItem}>
                <div className="video-thumbnail">
                  <div className="thumbnail-content">Video {num}</div>
                </div>
                <div className="video-info">
                  <h3>Video Title {num}</h3>
                  <p className="video-meta">Coming Soon</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="view-channel-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              View Full Channel
            </a>
          </motion.div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Videos
