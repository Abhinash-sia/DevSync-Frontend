import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"

function normalizeMyGigs(data) {
  if (Array.isArray(data)) return { posted: data, applied: [] }
  return {
    posted: data?.posted || data?.myGigs || data?.created || [],
    applied: data?.applied || data?.applications || [],
  }
}

export function useGigFeed() {
  return useQuery({
    queryKey: ["gig-feed"],
    queryFn: async () => {
      const response = await api.get("/gig/feed")
      const data = unwrap(response)
      return Array.isArray(data) ? data : data?.gigs || []
    },
  })
}

export function useMyGigs() {
  return useQuery({
    queryKey: ["my-gigs"],
    queryFn: async () => {
      const response = await api.get("/gig/my-gigs")
      return normalizeMyGigs(unwrap(response))
    },
  })
}

export function useCreateGig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/gig/create", payload)
      return unwrap(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gig-feed"] })
      queryClient.invalidateQueries({ queryKey: ["my-gigs"] })
    },
  })
}

export function useApplyGig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (gigId) => {
      const response = await api.post(`/gig/apply/${gigId}`)
      return unwrap(response) // returns { gigId, applied: true, roomId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gig-feed"] })
      queryClient.invalidateQueries({ queryKey: ["my-gigs"] })
      // Invalidate connections so the new chatroom shows up immediately
      queryClient.invalidateQueries({ queryKey: ["connections"] })
    },
  })
}