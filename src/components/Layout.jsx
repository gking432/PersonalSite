import { Link, useLocation } from 'react-router-dom'

function Layout({ children }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="logo">
            Gunnar Neuman
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/projects" className={isActive('/projects') ? 'active' : ''}>
                Projects
              </Link>
            </li>
            <li>
              <Link to="/about" className={isActive('/about') ? 'active' : ''}>
                About
              </Link>
            </li>
            <li>
              <Link to="/speaking" className={isActive('/speaking') ? 'active' : ''}>
                Speaking
              </Link>
            </li>
            <li>
              <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>
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
