import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import writingPosts from '../data/writing-posts.json'
import './Writing.css'

// TODO: confirm this is the correct Substack publication URL.
const SUBSTACK_URL = 'https://gunnarneuman.substack.com'

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

const writingTopics = [
  { title: 'Customer Behavior', text: 'The moments where people decide, hesitate, trust, buy, abandon, and return.' },
  { title: 'Technology Adoption', text: 'What new tools actually change inside teams, markets, cost structures, and habits.' },
  { title: 'Product Judgment', text: 'How builders decide what to make before the work becomes expensive.' },
  { title: 'Go-To-Market', text: 'Positioning, acquisition, messaging, and proof from close to the work.' }
]

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
            {'Field Notes'.split(' ').map((word, i, words) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block' }}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: ndsEase }}
              >
                {word}{i < words.length - 1 ? '\u00a0' : ''}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="writing-subtitle"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
          >
            Notes on customer behavior, technology adoption, product judgment, and the uncomfortable stretch between idea and market.
          </motion.p>
        </div>
      </section>

      {/* Field Notes Thesis */}
      <SqueezeSection className="substack-section section">
        <div className="container">
          <motion.div
            className="substack-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>The writing has a job.</motion.h2>
            <motion.p className="substack-description" variants={fadeUp}>
              I write to sharpen ideas before they become products, talks, campaigns,
              or tools. The best notes make the pattern clearer and the next build
              more obvious.
            </motion.p>
          </motion.div>
        </div>
      </SqueezeSection>

      {/* Latest from Substack */}
      <section className="articles-section section">
        <div className="container">
          <motion.div
            className="articles-head"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ndsEase }}
          >
            <h2 className="section-title">Latest Notes</h2>
            <a
              className="articles-substack-link"
              href={SUBSTACK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              All posts on Substack →
            </a>
          </motion.div>

          {writingPosts.length > 0 ? (
            <motion.div
              className="articles-list"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              {writingPosts.map((post) => (
                <a
                  className="article-card"
                  key={post.url}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {post.dateLabel && (
                    <div className="article-meta">
                      <span className="article-date">{post.dateLabel}</span>
                    </div>
                  )}
                  <h3>{post.title}</h3>
                  {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
                  <span className="article-readmore">Read on Substack →</span>
                </a>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="articles-empty"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: ndsEase }}
            >
              <p className="articles-empty-title">The first field notes are publishing soon.</p>
              <p className="articles-empty-text">
                I'm writing about customer behavior, technology adoption, and product
                judgment — the gap between an idea and a market. Follow along and the
                posts will show up here as they go live.
              </p>
              <a
                className="btn btn-primary"
                href={SUBSTACK_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow on Substack →
              </a>
            </motion.div>
          )}
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
            Topics I Keep Coming Back To
          </motion.h2>
          <motion.div
            className="categories-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {writingTopics.map((topic) => (
              <motion.div className="category-card" key={topic.title} variants={staggerItem}>
                <h3>{topic.title}</h3>
                <p>{topic.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SqueezeSection>
    </div>
    </PageTransition>
  )
}

export default Writing
