import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { palette, scene as sceneCfg } from '../theme'
import { CameraRig } from './CameraRig'
import { ScreenFrameSync } from './ScreenFrameSync'
import { Laptop } from './Laptop'
import {
  ArchModel,
  Books,
  Chair,
  Desk,
  FloatingShapes,
  Ground,
  Lamp,
  Mug,
  Notebook,
  Phone,
  Plant,
} from './Props'
import { Dust } from './Dust'

function DeskWorld({ simplified }: { simplified: boolean }) {
  return (
    <>
      <group>
        <Ground />
        <Desk />
        <Chair />
        <Laptop position={[-0.12, 0.75, -0.02]} rotationY={-0.12} />
        <Lamp position={[0.78, 0.75, -0.3]} />
        <Mug position={[0.5, 0.75, 0.26]} />
        <Plant position={[-0.85, 0.75, -0.32]} />
        <Books position={[0.95, 0.75, 0.1]} />
        <Notebook position={[0.34, 0.75, 0.37]} />
        <Phone position={[-0.58, 0.755, 0.3]} />
        <ArchModel position={[-0.72, 0.75, 0.05]} />
        {!simplified && <FloatingShapes />}
        <Dust count={simplified ? 30 : 70} />
      </group>
      <CameraRig />
      <ScreenFrameSync />
    </>
  )
}

export function SceneRoot({ simplified }: { simplified: boolean }) {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, simplified ? 1.25 : 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: sceneCfg.fov, near: 0.05, far: 60, position: [0.55, 1.7, 3.55] }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(palette.bg)
          scene.fog = new THREE.Fog(palette.bg, 7, 18)
        }}
      >
        {/* Soft daylight */}
        <hemisphereLight args={['#ffffff', palette.floor, 0.75]} />
        <directionalLight
          position={[3.2, 5.5, 2.6]}
          intensity={1.35}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-3.4}
          shadow-camera-right={3.4}
          shadow-camera-top={3.4}
          shadow-camera-bottom={-3.4}
          shadow-camera-far={14}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-2.5, 3, -2]} intensity={0.3} color="#dfe8f2" />

        <DeskWorld simplified={simplified} />
      </Canvas>
    </div>
  )
}
