import { AnimatePresence, motion } from "framer-motion"
import { X, Bell, User } from "lucide-react"
import { usePlatformNotificationStore } from "../../stores/platformNotificationStore"
import { Link } from "react-router-dom"

export default function PlatformNotificationToast() {
  const popups = usePlatformNotificationStore((s) => s.popups)
  const remove = usePlatformNotificationStore((s) => s.removePopup)

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 max-w-[320px] w-full pointer-events-none">
      <AnimatePresence>
        {popups.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="pointer-events-auto relative overflow-hidden rounded-[14px] border border-[var(--primary-2)]/20 bg-panel p-4 shadow-xl"
            onClick={() => remove(n.id)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(18,179,168,0.05),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--primary-2)]/10 text-[var(--primary-2)]">
                {n.type === "connection_request" ? <User size={18} /> : <Bell size={18} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">New Alert</p>
                <p className="text-[11px] text-soft break-words leading-snug mt-0.5">{n.message}</p>
                
                {n.sender?._id && (
                  <Link 
                    to={`/app/u/${n.sender._id}`} 
                    className="mt-2 inline-block font-mono text-[9px] uppercase tracking-widest text-[var(--primary-2)] hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  remove(n.id)
                }}
                className="self-start text-dim hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
