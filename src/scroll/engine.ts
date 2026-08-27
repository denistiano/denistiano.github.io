import Lenis from 'lenis'
import { invalidate } from '@react-three/fiber'
import { scene as sceneCfg } from '../theme'

export interface ScrollState {
  /** Smoothed scroll position in px, straight from Lenis. */
  scroll: number
  /** Raw normalized cinematic progress (0-1) from Lenis. */
  target: number
  /** Smooth-damped cinematic progress — the value the 3D scene reads. */
  progress: number
  /** Damped velocity in progress units / second. */
  velocity: number
  /** Px scrolled past the cinematic act — drives normal content scroll. */
  contentOffset: number
  /** 0-1 across the WHOLE page (progress rail). */
  total: number
}

type Subscriber = (state: ScrollState, dt: number) => void
type Phase = 'intro' | 'playing' | 'content'

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Own rAF, independent of the WebGL canvas.
 *
 * Intro: one downward gesture plays the full cinematic on a locked
 * timeline (wheel intensity cannot skip it). After that, Lenis is
 * normal scrolling inside the laptop. WebGL is `invalidate()`-d while
 * the camera is moving; the last frame stays visible behind the CV.
 */
class ScrollEngine {
  readonly state: ScrollState = {
    scroll: 0,
    target: 0,
    progress: 0,
    velocity: 0,
    contentOffset: 0,
    total: 0,
  }
  cinematicLength = sceneCfg.cinematicPages * (typeof window !== 'undefined' ? window.innerHeight : 800)
  private phase: Phase = 'intro'
  private lenis: Lenis | null = null
  private subscribers = new Set<Subscriber>()
  private lastTime = -1
  private smoothTime = 0.42
  private rafId = 0
  private afterPlay: (() => void) | null = null
  /** Last user scroll/key time — reverse only after a pause at the top. */
  private lastInput = 0
  /** Cinematic stays locked until the boot screen arms the engine. */
  private armed = false
  private sceneLiveListeners = new Set<(live: boolean) => void>()

  /** True after the cinematic lands and the visitor is reading the CV. */
  isContent() {
    return this.phase === 'content'
  }

  /**
   * Phone content is a fullscreen DOM overlay — keep WebGL off so the
   * GPU is not compositing a hidden desk behind it.
   */
  sceneLive() {
    return this.phase !== 'content' || window.innerWidth >= 900
  }

  onSceneLive(cb: (live: boolean) => void) {
    this.sceneLiveListeners.add(cb)
    cb(this.sceneLive())
    return () => {
      this.sceneLiveListeners.delete(cb)
    }
  }

  private syncScenePark() {
    if (typeof document === 'undefined') return
    const live = this.sceneLive()
    document.documentElement.classList.toggle('scene-parked', !live)
    for (const cb of this.sceneLiveListeners) cb(live)
  }

  private onResize = () => {
    this.cinematicLength = sceneCfg.cinematicPages * window.innerHeight
    this.syncScenePark()
    if (this.sceneLive()) invalidate()
  }

  private onVisibility = () => {
    if (document.hidden) this.cancel()
    else this.loop()
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    const down = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar'
    const up = e.key === 'ArrowUp' || e.key === 'PageUp'

    if (this.phase === 'playing') {
      if (down || up) e.preventDefault()
      return
    }
    if (!this.armed) {
      if (down || up) e.preventDefault()
      return
    }
    if (this.phase === 'intro' && down) {
      e.preventDefault()
      this.playCinematic()
      return
    }
    if (this.phase === 'content' && up && this.atContentStart() && this.reverseReady()) {
      e.preventDefault()
      this.playReverse()
      return
    }
    this.lastInput = performance.now()
  }

  start(smoothTime: number) {
    if (this.lenis) return
    this.smoothTime = smoothTime
    this.onResize()
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)
    window.addEventListener('keydown', this.onKeyDown, { passive: false })
    this.lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.4,
      autoRaf: false,
      virtualScroll: this.onVirtualScroll,
    })
    this.syncScenePark()
    this.loop()
  }

  stop() {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    window.removeEventListener('keydown', this.onKeyDown)
    this.cancel()
    this.lenis?.destroy()
    this.lenis = null
    this.lastTime = -1
    this.phase = 'intro'
    this.afterPlay = null
    this.lastInput = 0
    this.armed = false
    this.syncScenePark()
  }

  /** Allow the first cinematic once the scene has finished booting. */
  arm() {
    this.armed = true
  }

  subscribe(cb: Subscriber) {
    this.subscribers.add(cb)
    return () => {
      this.subscribers.delete(cb)
    }
  }

  /** Play the landing cinematic, then optionally continue to a content offset. */
  playCinematic(then?: () => void) {
    if (!this.armed) return
    if (this.phase === 'playing') {
      if (then) this.afterPlay = then
      return
    }
    if (this.phase === 'content') {
      then?.()
      return
    }
    const lenis = this.lenis
    if (!lenis) return
    this.phase = 'playing'
    this.afterPlay = then ?? null
    this.lastInput = performance.now()
    lenis.scrollTo(this.cinematicLength, {
      duration: sceneCfg.cinematicDuration,
      easing: easeInOutCubic,
      lock: true,
      programmatic: true,
      onComplete: this.finishPlay,
    })
  }

  /** Reverse the cinematic back to the landing. */
  playReverse() {
    if (this.phase === 'playing' || this.phase === 'intro') return
    const lenis = this.lenis
    if (!lenis) return
    this.phase = 'playing'
    this.afterPlay = null
    this.lastInput = performance.now()
    this.syncScenePark()
    invalidate()
    lenis.scrollTo(0, {
      duration: sceneCfg.cinematicDuration,
      easing: easeInOutCubic,
      lock: true,
      programmatic: true,
      onComplete: () => {
        this.phase = 'intro'
        this.snapProgress()
        this.syncScenePark()
        invalidate()
      },
    })
  }

  /** Animated scroll to an absolute pixel position (nav shortcuts). */
  scrollToPx(px: number) {
    if (!this.armed) return
    if (px >= this.cinematicLength - 1 && this.phase !== 'content') {
      this.playCinematic(() => this.scrollToPx(px))
      return
    }
    const lenis = this.lenis
    if (!lenis) return
    const distance = Math.abs(px - lenis.scroll) / Math.max(1, window.innerHeight)
    lenis.scrollTo(px, {
      duration: Math.min(3.2, 0.9 + distance * 0.28),
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      lock: true,
    })
  }

  /** Fly to a cinematic progress position (0-1). */
  flyTo(progress: number) {
    if (!this.armed) return
    if (progress <= 0) {
      if (this.phase === 'intro') return
      const lenis = this.lenis
      if (this.phase === 'content' && !this.atContentStart() && lenis) {
        lenis.scrollTo(0, { immediate: true })
        this.phase = 'intro'
        this.snapProgress()
        this.syncScenePark()
        invalidate()
        return
      }
      this.playReverse()
      return
    }
    if (progress >= 1) {
      this.playCinematic()
      return
    }
    this.scrollToPx(progress * this.cinematicLength)
  }

  notePointer() {
    if (document.hidden) return
    if (this.state.progress >= 1 && this.state.target >= 1 && this.phase === 'content') return
    invalidate()
  }

  private onVirtualScroll = ({ deltaY }: { deltaY: number }) => {
    if (!this.armed || this.phase === 'playing') return true
    if (this.phase === 'intro') {
      if (deltaY > 0.5) this.playCinematic()
      return true
    }
    const now = performance.now()
    if (deltaY < -0.5 && this.atContentStart()) {
      if (now - this.lastInput > 420) this.playReverse()
      this.lastInput = now
      return true
    }
    this.lastInput = now
    return true
  }

  private finishPlay = () => {
    this.phase = 'content'
    this.lastInput = performance.now()
    this.snapProgress()
    this.syncScenePark()
    if (this.sceneLive()) invalidate()
    const next = this.afterPlay
    this.afterPlay = null
    next?.()
  }

  private atContentStart() {
    const lenis = this.lenis
    if (!lenis) return false
    return lenis.scroll <= this.cinematicLength + 4
  }

  private reverseReady() {
    return performance.now() - this.lastInput > 420
  }

  private snapProgress() {
    const s = this.state
    s.progress = s.target
    s.velocity = 0
  }

  private loop() {
    if (this.rafId || document.hidden || !this.lenis) return
    this.rafId = requestAnimationFrame(this.tick)
  }

  private cancel() {
    if (!this.rafId) return
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
  }

  private tick = (time: number) => {
    this.rafId = 0
    const lenis = this.lenis
    if (!lenis) return

    lenis.raf(time)

    if (this.phase === 'content' && lenis.scroll < this.cinematicLength) {
      lenis.scrollTo(this.cinematicLength, { immediate: true })
    }

    const s = this.state
    s.scroll = lenis.scroll
    s.target = clamp01(lenis.scroll / this.cinematicLength)
    s.contentOffset = Math.max(0, lenis.scroll - this.cinematicLength)
    s.total = clamp01(lenis.scroll / Math.max(1, lenis.limit))

    if (this.lastTime < 0) this.lastTime = time
    const dt = Math.min(0.1, Math.max(0.0005, (time - this.lastTime) / 1000))
    this.lastTime = time

    this.damp(dt)
    for (const cb of this.subscribers) cb(s, dt)

    const moving =
      this.phase === 'playing' ||
      Math.abs(s.velocity) > 1e-4 ||
      Math.abs(s.progress - s.target) > 1e-4
    if (moving && this.sceneLive()) invalidate()

    this.loop()
  }

  private damp(dt: number) {
    const s = this.state
    const omega = 2 / this.smoothTime
    const x = omega * dt
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
    const change = s.progress - s.target
    const temp = (s.velocity + omega * change) * dt
    s.velocity = (s.velocity - omega * temp) * exp
    s.progress = s.target + (change + temp) * exp
    if (Math.abs(s.progress - s.target) < 1e-6) {
      s.progress = s.target
      s.velocity = 0
    }
  }
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export const scrollEngine = new ScrollEngine()
