import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { palette } from '../theme'
import { scrollEngine } from '../scroll/engine'
import { BEATS, span, smoothstep } from '../scroll/choreography'

/* ------------------------------------------------------------------ */
/* Desk                                                                */
/* ------------------------------------------------------------------ */

export function Desk() {
  return (
    <group>
      <RoundedBox args={[2.3, 0.06, 1.1]} radius={0.02} position={[0, 0.72, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.deskWood} roughness={0.75} />
      </RoundedBox>
      {[
        [-1.05, -0.44],
        [1.05, -0.44],
        [-1.05, 0.44],
        [1.05, 0.44],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} castShadow>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshStandardMaterial color={palette.graphite} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, -0.44]}>
        <boxGeometry args={[2.1, 0.04, 0.04]} />
        <meshStandardMaterial color={palette.graphite} roughness={0.6} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Office chair                                                        */
/* ------------------------------------------------------------------ */

const chairFabric = '#343a44'
const chairMetal = '#9aa0a6'

export function Chair() {
  return (
    <group position={[0.24, 0, -0.88]} rotation-y={0.5}>
      {/* Seat */}
      <RoundedBox args={[0.46, 0.08, 0.44]} radius={0.035} position={[0, 0.47, 0]} castShadow>
        <meshStandardMaterial color={chairFabric} roughness={0.85} />
      </RoundedBox>
      {/* Backrest, gently reclined, on a support bracket */}
      <mesh position={[0, 0.56, 0.2]} rotation-x={0.16}>
        <boxGeometry args={[0.05, 0.18, 0.03]} />
        <meshStandardMaterial color={chairMetal} metalness={0.5} roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.42, 0.46, 0.06]} radius={0.03} position={[0, 0.78, 0.235]} rotation-x={0.16} castShadow>
        <meshStandardMaterial color={chairFabric} roughness={0.85} />
      </RoundedBox>
      {/* Armrests */}
      {[-0.245, 0.245].map((x) => (
        <group key={x} position={[x, 0.5, 0.02]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.12, 10]} />
            <meshStandardMaterial color={palette.graphite} roughness={0.6} />
          </mesh>
          <RoundedBox args={[0.05, 0.025, 0.2]} radius={0.01} position={[0, 0.12, 0]} castShadow>
            <meshStandardMaterial color={palette.graphite} roughness={0.7} />
          </RoundedBox>
        </group>
      ))}
      {/* Gas lift + mount plate + five-star base with casters */}
      <RoundedBox args={[0.15, 0.03, 0.15]} radius={0.008} position={[0, 0.445, 0]}>
        <meshStandardMaterial color={palette.graphite} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.36, 12]} />
        <meshStandardMaterial color={chairMetal} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.034, 0.04, 0.09, 12]} />
        <meshStandardMaterial color={chairMetal} metalness={0.6} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3
        return (
          <group key={i} rotation-y={-a}>
            <mesh position={[0.14, 0.055, 0]} rotation-z={-0.18} castShadow>
              <boxGeometry args={[0.24, 0.028, 0.045]} />
              <meshStandardMaterial color={chairMetal} metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0.25, 0.028, 0]}>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshStandardMaterial color={palette.graphite} roughness={0.5} />
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

export function Lamp(props: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null)
  const bulb = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = scrollEngine.state.progress
    const approach = smoothstep(span(p, BEATS.heroDissolveStart, BEATS.zoomStart))
    const breath = 0.55 + Math.sin(t * 1.4) * 0.12 + approach * 0.9
    if (light.current) light.current.intensity = breath
    if (bulb.current) bulb.current.emissiveIntensity = 0.7 + Math.sin(t * 1.4) * 0.18 + approach * 0.6
  })

  return (
    <group position={props.position} rotation-y={-2.35}>
      {/* Base */}
      <mesh position={[0, 0.015, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.1, 0.03, 24]} />
        <meshStandardMaterial color={palette.graphite} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshStandardMaterial color={palette.graphite} roughness={0.5} />
      </mesh>
      {/* Lower arm: leans forward (+x) */}
      <mesh position={[0.055, 0.15, 0]} rotation-z={-0.42}>
        <cylinderGeometry args={[0.011, 0.011, 0.26, 10]} />
        <meshStandardMaterial color={palette.graphite} roughness={0.5} />
      </mesh>
      <mesh position={[0.108, 0.268, 0]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color={palette.graphite} roughness={0.5} />
      </mesh>
      {/* Upper arm: continues forward and slightly down */}
      <mesh position={[0.21, 0.3, 0]} rotation-z={-1.28}>
        <cylinderGeometry args={[0.01, 0.01, 0.22, 10]} />
        <meshStandardMaterial color={palette.graphite} roughness={0.5} />
      </mesh>
      {/* Head: cone apex UP, opening DOWN over the desk */}
      <group position={[0.31, 0.27, 0]} rotation-z={0.35}>
        <mesh castShadow>
          <coneGeometry args={[0.075, 0.12, 24, 1, true]} />
          <meshStandardMaterial color={palette.accent} roughness={0.55} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.025, 0]}>
          <sphereGeometry args={[0.034, 14, 14]} />
          <meshStandardMaterial ref={bulb} color="#fff3d6" emissive="#ffcf8a" emissiveIntensity={0.8} />
        </mesh>
        <pointLight ref={light} position={[0, -0.09, 0]} color="#ffc98c" intensity={0.6} distance={1.9} decay={2} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Mug: open cup, visible coffee, proper C-handle, steam               */
/* ------------------------------------------------------------------ */

export function Mug(props: { position: [number, number, number] }) {
  const puffs = useRef<THREE.Group>(null)
  const N = 5

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!puffs.current) return
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
      {/* Wall (open top, inside visible) */}
      <mesh position={[0, 0.0475, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.036, 0.095, 24, 1, true]} />
        <meshStandardMaterial color={palette.mugClay} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.002, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.036, 24]} />
        <meshStandardMaterial color={palette.mugClay} roughness={0.75} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.095, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.042, 0.0035, 10, 28]} />
        <meshStandardMaterial color={palette.mugClay} roughness={0.7} />
      </mesh>
      {/* Coffee surface, a little below the rim */}
      <mesh position={[0, 0.078, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.0405, 24]} />
        <meshStandardMaterial color="#3d2417" roughness={0.25} />
      </mesh>
      {/* C-handle: ends sunk into the cup wall */}
      <mesh position={[0.033, 0.05, 0]} rotation-z={-Math.PI / 2}>
        <torusGeometry args={[0.025, 0.006, 10, 20, Math.PI]} />
        <meshStandardMaterial color={palette.mugClay} roughness={0.75} />
      </mesh>
      <group ref={puffs}>
        {Array.from({ length: N }).map((_, i) => (
          <mesh key={i} position={[0, 0.11, 0]}>
            <sphereGeometry args={[0.012, 10, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Plant: low-poly foliage cluster rooted in its pot                   */
/* ------------------------------------------------------------------ */

export function Plant(props: { position: [number, number, number] }) {
  const foliage = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (foliage.current) {
      foliage.current.rotation.z = Math.sin(t * 0.7) * 0.035
      foliage.current.rotation.x = Math.cos(t * 0.53) * 0.025
    }
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
      {/* Pot */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.068, 0.052, 0.1, 18]} />
        <meshStandardMaterial color={palette.potTerracotta} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.068, 0.006, 10, 22]} />
        <meshStandardMaterial color={palette.potTerracotta} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.098, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.06, 18]} />
        <meshStandardMaterial color="#4a3826" roughness={1} />
      </mesh>
      {/* Trunk + foliage */}
      <group ref={foliage}>
        <mesh position={[0, 0.13, 0]} castShadow>
          <cylinderGeometry args={[0.011, 0.014, 0.09, 8]} />
          <meshStandardMaterial color="#7a5b3a" roughness={0.9} />
        </mesh>
        {blobs.map((b, i) => (
          <mesh key={i} position={b.pos as [number, number, number]} castShadow>
            <icosahedronGeometry args={[b.s, 0]} />
            <meshStandardMaterial
              color={b.dark ? palette.plantGreenDark : palette.plantGreen}
              roughness={0.85}
              flatShading
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Books, notebook & pen (separated), phone with a live screen         */
/* ------------------------------------------------------------------ */

export function Books(props: { position: [number, number, number] }) {
  const books: Array<[string, number, number]> = [
    [palette.graphite, 0.3, 0],
    [palette.accent, 0.26, -0.18],
    [palette.cream, 0.28, 0.22],
  ]
  return (
    <group position={props.position}>
      {books.map(([color, w, rot], i) => (
        <mesh key={i} position={[0, 0.017 + i * 0.034, 0]} rotation-y={rot} castShadow>
          <boxGeometry args={[w, 0.03, 0.2]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function Notebook(props: { position: [number, number, number] }) {
  return (
    <group position={props.position} rotation-y={0.4}>
      {/* Pad */}
      <mesh position={[0, 0.006, 0]} castShadow>
        <boxGeometry args={[0.16, 0.012, 0.21]} />
        <meshStandardMaterial color={palette.cream} roughness={0.9} />
      </mesh>
      {/* Cover stripe */}
      <mesh position={[0, 0.0125, -0.085]}>
        <boxGeometry args={[0.16, 0.002, 0.03]} />
        <meshStandardMaterial color={palette.accent} roughness={0.6} />
      </mesh>
      {/* Pen lying on the desk BESIDE the pad */}
      <group position={[0.13, 0.0045, 0.02]} rotation-y={-0.35}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.125, 10]} />
          <meshStandardMaterial color={palette.accent} roughness={0.4} />
        </mesh>
        <mesh position={[0.069, 0, 0]} rotation-z={-Math.PI / 2}>
          <coneGeometry args={[0.0045, 0.014, 10]} />
          <meshStandardMaterial color={palette.graphite} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

export function Phone(props: { position: [number, number, number] }) {
  const screen = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!screen.current) return
    // A notification arrives every ~6s: the screen lights up, then dims.
    const phase = (clock.elapsedTime % 6) / 1.4
    const pulse = phase < 1 ? Math.sin(phase * Math.PI) : 0
    screen.current.emissiveIntensity = 0.08 + pulse * 1.15
  })

  return (
    <group position={props.position} rotation-y={-0.5}>
      <RoundedBox args={[0.07, 0.008, 0.14]} radius={0.004} castShadow>
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

export function ArchModel(props: { position: [number, number, number] }) {
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
      <RoundedBox args={[0.19, 0.018, 0.19]} radius={0.006} position={[0, 0.009, 0]} castShadow>
        <meshStandardMaterial color={palette.deskWoodDark} roughness={0.7} />
      </RoundedBox>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, 0.018 + b.h / 2, b.z]} castShadow>
          <boxGeometry args={[0.032, b.h, 0.032]} />
          <meshStandardMaterial color={b.accent ? palette.accent : palette.cream} roughness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Floating accent shapes                                              */
/* ------------------------------------------------------------------ */

export function FloatingShapes() {
  const group = useRef<THREE.Group>(null)

  const shapes = useMemo(
    () => [
      { pos: [1.9, 1.95, -0.7], kind: 'torus', color: palette.accent, s: 0.09 },
      { pos: [-1.55, 1.45, -1.1], kind: 'box', color: palette.graphite, s: 0.09 },
      { pos: [1.5, 1.2, 0.8], kind: 'sphere', color: palette.accent, s: 0.055 },
      { pos: [-1.9, 2.0, -0.4], kind: 'sphere', color: palette.metal, s: 0.05 },
      { pos: [0.8, 2.3, -1.2], kind: 'torus', color: palette.metal, s: 0.07 },
    ],
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current?.children.forEach((c, i) => {
      c.position.y = (shapes[i].pos[1] as number) + Math.sin(t * 0.6 + i * 2.1) * 0.06
      c.rotation.x = t * 0.2 + i
      c.rotation.y = t * 0.26 + i * 0.7
    })
  })

  return (
    <group ref={group}>
      {shapes.map((s, i) => (
        <mesh key={i} position={s.pos as [number, number, number]} castShadow>
          {s.kind === 'torus' ? (
            <torusGeometry args={[s.s, s.s * 0.38, 10, 24]} />
          ) : s.kind === 'box' ? (
            <boxGeometry args={[s.s, s.s, s.s]} />
          ) : (
            <sphereGeometry args={[s.s, 18, 18]} />
          )}
          <meshStandardMaterial color={s.color} roughness={0.55} flatShading={s.kind === 'sphere'} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Ground                                                              */
/* ------------------------------------------------------------------ */

export function Ground() {
  return (
    <group>
      <RoundedBox args={[4.6, 0.14, 2.9]} radius={0.06} position={[0, -0.07, -0.1]} receiveShadow>
        <meshStandardMaterial color={palette.platform} roughness={0.95} />
      </RoundedBox>
      <mesh position={[0, -0.145, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color={palette.floor} roughness={1} />
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
