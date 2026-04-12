const palette = [
  "border-zinc-700 text-zinc-300 bg-zinc-950",
  "border-teal-900 text-teal-300 bg-teal-950/40",
  "border-emerald-900 text-emerald-300 bg-emerald-950/30",
  "border-cyan-900 text-cyan-300 bg-cyan-950/30",
]

export function skillColors(skill = "") {
  const hash = skill
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

  return palette[hash % palette.length]
}