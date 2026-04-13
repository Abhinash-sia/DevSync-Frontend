import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api, unwrap } from "../lib/axios"

export function useGigComments(gigId) {
  return useQuery({
    queryKey: ["gig-comments", gigId],
    queryFn: async () => {
      const response = await api.get(`/gig/${gigId}/comments`)
      return unwrap(response) ?? []
    },
    enabled: !!gigId,
    staleTime: 1000 * 30,
  })
}

export function usePostComment(gigId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (text) => {
      const response = await api.post(`/gig/${gigId}/comment`, { text })
      return unwrap(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gig-comments", gigId] })
    },
  })
}

export function useDmCommenter(gigId) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (commenterId) => {
      const response = await api.post(`/gig/${gigId}/dm/${commenterId}`)
      return unwrap(response)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["connections"] })
      if (data?.roomId) {
        navigate(`/app/chat/${data.roomId}`)
      }
    },
  })
}
