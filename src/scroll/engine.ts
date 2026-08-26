import Lenis from 'lenis'
import { addEffect } from '@react-three/fiber'
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

/**
 * One frame loop to rule them all.
 *
 * R3F's `addEffect` callbacks run once per frame *before* the canvas
 * renders, so Lenis, the damping pass, and every DOM subscriber all see
 * the exact same snapshot the 3D scene is about to be drawn with.
 *
 * The cinematic `progress` is never the raw scroll value: it is
 * critically-damped toward it (interruptible spring), so a violent
 * flick produces one continuous, weighted motion. The content phase
 * deliberately skips that extra damping — it reads Lenis directly, so
 * reading the CV feels like perfectly ordinary smooth scrolling.
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
  private lenis: Lenis | null = null
  private subscribers = new Set<Subscriber>()
  private removeEffect: (() => void) | null = null
  private lastTime = -1
  private smoothTime = 0.42
  private onResize = () => {
    this.cinematicLength = sceneCfg.cinematicPages * window.innerHeight
  }

  start(smoothTime: number) {
    if (this.lenis) return
    this.smoothTime = smoothTime
    this.onResize()
    window.addEventListener('resize', this.onResize)
    this.lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.4,
      autoRaf: false,
    })

    this.removeEffect = addEffect((time: number) => {
      const lenis = this.lenis
      if (!lenis) return
      lenis.raf(time)

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
    })
  }

  stop() {
    window.removeEventListener('resize', this.onResize)
    this.removeEffect?.()
    this.removeEffect = null
    this.lenis?.destroy()
    this.lenis = null
    this.lastTime = -1
  }

  subscribe(cb: Subscriber) {
    this.subscribers.add(cb)
    return () => {
      this.subscribers.delete(cb)
    }
  }

  /** Animated scroll to an absolute pixel position (nav shortcuts). */
  scrollToPx(px: number) {
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
    this.scrollToPx(progress * this.cinematicLength)
  }

  /** Critically damped spring (Unity SmoothDamp) — interruptible, no overshoot. */
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
