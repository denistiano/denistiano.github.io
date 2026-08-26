import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { span } from '../scroll/choreography'

/** Bottom-center scroll invitation; evaporates on first scroll. */
export function ScrollHint() {
  const { cv } = useLanguage()
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef(-1)

  useScrollFrame(({ progress: p }) => {
    const el = ref.current
    if (!el) return
    const v = 1 - span(p, 0.004, 0.05)
    if (Math.abs(v - last.current) < 0.01) return
    last.current = v
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
  const last = useRef(-1)

  useScrollFrame((s) => {
    const el = fillRef.current
    if (!el) return
    const t = Math.round(s.total * 1000) / 1000
    if (t === last.current) return
    last.current = t
    el.style.transform = `scaleY(${t})`
  })

  return (
    <div className="progress-rail" aria-hidden="true">
      <div className="progress-fill" ref={fillRef} />
    </div>
  )
}
