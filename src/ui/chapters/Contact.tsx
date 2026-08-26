import { useLanguage } from '../../i18n/LanguageContext'
import { registerSection } from '../sections'
import { pdfHref } from '../pdf'

export function Contact() {
  const { cv, ui } = useLanguage()
  const c = cv.contact

  return (
    <section className="cs cs-contact" ref={registerSection('contact')} aria-label={c.title}>
      <p className="kicker rv">{c.kicker}</p>
      <h2 className="cs-title rv">{c.title}</h2>
      <p className="contact-text rv">{c.text}</p>

      <a className="contact-email rv" href={`mailto:${cv.meta.email}`}>
        {cv.meta.email}
      </a>

      <div className="contact-row rv">
        <div className="contact-fact">
          <span className="contact-fact-label">{c.locationLabel}</span>
          <span>{cv.meta.location}</span>
        </div>
        {cv.meta.linkedin && (
          <div className="contact-fact">
            <span className="contact-fact-label">LinkedIn</span>
            <a href={cv.meta.linkedin} target="_blank" rel="noreferrer">
              {cv.meta.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </div>
        )}
        {cv.meta.github && (
          <div className="contact-fact">
            <span className="contact-fact-label">GitHub</span>
            <a href={cv.meta.github} target="_blank" rel="noreferrer">
              {cv.meta.github.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </div>
        )}
      </div>

      <div className="contact-downloads rv">
        <a className="btn btn-primary" href={pdfHref('en')} download>
          {ui.nav.downloadEN}
        </a>
        <a className="btn btn-ghost" href={pdfHref('bg')} download>
          {ui.nav.downloadBG}
        </a>
      </div>

      <p className="contact-footer">
        © {new Date().getFullYear()} {cv.meta.name} · React Three Fiber · GSAP · Lenis
      </p>
    </section>
  )
}
