import { useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"
import { initSocket, getSocket } from "../lib/socket"
import { authStore } from "../stores/authStore"

function normalizeMessagesResponse(data) {
  const unwrapped = unwrap(data)
  return {
    messages: unwrapped?.messages || [],
    hasMore: unwrapped?.hasMore ?? false,
    nextCursor: unwrapped?.nextCursor ?? null,
  }
}

function getMessageFromPayload(payload) {
  return payload?.message || payload?.data || payload
}

function isSameMessage(a, b) {
  if (!a || !b) return false
  // Never treat a real persisted message as the same as an optimistic temp message
  if (a._id && b._id) {
    if (String(a._id).startsWith("temp-") !== String(b._id).startsWith("temp-")) return false
    return a._id === b._id
  }
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
      pageParams: [null],
      pages: [{ messages: [newMessage], hasMore: false, nextCursor: null }],
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
    // Perf: sidebar is kept fresh by socket setQueryData — no auto-refetch needed
    staleTime: 5 * 60 * 1000,
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
    queryFn: async ({ pageParam }) => {
      // Backend uses cursor-based pagination: ?before=<messageId>
      const url = pageParam
        ? `/chat/${roomId}/messages?limit=20&before=${pageParam}`
        : `/chat/${roomId}/messages?limit=20`
      const response = await api.get(url)
      return normalizeMessagesResponse(response)
    },
    enabled: !!roomId && !!user?._id,
    initialPageParam: null, // null = first page (no cursor)
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore) return undefined
      return lastPage?.nextCursor || undefined
    },
    // Perf: messages are kept fresh by socket events — disable background refetching
    staleTime: Infinity,
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
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["chat-room", roomId, "messages"] })
      const previousMessages = queryClient.getQueryData(["chat-room", roomId, "messages"])

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content,
        sender: user,
        createdAt: new Date().toISOString(),
        status: "sending"
      }

      queryClient.setQueryData(["chat-room", roomId, "messages"], (old) => appendMessageToInfiniteCache(old, optimisticMessage))

      return { previousMessages, optimisticMessageId: optimisticMessage._id }
    },
    onError: (err, newMsg, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["chat-room", roomId, "messages"], context.previousMessages)
      }
    },
    onSuccess: (message, variables, context) => {
      queryClient.setQueryData(["chat-room", roomId, "messages"], (old) => {
        if (!old?.pages?.length) return old
        const pages = [...old.pages]
        const existingMessages = pages[0]?.messages || []
        pages[0] = {
          ...pages[0],
          messages: existingMessages.map((msg) =>
            msg._id === context?.optimisticMessageId ? message : msg
          ),
        }
        return { ...old, pages }
      })
      // Perf: update chat-rooms sidebar in-cache instead of triggering HTTP refetch
      queryClient.setQueryData(["chat-rooms"], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((room) =>
          String(room._id) === roomId
            ? { ...room, lastMessage: message, updatedAt: message.createdAt }
            : room
        )
      })
    },
  })

  useEffect(() => {
    if (!roomId || !user?._id) return

    const socket = getSocket() || initSocket()
    setTypingUsers([])
    socket.emit("join-room", { roomId })

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

    socket.on("typing", handleTyping)

    return () => {
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

export function useChatRealtime() {
  const user = authStore((s) => s.user)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?._id) return

    const socket = getSocket() || initSocket()

    const handleMessage = (payload) => {
      if (!payload?.roomId) return
      const message = getMessageFromPayload(payload)

      // Skip messages sent by this user — the sendMessage mutation's onSuccess
      // already handles swapping the temp optimistic message with the real one.
      // Processing it here too would cause a race that shows duplicates.
      const senderId = message?.sender?._id || message?.senderId || message?.userId
      if (senderId && String(senderId) === String(user._id)) return

      // Update specific target chat room cache if it is loaded
      queryClient.setQueryData(["chat-room", payload.roomId, "messages"], (old) => {
        if (!old) return old
        return appendMessageToInfiniteCache(old, message)
      })

      // Perf: update sidebar in-cache instead of triggering HTTP refetch on every socket message
      queryClient.setQueryData(["chat-rooms"], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((room) =>
          String(room._id) === payload.roomId
            ? { ...room, lastMessage: message, updatedAt: message.createdAt }
            : room
        )
      })
    }

    socket.on("message", handleMessage)

    return () => {
      socket.off("message", handleMessage)
    }
  }, [queryClient, user?._id, user])
}