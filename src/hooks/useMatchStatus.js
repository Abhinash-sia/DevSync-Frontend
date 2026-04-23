import { useQuery } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"

export function useMatchStatus(userId) {
  return useQuery({
    queryKey: ["matchStatus", userId],
    queryFn: async () => {
      const response = await api.get(`/match/status/${userId}`)
      return unwrap(response)
    },
    enabled: !!userId,
  })
}
