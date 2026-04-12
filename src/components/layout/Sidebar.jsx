import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { Flame, Users, BriefcaseBusiness, User2, Command } from "lucide-react"

const items = [
  { to: "/app/feed", label: "Discovery Feed", icon: Flame },
  { to: "/app/connections", label: "Connections", icon: Users },
  { to: "/app/gigs", label: "Gig Board", icon: BriefcaseBusiness },
  { to: "/app/profile", label: "My Profile", icon: User2 },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/[0.04] bg-[#070909]/80 backdrop-blur-3xl xl:flex flex-col relative z-20">
      <div className="sticky top-0 flex h-screen flex-col">
        
        {/* Brand Card */}
        <div className="px-6 py-6">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02] p-5 shadow-2xl">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#12b3a8]/20 blur-2xl" />
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8ee7df] mb-3">
              DevSync Core
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-white leading-snug">
              Build with people who move fast.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              Match with developers, open chat, and turn project intent into execution.
            </p>
          </div>
        </div>

        {/* Navigation with Animated Pill */}
        <nav className="flex-1 px-4 pt-4">
          <div className="space-y-1 relative">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="relative block">
                {({ isActive }) => (
                  <>
                    {/* The magical floating background pill */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-2xl border border-[#12b3a8]/30 bg-[#12b3a8]/15 shadow-[0_0_20px_rgba(18,179,168,0.1)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    
                    <div className={`relative z-10 flex items-center gap-3 px-4 py-3.5 text-sm transition-colors ${
                      isActive ? "text-[#9ff7ee] font-medium" : "text-white/50 hover:text-white"
                    }`}>
                      <Icon size={18} className={isActive ? "drop-shadow-[0_0_8px_rgba(18,179,168,0.8)]" : ""} />
                      <span>{label}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Shortcuts Block */}
        <div className="px-6 pb-6">
          <div className="rounded-[20px] border border-white/[0.06] bg-black/40 p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">
              <Command size={12} />
              <span>telemetry_shortcuts</span>
            </div>
            <div className="space-y-2.5 text-xs text-white/50 font-mono">
              <div className="flex justify-between items-center"><span className="text-white/30">ignore</span><span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">J</span></div>
              <div className="flex justify-between items-center"><span className="text-white/30">connect</span><span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-[#8ee7df]">K</span></div>
              <div className="flex justify-between items-center"><span className="text-white/30">close UI</span><span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">ESC</span></div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  )
}