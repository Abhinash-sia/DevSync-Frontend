import { create } from "zustand"

// Stores incoming gig-application socket events so the UI can render a toast.
// Each notification: { gigId, gigTitle, roomId, applicant: { _id, name, photoUrl, bio, skills } }
export const useGigNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (payload) =>
    set((state) => ({
      notifications: [{ ...payload, id: Date.now() }, ...state.notifications].slice(0, 10),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}))
