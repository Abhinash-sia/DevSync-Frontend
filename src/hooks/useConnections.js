import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"
import { initSocket, getSocket } from "../lib/socket"
import { authStore } from "../stores/authStore"

export function useConnections() {
  return useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await api.get("/match/connections")
      const data = unwrap(response)
      return Array.isArray(data) ? data : data?.connections || []
    },
  })
}

export function useConnectionsRealtime() {
  const user = authStore((s) => s.user)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?._id) return

    // Ensure socket is initialized safely
    const socket = getSocket() || initSocket()

    const handleMatch = () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] })
    }

    const handleOnlineStatus = (payload) => {
      queryClient.setQueryData(["connections"], (old = []) => {
        if (!Array.isArray(old)) return []
        
        return old.map((connection) => {
          const targetUser =
            connection.user || connection.otherUser || connection.participant || connection.peer

          if (!targetUser?._id || targetUser._id !== payload?.userId) {
            return connection
          }

          // Update the specific user object inside the connection
          if (connection.user) return { ...connection, user: { ...connection.user, isOnline: payload?.isOnline } }
          if (connection.otherUser) return { ...connection, otherUser: { ...connection.otherUser, isOnline: payload?.isOnline } }
          if (connection.participant) return { ...connection, participant: { ...connection.participant, isOnline: payload?.isOnline } }
          if (connection.peer) return { ...connection, peer: { ...connection.peer, isOnline: payload?.isOnline } }

          return connection
        })
      })
    }

    socket.on("match", handleMatch)
    socket.on("online-status", handleOnlineStatus)

    return () => {
      socket.off("match", handleMatch)
      socket.off("online-status", handleOnlineStatus)
    }
  }, [queryClient, user?._id])
}