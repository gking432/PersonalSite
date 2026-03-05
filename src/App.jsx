import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Speaking from './pages/Speaking'
import Writing from './pages/Writing'
import Videos from './pages/Videos'
import Contact from './pages/Contact'
import ClientWork from './pages/ClientWork'

function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/client-work" element={<ClientWork />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
