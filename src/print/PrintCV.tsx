import type { Lang } from '../data/types'
import { getCV } from '../i18n/LanguageContext'
import avatar from '../assets/avatar.jpg'
import './print.css'

/**
 * The downloadable CV — an executive two-column template: a dark left
 * rail carrying the lookup information (contact, skills, education,
 * languages), and a wide main column telling the career story with a
 * profile, the flagship case study and a dotted timeline.
 * Rendered at /?print=en|bg and captured by Puppeteer.
 */
export function PrintCV({ lang }: { lang: Lang }) {
  const cv = getCV(lang)
  const L = cv.pdf

  return (
    <div className="print-doc">
      {/* Fixed background repeats on every printed page, so the rail
          runs edge-to-edge even across page margins and after the
          content ends. */}
      <div className="p-rail-bg" aria-hidden="true" />
      {/* ------------------------------------------- dark left rail */}
      <aside className="p-side">
        <div className="p-avatar">
          <img src={avatar} alt={cv.meta.name} />
        </div>

        <section className="p-side-section">
          <h2>{L.contactTitle}</h2>
          <p>{cv.meta.email}</p>
          <p>{cv.meta.phone}</p>
          <p>{cv.meta.location}</p>
          {cv.meta.linkedin && <p>{cv.meta.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</p>}
          {cv.meta.website && <p>{cv.meta.website.replace(/^https?:\/\/(www\.)?/, '')}</p>}
        </section>

        <section className="p-side-section">
          <h2>{L.skillsTitle}</h2>
          {cv.skills.map((g, i) => (
            <div className="p-side-skill" key={i}>
              <h3>{g.category}</h3>
              <p>{g.items.join(' · ')}</p>
            </div>
          ))}
        </section>

        <section className="p-side-section">
          <h2>{L.educationTitle}</h2>
          {cv.education.map((e, i) => (
            <div className="p-side-skill" key={i}>
              <h3>{e.institution}</h3>
              <p>
                {e.degree} · {e.years}
              </p>
            </div>
          ))}
        </section>

        <section className="p-side-section">
          <h2>{L.certificationsTitle}</h2>
          {cv.certifications.map((c, i) => (
            <p key={i}>{c}</p>
          ))}
        </section>

        <section className="p-side-section">
          <h2>{L.languagesTitle}</h2>
          {cv.languages.map((l, i) => (
            <p key={i}>
              <strong>{l.name}</strong> — {l.level}
            </p>
          ))}
        </section>

        <section className="p-side-section">
          <h2>{L.interestsTitle}</h2>
          <p>{cv.interests}</p>
        </section>
      </aside>

      {/* ------------------------------------------- main column */}
      <main className="p-main">
        <header className="p-header">
          <h1>
            {cv.meta.name}
            <span className="p-dot">.</span>
          </h1>
          <p className="p-title">{cv.meta.title}</p>
        </header>

        <section className="p-section">
          <h2 className="p-section-title">{L.aboutTitle}</h2>
          {cv.about.paragraphs.map((p, i) => (
            <p className="p-body" key={i}>
              {p}
            </p>
          ))}
          <div className="p-stats">
            {cv.about.stats.map((s, i) => (
              <div className="p-stat" key={i}>
                <span className="p-stat-value">{s.value}</span>
                <span className="p-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-section">
          <h2 className="p-section-title">{L.flagshipTitle}</h2>
          <div className="p-flagship">
            <div className="p-flagship-head">
              <h3>{cv.flagship.title}</h3>
              <p className="p-flagship-meta">
                {cv.flagship.client} — {cv.flagship.role}
              </p>
            </div>
            <p className="p-body">{cv.flagship.summary}</p>
            <h4>{cv.flagship.challenge.title}</h4>
            <p className="p-body">{cv.flagship.challenge.text}</p>
            <h4>{cv.flagship.approach.title}</h4>
            <ul className="p-list">
              {cv.flagship.approach.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <h4>{cv.flagship.impact.title}</h4>
            <ul className="p-list">
              {cv.flagship.impact.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p className="p-tags">{cv.flagship.stack.join(' · ')}</p>
          </div>
        </section>

        <section className="p-section">
          <h2 className="p-section-title">{L.experienceTitle}</h2>
          <div className="p-xp">
            {cv.timeline.map((e, i) => (
              <article className="p-entry" key={i}>
                <span className="p-entry-years">
                  {e.years}
                  {e.location ? ` · ${e.location}` : ''}
                </span>
                <h3>
                  {e.company}
                  {e.flagship ? <span className="p-dot"> ★</span> : null}
                </h3>
                <p className="p-entry-role">{e.role}</p>
                <p className="p-body">{e.summary}</p>
                <ul className="p-list p-list-tight">
                  {e.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
                <p className="p-tags">{e.tech.join(' · ')}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="p-footer">
          <span>
            {cv.meta.name} — {L.cvTitle}
          </span>
          {cv.meta.website && <span>{L.generatedNote}</span>}
        </footer>
      </main>
    </div>
  )
}
