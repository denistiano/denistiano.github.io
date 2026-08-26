import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { invalidate } from '@react-three/fiber'
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
import { canvasHideProgress, initQuality } from './quality'

function Experience() {
  const quality = useMemo(() => initQuality(), [])
  const [extraScroll, setExtraScroll] = useState(3000)
  const [sceneLive, setSceneLive] = useState(true)
  const liveRef = useRef(true)
  const onExtraScroll = useCallback((px: number) => {
    setExtraScroll((prev) => (Math.abs(prev - px) > 1 ? px : prev))
  }, [])

  useEffect(() => {
    attachPointer()
    scrollEngine.start(sceneCfg.progressSmoothTime)
    return () => scrollEngine.stop()
  }, [])

  useScrollFrame(({ progress: p, target }) => {
    document.body.classList.toggle('dark-world', p > lerp(BEATS.darkenStart, BEATS.darkenEnd, 0.5))

    const hideAt = canvasHideProgress()
    const live = p < hideAt || target < hideAt
    if (live === liveRef.current) return
    liveRef.current = live
    scrollEngine.sceneLive = live
    setSceneLive(live)
    if (live) invalidate()
  })

  return (
    <div className="experience">
      <SceneRoot quality={quality} live={sceneLive} />
      <Hero />
      <LaptopFrame onExtraScroll={onExtraScroll} />
      <Navbar />
      <ScrollHint />
      <ProgressRail />
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
