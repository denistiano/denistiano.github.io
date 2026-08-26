import { useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useScrollFrame } from '../scroll/useScrollFrame'
import { clamp01, span } from '../scroll/choreography'
import { scrollEngine, type ScrollState } from '../scroll/engine'
import {
  SECTION_NAV_KEYS,
  SECTION_ORDER,
  sectionEls,
  type SectionId,
} from './sections'
import {
  activeSectionCached,
  getContentMaxScroll,
  getSectionOffsets,
} from './sectionCache'

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

/**
 * Map cinematic + content scroll onto 6 equally spaced stops:
 * desk → about → journey → flagship → toolbox → contact.
 */
function pathT(s: ScrollState): number {
  const n = SECTION_ORDER.length
  if (s.target < 1) return s.progress / n
  const offs = getSectionOffsets()
  const max = Math.max(1, getContentMaxScroll())
  if (!offs.length) return 1 / n
  let i = 0
  while (i < n - 1 && s.contentOffset >= offs[i + 1]) i++
  const a = offs[i] ?? 0
  const b = i < n - 1 ? offs[i + 1] : max
  const local = b > a ? clamp01((s.contentOffset - a) / (b - a)) : 1
  return clamp01((1 + i + local) / n)
}

function lerpStops(t: number, stops: number[]) {
  if (stops.length < 2) return t
  const n = stops.length - 1
  const x = clamp01(t) * n
  const i = Math.min(n - 1, Math.floor(x))
  return stops[i] + (stops[i + 1] - stops[i]) * (x - i)
}

function goToSection(id: SectionId) {
  const el = sectionEls[id]
  if (!el) return
  scrollEngine.scrollToPx(scrollEngine.cinematicLength + el.offsetTop)
}

/**
 * Laptop Touch Bar: esc returns to the desk, numbered keys jump to
 * chapters, a playhead walks the path, and the OLED slot names where
 * you are. Sits at the bottom like the real strip between screen and
 * keyboard.
 */
export function JourneyBar() {
  const { ui } = useLanguage()
  const rootRef = useRef<HTMLElement>(null)
  const oledRef = useRef<HTMLSpanElement>(null)
  const keysRef = useRef<HTMLDivElement>(null)
  const last = useRef({ t: -1, id: '_', prompt: '', playing: false, intro: true })
  const stops = useRef({ w: 0, xs: [] as number[] })

  useScrollFrame((s) => {
    const root = rootRef.current
    const row = keysRef.current
    if (!root || !row) return
    const w = row.clientWidth
    if (Math.abs(w - stops.current.w) > 0.5 || stops.current.xs.length === 0) {
      const rr = row.getBoundingClientRect()
      const keys = row.querySelectorAll<HTMLElement>('.journey-esc, .journey-key')
      stops.current = {
        w,
        xs: [...keys].map((el) => {
          const r = el.getBoundingClientRect()
          return (r.left + r.width / 2 - rr.left) / Math.max(1, rr.width)
        }),
      }
    }
    const t = lerpStops(pathT(s), stops.current.xs)
    const intro = s.target < 1
    const playing = s.progress > 0.004 && intro
    const id = intro ? '' : (activeSectionCached(s.contentOffset, window.innerHeight * 0.8) ?? '')
    const prompt = id ? ui.nav[SECTION_NAV_KEYS[id as SectionId]] : ui.desk

    if (Math.abs(t - last.current.t) > 0.001) {
      last.current.t = t
      root.style.setProperty('--t', t.toFixed(4))
    }

    if (playing !== last.current.playing) {
      last.current.playing = playing
      root.classList.toggle('is-playing', playing)
    }
    if (intro !== last.current.intro) {
      last.current.intro = intro
      root.classList.toggle('is-intro', intro)
    }

    if (id !== last.current.id) {
      last.current.id = id
      root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((el) => {
        const on = el.dataset.chapter === id
        el.classList.toggle('active', on)
        if (on) el.setAttribute('aria-current', 'true')
        else el.removeAttribute('aria-current')
      })
    }
    if (prompt !== last.current.prompt) {
      last.current.prompt = prompt
      if (oledRef.current) oledRef.current.textContent = prompt
    }
  })

  return (
    <nav className="journey is-intro" ref={rootRef} aria-label={ui.path}>
      <div className="journey-keys" ref={keysRef}>
        <div className="journey-trace" aria-hidden="true">
          <div className="journey-fill" />
          <div className="journey-head" />
        </div>
        <button
          type="button"
          className="journey-esc"
          aria-label="Back to start"
          onClick={() => scrollEngine.flyTo(0)}
        >
          esc
        </button>
        {SECTION_ORDER.map((id, i) => (
          <button
            key={id}
            type="button"
            data-chapter={id}
            className="journey-key"
            aria-label={ui.nav[SECTION_NAV_KEYS[id]]}
            onClick={() => goToSection(id)}
          >
            {String(i + 1).padStart(2, '0')}
          </button>
        ))}
      </div>

      <span className="journey-oled" ref={oledRef}>
        {ui.desk}
      </span>
    </nav>
  )
}
