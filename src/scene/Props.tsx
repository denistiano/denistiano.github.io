import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../theme'
import type { QualitySettings } from '../quality'
import { scrollEngine } from '../scroll/engine'
import { BEATS, span, smoothstep } from '../scroll/choreography'
import { mats } from './materials'

/* ------------------------------------------------------------------ */
/* Desk                                                                */
/* ------------------------------------------------------------------ */

export function Desk({ shadow }: { shadow: boolean }) {
  return (
    <group>
      <RoundedBox args={[2.3, 0.06, 1.1]} radius={0.02} position={[0, 0.72, 0]} castShadow={shadow} receiveShadow={shadow} material={mats.wood} />
      {[
        [-1.05, -0.44],
        [1.05, -0.44],
        [-1.05, 0.44],
        [1.05, 0.44],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} castShadow={shadow} material={mats.graphite}>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, -0.44]} material={mats.graphite}>
        <boxGeometry args={[2.1, 0.04, 0.04]} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Office chair                                                        */
/* ------------------------------------------------------------------ */

export function Chair({ shadow }: { shadow: boolean }) {
  return (
    <group position={[0.24, 0, -0.88]} rotation-y={0.5}>
      <RoundedBox args={[0.46, 0.08, 0.44]} radius={0.035} position={[0, 0.47, 0]} castShadow={shadow} material={mats.fabric} />
      <mesh position={[0, 0.56, 0.2]} rotation-x={0.16} material={mats.metal}>
        <boxGeometry args={[0.05, 0.18, 0.03]} />
      </mesh>
      <RoundedBox args={[0.42, 0.46, 0.06]} radius={0.03} position={[0, 0.78, 0.235]} rotation-x={0.16} castShadow={shadow} material={mats.fabric} />
      {[-0.245, 0.245].map((x) => (
        <group key={x} position={[x, 0.5, 0.02]}>
          <mesh position={[0, 0.05, 0]} material={mats.graphite}>
            <cylinderGeometry args={[0.014, 0.014, 0.12, 10]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={mats.graphiteDull}>
            <boxGeometry args={[0.05, 0.025, 0.2]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.445, 0]} material={mats.graphite}>
        <boxGeometry args={[0.15, 0.03, 0.15]} />
      </mesh>
      <mesh position={[0, 0.27, 0]} material={mats.metal}>
        <cylinderGeometry args={[0.022, 0.028, 0.36, 12]} />
      </mesh>
      <mesh position={[0, 0.08, 0]} material={mats.metal}>
        <cylinderGeometry args={[0.034, 0.04, 0.09, 12]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3
        return (
          <group key={i} rotation-y={-a}>
            <mesh position={[0.14, 0.055, 0]} rotation-z={-0.18} castShadow={shadow} material={mats.metal}>
              <boxGeometry args={[0.24, 0.028, 0.045]} />
            </mesh>
            <mesh position={[0.25, 0.028, 0]} material={mats.graphite}>
              <sphereGeometry args={[0.028, 12, 12]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Architect desk lamp: shade opens DOWN toward the desk               */
/* ------------------------------------------------------------------ */

export function Lamp(props: { position: [number, number, number]; quality: QualitySettings }) {
  const light = useRef<THREE.PointLight>(null)
  const bulb = useRef<THREE.MeshStandardMaterial>(null)
  const segs = props.quality.tier === 'low' ? 8 : 12

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = scrollEngine.state.progress
    const approach = smoothstep(span(p, BEATS.heroDissolveStart, BEATS.zoomStart))
    const breath = props.quality.idleMotion ? Math.sin(t * 1.4) * 0.12 : 0
    if (light.current) light.current.intensity = 0.55 + breath + approach * 0.9
    if (bulb.current) bulb.current.emissiveIntensity = 0.7 + breath * 1.5 + approach * 0.6
  })

  return (
    <group position={props.position} rotation-y={-2.35}>
      <mesh position={[0, 0.015, 0]} castShadow={props.quality.shadows} material={mats.graphite}>
        <cylinderGeometry args={[0.085, 0.1, 0.03, segs]} />
      </mesh>
      <mesh position={[0, 0.035, 0]} material={mats.graphite}>
        <sphereGeometry args={[0.024, segs, segs]} />
      </mesh>
      <mesh position={[0.055, 0.15, 0]} rotation-z={-0.42} material={mats.graphite}>
        <cylinderGeometry args={[0.011, 0.011, 0.26, 10]} />
      </mesh>
      <mesh position={[0.108, 0.268, 0]} material={mats.graphite}>
        <sphereGeometry args={[0.02, segs, segs]} />
      </mesh>
      <mesh position={[0.21, 0.3, 0]} rotation-z={-1.28} material={mats.graphite}>
        <cylinderGeometry args={[0.01, 0.01, 0.22, 10]} />
      </mesh>
      <group position={[0.31, 0.27, 0]} rotation-z={0.35}>
        <mesh castShadow={props.quality.shadows} material={mats.accentShade}>
          <coneGeometry args={[0.075, 0.12, segs, 1, true]} />
        </mesh>
        <mesh position={[0, -0.025, 0]}>
          <sphereGeometry args={[0.034, segs, segs]} />
          <meshStandardMaterial ref={bulb} color="#fff3d6" emissive="#ffcf8a" emissiveIntensity={0.8} />
        </mesh>
        {props.quality.pointLights && (
          <pointLight ref={light} position={[0, -0.09, 0]} color="#ffc98c" intensity={0.6} distance={1.9} decay={2} />
        )}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Mug: open cup, visible coffee, proper C-handle, steam               */
/* ------------------------------------------------------------------ */

export function Mug(props: { position: [number, number, number]; quality: QualitySettings }) {
  const puffs = useRef<THREE.Group>(null)
  const N = 5
  const segs = props.quality.tier === 'low' ? 10 : 16

  useFrame(({ clock }) => {
    if (!props.quality.steam || !puffs.current) return
    const t = clock.elapsedTime
    puffs.current.children.forEach((puff, i) => {
      const cycle = 3.6
      const local = ((t * 0.9 + i * (cycle / N)) % cycle) / cycle
      puff.position.y = 0.105 + local * 0.16
      puff.position.x = Math.sin(local * Math.PI * 3 + i * 1.7) * 0.013
      puff.scale.setScalar(0.5 + local * 0.9)
      const m = (puff as THREE.Mesh).material as THREE.MeshStandardMaterial
      m.opacity = 0.38 * Math.sin(local * Math.PI)
    })
  })

  return (
    <group position={props.position}>
      <mesh position={[0, 0.0475, 0]} castShadow={props.quality.shadows} material={mats.clay}>
        <cylinderGeometry args={[0.042, 0.036, 0.095, segs, 1, true]} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation-x={-Math.PI / 2} material={mats.claySolid}>
        <circleGeometry args={[0.036, segs]} />
      </mesh>
      <mesh position={[0, 0.095, 0]} rotation-x={Math.PI / 2} material={mats.claySolid}>
        <torusGeometry args={[0.042, 0.0035, 8, segs]} />
      </mesh>
      <mesh position={[0, 0.078, 0]} rotation-x={-Math.PI / 2} material={mats.coffee}>
        <circleGeometry args={[0.0405, segs]} />
      </mesh>
      <mesh position={[0.033, 0.05, 0]} rotation-z={-Math.PI / 2} material={mats.claySolid}>
        <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
      </mesh>
      {props.quality.steam && (
        <group ref={puffs}>
          {Array.from({ length: N }).map((_, i) => (
            <mesh key={i} position={[0, 0.11, 0]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Plant: low-poly foliage cluster rooted in its pot                   */
/* ------------------------------------------------------------------ */

export function Plant(props: { position: [number, number, number]; quality: QualitySettings }) {
  const foliage = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!props.quality.idleMotion || !foliage.current) return
    const t = clock.elapsedTime
    foliage.current.rotation.z = Math.sin(t * 0.7) * 0.035
    foliage.current.rotation.x = Math.cos(t * 0.53) * 0.025
  })

  const blobs = useMemo(
    () => [
      { pos: [0, 0.16, 0], s: 0.085, dark: false },
      { pos: [0.055, 0.12, 0.02], s: 0.06, dark: true },
      { pos: [-0.05, 0.13, -0.015], s: 0.065, dark: true },
      { pos: [0.01, 0.115, 0.055], s: 0.05, dark: false },
      { pos: [-0.015, 0.21, 0.01], s: 0.055, dark: true },
    ],
    [],
  )

  return (
    <group position={props.position}>
      <mesh position={[0, 0.05, 0]} castShadow={props.quality.shadows} material={mats.terracotta}>
        <cylinderGeometry args={[0.068, 0.052, 0.1, 12]} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation-x={Math.PI / 2} material={mats.terracotta}>
        <torusGeometry args={[0.068, 0.006, 8, 16]} />
      </mesh>
      <mesh position={[0, 0.098, 0]} rotation-x={-Math.PI / 2} material={mats.soil}>
        <circleGeometry args={[0.06, 12]} />
      </mesh>
      <group ref={foliage}>
        <mesh position={[0, 0.13, 0]} material={mats.trunk}>
          <cylinderGeometry args={[0.011, 0.014, 0.09, 8]} />
        </mesh>
        {blobs.map((b, i) => (
          <mesh key={i} position={b.pos as [number, number, number]} material={b.dark ? mats.plantDark : mats.plant}>
            <icosahedronGeometry args={[b.s, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Books, notebook & pen (separated), phone with a live screen         */
/* ------------------------------------------------------------------ */

export function Books(props: { position: [number, number, number]; shadow: boolean }) {
  const books: Array<[string, number, number]> = [
    [palette.graphite, 0.3, 0],
    [palette.accent, 0.26, -0.18],
    [palette.cream, 0.28, 0.22],
  ]
  return (
    <group position={props.position}>
      {books.map(([color, w, rot], i) => (
        <mesh key={i} position={[0, 0.017 + i * 0.034, 0]} rotation-y={rot} castShadow={props.shadow}>
          <boxGeometry args={[w, 0.03, 0.2]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function Notebook(props: { position: [number, number, number]; shadow: boolean }) {
  return (
    <group position={props.position} rotation-y={0.4}>
      <mesh position={[0, 0.006, 0]} castShadow={props.shadow} material={mats.cream}>
        <boxGeometry args={[0.16, 0.012, 0.21]} />
      </mesh>
      <mesh position={[0, 0.0125, -0.085]} material={mats.accent}>
        <boxGeometry args={[0.16, 0.002, 0.03]} />
      </mesh>
      <group position={[0.13, 0.0045, 0.02]} rotation-y={-0.35}>
        <mesh rotation-z={Math.PI / 2} material={mats.accent}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.125, 10]} />
        </mesh>
        <mesh position={[0.069, 0, 0]} rotation-z={-Math.PI / 2} material={mats.graphite}>
          <coneGeometry args={[0.0045, 0.014, 10]} />
        </mesh>
      </group>
    </group>
  )
}

export function Phone(props: { position: [number, number, number]; quality: QualitySettings }) {
  const screen = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!props.quality.idleMotion || !screen.current) return
    const phase = (clock.elapsedTime % 6) / 1.4
    const pulse = phase < 1 ? Math.sin(phase * Math.PI) : 0
    screen.current.emissiveIntensity = 0.08 + pulse * 1.15
  })

  return (
    <group position={props.position} rotation-y={-0.5}>
      <RoundedBox args={[0.07, 0.008, 0.14]} radius={0.004} castShadow={props.quality.shadows}>
        <meshStandardMaterial color="#1c2126" roughness={0.3} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.0045, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.06, 0.128]} />
        <meshStandardMaterial ref={screen} color="#0c1016" emissive="#7fb4e8" emissiveIntensity={0.08} roughness={0.2} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Architect's model: static block study on a wooden plinth            */
/* ------------------------------------------------------------------ */

export function ArchModel(props: { position: [number, number, number]; shadow: boolean }) {
  const blocks = useMemo(() => {
    const rand = mulberry(3)
    const out: Array<{ x: number; z: number; h: number; accent: boolean }> = []
    for (let gx = 0; gx < 3; gx++) {
      for (let gz = 0; gz < 3; gz++) {
        out.push({
          x: (gx - 1) * 0.048,
          z: (gz - 1) * 0.048,
          h: 0.022 + rand() * 0.055,
          accent: rand() > 0.78,
        })
      }
    }
    return out
  }, [])

  return (
    <group position={props.position} rotation-y={0.5}>
      <RoundedBox args={[0.19, 0.018, 0.19]} radius={0.006} position={[0, 0.009, 0]} castShadow={props.shadow} material={mats.woodDark} />
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, 0.018 + b.h / 2, b.z]} castShadow={props.shadow} material={b.accent ? mats.accent : mats.cream}>
          <boxGeometry args={[0.032, b.h, 0.032]} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Ground                                                              */
/* ------------------------------------------------------------------ */

export function Ground({ shadow }: { shadow: boolean }) {
  return (
    <group>
      <RoundedBox args={[4.6, 0.14, 2.9]} radius={0.06} position={[0, -0.07, -0.1]} receiveShadow={shadow} material={mats.platform} />
      <mesh position={[0, -0.145, 0]} rotation-x={-Math.PI / 2} receiveShadow={shadow} material={mats.floor}>
        <circleGeometry args={[14, 24]} />
      </mesh>
    </group>
  )
}

function mulberry(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
