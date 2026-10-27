import { Checkbox, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { PermissionAction, PermissionItem } from "@/shared/types";
import { permissionSupportsAction } from "@/features/authorization/utils/legacyPermissionMatrix";

interface LegacyPermissionMatrixTableProps {
  permissions: PermissionItem[];
  isDisabled: boolean;
  isLoading: boolean;
  scrollY?: number;
  onToggleColumn: (action: PermissionAction, checked: boolean) => void;
  onTogglePermission: (
    permissionKey: string,
    action: PermissionAction,
    checked: boolean,
  ) => void;
}

export default function LegacyPermissionMatrixTable({
  permissions,
  isDisabled,
  isLoading,
  scrollY,
  onToggleColumn,
  onTogglePermission,
}: LegacyPermissionMatrixTableProps) {
  const { t } = useTranslation();
  const permissionColumns = [
    { key: "read", title: t("permissionForm.view") },
    { key: "create", title: t("permissionForm.create") },
    { key: "update", title: t("permissionForm.update") },
    { key: "delete", title: t("permissionForm.delete") },
  ] as const;

  const columns: TableColumnsType<PermissionItem> = [
    {
      title: t("permissionForm.permissionName"),
      key: "functionName",
      render: (_value, permission) =>
        permission.name || t(`permissionNames.${permission.key}`),
      width: "40%",
    },
    ...permissionColumns.map((column) => {
      const applicablePermissions = permissions.filter((permission) =>
        permissionSupportsAction(permission, column.key),
      );
      const checked =
        applicablePermissions.length > 0 &&
        applicablePermissions.every((permission) => permission.actions[column.key]);
      const indeterminate = applicablePermissions.some(
        (permission) => permission.actions[column.key],
      );

      return {
        title: (
          <Checkbox
            checked={checked}
            indeterminate={indeterminate && !checked}
            disabled={
              isDisabled || isLoading || applicablePermissions.length === 0
            }
            onChange={(event) =>
              onToggleColumn(column.key, event.target.checked)
            }
          >
            {column.title}
          </Checkbox>
        ),
        key: column.key,
        align: "center" as const,
        render: (_value: unknown, permission: PermissionItem) =>
          permissionSupportsAction(permission, column.key) ? (
            <Checkbox
              checked={permission.actions[column.key]}
              disabled={isDisabled || isLoading}
              onChange={(event) =>
                onTogglePermission(
                  permission.key,
                  column.key,
                  event.target.checked,
                )
              }
              aria-label={`${permission.name || t(`permissionNames.${permission.key}`)}: ${column.title}`}
            />
          ) : (
            <span className="text-text-disabled" aria-label={t("permissionForm.notSupported")}>
              —
            </span>
          ),
      };
    }),
  ];

  return (
    <Table<PermissionItem>
      rowKey="key"
      size="middle"
      bordered
      pagination={false}
      loading={isLoading}
      columns={columns}
      dataSource={permissions}
      scroll={scrollY ? { x: 620, y: scrollY } : { x: 620 }}
    />
  );
}
