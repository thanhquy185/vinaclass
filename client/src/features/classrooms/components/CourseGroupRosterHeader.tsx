import {
  CalendarDays,
  ContactRound,
  Download,
  GraduationCap,
  KeyRound,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface CourseGroupRosterHeaderProps {
  classTitle: string;
  subjectName: string;
  teacherName: string;
  academicYear: number | string;
  semester: number | string;
  studentCount: number;
  isExporting: boolean;
  canManageInvite: boolean;
  onExport: () => void;
  onManageInvite: () => void;
}

export default function CourseGroupRosterHeader({
  classTitle,
  subjectName,
  teacherName,
  academicYear,
  semester,
  studentCount,
  isExporting,
  canManageInvite,
  onExport,
  onManageInvite,
}: CourseGroupRosterHeaderProps) {
  const { t, i18n } = useTranslation("common");
  const stats = [
    {
      label: t("courseGroupStudent.summary.students"),
      value: studentCount.toLocaleString(i18n.language),
      accent: "bg-alert-success-content",
      icon: <UsersRound size={19} />,
    },
    {
      label: t("courseGroupStudent.summary.teacher"),
      value: teacherName,
      accent: "bg-alert-info-content",
      icon: <GraduationCap size={19} />,
    },
    {
      label: t("courseGroupStudent.summary.academicTerm"),
      value: t("courseGroupStudent.academicInfo", {
        year: academicYear,
        semester,
      }),
      accent: "bg-primary-main",
      icon: <CalendarDays size={19} />,
    },
  ];

  return (
    <header className="overflow-hidden rounded-2xl border border-other-outlined-border bg-background-paper shadow-sm">
      <div className="bg-custom-background-primary-background relative flex flex-col gap-5 overflow-hidden border-b border-other-divider px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div
          aria-hidden="true"
          className="border-primary-main/5 pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[24px]"
        />
        <div className="relative flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-main text-primary-contrast shadow-sm">
            <ContactRound size={23} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-heading-5 mt-1 break-words font-bold text-text-primary">
              {t("courseGroupStudent.pageTitle")}
            </h1>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {classTitle}
            </p>
            <p className="text-caption mt-0.5 text-text-secondary">
              {subjectName}
            </p>
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2 lg:shrink-0">
          <Button
            variant="outline"
            size="medium"
            className="!h-11 !rounded-lg px-3.5"
            onClick={onExport}
            disabled={isExporting}
            loading={isExporting}
          >
            {!isExporting && <Download size={17} aria-hidden="true" />}
            {t("courseGroupStudent.exportList")}
          </Button>
          {canManageInvite && (
            <Button
              variant="outline"
              size="medium"
              className="!h-11 !rounded-lg px-3.5"
              onClick={onManageInvite}
            >
              <KeyRound size={17} aria-hidden="true" />
              {t("courseGroupStudent.manageInvite")}
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-px bg-other-divider sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 items-center gap-3 bg-background-paper px-5 py-4"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${stat.accent}`}
              aria-hidden="true"
            >
              {stat.icon}
            </span>
            <div className="min-w-0">
              <p className="text-caption font-medium text-text-secondary">
                {stat.label}
              </p>
              <p className="truncate text-sm font-semibold text-text-primary">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
