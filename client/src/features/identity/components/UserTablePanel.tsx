import { KeyRound, Lock, Unlock } from "lucide-react";
import { useTranslation } from "react-i18next";
import DataTable, { type TableColumn } from "@/shared/components/DataTable";
import type { User } from "@/features/identity/types/identity";
import { Button, Icon } from "@/shared/components/ui";
import {
  AdminTablePanel,
  ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS,
  ADMIN_TABLE_ROW_ACTION_ICON_SIZE,
} from "@/shared/components/admin";

interface UserTablePanelProps {
  users: User[];
  filteredUsers: User[];
  columns: TableColumn<User>[];
  actions: string[];
  hasActiveFilters: boolean;
  canCreate: boolean;
  isCreateDisabled: boolean;
  currentUserId: number | null;
  isUpdating: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void | Promise<unknown>;
  onAddUser: () => void;
  onAction: (action: "detail" | "edit" | "remove", user: User) => void;
  onChangePassword: (user: User) => void;
  onToggleLock: (user: User) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export default function UserTablePanel({
  users,
  filteredUsers,
  columns,
  actions,
  hasActiveFilters,
  canCreate,
  isCreateDisabled,
  currentUserId,
  isUpdating,
  isLoading,
  isError,
  onRetry,
  onAddUser,
  onAction,
  onChangePassword,
  onToggleLock,
  pagination,
}: UserTablePanelProps) {
  const { t } = useTranslation("common");

  return (
    <div id="user-table-container">
      <AdminTablePanel
        title={t("userPage.tableTitle")}
        description={t("userPage.tableDescription")}
        createAction={
          canCreate
            ? {
                label: t("userPage.addNew"),
                onClick: onAddUser,
                disabled: isCreateDisabled,
              }
            : undefined
        }
      >
        <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey="id"
          hasColumnActions={
            actions.includes("view") ||
            actions.includes("update") ||
            actions.includes("delete") ||
            actions.includes("lock")
          }
          actionsColumnTitle=""
          actionsColumnFixed="right"
          actionsColumnWidth={208}
          hasView={actions.includes("view")}
          onAction={onAction}
          checkActions={actions}
          renderActions={(user) => (
            <div className="flex justify-center gap-1.5">
              {actions.includes("view") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.detail")}
                  aria-label={t("tableActions.detail")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("detail", user)}
                >
                  <Icon
                    name="eye"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.view}
                  />
                </Button>
              )}
              {actions.includes("update") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.edit")}
                  aria-label={t("tableActions.edit")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("edit", user)}
                >
                  <Icon
                    name="edit"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.edit}
                  />
                </Button>
              )}
              {actions.includes("update") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("userPage.passwordDialog.action")}
                  aria-label={t("userPage.passwordDialog.action")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onChangePassword(user)}
                >
                  <KeyRound size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.status} />
                </Button>
              )}
              {actions.includes("lock") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={
                    !user.isLocked && user.id === currentUserId
                      ? t("userPage.cannotLockSelf")
                      : t(
                          user.isLocked
                            ? "userPage.unlockAction"
                            : "userPage.lockAction"
                        )
                  }
                  aria-label={
                    !user.isLocked && user.id === currentUserId
                      ? t("userPage.cannotLockSelf")
                      : t(
                          user.isLocked
                            ? "userPage.unlockAction"
                            : "userPage.lockAction"
                        )
                  }
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  disabled={
                    isUpdating || (!user.isLocked && user.id === currentUserId)
                  }
                  onClick={() => onToggleLock(user)}
                >
                  {user.isLocked ? (
                    <Unlock size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.status} />
                  ) : (
                    <Lock size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.status} />
                  )}
                </Button>
              )}
              {actions.includes("delete") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.remove")}
                  aria-label={t("tableActions.remove")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("remove", user)}
                >
                  <Icon
                    name="remove"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.remove}
                  />
                </Button>
              )}
            </div>
          )}
          isLoading={isLoading}
          isError={isError && users.length === 0}
          errorMessage={t("userPage.empty.loadFailed")}
          onRetry={() => void onRetry()}
          pagination={pagination}
          className="user-management-table"
          emptyText={
            <div className="px-4 py-6 text-center">
              <p className="font-medium text-text-primary">
                {hasActiveFilters
                  ? t("userPage.empty.filtered")
                  : t("userPage.empty.users")}
              </p>
              {hasActiveFilters && !isError && (
                <p className="text-caption mt-1 text-text-secondary">
                  {t("userPage.empty.adjustFilters")}
                </p>
              )}
            </div>
          }
        />
      </AdminTablePanel>
    </div>
  );
}
