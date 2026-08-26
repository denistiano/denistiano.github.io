/**
 * The experience has two acts:
 *
 *  1. CINEMATIC: one downward gesture plays a locked, timed camera take
 *     (progress 0 -> 1). Wheel intensity cannot skip or scrub it.
 *  2. CONTENT: after the camera settles on the laptop screen, scrolling
 *     is normal — remaining distance translates the CV inside the screen.
 */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Normalized position of `p` inside [a, b], clamped. */
export const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

export const smoothstep = (t: number) => t * t * (3 - 2 * t)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** 0 -> 1 -> 0 bump inside [a, b] with eased edges (fade fraction f). */
export function bump(p: number, a: number, b: number, f = 0.18) {
  const t = span(p, a, b)
  if (t <= 0 || t >= 1) return 0
  const fadeIn = smoothstep(clamp01(t / f))
  const fadeOut = smoothstep(clamp01((1 - t) / f))
  return Math.min(fadeIn, fadeOut)
}

/** Cinematic beats (fractions of the cinematic act, NOT the whole page). */
export const BEATS = {
  /** Landing hold: hero fully visible, scene idling. */
  heroHoldEnd: 0.08,
  /** Hero text dissolves across this range. */
  heroDissolveStart: 0.08,
  heroDissolveEnd: 0.34,
  /** Laptop lid opens. */
  lidStart: 0.26,
  lidEnd: 0.62,
  /** Camera locks onto the screen and settles into the closeup. */
  zoomStart: 0.55,
  zoomEnd: 0.96,
  /** The DOM content layer crossfades in over the 3D screen texture. */
  screenEnterStart: 0.86,
  screenEnterEnd: 0.99,
  /** World background shifts from daylight to screen-dark. */
  darkenStart: 0.58,
  darkenEnd: 0.9,
} as const
