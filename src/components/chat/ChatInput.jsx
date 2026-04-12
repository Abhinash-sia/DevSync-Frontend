import { useState } from "react"
import { SendHorizonal } from "lucide-react"

export default function ChatInput({ onSend, onTyping, isSending }) {
  const [value, setValue] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || isSending) return
    await onSend(text)
    setValue("")
  }

  return (
    <form onSubmit={submit} className="border-t border-white/6 bg-[#0a0c0d]/90 p-3 md:p-4">
      <div className="flex items-end gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-2">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onTyping?.()
          }}
          placeholder="Write a message..."
          className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/28"
        />

        <button
          type="submit"
          disabled={isSending || !value.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#12b3a8]/25 bg-[#12b3a8]/10 text-[#9ff7ee] transition hover:bg-[#12b3a8]/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizonal size={18} />
        </button>
      </div>
    </form>
  )
}