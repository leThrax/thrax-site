import { Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Mirrors --color-bg in src/index.css — a WebGL canvas can't read CSS
// custom properties, so this is duplicated here.
const BG_COLOR = '#0d0f12'

// Longest bounding-box dimension every loaded model is normalized to, so
// models from different Sketchfab uploads (wildly different native scale
// and pivot origin) all frame consistently under the same fixed
// OrbitControls min/max distance below.
const TARGET_SIZE = 2.2

function GltfModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)

  const normalized = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = TARGET_SIZE / (Math.max(size.x, size.y, size.z) || 1)
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    return clone
  }, [scene])

  return <primitive object={normalized} />
}

interface DeviceSceneProps {
  modelUrl: string
}

export function DeviceScene({ modelUrl }: DeviceSceneProps) {
  // Idle auto-rotate is exactly the kind of ambient motion
  // prefers-reduced-motion should suppress — checked once per mount, same
  // manual matchMedia pattern BootSequence uses, rather than relying on
  // MotionConfig (this canvas sits outside Framer Motion's control).
  const autoRotate = useMemo(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // .glb uploads can be tens of MB, so the model isn't fetched until the
  // visitor opts in — <Canvas>/useGLTF only mount once `loaded` flips true,
  // which is also when the actual network request for modelUrl starts.
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <div className="flex h-full min-h-128 w-full flex-col items-center justify-center gap-3 rounded-md border border-border bg-bg">
        <p className="font-mono text-sm text-muted">3D model not loaded — files can be large.</p>
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="rounded border border-accent bg-accent/10 px-3 py-1 font-mono text-sm font-medium text-accent"
        >
          Load 3D model
        </button>
      </div>
    )
  }

  return (
    <div className="h-full min-h-128 w-full overflow-hidden rounded-md border border-border bg-bg">
      <Canvas camera={{ position: [2.3, 1.3, 2.6], fov: 40 }}>
        <color attach="background" args={[BG_COLOR]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} />
        <directionalLight position={[-3, 2, -4]} intensity={0.8} />
        <Suspense fallback={null}>
          <GltfModel modelUrl={modelUrl} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.8}
          maxDistance={8}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
        />
      </Canvas>
    </div>
  )
}
