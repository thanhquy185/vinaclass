import { useNotificationMutations } from "@/features/classrooms/hooks/useNotificationMutations";
import { useNotificationQueries } from "@/features/classrooms/hooks/useNotificationQueries";
import type { UseNotificationsOptions } from "@/features/classrooms/hooks/useNotificationQueries";

export * from "@/features/classrooms/hooks/useNotificationMutations";

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const query = useNotificationQueries(options);
  const mutations = useNotificationMutations();
  return {
    ...query,
    ...mutations,
  };
};
