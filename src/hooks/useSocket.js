import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { initSocket, disconnectSocket } from "../lib/socket"
import { useMatchStore } from "../stores/matchStore"
import { authStore } from "../stores/authStore"
import { useGigNotificationStore } from "../stores/gigNotificationStore"
import { usePlatformNotificationStore } from "../stores/platformNotificationStore"

export function useSocket() {
  const user = authStore((s) => s.user)
  const queryClient = useQueryClient()
  const setLastMatch = useMatchStore((s) => s.setLastMatch)
  const setOnlineState = useMatchStore((s) => s.setOnlineState)
  const hydrateOnlineUsers = useMatchStore((s) => s.hydrateOnlineUsers)
  const addGigNotification = useGigNotificationStore((s) => s.addNotification)
  const addPlatformNotification = usePlatformNotificationStore((s) => s.addPopup)

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

    // ✅ Receive initial online status of all chat partners on connect
    socket.on("online-users", (entries) => {
      hydrateOnlineUsers(entries)
    })

    // ✅ Gig owner gets real-time notification when someone applies
    socket.on("gig-application", (payload) => {
      addGigNotification(payload)
      // Refresh connections so the new chatroom shows up in the sidebar
      queryClient.invalidateQueries({ queryKey: ["connections"] })
    })

    // ✅ New comment posted on one of my gigs — refresh that gig's comment list
    socket.on("gig-comment", (payload) => {
      if (payload?.gigId) {
        queryClient.invalidateQueries({ queryKey: ["gig-comments", payload.gigId] })
      }
    })

    // ✅ Listen for generic platform notifications (like connection requests)
    socket.on("new-notification", (payload) => {
      addPlatformNotification(payload)
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    })

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message)
    })

    return () => {
      socket.off("match")
      socket.off("online-status")
      socket.off("online-users")
      socket.off("gig-application")
      socket.off("gig-comment")
      socket.off("new-notification")
      socket.off("connect_error")
      disconnectSocket()
    }
  }, [user?._id, queryClient, setLastMatch, setOnlineState, hydrateOnlineUsers, addGigNotification, addPlatformNotification])
}