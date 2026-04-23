import { useRef, Suspense } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, Sparkles } from "@react-three/drei"

function QuantumGimbal() {
  const groupRef    = useRef()
  const coreRef     = useRef()
  const wireframeRef = useRef()
  const ring1Ref    = useRef()
  const ring2Ref    = useRef()
  const ring3Ref    = useRef()

  useFrame((state, delta) => {
    if (!groupRef.current || !coreRef.current) return

    const targetX = (state.pointer.x * Math.PI) / 5
    const targetY = (state.pointer.y * Math.PI) / 5
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05)

    coreRef.current.rotation.y -= delta * 0.3
    coreRef.current.rotation.z -= delta * 0.2
    wireframeRef.current.rotation.copy(coreRef.current.rotation)

    ring1Ref.current.rotation.x += delta * 0.8
    ring2Ref.current.rotation.y += delta * 0.6
    ring3Ref.current.rotation.z -= delta * 0.5

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04
    coreRef.current.scale.set(pulse, pulse, pulse)
    wireframeRef.current.scale.set(pulse * 1.05, pulse * 1.05, pulse * 1.05)
  })

  return (
    <group ref={groupRef} position={[0, 1.2, -2]} scale={1.4}>
      <pointLight intensity={80} color="#12b3a8" distance={20} />
      <ambientLight intensity={0.2} color="#ffffff" />
      <Float speed={2} rotationIntensity={0.1} floatIntensity={1.2}>
        <mesh ref={coreRef}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#020202" metalness={1} roughness={0.1} />
        </mesh>
        <mesh ref={wireframeRef}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshBasicMaterial color="#12b3a8" wireframe transparent opacity={0.3} />
        </mesh>
        {/* Reduced tubular segments from 100 to 50 for performance */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.0, 0.015, 16, 50]} />
          <meshBasicMaterial color="#12b3a8" transparent opacity={0.8} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.5, 0.01, 16, 50]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[3.0, 0.03, 16, 50]} />
          <meshBasicMaterial color="#12b3a8" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  )
}

export default function ThreeScene({ isDark }) {
  return (
    <div className="canvas-wrapper fixed inset-0 z-[0] pointer-events-none">
      {/* Lowered dpr limit to prevent high res lag on retina screens */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.2]} gl={{ antialias: false, alpha: true }}>
        <Suspense fallback={null}>
          {isDark && <QuantumGimbal />}
          {/* Drastically reduced spark counts for initial load speed */}
          <Sparkles count={100} scale={16} size={1.5} speed={0.1} color={isDark ? "#12b3a8" : "#4f46e5"} opacity={isDark ? 0.6 : 0.3} />
          <Sparkles count={40} scale={12} size={3} speed={0.3} color={isDark ? "#ffffff" : "#a5b4fc"} opacity={isDark ? 0.2 : 0.4} />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-[radial-gradient(circle_at_center,transparent_0%,#000000_88%)]' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(240,244,245,1)_88%)]'}`} />
    </div>
  )
}
