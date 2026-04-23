import { create } from "zustand"

export const usePlatformNotificationStore = create((set) => ({
  popups: [],

  addPopup: (payload) => {
    const id = Date.now()
    set((state) => ({
      popups: [{ ...payload, id }, ...state.popups].slice(0, 5),
    }))
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((state) => ({
        popups: state.popups.filter((n) => n.id !== id),
      }))
    }, 5000)
  },

  removePopup: (id) =>
    set((state) => ({
      popups: state.popups.filter((n) => n.id !== id),
    })),
}))
