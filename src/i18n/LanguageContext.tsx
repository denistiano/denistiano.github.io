import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CVData, Lang, UIStrings } from '../data/types'
import cvEn from '../data/cv.en.json'
import cvBg from '../data/cv.bg.json'
import uiEn from '../data/ui.en.json'
import uiBg from '../data/ui.bg.json'
import { homeHref, onBulgarianPath } from '../site'

const CV: Record<Lang, CVData> = {
  en: cvEn as CVData,
  bg: cvBg as CVData,
}

const UI: Record<Lang, UIStrings> = {
  en: uiEn as UIStrings,
  bg: uiBg as UIStrings,
}

interface LanguageValue {
  lang: Lang
  cv: CVData
  ui: UIStrings
  toggle: () => void
}

const LanguageContext = createContext<LanguageValue | null>(null)

export function detectInitialLang(): Lang {
  const params = new URLSearchParams(window.location.search)
  if (params.has('print')) {
    const printed = params.get('print')
    if (printed === 'bg' || printed === 'en') return printed
  }
  const fromQuery = params.get('lang')
  if (fromQuery === 'bg' || fromQuery === 'en') return fromQuery
  if (onBulgarianPath()) return 'bg'
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    const params = new URLSearchParams(window.location.search)
    if (params.has('print')) return
    const requested = params.get('lang')
    if (requested !== 'en' && requested !== 'bg') return
    const onBg = onBulgarianPath()
    if ((requested === 'bg' && !onBg) || (requested === 'en' && onBg)) {
      window.location.replace(homeHref(requested))
      return
    }
    params.delete('lang')
    const search = params.toString()
    const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', next)
  }, [lang])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      cv: CV[lang],
      ui: UI[lang],
      toggle: () => {
        const next = lang === 'en' ? 'bg' : 'en'
        setLang(next)
        window.location.assign(homeHref(next))
      },
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}

export function getCV(lang: Lang): CVData {
  return CV[lang]
}
