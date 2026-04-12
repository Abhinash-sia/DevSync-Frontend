import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { initSocket, disconnectSocket, getSocket } from "../lib/socket"
import { useMatchStore } from "../stores/matchStore"
import { authStore } from "../stores/authStore"

export function useSocket() {
  const user = authStore((s) => s.user)
  const queryClient = useQueryClient()
  const setLastMatch = useMatchStore((s) => s.setLastMatch)
  const setOnlineState = useMatchStore((s) => s.setOnlineState)

  useEffect(() => {
    if (!user?._id) return

    const socket = initSocket()

    // Backend auto-joins user to `user:${userId}` room on connection — no manual register needed

    // ✅ Mutual match happened — refresh connections list
    socket.on("match", (payload) => {
      setLastMatch(payload)
      queryClient.invalidateQueries({ queryKey: ["connections"] })
    })

    // ✅ Online/offline status updates
    socket.on("online-status", ({ userId, isOnline }) => {
      setOnlineState(userId, isOnline)
      queryClient.setQueryData(["connections"], (old = []) => {
        if (!Array.isArray(old)) return old
        return old.map((c) => {
          const u = c.user || c.otherUser
          if (String(u?._id) === String(userId)) {
            const key = c.user ? "user" : "otherUser"
            return { ...c, [key]: { ...u, isOnline } }
          }
          return c
        })
      })
    })

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message)
    })

    return () => {
      socket.off("match")
      socket.off("online-status")
      socket.off("connect_error")
      disconnectSocket()
    }
  }, [user?._id, queryClient, setLastMatch, setOnlineState])
}