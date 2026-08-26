import { useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, invalidate, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { palette, scene as sceneCfg } from '../theme'
import type { QualitySettings } from '../quality'
import { scrollEngine } from '../scroll/engine'
import { CameraRig } from './CameraRig'
import { ScreenFrameSync } from './ScreenFrameSync'
import { Laptop } from './Laptop'
import {
  ArchModel,
  Books,
  Chair,
  Desk,
  Ground,
  Lamp,
  Mug,
  Notebook,
  Phone,
  Plant,
  DeskPhoto,
} from './Props'
import { Dust } from './Dust'

function KeyLight({ quality }: { quality: QualitySettings }) {
  const ref = useRef<THREE.DirectionalLight>(null)

  useLayoutEffect(() => {
    const light = ref.current
    if (!light || !quality.shadows) return
    light.shadow.autoUpdate = false
    light.shadow.needsUpdate = true
  }, [quality.shadows])

  useFrame(() => {
    if (!quality.shadows) return
    const light = ref.current
    if (!light) return
    if (Math.abs(scrollEngine.state.velocity) > 1e-4) {
      light.shadow.needsUpdate = true
    }
  })

  return (
    <directionalLight
      ref={ref}
      position={[3.2, 5.5, 2.6]}
      intensity={1.35}
      castShadow={quality.shadows}
      shadow-mapSize={[quality.shadowMapSize, quality.shadowMapSize]}
      shadow-camera-left={-3.4}
      shadow-camera-right={3.4}
      shadow-camera-top={3.4}
      shadow-camera-bottom={-3.4}
      shadow-camera-far={14}
      shadow-bias={-0.0004}
    />
  )
}

function Warmup({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree()
  const phase = useRef(0)
  const flushes = useRef(0)
  const sent = useRef(false)

  useEffect(() => {
    let live = true
    const finish = () => {
      if (!live) return
      phase.current = 1
      invalidate()
    }
    const run = async () => {
      try {
        const asyncCompile = (
          gl as THREE.WebGLRenderer & {
            compileAsync?: (s: THREE.Scene, c: THREE.Camera) => Promise<void>
          }
        ).compileAsync
        if (asyncCompile) await asyncCompile.call(gl, scene, camera)
        else gl.compile(scene, camera)
      } catch {
        /* compile is best-effort — still flush a couple of frames */
      }
      finish()
    }
    void run()
    invalidate()
    return () => {
      live = false
    }
  }, [gl, scene, camera])

  useFrame(() => {
    if (sent.current) return
    if (phase.current === 0) {
      invalidate()
      return
    }
    flushes.current++
    if (flushes.current < 2) {
      invalidate()
      return
    }
    sent.current = true
    onReady()
  })

  return null
}

function DeskWorld({ quality }: { quality: QualitySettings }) {
  const shadow = quality.shadows
  return (
    <>
      <group>
        <Ground shadow={shadow} />
        <Desk shadow={shadow} />
        <Chair shadow={shadow} />
        <Laptop position={[-0.12, 0.75, -0.02]} rotationY={-0.12} quality={quality} />
        <Lamp position={[0.78, 0.75, -0.3]} quality={quality} />
        <Mug position={[0.5, 0.75, 0.26]} quality={quality} />
        <Plant position={[-0.85, 0.75, -0.32]} quality={quality} />
        <Books position={[0.95, 0.75, 0.1]} shadow={shadow} />
        <Notebook position={[0.34, 0.75, 0.37]} shadow={shadow} />
        <Phone position={[-0.46, 0.755, 0.34]} quality={quality} />
        <DeskPhoto position={[-1.02, 0.75, 0.4]} shadow={shadow} />
        <ArchModel position={[-0.72, 0.75, 0.05]} shadow={shadow} />
        {quality.dust > 0 && <Dust count={quality.dust} />}
      </group>
      <CameraRig />
      <ScreenFrameSync />
    </>
  )
}

export function SceneRoot({
  quality,
  onReady,
}: {
  quality: QualitySettings
  onReady: () => void
}) {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        shadows={quality.shadows}
        frameloop="demand"
        dpr={quality.dpr}
        gl={{
          antialias: quality.antialias,
          alpha: false,
          stencil: false,
          powerPreference: quality.powerPreference,
        }}
        camera={{ fov: sceneCfg.fov, near: 0.05, far: 60, position: [0.55, 1.7, 3.55] }}
        onCreated={({ scene, gl }) => {
          scene.background = new THREE.Color(palette.bg)
          scene.fog = new THREE.Fog(palette.bg, 7, 18)
          gl.setClearColor(palette.bg, 1)
          invalidate()
        }}
      >
        <hemisphereLight args={['#ffffff', palette.floor, 0.75]} />
        <KeyLight quality={quality} />
        <directionalLight position={[-2.5, 3, -2]} intensity={0.3} color="#dfe8f2" />

        <DeskWorld quality={quality} />
        <Warmup onReady={onReady} />
      </Canvas>
    </div>
  )
}
