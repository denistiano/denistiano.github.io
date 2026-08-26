import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { span } from '../scroll/choreography'

/** Bottom-center scroll invitation; evaporates on first scroll. */
export function ScrollHint() {
  const { cv } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)

  useScrollFrame(({ progress: p }) => {
    const el = ref.current
    if (!el) return
    const v = 1 - span(p, 0.004, 0.05)
    el.style.opacity = String(v)
    el.style.visibility = v <= 0.01 ? 'hidden' : 'visible'
  })

  return (
    <div className="scroll-hint" ref={ref} aria-hidden="true">
      <span className="scroll-hint-mouse">
        <span className="scroll-hint-wheel" />
      </span>
      {cv.hero.scrollHint}
    </div>
  )
}

/** Thin progress track on the right edge, tracking the whole page. */
export function ProgressRail() {
  const fillRef = useRef<HTMLDivElement>(null)

  useScrollFrame((s) => {
    if (fillRef.current) fillRef.current.style.transform = `scaleY(${s.total})`
  })

  return (
    <div className="progress-rail" aria-hidden="true">
      <div className="progress-fill" ref={fillRef} />
    </div>
  )
}
