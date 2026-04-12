import { useState } from "react"
import { X } from "lucide-react"
import { skillColors } from "../../utils/skillColors"
import { cn } from "../../utils/cn"

export default function SkillInput({
  value = [],
  onChange,
  placeholder = "Type a skill and press Enter",
}) {
  const [input, setInput] = useState("")

  const addSkill = (skill) => {
    const trimmed = skill.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) return
    onChange?.([...value, trimmed])
    setInput("")
  }

  const removeSkill = (skill) => {
    onChange?.(value.filter((item) => item !== skill))
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-3">
      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <span
            key={skill}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
              skillColors(skill)
            )}
          >
            {skill}
            <button type="button" onClick={() => removeSkill(skill)}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            addSkill(input)
          }
          if (e.key === "Backspace" && !input && value.length) {
            removeSkill(value[value.length - 1])
          }
        }}
        placeholder={placeholder}
        className="mt-3 w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
      />
    </div>
  )
}