import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { roleService } from "@/features/authorization/api/role.service";
import { authorizationQueryKeys } from "@/features/authorization/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import type { RoleNameSortDirection } from "@/shared/types";

export const useRole = (
  enabled = true,
  sortDirection?: RoleNameSortDirection,
) => {
  const query = useEntityQuery({
    queryKey: authorizationQueryKeys.roles.list(sortDirection ?? null),
    queryFn: () => roleService.getAll(sortDirection),
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

export const useRoleDetail = (id: number | undefined) => {
  const query = useEntityQuery({
    queryKey: authorizationQueryKeys.roles.detail(id),
    queryFn: () => roleService.getById(id!),
    enabled: !!id,
    select: selectApiData,
    placeholderData: (previousData) => previousData,
  });

  return {
    role: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
