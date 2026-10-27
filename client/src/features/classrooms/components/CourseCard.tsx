import { Avatar } from "antd";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import { getFirstCharOfLastName } from "@/shared/utils/avatar";
import { cn } from "@/shared/utils/cn";
import { useTranslation } from "react-i18next";

interface CourseCardProps {
  data: CourseGroup;
  className?: string;
  currentUserName?: string;
  isTeacher?: boolean;
}

const CARD_COLORS = [
  "#596f7a",
  "#008f83",
  "#3367d6",
  "#ff876b",
  "#7955ba",
  "#4f8b64",
];

function getCourseColor(id: number) {
  return CARD_COLORS[Math.abs(id) % CARD_COLORS.length];
}

export default function CourseCard({
  data,
  className = "",
  currentUserName,
  isTeacher = false,
}: CourseCardProps) {
  const { t } = useTranslation();
  const teacherName =
    data.teacher?.profile.fullName ||
    currentUserName ||
    t("courseElement.people.unknownTeacher");
  const color = getCourseColor(data.id);

  return (
    <Link
      to={`/courses/${data.id}`}
      className={cn(
        "group flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border border-other-outlined-border bg-background-paper shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <header
          className="relative flex min-h-[136px] shrink-0 flex-col overflow-hidden p-5 text-white"
          style={{ backgroundColor: color }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-12 h-40 w-40 rotate-12 rounded-[2rem] border-[18px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 right-16 h-36 w-36 rounded-full bg-black/10"
          />
          <h2 className="relative z-10 line-clamp-2 min-h-14 break-words pr-16 text-xl font-semibold leading-7 group-hover:underline">
            {data.groupName}
          </h2>
          <p className="relative z-10 mt-1 line-clamp-1 pr-16 text-sm text-white/90">
            {isTeacher ? data.subject?.subjectName || teacherName : teacherName}
          </p>
          <div className="absolute -bottom-7 right-5 z-10">
            <Avatar
              src={data.teacher?.profile.avatarUrl || undefined}
              alt={teacherName}
              size={64}
              className="border-2 border-white bg-background-paper text-base text-text-secondary shadow-sm"
            >
              {getFirstCharOfLastName(teacherName)}
            </Avatar>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-5 pt-6">
          {isTeacher ? (
            <p className="truncate text-sm font-medium text-text-primary">
              {data.studentCount != null
                ? t("courseItem.classSize", { count: data.studentCount })
                : t("courseItem.classSizeUnavailable")}
            </p>
          ) : (
            <p className="truncate text-sm font-medium text-text-primary">
              {data.subject?.subjectName || data.subject?.subjectCode || ""}
            </p>
          )}
          <p className="mt-2 text-sm text-text-secondary">
            {t("courseItem.academicInfo", {
              year: data.academicYear,
              semester: data.semester,
            })}
          </p>
          {isTeacher && data.subject?.subjectCode && (
            <p className="mt-1 truncate text-sm text-text-secondary">
              {data.subject.subjectCode}
            </p>
          )}
        </div>
      </div>

      <footer className="flex h-[58px] shrink-0 items-center justify-between border-t border-other-divider px-5 text-text-secondary">
        <span className="inline-flex items-center gap-2 text-xs">
          <CalendarDays size={16} aria-hidden="true" />
          {data.academicYear} ·{" "}
          {t("courseItem.semesterShort", { semester: data.semester })}
        </span>
        <span className="inline-flex items-center gap-1 text-xs">
          <ArrowUpRight
            size={17}
            aria-hidden="true"
            className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </span>
      </footer>
    </Link>
  );
}
