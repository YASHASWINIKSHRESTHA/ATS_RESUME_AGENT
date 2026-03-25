import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ── Particle Field ─────────────────────────────────────────────────────────

function ParticleField({ count = 2000 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [count])

  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.04
    ref.current.rotation.y = state.clock.elapsedTime * 0.06
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00d4ff"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

// ── Floating Orb ───────────────────────────────────────────────────────────

function FloatingOrb({ position, color, distort = 0.4, speed = 1 }) {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.12}
        />
      </Sphere>
    </Float>
  )
}

// ── Orbiting Ring ─────────────────────────────────────────────────────────

function OrbitRing({ radius = 3, color = '#00d4ff', speed = 0.3 }) {
  const ref = useRef()

  useFrame((state) => {
    ref.current.rotation.z = state.clock.elapsedTime * speed
    ref.current.rotation.x = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0))
    }
    return pts
  }, [radius])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} />
    </line>
  )
}

// ── Camera Drift ──────────────────────────────────────────────────────────

function CameraDrift() {
  useFrame(({ camera, clock }) => {
    camera.position.x = Math.sin(clock.elapsedTime * 0.15) * 1.5
    camera.position.y = Math.cos(clock.elapsedTime * 0.1) * 0.8
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ── Main Hero 3D Scene ────────────────────────────────────────────────────

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00d4ff" />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#7c3aed" />

        <CameraDrift />
        <ParticleField count={1800} />

        <FloatingOrb position={[-4, 2, -3]} color="#00d4ff" distort={0.5} speed={0.8} />
        <FloatingOrb position={[4, -1, -4]} color="#7c3aed" distort={0.3} speed={1.2} />
        <FloatingOrb position={[0, -3, -2]} color="#10b981" distort={0.6} speed={0.6} />

        <OrbitRing radius={4} color="#00d4ff" speed={0.2} />
        <OrbitRing radius={6} color="#7c3aed" speed={-0.15} />
        <OrbitRing radius={2.5} color="#10b981" speed={0.35} />
      </Canvas>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, #050508 90%)',
        }}
      />
    </div>
  )
}
