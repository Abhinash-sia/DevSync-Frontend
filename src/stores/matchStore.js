import { create } from "zustand"

export const useMatchStore = create((set) => ({
  onlineUsers: {},
  lastMatch: null,

  setOnlineState: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline,
      },
    })),

  hydrateOnlineUsers: (entries) =>
    set((state) => {
      const next = { ...state.onlineUsers }

      for (const entry of entries) {
        const userId = entry?.userId ?? entry?.id
        if (!userId) continue
        next[userId] = Boolean(
          typeof entry?.isOnline === "boolean"
            ? entry.isOnline
            : entry?.status === "online" || entry?.online
        )
      }

      return { onlineUsers: next }
    }),

  setLastMatch: (payload) => set({ lastMatch: payload }),
  clearLastMatch: () => set({ lastMatch: null }),
}))