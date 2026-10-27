import { Tag } from "antd";
import {
  BookOpenCheck,
  Eye,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NotificationResponse } from "@/features/classrooms/types/classrooms";
import { AdminPanel } from "@/shared/components/admin";
import { Button, StatusLabel } from "@/shared/components/ui";
import { formatDateTimeVN } from "@/shared/utils";

export interface NotificationItemProps {
  data: NotificationResponse;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  actions: string[];
}

export default function NotificationItem({
  data,
  onView,
  onEdit,
  onDelete,
  actions,
}: NotificationItemProps) {
  const { t } = useTranslation("common");
  const courseGroupNames = Array.from(
    new Set(
      (data.courseGroups ?? [])
        .map((group) => group.groupName)
        .filter((name): name is string => Boolean(name)),
    ),
  );
  const visibleCourseGroupNames = courseGroupNames.slice(0, 3);

  return (
    <AdminPanel as="article" className="overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusLabel variant={data.status ? "success" : "warning"}>
                {data.status
                  ? t("notificationItem.status.sent")
                  : t("notificationItem.status.draft")}
              </StatusLabel>
              <span className="text-caption text-text-disabled">
                {t("notificationItem.createdAt", {
                  date: formatDateTimeVN(data.sentAt),
                })}
              </span>
            </div>
            <h3 className="break-words text-base font-semibold text-text-primary sm:text-lg">
              {data.title}
            </h3>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
            {actions.includes("view") && (
              <Button
                variant="outline"
                color="standard"
                size="small"
                className="!rounded-lg"
                onClick={() => onView?.(data.id)}
              >
                <Eye size={16} aria-hidden="true" />
                {t("notificationItem.actions.view")}
              </Button>
            )}
            {actions.includes("update") && (
              <Button
                variant="text"
                color="standard"
                size="small"
                className="!rounded-lg"
                onClick={() => onEdit?.(data.id)}
              >
                <Pencil size={16} aria-hidden="true" />
                {t("notificationItem.actions.edit")}
              </Button>
            )}
            {actions.includes("delete") && (
              <Button
                variant="text"
                color="error"
                size="small"
                className="!rounded-lg"
                onClick={() => onDelete?.(data.id)}
              >
                <Trash2 size={16} aria-hidden="true" />
                {t("notificationItem.actions.delete")}
              </Button>
            )}
          </div>
        </div>

        <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary">
          {data.content}
        </p>

        <div className="flex flex-col gap-3 border-t border-other-divider pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <BookOpenCheck size={15} aria-hidden="true" />
              {t("notificationItem.assignedTo")}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleCourseGroupNames.length > 0 ? (
                <>
                  {visibleCourseGroupNames.map((groupName) => (
                    <Tag
                      key={groupName}
                      className="!m-0 max-w-56 !truncate !rounded-full !border-0 !bg-background-body-background !px-2.5 !py-0.5 !text-xs !text-text-secondary"
                      title={groupName}
                    >
                      {groupName}
                    </Tag>
                  ))}
                  {courseGroupNames.length > visibleCourseGroupNames.length && (
                    <Tag className="!m-0 !rounded-full !border-0 !bg-background-body-background !px-2.5 !py-0.5 !text-xs !text-text-secondary">
                      +{courseGroupNames.length - visibleCourseGroupNames.length}
                    </Tag>
                  )}
                </>
              ) : (
                <Tag className="!m-0 !rounded-full !border-0 !bg-background-body-background !px-2.5 !py-0.5 !text-xs !text-text-secondary">
                  {t("notificationItem.unknownCourseGroup")}
                </Tag>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary sm:justify-end">
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={15} aria-hidden="true" />
              {t("notificationItem.sender", {
                name:
                  data.sender?.profile.fullName ??
                  t("notificationItem.unknownSender"),
              })}
            </span>
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}
