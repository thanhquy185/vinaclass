import { useMemo, useState } from "react";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { useRole } from "@/features/authorization/hooks/useRoleQueries";
import { usePermissionMatrixQueries } from "@/features/authorization/hooks/usePermissionMatrixQueries";
import { usePermissionMatrixEditor } from "@/features/authorization/hooks/usePermissionMatrixEditor";
import type { PermissionMatrixFunction } from "@/shared/types";
import {
  getDeclaredSystemRoleCode,
  getUserSystemRoleCode,
} from "@/shared/utils/role";
import { useTranslation } from "react-i18next";
import { sortPermissionActionCodes } from "@/features/authorization/utils/permissionMatrix";
import { PermissionMatrixToolbar } from "@/features/authorization/components/PermissionMatrixToolbar";
import { PermissionMatrixContent } from "@/features/authorization/components/PermissionMatrixContent";
import type { PermissionMatrixTab } from "@/features/authorization/types/permissionMatrix";

const isActiveRole = (isDeleted: number) => Number(isDeleted) === 0;

export const PermissionMatrixV2Page = () => {
  const { i18n } = useTranslation("common");
  const isEnglish = (i18n.resolvedLanguage ?? i18n.language).startsWith("en");
  const {
    roles,
    isLoading: isLoadingRoles,
    isFetching: isFetchingRoles,
    isError: isRolesError,
    refetch: refetchRoles,
  } = useRole();
  const availableRoles = useMemo(
    () => roles.filter((role) => isActiveRole(role.isDeleted)),
    [roles],
  );
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<PermissionMatrixTab>("roles");
  const activeRoleId = selectedRoleId ?? availableRoles[0]?.id ?? null;
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const {
    activeUserId,
    availableUsers,
    matrix,
    matrixQuery,
    overrideMatrix,
    overrideQuery,
    usersQuery,
  } = usePermissionMatrixQueries({
    activeTab,
    activeRoleId,
    selectedUserId,
    roles,
  });

  const isAdminRole =
    getDeclaredSystemRoleCode(
      availableRoles.find((role) => role.id === activeRoleId)?.code,
    ) === "ADMIN";
  const activeFunctions =
    activeTab === "roles" ? matrix?.functions : overrideMatrix?.functions;
  const activeIsAdmin =
    activeTab === "roles"
      ? isAdminRole
      : getUserSystemRoleCode(
          availableUsers.find((user) => user.id === activeUserId) ?? {
            roleId: null,
            roleCode: null,
          },
          roles,
        ) === "ADMIN";
  const activeQuery = activeTab === "roles" ? matrixQuery : overrideQuery;
  const actionCodes = useMemo(
    () => sortPermissionActionCodes(activeFunctions),
    [activeFunctions],
  );

  const {
    selectedPermissionIds,
    selectedOverrides,
    isDirty,
    areOverridesDirty,
    isSaving,
    isSavingRole,
    isSavingUser,
    togglePermission,
    toggleFeature,
    handleOverrideChange,
    saveChanges,
    clearRoleDraft,
    clearUserDraft,
  } = usePermissionMatrixEditor({
    activeTab,
    activeRoleId,
    activeUserId,
    matrix,
    overrideMatrix,
  });

  const functionLabel = (feature: PermissionMatrixFunction) =>
    (isEnglish ? feature.nameEn : feature.nameVi) ??
    (isEnglish ? feature.nameVi : feature.nameEn) ??
    feature.code;
  const permissionLabel = (
    permission: PermissionMatrixFunction["permissions"][number],
  ) => (isEnglish ? permission.nameEn : permission.nameVi);
  const isSaveDisabled =
    !activeFunctions ||
    activeQuery.isFetching ||
    (activeTab === "roles" ? !matrix : !overrideMatrix) ||
    Boolean(activeIsAdmin) ||
    (activeTab === "roles"
      ? !isDirty || isSavingRole
      : !areOverridesDirty || isSavingUser);

  return (
    <MainContentLayout>
      <section className="flex flex-col gap-5 rounded-md bg-background-body-background p-5">
        <PermissionMatrixToolbar
          activeTab={activeTab}
          roles={availableRoles}
          users={availableUsers}
          activeRoleId={activeRoleId}
          activeUserId={activeUserId}
          isLoadingRoles={isLoadingRoles}
          isLoadingUsers={usersQuery.isLoading}
          isSaving={isSaving}
          isSaveDisabled={Boolean(isSaveDisabled)}
          onTabChange={setActiveTab}
          onRoleChange={(nextRoleId) => {
            setSelectedRoleId(nextRoleId);
            clearRoleDraft();
          }}
          onUserChange={(nextUserId) => {
            setSelectedUserId(nextUserId);
            clearUserDraft();
          }}
          onSave={saveChanges}
        />
        <PermissionMatrixContent
          activeTab={activeTab}
          functions={activeFunctions}
          isAdminRole={isAdminRole}
          activeIsAdmin={Boolean(activeIsAdmin)}
          actionCodes={actionCodes}
          selectedPermissionIds={selectedPermissionIds}
          selectedOverrides={selectedOverrides}
          functionLabel={functionLabel}
          permissionLabel={permissionLabel}
          onTogglePermission={togglePermission}
          onToggleFeature={toggleFeature}
          onChangeOverride={handleOverrideChange}
          isRolesError={isRolesError}
          onRetryRoles={refetchRoles}
          isRetryingRoles={isFetchingRoles}
          isActiveError={activeQuery.isError}
          onRetryActive={activeQuery.refetch}
          isRetryingActive={activeQuery.isFetching}
          isUsersError={usersQuery.isError}
          onRetryUsers={usersQuery.refetch}
          isRetryingUsers={usersQuery.isFetching}
          showNoEligibleUsers={
            !usersQuery.isLoading &&
            !usersQuery.isError &&
            availableUsers.length === 0
          }
          isLoading={
            activeQuery.isLoading ||
            (activeTab === "users" && usersQuery.isLoading)
          }
        />
      </section>
    </MainContentLayout>
  );
};
