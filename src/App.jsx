import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Layout from './components/Layout'
import About from './pages/About'
import Projects from './pages/Projects'
import Writing from './pages/Writing'
import Contact from './pages/Contact'
import ClientWork from './pages/ClientWork'
import CrmCaseStudy from './pages/CrmCaseStudy'
import { PrepMeCaseStudy, StewardCaseStudy } from './pages/AiProjectCaseStudy'
import GunnarNeumanProfile from './pages/GunnarNeumanProfile'
import World from './features/world/World'
import SiteMetadata from './components/SiteMetadata'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])

  let page

  // Home renders with its own chrome rather than the shared Layout.
  if (location.pathname === '/') {
    page = (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<World />} />
      </Routes>
    )
  } else {
    page = (
      <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/home-services-crm" element={<CrmCaseStudy />} />
          <Route path="/projects/prepme" element={<PrepMeCaseStudy />} />
          <Route path="/projects/steward" element={<StewardCaseStudy />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/client-work" element={<ClientWork />} />
          <Route path="/lab" element={<Navigate to="/" replace />} />
          <Route path="/ai-lab" element={<Navigate to="/" replace />} />
          <Route path="/ai-demos" element={<Navigate to="/" replace />} />
          <Route path="/ai-assistant" element={<Navigate to="/" replace />} />
          <Route path="/ask-ai" element={<Navigate to="/" replace />} />
          <Route path="/insights/gunnar-neuman-profile" element={<GunnarNeumanProfile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      </Layout>
    )
  }

  return (
    <>
      <SiteMetadata />
      {page}
    </>
  )
}

export default App
