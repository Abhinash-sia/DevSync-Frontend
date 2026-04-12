import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api, { unwrap } from "../lib/axios"

export function useSwipeFeed() {
  return useInfiniteQuery({
    queryKey: ["match", "feed"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`/match/feed?page=${pageParam}&limit=10`)
      return unwrap(res)
    },
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
  })
}

export function useSwipeAction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, action }) => {
      // Map frontend action names to backend enum values
      const mappedAction =
        action === "like" ? "interested" :
        action === "pass" ? "ignored" :
        action // allow "interested"/"ignored" to pass through directly
      const res = await api.post(`/match/swipe/${userId}`, { action: mappedAction })
      return unwrap(res)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match", "connections"] })
    },
  })
}