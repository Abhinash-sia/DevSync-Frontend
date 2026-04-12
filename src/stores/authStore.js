import { create } from "zustand"

export const authStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isBootstrapping: false,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isBootstrapping: false,
    }),

  setBootstrapping: (value) =>
    set({
      isBootstrapping: value,
    }),
}))