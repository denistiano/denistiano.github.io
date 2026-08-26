import { useCallback, useEffect, useMemo, useState } from 'react'
import { LanguageProvider } from './i18n/LanguageContext'
import { SceneRoot } from './scene/SceneRoot'
import { Hero } from './ui/Hero'
import { LaptopFrame } from './ui/LaptopFrame'
import { Navbar } from './ui/Navbar'
import { ProgressRail, ScrollHint } from './ui/Overlays'
import { StaticFallback } from './ui/StaticFallback'
import { scrollEngine } from './scroll/engine'
import { attachPointer } from './scroll/pointer'
import { useScrollFrame } from './scroll/useScrollFrame'
import { BEATS, lerp } from './scroll/choreography'
import { scene as sceneCfg } from './theme'

function Experience() {
  const simplified = useMemo(
    () => window.innerWidth < 900 || navigator.hardwareConcurrency <= 4,
    [],
  )
  // Extra runway appended after the cinematic act = how far the CV
  // content inside the laptop screen can scroll.
  const [extraScroll, setExtraScroll] = useState(3000)
  const onExtraScroll = useCallback((px: number) => {
    setExtraScroll((prev) => (Math.abs(prev - px) > 1 ? px : prev))
  }, [])

  useEffect(() => {
    attachPointer()
    scrollEngine.start(sceneCfg.progressSmoothTime)
    return () => scrollEngine.stop()
  }, [])

  // Flip the DOM chrome (nav, rail) to its dark variant as the world darkens.
  useScrollFrame(({ progress: p }) => {
    document.body.classList.toggle('dark-world', p > lerp(BEATS.darkenStart, BEATS.darkenEnd, 0.5))
  })

  return (
    <div className="experience">
      <SceneRoot simplified={simplified} />
      <Hero />
      <LaptopFrame onExtraScroll={onExtraScroll} />
      <Navbar />
      <ScrollHint />
      <ProgressRail />
      {/* The only thing that actually scrolls: the cinematic runway plus
          the content's own height. One extra viewport compensates for the
          fact that max scroll = document height - viewport height. */}
      <div
        className="scroll-spacer"
        style={{ height: `calc(${(sceneCfg.cinematicPages + 1) * 100}vh + ${extraScroll}px)` }}
      />
    </div>
  )
}

export default function App() {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  return (
    <LanguageProvider>
      {reducedMotion ? <StaticFallback /> : <Experience />}
    </LanguageProvider>
  )
}
