import { useMemo, useState } from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import { AdminHeaderPanel } from "@/shared/components/admin";
import {
  Button,
  PermissionDeniedAlert,
  QueryErrorAlert,
} from "@/shared/components/ui";
import { PermissionGroupIdentityCard } from "@/features/authorization/components/PermissionGroupIdentityCard";
import LegacyPermissionMatrixTable from "@/features/authorization/components/LegacyPermissionMatrixTable";
import { useFunctionCatalog } from "@/features/authorization/hooks/useFunctionCatalog";
import {
  useRole,
  useRoleDetail,
} from "@/features/authorization/hooks/useRoleQueries";
import { useUpdateRole } from "@/features/authorization/hooks/useRoleMutations";
import {
  mapFunctionCatalogToPermissions,
  convertRoleDetailsToPermissions,
  convertPermissionsToRoleDetails,
  permissionSupportsAction,
} from "@/features/authorization/utils/legacyPermissionMatrix";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";
import type { PermissionItem, Role } from "@/shared/types";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { environment } from "@/shared/config/environment";
import { PermissionMatrixV2Page } from "@/features/authorization/pages/PermissionMatrixV2Page";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";

const activeRole = (role: Role) => Number(role.isDeleted) === 0;

function LegacyPermissionMatrixPage() {
  const { t, i18n } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const {
    roles,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: retryRoles,
  } = useRole();
  const availableRoles = useMemo(() => roles.filter(activeRole), [roles]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const roleId = selectedRoleId ?? availableRoles[0]?.id;
  const role = availableRoles.find((item) => item.id === roleId);
  const {
    role: details,
    isLoading: detailsLoading,
    isFetching: detailsFetching,
    isError: detailsError,
    refetch: retryDetails,
  } = useRoleDetail(roleId);
  const {
    functions,
    isLoading: catalogLoading,
    isFetching: catalogFetching,
    isError: catalogError,
    refetch: retryCatalog,
  } = useFunctionCatalog();
  const { updateRoleAsync, isUpdating } = useUpdateRole();
  const isEnglish = (i18n.resolvedLanguage ?? i18n.language).startsWith("en");
  const roleLabel = (item: Role) => {
    const code = getDeclaredSystemRoleCode(item.code);
    return code ? t(`userPage.roles.${code.toLowerCase()}`) : item.roleName;
  };
  const permissions = useMemo(
    () => mapFunctionCatalogToPermissions(functions, isEnglish),
    [functions, isEnglish],
  );
  const [draft, setDraft] = useState<{
    roleId: number;
    permissions: PermissionItem[];
  } | null>(null);
  const activeRoleDetails = details?.id === roleId ? details : undefined;
  const activePermissions =
    roleId === undefined
      ? []
      : draft?.roleId === roleId
        ? draft.permissions
        : convertRoleDetailsToPermissions(
            activeRoleDetails?.roleDetails ?? [],
            permissions,
          );
  const loading =
    rolesLoading ||
    detailsLoading ||
    catalogLoading ||
    (detailsFetching && !activeRoleDetails);
  const loadingError = rolesError || detailsError || catalogError;
  const isAdminRole = getDeclaredSystemRoleCode(role?.code) === "ADMIN";
  const isDirty =
    Boolean(activeRoleDetails && roleId !== undefined) &&
    JSON.stringify(
      activePermissions.map(({ key, actions }) => ({ key, actions })),
    ) !==
      JSON.stringify(
        convertRoleDetailsToPermissions(
          activeRoleDetails?.roleDetails ?? [],
          permissions,
        ).map(({ key, actions }) => ({ key, actions })),
      );

  const updateDraft = (
    updater: (current: PermissionItem[]) => PermissionItem[],
  ) => {
    if (roleId === undefined || isAdminRole) return;
    setDraft({ roleId, permissions: updater(activePermissions) });
  };

  const save = async () => {
    if (roleId === undefined || !isDirty || isAdminRole) return;
    try {
      await updateRoleAsync({
        id: roleId,
        data: {
          roleDetails: convertPermissionsToRoleDetails(activePermissions),
        },
      });
      setDraft(null);
      await retryDetails();
      showToast(
        t("permissionGroupPage.matrix.toast.roleSaveSuccess"),
        "success",
      );
    } catch {
      showToast(t("permissionGroupPage.matrix.toast.roleSaveError"), "error");
    }
  };

  const retry = () => {
    void Promise.all([retryRoles(), retryDetails(), retryCatalog()]);
  };

  return (
    <MainContentLayout width="wide" className="w-full" hasFooter={false}>
      <section className="flex flex-col gap-5">
        <AdminHeaderPanel
          title={t("permissionGroupPage.matrix.title")}
          description={t("permissionGroupPage.matrix.descriptions.roles")}
          actions={
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={() => void save()}
              loading={isUpdating}
              disabled={
                !isDirty ||
                isUpdating ||
                isAdminRole ||
                loading ||
                Boolean(loadingError)
              }
            >
              {t("permissionGroupPage.matrix.saveChanges")}
            </Button>
          }
        >
          <div className="flex flex-col gap-4 rounded-xl border border-other-outlined-border bg-background-paper p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-full flex-col gap-1 text-sm text-text-secondary sm:max-w-md">
              {t("permissionGroupPage.matrix.labels.role")}
              <Select
                showSearch
                optionFilterProp="label"
                size="large"
                value={roleId}
                loading={rolesLoading}
                disabled={rolesLoading || availableRoles.length === 0}
                options={availableRoles.map((item) => ({
                  value: item.id,
                  label: roleLabel(item),
                }))}
                onChange={(value: number) => {
                  setDraft(null);
                  setSelectedRoleId(value);
                }}
              />
            </label>
            {role && <PermissionGroupIdentityCard role={role} />}
          </div>
        </AdminHeaderPanel>

        {loadingError ? (
          <QueryErrorAlert
            message={t("permissionGroupPage.matrix.loadError")}
            onRetry={retry}
            isRetrying={detailsFetching || catalogFetching || rolesLoading}
            retryLabel={t("permissionGroupPage.matrix.retry")}
          />
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-other-outlined-border bg-background-paper p-4 shadow-sm sm:p-5">
            {isAdminRole && (
              <p className="bg-custom-background-primary-background rounded-lg px-3 py-2 text-sm text-primary-main">
                {t("permissionGroupPage.matrix.adminNotice")}
              </p>
            )}
            <LegacyPermissionMatrixTable
              permissions={activePermissions}
              isDisabled={loading || isUpdating || isAdminRole}
              isLoading={loading}
              onToggleColumn={(action, checked) =>
                updateDraft((current) =>
                  current.map((item) => ({
                    ...item,
                    actions: permissionSupportsAction(item, action)
                      ? { ...item.actions, [action]: checked }
                      : item.actions,
                  })),
                )
              }
              onTogglePermission={(key, action, checked) =>
                updateDraft((current) =>
                  current.map((item) =>
                    item.key === key && permissionSupportsAction(item, action)
                      ? {
                          ...item,
                          actions: { ...item.actions, [action]: checked },
                        }
                      : item,
                  ),
                )
              }
            />
            {!availableRoles.length && !loading && (
              <p className="py-8 text-center text-sm text-text-secondary">
                {t("permissionGroupPage.matrix.rolesLoadError")}
              </p>
            )}
          </div>
        )}
      </section>
    </MainContentLayout>
  );
}

export function PermissionMatrixPage() {
  const { t } = useTranslation("common");
  const { user, role } = useAuthStore();
  const canManage = getAuthenticatedUserRoleCode(user, role) === "ADMIN";

  if (!canManage) {
    return (
      <MainContentLayout width="wide" className="w-full" hasFooter={false}>
        <PermissionDeniedAlert
          className="m-6"
          message={t("permissionGroupPage.noManagePermission")}
        />
      </MainContentLayout>
    );
  }

  return environment.features.permissionManagementV2 ? (
    <PermissionMatrixV2Page />
  ) : (
    <LegacyPermissionMatrixPage />
  );
}
