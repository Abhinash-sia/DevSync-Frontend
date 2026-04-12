import { AnimatePresence, motion } from "motion/react"

export default function TypingIndicator({ users = [] }) {
  if (!users.length) return null

  const label =
    users.length === 1
      ? `${users[0].name} is typing...`
      : `${users[0].name} and others are typing...`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className="inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-white/50"
      >
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
        </div>
        {label}
      </motion.div>
    </AnimatePresence>
  )
}