import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { usePermissionGroupActions } from "@/features/authorization/hooks/usePermissionGroupActions";
import { useRole } from "@/features/authorization/hooks/useRoleQueries";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import type {
  PermissionGroupKind,
  PermissionGroupSearchCriterion,
} from "@/features/authorization/utils/permissionGroupList";
import { filterPermissionGroups } from "@/features/authorization/utils/permissionGroupList";
import { useTablePagination } from "@/shared/hooks/useTablePagination";
import type { RoleNameSortDirection } from "@/shared/types";

const PAGE_SIZE = 10;

export function usePermissionGroupPageController() {
  const { t } = useTranslation("common");
  const {
    actions: availableActions,
    hasAction,
    isLoading: isPermissionLoading,
    isFetching: isPermissionFetching,
    isError: isPermissionError,
    refetch: refetchPermissions,
  } = useFunctionActions("nhom_quyen");
  const { user, role } = useAuthStore();
  const canView = hasAction("view");
  const canManage = getAuthenticatedUserRoleCode(user, role) === "ADMIN";
  const actions = canManage
    ? availableActions
    : availableActions.filter((action) => action === "view");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] =
    useState<PermissionGroupSearchCriterion>("name");
  const [kind, setKind] = useState<PermissionGroupKind>("all");
  const [sortDirection, setSortDirection] =
    useState<RoleNameSortDirection | null>(null);
  const {
    roles,
    isLoading,
    isFetching,
    isError,
    refetch: refetchRoles,
  } = useRole(canView && !isPermissionLoading, sortDirection ?? undefined);
  const filteredRoles = useMemo(
    () => filterPermissionGroups({ roles, searchTerm, searchBy, kind }),
    [roles, searchTerm, searchBy, kind],
  );
  const hasActiveFilters = searchTerm.trim().length > 0 || kind !== "all";
  const paginationState = useTablePagination(filteredRoles.length, PAGE_SIZE);
  const {
    modalState,
    isProcessing,
    isSaving,
    isDeleting,
    closeModal,
    createRole,
    handleAction,
    openCreateModal,
    removeRole,
    updateRole,
  } = usePermissionGroupActions();

  useEffect(() => {
    paginationState.setCurrentPage(1);
  }, [
    kind,
    searchBy,
    searchTerm,
    sortDirection,
    paginationState.setCurrentPage,
  ]);

  const selectedRole = roles.find((role) => role.id === modalState.id) ?? null;
  const filteredSummary = `${filteredRoles.length.toLocaleString()} ${t("permissionGroupPage.memberUnit")}`;

  return {
    t,
    roles,
    filteredRoles,
    filteredSummary,
    actions,
    canView,
    canManage,
    isPermissionLoading,
    isPermissionFetching,
    isPermissionError,
    isLoading,
    isFetching,
    isError,
    refetchPermissions,
    refetchRoles,
    searchTerm,
    searchBy,
    setSearchTerm,
    setSearchBy,
    kind,
    setKind,
    sortDirection,
    setSortDirection,
    hasActiveFilters,
    modalState,
    selectedRole,
    isProcessing,
    isSaving,
    isDeleting,
    closeModal,
    createRole,
    handleAction,
    openCreateModal,
    removeRole,
    updateRole,
    pagination: paginationState.pagination,
  };
}
