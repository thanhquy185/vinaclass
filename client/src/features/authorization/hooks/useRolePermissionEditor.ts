import { useMemo, useState } from "react";
import { authorizationService } from "@/features/authorization/api/authorization.service";
import { authorizationQueryKeys } from "@/features/authorization/queryKeys";
import { sessionQueryKeys } from "@/shared/queryKeys/session";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import {
  getRolePermissionIds,
  arePermissionIdsEqual,
} from "@/features/authorization/utils/permissionMatrix";
import type { RolePermissionMatrix } from "@/shared/types";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useTranslation } from "react-i18next";

interface RolePermissionDraft {
  roleId: number;
  permissionIds: number[];
}

interface UseRolePermissionEditorOptions {
  activeRoleId: number | null;
  matrix?: RolePermissionMatrix;
}

export const useRolePermissionEditor = ({
  activeRoleId,
  matrix,
}: UseRolePermissionEditorOptions) => {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const [roleDraft, setRoleDraft] = useState<RolePermissionDraft | null>(null);
  const translationPrefix = "permissionGroupPage.matrix";

  const savedPermissionIds = useMemo(
    () => getRolePermissionIds(matrix),
    [matrix]
  );
  const selectedPermissionIds =
    roleDraft?.roleId === activeRoleId
      ? roleDraft.permissionIds
      : savedPermissionIds;
  const isDirty =
    Boolean(matrix) &&
    !arePermissionIdsEqual(savedPermissionIds, selectedPermissionIds);

  const syncRoleMutation = useInvalidatingMutation(
    (variables: { roleId: number; permissionIds: number[] }) =>
      authorizationService.syncRolePermissions(
        variables.roleId,
        variables.permissionIds
      ),
    (_response, variables) => [
      authorizationQueryKeys.roleMatrix.byRole(variables.roleId),
      sessionQueryKeys.currentUser,
    ],
    {
      onSuccess: (_response, variables) => {
        setRoleDraft((current) =>
          current?.roleId === variables.roleId ? null : current
        );
        showToast(t(`${translationPrefix}.toast.roleSaveSuccess`), "success");
      },
      onError: () =>
        showToast(t(`${translationPrefix}.toast.roleSaveError`), "error"),
    }
  );

  const togglePermission = (permissionId: number) => {
    if (activeRoleId === null || !matrix) return;

    setRoleDraft((current) => {
      const selected =
        current?.roleId === activeRoleId
          ? current.permissionIds
          : savedPermissionIds;
      const permissionIds = selected.includes(permissionId)
        ? selected.filter((id) => id !== permissionId)
        : [...selected, permissionId];

      return { roleId: activeRoleId, permissionIds };
    });
  };

  const toggleFeature = (permissionIds: number[], shouldGrant: boolean) => {
    if (activeRoleId === null || !matrix) return;

    setRoleDraft((current) => {
      const selected =
        current?.roleId === activeRoleId
          ? current.permissionIds
          : savedPermissionIds;
      const next = new Set(selected);
      permissionIds.forEach((permissionId) => {
        if (shouldGrant) next.add(permissionId);
        else next.delete(permissionId);
      });
      return { roleId: activeRoleId, permissionIds: [...next] };
    });
  };

  const saveRoleChanges = () => {
    if (activeRoleId === null || !matrix) return;
    syncRoleMutation.mutate({
      roleId: activeRoleId,
      permissionIds: selectedPermissionIds,
    });
  };

  return {
    selectedPermissionIds,
    isDirty,
    isSavingRole: syncRoleMutation.isPending,
    togglePermission,
    toggleFeature,
    saveRoleChanges,
    clearRoleDraft: () => setRoleDraft(null),
  };
};
