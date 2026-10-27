import { Alert, Empty, Spin } from "antd";
import { useTranslation } from "react-i18next";
import type {
  PermissionMatrixFunction,
  PermissionMatrixItem,
} from "@/shared/types";
import { PermissionMatrixTable } from "@/features/authorization/components/PermissionMatrixTable";
import type { PermissionMatrixTab } from "@/features/authorization/types/permissionMatrix";
import { QueryErrorAlert } from "@/shared/components/ui";

interface PermissionMatrixContentProps {
  activeTab: PermissionMatrixTab;
  functions?: PermissionMatrixFunction[];
  isAdminRole: boolean;
  activeIsAdmin: boolean;
  actionCodes: string[];
  selectedPermissionIds: number[];
  selectedOverrides: Record<number, "GRANT" | "DENY">;
  functionLabel: (feature: PermissionMatrixFunction) => string;
  permissionLabel: (permission: PermissionMatrixItem) => string;
  onTogglePermission: (permissionId: number) => void;
  onToggleFeature: (permissionIds: number[], shouldGrant: boolean) => void;
  onChangeOverride: (
    permissionId: number,
    effect: "" | "GRANT" | "DENY",
  ) => void;
  isRolesError: boolean;
  onRetryRoles: () => void | Promise<unknown>;
  isRetryingRoles: boolean;
  isActiveError: boolean;
  onRetryActive: () => void | Promise<unknown>;
  isRetryingActive: boolean;
  isUsersError: boolean;
  onRetryUsers: () => void | Promise<unknown>;
  isRetryingUsers: boolean;
  showNoEligibleUsers: boolean;
  isLoading: boolean;
}

export function PermissionMatrixContent({
  activeTab,
  functions,
  isAdminRole,
  activeIsAdmin,
  actionCodes,
  selectedPermissionIds,
  selectedOverrides,
  functionLabel,
  permissionLabel,
  onTogglePermission,
  onToggleFeature,
  onChangeOverride,
  isRolesError,
  onRetryRoles,
  isRetryingRoles,
  isActiveError,
  onRetryActive,
  isRetryingActive,
  isUsersError,
  onRetryUsers,
  isRetryingUsers,
  showNoEligibleUsers,
  isLoading,
}: PermissionMatrixContentProps) {
  const { t } = useTranslation("common");
  const translationPrefix = "permissionGroupPage.matrix";

  return (
    <>
      {!(activeTab === "roles" && activeIsAdmin) && (
        <Alert
          type="info"
          showIcon
          message={t(`${translationPrefix}.help.${activeTab}.title`)}
          description={t(`${translationPrefix}.help.${activeTab}.description`)}
        />
      )}

      {activeIsAdmin && (
        <Alert
          type="info"
          showIcon
          message={t(`${translationPrefix}.adminNotice`)}
        />
      )}

      {isRolesError && (
        <QueryErrorAlert
          message={t(`${translationPrefix}.rolesLoadError`)}
          retryLabel={t(`${translationPrefix}.retry`)}
          onRetry={onRetryRoles}
          isRetrying={isRetryingRoles}
        />
      )}
      {isActiveError && (
        <QueryErrorAlert
          message={t(`${translationPrefix}.loadError`)}
          retryLabel={t(`${translationPrefix}.retry`)}
          onRetry={onRetryActive}
          isRetrying={isRetryingActive}
        />
      )}
      {activeTab === "users" && isUsersError && (
        <QueryErrorAlert
          message={t(`${translationPrefix}.userLoadError`)}
          retryLabel={t(`${translationPrefix}.retry`)}
          onRetry={onRetryUsers}
          isRetrying={isRetryingUsers}
        />
      )}
      {activeTab === "users" && showNoEligibleUsers && (
        <Empty description={t(`${translationPrefix}.noEligibleUsers`)} />
      )}
      {!isActiveError &&
        !(activeTab === "users" && isUsersError) &&
        functions && (
          <Spin spinning={isLoading} tip={t(`${translationPrefix}.loading`)}>
            {functions.length > 0 ? (
              <PermissionMatrixTable
                functions={functions}
                activeTab={activeTab}
                isAdminRole={isAdminRole}
                activeIsAdmin={activeIsAdmin}
                actionCodes={actionCodes}
                selectedPermissionIds={selectedPermissionIds}
                selectedOverrides={selectedOverrides}
                functionLabel={functionLabel}
                permissionLabel={permissionLabel}
                onTogglePermission={onTogglePermission}
                onToggleFeature={onToggleFeature}
                onChangeOverride={onChangeOverride}
              />
            ) : (
              <Empty description={t(`${translationPrefix}.noFunctions`)} />
            )}
          </Spin>
        )}
    </>
  );
}
