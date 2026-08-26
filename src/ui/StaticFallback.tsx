import { useLanguage } from '../i18n/LanguageContext'
import { pdfHref } from './pdf'

/**
 * Served when the visitor prefers reduced motion: the complete story
 * as a calm, normally-scrolling document. Same data, zero WebGL.
 */
export function StaticFallback() {
  const { cv, ui, toggle } = useLanguage()

  return (
    <div className="static-page">
      <header className="static-header">
        <span className="nav-logo">
          DI<span className="accent">.</span>
        </span>
        <div className="static-header-actions">
          <a className="btn btn-small btn-primary" href={pdfHref('en')} download>
            {ui.nav.downloadEN}
          </a>
          <a className="btn btn-small btn-ghost" href={pdfHref('bg')} download>
            {ui.nav.downloadBG}
          </a>
          <button className="nav-lang" onClick={toggle}>
            {ui.langToggle}
          </button>
        </div>
      </header>

      <main>
        <section className="static-section">
          <p className="hero-kicker">
            {cv.meta.name} — {cv.meta.title}
          </p>
          <h1 className="static-headline">{cv.hero.headline.join(' ')}</h1>
          <p className="hero-sub">{cv.hero.subheadline}</p>
        </section>

        <section className="static-section">
          <p className="kicker">{cv.about.kicker}</p>
          <h2>{cv.about.title}</h2>
          {cv.about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="about-stats static-stats">
            {cv.about.stats.map((s, i) => (
              <div className="stat" key={i}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="static-section">
          <p className="kicker">{cv.flagship.kicker}</p>
          <h2>{cv.flagship.title}</h2>
          <p className="static-meta">
            {cv.flagship.client} · {cv.flagship.role}
          </p>
          <p>{cv.flagship.summary}</p>
          <h3>{cv.flagship.challenge.title}</h3>
          <p>{cv.flagship.challenge.text}</p>
          <h3>{cv.flagship.approach.title}</h3>
          <ul>
            {cv.flagship.approach.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <h3>{cv.flagship.impact.title}</h3>
          <ul>
            {cv.flagship.impact.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="static-section">
          <p className="kicker">{cv.timelineSection.kicker}</p>
          <h2>{cv.timelineSection.title}</h2>
          {cv.timeline.map((e, i) => (
            <article className="static-entry" key={i}>
              <h3>
                {e.company} — {e.role}
              </h3>
              <p className="static-meta">
                {e.years}
                {e.location ? ` · ${e.location}` : ''}
              </p>
              <p>{e.summary}</p>
              <ul>
                {e.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="static-section">
          <p className="kicker">{cv.skillsSection.kicker}</p>
          <h2>{cv.skillsSection.title}</h2>
          {cv.skills.map((g, i) => (
            <p key={i}>
              <strong>{g.category}:</strong> {g.items.join(', ')}
            </p>
          ))}
        </section>

        <section className="static-section">
          <p className="kicker">{cv.contact.kicker}</p>
          <h2>{cv.contact.title}</h2>
          <p>{cv.contact.text}</p>
          <p>
            <a href={`mailto:${cv.meta.email}`}>{cv.meta.email}</a> · {cv.meta.location}
          </p>
        </section>
      </main>
    </div>
  )
}
