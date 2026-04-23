import { AnimatePresence, motion } from "motion/react"
import { useMatchStore } from "../../stores/matchStore"

export default function MatchAnimation() {
  const lastMatch = useMatchStore((s) => s.lastMatch)
  const clearLastMatch = useMatchStore((s) => s.clearLastMatch)

  return (
    <AnimatePresence>
      {lastMatch && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={clearLastMatch}
          />

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-24px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[30px] border border-[var(--primary-2)]/25 bg-elevated p-6 shadow-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,179,168,0.12),transparent_48%)]" />

            <div className="relative z-10">
              <div className="inline-flex rounded-full border border-[var(--primary-2)]/25 bg-[var(--primary-2)]/10 px-4 py-2 font-mono-ui text-[11px] uppercase tracking-[0.26em] text-[var(--primary-2)]">
                match detected
              </div>

              <h3 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white">
                It’s a match.
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/62">
                You and {lastMatch?.user?.name || "this developer"} both showed interest.
              </p>

              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/8 bg-white/[0.03] font-mono-ui text-lg text-white">
                  YOU
                </div>
                <div className="text-2xl text-[var(--primary-2)]">×</div>
                <img
                  src={
                    lastMatch?.user?.photoUrl ||
                    "https://placehold.co/160x160/111111/e5e7eb?text=DS"
                  }
                  alt={lastMatch?.user?.name || "Matched user"}
                  className="h-20 w-20 rounded-[24px] object-cover ring-1 ring-white/8"
                />
              </div>

              <button
                onClick={clearLastMatch}
                className="ds-btn-primary mt-7"
              >
                Keep building
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}