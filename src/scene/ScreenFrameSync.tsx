import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SCREEN_H, SCREEN_W } from '../theme'
import { scrollEngine } from '../scroll/engine'
import { BEATS } from '../scroll/choreography'
import { sceneRefs } from './refs'

const INSET = 0.995
const SIGNS: Array<[number, number]> = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
]

/**
 * Projects the four corners of the laptop screen into CSS pixels and
 * pins the DOM content frame to that rectangle. Because it runs in the
 * same frame callback that moves the camera, the DOM frame and the 3D
 * screen never drift apart.
 */
export function ScreenFrameSync() {
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  const last = useMemo(() => ({ x: -1, y: -1, w: -1, h: -1 }), [])

  useFrame(() => {
    const anchor = sceneRefs.screenAnchor
    const el = sceneRefs.frameEl
    if (!anchor || !el) return
    if (scrollEngine.state.progress < BEATS.zoomStart) return
    // Phones keep the CSS fullscreen layout instead of the projection.
    if (size.width < 900) return

    anchor.updateWorldMatrix(true, false)
    camera.updateMatrixWorld()

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const [sx, sy] of SIGNS) {
      v.set((sx * SCREEN_W * INSET) / 2, (sy * SCREEN_H * INSET) / 2, 0)
      anchor.localToWorld(v)
      v.project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (1 - (v.y * 0.5 + 0.5)) * size.height
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }

    // Writing these styles dirties layout — only do it when the camera
    // actually moved the projected rectangle (it is static during the
    // whole content-reading phase).
    const w = maxX - minX
    const h = maxY - minY
    if (
      Math.abs(minX - last.x) < 0.25 &&
      Math.abs(minY - last.y) < 0.25 &&
      Math.abs(w - last.w) < 0.25 &&
      Math.abs(h - last.h) < 0.25
    ) {
      return
    }
    last.x = minX
    last.y = minY
    last.w = w
    last.h = h
    el.style.transform = 'none'
    el.style.left = `${minX.toFixed(1)}px`
    el.style.top = `${minY.toFixed(1)}px`
    el.style.width = `${w.toFixed(1)}px`
    el.style.height = `${h.toFixed(1)}px`
  })

  return null
}
