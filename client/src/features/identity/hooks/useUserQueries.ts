import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { userService } from "@/features/identity/api/user.service";
import { userQueryKeys } from "@/features/identity/queryKeys";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { selectApiData } from "@/shared/query/selectApiData";

export const useUser = (enabled = true) => {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: userQueryKeys.list(userId),
    queryFn: userService.getAllUsers,
    enabled,
    select: selectApiData,
  });

  return {
    users: enabled ? query.data || [] : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useAssignableUserRoles = (enabled = true) => {
  const query = useEntityQuery({
    queryKey: userQueryKeys.roles,
    queryFn: userService.getAssignableRoles,
    enabled,
    select: selectApiData,
  });

  return {
    roles: enabled ? query.data || [] : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useTeachers = (enabled = true) => {
  const query = useEntityQuery({
    queryKey: userQueryKeys.teachers,
    queryFn: userService.getTeachers,
    enabled,
    select: selectApiData,
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
