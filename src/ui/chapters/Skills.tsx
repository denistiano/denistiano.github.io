import { useLanguage } from '../../i18n/LanguageContext'
import { registerSection } from '../sections'

export function Skills() {
  const { cv } = useLanguage()

  return (
    <section className="cs cs-skills" ref={registerSection('skills')} aria-label={cv.skillsSection.title}>
      <p className="kicker rv">{cv.skillsSection.kicker}</p>
      <h2 className="cs-title rv">{cv.skillsSection.title}</h2>
      <div className="skills-grid">
        {cv.skills.map((g, i) => (
          <div className="skill-card rv" key={i} style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
            <h3>{g.category}</h3>
            <div className="chips">
              {g.items.map((item, j) => (
                <span className="chip" key={j}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
