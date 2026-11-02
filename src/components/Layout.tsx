import { useEffect, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { getServiceAvailability } from '../services/analysisService'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/check', label: 'Check a product' },
  { to: '/research', label: 'How it works' },
  { to: '/demo', label: 'Demo results' },
  { to: '/company', label: 'For companies' },
]

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const service = getServiceAvailability()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="research-ribbon" role="status">
        <span className="status-dot" aria-hidden="true" />
        <strong>Research prototype</strong>
        <span>{service.configured ? 'Model service configured' : 'Model not connected'}</span>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <NavLink className="button button--small header-cta" to="/check">
            Check a product <ArrowUpRight size={16} aria-hidden="true" />
          </NavLink>
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation">
            <div className="container">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}>{item.label}</NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <BrandMark />
            <p className="footer-note">A frontend prototype for multimodal cosmetics-packaging research.</p>
          </div>
          <div>
            <p className="footer-heading">Explore</p>
            <NavLink to="/check">Check a product</NavLink>
            <NavLink to="/research">Research approach</NavLink>
            <NavLink to="/demo">Demo results</NavLink>
            <NavLink to="/company">For companies</NavLink>
          </div>
          <div>
            <p className="footer-heading">Important</p>
            <p>This tool supports screening. It does not certify authenticity, safety, or regulatory compliance.</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>RealOrFake research interface</span>
          <span>{service.configured ? 'Connected screening · Review limitations before use' : 'Frontend only · No photos are transmitted'}</span>
        </div>
      </footer>
    </div>
  )
}
