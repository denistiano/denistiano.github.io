import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CVData, Lang, UIStrings } from '../data/types'
import cvEn from '../data/cv.en.json'
import cvBg from '../data/cv.bg.json'
import uiEn from '../data/ui.en.json'
import uiBg from '../data/ui.bg.json'

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
  const fromQuery = new URLSearchParams(window.location.search).get('lang')
  if (fromQuery === 'bg' || fromQuery === 'en') return fromQuery
  const stored = localStorage.getItem('lang')
  if (stored === 'bg' || stored === 'en') return stored
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectInitialLang)

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      cv: CV[lang],
      ui: UI[lang],
      toggle: () => {
        setLang((prev) => {
          const next = prev === 'en' ? 'bg' : 'en'
          localStorage.setItem('lang', next)
          document.documentElement.lang = next
          return next
        })
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
