import { useMemo } from "react";
import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { authorizationService } from "@/features/authorization/api/authorization.service";
import { authorizationQueryKeys } from "@/features/authorization/queryKeys";
import { userService } from "@/features/identity/api/user.service";
import { userQueryKeys } from "@/features/identity/queryKeys";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type { Role } from "@/shared/types";
import { getUserSystemRoleCode } from "@/shared/utils/role";
import type { PermissionMatrixTab } from "@/features/authorization/types/permissionMatrix";
import { selectApiData } from "@/shared/query/selectApiData";

interface UsePermissionMatrixQueriesOptions {
  activeTab: PermissionMatrixTab;
  activeRoleId: number | null;
  selectedUserId: number | null;
  roles: Role[];
}

export const usePermissionMatrixQueries = ({
  activeTab,
  activeRoleId,
  selectedUserId,
  roles,
}: UsePermissionMatrixQueriesOptions) => {
  const currentUserId = useAuthStore((state) => state.user?.id);

  const matrixQuery = useEntityQuery({
    queryKey: authorizationQueryKeys.roleMatrix.byRole(activeRoleId),
    queryFn: () => authorizationService.getRoleMatrix(activeRoleId as number),
    enabled: activeTab === "roles" && activeRoleId !== null,
    select: selectApiData,
  });
  const matrix =
    matrixQuery.data?.role.id === activeRoleId ? matrixQuery.data : undefined;

  const usersQuery = useEntityQuery({
    queryKey: userQueryKeys.list(currentUserId),
    queryFn: userService.getAllUsers,
    enabled: activeTab === "users",
    select: selectApiData,
  });
  const availableUsers = useMemo(
    () =>
      (usersQuery.data ?? []).filter((user) => {
        if (user.isDeleted || user.roleId === null) return false;
        const assignedRole = roles.find((role) => role.id === user.roleId);
        if (!assignedRole || Number(assignedRole.isDeleted) !== 0) return false;
        return getUserSystemRoleCode(user, roles) !== "ADMIN";
      }),
    [roles, usersQuery.data]
  );
  const activeUserId = selectedUserId ?? availableUsers[0]?.id ?? null;

  const overrideQuery = useEntityQuery({
    queryKey: authorizationQueryKeys.userOverrides.byUser(activeUserId),
    queryFn: () =>
      authorizationService.getUserPermissionOverrides(activeUserId as number),
    enabled: activeTab === "users" && activeUserId !== null,
    select: selectApiData,
  });
  const overrideMatrix =
    overrideQuery.data?.user.id === activeUserId
      ? overrideQuery.data
      : undefined;

  return {
    activeUserId,
    availableUsers,
    matrix,
    matrixQuery,
    overrideMatrix,
    overrideQuery,
    usersQuery,
  };
};
