import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import './Videos.css'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

function Videos() {
  return (
    <PageTransition>
    <div className="videos">
      <section className="videos-hero section">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Video Essays & Explorations
          </motion.h1>
          <motion.p
            className="videos-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            One video per week on topics that fascinate me.
          </motion.p>
        </div>
      </section>

      {/* YouTube Integration */}
      <motion.section
        className="youtube-section section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container">
          <div className="youtube-content">
            <motion.h2 variants={fadeUp}>Watch on YouTube</motion.h2>
            <motion.p className="youtube-description" variants={fadeUp}>
              All my videos are published on YouTube. Subscribe to get notified when new videos are released.
            </motion.p>
            <motion.div className="youtube-cta" variants={fadeUp}>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Subscribe on YouTube
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Video */}
      <section className="featured-video-section section alt">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Latest Video
          </motion.h2>
          <motion.div
            className="featured-video-container"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="video-placeholder">
              <div className="video-placeholder-content">
                <p>Latest video will appear here</p>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  View on YouTube
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="videos-grid-section section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
      </section>
    </div>
    </PageTransition>
  )
}

export default Videos
