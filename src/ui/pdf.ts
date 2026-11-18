import type { Lang } from '../data/types'
import { siteRoot } from '../site'

/** Keep in sync with PDF_FILE in scripts/seo-build.mjs */
export const PDF_FILES: Record<Lang, string> = {
  en: 'Denis-Iliev-CV-EN.pdf',
  bg: 'Denis-Iliev-CV-BG.pdf',
}

export function pdfHref(lang: Lang) {
  return `${siteRoot()}cv/${PDF_FILES[lang]}`
}
