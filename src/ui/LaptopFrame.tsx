import { useEffect, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { BEATS, span, smoothstep } from '../scroll/choreography'
import { sceneRefs } from '../scene/refs'
import { scene as sceneCfg } from '../theme'
import { SECTION_NAV_KEYS, SECTION_ORDER } from './sections'
import { activeSectionCached, cacheSectionOffsets } from './sectionCache'
import { About } from './chapters/About'
import { Journey } from './chapters/Journey'
import { Flagship } from './chapters/Flagship'
import { Skills } from './chapters/Skills'
import { Contact } from './chapters/Contact'

export function LaptopFrame({ onExtraScroll }: { onExtraScroll: (px: number) => void }) {
  const { cv, ui, lang } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const beatRef = useRef<HTMLSpanElement>(null)
  const lastLabel = useRef('')
  const layout = useRef({ maxScroll: 0, boxH: 0 })
  const lastY = useRef(-1)
  const lastOpacity = useRef(-1)

  useEffect(() => {
    sceneRefs.frameEl = rootRef.current
    return () => {
      sceneRefs.frameEl = null
    }
  }, [])

  useEffect(() => {
    const content = contentRef.current
    const box = boxRef.current
    if (!content || !box) return
    const report = () => {
      const boxH = box.clientHeight || sceneCfg.screenFillH * window.innerHeight - 40
      layout.current.boxH = boxH
      layout.current.maxScroll = Math.max(0, content.scrollHeight - boxH)
      cacheSectionOffsets(boxH)
      onExtraScroll(layout.current.maxScroll)
    }
    const ro = new ResizeObserver(report)
    ro.observe(content)
    ro.observe(box)
    window.addEventListener('resize', report)
    report()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', report)
    }
  }, [onExtraScroll, lang])

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
      if (el.style.visibility !== 'hidden') {
        el.style.visibility = 'hidden'
        el.style.pointerEvents = 'none'
      }
      return
    }
    el.style.visibility = 'visible'
    if (Math.abs(v - lastOpacity.current) > 0.002) {
      lastOpacity.current = v
      el.style.opacity = String(v)
    }
    el.style.pointerEvents = v > 0.8 ? 'auto' : 'none'

    const { maxScroll } = layout.current
    const y = Math.min(s.contentOffset, maxScroll)
    const content = contentRef.current
    if (content && Math.abs(y - lastY.current) > 0.5) {
      lastY.current = y
      content.style.transform = `translate3d(0, ${-y.toFixed(1)}px, 0)`
    }

    const boxH = layout.current.boxH
    if (boxH > 0) {
      const id = activeSectionCached(y, boxH)
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
