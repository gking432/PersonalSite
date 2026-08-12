import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Layout from './components/Layout'
import About from './pages/About'
import Projects from './pages/Projects'
import Writing from './pages/Writing'
import Contact from './pages/Contact'
import ClientWork from './pages/ClientWork'
import GunnarNeumanProfile from './pages/GunnarNeumanProfile'
import PokerTablePage from './pages/PokerTablePage'
import AILab from './pages/AILab'
import GlobalAssistantLauncher from './components/GlobalAssistantLauncher'
import HomeOpus from './variants/HomeOpus'
import HomeStudio from './variants/HomeStudio'
import { aiAssistantEnabled } from './config/features'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])

  let page

  // Home + standalone design directions; rendered with their own chrome.
  if (location.pathname === '/' || location.pathname === '/v1' || location.pathname === '/v2') {
    page = (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeStudio />} />
        <Route path="/v1" element={<HomeStudio />} />
        <Route path="/v2" element={<HomeOpus />} />
      </Routes>
    )
  } else {
    page = (
      <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/client-work" element={<ClientWork />} />
          <Route path="/lab" element={<AILab />} />
          <Route path="/ai-assistant" element={<Navigate to="/" replace />} />
          <Route path="/ai-demos" element={<Navigate to="/lab" replace />} />
          <Route path="/ai-lab" element={<Navigate to="/lab" replace />} />
          <Route path="/ask-ai" element={<Navigate to="/" replace />} />
          <Route path="/insights/gunnar-neuman-profile" element={<GunnarNeumanProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/poker" element={<PokerTablePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      </Layout>
    )
  }

  return (
    <>
      {page}
      <GlobalAssistantLauncher hidden={!aiAssistantEnabled} />
    </>
  )
}

export default App
