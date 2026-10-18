import { Button, Icon } from "@/components/atomic/atoms";
import type { NotificationResponse } from "@/types";
import { formatDateTimeVN } from "@/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface INotificationItemProps {
  data: NotificationResponse;
  recipients?: { group: string; count: number }[];
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
}: INotificationItemProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col rounded-md bg-background-body-background">
      {/* header */}
      <div className="flex items-center justify-between border-b border-other-outlined-border px-10 py-2">
        <span
          className={`text-caption rounded-md border p-1 ${
            data.status
              ? "border-alert-success-content text-alert-success-content"
              : "border-text-disabled text-text-disabled"
          }`}
        >
          {data.status
            ? t("notificationItem.status.open")
            : t("notificationItem.status.closed")}
        </span>

        <div className="flex gap-2">
          <Button color={"primary"} onClick={() => onView?.(data.id)}>
            {t("notificationItem.actions.view")}
          </Button>
          {actions.includes("update") && (
            <Button color={"primary"} onClick={() => onEdit?.(data.id)}>
              {t("notificationItem.actions.edit")}
            </Button>
          )}
          {actions.includes("delete") && (
            <Button color={"primary"} onClick={() => onDelete?.(data.id)}>
              {t("notificationItem.actions.delete")}
            </Button>
          )}
        </div>
      </div>

      {/* Nội dung cơ bản */}
      <div className="flex flex-col gap-2 px-8 py-4">
        <div className="text-h6 font-bold text-text-secondary">
          {data.title}
        </div>
        <div className="flex-bet-center mb-2 rounded-sm border border-other-outlined-border p-3">
          <Link to="#">
            <span className="text-body-1 text-text-secondary">
              {data.content}
            </span>
          </Link>
        </div>

        {/* Thông tin chi tiết (Info) */}
        <div className="flex flex-col gap-2 text-text-secondary">
          <div className="flex items-center gap-1">
            <Icon name="documentDuplicate" size={20} />
            <span className="text-body-1">
              {t("notificationItem.assignedTo")}
            </span>
            <span className="text-body-1-semibold text">
              {" "}
              {data?.courseGroups?.[0]?.subject?.subjectName ?? ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="clock" size={20} />
            <span className="text-body-1">
              {t("notificationItem.createdAt", {
                date: formatDateTimeVN(data.sentAt),
              })}
              {" • "}
              {t("notificationItem.sender", { name: data.sender.fullName })}
              <span className="text-body-1 font-medium">{""}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
