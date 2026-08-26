export type SectionId = 'about' | 'journey' | 'flagship' | 'skills' | 'contact'

export const SECTION_ORDER: SectionId[] = ['about', 'journey', 'flagship', 'skills', 'contact']

export const SECTION_NAV_KEYS: Record<SectionId, 'about' | 'journey' | 'caseStudy' | 'skills' | 'contact'> = {
  about: 'about',
  journey: 'journey',
  flagship: 'caseStudy',
  skills: 'skills',
  contact: 'contact',
}

/** Live registry of the content sections inside the laptop frame. */
export const sectionEls: Partial<Record<SectionId, HTMLElement>> = {}

export function registerSection(id: SectionId) {
  return (el: HTMLElement | null) => {
    if (el) sectionEls[id] = el
    else delete sectionEls[id]
  }
}

/** Which section owns the given content scroll offset. */
export function activeSection(contentOffset: number, viewH: number): SectionId | null {
  let active: SectionId | null = null
  const probe = contentOffset + viewH * 0.42
  for (const id of SECTION_ORDER) {
    const el = sectionEls[id]
    if (el && el.offsetTop <= probe) active = id
  }
  return active
}
