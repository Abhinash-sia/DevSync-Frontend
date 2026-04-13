import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { Flame, Users, BriefcaseBusiness, User2, Command, TerminalSquare } from "lucide-react"

const items = [
  { to: "/app/feed", label: "Discovery Feed", icon: Flame },
  { to: "/app/connections", label: "Connections", icon: Users },
  { to: "/app/gigs", label: "Gig Board", icon: BriefcaseBusiness },
  { to: "/app/profile", label: "My Profile", icon: User2 },
]

export default function Sidebar() {
  return (
    <aside className="group hidden shrink-0 w-[88px] hover:w-72 border-r border-white/[0.04] bg-[#070909]/80 backdrop-blur-3xl xl:flex flex-col relative z-20 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden">
      <div className="sticky top-0 flex h-screen flex-col w-72">
        
        {/* Brand Header */}
        <div className="px-6 py-8 flex items-center gap-4">
          <div className="shrink-0 flex h-[40px] w-[40px] items-center justify-center rounded-xl border border-[#12b3a8]/20 bg-[#12b3a8]/10 shadow-[0_0_15px_rgba(18,179,168,0.15)] relative group-hover:shadow-[0_0_20px_rgba(18,179,168,0.25)] transition-shadow">
            <TerminalSquare size={18} className="text-[#8ee7df]" />
            <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-[#070909] bg-green-500" />
          </div>
          <div className="flex flex-col whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
             <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8ee7df]">
               DevSync Core
             </p>
             <h2 className="text-sm font-semibold text-white">
               Protocol v1.0.4
             </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-2">
          <div className="space-y-2 relative">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="relative block group/link">
                {({ isActive }) => (
                  <>
                    {/* Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 rounded-2xl border border-[#12b3a8]/30 bg-[#12b3a8]/15 shadow-[0_0_20px_rgba(18,179,168,0.1)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    
                    <div className={`relative z-10 flex items-center w-[256px] px-4 py-3.5 transition-colors ${
                      isActive ? "text-[#9ff7ee] font-medium" : "text-white/50 group-hover/link:text-white"
                    }`}>
                      <div className="flex w-6 shrink-0 items-center justify-center">
                        <Icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(18,179,168,0.8)]" : ""} />
                      </div>
                      <span className="ml-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {label}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Shortcuts Block */}
        <div className="px-6 pb-8 relative flex w-72 justify-start items-end min-h-[140px]">
          {/* Collapsed visible icon */}
          <div className="absolute left-6 bottom-8 flex h-[40px] w-[40px] items-center justify-center opacity-100 transition-opacity duration-300 group-hover:opacity-0 group-hover:pointer-events-none shrink-0 border border-white/[0.04] rounded-xl bg-white/[0.01]">
            <Command size={18} className="text-white/20" />
          </div>

          {/* Expanded panel */}
          <div className="rounded-[20px] border border-white/[0.06] bg-black/40 p-4 w-[240px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto shadow-xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8ee7df] mb-3">
              <Command size={12} />
              <span>telemetry_keys</span>
            </div>
            <div className="space-y-2.5 text-[11px] text-white/50 font-mono">
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