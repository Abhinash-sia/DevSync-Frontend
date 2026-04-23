import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, UserRoundSearch, Calendar, SortDesc, MapPin, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { useDirectory } from "../hooks/useDirectory"
import Skeleton from "../components/ui/Skeleton"

export default function DirectoryPage() {
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: users, isLoading, isError, error } = useDirectory({
    search: searchQuery,
    sortBy,
    dateFrom,
    dateTo
  })

  return (
    <section className="page-shell px-4 pb-24 pt-8 md:px-8 max-w-[1600px] mx-auto relative min-h-screen bg-base text-base selection:bg-[var(--primary-2)]/30 selection:text-[var(--primary-2)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 text-[var(--primary-2)] text-[10px] font-mono tracking-[0.2em] uppercase mb-4">
          <UserRoundSearch size={14} />
          <span>[ SYS.NETWORK.DIRECTORY ]</span>
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-[1.1] tracking-tighter text-base">
          GLOBAL <span className="text-dim">ROSTER.</span>
        </h1>
        <p className="mt-4 font-mono text-[11px] text-soft max-w-2xl">
          Search, filter, and discover all developers across the DevSync network. Use the parameters below to narrow down your matching criteria.
        </p>
      </motion.div>

      {/* Filters Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12 rounded-[24px] border border-base bg-panel p-6 shadow-lg">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name, bio, or skills..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-12 w-full rounded-xl border border-base bg-panel-2 py-2 pl-11 pr-4 font-mono text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-all"
            />
          </div>

          {/* Date From */}
          <div className="relative flex items-center group">
            <span className="absolute left-3 text-white/30 group-hover:text-[var(--primary-2)] transition-colors">
              <Calendar size={14} />
            </span>
            <input
              type="date"
              value={dateFrom}
              title="Joined After"
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-12 w-full rouned-xl border border-base bg-panel-2 py-2 pl-9 pr-3 font-mono text-xs text-soft focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-all rounded-xl"
            />
          </div>

          {/* Date To */}
          <div className="relative flex items-center group">
             <span className="absolute left-3 text-white/30 group-hover:text-[var(--primary-2)] transition-colors">
              <Calendar size={14} />
            </span>
            <input
              type="date"
              value={dateTo}
              title="Joined Before"
              onChange={(e) => setDateTo(e.target.value)}
              className="h-12 w-full rounded-xl border border-base bg-panel-2 py-2 pl-9 pr-3 font-mono text-xs text-soft focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative flex items-center group">
            <span className="absolute left-3 text-white/30 group-hover:text-[var(--primary-2)] transition-colors">
              <SortDesc size={14} />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-base bg-panel-2 py-2 pl-9 pr-10 font-mono text-xs text-soft focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-all"
            >
              <option value="newest">Joined: Newest First</option>
              <option value="oldest">Joined: Oldest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 font-mono text-sm text-red-400 mb-8">
          {error?.response?.data?.message || "Failed to load directory."}
        </div>
      )}

      {/* Results grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xlg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
             <Skeleton key={n} className="h-64 rounded-[24px] bg-panel border border-base" />
          ))}
        </div>
      ) : (
        <>
          {users?.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-base bg-panel-2">
              <UserRoundSearch size={32} className="text-white/20 mb-4" />
              <p className="font-mono text-sm text-dim">No matching developers found.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xlg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {users?.map((user, index) => (
                  <motion.div
                    key={user._id}
                    layoutId={`user-${user._id}`}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                  >
                    <Link to={`/app/u/${user._id}`} className="group relative block h-full overflow-hidden rounded-[24px] border border-base bg-panel p-6 transition-all hover:border-[var(--primary-2)]/40 hover:bg-elevated hover:shadow-2xl">
                      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--primary-2)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                      
                      <div className="flex items-start gap-4 relative z-10">
                        <img
                          src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`}
                          alt={user.name}
                          className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate text-lg font-bold text-base transition-colors group-hover:text-[var(--primary-2)]">{user.name}</h3>
                          <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-dim">
                            <MapPin size={10} />
                            <span className="truncate">{user.location || "Unknown Sector"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 line-clamp-2 min-h-[2.5rem] font-mono text-xs leading-relaxed text-soft">
                        {user.bio || "No bio mapped in local storage. Node behavior unspecified."}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-1.5 overflow-hidden h-[24px]">
                        {user.skills?.slice(0, 4).map((skill, i) => (
                          <span key={i} className="rounded-md border border-white/5 bg-panel-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-dim transition-colors group-hover:border-[var(--primary-2)]/20 group-hover:bg-[var(--primary-2)]/5 group-hover:text-[var(--primary-2)]">
                            {skill}
                          </span>
                        ))}
                        {user.skills?.length > 4 && (
                          <span className="rounded-md border border-white/5 bg-panel-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-dim">
                            +{user.skills.length - 4}
                          </span>
                        )}
                      </div>

                      <div className="mx-auto mt-6 border-t border-white/5 pt-4 font-mono text-[10px] text-white/30 flex justify-between items-center">
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 group-hover:text-[var(--primary-2)] transition-opacity" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </section>
  )
}
