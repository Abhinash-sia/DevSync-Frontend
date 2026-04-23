import { useQuery } from "@tanstack/react-query"
import { api, unwrap } from "../lib/axios"

export function useDirectory(filters = {}) {
  return useQuery({
    queryKey: ["directory", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.append("dateTo", filters.dateTo)
      
      const response = await api.get(`/profile/directory/all?${params.toString()}`)
      return unwrap(response)
    },
  })
}
