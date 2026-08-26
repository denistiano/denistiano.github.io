import { useMemo, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { scrollEngine } from '../scroll/engine'
import { BEATS, span, smoothstep } from '../scroll/choreography'
import { pdfHref } from './pdf'

/**
 * The landing text block. On scroll, each character dissolves —
 * drifting up, blurring, fading — staggered pseudo-randomly so the
 * headline evaporates rather than slides away.
 */
export function Hero() {
  const { cv, lang } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const charsRef = useRef<HTMLSpanElement[]>([])
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLParagraphElement>(null)

  // Stable per-character stagger offsets (shuffled, seeded by index).
  const staggers = useMemo(() => {
    const total = cv.hero.headline.join('').length
    return Array.from({ length: total }, (_, i) => {
      const jitter = Math.sin(i * 12.9898) * 43758.5453
      return (jitter - Math.floor(jitter)) * 0.55
    })
  }, [cv.hero.headline])

  useScrollFrame(({ progress: p }) => {
    const root = rootRef.current
    if (!root) return
    const d = span(p, BEATS.heroDissolveStart, BEATS.heroDissolveEnd)

    if (d >= 1) {
      root.style.visibility = 'hidden'
      return
    }
    root.style.visibility = 'visible'
    root.style.pointerEvents = d > 0.35 ? 'none' : 'auto'

    charsRef.current.forEach((el, i) => {
      if (!el) return
      const local = smoothstep(span(d, staggers[i] * 0.45, staggers[i] * 0.45 + 0.55))
      if (local <= 0) {
        el.style.opacity = '1'
        el.style.transform = 'none'
        el.style.filter = 'none'
        return
      }
      el.style.opacity = String(1 - local)
      el.style.transform = `translateY(${-34 * local}px) rotate(${(staggers[i] - 0.3) * 14 * local}deg)`
      el.style.filter = `blur(${5 * local}px)`
    })

    // Kicker and sub fade a touch earlier, CTAs first.
    const fadeEarly = smoothstep(span(d, 0, 0.55))
    if (kickerRef.current) kickerRef.current.style.opacity = String(1 - fadeEarly)
    if (subRef.current) {
      subRef.current.style.opacity = String(1 - fadeEarly)
      subRef.current.style.transform = `translateY(${-14 * fadeEarly}px)`
    }
    if (ctaRef.current) {
      const f = smoothstep(span(d, 0, 0.4))
      ctaRef.current.style.opacity = String(1 - f)
      ctaRef.current.style.transform = `translateY(${-10 * f}px)`
    }
  })

  let charIndex = 0

  return (
    <div className="hero" ref={rootRef}>
      <div className="hero-inner">
        <p className="hero-kicker" ref={kickerRef}>
          {cv.meta.name}
          <span className="accent">.</span>
        </p>
        <h1 className="hero-headline" aria-label={cv.hero.headline.join(' ')}>
          {cv.hero.headline.map((line, li) => (
            <span className="hero-line" key={li} aria-hidden="true">
              {Array.from(line).map((ch) => {
                const idx = charIndex++
                return (
                  <span
                    className="hero-char"
                    key={idx}
                    ref={(el) => {
                      if (el) charsRef.current[idx] = el
                    }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>
        <p className="hero-sub" ref={subRef}>
          {cv.hero.subheadline}
        </p>
        <div className="hero-ctas" ref={ctaRef}>
          <button
            className="btn btn-primary"
            onClick={() => scrollEngine.scrollToPx(scrollEngine.cinematicLength)}
          >
            {cv.hero.ctaExplore}
          </button>
          <a className="btn btn-ghost" href={pdfHref(lang)} download>
            {cv.hero.ctaDownload}
          </a>
        </div>
      </div>
    </div>
  )
}
