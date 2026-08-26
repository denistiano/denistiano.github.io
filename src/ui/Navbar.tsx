import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { scrollEngine } from '../scroll/engine'
import { activeSection, SECTION_NAV_KEYS, SECTION_ORDER, sectionEls, type SectionId } from './sections'
import { pdfHref } from './pdf'

export function Navbar() {
  const { ui, toggle } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const activeRef = useRef<string>('')

  useScrollFrame((s) => {
    const nav = navRef.current
    if (!nav) return
    // Sections only become "active" once we're inside the content act.
    const active =
      s.target >= 1 ? (activeSection(s.contentOffset, window.innerHeight * 0.8) ?? '') : ''
    if (active !== activeRef.current) {
      activeRef.current = active
      nav.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((el) => {
        el.classList.toggle('active', el.dataset.chapter === active)
      })
    }
  })

  const goTo = (id: SectionId) => {
    const el = sectionEls[id]
    if (!el) return
    scrollEngine.scrollToPx(scrollEngine.cinematicLength + el.offsetTop)
  }

  return (
    <nav className="navbar" ref={navRef}>
      <button className="nav-logo" onClick={() => scrollEngine.flyTo(0)} aria-label="Back to start">
        DI<span className="accent">.</span>
      </button>

      <div className="nav-links">
        {SECTION_ORDER.map((id) => (
          <button key={id} data-chapter={id} className="nav-link" onClick={() => goTo(id)}>
            {ui.nav[SECTION_NAV_KEYS[id]]}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <div
          className={`nav-download ${menuOpen ? 'open' : ''}`}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button className="btn btn-small btn-primary" onClick={() => setMenuOpen((v) => !v)}>
            {ui.nav.downloadCV}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div className="nav-download-menu" role="menu">
            <a href={pdfHref('en')} download role="menuitem">
              {ui.nav.downloadEN}
            </a>
            <a href={pdfHref('bg')} download role="menuitem">
              {ui.nav.downloadBG}
            </a>
          </div>
        </div>
        <button className="nav-lang" onClick={toggle} aria-label="Switch language">
          {ui.langToggle}
        </button>
      </div>
    </nav>
  )
}
