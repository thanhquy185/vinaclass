import { useMemo } from "react";
import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { authorizationService } from "@/features/authorization/api/authorization.service";
import { sessionQueryKeys } from "@/shared/queryKeys/session";
import { flattenPermissionNavigation } from "@/features/authorization/utils/navigationTree";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { environment } from "@/shared/config/environment";
import { selectApiData } from "@/shared/query/selectApiData";

export const usePermissionNavigation = (options?: { enabled?: boolean }) => {
  const isPermissionNavigationEnabled =
    environment.features.permissionNavigation;
  const isQueryEnabled = options?.enabled !== false;
  const userId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: sessionQueryKeys.navigation(userId),
    queryFn: authorizationService.getMyNavigation,
    enabled: isPermissionNavigationEnabled && isQueryEnabled && Boolean(userId),
    staleTime: 30_000,
    select: selectApiData,
  });
  const navigationNodes = useMemo(
    () => flattenPermissionNavigation(query.data?.items ?? []),
    [query.data]
  );

  const hasAction = (
    matchesNode: (node: (typeof navigationNodes)[number]) => boolean,
    actionCode: string
  ) =>
    navigationNodes.some(
      (node) => matchesNode(node) && node.actionCodes.includes(actionCode)
    );

  return {
    navigation: query.data,
    isEnabled: isPermissionNavigationEnabled && isQueryEnabled,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    hasRouteAction: (routeKey: string, actionCode: string) =>
      hasAction((node) => node.routeKey === routeKey, actionCode),
    hasFunctionAction: (functionCode: string, actionCode: string) =>
      hasAction(
        (node) =>
          node.functionName === functionCode || node.code === functionCode,
        actionCode
      ),
  };
};
