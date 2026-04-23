import { useNavigate, useLocation, Link } from "react-router-dom"
import { LogOut, Sun, Moon, TerminalSquare } from "lucide-react"
import { authStore } from "../../stores/authStore"
import { useLogout } from "../../hooks/useAuth"
import { useTheme } from "../../hooks/useTheme"

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authStore((s) => s.user)
  const logout = useLogout()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate("/")
  }

  const getPageInfo = () => {
    const path = location.pathname
    if (path.includes("/feed")) return { title: "Discovery Feed", subtitle: "network.explore" }
    if (path.includes("/connections")) return { title: "Connections", subtitle: "network.nodes" }
    if (path.includes("/gigs")) return { title: "Gig Board", subtitle: "network.bounties" }
    if (path.includes("/profile")) return { title: "My Profile", subtitle: "dev.identity" }
    if (path.includes("/chat")) return { title: "Encrypted Comms", subtitle: "socket.active" }
    return { title: user?.name || "Developer", subtitle: "dev.session.active" }
  }

  const { title, subtitle } = getPageInfo()

  return (
    <header className="sticky top-0 z-30 border-b border-base bg-elevated/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10 shadow-[0_0_15px_rgba(18,179,168,0.15)] relative group-hover:bg-[var(--primary-2)]/20 transition-colors">
            <TerminalSquare size={18} className="text-[var(--primary-2)]" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[var(--bg)] bg-green-500" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim group-hover:text-[var(--primary-2)] transition-colors">
              {subtitle}
            </p>
            <h1 className="mt-0.5 text-sm font-medium text-base group-hover:text-[var(--primary-2)] transition-colors">
              {title}
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-base bg-panel transition-all hover:border-[var(--primary-2)]/50 hover:bg-[var(--primary-2)]/10 text-dim hover:text-[var(--primary-2)]"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 rounded-full border border-base bg-panel px-5 py-2.5 text-sm font-medium text-soft transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Disconnect
          </button>
        </div>
      </div>
    </header>
  )
}