import { useAuthStore } from "@/shared/stores/useAuthStore";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import { hasLegacyFunctionAction } from "@/features/authorization/utils/legacyActions";

const ACTION_CODES = {
  view: "VIEW",
  create: "CREATE",
  update: "UPDATE",
  delete: "DELETE",
  publish: "PUBLISH",
  lock: "LOCK",
  assign: "ASSIGN",
} as const;

export type FunctionAction = keyof typeof ACTION_CODES;

export const useFunctionActions = (functionCode: string) => {
  const role = useAuthStore((state) => state.role);
  const permissionNavigation = usePermissionNavigation();
  const hasAction = (action: FunctionAction): boolean => {
    if (permissionNavigation.isEnabled) {
      return permissionNavigation.hasFunctionAction(
        functionCode,
        ACTION_CODES[action]
      );
    }

    return hasLegacyFunctionAction(
      role?.roleDetails ?? [],
      functionCode,
      action
    );
  };

  return {
    actions: (Object.keys(ACTION_CODES) as FunctionAction[]).filter(hasAction),
    hasAction,
    isPermissionNavigationEnabled: permissionNavigation.isEnabled,
    isLoading: permissionNavigation.isEnabled && permissionNavigation.isLoading,
    isFetching:
      permissionNavigation.isEnabled && permissionNavigation.isFetching,
    isError: permissionNavigation.isEnabled && permissionNavigation.isError,
    refetch: permissionNavigation.refetch,
  };
};
