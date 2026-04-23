import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react"
import { ArrowRight, ArrowLeft, ExternalLink } from "lucide-react"
import CodeSnippet from "../ui/CodeSnippet"

const SWIPE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 520

export default function SwipeCard({ profile, onSwipe, isTop = true }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 0, 220], [-14, 0, 14])
  const likeOpacity = useTransform(x, [20, 120], [0, 1])
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0])

  const triggerSwipe = async (direction) => {
    const targetX = direction === "interested" ? 420 : -420
    await animate(x, targetX, {
      type: "spring",
      stiffness: 260,
      damping: 24,
    })
    onSwipe(direction)
  }

  return (
    <motion.article
      drag={isTop ? "x" : false}
      dragElastic={0.16}
      dragMomentum
      style={{ x, rotate }}
      onDragEnd={(_, info) => {
        const shouldRight =
          info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD
        const shouldLeft =
          info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD

        if (shouldRight) return triggerSwipe("interested")
        if (shouldLeft) return triggerSwipe("ignore")

        animate(x, 0, {
          type: "spring",
          stiffness: 320,
          damping: 28,
        })
      }}
      className="absolute inset-0 overflow-hidden rounded-[30px] border border-base bg-panel shadow-2xl transition hover:border-[var(--primary-2)] hover:shadow-[0_0_20px_rgba(18,179,168,0.2)]"
    >
      <div className="relative h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,179,168,0.1),transparent_40%)]" />

        <div className="relative h-[48svh] min-h-[300px] shrink-0 overflow-hidden border-b border-base">
          <img
            src={
              profile.photoUrl ||
              `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.name || "dev"}`
            }
            alt={profile.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />

          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute left-4 top-4 rounded-full border border-emerald-400/40 bg-black/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300"
          >
            <span className="flex items-center gap-2">
              <ArrowRight size={14} />
              Interested
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute right-4 top-4 rounded-full border border-red-400/40 bg-black/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-300"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Ignore
            </span>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.05em] text-base drop-shadow-sm">
                  {profile.name}
                </h2>
                <p className="mt-2 text-sm text-soft">
                  {(profile.skills || []).join(" • ") || "Developer"}
                </p>
              </div>

              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-base bg-panel/50 backdrop-blur-md text-soft transition hover:text-base hover:bg-panel"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="relative p-5 h-[calc(100%-48svh)] overflow-y-auto custom-scrollbar flex flex-col">
          <p className="text-sm leading-7 text-soft">
            {profile.bio || "No bio yet. Swipe if the stack looks strong enough to start a build."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(profile.skills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-base bg-panel-2 px-3 py-1.5 text-xs text-soft"
              >
                {skill}
              </span>
            ))}
          </div>

          {profile.codeSnippet?.code && (
            <div className="mt-6 mb-2">
              {profile.codeSnippet.title && (
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-dim">
                  {profile.codeSnippet.title}
                </p>
              )}
              <CodeSnippet 
                code={profile.codeSnippet.code} 
                language={profile.codeSnippet.language} 
              />
            </div>
          )}

          <div className="mt-auto pt-6 flex grid-cols-2 gap-3 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => triggerSwipe("ignore")}
              className="flex-1 rounded-[18px] border border-base bg-panel-2 px-4 py-3 text-sm text-soft transition hover:bg-panel-3 hover:text-base"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => triggerSwipe("interested")}
              className="flex-1 rounded-[18px] border border-[var(--primary-2)]/25 bg-[var(--primary-2)]/10 px-4 py-3 text-sm text-[var(--primary-2)] transition hover:border-[var(--primary-2)]/50 hover:bg-[var(--primary-2)]/20 hover:shadow-[0_0_15px_rgba(18,179,168,0.2)]"
            >
              Interested
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}