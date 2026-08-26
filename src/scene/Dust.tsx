import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const dummy = new THREE.Object3D()

/**
 * Slow-drifting dust motes in a volume around the desk — the cheapest
 * possible way to make still air feel alive. One instanced draw call.
 */
export function Dust({ count = 70 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  const seeds = useMemo(() => {
    const arr: Array<{ x: number; y: number; z: number; speed: number; phase: number; scale: number }> = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 4.4,
        y: Math.random() * 2.6,
        z: (Math.random() - 0.5) * 2.6,
        speed: 0.02 + Math.random() * 0.045,
        phase: Math.random() * Math.PI * 2,
        scale: 0.4 + Math.random() * 0.8,
      })
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const m = mesh.current
    if (!m) return
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      const y = (s.y + t * s.speed) % 2.6
      dummy.position.set(
        s.x + Math.sin(t * 0.3 + s.phase) * 0.08,
        y + 0.1,
        s.z + Math.cos(t * 0.24 + s.phase) * 0.08,
      )
      dummy.scale.setScalar(s.scale)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.006, 6, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  )
}
