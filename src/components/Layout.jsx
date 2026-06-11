import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Layout({ children }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navPhase, setNavPhase] = useState('top')

  // Close menu on route change + instant jump to top
  useEffect(() => {
    setMenuOpen(false)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [location.pathname])

  // Headroom-style navbar: visible at top, hidden during early scroll, revealed later.
  useEffect(() => {
    const updateNavbar = () => {
      const scrollY = window.scrollY
      const revealAt = Math.max(560, window.innerHeight * 0.72)

      setScrolled(scrollY > 50)

      // While an immersive full-bleed section (e.g. the Horizon Journey) is
      // pinned to the viewport, hide the navbar so the scene plays uninterrupted.
      const immersive = document.querySelector('.horizon-scroll-runway')
      if (immersive) {
        const rect = immersive.getBoundingClientRect()
        if (rect.top <= 1 && rect.bottom >= window.innerHeight - 1) {
          setNavPhase('hidden')
          return
        }
      }

      setNavPhase(scrollY <= 12 ? 'top' : scrollY < revealAt ? 'hidden' : 'revealed')
    }

    function onScroll() {
      updateNavbar()
    }

    updateNavbar()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateNavbar)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateNavbar)
    }
  }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) => location.pathname === path
  const isHome = location.pathname === '/'
  const navbarClassName = [
    'navbar',
    scrolled ? 'navbar-scrolled' : '',
    navPhase === 'hidden' ? 'navbar-hidden' : '',
    navPhase === 'revealed' ? 'navbar-revealed' : '',
    menuOpen ? 'navbar-menu-open' : ''
  ].filter(Boolean).join(' ')

  const navLinks = [
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/client-work', label: 'Client Work' },
    { path: '/contact', label: 'Contact' },
  ]

  // Flat list for mobile menu
  const mobileLinks = [
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/client-work', label: 'Client Work' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <div className="layout">
      <nav className={navbarClassName}>
        <div className="container">
          <Link to="/" className="logo">
            Gunnar Neuman
          </Link>
          <ul className="nav-links">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`${isActive(link.path) ? 'active' : ''}${link.cta ? ' nav-cta' : ''}`.trim()}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            className={`hamburger ${menuOpen ? 'is-active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.ul
              className="mobile-nav-links"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
              }}
            >
              {mobileLinks.map(link => (
                <motion.li
                  key={link.path}
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
                  }}
                >
                  <Link
                    to={link.path}
                    className={isActive(link.path) ? 'active' : ''}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} Gunnar Neuman</p>
            <ul className="footer-links">
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
              <li>
                <a href="mailto:gunnarneuman14@gmail.com">Email</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
