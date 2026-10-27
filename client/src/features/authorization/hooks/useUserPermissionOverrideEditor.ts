import { useMemo, useState } from "react";
import { authorizationService } from "@/features/authorization/api/authorization.service";
import { authorizationQueryKeys } from "@/features/authorization/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import {
  arePermissionOverridesEqual,
  getSortedPermissionOverrides,
  getUserPermissionOverrides,
  toPermissionOverrideValues,
} from "@/features/authorization/utils/permissionMatrix";
import type { UserPermissionOverrideMatrix } from "@/shared/types";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useTranslation } from "react-i18next";

interface UserPermissionDraft {
  userId: number;
  overrides: Record<number, "GRANT" | "DENY">;
}

interface UseUserPermissionOverrideEditorOptions {
  activeUserId: number | null;
  overrideMatrix?: UserPermissionOverrideMatrix;
}

export const useUserPermissionOverrideEditor = ({
  activeUserId,
  overrideMatrix,
}: UseUserPermissionOverrideEditorOptions) => {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const [userDraft, setUserDraft] = useState<UserPermissionDraft | null>(null);
  const translationPrefix = "permissionGroupPage.matrix";

  const savedOverrides = useMemo(
    () => getUserPermissionOverrides(overrideMatrix),
    [overrideMatrix]
  );
  const savedOverrideValues = useMemo(
    () => toPermissionOverrideValues(savedOverrides),
    [savedOverrides]
  );
  const selectedOverrides =
    userDraft?.userId === activeUserId
      ? userDraft.overrides
      : savedOverrideValues;
  const currentOverrides = getSortedPermissionOverrides(selectedOverrides);
  const areOverridesDirty =
    Boolean(overrideMatrix) &&
    !arePermissionOverridesEqual(savedOverrides, currentOverrides);

  const syncOverridesMutation = useInvalidatingMutation(
    (variables: {
      userId: number;
      overrides: { permissionId: number; effect: "GRANT" | "DENY" }[];
    }) =>
      authorizationService.syncUserPermissionOverrides(
        variables.userId,
        variables.overrides
      ),
    (_response, variables) => [
      authorizationQueryKeys.userOverrides.byUser(variables.userId),
    ],
    {
      onSuccess: (_response, variables) => {
        setUserDraft((current) =>
          current?.userId === variables.userId ? null : current
        );
        showToast(
          t(`${translationPrefix}.toast.overrideSaveSuccess`),
          "success"
        );
      },
      onError: () =>
        showToast(t(`${translationPrefix}.toast.overrideSaveError`), "error"),
    }
  );

  const handleOverrideChange = (
    permissionId: number,
    effect: "" | "GRANT" | "DENY"
  ) => {
    if (activeUserId === null || !overrideMatrix) return;

    setUserDraft((current) => {
      const next = {
        ...(current?.userId === activeUserId
          ? current.overrides
          : savedOverrideValues),
      };
      if (effect) next[permissionId] = effect;
      else delete next[permissionId];
      return { userId: activeUserId, overrides: next };
    });
  };

  const saveUserChanges = () => {
    if (activeUserId === null || !overrideMatrix) return;
    syncOverridesMutation.mutate({
      userId: activeUserId,
      overrides: currentOverrides,
    });
  };

  return {
    selectedOverrides,
    areOverridesDirty,
    isSavingUser: syncOverridesMutation.isPending,
    handleOverrideChange,
    saveUserChanges,
    clearUserDraft: () => setUserDraft(null),
  };
};
