import { useRolePermissionEditor } from "@/features/authorization/hooks/useRolePermissionEditor";
import { useUserPermissionOverrideEditor } from "@/features/authorization/hooks/useUserPermissionOverrideEditor";
import type { PermissionMatrixTab } from "@/features/authorization/types/permissionMatrix";
import type {
  RolePermissionMatrix,
  UserPermissionOverrideMatrix,
} from "@/shared/types";

interface UsePermissionMatrixEditorOptions {
  activeTab: PermissionMatrixTab;
  activeRoleId: number | null;
  activeUserId: number | null;
  matrix?: RolePermissionMatrix;
  overrideMatrix?: UserPermissionOverrideMatrix;
}

export const usePermissionMatrixEditor = ({
  activeTab,
  activeRoleId,
  activeUserId,
  matrix,
  overrideMatrix,
}: UsePermissionMatrixEditorOptions) => {
  const roleEditor = useRolePermissionEditor({ activeRoleId, matrix });
  const userEditor = useUserPermissionOverrideEditor({
    activeUserId,
    overrideMatrix,
  });

  const saveChanges = () => {
    if (activeTab === "roles") {
      roleEditor.saveRoleChanges();
      return;
    }
    userEditor.saveUserChanges();
  };

  return {
    selectedPermissionIds: roleEditor.selectedPermissionIds,
    selectedOverrides: userEditor.selectedOverrides,
    isDirty: roleEditor.isDirty,
    areOverridesDirty: userEditor.areOverridesDirty,
    isSaving: roleEditor.isSavingRole || userEditor.isSavingUser,
    isSavingRole: roleEditor.isSavingRole,
    isSavingUser: userEditor.isSavingUser,
    togglePermission: roleEditor.togglePermission,
    toggleFeature: roleEditor.toggleFeature,
    handleOverrideChange: userEditor.handleOverrideChange,
    saveChanges,
    clearRoleDraft: roleEditor.clearRoleDraft,
    clearUserDraft: userEditor.clearUserDraft,
  };
};
