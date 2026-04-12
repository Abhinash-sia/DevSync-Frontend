function formatTime(value) {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function MessageBubble({ message, isMe }) {
  const content = message?.content || message?.text || ""
  const createdAt = message?.createdAt || message?.timestamp || new Date().toISOString()
  const isRead = message?.isRead || message?.read === true

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] rounded-[24px] px-5 py-3.5 shadow-sm ${
          isMe
            ? "bg-gradient-to-br from-[#12b3a8]/20 to-[#12b3a8]/10 border border-[#12b3a8]/30 text-white rounded-br-sm"
            : "bg-white/[0.04] border border-white/[0.06] text-white/90 rounded-bl-sm backdrop-blur-md"
        }`}
      >
        {/* Subtle top inner reflection for depth */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{content}</p>

        <div
          className={`mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider ${
            isMe ? "text-[#8ee7df]/70 justify-end" : "text-white/40 justify-start"
          }`}
        >
          <span>{formatTime(createdAt)}</span>
          {isMe && (
            <span className={isRead ? "text-[#8ee7df]" : "opacity-50"}>
              {isRead ? "Seen" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}