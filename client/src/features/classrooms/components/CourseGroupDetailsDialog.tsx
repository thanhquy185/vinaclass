import { BookOpenCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { GroupDisplay } from "@/features/classrooms/types/courseGroupList";
import {
  AdminFormSection,
  AdminReadOnlyField,
} from "@/shared/components/admin";
import { AppDialog, Button, IdentityAvatar } from "@/shared/components/ui";

interface CourseGroupDetailsDialogProps {
  group: GroupDisplay;
  open: boolean;
  onClose: () => void;
}

export function CourseGroupDetailsDialog({
  group,
  open,
  onClose,
}: CourseGroupDetailsDialogProps) {
  const { t } = useTranslation("common");
  const teacher = group.teacher;
  const teacherName =
    teacher?.profile.fullName ||
    teacher?.username ||
    t("courseGroup.teacherUnavailable");
  const subjectName =
    group.subject?.subjectName || t("courseGroup.subjectUnavailable");
  const subjectLabel = group.subject?.subjectCode
    ? `${group.subject.subjectCode} · ${subjectName}`
    : subjectName;
  const studentCount =
    group.studentCount == null
      ? t("courseGroup.details.studentCountUnavailable")
      : t("courseItem.classSize", {
          count: group.studentCount,
        });

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={t("courseGroup.details.title")}
      description={t("courseGroup.details.description", {
        groupName: group.groupName,
        subjectName: subjectLabel,
      })}
      icon={<BookOpenCheck size={20} />}
      tone="primary"
      width="min(880px, calc(100vw - 32px))"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" size="medium" onClick={onClose}>
            {t("courseGroup.details.close")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 px-5 py-5 sm:px-6">
        <AdminFormSection title={t("courseGroup.details.classInfo")}>
          <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminReadOnlyField
              className="md:col-span-2"
              label={t("courseGroup.form.groupName")}
              value={group.groupName}
            />
            <AdminReadOnlyField
              className="md:col-span-2"
              label={t("courseGroup.form.note")}
              value={group.notes?.trim() || "—"}
              valueClassName="whitespace-pre-wrap"
            />
            <AdminReadOnlyField
              label={t("courseGroup.details.students")}
              value={studentCount}
            />
            <AdminReadOnlyField
              label={t("courseGroup.details.status")}
              value={t(
                group.status === "hidden"
                  ? "courseGroup.status.hidden"
                  : "courseGroup.status.active"
              )}
            />
          </dl>
        </AdminFormSection>

        <AdminFormSection title={t("courseGroup.form.courseTermSection")}>
          <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AdminReadOnlyField
              label={t("courseGroup.details.teacher")}
              value={
                <div className="flex min-w-0 items-center gap-2.5">
                  <IdentityAvatar
                    name={teacherName}
                    avatarUrl={teacher?.profile.avatarUrl}
                    size="small"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {teacher
                        ? teacherName
                        : t("courseGroup.teacherUnavailable")}
                    </p>
                    <p className="truncate text-xs font-normal text-text-secondary">
                      {teacher?.email ||
                        teacher?.username ||
                        t("courseGroup.teacherUnassigned")}
                    </p>
                  </div>
                </div>
              }
              valueClassName="flex items-center"
            />
            <AdminReadOnlyField
              label={t("courseGroup.details.subject")}
              value={subjectLabel}
            />
            <AdminReadOnlyField
              label={t("courseGroup.form.academicYear")}
              value={group.academicYear}
            />
            <AdminReadOnlyField
              label={t("courseGroup.form.semester")}
              value={group.semester}
            />
          </dl>
        </AdminFormSection>
      </div>
    </AppDialog>
  );
}
