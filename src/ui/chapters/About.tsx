import { useLanguage } from '../../i18n/LanguageContext'
import { registerSection } from '../sections'
import avatar from '../../assets/avatar.jpg'

export function About() {
  const { cv } = useLanguage()

  return (
    <section className="cs cs-about" ref={registerSection('about')} aria-label={cv.about.title}>
      <p className="kicker rv">{cv.about.kicker}</p>
      <h2 className="cs-title rv">{cv.about.title}</h2>
      <div className="about-columns">
        <div className="about-text">
          {cv.about.paragraphs.map((p, i) => (
            <p className="rv" key={i}>
              {p}
            </p>
          ))}
        </div>
        <div className="about-stats">
          <div className="about-avatar rv">
            <img src={avatar} alt={cv.meta.name} loading="lazy" />
          </div>
          {cv.about.stats.map((s, i) => (
            <div className="stat rv" key={i} style={{ transitionDelay: `${i * 70}ms` }}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
