import { useLanguage } from '../../i18n/LanguageContext'
import { registerSection } from '../sections'

/**
 * The centerpiece case study as a readable article: identity header,
 * then summary, challenge, approach and impact in normal reading order.
 */
export function Flagship() {
  const { cv } = useLanguage()
  const f = cv.flagship

  return (
    <section className="cs cs-flagship" ref={registerSection('flagship')} aria-label={f.title}>
      <header className="flagship-header">
        <p className="kicker rv">{f.kicker}</p>
        <h2 className="cs-title rv">{f.title}</h2>
        <dl className="flagship-meta rv">
          <div>
            <dt>Client</dt>
            <dd>{f.client}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{f.role}</dd>
          </div>
        </dl>
        <div className="chips flagship-stack rv">
          {f.stack.map((s, i) => (
            <span className="chip" key={i}>
              {s}
            </span>
          ))}
        </div>
      </header>

      <p className="flagship-summary rv">{f.summary}</p>

      <div className="flagship-block rv">
        <h3>{f.challenge.title}</h3>
        <p>{f.challenge.text}</p>
      </div>

      <div className="flagship-block rv">
        <h3>{f.approach.title}</h3>
        <ul>
          {f.approach.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="flagship-block rv">
        <h3>{f.impact.title}</h3>
        <ul>
          {f.impact.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
