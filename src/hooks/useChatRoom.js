import { useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"
import { initSocket, getSocket } from "../lib/socket"
import { authStore } from "../stores/authStore"

function normalizeMessagesResponse(data) {
  const unwrapped = unwrap(data)
  return {
    messages: unwrapped?.messages || [],
    hasNextPage: unwrapped?.hasNextPage ?? unwrapped?.pagination?.hasNextPage ?? false,
    nextPage: unwrapped?.nextPage ?? unwrapped?.pagination?.nextPage ?? undefined,
    currentPage: unwrapped?.currentPage ?? unwrapped?.pagination?.currentPage ?? 1,
  }
}

function getMessageFromPayload(payload) {
  return payload?.message || payload?.data || payload
}

function isSameMessage(a, b) {
  if (!a || !b) return false
  if (a._id && b._id) return a._id === b._id
  return (
    a.content === b.content &&
    (a.createdAt || a.timestamp) === (b.createdAt || b.timestamp) &&
    (a.sender?._id || a.senderId || a.userId) === (b.sender?._id || b.senderId || b.userId)
  )
}

function appendMessageToInfiniteCache(oldData, newMessage) {
  if (!newMessage) return oldData
  if (!oldData?.pages?.length) {
    return {
      pageParams: [1],
      pages: [{ messages: [newMessage], hasNextPage: false, nextPage: undefined, currentPage: 1 }],
    }
  }

  const pages = [...oldData.pages]
  const firstPage = pages[0] || { messages: [] }
  const existingMessages = firstPage.messages || []

  if (existingMessages.some((msg) => isSameMessage(msg, newMessage))) return oldData

  pages[0] = { ...firstPage, messages: [...existingMessages, newMessage] }
  return { ...oldData, pages }
}

export function useChatRooms() {
  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async () => {
      const response = await api.get("/chat/rooms")
      const data = unwrap(response)
      return Array.isArray(data) ? data : data?.rooms || []
    },
  })
}

export function useChatRoom(roomId) {
  const user = authStore((s) => s.user)
  const queryClient = useQueryClient()
  const [typingUsers, setTypingUsers] = useState([])
  const typingTimeouts = useRef(new Map())
  const lastTypingEmitRef = useRef(0)

  const messagesQuery = useInfiniteQuery({
    queryKey: ["chat-room", roomId, "messages"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/chat/${roomId}/messages?page=${pageParam}&limit=20`)
      return normalizeMessagesResponse(response)
    },
    enabled: !!roomId && !!user?._id,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNextPage) return undefined
      return lastPage?.nextPage || lastPage.currentPage + 1
    },
  })

  // Safely flatten messages and guard against undefined arrays
  const flatMessages = useMemo(() => {
    const pages = messagesQuery.data?.pages || []
    return pages
      .slice()
      .reverse()
      .flatMap((page) => page?.messages || [])
  }, [messagesQuery.data])

  const sendMessage = useMutation({
    mutationFn: async (content) => {
      const response = await api.post(`/chat/${roomId}/send`, { content })
      return unwrap(response)?.message || unwrap(response)
    },
    onSuccess: (message) => {
      queryClient.setQueryData(["chat-room", roomId, "messages"], (old) => appendMessageToInfiniteCache(old, message))
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] })
    },
  })

  useEffect(() => {
    if (!roomId || !user?._id) return

    const socket = getSocket() || initSocket()
    setTypingUsers([])
    socket.emit("join-room", { roomId })

    const handleMessage = (payload) => {
      if (payload?.roomId && payload.roomId !== roomId) return
      const message = getMessageFromPayload(payload)
      queryClient.setQueryData(["chat-room", roomId, "messages"], (old) => appendMessageToInfiniteCache(old, message))
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] })
    }

    const handleTyping = (payload) => {
      if (payload?.roomId !== roomId || !payload?.userId || payload.userId === user._id) return
      
      setTypingUsers((prev) => {
        const filtered = prev.filter((item) => item.userId !== payload.userId)
        return [...filtered, { userId: payload.userId, name: payload.name || "Someone" }]
      })

      const existingTimeout = typingTimeouts.current.get(payload.userId)
      if (existingTimeout) clearTimeout(existingTimeout)

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((item) => item.userId !== payload.userId))
        typingTimeouts.current.delete(payload.userId)
      }, 1800)

      typingTimeouts.current.set(payload.userId, timeout)
    }

    socket.on("message", handleMessage)
    socket.on("typing", handleTyping)

    return () => {
      socket.off("message", handleMessage)
      socket.off("typing", handleTyping)
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout))
      typingTimeouts.current.clear()
      setTypingUsers([])
    }
  }, [roomId, user?._id, queryClient])

  const emitTyping = () => {
    if (!roomId || !user?._id) return
    const now = Date.now()
    if (now - lastTypingEmitRef.current < 700) return

    const socket = getSocket() || initSocket()
    socket.emit("typing", { roomId, userId: user._id, name: user.name })
    lastTypingEmitRef.current = now
  }

  return { ...messagesQuery, messages: flatMessages, sendMessage, typingUsers, emitTyping }
}