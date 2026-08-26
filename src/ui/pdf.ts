import type { Lang } from '../data/types'

export const PDF_FILES: Record<Lang, string> = {
  en: 'Denis-Iliev-CV-EN.pdf',
  bg: 'Denis-Iliev-CV-BG.pdf',
}

export function pdfHref(lang: Lang) {
  return `${import.meta.env.BASE_URL}cv/${PDF_FILES[lang]}`
}
