import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMaterial } from "@/api/materials.api";
import { queryKeys } from "../queries/queryKeys";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";

/**
 * Delete Material Mutation with Optimistic Update
 * Removes material instantly from UI before server confirms
 */
export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      const response = await deleteMaterial(materialId);
      return materialId;
    },

    // Optimistic update - removes material instantly
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.materials.all });

      // Snapshot previous values for rollback
      const previousMaterials = queryClient.getQueriesData({
        queryKey: queryKeys.materials.all,
      });

      // Optimistically remove from all material lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.materials.lists() },
        (old: any) => {
          if (Array.isArray(old)) {
            return old.filter(
              (material: Material) => material.id !== deletedId
            );
          }
          return old;
        }
      );

      // Remove from recent materials
      queryClient.setQueryData(queryKeys.materials.recent(), (old: any) => {
        if (old?.data?.items) {
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.filter(
                (material: Material) => material.id !== deletedId
              ),
            },
          };
        }
        return old;
      });

      // Remove from recommendations
      queryClient.setQueryData(
        queryKeys.materials.recommendations(),
        (old: any) => {
          if (old?.data?.items) {
            return {
              ...old,
              data: {
                ...old.data,
                items: old.data.items.filter(
                  (material: Material) => material.id !== deletedId
                ),
              },
            };
          }
          return old;
        }
      );

      // Remove from user uploads
      queryClient.setQueriesData(
        { queryKey: queryKeys.materials.all },
        (old: any) => {
          if (old?.data?.items) {
            return {
              ...old,
              data: {
                ...old.data,
                items: old.data.items.filter(
                  (material: Material) => material.id !== deletedId
                ),
              },
            };
          }
          if (old?.data?.data) {
            return {
              ...old,
              data: {
                ...old.data,
                data: old.data.data.filter(
                  (material: Material) => material.id !== deletedId
                ),
              },
            };
          }
          return old;
        }
      );

      return { previousMaterials };
    },

    // If mutation fails, rollback
    onError: (err, deletedId, context) => {
      if (context?.previousMaterials) {
        context.previousMaterials.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to delete material. Please try again.");
    },

    // Success notification
    onSuccess: () => {
      toast.success("Material deleted successfully");
    },

    // Always refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }); // Materials might be bookmarked
    },
  });
};
