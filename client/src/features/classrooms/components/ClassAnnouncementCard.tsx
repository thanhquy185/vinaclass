import { Button, Icon } from "@/shared/components/ui";
import {
  Dropdown,
  DropdownItem,
} from "@/shared/components/ui/Dropdown/Dropdown";
import type { Notification } from "@/features/classrooms/types/classrooms";
import { useTranslation } from "react-i18next";

interface ClassAnnouncementCardProps {
  data: Notification;
  canDelete: boolean;
  onDelete: (notification: Notification) => void;
}

export default function ClassAnnouncementCard({
  data,
  canDelete,
  onDelete,
}: ClassAnnouncementCardProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const authorName =
    data.sender?.profile.fullName ||
    t("courseElement.announcement.defaultAuthor");
  const firstLetter = authorName.trim().split(" ").pop()?.charAt(0) ?? "";

  return (
    <div className="overflow-hidden rounded-md border border-other-outlined-border bg-background-body-background shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-primary-contrast">
              {firstLetter}
            </div>
            <div>
              <h3 className="text-body-2 font-bold text-text-primary">
                {authorName}
              </h3>
              <p className="text-caption text-text-secondary">
                {new Date(data.sentAt).toLocaleString(locale, {
                  day: "numeric",
                  month: "short",
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </p>
            </div>
          </div>
          {canDelete && (
            <Dropdown
              align="right"
              trigger={
                <Button size="small" isButtonIcon>
                  <Icon name="moreVertical" />
                </Button>
              }
            >
              <DropdownItem onClick={() => onDelete(data)}>
                {t("courseElement.announcement.delete")}
              </DropdownItem>
            </Dropdown>
          )}
        </div>
        <div className="text-body-2 mt-4 px-1 text-text-secondary">
          <p className="mb-1 font-bold text-text-primary">{data.title}</p>
          <p className="whitespace-pre-line">{data.content}</p>
        </div>
      </div>
    </div>
  );
}
