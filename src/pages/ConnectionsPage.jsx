import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MessageSquare, ExternalLink, ArrowRight, Network } from "lucide-react"
import { useConnections } from "../hooks/useConnections"
import { authStore } from "../stores/authStore"
import Skeleton from "../components/ui/Skeleton"

function getConnectionUser(connection, currentUserId) {
  if (connection?.user) return connection.user
  if (connection?.otherUser) return connection.otherUser
  if (Array.isArray(connection?.participants)) {
    return connection.participants.find((p) => p?._id !== currentUserId) || connection.participants[0]
  }
  return connection
}

function getRoomId(connection) {
  return connection?.roomId || connection?.chatRoomId || connection?.room?._id || connection?._id
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

function ConnectionsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-64 rounded-[24px] overflow-hidden border border-base bg-panel">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-2)]/5 to-transparent" />
          <Skeleton className="absolute inset-0 bg-panel-2" />
        </motion.div>
      ))}
    </div>
  )
}

export default function ConnectionsPage() {
  const user = authStore((s) => s.user)
  const { data, isLoading } = useConnections()

  const connections = Array.isArray(data) 
    ? data
        .map((item) => ({
          raw: item,
          user: getConnectionUser(item, user?._id),
          roomId: getRoomId(item),
        }))
        .filter((item) => item.user?._id && item.roomId)
    : []

  return (
    <section className="page-shell relative min-h-screen bg-base text-base px-4 pb-24 pt-8 md:px-8 max-w-[1600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-[var(--primary-2)] text-[10px] font-mono tracking-[0.2em] uppercase mb-4">
            <Network size={14} />
            <span>[ SYS.NETWORK.NODES ]</span>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-[1.1] tracking-tighter text-white">
            SECURED <span className="text-white/30">LINKS.</span>
          </h1>
        </div>
        <div className="flex h-12 items-center gap-3 rounded-xl border border-base bg-panel px-6">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary-2)] shadow-[0_0_8px_rgba(18,179,168,0.8)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/50">{connections.length} tunnels open</span>
        </div>
      </motion.div>

      {isLoading ? (
        <ConnectionsSkeleton />
      ) : connections.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {connections.map(({ user: dev, roomId }) => (
            <motion.article
              key={dev._id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-[24px] border border-base bg-panel p-8 transition-colors hover:border-[var(--primary-2)]/30 hover:bg-elevated"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--primary-2)]/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="relative">
                  <img
                    src={dev.photoUrl || `https://ui-avatars.com/api/?name=${dev.name || 'D'}&background=111&color=fff`}
                    alt={dev.name}
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-[var(--bg)]"
                  />
                  {dev.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg)] bg-[var(--primary-2)] shadow-[0_0_10px_rgba(18,179,168,0.8)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold tracking-tight text-white group-hover:text-[var(--primary-2)] transition-colors uppercase">
                    {dev.name || "UNNAMED_NODE"}
                  </h2>
                  <p className="mt-1 text-[10px] text-white/40 font-mono uppercase tracking-widest truncate">
                    {Array.isArray(dev.skills) && dev.skills.length > 0 
                      ? dev.skills.join(" • ") 
                      : "SYS.DEV"}
                  </p>
                </div>
              </div>

              <p className="relative z-10 mt-6 line-clamp-2 font-mono text-xs leading-relaxed text-white/50 h-10">
                {dev.bio || "Secure tunnel established. Awaiting initial payload."}
              </p>

              <div className="relative z-10 mt-8 flex items-center gap-3 border-t border-white/[0.04] pt-6">
                <Link
                  to={`/app/chat/${roomId}`}
                  className="flex flex-1 items-center justify-center gap-3 rounded-xl border border-[var(--primary-2)]/30 bg-panel-2 px-4 py-3 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_15px_rgba(18,179,168,0.2)]"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)]">Access Socket</span>
                  <ArrowRight size={14} className="text-[var(--primary-2)]" />
                </Link>
                {dev.githubUrl && (
                  <a
                    href={dev.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 h-[42px] w-[42px] items-center justify-center rounded-xl border border-base bg-panel-2 text-dim transition hover:border-[var(--primary-2)]/50 hover:bg-[var(--primary-2)]/10 hover:text-[var(--primary-2)]"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto mt-10 max-w-lg overflow-hidden rounded-[24px] border border-base bg-panel p-10 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary-2)]/5 to-transparent pointer-events-none" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-base bg-panel-2 text-dim mb-6">
            <Network size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">No Active Tunnels.</h2>
          <p className="mt-4 font-mono text-xs leading-relaxed text-white/40 max-w-sm mx-auto">
            Swipe in the Discovery Feed to isolate nodes matching your architecture. Mutual handshakes open secure sockets.
          </p>
          <Link to="/app/feed" className="mt-8 inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-[var(--primary-2)]/40 bg-panel-2 px-8 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)]">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)]">Open Discovery</span>
            <ArrowRight size={14} className="text-[var(--primary-2)]" />
          </Link>
        </motion.div>
      )}
    </section>
  )
}