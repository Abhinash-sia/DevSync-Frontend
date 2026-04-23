import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"
import { authStore } from "../stores/authStore"

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/profile")
      return unwrap(response)?.profile || unwrap(response)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = authStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.patch("/profile/update", payload)
      return unwrap(response)?.profile || unwrap(response)
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile"], profile)
      queryClient.invalidateQueries({ queryKey: ["auth-user"] })
      setUser(profile)
    },
  })
}

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient()
  const setUser = authStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append("photo", file)

      const response = await api.post("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      return unwrap(response)?.profile || unwrap(response)
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile"], profile)
      queryClient.invalidateQueries({ queryKey: ["auth-user"] })
      setUser(profile)
    },
  })
}

export function usePublicProfile(userId) {
  return useQuery({
    queryKey: ["publicProfile", userId],
    queryFn: async () => {
      const response = await api.get(`/profile/${userId}`)
      return unwrap(response)?.user || unwrap(response)
    },
    enabled: !!userId,
  })
}