import { create } from "zustand"

export const useChatStore = create((set) => ({
  typingByRoom: {},

  setTyping: (roomId, payload) =>
    set((state) => ({
      typingByRoom: {
        ...state.typingByRoom,
        [roomId]: payload,
      },
    })),

  clearTyping: (roomId) =>
    set((state) => {
      const next = { ...state.typingByRoom }
      delete next[roomId]
      return { typingByRoom: next }
    }),
}))