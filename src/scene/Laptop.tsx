import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../theme'
import type { QualitySettings } from '../quality'
import { scrollEngine } from '../scroll/engine'
import { BEATS, span, smoothstep, lerp } from '../scroll/choreography'
import { ScreenCanvasTexture } from './ScreenCanvasTexture'
import { sceneRefs } from './refs'

const BODY_W = 0.6
const BODY_D = 0.42
const HINGE_Z = -BODY_D / 2 + 0.01

interface KeyDef {
  x: number
  z: number
  w: number
  d: number
}

/**
 * A realistic laptop keyboard layout: function row, staggered letter
 * rows with wide Tab/Caps/Shift/Enter, and a bottom row with a real
 * spacebar. All keys render as ONE instanced mesh (single draw call).
 */
function buildKeyLayout(): KeyDef[] {
  const keys: KeyDef[] = []
  const GAP = 0.0045
  const usable = BODY_W - 0.09

  const row = (z: number, d: number, widths: number[]) => {
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1)
    let x = -total / 2
    for (const w of widths) {
      keys.push({ x: x + w / 2, z, w, d })
      x += w + GAP
    }
  }

  const uniform = (n: number, extra = 0) => {
    const w = (usable - extra - GAP * (n + (extra > 0 ? 1 : 0) - 1)) / n
    return Array.from({ length: n }, () => w)
  }

  // Function row: shallow keys.
  row(0.036, 0.013, uniform(14))
  // Number row + wide backspace.
  row(0.066, 0.024, [...uniform(13, 0.05), 0.05])
  // QWERTY: wide tab.
  row(0.096, 0.024, [0.05, ...uniform(13, 0.05)])
  // Home row: caps + enter.
  row(0.126, 0.024, [0.056, ...uniform(11, 0.114), 0.058])
  // Shift row.
  row(0.156, 0.024, [0.068, ...uniform(10, 0.132), 0.064])
  // Bottom row: modifiers + spacebar + arrows.
  const mod = 0.034
  row(0.186, 0.024, [mod, mod, mod, 0.155, mod, mod, mod, mod])

  return keys
}

/**
 * The star of the scene. The lid pivots at the hinge, driven purely by
 * scroll progress; the screen shows a live typing canvas texture and
 * spills light onto the desk as it opens.
 */
export function Laptop(props: {
  position?: [number, number, number]
  rotationY?: number
  quality: QualitySettings
}) {
  const lidRef = useRef<THREE.Group>(null)
  const anchorRef = useRef<THREE.Group>(null)
  const ledRef = useRef<THREE.Mesh>(null)
  const screenLight = useRef<THREE.PointLight>(null)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null)
  const keysRef = useRef<THREE.InstancedMesh>(null)

  const screen = useMemo(() => new ScreenCanvasTexture(), [])
  const keyLayout = useMemo(buildKeyLayout, [])
  const keyGeo = useMemo(() => new THREE.BoxGeometry(1, 0.006, 1), [])
  const keyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.graphite,
        roughness: 0.8,
        emissive: new THREE.Color('#8fb8e0'),
        emissiveIntensity: 0,
      }),
    [],
  )

  useLayoutEffect(() => {
    const mesh = keysRef.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const pos = new THREE.Vector3()
    const scale = new THREE.Vector3()
    keyLayout.forEach((k, i) => {
      pos.set(k.x, 0.028, HINGE_Z + 0.028 + k.z)
      scale.set(k.w, 1, k.d)
      m.compose(pos, q, scale)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [keyLayout])

  useFrame(({ clock }) => {
    const p = scrollEngine.state.progress
    const t = clock.elapsedTime

    // Lid: barely ajar at rest (a sliver of glow teases the visitor),
    // opens to ~108 degrees across the lid beat.
    const open = smoothstep(span(p, BEATS.lidStart, BEATS.lidEnd))
    const angle = lerp(0.055, Math.PI * 0.6, open)
    if (lidRef.current) lidRef.current.rotation.x = -angle

    // Screen paints itself only while it can actually be seen; once the
    // DOM layer has fully taken over (handoff complete) the canvas
    // repaint + texture upload is skipped entirely.
    const handoff = smoothstep(span(p, BEATS.screenEnterStart, BEATS.screenEnterEnd))
    const { quality } = props
    if (quality.liveScreen && open > 0.02 && handoff < 0.995) screen.update(t)
    if (screenMat.current) {
      screenMat.current.opacity = Math.min(1, open * 2.5) * (1 - handoff)
    }

    const breathe = quality.idleMotion
    if (screenLight.current) {
      screenLight.current.intensity = open * 1.1 + (breathe ? Math.sin(t * 2.3) * 0.03 * open : 0)
    }
    keyMat.emissiveIntensity = open * (0.22 + (breathe ? Math.sin(t * 1.8) * 0.04 : 0))

    if (ledRef.current) {
      const mat = ledRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (1 - open) * (1.4 + (breathe ? Math.sin(t * 2.1) * 1.1 : 0.4))
    }
  })

  return (
    <group position={props.position} rotation-y={props.rotationY ?? 0}>
      {/* Base */}
      <RoundedBox args={[BODY_W, 0.024, BODY_D]} radius={0.008} position={[0, 0.012, 0]} castShadow={props.quality.shadows} receiveShadow={props.quality.shadows}>
        <meshStandardMaterial color="#aeb4ba" metalness={0.35} roughness={0.5} />
      </RoundedBox>

      {/* Keyboard well */}
      <mesh position={[0, 0.0245, HINGE_Z + 0.128]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[BODY_W - 0.06, 0.215]} />
        <meshStandardMaterial color="#93999f" roughness={0.7} />
      </mesh>

      {/* Keycaps — one instanced draw call, backlit when open */}
      <instancedMesh ref={keysRef} args={[keyGeo, keyMat, keyLayout.length]} />

      {/* Speaker grilles flanking the keyboard */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (BODY_W / 2 - 0.0325), 0.0252, HINGE_Z + 0.128]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.028, 0.2]} />
          <meshStandardMaterial color="#7d838a" roughness={0.9} />
        </mesh>
      ))}

      {/* Trackpad */}
      <mesh position={[0, 0.0245, BODY_D / 2 - 0.062]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.17, 0.098]} />
        <meshStandardMaterial color="#a3a9af" roughness={0.45} metalness={0.2} />
      </mesh>

      {/* Hinge bar */}
      <mesh position={[0, 0.024, HINGE_Z - 0.004]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.011, 0.011, BODY_W - 0.14, 12]} />
        <meshStandardMaterial color={palette.graphite} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Side ports (left edge) */}
      {[0.02, 0.06].map((z) => (
        <mesh key={z} position={[-BODY_W / 2 + 0.0004, 0.012, z]}>
          <boxGeometry args={[0.0022, 0.007, 0.024]} />
          <meshStandardMaterial color="#22262b" roughness={0.6} />
        </mesh>
      ))}

      {/* Sleep LED */}
      <mesh ref={ledRef} position={[BODY_W / 2 - 0.04, 0.013, BODY_D / 2 - 0.006]}>
        <sphereGeometry args={[0.0045, 10, 10]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={1.5} />
      </mesh>

      {/* Lid — pivots at the hinge */}
      <group ref={lidRef} position={[0, 0.026, HINGE_Z]}>
        {/* Lid shell (top when closed) */}
        <RoundedBox
          args={[BODY_W, 0.016, BODY_D]}
          radius={0.007}
          position={[0, 0.008, BODY_D / 2]}
          castShadow={props.quality.shadows}
        >
          <meshStandardMaterial color="#b6bcc2" metalness={0.4} roughness={0.45} />
        </RoundedBox>

        {/* Logo on the lid's outer face */}
        <mesh position={[0, 0.0165, BODY_D / 2]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.028, 24]} />
          <meshStandardMaterial color={palette.accent} roughness={0.35} metalness={0.3} />
        </mesh>

        {/* Bezel (inner face — visible when open) */}
        <mesh position={[0, -0.0005, BODY_D / 2]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[BODY_W - 0.016, BODY_D - 0.016]} />
          <meshStandardMaterial color="#14181d" roughness={0.6} />
        </mesh>

        {/* Webcam dot at the top of the bezel */}
        <mesh position={[0, -0.0012, BODY_D - 0.014]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.0035, 12]} />
          <meshStandardMaterial color="#060a0e" roughness={0.2} emissive="#1c3040" emissiveIntensity={0.4} />
        </mesh>

        {/* Screen */}
        <mesh position={[0, -0.002, BODY_D / 2]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[BODY_W - 0.05, BODY_D - 0.055]} />
          <meshBasicMaterial ref={screenMat} map={screen.texture} transparent toneMapped={false} />
        </mesh>

        {/* Camera anchor: sits slightly in front of the screen center,
            its -z looks INTO the screen. The rig reads its world pose. */}
        <group
          ref={(g) => {
            anchorRef.current = g
            sceneRefs.screenAnchor = g
          }}
          position={[0, -0.01, BODY_D / 2]}
          rotation-x={Math.PI / 2}
        />

        {props.quality.pointLights && (
          <pointLight
            ref={screenLight}
            position={[0, -0.09, BODY_D / 2 - 0.05]}
            color="#9db8d4"
            intensity={0}
            distance={1.4}
            decay={2}
          />
        )}
      </group>
    </group>
  )
}
