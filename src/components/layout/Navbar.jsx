import { useNavigate } from "react-router-dom"
import { LogOut, TerminalSquare } from "lucide-react"
import { authStore } from "../../stores/authStore"
import { useLogout } from "../../hooks/useAuth"

export default function Navbar() {
  const navigate = useNavigate()
  const user = authStore((s) => s.user)
  const logout = useLogout()

  const handleLogout = async () => {
    await logout.mutateAsync()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#070909]/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#12b3a8]/20 bg-[#12b3a8]/10 shadow-[0_0_15px_rgba(18,179,168,0.15)] relative">
            <TerminalSquare size={18} className="text-[#8ee7df]" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#070909] bg-green-500" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              dev.session.active
            </p>
            <h1 className="mt-0.5 text-sm font-medium text-white/90">
              {user?.name || "Developer"}
            </h1>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Disconnect
        </button>
      </div>
    </header>
  )
}