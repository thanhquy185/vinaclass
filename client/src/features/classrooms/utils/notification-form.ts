import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import type { NotificationSubjectGroup } from "@/features/classrooms/types/notificationForm";

export function toNotificationSubjectGroups(
  courseGroups: CourseGroup[]
): NotificationSubjectGroup[] {
  if (!Array.isArray(courseGroups)) return [];

  const subjects = new Map<number, NotificationSubjectGroup>();

  courseGroups.forEach((group) => {
    const subjectId = group.subject?.id ?? group.subjectId;
    const subject = subjects.get(subjectId) ?? {
      subjectId,
      subjectName: group.subject?.subjectName ?? `#${subjectId}`,
      groups: [],
    };

    subject.groups.push({ id: group.id, label: group.groupName });
    subjects.set(subjectId, subject);
  });

  return Array.from(subjects.values());
}
