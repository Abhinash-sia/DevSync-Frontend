import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, User, MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "../../hooks/useNotifications"

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (n) => {
    if (!n.isRead) markRead.mutate(n._id)
    setIsOpen(false)
  }

  const getIcon = (type) => {
    switch (type) {
      case "connection_request":
        return <User size={14} />
      case "connection_accepted":
        return <Check size={14} />
      case "new_message":
        return <MessageSquare size={14} />
      default:
        return <Bell size={14} />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-base bg-panel transition-all hover:border-[var(--primary-2)]/50 hover:bg-[var(--primary-2)]/10 text-dim hover:text-[var(--primary-2)]"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-mono text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[340px] overflow-hidden rounded-[20px] border border-base bg-elevated/90 shadow-2xl backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-panel p-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="font-mono text-[10px] text-[var(--primary-2)] hover:text-white transition-colors uppercase tracking-wider"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto w-full flex flex-col scrollbar-hide py-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <Bell size={24} className="text-white/10 mb-3" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-dim">No incoming signals</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    to={n.sender?._id ? `/app/u/${n.sender._id}` : "#"}
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`relative flex items-start gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/5 ${n.isRead ? "opacity-60" : "bg-[var(--primary-2)]/5"}`}
                  >
                     <div className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-lg ${n.isRead ? "bg-panel border border-base text-soft" : "bg-[var(--primary-2)]/20 border border-[var(--primary-2)]/30 text-[var(--primary-2)]"}`}>
                      {getIcon(n.type)}
                     </div>

                     <div className="flex-1 min-w-0 pr-4">
                       <p className="text-sm text-base leading-tight break-words">
                         <span className="font-bold text-white">{n.sender?.name}</span> {n.message.replace(n.sender?.name || '', '')}
                       </p>
                       <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-dim">
                         {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                       </p>
                     </div>

                     {!n.isRead && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[var(--primary-2)] shadow-[0_0_8px_rgba(18,179,168,0.8)]" />
                     )}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
