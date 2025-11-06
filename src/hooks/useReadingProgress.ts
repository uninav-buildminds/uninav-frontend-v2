import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  saveReadingProgress,
  getReadingProgress,
  deleteReadingProgress,
  ReadingProgressData,
  ReadingProgress,
} from "@/api/materials.api";
import { toast } from "sonner";

interface UseReadingProgressOptions {
  materialId: string;
  enabled?: boolean;
  autoSaveInterval?: number; // Debounce interval in milliseconds (default: 15000ms = 15s)
  onSaveSuccess?: (progress: ReadingProgress) => void;
  onSaveError?: (error: any) => void;
}

export function useReadingProgress({
  materialId,
  enabled = true,
  autoSaveInterval = 15000,
  onSaveSuccess,
  onSaveError,
}: UseReadingProgressOptions) {
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingProgressRef = useRef<ReadingProgressData | null>(null);
  const isMountedRef = useRef(true);

  // Fetch current reading progress
  const {
    data: progressResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reading-progress", materialId],
    queryFn: () => getReadingProgress(materialId),
    enabled: enabled && !!materialId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
  });

  const progress = progressResponse?.data;

  // Save reading progress mutation
  const saveMutation = useMutation({
    mutationFn: (progressData: ReadingProgressData) =>
      saveReadingProgress(materialId, progressData),
    onSuccess: (response) => {
      // Update cache optimistically
      queryClient.setQueryData(
        ["reading-progress", materialId],
        response
      );
      onSaveSuccess?.(response.data);
    },
    onError: (error: any) => {
      console.error("Failed to save reading progress:", error);
      onSaveError?.(error);
      // Don't show toast for auto-save failures to avoid annoying users
      // toast.error("Failed to save reading progress");
    },
  });

  // Delete reading progress mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteReadingProgress(materialId),
    onSuccess: () => {
      queryClient.setQueryData(
        ["reading-progress", materialId],
        { data: null }
      );
      queryClient.invalidateQueries({ queryKey: ["continue-reading"] });
      toast.success("Reading progress reset");
    },
    onError: (error: any) => {
      console.error("Failed to reset reading progress:", error);
      toast.error(error.message || "Failed to reset reading progress");
    },
  });

  // Debounced save function
  const debouncedSave = useCallback(
    (progressData: ReadingProgressData) => {
      if (!enabled || !materialId) return;

      // Store the latest progress data
      pendingProgressRef.current = progressData;

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        if (pendingProgressRef.current && isMountedRef.current) {
          saveMutation.mutate(pendingProgressRef.current);
          pendingProgressRef.current = null;
        }
      }, autoSaveInterval);
    },
    [materialId, enabled, autoSaveInterval, saveMutation]
  );

  // Immediate save function (no debounce)
  const saveImmediately = useCallback(
    (progressData: ReadingProgressData) => {
      if (!enabled || !materialId) return;

      // Clear pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      pendingProgressRef.current = null;
      saveMutation.mutate(progressData);
    },
    [materialId, enabled, saveMutation]
  );

  // Reset progress
  const resetProgress = useCallback(() => {
    if (!enabled || !materialId) return;

    // Clear pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingProgressRef.current = null;

    deleteMutation.mutate();
  }, [materialId, enabled, deleteMutation]);

  // Cleanup on unmount or when materialId changes
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Save any pending progress before unmounting
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        if (pendingProgressRef.current) {
          // Fire and forget - don't wait for response
          saveReadingProgress(materialId, pendingProgressRef.current).catch(
            (err) => console.error("Failed to save progress on unmount:", err)
          );
        }
      }
    };
  }, [materialId]);

  // Reset mounted ref when component re-mounts
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  return {
    progress,
    isLoading,
    error,
    saveProgress: debouncedSave,
    saveImmediately,
    resetProgress,
    isSaving: saveMutation.isPending,
    isResetting: deleteMutation.isPending,
    refetch,
  };
}

// Hook for fetching continue reading materials
export function useContinueReading(limit: number = 10, offset: number = 0) {
  const { getContinueReadingMaterials } = require("@/api/materials.api");

  return useQuery({
    queryKey: ["continue-reading", limit, offset],
    queryFn: () => getContinueReadingMaterials(limit, offset),
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Hook for fetching reading stats
export function useReadingStats() {
  const { getReadingStats } = require("@/api/materials.api");

  return useQuery({
    queryKey: ["reading-stats"],
    queryFn: getReadingStats,
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
