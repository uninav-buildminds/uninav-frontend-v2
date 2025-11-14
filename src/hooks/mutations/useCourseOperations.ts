import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCourse, unlinkCourseToDepartment } from "@/api/course.api";
import { queryKeys } from "../queries/queryKeys";
import { Course } from "@/lib/types/course.types";
import { toast } from "sonner";

/**
 * Delete Course Mutation with Optimistic Update
 * Removes course instantly from UI before server confirms
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await deleteCourse(courseId);
      return courseId;
    },

    // Optimistic update - removes course instantly
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.courses.all });

      // Snapshot previous values for rollback
      const previousCourses = queryClient.getQueryData(
        queryKeys.courses.lists()
      );
      const previousPaginated = queryClient.getQueriesData({
        queryKey: queryKeys.courses.all,
      });

      // Optimistically remove from all course lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.courses.lists() },
        (old: any) => {
          if (Array.isArray(old)) {
            return old.filter((course: Course) => course.id !== deletedId);
          }
          return old;
        }
      );

      // Remove from paginated results
      queryClient.setQueriesData(
        { queryKey: queryKeys.courses.all },
        (old: any) => {
          if (old?.data?.data) {
            return {
              ...old,
              data: {
                ...old.data,
                data: old.data.data.filter(
                  (course: Course) => course.id !== deletedId
                ),
              },
            };
          }
          return old;
        }
      );

      return { previousCourses, previousPaginated };
    },

    // If mutation fails, rollback
    onError: (err, deletedId, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(
          queryKeys.courses.lists(),
          context.previousCourses
        );
      }
      toast.error("Failed to delete course. Please try again.");
    },

    // Success notification
    onSuccess: () => {
      toast.success("Course deleted successfully");
    },

    // Always refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

/**
 * Unlink DLC (Department-Level-Course) Mutation with Optimistic Update
 * Removes link instantly from UI before server confirms
 */
export const useUnlinkDLC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      departmentId,
      courseId,
    }: {
      departmentId: string;
      courseId: string;
    }) => {
      await unlinkCourseToDepartment(departmentId, courseId);
      return { departmentId, courseId };
    },

    // Optimistic update - removes link instantly
    onMutate: async ({ departmentId, courseId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
      await queryClient.cancelQueries({ queryKey: queryKeys.dlc.all });

      // Snapshot previous values
      const previousCourse = queryClient.getQueryData(
        queryKeys.courses.detail(courseId)
      );
      const previousDLC = queryClient.getQueryData(queryKeys.dlc.all);

      // Optimistically update course details (remove department from departments array)
      queryClient.setQueryData(
        queryKeys.courses.detail(courseId),
        (old: any) => {
          if (old?.data) {
            return {
              ...old,
              data: {
                ...old.data,
                departments: old.data.departments?.filter(
                  (dept: any) => dept.departmentId !== departmentId
                ),
              },
            };
          }
          return old;
        }
      );

      // Optimistically update DLC list
      queryClient.setQueriesData(
        { queryKey: queryKeys.dlc.all },
        (old: any) => {
          if (old?.data?.data) {
            return {
              ...old,
              data: {
                ...old.data,
                data: old.data.data.filter(
                  (dlc: any) =>
                    !(
                      dlc.departmentId === departmentId &&
                      dlc.courseId === courseId
                    )
                ),
              },
            };
          }
          return old;
        }
      );

      return { previousCourse, previousDLC };
    },

    // If mutation fails, rollback
    onError: (err, variables, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(
          queryKeys.courses.detail(variables.courseId),
          context.previousCourse
        );
      }
      if (context?.previousDLC) {
        queryClient.setQueryData(queryKeys.dlc.all, context.previousDLC);
      }
      toast.error("Failed to unlink department. Please try again.");
    },

    // Success notification
    onSuccess: () => {
      toast.success("Department unlinked successfully");
    },

    // Always refetch after error or success
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.courses.detail(data.courseId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.dlc.all });
    },
  });
};
