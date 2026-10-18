import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification.service";

export const useNotifications = () => {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getAllNotifications,
    select: (res) => res.data,
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: notificationService.createNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const updateMutation = useMutation({
    mutationFn: notificationService.updateNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    createNotification: createMutation.mutateAsync,
    updateNotification: updateMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};

export const useCreateCourseGroupNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: notificationService.createNotification,

    onSuccess: (_, variables) => {
      const courseGroupId = variables.courseGroupIds?.[0];
      queryClient.invalidateQueries({
        queryKey: ["course-groups", "notifications", courseGroupId],
      });
    },
  });

  return {
    createNotification: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

//xóa trong nhóm
export const useDeleteCourseGroupNotification = (courseGroupId?: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: notificationService.deleteNotificationInGroup,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-groups", "notifications", courseGroupId],
      });
    },
  });

  return {
    deleteNotification: mutation.mutate,
    deleteNotificationAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
