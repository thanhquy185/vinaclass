import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PermissionGroupAction } from "@/features/authorization/hooks/usePermissionGroupActions";
import type { TableColumn } from "@/shared/components/DataTable";
import DataTable from "@/shared/components/DataTable";
import {
  AdminTablePanel,
  ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS,
  ADMIN_TABLE_ROW_ACTION_ICON_SIZE,
} from "@/shared/components/admin";
import { Button, Icon } from "@/shared/components/ui";
import type { Role } from "@/shared/types";
import { formatPermissionGroupCode } from "@/features/authorization/utils/permissionGroupList";
import { getDeclaredSystemRoleCode } from "@/shared/utils/role";

interface PermissionGroupTableProps {
  roles: Role[];
  actions: string[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRetry: () => void | Promise<unknown>;
  onAdd: () => void;
  onAction: (action: PermissionGroupAction, role: Role) => void;
}

const formatCreatedAt = (value: string, locale: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export function PermissionGroupTable({
  roles,
  actions,
  isLoading,
  isFetching,
  isError,
  pagination,
  onRetry,
  onAdd,
  onAction,
}: PermissionGroupTableProps) {
  const { t, i18n } = useTranslation("common");
  const roleLabel = (role: Role) => {
    const code = getDeclaredSystemRoleCode(role.code);
    return code ? t(`userPage.roles.${code.toLowerCase()}`) : role.roleName;
  };
  const columns = useMemo<TableColumn<Role>[]>(
    () => [
      {
        title: t("permissionGroupPage.table.group"),
        key: "roleName",
        width: 300,
        render: (_value, role) => (
          <span className="block min-w-0 truncate font-semibold text-text-primary">
            {roleLabel(role)}
          </span>
        ),
      },
      {
        title: t("permissionGroupPage.table.groupCode"),
        key: "code",
        width: 160,
        render: (_value, role) => (
          <span className="font-mono text-sm text-text-secondary">
            {formatPermissionGroupCode(role)}
          </span>
        ),
      },
      {
        title: t("permissionGroupPage.table.kind"),
        key: "code",
        width: 150,
        render: (_value, role) => (
          <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
              getDeclaredSystemRoleCode(role.code)
                ? "bg-custom-background-primary-background text-primary-main"
                : "bg-custom-background-success-background text-alert-success-content"
            }`}
          >
            {t(
              getDeclaredSystemRoleCode(role.code)
                ? "permissionGroupPage.kind.system"
                : "permissionGroupPage.kind.custom",
            )}
          </span>
        ),
      },
      {
        title: t("permissionGroupPage.table.userCount"),
        key: "totalUsers",
        width: 150,
        render: (_value, role) => (
          <span className="inline-flex rounded-full bg-action-hover px-2.5 py-1 text-sm font-medium text-text-primary">
            {(role.totalUsers ?? 0).toLocaleString(i18n.language)}
          </span>
        ),
      },
      {
        title: t("permissionGroupPage.table.createdAt"),
        key: "createdAt",
        width: 170,
        render: (_value, role) =>
          formatCreatedAt(
            role.createdAt,
            i18n.resolvedLanguage ?? i18n.language,
          ),
      },
    ],
    [i18n.language, i18n.resolvedLanguage, t],
  );

  return (
    <AdminTablePanel
      title={t("permissionGroupPage.tableTitle")}
      description={t("permissionGroupPage.tableDescription")}
      createAction={
        actions.includes("create")
          ? { label: t("permissionGroupPage.addNew"), onClick: onAdd }
          : undefined
      }
    >
      <DataTable
        columns={columns}
        data={roles}
        rowKey="id"
        hasColumnActions={
          actions.includes("view") ||
          actions.includes("update") ||
          actions.includes("delete")
        }
        actionsColumnTitle=""
        actionsColumnFixed="right"
        actionsColumnWidth={144}
        checkActions={actions}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={t("permissionGroupPage.loadFailed")}
        onRetry={onRetry}
        pagination={pagination}
        className="user-management-table"
        emptyText={t("permissionGroupPage.empty")}
        renderActions={(role) => {
          const systemCode = getDeclaredSystemRoleCode(role.code);
          const cannotDelete =
            Boolean(systemCode) || (role.totalUsers ?? 0) > 0;
          const deleteTooltip = systemCode
            ? t("permissionGroupPage.cannotDeleteSystem")
            : (role.totalUsers ?? 0) > 0
              ? t("permissionGroupPage.cannotDeleteInUse")
              : t("tableActions.remove");

          return (
            <div className="flex justify-center gap-1.5">
              {actions.includes("view") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.detail")}
                  aria-label={t("tableActions.detail")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("detail", role)}
                >
                  <Icon
                    name="eye"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.view}
                  />
                </Button>
              )}
              {actions.includes("update") && !systemCode && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.edit")}
                  aria-label={t("tableActions.edit")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("edit", role)}
                >
                  <Icon
                    name="edit"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.edit}
                  />
                </Button>
              )}
              {actions.includes("delete") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={deleteTooltip}
                  aria-label={deleteTooltip}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  disabled={cannotDelete}
                  onClick={() => onAction("remove", role)}
                >
                  <Icon
                    name="remove"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.remove}
                  />
                </Button>
              )}
            </div>
          );
        }}
      />
    </AdminTablePanel>
  );
}
