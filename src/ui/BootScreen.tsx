import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { scrollEngine } from '../scroll/engine'

const MIN_VISIBLE_MS = 2000

/**
 * Full-viewport boot card. The 3D scene compiles underneath; scroll is
 * locked until `ready`, and the card stays up long enough to read.
 */
export function BootScreen({ ready, onGone }: { ready: boolean; onGone: () => void }) {
  const { cv, ui, toggle } = useLanguage()
  const [pct, setPct] = useState(8)
  const [leaving, setLeaving] = useState(false)
  const shownAt = useRef(performance.now())

  useEffect(() => {
    document.getElementById('boot-static')?.remove()
    document.documentElement.classList.add('is-booting')
    return () => document.documentElement.classList.remove('is-booting')
  }, [])

  useEffect(() => {
    if (ready) return
    const id = window.setInterval(() => {
      setPct((p) => Math.min(90, p + Math.max(0.35, (90 - p) * 0.07)))
    }, 90)
    return () => window.clearInterval(id)
  }, [ready])

  useEffect(() => {
    if (!ready) return
    const wait = Math.max(280, MIN_VISIBLE_MS - (performance.now() - shownAt.current))
    const finish = window.setTimeout(() => {
      setPct(100)
      scrollEngine.arm()
      document.documentElement.classList.remove('is-booting')
      setLeaving(true)
    }, wait)
    const gone = window.setTimeout(onGone, wait + 620)
    return () => {
      window.clearTimeout(finish)
      window.clearTimeout(gone)
    }
  }, [ready, onGone])

  const stages = ui.bootStages
  const stage =
    pct >= 100
      ? ui.bootReady
      : stages[Math.min(stages.length - 1, Math.floor((pct / 90) * stages.length))]

  return (
    <div className={`boot${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-busy={pct < 100}>
      <button type="button" className="boot-lang" onClick={toggle} aria-label="Switch language">
        {ui.langToggle}
      </button>

      <div className="boot-card">
        <p className="boot-logo">
          DI<span className="accent">.</span>
        </p>
        <p className="boot-name">
          {cv.meta.name}
          <span className="accent">.</span>
        </p>
        <h1 className="boot-title">{cv.meta.title}</h1>
        <p className="boot-hint">{ui.bootHint}</p>

        <div className="boot-meter" aria-hidden="true">
          <div className="boot-meter-fill" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className="boot-stage">
          <span className="boot-caret" />
          {stage}
        </p>
      </div>
    </div>
  )
}
