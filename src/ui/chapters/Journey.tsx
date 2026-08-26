import { useLanguage } from '../../i18n/LanguageContext'
import { registerSection } from '../sections'

/**
 * The career timeline as a plain vertical timeline — newest first,
 * a rail with year nodes on the left, entries revealed as they scroll
 * into view. Ordinary reading, no tricks.
 */
export function Journey() {
  const { cv } = useLanguage()
  const entries = cv.timeline

  return (
    <section className="cs cs-journey" ref={registerSection('journey')} aria-label={cv.timelineSection.title}>
      <p className="kicker rv">{cv.timelineSection.kicker}</p>
      <h2 className="cs-title rv">{cv.timelineSection.title}</h2>

      <div className="tl">
        {entries.map((e, i) => (
          <article className={`tl-entry rv ${e.flagship ? 'is-flagship' : ''}`} key={i}>
            <span className="tl-node" aria-hidden="true" />
            <p className="tl-years">{e.years}</p>
            <h3 className="tl-company">{e.company}</h3>
            <p className="tl-role">
              {e.role}
              {e.location ? <span className="tl-location"> · {e.location}</span> : null}
            </p>
            <p className="tl-summary">{e.summary}</p>
            <ul className="tl-highlights">
              {e.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
            <div className="chips">
              {e.tech.map((tech, j) => (
                <span className="chip" key={j}>
                  {tech}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
