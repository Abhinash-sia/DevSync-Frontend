import { useRef, Suspense, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, Sparkles } from "@react-three/drei"
import { Terminal, Network, Cpu, Code2, ArrowRight, GitMerge, Zap, Activity } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

// ─── 3D GIMBAL ─────────────────────────────────────────────────────────────────
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
    // Pushed up on the Y axis, scaled up, and pushed slightly back
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
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.0, 0.015, 16, 100]} />
          <meshBasicMaterial color="#12b3a8" transparent opacity={0.8} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.5, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[3.0, 0.03, 16, 100]} />
          <meshBasicMaterial color="#12b3a8" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  )
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef(null)
  const [mousePos, setMousePos]   = useState({ x: 0, y: 0 })
  const [telemetry, setTelemetry] = useState({ ping: 8, nodes: 1402, mem: "0x00F2" })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      })
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`)
        containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`)
      }
    }

    const interval = setInterval(() => {
      setTelemetry({
        ping:  Math.floor(Math.random() * 4) + 6,
        nodes: Math.floor(Math.random() * 10) + 1400,
        mem:   `0x00${Math.floor(Math.random() * 99).toString(16).toUpperCase()}F`,
      })
    }, 2000)

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

    tl.to(".boot-text", { opacity: 1, duration: 0.1, stagger: 0.1 })
      .to(".screen-curtain", { opacity: 0, duration: 1.2, delay: 0.5, pointerEvents: "none" })

    tl.fromTo(".clip-text",
      { y: 100, opacity: 0, scaleY: 1.5 },
      { y: 0, opacity: 1, scaleY: 1, duration: 1.2, stagger: 0.1 },
      "-=1"
    )

    tl.fromTo(".ui-element",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
      "-=0.8"
    )

    // Canvas fades out as we scroll down
    gsap.to(".canvas-wrapper", {
      scale: 1.1,
      yPercent: 30,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "120% top",
        scrub: 1,
      },
    })

    gsap.utils.toArray(".parallax-item").forEach((item) => {
      const speed = item.dataset.speed || 1
      gsap.to(item, {
        y: -100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    gsap.fromTo(".collab-line",
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: "top",
        ease: "none",
        scrollTrigger: {
          trigger: ".collab-section",
          start: "top 60%",
          end: "bottom 80%",
          scrub: true,
        },
      }
    )

    // Upgraded smooth scroll reveal with scale effect
    gsap.utils.toArray(".reveal-panel").forEach((panel) => {
      gsap.fromTo(panel,
        { y: 60, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: panel, start: "top 85%" } }
      )
    })
  }, { scope: containerRef })

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#000000] text-white overflow-x-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif' }}
    >
      <style>{`
        :root { --mouse-x: 50vw; --mouse-y: 50vh; --teal: #12b3a8; }

        .spotlight {
          background: radial-gradient(
            circle 700px at var(--mouse-x) var(--mouse-y),
            rgba(18,179,168,0.055), transparent 80%
          );
        }

        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 30s linear infinite; display:inline-block; white-space:nowrap; }

        .glass {
          background: rgba(18, 18, 20, 0.65);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
        }
        .glass-light {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
        }

        /* ── ANIMATED SHIMMER BORDER GLASS PANELS ──── */
        .glass-panel {
          position: relative;
          background: linear-gradient(145deg, rgba(20,20,22,0.6) 0%, rgba(10,10,12,0.8) 100%);
          backdrop-filter: blur(40px) saturate(150%);
          -webkit-backdrop-filter: blur(40px) saturate(150%);
          box-shadow: 0 24px 40px -10px rgba(0,0,0,0.5);
          border-radius: 32px;
        }

        /* The Animated Gradient Border */
        .glass-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px; /* Border thickness */
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.03) 0%,
            rgba(18,179,168,0.5) 25%,
            rgba(255,255,255,0.03) 50%,
            rgba(18,179,168,0.5) 75%,
            rgba(255,255,255,0.03) 100%
          );
          background-size: 200% 100%;
          animation: border-shimmer 6s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          transition: all 0.3s ease;
        }

        @keyframes border-shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: -200% 0%; }
        }

        /* ── Ambient Floating Orbs ──────────────────── */
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(80px, -100px) scale(1.1); }
          66% { transform: translate(-60px, 80px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.25;
          animation: float 25s infinite ease-in-out alternate;
          pointer-events: none;
        }

        .dynamic-island {
          background: rgba(14,14,16,0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
        }

        /* ── Feature card hover ─────────────────────── */
        .feat-card {
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.3s ease,
                      box-shadow 0.3s ease;
        }
        
        .feat-card:hover {
          transform: translateY(-6px);
          background: linear-gradient(145deg, rgba(18,179,168,0.08) 0%, rgba(20,20,22,0.9) 100%);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.7), 0 0 40px 0 rgba(18,179,168,0.15);
        }

        /* Speed up and brighten border on hover */
        .feat-card:hover::before {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.1) 0%,
            rgba(18,179,168,1) 25%,
            rgba(255,255,255,0.1) 50%,
            rgba(18,179,168,1) 75%,
            rgba(255,255,255,0.1) 100%
          );
          background-size: 200% 100%;
          animation: border-shimmer 3s linear infinite;
        }

        .cta-primary {
          transition: all 0.28s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .cta-primary:hover {
          background: rgba(18,179,168,0.13);
          border-color: rgba(18,179,168,0.75);
          box-shadow: 0 0 0 1px rgba(18,179,168,0.25), 0 10px 40px rgba(18,179,168,0.18);
        }

        .ambient-glow {
          background: radial-gradient(ellipse 90% 35% at 50% -5%,
            rgba(18,179,168,0.09) 0%, transparent 100%);
        }

        ::selection { background: rgba(18,179,168,0.28); color: #12b3a8; }
      `}</style>

      {/* ── Fixed Ambient Background Elements ── */}
      <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden">
        <div className="ambient-orb bg-[#12b3a8] w-[600px] h-[600px] top-[30%] left-[-150px]" />
        <div className="ambient-orb bg-[#0a5c56] w-[500px] h-[500px] top-[60%] right-[-100px]" style={{ animationDelay: '-5s' }} />
        <div className="ambient-orb bg-[#12b3a8] w-[700px] h-[700px] top-[120%] left-[20%]" style={{ animationDelay: '-12s', opacity: 0.15 }} />
      </div>

      <div className="fixed inset-0 z-[2] opacity-[0.028] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="spotlight fixed inset-0 z-[1] pointer-events-none mix-blend-screen" />
      <div className="ambient-glow fixed inset-0 z-[1] pointer-events-none" />

      {/* Boot curtain */}
      <div className="screen-curtain fixed inset-0 z-[100] bg-[#000000] flex flex-col items-start justify-end p-10 font-mono text-[11px] uppercase tracking-widest text-[#12b3a8]/65">
        <p className="boot-text opacity-0 mb-1.5">[ OK ] INIT SYSTEM KERNEL...</p>
        <p className="boot-text opacity-0 mb-1.5">[ OK ] LOADING NEURAL GIMBAL...</p>
        <p className="boot-text opacity-0 mb-1.5">[ OK ] BYPASSING FIREWALL...</p>
        <p className="boot-text opacity-0 text-white animate-pulse">CONNECTION ESTABLISHED.</p>
      </div>

      {/* 3D Canvas */}
      <div className="canvas-wrapper fixed inset-0 z-[0] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <QuantumGimbal />
            <Sparkles count={400} scale={16} size={1.2} speed={0.1} color="#12b3a8" opacity={0.6} />
            <Sparkles count={150} scale={12} size={2.5} speed={0.3} color="#ffffff" opacity={0.2} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_88%)]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-4xl">
        <nav className="glass rounded-[22px] border border-white/[0.06] px-3 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group flex items-center gap-2.5 pl-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-[11px] bg-[#12b3a8]/10 border border-[#12b3a8]/20 transition-all group-hover:bg-[#12b3a8]/18 group-hover:border-[#12b3a8]/40">
              <Terminal size={14} className="text-[#12b3a8]" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 transition-colors group-hover:text-white">
              DevSync_OS
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/login" className="px-5 py-2 text-[13px] font-medium text-white/35 hover:text-white/75 transition-colors rounded-full">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 text-[13px] font-semibold text-[#12b3a8] bg-[#12b3a8]/10 border border-[#12b3a8]/22 rounded-full transition-all hover:bg-[#12b3a8]/18 hover:border-[#12b3a8]/45 hover:shadow-[0_0_20px_rgba(18,179,168,0.15)]">
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">

        <div className="parallax-item absolute left-[10%] top-[30%] hidden md:flex items-center gap-2.5 rounded-[18px] glass border border-white/[0.07] px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" data-speed="1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12b3a8] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#12b3a8]" />
          </span>
          <span className="font-mono text-[12px] font-medium text-white/55">Socket.IO connected</span>
        </div>

        <div className="parallax-item absolute right-[8%] top-[45%] hidden md:flex items-center gap-2.5 rounded-[18px] border border-[#12b3a8]/14 bg-[#12b3a8]/[0.06] px-4 py-2.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]" data-speed="2.5">
          <GitMerge size={13} className="text-[#12b3a8]" />
          <span className="font-mono text-[12px] font-medium text-[#12b3a8]">Branch merged: feat/match</span>
        </div>

        <div className="ui-element mb-8 dynamic-island inline-flex items-center gap-2.5 rounded-full px-5 py-2 mt-20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12b3a8] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#12b3a8]" />
          </span>
          <Activity size={11} className="text-[#12b3a8]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#12b3a8]">
            Live Network Ping: {telemetry.ping}ms
          </span>
        </div>

        <div className="overflow-hidden pb-1 relative">
          <h1 className="clip-text text-[clamp(4rem,11vw,10rem)] font-black leading-[0.84] tracking-[-0.045em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/65">
            FORGE THE
          </h1>
        </div>
        <div className="overflow-hidden relative">
          <h1 className="clip-text text-[clamp(4rem,11vw,10rem)] font-black leading-[0.84] tracking-[-0.045em] text-transparent bg-clip-text bg-gradient-to-b from-[#dffffe] via-[#6ee8e2] to-[#12b3a8]">
            NETWORK.
          </h1>
        </div>

        <p className="ui-element mt-10 max-w-[480px] text-[17px] leading-[1.75] text-white/38 font-light tracking-[-0.01em]">
          DevSync is an unadulterated matchmaking protocol for software engineers. Parse your stack. Connect with high-signal builders. Execute.
        </p>

        <div className="ui-element mt-12 flex flex-col sm:flex-row gap-3">
          <Link to="/register" className="cta-primary group flex h-14 items-center justify-center gap-3 rounded-full border border-[#12b3a8]/38 bg-[#12b3a8]/[0.07] px-10">
            <span className="text-[14px] font-semibold text-[#12b3a8] tracking-[-0.01em]">Initialize Protocol</span>
            <ArrowRight size={15} className="text-[#12b3a8] transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="#architecture" className="group flex h-14 items-center justify-center gap-3 rounded-full border border-white/[0.07] glass-light px-10 transition-all hover:border-white/[0.14] hover:bg-white/[0.055]">
            <span className="text-[14px] font-medium text-white/42 group-hover:text-white/75 tracking-[-0.01em]">View Systems</span>
          </a>
        </div>

        <div className="ui-element absolute bottom-10 left-10 hidden sm:block">
          <div className="glass rounded-[16px] border border-white/[0.06] px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="font-mono text-[10px] leading-[1.8] text-[#12b3a8]/60">
              SYS.MEM: {telemetry.mem}<br />
              ACTIVE_NODES: {telemetry.nodes}<br />
              STATUS: SECURE
            </p>
          </div>
        </div>

        <div className="ui-element absolute bottom-10 right-10 hidden sm:block">
          <div className="glass rounded-[16px] border border-white/[0.06] px-4 py-3.5 text-right shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <p className="font-mono text-[10px] leading-[1.8] text-[#12b3a8]/60">
              COORD: {mousePos.x.toFixed(2)} : {mousePos.y.toFixed(2)}<br />
              RENDER: R3F_GL<br />
              ENCRYPTION: SHA-256
            </p>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative z-10 border-y border-white/[0.04] bg-[#000000]/40 backdrop-blur-md py-4 overflow-hidden">
        <div className="animate-marquee font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-[#12b3a8]/40">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">COMMIT • PUSH • MATCH • SOCKET • MERGE • COLLABORATE • SHIP</span>
          ))}
        </div>
      </div>

      {/* SYNCHRONIZED DEVELOPMENT */}
      <section className="collab-section relative z-10 py-32 border-b border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-30" />

        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="text-center mb-24 reveal-panel">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] text-white">
              Synchronized <span className="text-[#12b3a8]">Development.</span>
            </h2>
            <p className="mt-4 text-white/40 text-[15px] leading-relaxed max-w-md mx-auto font-light">
              Scroll to witness the matchmaking protocol execution within our secure tunnels.
            </p>
          </div>

          <div className="absolute left-6 md:left-1/2 top-48 bottom-0 w-px bg-white/[0.04] -translate-x-1/2" />
          <div className="collab-line absolute left-6 md:left-1/2 top-48 bottom-0 w-px bg-gradient-to-b from-[#12b3a8] via-[#12b3a8]/45 to-transparent -translate-x-1/2 shadow-[0_0_15px_rgba(18,179,168,0.6)]" />

          <div className="space-y-24">
            <div className="reveal-panel relative flex flex-col md:flex-row items-start md:items-center justify-between pl-12 md:pl-0">
              <div className="md:w-[45%]">
                <div className="glass-panel p-8 text-left md:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full glass-light border border-white/[0.07] px-3.5 py-1.5 mb-5">
                    <Cpu size={12} className="text-[#12b3a8]" />
                    <span className="text-[12px] font-medium text-white/60">Stack Parsed</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-white mb-2">Algorithm Engaged</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed font-light">Your GitHub and React/Node capabilities are vectorized. The engine scans the network silently in the background.</p>
                </div>
              </div>
              <div className="absolute left-6 md:left-1/2 h-5 w-5 rounded-full bg-[#000] border-[3px] border-[#12b3a8] -translate-x-1/2 shadow-[0_0_15px_rgba(18,179,168,0.8)] z-10" />
              <div className="md:w-[45%] hidden md:block" />
            </div>

            <div className="reveal-panel relative flex flex-col md:flex-row items-start md:items-center justify-between pl-12 md:pl-0">
              <div className="md:w-[45%] hidden md:block" />
              <div className="absolute left-6 md:left-1/2 h-5 w-5 rounded-full bg-[#000] border-[3px] border-[#12b3a8] -translate-x-1/2 shadow-[0_0_15px_rgba(18,179,168,0.8)] z-10" />
              <div className="md:w-[45%]">
                <div className="glass-panel p-8 text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#12b3a8]/10 border border-[#12b3a8]/30 px-3.5 py-1.5 mb-5">
                    <Zap size={12} className="text-[#12b3a8]" />
                    <span className="text-[12px] font-medium text-[#12b3a8]">Mutual Match</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-white mb-2">Connection Formed</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed font-light">You and a backend specialist swiped right. The cold-start problem is entirely eliminated.</p>
                </div>
              </div>
            </div>

            <div className="reveal-panel relative flex flex-col md:flex-row items-start md:items-center justify-between pl-12 md:pl-0">
              <div className="md:w-[45%]">
                 <div className="glass-panel p-8 text-left md:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full glass-light border border-white/[0.07] px-3.5 py-1.5 mb-5">
                    <Network size={12} className="text-[#12b3a8]" />
                    <span className="text-[12px] font-medium text-white/60">WSS:// Tunnel</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-white mb-2">Socket Room Opened</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed font-light">End-to-end encrypted chat begins immediately. From idea to execution in a matter of seconds.</p>
                </div>
              </div>
              <div className="absolute left-6 md:left-1/2 h-5 w-5 rounded-full bg-[#000] border-[3px] border-[#12b3a8] -translate-x-1/2 shadow-[0_0_15px_rgba(18,179,168,0.8)] z-10" />
              <div className="md:w-[45%] hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE */}
      <section id="architecture" className="relative z-10 pt-32 pb-24 border-t border-white/[0.04] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-panel">
            <h2 className="text-[clamp(3rem,5vw,4.2rem)] font-black leading-[0.88] tracking-[-0.045em] text-white">
              System<br />
              <span className="text-[#12b3a8]/45">Architecture.</span>
            </h2>
            <p className="max-w-md text-[15px] leading-[1.75] text-white/40 font-light border-l border-[#12b3a8]/25 pl-5">
              We stripped the UI down to its raw components. Pure data structures, real-time socket events, and high-signal matching algorithms wrapped in glass.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { id: "01", icon: Cpu, title: "Stack Parser", desc: "Upload your resume. Our AI extracts your actual build capability. Evaluated strictly on code." },
              { id: "02", icon: Network, title: "Socket Tunnels", desc: "When a mutual match hits, a secure room opens instantly. Keep momentum and sync." },
              { id: "03", icon: Code2, title: "Gig Bounties", desc: "Post high-signal engineering tasks. Discover freelancers ready to pull branches today." },
            ].map((feat) => (
              <div key={feat.id} className="feat-card glass-panel reveal-panel group relative flex flex-col justify-between overflow-hidden p-8 min-h-[320px]">
                <div className="relative z-10">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="flex items-center justify-center w-12 h-12 rounded-[16px] bg-white/[0.03] border border-white/[0.08] shadow-inner group-hover:border-[#12b3a8]/40 transition-colors duration-300">
                      <feat.icon size={20} className="text-white/30 group-hover:text-[#12b3a8] transition-colors duration-300" />
                    </span>
                    <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-white/20">MODULE_{feat.id}</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-white mb-3">{feat.title}</h3>
                  <p className="text-[14px] text-white/40 leading-relaxed font-light">{feat.desc}</p>
                </div>
                <div className="relative z-10 mt-10 h-[2px] w-full bg-white/[0.05] overflow-hidden rounded-full">
                  <div className="h-full w-0 bg-gradient-to-r from-[#12b3a8] to-[#12b3a8]/60 group-hover:w-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(18,179,168,0.8)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXECUTE */}
      <section className="relative z-10 border-t border-white/[0.04] pt-16 pb-32 text-center overflow-hidden">
        <div className="reveal-panel relative z-10 mx-auto max-w-4xl px-6 flex flex-col items-center">
          <div className="mb-8 dynamic-island inline-flex items-center gap-2.5 rounded-full px-5 py-2.5">
            <span className="h-2 w-2 bg-[#12b3a8] rounded-full animate-pulse" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#12b3a8]">Awaiting Input</span>
          </div>
          <h2 className="text-[clamp(4.5rem,9vw,8rem)] font-black tracking-[-0.055em] text-white leading-none mb-12">
            EXECUTE.
          </h2>
          <Link to="/register" className="group relative flex h-16 w-[300px] items-center justify-center overflow-hidden rounded-full glass-panel transition-all hover:bg-[#12b3a8]/10 hover:shadow-[0_0_50px_rgba(18,179,168,0.3)]">
            <span className="text-[15px] font-semibold text-[#12b3a8] group-hover:text-white transition-colors relative z-10">Boot System</span>
            <div className="absolute inset-0 bg-gradient-to-t from-[#12b3a8]/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
        </div>
      </section>

    </div>
  )
}