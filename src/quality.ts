export type QualityTier = 'high' | 'medium' | 'low'

export interface QualitySettings {
  tier: QualityTier
  dpr: [number, number]
  shadows: boolean
  shadowMapSize: number
  antialias: boolean
  dust: number
  pointLights: boolean
  steam: boolean
  idleMotion: boolean
  liveScreen: boolean
  powerPreference: WebGLPowerPreference
}

const HIGH: QualitySettings = {
  tier: 'high',
  dpr: [1, 1.5],
  shadows: true,
  shadowMapSize: 1024,
  antialias: true,
  dust: 40,
  pointLights: true,
  steam: true,
  idleMotion: true,
  liveScreen: true,
  powerPreference: 'high-performance',
}

const MEDIUM: QualitySettings = {
  tier: 'medium',
  dpr: [1, 1.5],
  shadows: false,
  shadowMapSize: 512,
  antialias: false,
  dust: 20,
  pointLights: false,
  steam: false,
  idleMotion: true,
  liveScreen: true,
  powerPreference: 'low-power',
}

const LOW: QualitySettings = {
  tier: 'low',
  // 1× on a 2–3× phone looks like a mosaic. Cap at 2 so retina is
  // readable without native-resolution fill (the scene also parks
  // itself during mobile content, so this cost is only the landing).
  dpr: [1, 2],
  shadows: false,
  shadowMapSize: 512,
  antialias: false,
  dust: 0,
  pointLights: false,
  steam: false,
  idleMotion: false,
  liveScreen: false,
  powerPreference: 'low-power',
}

let current: QualitySettings = HIGH

export function getQuality() {
  return current
}

export function initQuality() {
  current = detectQuality()
  return current
}

export function detectQuality(): QualitySettings {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory
  const saveData = Boolean(nav.connection?.saveData)
  const narrow = window.innerWidth < 900
  const coarse = window.matchMedia('(pointer: coarse)').matches

  if (saveData || cores <= 2 || (mem !== undefined && mem <= 2)) {
    return { ...LOW, dpr: [1, 1.25] }
  }
  if ((mem !== undefined && mem <= 4) || (narrow && coarse)) {
    return LOW
  }
  if (narrow || cores <= 4 || (mem !== undefined && mem <= 8)) {
    return MEDIUM
  }
  return HIGH
}
