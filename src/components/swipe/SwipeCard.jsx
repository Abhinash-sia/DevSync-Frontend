import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react"
import { ArrowRight, ArrowLeft, ExternalLink } from "lucide-react"

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
      className="absolute inset-0 overflow-hidden rounded-[30px] border border-white/8 bg-[#0e1112] shadow-2xl"
    >
      <div className="relative h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,179,168,0.1),transparent_40%)]" />

        <div className="relative h-[48svh] overflow-hidden border-b border-white/6">
          <img
            src={
              profile.photoUrl ||
              "https://placehold.co/600x820/111111/e5e7eb?text=DevSync"
            }
            alt={profile.name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0d] via-transparent to-transparent" />

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
                <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">
                  {profile.name}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  {(profile.skills || []).slice(0, 3).join(" • ") || "Developer"}
                </p>
              </div>

              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-white/78 transition hover:text-white"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="relative p-5">
          <p className="text-sm leading-7 text-white/68">
            {profile.bio || "No bio yet. Swipe if the stack looks strong enough to start a build."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(profile.skills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-white/72"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSwipe("ignore")}
              className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/62 transition hover:bg-white/[0.05] hover:text-white"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => onSwipe("interested")}
              className="rounded-[18px] border border-[#12b3a8]/25 bg-[#12b3a8]/10 px-4 py-3 text-sm text-[#9ff7ee] transition hover:bg-[#12b3a8]/16"
            >
              Interested
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}