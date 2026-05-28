import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import GunnarNeumanProfile from './pages/GunnarNeumanProfile'
import PokerTablePage from './pages/PokerTablePage'

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
          <Route path="/ask-ai" element={<Navigate to="/about" replace />} />
          <Route path="/insights/gunnar-neuman-profile" element={<GunnarNeumanProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/poker" element={<PokerTablePage />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
