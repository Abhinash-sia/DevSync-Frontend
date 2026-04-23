import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Send, ArrowRight, MessageSquare, TerminalSquare, Code2, CheckCircle } from "lucide-react"
import { authStore } from "../../stores/authStore"
import { useGigComments, usePostComment, useDmCommenter } from "../../hooks/useGigComments"

function formatBudget(value) {
  const amount = Number(value || 0)
  if (Number.isNaN(amount)) return "Unspecified"
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)
}

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Comment bubble ───────────────────────────────────────────────────────────
function CommentBubble({ comment, isOwner, gigId, onDm, isDming }) {
  const isMe = authStore.getState()?.user?._id === String(comment.author?._id)

  return (
    <div className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
      <img
        src={comment.author?.photoUrl || `https://ui-avatars.com/api/?name=${comment.author?.name || "D"}&background=111&color=fff`}
        alt={comment.author?.name}
        className="h-8 w-8 rounded-xl object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
      />
      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
            {isMe ? "You" : comment.author?.name}
          </span>
          <span className="font-mono text-[8px] text-white/20">{relativeTime(comment.createdAt)}</span>
        </div>
        <div className={`rounded-[14px] px-4 py-2.5 text-sm leading-relaxed ${
          isMe
            ? "rounded-tr-sm bg-[var(--primary-2)]/15 border border-[var(--primary-2)]/20 text-white"
            : "rounded-tl-sm bg-panel border border-base text-white/80"
        }`}>
          {comment.text}
        </div>
        {/* DM button visible only to gig owner, on other people's comments */}
        {isOwner && !isMe && (
          <button
            onClick={() => onDm(comment.author._id)}
            disabled={isDming}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/5 px-2.5 py-1 transition hover:border-[var(--primary-2)]/50 hover:bg-[var(--primary-2)]/10 disabled:opacity-40"
          >
            <MessageSquare size={10} className="text-[var(--primary-2)]" />
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-[var(--primary-2)]">
              {isDming ? "Opening..." : "DM"}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function GigDetailPanel({ gig, open, onClose, onApply, isApplying, isApplied }) {
  const user = authStore((s) => s.user)
  const isOwner = gig && String(gig.author?._id || gig.author) === String(user?._id)

  const { data: comments = [], isLoading: loadingComments } = useGigComments(open ? gig?._id : null)
  const postComment = usePostComment(gig?._id)
  const dmCommenter = useDmCommenter(gig?._id)

  const [text, setText] = useState("")
  const bottomRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || postComment.isPending) return
    await postComment.mutateAsync(text.trim())
    setText("")
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const skills = Array.isArray(gig?.skills) ? gig.skills : []

  return (
    <AnimatePresence>
      {open && gig && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-[60] h-full w-full max-w-lg flex flex-col border-l border-base bg-panel shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.04] p-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[var(--primary-2)] text-[9px] font-mono tracking-[0.2em] uppercase mb-2">
                  <Code2 size={11} />
                  <span>[ BOUNTY_DETAIL ]</span>
                </div>
                <h2 className="text-lg font-black tracking-tight text-white uppercase leading-tight line-clamp-2">
                  {gig.title}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-[var(--primary-2)]">
                    {formatBudget(gig.budget)}
                  </span>
                  <span className="text-white/20">·</span>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/30">
                    <TerminalSquare size={10} />
                    <span>{gig.author?.name || "SYS_ADMIN"}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-base bg-panel-2 text-dim hover:text-base transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3">Scope</p>
                <p className="font-mono text-xs leading-relaxed text-white/60">{gig.description}</p>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3">
                    Required Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="rounded border border-base bg-panel-2 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-dim">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply button (hidden for owner) */}
              {!isOwner && (
                <div className="border-t border-white/[0.04] pt-4">
                  {isApplied ? (
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--primary-2)]/30 bg-[var(--primary-2)]/5 px-4 py-3 w-fit">
                      <CheckCircle size={14} className="text-[var(--primary-2)]" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)]">Applied</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onApply(gig._id)}
                      disabled={isApplying}
                      className="group flex items-center gap-2 rounded-xl border border-[var(--primary-2)]/30 bg-panel-2 px-5 py-3 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_15px_rgba(18,179,168,0.2)] disabled:opacity-50"
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)]">
                        {isApplying ? "Executing..." : "Pull Branch"}
                      </span>
                      {!isApplying && <ArrowRight size={13} className="text-[var(--primary-2)] transition-transform group-hover:translate-x-1" />}
                    </button>
                  )}
                </div>
              )}

              {/* Comment thread */}
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-4">
                  Discussion · {comments.length}
                </p>

                {loadingComments ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 rounded-[14px] bg-white/[0.03] animate-pulse" />
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest text-center py-6">
                    No comments yet. Be the first.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <CommentBubble
                        key={c._id}
                        comment={c}
                        isOwner={isOwner}
                        gigId={gig._id}
                        onDm={(commenterId) => dmCommenter.mutate(commenterId)}
                        isDming={dmCommenter.isPending}
                      />
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Comment input footer */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-white/[0.04] p-4 flex gap-3 items-center"
            >
              <img
                src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=111&color=fff`}
                alt="You"
                className="h-8 w-8 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
              />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Drop a comment..."
                maxLength={500}
                className="flex-1 rounded-xl border border-base bg-panel-2 px-4 py-2.5 font-mono text-xs text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!text.trim() || postComment.isPending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--primary-2)]/30 bg-panel-2 text-[var(--primary-2)] transition hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 disabled:opacity-30"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
