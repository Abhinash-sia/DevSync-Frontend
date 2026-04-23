import { AnimatePresence, motion } from "framer-motion"
import { X, BriefcaseBusiness, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useGigNotificationStore } from "../../stores/gigNotificationStore"

export default function GigApplicationToast() {
  const notifications = useGigNotificationStore((s) => s.notifications)
  const remove = useGigNotificationStore((s) => s.removeNotification)

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="pointer-events-auto relative overflow-hidden rounded-[18px] border border-[var(--primary-2)]/25 bg-panel p-5 shadow-2xl"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(18,179,168,0.08),transparent_60%)] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-2)]/10 border border-[var(--primary-2)]/20">
                    <BriefcaseBusiness size={13} className="text-[var(--primary-2)]" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--primary-2)]">
                    New Application
                  </span>
                </div>
                <button
                  onClick={() => remove(n.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-base bg-panel-2 text-dim hover:text-base transition"
                >
                  <X size={11} />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={n.applicant?.photoUrl || `https://ui-avatars.com/api/?name=${n.applicant?.name || "D"}&background=111&color=fff`}
                  alt={n.applicant?.name}
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{n.applicant?.name}</p>
                  <p className="font-mono text-[9px] text-white/40 truncate uppercase tracking-widest">
                    Applied to: {n.gigTitle}
                  </p>
                </div>
              </div>

              {n.applicant?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {n.applicant.skills.map((skill) => (
                    <span key={skill} className="rounded border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-[var(--primary-2)]">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <Link
                to={`/app/chat/${n.roomId}`}
                onClick={() => remove(n.id)}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--primary-2)]/30 bg-panel-2 px-4 py-2.5 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_15px_rgba(18,179,168,0.2)]"
              >
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--primary-2)]">
                  Open Chat
                </span>
                <ArrowRight size={12} className="text-[var(--primary-2)]" />
              </Link>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
