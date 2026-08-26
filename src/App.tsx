import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LanguageProvider } from './i18n/LanguageContext'
import { SceneRoot } from './scene/SceneRoot'
import { Hero } from './ui/Hero'
import { LaptopFrame } from './ui/LaptopFrame'
import { Navbar } from './ui/Navbar'
import { JourneyBar, ScrollHint } from './ui/Overlays'
import { BootScreen } from './ui/BootScreen'
import { StaticFallback } from './ui/StaticFallback'
import { scrollEngine } from './scroll/engine'
import { attachPointer } from './scroll/pointer'
import { useScrollFrame } from './scroll/useScrollFrame'
import { BEATS, lerp } from './scroll/choreography'
import { scene as sceneCfg } from './theme'
import { initQuality } from './quality'

const BOOT_FALLBACK_MS = 8000

function Experience() {
  const quality = useMemo(() => initQuality(), [])
  const [extraScroll, setExtraScroll] = useState(3000)
  const [sceneReady, setSceneReady] = useState(false)
  const [fontsReady, setFontsReady] = useState(() => document.fonts.status === 'loaded')
  const [bootGone, setBootGone] = useState(false)
  const sceneOnce = useRef(false)

  const onExtraScroll = useCallback((px: number) => {
    setExtraScroll((prev) => (Math.abs(prev - px) > 1 ? px : prev))
  }, [])

  const onSceneReady = useCallback(() => {
    if (sceneOnce.current) return
    sceneOnce.current = true
    setSceneReady(true)
  }, [])

  const onBootGone = useCallback(() => setBootGone(true), [])

  useEffect(() => {
    attachPointer()
    scrollEngine.start(sceneCfg.progressSmoothTime)
    return () => scrollEngine.stop()
  }, [])

  useEffect(() => {
    let live = true
    document.fonts.ready.then(() => {
      if (live) setFontsReady(true)
    })
    const t = window.setTimeout(() => {
      if (live) setFontsReady(true)
    }, 2500)
    return () => {
      live = false
      window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const fallback = window.setTimeout(() => setSceneReady(true), BOOT_FALLBACK_MS)
    return () => window.clearTimeout(fallback)
  }, [])

  useScrollFrame(({ progress: p }) => {
    document.body.classList.toggle('dark-world', p > lerp(BEATS.darkenStart, BEATS.darkenEnd, 0.5))
  })

  const bootReady = sceneReady && fontsReady

  return (
    <>
      {!bootGone && <BootScreen ready={bootReady} onGone={onBootGone} />}
      <div className="experience">
        <SceneRoot quality={quality} onReady={onSceneReady} />
        <Hero />
        <LaptopFrame onExtraScroll={onExtraScroll} />
        <Navbar />
        <ScrollHint />
        <JourneyBar />
        <div
          className="scroll-spacer"
          style={{ height: `calc(${(sceneCfg.cinematicPages + 1) * 100}vh + ${extraScroll}px)` }}
        />
      </div>
    </>
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
