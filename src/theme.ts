/**
 * Single source of truth for the visual language.
 * CSS custom properties mirror these values in index.css.
 */
export const palette = {
  // Page / world
  bg: '#f1eee8',
  bgDark: '#101418',
  ink: '#181b1e',
  inkSoft: '#5a5f63',
  accent: '#d97b29',
  accentSoft: '#eab308',

  // Desk scene materials
  deskWood: '#c99e6d',
  deskWoodDark: '#a8814f',
  graphite: '#2a2e33',
  cream: '#efe9dd',
  metal: '#8f959b',
  plantGreen: '#7fa16b',
  plantGreenDark: '#5c7d4c',
  potTerracotta: '#c4744a',
  mugClay: '#d8cfc0',
  screenGlow: '#131a22',
  screenText: '#d97b29',
  platform: '#e4dfd6',
  floor: '#eae6de',
} as const

export const scene = {
  /** Camera field of view (deg). Narrow-ish for a product-shot look. */
  fov: 34,
  /** Damping smooth-time for scroll progress (seconds). Higher = heavier feel. */
  progressSmoothTime: 0.42,
  /** Damping for mouse parallax. */
  parallaxSmoothTime: 0.6,
  /** Length of the cinematic act in viewport heights. Content scroll is appended after it. */
  cinematicPages: 5,
  /** Timed play-through of the cinematic after one scroll gesture (seconds). */
  cinematicDuration: 5.4,
  /** How much of the viewport the laptop LID fills in the final closeup.
      Sized so the physical bezel stays on-screen around the glass. */
  screenFillH: 0.86,
  screenFillW: 0.9,
} as const

/** World-space size of the laptop screen plane (must match Laptop.tsx). */
export const SCREEN_W = 0.55
export const SCREEN_H = 0.365
/** Lid shell — slightly larger than the glass, used to frame the closeup. */
export const LID_W = 0.6
export const LID_H = 0.42
