import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Sparkles, Loader2, TerminalSquare } from "lucide-react"
import { useChatRoom, useChatRooms } from "../hooks/useChatRoom"
import { useAIIcebreaker } from "../hooks/useAI"
import { authStore } from "../stores/authStore"
import MessageBubble from "../components/chat/MessageBubble"
import Skeleton from "../components/ui/Skeleton"

function getRoomTitle(room, currentUserId) {
  if (room?.name) return room.name
  if (Array.isArray(room?.participants)) {
    const other = room.participants.find((p) => String(p?._id) !== String(currentUserId))
    if (other?.name) return other.name
  }
  return "ENCRYPTED_ROOM"
}

export default function ChatPage() {
  const { roomId } = useParams()
  const user = authStore((s) => s.user)
  const listRef = useRef(null)

  const roomsQuery = useChatRooms()
  const chat = useChatRoom(roomId)
  const { refetch: generateIcebreaker, isFetching: isGeneratingIcebreaker } = useAIIcebreaker(roomId)

  const [inputContent, setInputContent] = useState("")

  const room = useMemo(() => {
    const rooms = Array.isArray(roomsQuery.data) ? roomsQuery.data : []
    return rooms.find((item) => (item?._id || item?.roomId) === roomId)
  }, [roomsQuery.data, roomId])

  // Track previously seen message IDs so only NEW messages animate in
  const prevMessageIdsRef = useRef(new Set())

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [roomId])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140
    if (nearBottom) el.scrollTop = el.scrollHeight
    // Update the set of known message IDs after each render
    const msgs = Array.isArray(chat.messages) ? chat.messages : []
    msgs.forEach((m) => { if (m?._id) prevMessageIdsRef.current.add(m._id) })
  }, [chat.messages?.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputContent.trim() || chat.sendMessage.isPending) return
    const content = inputContent
    setInputContent("")
    try {
      await chat.sendMessage.mutateAsync(content)
    } catch (err) {
      console.error("Failed to send message", err)
      setInputContent(content)
    }
  }

  const handleIcebreakerClick = async () => {
    try {
      const { data: generatedMessage } = await generateIcebreaker()
      if (generatedMessage) {
        setInputContent(generatedMessage)
      }
    } catch (error) {
      console.error("Failed to generate icebreaker", error)
    }
  }

  const messages = Array.isArray(chat.messages) ? chat.messages : []
  const isChatEmpty = messages.length === 0

  return (
    <section className="h-[calc(100vh-80px)] overflow-hidden bg-base text-base">
      <div className="flex h-full max-w-[1200px] mx-auto border-x border-white/[0.04]">

        <div className="flex min-w-0 flex-1 flex-col bg-base relative">

          {/* Header */}
          <div className="border-b border-base bg-elevated px-6 py-5 flex items-center justify-between z-20">
            <div className="flex items-center gap-4">
              <Link to="/app/connections" className="p-2 -ml-2 rounded-xl text-dim hover:bg-panel-2 hover:text-base transition md:hidden">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex flex-col">
                <p className="text-[var(--primary-2)] text-[10px] font-mono tracking-[0.2em] uppercase mb-0.5">[ SECURE_SOCKET ]</p>
                <h1 className="text-xl font-bold text-white tracking-tight uppercase">{getRoomTitle(room, user?._id)}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-[var(--primary-2)]/30 bg-[var(--primary-2)]/10 px-4 py-2 shadow-[inset_0_0_10px_rgba(18,179,168,0.1)]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary-2)] animate-pulse" />
              <span className="text-[10px] font-bold font-mono text-[var(--primary-2)] uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Chat History */}
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 relative z-10 scroll-smooth">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

            {chat.isLoading ? (
              <Skeleton className="h-16 w-[70%] rounded-[16px] bg-panel-2 border border-base" />
            ) : isChatEmpty ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/5 text-[var(--primary-2)] shadow-[0_0_40px_rgba(18,179,168,0.1)]">
                  <TerminalSquare size={28} />
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-white uppercase">Socket Opened.</h3>
                <p className="mt-3 max-w-sm font-mono text-xs leading-relaxed text-white/40">
                  E2E connection established with {getRoomTitle(room, user?._id)}. Initialize the payload or execute an AI icebreaker.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4 flex flex-col">
                {messages.map((message, index) => {
                  const senderId = message?.sender?._id || message?.senderId || message?.userId
                  const isNew = message?._id && !prevMessageIdsRef.current.has(message._id)
                  return isNew ? (
                    <motion.div key={message?._id || index} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                      <MessageBubble message={message} isMe={String(senderId) === String(user?._id)} />
                    </motion.div>
                  ) : (
                    <div key={message?._id || index}>
                      <MessageBubble message={message} isMe={String(senderId) === String(user?._id)} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="border-t border-base bg-elevated p-4 md:p-6 relative z-20">
            {isChatEmpty && (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleIcebreakerClick}
                  disabled={isGeneratingIcebreaker}
                  className="group relative overflow-hidden flex items-center gap-3 rounded-xl border border-[var(--primary-2)]/40 bg-[var(--primary-2)]/10 px-6 py-3 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/20 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary-2)]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isGeneratingIcebreaker ? (
                    <Loader2 size={14} className="animate-spin text-[var(--primary-2)]" />
                  ) : (
                    <Sparkles size={14} className="text-[var(--primary-2)] transition-transform group-hover:scale-110" />
                  )}
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)]">
                    {isGeneratingIcebreaker ? "Scanning node data..." : "Execute AI Icebreaker"}
                  </span>
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="relative flex-1 group">
                <textarea
                  value={inputContent}
                  onChange={(e) => {
                    setInputContent(e.target.value)
                    if (chat.emitTyping) chat.emitTyping()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e)
                    }
                  }}
                  placeholder="> Compile transmission..."
                  className="w-full resize-none rounded-xl border border-base bg-panel-2 px-5 py-4 font-mono text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors"
                  rows={1}
                  style={{ minHeight: "56px", maxHeight: "140px" }}
                />
              </div>

              <button
                type="submit"
                disabled={!inputContent.trim() || chat.sendMessage.isPending}
                className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-xl bg-panel-2 border border-base text-dim transition-all hover:border-[var(--primary-2)]/50 hover:bg-[var(--primary-2)]/10 hover:text-[var(--primary-2)] hover:shadow-[0_0_15px_rgba(18,179,168,0.2)] disabled:opacity-50 disabled:hover:border-base disabled:hover:bg-panel-2 disabled:hover:text-dim"
              >
                {chat.sendMessage.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}