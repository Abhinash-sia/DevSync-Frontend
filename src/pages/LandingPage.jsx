import { useRef, Suspense, useEffect, useState, lazy } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { Terminal, Network, Cpu, Code2, ArrowRight, GitMerge, Zap, Activity, Sun, Moon } from "lucide-react"
import axios from "axios"
import { useTheme } from "../hooks/useTheme"

// Code splitting massive graphics libraries for instantaneous TTI
const ThreeScene = lazy(() => import("../components/landing/ThreeScene"))
const ParticleNetwork = lazy(() => import("../components/landing/ParticleNetwork"))

gsap.registerPlugin(ScrollTrigger)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function SystemStats({ isDark }) {
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0 });

  useEffect(() => {
    axios.get(`${API_URL}/stats/usage`)
      .then(res => {
        if (res.data?.success) setStats(res.data.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className={`w-full border-t py-8 relative z-10 overflow-hidden ${isDark ? 'bg-[#000000]/60 border-white/5' : 'bg-white/40 border-indigo-500/10'} backdrop-blur-xl`}>
       <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0">
          <div className="flex items-center gap-4">
             <div className="flex h-3 w-3 relative">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'}`} />
             </div>
             <span className="font-mono text-sm tracking-[0.2em] uppercase text-dim font-bold">Platform Adoption</span>
          </div>
          
          <div className="flex gap-16">
            <div className="flex flex-col items-center sm:items-start">
              <div className="text-3xl font-black text-base tabular-nums tracking-tighter">
                {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : "..."}
              </div>
              <div className={`text-[11px] font-bold font-mono tracking-[0.1em] mt-1 ${isDark ? 'text-[#12b3a8]' : 'text-[#4f46e5]'}`}>TOTAL_NODES</div>
            </div>
            
            <div className="flex flex-col items-center sm:items-start">
              <div className="text-3xl font-black text-base tabular-nums tracking-tighter">
                {stats.activeToday > 0 ? stats.activeToday.toLocaleString() : "..."}
              </div>
              <div className={`text-[11px] font-bold font-mono tracking-[0.1em] mt-1 ${isDark ? 'text-[#12b3a8]' : 'text-[#4f46e5]'}`}>LOGGED_IN_TODAY</div>
            </div>
          </div>
       </div>
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef(null)
  const [mousePos, setMousePos]   = useState({ x: 0, y: 0 })
  const [telemetry, setTelemetry] = useState({ ping: 8, nodes: 1402, mem: "0x00F2" })
  const { isDark, toggleTheme } = useTheme()

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
      className={`relative min-h-screen text-base overflow-x-hidden ${!isDark && 'bg-[linear-gradient(135deg,#f0f4f5_0%,#e1e9ed_100%)]'}`}
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif',
        backgroundColor: isDark ? '#000000' : undefined 
      }}
    >
      <style>{`
        :root { --mouse-x: 50vw; --mouse-y: 50vh; --teal: #12b3a8; }

        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 30s linear infinite; display:inline-block; white-space:nowrap; }

        .glass {
          background: ${isDark ? 'rgba(18, 18, 20, 0.65)' : 'rgba(255, 255, 255, 0.45)'};
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
        }
        .glass-light {
          background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.3)'};
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
        }

        /* ── ANIMATED SHIMMER BORDER GLASS PANELS ──── */
        .glass-panel {
          position: relative;
          background: ${isDark ? 'linear-gradient(145deg, rgba(20,20,22,0.6) 0%, rgba(10,10,12,0.8) 100%)' : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)'};
          backdrop-filter: blur(40px) saturate(150%);
          -webkit-backdrop-filter: blur(40px) saturate(150%);
          box-shadow: ${isDark ? '0 24px 40px -10px rgba(0,0,0,0.5)' : '0 24px 50px -10px rgba(79, 70, 229, 0.1)'};
          border: ${isDark ? 'none' : '1px solid rgba(255,255,255,0.8)'};
          border-radius: 32px;
        }

        /* The Animated Gradient Border */
        .glass-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px; /* Border thickness */
          background: ${isDark ? `linear-gradient(
            90deg,
            rgba(255,255,255,0.03) 0%,
            rgba(18,179,168,0.5) 25%,
            rgba(255,255,255,0.03) 50%,
            rgba(18,179,168,0.5) 75%,
            rgba(255,255,255,0.03) 100%
          )` : `linear-gradient(
            90deg,
            rgba(255,255,255,0.2) 0%,
            rgba(79,70,229,0.4) 25%,
            rgba(255,255,255,0.2) 50%,
            rgba(79,70,229,0.4) 75%,
            rgba(255,255,255,0.2) 100%
          )`};
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

        .dynamic-island {
          background: ${isDark ? 'rgba(14,14,16,0.92)' : 'rgba(255,255,255,0.8)'};
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)'};
        }

        /* ── Feature card hover ─────────────────────── */
        .feat-card {
           transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                       background 0.3s ease,
                       box-shadow 0.3s ease;
        }
        
        .feat-card:hover {
          transform: translateY(-6px);
          background: ${isDark ? 'linear-gradient(145deg, rgba(18,179,168,0.08) 0%, rgba(20,20,22,0.9) 100%)' : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)'};
          box-shadow: ${isDark ? '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 40px 0 rgba(18,179,168,0.15)' : '0 30px 60px -15px rgba(79,70,229,0.1), 0 0 40px 0 rgba(79,70,229,0.12)'};
        }

        /* Speed up and brighten border on hover */
        .feat-card:hover::before {
          background: ${isDark ? `linear-gradient(
            90deg,
            rgba(255,255,255,0.1) 0%,
            rgba(18,179,168,1) 25%,
            rgba(255,255,255,0.1) 50%,
            rgba(18,179,168,1) 75%,
            rgba(255,255,255,0.1) 100%
          )` : `linear-gradient(
            90deg,
            rgba(255,255,255,0.5) 0%,
            rgba(79,70,229,0.8) 25%,
            rgba(255,255,255,0.5) 50%,
            rgba(79,70,229,0.8) 75%,
            rgba(255,255,255,0.5) 100%
          )`};
          background-size: 200% 100%;
          animation: border-shimmer 3s linear infinite;
        }

        .cta-primary {
          transition: all 0.28s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .cta-primary:hover {
          background: ${isDark ? 'rgba(18,179,168,0.13)' : 'rgba(79,70,229,0.13)'};
          border-color: ${isDark ? 'rgba(18,179,168,0.75)' : 'rgba(79,70,229,0.5)'};
          box-shadow: ${isDark ? '0 0 0 1px rgba(18,179,168,0.25), 0 10px 40px rgba(18,179,168,0.18)' : '0 0 0 1px rgba(79,70,229,0.15), 0 10px 30px rgba(79,70,229,0.15)'};
        }

        .text-gradient-hero {
           background-clip: text;
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           background-image: ${isDark ? 'linear-gradient(to bottom, #dffffe, #6ee8e2, #12b3a8)' : 'linear-gradient(to bottom, #312e81, #4f46e5, #818cf8)'};
        }
        .text-gradient-primary {
           background-clip: text;
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           background-image: ${isDark ? 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.65))' : 'linear-gradient(to bottom, #000000, rgba(0,0,0,0.65))'};
        }

        ::selection { background: ${isDark ? 'rgba(18,179,168,0.28)' : 'rgba(79,70,229,0.2)'}; color: ${isDark ? '#12b3a8' : '#4f46e5'}; }
      `}</style>

      {/* ── Ambient Background Elements ── */}
      <div className={`fixed inset-0 z-[2] opacity-[0.028] pointer-events-none mix-blend-overlay ${isDark ? "bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" : "bg-[url('https://grainy-gradients.vercel.app/noise.svg')] backdrop-blur-sm"}`} />

      {/* Lazy Loaded Particles */}
      <Suspense fallback={null}>
        <ParticleNetwork isDark={isDark} />
      </Suspense>

      {/* Boot curtain */}
      {isDark && (
        <div className="screen-curtain fixed inset-0 z-[100] bg-[#000000] flex flex-col items-start justify-end p-10 font-mono text-[11px] uppercase tracking-widest text-[#12b3a8]/65">
          <p className="boot-text opacity-0 mb-1.5">[ OK ] INIT SYSTEM KERNEL...</p>
          <p className="boot-text opacity-0 mb-1.5">[ OK ] LOADING NEURAL GIMBAL...</p>
          <p className="boot-text opacity-0 mb-1.5">[ OK ] BYPASSING FIREWALL...</p>
          <p className="boot-text opacity-0 text-white animate-pulse">CONNECTION ESTABLISHED.</p>
        </div>
      )}

      {/* Lazy Loaded 3D Canvas */}
      <Suspense fallback={null}>
        <ThreeScene isDark={isDark} />
      </Suspense>

      {/* Navigation */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-4xl">
        <nav className={`glass rounded-[22px] border px-3 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.1)] ${isDark ? 'border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.55)]' : 'border-white shadow-[0_10px_40px_rgba(79,70,229,0.08)]'}`}>
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="group flex items-center gap-2.5 pl-2">
             <span className={`flex items-center justify-center w-8 h-8 rounded-[11px] ${isDark ? 'bg-[#12b3a8]/10 border-[#12b3a8]/20 group-hover:bg-[#12b3a8]/18 group-hover:border-[#12b3a8]/40' : 'bg-[#4f46e5]/10 border-[#4f46e5]/20 group-hover:bg-[#4f46e5]/18 group-hover:border-[#4f46e5]/40'} transition-all border`}>
              <Terminal size={14} className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"} />
            </span>
            <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${isDark ? 'text-white/75 group-hover:text-white' : 'text-black/60 group-hover:text-black'}`}>
              DevSync_OS
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-dim hover:text-base mr-2 flex-shrink-0"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} className="text-black/60" />}
            </button>
            <Link to="/login" className="px-5 py-2 text-[13px] font-medium text-dim hover:text-base transition-colors rounded-full">
              Login
            </Link>
            <Link to="/register" className={`px-5 py-2 text-[13px] font-semibold rounded-full transition-all border ${isDark ? 'text-[#12b3a8] bg-[#12b3a8]/10 border-[#12b3a8]/22 hover:bg-[#12b3a8]/18 hover:border-[#12b3a8]/45 hover:shadow-[0_0_20px_rgba(18,179,168,0.15)]' : 'text-white bg-[#4f46e5] border-[#4f46e5] hover:bg-[#4f46e5]/90 hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]'}`}>
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center pointer-events-none">

        <div className={`parallax-item absolute left-[10%] top-[30%] hidden md:flex items-center gap-2.5 rounded-[18px] glass border px-4 py-2.5 shadow-2xl pointer-events-auto ${isDark ? 'border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'border-white shadow-[0_8px_32px_rgba(79,70,229,0.08)]'}`} data-speed="1.5">
           <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'} opacity-75`} />
             <span className={`relative inline-flex rounded-full h-2 w-2 ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'}`} />
          </span>
          <span className={`font-mono text-[12px] font-medium ${isDark ? 'text-white/55' : 'text-black/60'}`}>Socket.IO connected</span>
        </div>

        <div className={`parallax-item absolute right-[8%] top-[45%] hidden md:flex items-center gap-2.5 rounded-[18px] border px-4 py-2.5 backdrop-blur-2xl shadow-2xl pointer-events-auto ${isDark ? 'border-[#12b3a8]/14 bg-[#12b3a8]/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'border-[#4f46e5]/20 bg-[#4f46e5]/10 shadow-[0_8px_32px_rgba(79,70,229,0.08)]'}`} data-speed="2.5">
          <GitMerge size={13} className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"} />
          <span className={`font-mono text-[12px] font-medium ${isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"}`}>Branch merged: feat/match</span>
        </div>

         <div className="ui-element mb-8 dynamic-island inline-flex items-center gap-2.5 rounded-full px-5 py-2 mt-20 pointer-events-auto shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
             <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'} opacity-75`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'}`} />
          </span>
          <Activity size={11} className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"} />
          <span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${isDark ? 'text-[#12b3a8]' : 'text-[#4f46e5]'}`}>
            Live Network Ping: {telemetry.ping}ms
          </span>
        </div>

        <div className="overflow-hidden pb-1 relative pointer-events-auto">
          <h1 className="clip-text text-gradient-primary text-[clamp(4rem,11vw,10rem)] font-black leading-[0.84] tracking-[-0.045em]">
            FORGE THE
          </h1>
        </div>
        <div className="overflow-hidden relative pointer-events-auto">
           <h1 className="clip-text text-gradient-hero text-[clamp(4rem,11vw,10rem)] font-black leading-[0.84] tracking-[-0.045em] pb-3">
            NETWORK.
          </h1>
        </div>

         <p className="ui-element mt-10 max-w-[480px] text-[17px] leading-[1.75] text-soft font-light tracking-[-0.01em] pointer-events-auto">
          DevSync is an unadulterated matchmaking protocol for software engineers. Parse your stack. Connect with high-signal builders. Execute.
        </p>

        <div className="ui-element mt-12 flex flex-col sm:flex-row gap-3 pointer-events-auto">
          <Link to="/register" className={`cta-primary group flex h-14 items-center justify-center gap-3 rounded-full border px-10 ${isDark ? 'bg-[#12b3a8]/[0.07] border-[#12b3a8]/38' : 'bg-[#4f46e5]/10 border-[#4f46e5]/30'}`}>
            <span className={`text-[14px] font-semibold tracking-[-0.01em] ${isDark ? 'text-[#12b3a8]' : 'text-[#4f46e5]'}`}>Initialize Protocol</span>
             <ArrowRight size={15} className={`transition-transform group-hover:translate-x-1 ${isDark ? 'text-[#12b3a8]' : 'text-[#4f46e5]'}`} />
          </Link>
          <a href="#architecture" className={`group flex h-14 items-center justify-center gap-3 rounded-full border border-base glass-light px-10 transition-all ${isDark ? 'hover:border-white/[0.14] hover:bg-white/[0.055]' : 'hover:border-black/[0.14] hover:bg-black/[0.05]'}`}>
            <span className="text-[14px] font-medium text-dim group-hover:text-base tracking-[-0.01em]">View Systems</span>
          </a>
        </div>

        <div className="ui-element absolute bottom-10 left-10 hidden sm:block pointer-events-auto">
          <div className="glass rounded-[16px] border border-base px-4 py-3.5 shadow-2xl">
            <p className={`font-mono text-[10px] leading-[1.8] ${isDark ? 'text-[#12b3a8]/60' : 'text-[#4f46e5]/80'}`}>
              SYS.MEM: {telemetry.mem}<br />
              ACTIVE_NODES: {telemetry.nodes}<br />
              STATUS: SECURE
            </p>
          </div>
        </div>

        <div className="ui-element absolute bottom-10 right-10 hidden sm:block pointer-events-auto">
          <div className="glass rounded-[16px] border border-base px-4 py-3.5 text-right shadow-2xl">
             <p className={`font-mono text-[10px] leading-[1.8] ${isDark ? 'text-[#12b3a8]/60' : 'text-[#4f46e5]/80'}`}>
              COORD: {mousePos.x.toFixed(2)} : {mousePos.y.toFixed(2)}<br />
              RENDER: {isDark ? 'R3F_GL' : '2D_VECTOR + R3F_BG'}<br />
              ENCRYPTION: SHA-256
            </p>
          </div>
        </div>
      </section>

      {/* Ticker & Stats */}
      <SystemStats isDark={isDark} />
      <div className={`relative z-10 border-y py-4 overflow-hidden ${isDark ? 'border-white/[0.04] bg-[#000000]/40 backdrop-blur-md' : 'border-black/[0.04] bg-white/40 backdrop-blur-md'}`}>
        <div className={`animate-marquee font-mono text-[11px] font-bold uppercase tracking-[0.35em] ${isDark ? 'text-[#12b3a8]/40' : 'text-[#4f46e5]/40'}`}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8">COMMIT • PUSH • MATCH • SOCKET • MERGE • COLLABORATE • SHIP</span>
          ))}
        </div>
      </div>

      {/* SYNCHRONIZED DEVELOPMENT */}
      <section className="collab-section relative z-10 py-32 border-b border-base overflow-hidden bg-panel">
        <div className={`absolute inset-0 bg-[linear-gradient(${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}_1px,transparent_1px),linear-gradient(90deg,${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-30`} />

        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="text-center mb-24 reveal-panel">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] text-base">
              Synchronized <span className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"}>Development.</span>
            </h2>
            <p className="mt-4 text-soft text-[15px] leading-relaxed max-w-md mx-auto font-light">
              Scroll to witness the matchmaking protocol execution within our secure tunnels.
            </p>
          </div>

          <div className={`absolute left-6 md:left-1/2 top-48 bottom-0 w-px -translate-x-1/2 ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`} />
          <div className={`collab-line absolute left-6 md:left-1/2 top-48 bottom-0 w-px -translate-x-1/2 shadow-2xl ${isDark ? 'bg-gradient-to-b from-[#12b3a8] via-[#12b3a8]/45 to-transparent' : 'bg-gradient-to-b from-[#4f46e5] via-[#4f46e5]/45 to-transparent'}`} />

          <div className="space-y-24">
            <div className="reveal-panel relative flex flex-col md:flex-row items-start md:items-center justify-between pl-12 md:pl-0">
              <div className="md:w-[45%]">
                <div className="glass-panel p-8 text-left md:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full glass-light border border-base px-3.5 py-1.5 mb-5">
                    <Cpu size={12} className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"} />
                    <span className="text-[12px] font-medium text-dim">Stack Parsed</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-base mb-2">Algorithm Engaged</h3>
                  <p className="text-[14px] text-soft leading-relaxed font-light">Your GitHub and React/Node capabilities are vectorized. The engine scans the network silently in the background.</p>
                </div>
              </div>
              <div className={`absolute left-6 md:left-1/2 h-5 w-5 rounded-full border-[3px] -translate-x-1/2 shadow-2xl z-10 ${isDark ? 'bg-[#000] border-[#12b3a8]' : 'bg-white border-[#4f46e5]'}`} />
              <div className="md:w-[45%] hidden md:block" />
            </div>

            <div className="reveal-panel relative flex flex-col md:flex-row items-start md:items-center justify-between pl-12 md:pl-0">
              <div className="md:w-[45%] hidden md:block" />
              <div className={`absolute left-6 md:left-1/2 h-5 w-5 rounded-full border-[3px] -translate-x-1/2 shadow-2xl z-10 ${isDark ? 'bg-[#000] border-[#12b3a8]' : 'bg-white border-[#4f46e5]'}`} />
              <div className="md:w-[45%]">
                <div className="glass-panel p-8 text-left">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 mb-5 ${isDark ? 'bg-[#12b3a8]/10 border-[#12b3a8]/30' : 'bg-[#4f46e5]/10 border-[#4f46e5]/30'}`}>
                    <Zap size={12} className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"} />
                    <span className={`text-[12px] font-medium ${isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"}`}>Mutual Match</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-base mb-2">Connection Formed</h3>
                  <p className="text-[14px] text-soft leading-relaxed font-light">You and a backend specialist swiped right. The cold-start problem is entirely eliminated.</p>
                </div>
              </div>
            </div>

            <div className="reveal-panel relative flex flex-col md:flex-row items-start md:items-center justify-between pl-12 md:pl-0">
              <div className="md:w-[45%]">
                 <div className="glass-panel p-8 text-left md:text-right">
                  <div className="inline-flex items-center gap-2 rounded-full glass-light border border-base px-3.5 py-1.5 mb-5">
                    <Network size={12} className={isDark ? "text-[#12b3a8]" : "text-[#4f46e5]"} />
                    <span className="text-[12px] font-medium text-dim">WSS:// Tunnel</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-base mb-2">Socket Room Opened</h3>
                  <p className="text-[14px] text-soft leading-relaxed font-light">End-to-end encrypted chat begins immediately. From idea to execution in a matter of seconds.</p>
                </div>
              </div>
               <div className={`absolute left-6 md:left-1/2 h-5 w-5 rounded-full border-[3px] -translate-x-1/2 shadow-2xl z-10 ${isDark ? 'bg-[#000] border-[#12b3a8]' : 'bg-white border-[#4f46e5]'}`} />
              <div className="md:w-[45%] hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE */}
      <section id="architecture" className="relative z-10 pt-32 pb-24 border-t border-base overflow-hidden bg-base">
         <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 reveal-panel">
            <h2 className="text-[clamp(3rem,5vw,4.2rem)] font-black leading-[0.88] tracking-[-0.045em] text-base">
              System<br />
              <span className={isDark ? "text-[#12b3a8]/45" : "text-[#4f46e5]/80"}>Architecture.</span>
            </h2>
            <p className={`max-w-md text-[15px] leading-[1.75] text-soft font-light border-l pl-5 ${isDark ? 'border-[#12b3a8]/25' : 'border-[#4f46e5]/40'}`}>
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
                     <span className={`flex items-center justify-center w-12 h-12 rounded-[16px] border shadow-inner transition-colors duration-300 ${isDark ? 'bg-white/[0.03] border-white/[0.08] group-hover:border-[#12b3a8]/40' : 'bg-black/[0.03] border-black/[0.06] group-hover:border-[#4f46e5]/40'}`}>
                      <feat.icon size={20} className={`transition-colors duration-300 ${isDark ? 'text-white/30 group-hover:text-[#12b3a8]' : 'text-black/30 group-hover:text-[#4f46e5]'}`} />
                    </span>
                    <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-dim">MODULE_{feat.id}</span>
                  </div>
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-base mb-3">{feat.title}</h3>
                  <p className="text-[14px] text-soft leading-relaxed font-light">{feat.desc}</p>
                </div>
                <div className={`relative z-10 mt-10 h-[2px] w-full overflow-hidden rounded-full ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`}>
                   <div className={`h-full w-0 transition-all duration-700 ease-out rounded-full group-hover:w-full ${isDark ? 'bg-gradient-to-r from-[#12b3a8] to-[#12b3a8]/60 shadow-[0_0_10px_rgba(18,179,168,0.8)]' : 'bg-gradient-to-r from-[#4f46e5] to-[#4f46e5]/80 shadow-[0_0_10px_rgba(79,70,229,0.4)]'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXECUTE */}
      <section className="relative z-10 border-t border-base pt-16 pb-32 text-center overflow-hidden bg-base">
        <div className="reveal-panel relative z-10 mx-auto max-w-4xl px-6 flex flex-col items-center">
          <div className="mb-8 dynamic-island inline-flex items-center gap-2.5 rounded-full px-5 py-2.5">
             <span className={`h-2 w-2 rounded-full animate-pulse ${isDark ? 'bg-[#12b3a8]' : 'bg-[#4f46e5]'}`} />
            <span className={`font-mono text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-[#12b3a8]' : 'text-[#4f46e5]'}`}>Awaiting Input</span>
          </div>
          <h2 className="text-[clamp(4.5rem,9vw,8rem)] font-black tracking-[-0.055em] text-base leading-none mb-12">
            EXECUTE.
          </h2>
          <Link to="/register" className={`group relative flex h-16 w-[300px] items-center justify-center overflow-hidden rounded-full glass-panel transition-all ${isDark ? 'hover:bg-[#12b3a8]/10 hover:shadow-[0_0_50px_rgba(18,179,168,0.3)]' : 'hover:bg-[#4f46e5]/5 hover:shadow-[0_10px_40px_rgba(79,70,229,0.2)]'}`}>
             <span className={`text-[15px] font-semibold transition-colors relative z-10 ${isDark ? 'text-[#12b3a8] group-hover:text-white' : 'text-[#4f46e5] group-hover:text-[#3730a3]'}`}>Boot System</span>
             <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out ${isDark ? 'bg-gradient-to-t from-[#12b3a8]/20 to-transparent' : 'bg-gradient-to-t from-[#4f46e5]/10 to-transparent'}`} />
          </Link>
        </div>
      </section>

    </div>
  )
}