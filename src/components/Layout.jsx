import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Layout({ children }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close menu on route change + scroll to top
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  // Navbar solid on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) => location.pathname === path
  const isWorkActive = location.pathname === '/projects' || location.pathname === '/client-work'

  const navLinks = [
    { path: '/about', label: 'About' },
    {
      label: 'Work',
      dropdown: [
        { path: '/projects', label: 'Dev Projects' },
        { path: '/client-work', label: 'Client Work' },
      ]
    },
    { path: '/speaking', label: 'Speaking' },
    { path: '/writing', label: 'Writing' },
    { path: '/contact', label: 'Contact' },
  ]

  // Flat list for mobile menu
  const mobileLinks = [
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Dev Projects' },
    { path: '/client-work', label: 'Client Work' },
    { path: '/speaking', label: 'Speaking' },
    { path: '/writing', label: 'Writing' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <div className="layout">
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="logo">
            Gunnar Neuman
          </Link>
          <ul className="nav-links">
            {navLinks.map(link => (
              link.dropdown ? (
                <li key={link.label} className={`nav-dropdown ${isWorkActive ? 'active' : ''}`}>
                  <span className="nav-dropdown-trigger">{link.label}</span>
                  <ul className="nav-dropdown-menu">
                    {link.dropdown.map(sub => (
                      <li key={sub.path}>
                        <Link to={sub.path} className={isActive(sub.path) ? 'active' : ''}>
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={link.path}>
                  <Link to={link.path} className={isActive(link.path) ? 'active' : ''}>
                    {link.label}
                  </Link>
                </li>
              )
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
