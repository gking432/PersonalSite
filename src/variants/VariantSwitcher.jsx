import { Link, useLocation } from 'react-router-dom'

const variants = [
  { path: '/v1', num: '01', label: 'Cinematic' },
  { path: '/v2', num: '02', label: 'Kinetic' },
  { path: '/v3', num: '03', label: 'Immersive' }
]

// Floating control so you can flip between the three design directions instantly.
function VariantSwitcher() {
  const { pathname } = useLocation()

  return (
    <div className="variant-switcher" role="navigation" aria-label="Design directions">
      <span className="variant-switcher__title">Direction</span>
      {variants.map((v) => (
        <Link
          key={v.path}
          to={v.path}
          className={`variant-switcher__item ${pathname === v.path ? 'is-active' : ''}`}
        >
          <span className="variant-switcher__num">{v.num}</span>
          <span className="variant-switcher__label">{v.label}</span>
        </Link>
      ))}
    </div>
  )
}

export default VariantSwitcher
