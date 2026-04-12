import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"
import { authStore } from "../stores/authStore"

function normalizeUser(data) {
  // Normalize variations in backend response shape
  return data?.user || data?.data || data
}

export function useBootstrapAuth() {
  const setUser = authStore((s) => s.setUser)
  const clearUser = authStore((s) => s.clearUser)
  const setBootstrapping = authStore((s) => s.setBootstrapping)

  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await api.get("/auth/me")
      return normalizeUser(unwrap(response))
    },
    retry: false, // Do not retry 401s
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.isLoading) {
      setBootstrapping(true)
    } else {
      if (query.isSuccess && query.data) {
        setUser(query.data)
      } else if (query.isError) {
        clearUser()
      }
      setBootstrapping(false)
    }
  }, [query.isLoading, query.isSuccess, query.isError, query.data, setUser, clearUser, setBootstrapping])

  return query
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = authStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (payload) => {
      await api.post("/auth/login", payload)
      const response = await api.get("/auth/me")
      return normalizeUser(unwrap(response))
    },
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(["auth-user"], user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const setUser = authStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (payload) => {
      await api.post("/auth/register", payload)
      const response = await api.get("/auth/me")
      return normalizeUser(unwrap(response))
    },
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(["auth-user"], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearUser = authStore((s) => s.clearUser)

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout")
    },
    onSettled: () => {
      clearUser()
      queryClient.removeQueries({ queryKey: ["auth-user"] })
    },
  })
}