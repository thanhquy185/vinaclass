import type { NotificationResponse } from "@/features/classrooms/types/classrooms";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

export type NotificationStatusFilter = 1 | 2 | 3;
export type NotificationSearchCriterion =
  | "all"
  | "title"
  | "content"
  | "class"
  | "sender";

interface FilterNotificationsOptions {
  notifications: NotificationResponse[];
  searchTerm: string;
  searchBy: NotificationSearchCriterion;
  statusFilter: NotificationStatusFilter;
  newestFirst: boolean;
}

export function filterNotifications({
  notifications,
  searchTerm,
  searchBy,
  statusFilter,
  newestFirst,
}: FilterNotificationsOptions): NotificationResponse[] {
  const keyword = normalizeSearchText(searchTerm.trim());

  return notifications
    .filter((notification) => {
      if (statusFilter === 2 && !notification.status) return false;
      if (statusFilter === 3 && notification.status) return false;
      if (!keyword) return true;

      const classNames = (notification.courseGroups ?? [])
        .map((group) => group.groupName)
        .join(" ");
      const subjectNames = (notification.courseGroups ?? [])
        .map((group) => group.subject?.subjectName ?? "")
        .join(" ");
      const searchableFields: Record<NotificationSearchCriterion, string[]> = {
        all: [
          notification.title,
          notification.content,
          notification.sender?.profile.fullName ?? "",
          classNames,
          subjectNames,
        ],
        title: [notification.title],
        content: [notification.content],
        class: [classNames, subjectNames],
        sender: [notification.sender?.profile.fullName ?? ""],
      };
      const searchableText = searchableFields[searchBy]
        .filter(Boolean)
        .map((value) => normalizeSearchText(value))
        .join(" ");

      return searchableText.includes(keyword);
    })
    .sort((first, second) => {
      const firstSentAt = new Date(first.sentAt).getTime();
      const secondSentAt = new Date(second.sentAt).getTime();
      const firstTimestamp = Number.isFinite(firstSentAt) ? firstSentAt : 0;
      const secondTimestamp = Number.isFinite(secondSentAt) ? secondSentAt : 0;

      return newestFirst
        ? secondTimestamp - firstTimestamp
        : firstTimestamp - secondTimestamp;
    });
}
