import { useQuery } from "@tanstack/react-query";
import {
  getManagementStats,
  getReviewCounts,
  ManagementStats,
  ReviewCounts,
} from "@/api/management.api";

export function useManagementStats() {
  return useQuery({
    queryKey: ["management-stats"],
    queryFn: getManagementStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

export function useReviewCounts() {
  return useQuery({
    queryKey: ["review-counts"],
    queryFn: getReviewCounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}
