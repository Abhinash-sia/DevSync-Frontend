import axios from "axios"
import { authStore } from "../stores/authStore"
import { disconnectSocket } from "./socket"

export const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
})

export const unwrap = (response) => response?.data?.data ?? response?.data ?? response

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const state = authStore.getState()
      if (state.isAuthenticated) {
        state.clearUser()
        disconnectSocket()
      }
    }
    return Promise.reject(error)
  }
)

export default api // <-- CRITICAL: Required for files we haven't fixed yet