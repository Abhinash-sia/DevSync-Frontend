import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"
import { authStore } from "../stores/authStore"

export function useParseResumeAI() {
  const queryClient = useQueryClient()
  const setUser = authStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append("resume", file)

      const response = await api.post("/ai/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      
      return unwrap(response)
    },
    onSuccess: (data) => {
      if (data?.profile) {
        queryClient.setQueryData(["profile"], data.profile)
        setUser((prev) => ({ ...prev, ...data.profile }))
      }
    },
  })
}

export function useAIIcebreaker(roomId) {
  return useQuery({
    queryKey: ["ai-icebreaker", roomId],
    queryFn: async () => {
      const response = await api.get(`/ai/icebreaker/${roomId}`)
      return unwrap(response)?.message || ""
    },
    enabled: false, // Wait for manual trigger
  })
}