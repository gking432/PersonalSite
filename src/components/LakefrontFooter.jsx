import { Link } from 'react-router-dom'
import './LakefrontFooter.css'

export default function LakefrontFooter() {
  return (
    <footer className="lakefront-footer">
      <div className="lakefront-footer__content">
        <div className="lakefront-footer__identity">
          <Link className="lakefront-footer__name" to="/">Gunnar Neuman</Link>
          <p>Business experience. Working AI systems.</p>
          <span className="lakefront-footer__location">Based in Milwaukee, Wisconsin.</span>
        </div>
        <nav className="lakefront-footer__nav" aria-label="Footer navigation">
          <div>
            <h2>Explore</h2>
            <Link to="/about">About</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/client-work">Client work</Link>
          </div>
          <div>
            <h2>Get in touch</h2>
            <Link to="/contact">Contact</Link>
            <a href="mailto:gunnarneuman14@gmail.com">Email me</a>
            <a href="/Gunnar-Neuman-Resume.pdf" target="_blank" rel="noreferrer">Résumé</a>
          </div>
        </nav>
      </div>
      <p className="lakefront-footer__copyright">© {new Date().getFullYear()} Gunnar Neuman</p>
      <div className="lakefront-footer__scene" aria-hidden="true">
        <svg width="0" height="0" className="lakefront-footer__filters" focusable="false">
          <defs>
            <filter id="lakefront-green-ink" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              {/* Convert paper brightness to transparency and retain a single green ink. */}
              <feColorMatrix type="matrix" values="
                0 0 0 0 0.208
                0 0 0 0 0.341
                0 0 0 0 0.278
                -0.327 -1.100 -0.111 0 1.446
              " />
            </filter>
          </defs>
        </svg>
        <img src="/images/milwaukee-lakefront-footer.webp" alt="" loading="lazy" width="2169" height="725" />
      </div>
    </footer>
  )
}
