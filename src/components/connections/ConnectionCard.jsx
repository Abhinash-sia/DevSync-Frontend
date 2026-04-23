import { Link } from "react-router-dom"
import { ExternalLink, ArrowRight } from "lucide-react"
import { useMatchStore } from "../../stores/matchStore"

export default function ConnectionCard({ user }) {
  const onlineUsers = useMatchStore((s) => s.onlineUsers)
  const userId = user?._id ?? user?.id
  const isOnline =
    typeof onlineUsers?.[userId] === "boolean"
      ? onlineUsers[userId]
      : Boolean(user?.isOnline)

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-base bg-panel p-8 transition-colors hover:border-[var(--primary-2)]/30 hover:bg-elevated">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--primary-2)]/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="relative">
          <img
            src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || "D"}&background=111&color=fff`}
            alt={user?.name || "Developer"}
            className="h-14 w-14 rounded-xl object-cover ring-2 ring-[var(--bg)]"
          />
          <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg)] ${
            isOnline ? "bg-[var(--primary-2)] shadow-[0_0_10px_rgba(18,179,168,0.8)]" : "bg-zinc-600"
          }`} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold tracking-tight text-white group-hover:text-[var(--primary-2)] transition-colors uppercase">
            {user?.name || "UNNAMED_NODE"}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/40">
            {isOnline ? "● Online" : "○ Offline"}
          </p>
        </div>

        {user?.githubUrl && (
          <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-base bg-panel-2 text-dim transition hover:border-[var(--primary-2)]/50 hover:text-[var(--primary-2)]">
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <p className="relative z-10 mt-5 line-clamp-2 font-mono text-xs leading-relaxed text-white/50">
        {user?.bio || "Secure tunnel established. Awaiting initial payload."}
      </p>

      <div className="relative z-10 mt-6 border-t border-white/[0.04] pt-5">
        {/* ✅ Fixed: /chat/ → /app/chat/ */}
        <Link to={`/app/chat/${user?.roomId}`}
          className="flex items-center justify-center gap-3 rounded-xl border border-[var(--primary-2)]/30 bg-panel-2 px-4 py-3 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_15px_rgba(18,179,168,0.2)]">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)]">Access Socket</span>
          <ArrowRight size={14} className="text-[var(--primary-2)]" />
        </Link>
      </div>
    </article>
  )
}