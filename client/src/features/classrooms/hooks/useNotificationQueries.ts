import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { notificationService } from "@/features/classrooms/api/notification.service";
import { notificationQueryKeys } from "@/features/classrooms/queryKeys";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { selectApiData } from "@/shared/query/selectApiData";

export interface UseNotificationsOptions {
  enabled?: boolean;
}

export const useNotificationQueries = (
  options: UseNotificationsOptions = {}
) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useEntityQuery({
    queryKey: notificationQueryKeys.list(userId),
    queryFn: notificationService.getAllNotifications,
    enabled: userId !== null && options.enabled !== false,
    select: selectApiData,
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
