import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { NotificationResponse } from "@/features/classrooms/types/classrooms";
import type { TableColumn } from "@/shared/components/DataTable";
import DataTable from "@/shared/components/DataTable";
import {
  AdminTablePanel,
  ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS,
  ADMIN_TABLE_ROW_ACTION_ICON_SIZE,
} from "@/shared/components/admin";
import { Button, Icon, StatusLabel } from "@/shared/components/ui";

type NotificationRowAction = "detail" | "edit" | "remove";

interface NotificationTablePanelProps {
  notifications: NotificationResponse[];
  actions: string[];
  isProcessing: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  canCreate: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRetry: () => void | Promise<unknown>;
  onAdd: () => void;
  onAction: (action: NotificationRowAction, notification: NotificationResponse) => void;
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NotificationTablePanel({
  notifications,
  actions,
  isProcessing,
  isLoading,
  isFetching,
  isError,
  hasActiveFilters,
  canCreate,
  pagination,
  onRetry,
  onAdd,
  onAction,
}: NotificationTablePanelProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const columns = useMemo<TableColumn<NotificationResponse>[]>(
    () => [
      {
        title: t("notificationPage.table.title"),
        key: "title",
        width: 240,
        render: (_value, notification) => (
          <span className="block min-w-0 truncate font-semibold text-text-primary">
            {notification.title}
          </span>
        ),
      },
      {
        title: t("notificationPage.table.content"),
        key: "content",
        width: 320,
        render: (_value, notification) => (
          <span className="line-clamp-2 whitespace-pre-line text-sm text-text-secondary">
            {notification.content}
          </span>
        ),
      },
      {
        title: t("notificationPage.table.status"),
        key: "status",
        width: 130,
        render: (_value, notification) => (
          <StatusLabel variant={notification.status ? "success" : "warning"}>
            {notification.status
              ? t("notificationItem.status.sent")
              : t("notificationItem.status.draft")}
          </StatusLabel>
        ),
      },
      {
        title: t("notificationPage.table.classes"),
        key: "courseGroups",
        width: 240,
        render: (_value, notification) => {
          const classNames = Array.from(
            new Set(
              (notification.courseGroups ?? [])
                .map((group) => group.groupName)
                .filter((name): name is string => Boolean(name)),
            ),
          );
          const visibleNames = classNames.slice(0, 2);
          const extraCount = classNames.length - visibleNames.length;

          return (
            <span
              className="block min-w-0 truncate text-text-secondary"
              title={classNames.join(", ")}
            >
              {classNames.length > 0
                ? `${visibleNames.join(", ")}${extraCount > 0 ? ` +${extraCount}` : ""}`
                : t("notificationItem.unknownCourseGroup")}
            </span>
          );
        },
      },
      {
        title: t("notificationPage.table.sender"),
        key: "senderId",
        width: 180,
        render: (_value, notification) =>
          notification.sender?.profile.fullName ??
          t("notificationItem.unknownSender"),
      },
      {
        title: t("notificationPage.table.createdAt"),
        key: "sentAt",
        width: 190,
        render: (_value, notification) =>
          formatDate(notification.sentAt, locale),
      },
    ],
    [locale, t],
  );

  return (
    <AdminTablePanel
      title={
        <div className="flex flex-wrap items-center gap-3">
          {t("notificationPage.listTitle")}
          <span className="rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main">
            {t("notificationPage.resultCount", {
              count: notifications.length,
            })}
          </span>
        </div>
      }
      description={t("notificationPage.listDescription")}
      createAction={
        canCreate
          ? {
              label: t("notificationPage.addNew"),
              onClick: onAdd,
              disabled: isProcessing,
            }
          : undefined
      }
    >
      <DataTable
        columns={columns}
        data={notifications}
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
        errorMessage={t("notificationPage.loadError")}
        onRetry={onRetry}
        pagination={pagination}
        className="user-management-table"
        emptyText={
          <div className="px-4 py-6 text-center">
            <p className="font-medium text-text-primary">
              {t(
                hasActiveFilters
                  ? "notificationPage.emptyFiltered"
                  : "notificationPage.empty",
              )}
            </p>
            {hasActiveFilters && (
              <p className="text-caption mt-1 text-text-secondary">
                {t("notificationPage.emptyAdjustFilters")}
              </p>
            )}
          </div>
        }
        renderActions={(notification) => (
          <div className="flex justify-center gap-1.5">
            {actions.includes("view") && (
              <Button
                isButtonIcon
                size="medium"
                tooltip={t("tableActions.detail")}
                aria-label={t("tableActions.detail")}
                className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                disabled={isProcessing}
                onClick={() => onAction("detail", notification)}
              >
                <Icon name="eye" size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.view} />
              </Button>
            )}
            {actions.includes("update") && (
              <Button
                isButtonIcon
                size="medium"
                tooltip={t("tableActions.edit")}
                aria-label={t("tableActions.edit")}
                className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                disabled={isProcessing}
                onClick={() => onAction("edit", notification)}
              >
                <Icon name="edit" size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.edit} />
              </Button>
            )}
            {actions.includes("delete") && (
              <Button
                isButtonIcon
                size="medium"
                tooltip={t("tableActions.remove")}
                aria-label={t("tableActions.remove")}
                className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                disabled={isProcessing}
                onClick={() => onAction("remove", notification)}
              >
                <Icon
                  name="remove"
                  size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.remove}
                />
              </Button>
            )}
          </div>
        )}
      />
    </AdminTablePanel>
  );
}
