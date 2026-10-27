import { notificationService } from "@/features/classrooms/api/notification.service";
import {
  courseGroupQueryKeys,
  notificationQueryKeys,
} from "@/features/classrooms/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";

export const useNotificationMutations = () => {
  const getNotificationQueryKeys = () => [notificationQueryKeys.root];

  const createMutation = useInvalidatingMutation(
    notificationService.createNotification,
    getNotificationQueryKeys,
    { waitForInvalidation: true }
  );

  const updateMutation = useInvalidatingMutation(
    notificationService.updateNotification,
    getNotificationQueryKeys,
    { waitForInvalidation: true }
  );

  const deleteMutation = useInvalidatingMutation(
    notificationService.deleteNotification,
    getNotificationQueryKeys,
    { waitForInvalidation: true }
  );

  return {
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
  const mutation = useInvalidatingMutation(
    notificationService.createNotification,
    (_, variables) => {
      const courseGroupId = variables.courseGroupIds?.[0];
      return [courseGroupQueryKeys.notifications(courseGroupId)];
    }
  );

  return {
    createNotification: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

export const useDeleteCourseGroupNotification = (courseGroupId?: number) => {
  const mutation = useInvalidatingMutation(
    (notificationId: number) =>
      notificationService.deleteNotificationInGroup(
        notificationId,
        courseGroupId!
      ),
    () => [courseGroupQueryKeys.notifications(courseGroupId)]
  );

  return {
    deleteNotification: mutation.mutate,
    deleteNotificationAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
