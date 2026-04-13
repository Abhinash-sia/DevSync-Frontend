import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { BriefcaseBusiness, Plus, X, TerminalSquare, ArrowRight, Code2, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import { useApplyGig, useCreateGig, useGigFeed, useMyGigs } from "../hooks/useGigs"
import SkillInput from "../components/ui/SkillInput"
import Skeleton from "../components/ui/Skeleton"
import GigDetailPanel from "../components/gigs/GigDetailPanel"

const gigSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  budget: z.coerce.number().positive("Budget must be greater than 0"),
})

function formatBudget(value) {
  const amount = Number(value || 0)
  if (Number.isNaN(amount)) return "Unspecified"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)
}

function normalizeList(value) { return Array.isArray(value) ? value : [] }
function normalizeSkills(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean)
  return []
}

function GigSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[280px] w-full rounded-[32px] bg-[#050505] border border-white/[0.04]" />
      ))}
    </div>
  )
}

// ─── GigCard ─────────────────────────────────────────────────────────────────
// ✅ Per-card apply state: applyingId tracks exactly which gig is being applied to
function GigCard({ gig, onApply, applyingId, appliedIds, onClick }) {
  const skills = normalizeSkills(gig?.skills)
  const isApplying = applyingId === gig?._id
  const isApplied = appliedIds.has(gig?._id)

  return (
    <motion.article
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative flex flex-col justify-between h-full overflow-hidden rounded-[24px] border border-white/[0.04] bg-[#050505] p-8 transition-colors hover:border-[#12b3a8]/30 hover:bg-[#0a0a0a] cursor-pointer"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#12b3a8]/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">[ ACTIVE_BOUNTY ]</p>
            <h2 className="text-xl font-bold tracking-tight text-white group-hover:text-[#12b3a8] transition-colors line-clamp-2 uppercase">
              {gig?.title}
            </h2>
          </div>
          <div className="shrink-0 rounded-md border border-[#12b3a8]/20 bg-[#12b3a8]/5 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-[#12b3a8]">
            {formatBudget(gig?.budget)}
          </div>
        </div>

        <p className="line-clamp-3 font-mono text-xs leading-relaxed text-white/50">{gig?.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded border border-white/5 bg-[#000000] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8 flex items-center justify-between gap-4 border-t border-white/[0.04] pt-6">
        <div className="flex items-center gap-2">
          <TerminalSquare size={14} className="text-white/20" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            {gig?.createdBy?.name || gig?.owner?.name || "SYS_ADMIN"}
          </span>
        </div>

        {/* Click to open panel hint */}
        <div className="flex items-center gap-2 font-mono text-[9px] text-white/30 uppercase tracking-widest">
          <span>View &amp; Comment</span>
          <ArrowRight size={11} />
        </div>
      </div>
    </motion.article>
  )
}

function MyGigCard({ gig, type, onClick }) {
  const skills = normalizeSkills(gig?.skills)
  return (
    <article 
      onClick={onClick}
      className={`rounded-[16px] border border-white/[0.04] bg-[#0a0a0a] p-5 transition hover:border-white/10 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${type === "posted" ? "text-purple-500" : "text-[#12b3a8]"} mb-1`}>
            [ {type === "posted" ? "SYS.POSTED" : "SYS.ACCEPTED"} ]
          </p>
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">{gig?.title}</h3>
        </div>
        <span className="font-mono text-[10px] font-bold tracking-widest text-white/40">{formatBudget(gig?.budget)}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="rounded border border-white/5 bg-[#000000] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/30">
            {skill}
          </span>
        ))}
      </div>
      {/* If this is an applied gig and a chatRoomId exists, show Open Chat */}
      {type === "applied" && gig?.chatRoomId && (
        <div className="mt-4 pt-4 border-t border-white/[0.04]">
          <Link
            to={`/app/chat/${gig.chatRoomId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-xl border border-[#12b3a8]/30 bg-[#050505] px-4 py-2.5 transition-all hover:border-[#12b3a8] hover:bg-[#12b3a8]/10 w-fit"
          >
            <MessageSquare size={13} className="text-[#12b3a8]" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#12b3a8]">Open Chat</span>
          </Link>
        </div>
      )}
    </article>
  )
}

function CreateGigModal({ open, onClose }) {
  const createGig = useCreateGig()
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(gigSchema),
    defaultValues: { title: "", description: "", skills: [], budget: "" },
  })

  const onSubmit = async (values) => {
    await createGig.mutateAsync({ ...values, budget: Number(values.budget) })
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-32px)] max-w-2xl -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#050505] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-[#12b3a8] text-[10px] font-mono tracking-[0.2em] uppercase mb-3">
                    <Code2 size={14} />
                    <span>[ NEW_BOUNTY_INIT ]</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase">Broadcast Task.</h2>
                  <p className="mt-2 font-mono text-[11px] text-white/40">Transmit requirements to the engineering pool.</p>
                </div>
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0a] text-white/50 hover:border-white/30 hover:text-white transition">
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">Project Identifier</label>
                  <input {...register("title")} placeholder="React Performance Polish" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#12b3a8]/50 focus:bg-[#12b3a8]/5 focus:outline-none transition-colors" />
                  {errors.title && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">Scope Parameters</label>
                  <textarea {...register("description")} rows={4} placeholder="Define execution requirements..." className="w-full resize-none rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#12b3a8]/50 focus:bg-[#12b3a8]/5 focus:outline-none transition-colors" />
                  {errors.description && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.description.message}</p>}
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_180px]">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">Required Dependencies</label>
                    <Controller name="skills" control={control} render={({ field }) => (
                      <SkillInput value={field.value} onChange={field.onChange} placeholder="React, Node..." />
                    )} />
                    {errors.skills && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.skills.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-white/40">Bounty (USD)</label>
                    <input type="number" min="1" {...register("budget")} placeholder="5000" className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#12b3a8]/50 focus:bg-[#12b3a8]/5 focus:outline-none transition-colors" />
                    {errors.budget && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.budget.message}</p>}
                  </div>
                </div>

                {createGig.error?.response?.data?.message && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-[10px] text-red-400">
                    {createGig.error.response.data.message}
                  </div>
                )}

                <div className="mt-8 flex justify-end border-t border-white/[0.04] pt-6">
                  <button type="submit" disabled={createGig.isPending} className="group relative flex h-12 items-center justify-center overflow-hidden rounded-xl border border-[#12b3a8]/40 bg-[#0a0a0a] px-8 transition-all hover:border-[#12b3a8] hover:bg-[#12b3a8]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50">
                    <span className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#12b3a8]">
                      {createGig.isPending ? "Transmitting..." : "Execute Post"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function GigsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("feed")
  const [selectedSkill, setSelectedSkill] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGig, setSelectedGig] = useState(null)

  // ✅ Track which gig is currently being applied to (per-card state)
  const [applyingId, setApplyingId] = useState(null)
  // ✅ Track successfully applied gig IDs for instant UI feedback
  const [appliedIds, setAppliedIds] = useState(new Set())
  // ✅ Track apply errors to show inline
  const [applyError, setApplyError] = useState(null)

  const gigFeed = useGigFeed()
  const myGigs = useMyGigs()
  const applyGig = useApplyGig()

  const gigFeedList = useMemo(() => normalizeList(gigFeed.data), [gigFeed.data])
  const postedGigs = useMemo(() => normalizeList(myGigs.data?.posted), [myGigs.data])
  const appliedGigs = useMemo(() => normalizeList(myGigs.data?.applied), [myGigs.data])

  const allSkills = useMemo(() => {
    const skillSet = new Set()
    gigFeedList.forEach((gig) => normalizeSkills(gig?.skills).forEach((skill) => skillSet.add(skill)))
    return ["All", ...Array.from(skillSet)]
  }, [gigFeedList])

  const filteredGigs = useMemo(() => {
    if (selectedSkill === "All") return gigFeedList
    return gigFeedList.filter((gig) => normalizeSkills(gig?.skills).some((s) => s === selectedSkill))
  }, [gigFeedList, selectedSkill])

  // ✅ Proper async handler with per-card loading + error feedback
  const handleApply = async (gigId) => {
    if (!gigId || applyingId) return
    setApplyingId(gigId)
    setApplyError(null)
    try {
      const result = await applyGig.mutateAsync(gigId)
      setAppliedIds((prev) => new Set([...prev, gigId]))
      // Navigate directly into the chatroom with the gig author
      if (result?.roomId) {
        navigate(`/app/chat/${result.roomId}`)
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to apply. Please try again."
      setApplyError(msg)
      setTimeout(() => setApplyError(null), 4000)
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <>
      <section className="page-shell px-4 pb-24 pt-8 md:px-8 max-w-[1600px] mx-auto min-h-screen bg-[#000000] text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#12b3a8] text-[10px] font-mono tracking-[0.2em] uppercase mb-4">
              <BriefcaseBusiness size={14} />
              <span>[ SYS.BOUNTY.BOARD ]</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-[1.1] tracking-tighter text-white">
              ACTIVE <span className="text-white/30">TASKS.</span>
            </h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="group flex h-12 items-center gap-3 rounded-xl border border-[#12b3a8]/30 bg-[#0a0a0a] px-6 transition-all hover:border-[#12b3a8] hover:bg-[#12b3a8]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)]">
            <Plus size={16} className="text-[#12b3a8] transition-transform group-hover:rotate-90" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#12b3a8]">Post Bounty</span>
          </button>
        </motion.div>

        {/* ✅ Inline error banner */}
        <AnimatePresence>
          {applyError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
            >
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="font-mono text-[10px] text-red-400">{applyError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8 flex border-b border-white/[0.04]">
          {["feed", "my"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="relative px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors">
              {activeTab === tab ? (
                <>
                  <span className="text-[#12b3a8]">{tab === "feed" ? "Network Bounties" : "My Telemetry"}</span>
                  <motion.div layoutId="gig-tab" className="absolute bottom-0 left-0 right-0 h-px bg-[#12b3a8] shadow-[0_0_10px_rgba(18,179,168,0.5)]" />
                </>
              ) : (
                <span className="text-white/30 hover:text-white/60">{tab === "feed" ? "Network Bounties" : "My Telemetry"}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "feed" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <button key={skill} onClick={() => setSelectedSkill(skill)} className={`rounded-md px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-all ${
                  selectedSkill === skill
                    ? "bg-[#12b3a8]/10 text-[#12b3a8] border border-[#12b3a8]/40 shadow-[inset_0_0_10px_rgba(18,179,168,0.2)]"
                    : "bg-[#0a0a0a] text-white/40 border border-white/[0.04] hover:border-white/20"
                }`}>
                  {skill}
                </button>
              ))}
            </div>

            {gigFeed.isLoading ? <GigSkeleton /> : filteredGigs.length ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {filteredGigs.map((gig, index) => (
                  <motion.div key={gig._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <GigCard
                      gig={gig}
                      onApply={handleApply}
                      applyingId={applyingId}
                      appliedIds={appliedIds}
                      onClick={() => setSelectedGig(gig)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-[24px] border border-white/[0.04] bg-[#050505]">
                <Code2 size={24} className="text-white/10 mb-4" />
                <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest">No matching nodes found.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[24px] border border-white/[0.04] bg-[#050505] p-8">
              <h2 className="font-mono text-xs text-white/50 mb-6 flex items-center gap-3 uppercase tracking-widest">
                <div className="h-1.5 w-1.5 bg-purple-500 rounded-full" /> Tasks Deployed
              </h2>
              <div className="space-y-4">
                {myGigs.isLoading
                  ? <Skeleton className="h-24 rounded-[16px] bg-[#0a0a0a] border border-white/5" />
                  : postedGigs.length
                    ? postedGigs.map(gig => <MyGigCard key={gig._id} gig={gig} type="posted" onClick={() => setSelectedGig(gig)} />)
                    : <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">No entries.</p>}
              </div>
            </section>
            <section className="rounded-[24px] border border-white/[0.04] bg-[#050505] p-8">
              <h2 className="font-mono text-xs text-white/50 mb-6 flex items-center gap-3 uppercase tracking-widest">
                <div className="h-1.5 w-1.5 bg-[#12b3a8] rounded-full" /> Tasks Accepted
              </h2>
              <div className="space-y-4">
                {myGigs.isLoading
                  ? <Skeleton className="h-24 rounded-[16px] bg-[#0a0a0a] border border-white/5" />
                  : appliedGigs.length
                    ? appliedGigs.map(gig => <MyGigCard key={gig._id} gig={gig} type="applied" onClick={() => setSelectedGig(gig)} />)
                    : <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest">No entries.</p>}
              </div>
            </section>
          </motion.div>
        )}
      </section>

      <CreateGigModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Gig detail slide-over panel */}
      <GigDetailPanel
        gig={selectedGig}
        open={!!selectedGig}
        onClose={() => setSelectedGig(null)}
        onApply={handleApply}
        isApplying={applyingId === selectedGig?._id}
        isApplied={appliedIds.has(selectedGig?._id)}
      />
    </>
  )
}