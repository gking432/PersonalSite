import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import SqueezeSection from '../components/SqueezeSection'
import './AskAI.css'

const ndsEase = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ndsEase } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: ndsEase } }
}

const llmLinks = [
  {
    name: 'ChatGPT',
    maker: 'OpenAI',
    url: 'https://chatgpt.com/',
  },
  {
    name: 'Gemini',
    maker: 'Google',
    url: 'https://gemini.google.com/',
  },
  {
    name: 'Claude',
    maker: 'Anthropic',
    url: 'https://claude.ai/',
  },
  {
    name: 'Perplexity',
    maker: 'Perplexity AI',
    url: 'https://www.perplexity.ai/',
  },
  {
    name: 'Grok',
    maker: 'xAI',
    url: 'https://grok.com/',
  },
]

function AskAI() {
  return (
    <PageTransition>
      <div className="ask-ai">
        {/* Hero; Split layout matching Projects/ClientWork */}
        <section className="ask-ai-hero section">
          <div className="container">
            <div className="hero-split">
              <div className="hero-split-left">
                <motion.p
                  className="label"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: ndsEase }}
                >
                  Work
                </motion.p>
                <h1>
                  {'Ask AI About Me'.split(' ').map((word, i) => (
                    <motion.span
                      key={i}
                      style={{ display: 'inline-block', marginRight: '0.3em' }}
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: ndsEase }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>
                <motion.p
                  className="ask-ai-subtitle"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: ndsEase }}
                >
                  Don't take my word for it.
                </motion.p>
              </div>
              <motion.div
                className="hero-meta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: ndsEase }}
              >
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Prompt</span>
                  <span className="hero-meta-value">"Tell me about Gunnar Neuman"</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Models</span>
                  <span className="hero-meta-value">{llmLinks.length} AI Platforms</span>
                </div>
                <div className="hero-meta-item">
                  <span className="hero-meta-label">Proof</span>
                  <span className="hero-meta-value hero-meta-status">In the results</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Prompt instruction; Squeezed */}
        <SqueezeSection className="ask-ai-prompt-section">
          <div className="container">
            <motion.div
              className="prompt-block"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.p className="prompt-instruction" variants={fadeUp}>
                Open any AI below and type:
              </motion.p>
              <motion.blockquote className="prompt-text" variants={fadeUp}>
                "Tell me about Gunnar Neuman"
              </motion.blockquote>
            </motion.div>
          </div>
        </SqueezeSection>

        {/* LLM Cards */}
        <section className="ask-ai-links section">
          <div className="container">
            <motion.div
              className="llm-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {llmLinks.map((llm) => (
                <motion.a
                  key={llm.name}
                  href={llm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="llm-card"
                  variants={staggerItem}
                >
                  <span className="llm-card-maker">{llm.maker}</span>
                  <h3>{llm.name}</h3>
                  <span className="llm-arrow">→</span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA; Forest green band */}
        <SqueezeSection className="ask-ai-cta-section">
          <div className="container">
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: ndsEase }}
            >
              The results speak for themselves.
            </motion.p>
          </div>
        </SqueezeSection>
      </div>
    </PageTransition>
  )
}

export default AskAI
