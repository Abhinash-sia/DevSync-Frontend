import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { Flame, Users, BriefcaseBusiness, User2 } from "lucide-react"

const items = [
  { to: "/app/feed", icon: Flame, label: "Discovery" },
  { to: "/app/connections", icon: Users, label: "Network" },
  { to: "/app/gigs", icon: BriefcaseBusiness, label: "Gigs" },
  { to: "/app/profile", icon: User2, label: "Profile" },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-base bg-elevated/80 pb-safe backdrop-blur-2xl xl:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="relative flex flex-col items-center">
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--primary-2)]/15 border border-[var(--primary-2)]/30 shadow-[0_0_15px_rgba(18,179,168,0.1)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <div className={`relative z-10 flex flex-col items-center gap-1.5 px-1 py-3 text-[10px] uppercase tracking-wider font-medium transition-colors ${
                  isActive ? "text-[var(--primary-2)]" : "text-soft hover:text-base"
                }`}>
                  <Icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(18,179,168,0.8)]" : ""} />
                  {label}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}