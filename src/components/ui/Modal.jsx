import { AnimatePresence, motion } from "motion/react"

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-zinc-800 bg-[#111] shadow-2xl"
          >
            <div className="border-b border-zinc-800 px-5 py-4">
              <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}