import { motion } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import './AskAI.css'

const ndsEase = [0.22, 1, 0.36, 1]

const llmLinks = [
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    description: 'OpenAI',
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com/',
    description: 'Google',
  },
  {
    name: 'Claude',
    url: 'https://claude.ai/',
    description: 'Anthropic',
  },
  {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/',
    description: 'Perplexity AI',
  },
  {
    name: 'Grok',
    url: 'https://grok.com/',
    description: 'xAI',
  },
]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ndsEase } }
}

function AskAI() {
  return (
    <PageTransition>
      <div className="ask-ai">
        <section className="ask-ai-hero section">
          <div className="container">
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
              Open any of these and ask: "Tell me about Gunnar Neuman"
            </motion.p>
          </div>
        </section>

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
                  <h3>{llm.name}</h3>
                  <p>{llm.description}</p>
                  <span className="llm-arrow">→</span>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}

export default AskAI
