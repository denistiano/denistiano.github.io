export interface CVMeta {
  name: string
  title: string
  location: string
  email: string
  /** Shown only in the PDF, never on the website. */
  phone: string
  linkedin: string
  github: string
  website: string
}

export interface HeroContent {
  /** Big display headline, one array item per line. */
  headline: string[]
  subheadline: string
  ctaExplore: string
  ctaDownload: string
  scrollHint: string
}

export interface Stat {
  value: string
  label: string
}

export interface AboutContent {
  title: string
  kicker: string
  paragraphs: string[]
  stats: Stat[]
}

export interface FlagshipContent {
  kicker: string
  title: string
  client: string
  role: string
  years: string
  summary: string
  challenge: { title: string; text: string }
  approach: { title: string; bullets: string[] }
  impact: { title: string; bullets: string[] }
  stack: string[]
}

export interface TimelineEntry {
  years: string
  company: string
  role: string
  location?: string
  summary: string
  highlights: string[]
  tech: string[]
  flagship?: boolean
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface EducationEntry {
  years: string
  institution: string
  degree: string
}

export interface LanguageEntry {
  name: string
  level: string
}

export interface ContactContent {
  title: string
  kicker: string
  text: string
  emailLabel: string
  locationLabel: string
  downloadLabel: string
}

export interface PdfLabels {
  cvTitle: string
  aboutTitle: string
  flagshipTitle: string
  experienceTitle: string
  skillsTitle: string
  educationTitle: string
  certificationsTitle: string
  languagesTitle: string
  contactTitle: string
  interestsTitle: string
  presentLabel: string
  generatedNote: string
}

export interface CVData {
  meta: CVMeta
  hero: HeroContent
  about: AboutContent
  flagship: FlagshipContent
  timeline: TimelineEntry[]
  timelineSection: { kicker: string; title: string }
  skills: SkillGroup[]
  skillsSection: { kicker: string; title: string }
  education: EducationEntry[]
  certifications: string[]
  languages: LanguageEntry[]
  interests: string
  contact: ContactContent
  pdf: PdfLabels
}

export interface UIStrings {
  nav: {
    about: string
    journey: string
    caseStudy: string
    skills: string
    contact: string
    downloadCV: string
    downloadEN: string
    downloadBG: string
  }
  langToggle: string
  loading: string
  bootHint: string
  bootReady: string
  bootStages: string[]
  path: string
  desk: string
}

export type Lang = 'en' | 'bg'
