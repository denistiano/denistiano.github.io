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
      <div className="credential-grid">
        <div className="credential-card rv">
          <h3>{cv.pdf.educationTitle}</h3>
          {cv.education.map((entry, i) => (
            <p key={i}>
              <strong>{entry.institution}</strong>
              <br />
              {entry.degree} · {entry.years}
            </p>
          ))}
        </div>
        <div className="credential-card rv">
          <h3>{cv.pdf.certificationsTitle}</h3>
          {cv.certifications.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
          <h3 className="credential-sub">{cv.pdf.languagesTitle}</h3>
          {cv.languages.map((entry, i) => (
            <p key={i}>
              <strong>{entry.name}</strong> — {entry.level}
            </p>
          ))}
        </div>
        <div className="credential-card rv">
          <h3>{cv.pdf.interestsTitle}</h3>
          <p>{cv.interests}</p>
        </div>
      </div>
    </section>
  )
}
