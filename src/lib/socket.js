import { io } from "socket.io-client"

let socket = null

export function initSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5, // Stop spamming after 5 failed attempts
      reconnectionDelay: 2000,
      transports: ["websocket", "polling"],
    })
  }
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}