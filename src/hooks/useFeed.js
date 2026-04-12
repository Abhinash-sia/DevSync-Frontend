import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/axios";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const response = await api.get("/match/feed?page=1&limit=10");
      const data = unwrap(response);
      return Array.isArray(data) ? data : data?.users || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, action }) => {
      // action must be "interested" or "ignored" (backend enum)
      const mappedAction = action === "like" ? "interested" : "ignored";
      const response = await api.post(`/match/swipe/${targetUserId}`, {
        action: mappedAction,
      });
      return unwrap(response);
    },
    onSuccess: () => {
      // Optimistic removal handled by FeedPage component
    },
  });
}

