import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { BEATS, span, smoothstep } from '../scroll/choreography'
import { sceneRefs } from '../scene/refs'
import { scene as sceneCfg } from '../theme'
import { activeSection, SECTION_NAV_KEYS, SECTION_ORDER } from './sections'
import { About } from './chapters/About'
import { Journey } from './chapters/Journey'
import { Flagship } from './chapters/Flagship'
import { Skills } from './chapters/Skills'
import { Contact } from './chapters/Contact'

/**
 * The laptop screen as a DOM surface. The container is re-projected
 * over the 3D screen every frame (ScreenFrameSync), so we never leave
 * the scene — the CV content simply plays on the laptop. Scroll past
 * the cinematic act translates the inner column 1:1: perfectly normal
 * scrolling inside the screen.
 */
export function LaptopFrame({ onExtraScroll }: { onExtraScroll: (px: number) => void }) {
  const { cv, ui, lang } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const beatRef = useRef<HTMLSpanElement>(null)
  const lastLabel = useRef('')

  // Register the container for the 3D projection.
  useEffect(() => {
    sceneRefs.frameEl = rootRef.current
    return () => {
      sceneRefs.frameEl = null
    }
  }, [])

  // Tell the page how much extra scroll runway the content needs.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const report = () => {
      const boxH = boxRef.current?.clientHeight || sceneCfg.screenFillH * window.innerHeight - 40
      onExtraScroll(Math.max(0, content.scrollHeight - boxH))
    }
    const ro = new ResizeObserver(report)
    ro.observe(content)
    window.addEventListener('resize', report)
    report()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', report)
    }
  }, [onExtraScroll, lang])

  // Scroll-reveal for content blocks (normal, intuitive, once).
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.1 },
    )
    content.querySelectorAll('.rv').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [lang])

  useScrollFrame((s) => {
    const el = rootRef.current
    if (!el) return
    const v = smoothstep(span(s.progress, BEATS.screenEnterStart, BEATS.screenEnterEnd))
    if (v <= 0.001) {
      el.style.visibility = 'hidden'
      el.style.pointerEvents = 'none'
      return
    }
    el.style.visibility = 'visible'
    el.style.opacity = String(v)
    el.style.pointerEvents = v > 0.8 ? 'auto' : 'none'

    // Normal scrolling: translate the column by the post-cinematic scroll.
    const box = boxRef.current
    const content = contentRef.current
    if (box && content) {
      const max = Math.max(0, content.scrollHeight - box.clientHeight)
      const y = Math.min(s.contentOffset, max)
      content.style.transform = `translate3d(0, ${-y.toFixed(1)}px, 0)`

      // Section indicator in the chrome bar.
      const id = activeSection(y, box.clientHeight)
      const idx = id ? SECTION_ORDER.indexOf(id) + 1 : 0
      const text = id
        ? `${String(idx).padStart(2, '0')} / ${String(SECTION_ORDER.length).padStart(2, '0')} — ${ui.nav[SECTION_NAV_KEYS[id]]}`
        : ''
      if (text !== lastLabel.current && beatRef.current) {
        lastLabel.current = text
        beatRef.current.textContent = text
      }
    }
  })

  return (
    <div className="laptop-frame" ref={rootRef}>
      <div className="screen-chrome">
        <span className="chrome-dots" aria-hidden="true">
          <i /> <i /> <i />
        </span>
        <span className="chrome-title">
          {cv.meta.name.toLowerCase().replace(' ', '.')} — portfolio
        </span>
        <span className="chrome-beat" ref={beatRef} />
      </div>
      <div className="frame-scroll" ref={boxRef}>
        <div className="frame-content" ref={contentRef}>
          <About />
          <Journey />
          <Flagship />
          <Skills />
          <Contact />
        </div>
      </div>
    </div>
  )
}
