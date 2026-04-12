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
            <div
              key={profile._id}
              className="absolute inset-0"
              style={{
                transform: `scale(${1 - depth * 0.03}) translateY(${depth * 12}px)`,
              }}
            >
              <SwipeCard
                profile={profile}
                isTop={isTop}
                onSwipe={(action) => onAction(profile, action)}
              />
            </div>
          )
        })}
    </div>
  )
}