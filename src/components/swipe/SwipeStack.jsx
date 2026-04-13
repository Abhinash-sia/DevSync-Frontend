import { motion, AnimatePresence } from "framer-motion"
import SwipeCard from "./SwipeCard"

export default function SwipeStack({ profiles = [], onAction }) {
  const stack = profiles.slice(0, 3)

  return (
    <div className="relative mx-auto h-[78svh] max-w-md">
      {stack
        .slice()
        .reverse()
        .map((profile, reversedIndex) => {
          const originalIndex = stack.length - 1 - reversedIndex
          const depth = reversedIndex
          const isTop = originalIndex === 0

          return (
            <motion.div
              key={profile._id}
              layout
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ 
                scale: 1 - depth * 0.03, 
                y: depth * 12, 
                opacity: 1 
              }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="absolute inset-0"
            >
              <SwipeCard
                profile={profile}
                isTop={isTop}
                onSwipe={(action) => onAction(profile, action)}
              />
            </motion.div>
          )
        })}
    </div>
  )
}