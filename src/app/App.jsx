import { useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { queryClient } from "../lib/queryClient"
import { router } from "./router"
import { useBootstrapAuth } from "../hooks/useAuth"
import { authStore } from "../stores/authStore"
import { disconnectSocket, initSocket } from "../lib/socket"

function AppInner() {
  useBootstrapAuth()
  const isAuthenticated = authStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      initSocket()
    } else {
      disconnectSocket()
    }
    
    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated])

  return <RouterProvider router={router} />
}

export default function App() { // <-- Back to default export
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}