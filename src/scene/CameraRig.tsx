import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { palette, scene as sceneCfg, SCREEN_H, SCREEN_W } from '../theme'
import { scrollEngine } from '../scroll/engine'
import { pointer } from '../scroll/pointer'
import { BEATS, span, smoothstep, lerp } from '../scroll/choreography'
import { sceneRefs } from './refs'

interface Key {
  p: number
  pos: THREE.Vector3
  look: THREE.Vector3
}

/**
 * One continuous camera take, keyframed over cinematic progress.
 * The final act flies to the live world pose of the laptop screen
 * anchor and SETTLES there: the closeup of the screen is the end of
 * the journey, we never leave the scene. The settle distance is
 * computed from the fov/aspect so the screen fills the viewport the
 * same way on every display.
 */
export function CameraRig() {
  const { camera, scene } = useThree()

  const keys = useMemo<Key[]>(
    () => [
      // Landing: desk composed on the right half of the frame.
      { p: 0.0, pos: new THREE.Vector3(0.55, 1.7, 3.55), look: new THREE.Vector3(-1.05, 0.72, -0.1) },
      // Drift closer while the hero dissolves; frame starts centering.
      { p: 0.34, pos: new THREE.Vector3(0.28, 1.42, 2.75), look: new THREE.Vector3(-0.45, 0.78, -0.05) },
      // Locked on the laptop.
      { p: BEATS.zoomStart, pos: new THREE.Vector3(0.02, 1.13, 1.72), look: new THREE.Vector3(-0.12, 0.86, -0.02) },
    ],
    [],
  )

  const parallax = useRef({ x: 0, y: 0 })
  const anchorPos = useMemo(() => new THREE.Vector3(), [])
  const anchorDir = useMemo(() => new THREE.Vector3(), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const targetLook = useMemo(() => new THREE.Vector3(), [])
  const bgColor = useMemo(() => new THREE.Color(palette.bg), [])
  const bgLight = useMemo(() => new THREE.Color(palette.bg), [])
  const bgDark = useMemo(() => new THREE.Color(palette.bgDark), [])

  useFrame((_, rawDt) => {
    const p = scrollEngine.state.progress
    const dt = Math.min(0.1, rawDt)

    /* ---------------- keyframed opening ---------------- */
    let i = 0
    while (i < keys.length - 1 && p > keys[i + 1].p) i++
    const a = keys[i]
    const b = keys[Math.min(i + 1, keys.length - 1)]
    const t = a === b ? 0 : smoothstep(span(p, a.p, b.p))
    targetPos.lerpVectors(a.pos, b.pos, t)
    targetLook.lerpVectors(a.look, b.look, t)

    /* -------- final act: settle on the screen closeup -------- */
    if (p > BEATS.zoomStart) {
      const anchor = sceneRefs.screenAnchor
      if (anchor) {
        anchor.updateWorldMatrix(true, false)
        anchor.getWorldPosition(anchorPos)
        anchor.getWorldDirection(anchorDir) // +z = out of the screen
      }
      const zoom = smoothstep(span(p, BEATS.zoomStart, BEATS.zoomEnd))
      // Distance where the screen fills the configured viewport share.
      const persp = camera as THREE.PerspectiveCamera
      const halfV = Math.tan((persp.fov * Math.PI) / 360)
      const dH = SCREEN_H / 2 / (halfV * sceneCfg.screenFillH)
      const dW = SCREEN_W / 2 / (halfV * persp.aspect * sceneCfg.screenFillW)
      const dist = Math.max(dH, dW)

      const lastKey = keys[keys.length - 1]
      targetPos.copy(anchorPos).addScaledVector(anchorDir, dist)
      targetPos.lerpVectors(lastKey.pos, targetPos, zoom)
      targetLook.lerpVectors(lastKey.look, anchorPos, zoom)
    }

    /* ------- mouse parallax (damped, gone by the closeup) ------- */
    const k = 1 - Math.exp(-dt / (sceneCfg.parallaxSmoothTime / 3))
    parallax.current.x += (pointer.x - parallax.current.x) * k
    parallax.current.y += (pointer.y - parallax.current.y) * k
    const amp = lerp(0.14, 0, smoothstep(span(p, 0, BEATS.zoomEnd)))
    targetPos.x += parallax.current.x * amp
    targetPos.y += -parallax.current.y * amp * 0.6

    camera.position.copy(targetPos)
    camera.lookAt(targetLook)

    /* ---------------- world darkening ---------------- */
    const darken = smoothstep(span(p, BEATS.darkenStart, BEATS.darkenEnd))
    bgColor.copy(bgLight).lerp(bgDark, darken)
    scene.background = bgColor
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(bgColor)
      scene.fog.near = lerp(7, 2.5, darken)
      scene.fog.far = lerp(18, 16, darken)
    }
  })

  return null
}
