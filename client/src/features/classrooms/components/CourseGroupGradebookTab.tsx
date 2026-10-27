import { Empty, Tag } from "antd";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Copy,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import type { StudentExam } from "@/shared/types";
import { getTestsStatus } from "@/features/assessments/utils/exam";

interface CourseGroupGradebookTabProps {
  courseGroupId: number;
  joinCode?: string;
  studentCount: number;
  exams: StudentExam[];
  now: Date;
  canCreateExam: boolean;
  onCreateExam: () => void;
  onCopyJoinCode: () => void;
}

export default function CourseGroupGradebookTab({
  courseGroupId,
  joinCode,
  studentCount,
  exams,
  now,
  canCreateExam,
  onCreateExam,
  onCopyJoinCode,
}: CourseGroupGradebookTabProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi-VN" : "en-US";
  const closedCount = exams.filter(
    (exam) =>
      getTestsStatus(exam.startTime, exam.endTime, now).status === "CLOSED"
  ).length;

  return (
    <section className="mt-8 w-full space-y-5 duration-300 animate-in fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-[0.12em] text-[#5f6368] dark:text-text-secondary">
            {t("courseElement.grades.eyebrow")}
          </p>
          <h2 className="text-2xl font-normal text-[#202124] dark:text-text-primary">
            {t("courseElement.tabs.grades")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#5f6368] dark:text-text-secondary">
            {t("courseElement.grades.description")}
          </p>
        </div>
        {canCreateExam && exams.length === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={onCreateExam}
            className="rounded-full !px-5"
          >
            <ClipboardList size={18} aria-hidden="true" />
            {t("courseElement.classwork.createAssignment")}
          </Button>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<ClipboardList size={19} aria-hidden="true" />}
          label={t("courseElement.grades.tests")}
          value={exams.length}
          accent="blue"
        />
        <SummaryCard
          icon={<UsersRound size={19} aria-hidden="true" />}
          label={t("courseElement.grades.students")}
          value={studentCount}
          accent="orange"
        />
        <SummaryCard
          icon={<CalendarDays size={19} aria-hidden="true" />}
          label={t("courseElement.grades.closedTests")}
          value={closedCount}
          accent="green"
        />
      </div>

      {studentCount === 0 && (
        <div className="dark:border-primary-main/30 dark:bg-primary-background/20 flex flex-col gap-4 rounded-2xl border border-[#d2e3fc] bg-[#f8fbff] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1a73e8] shadow-sm dark:bg-background-paper">
              <UsersRound size={19} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-medium text-[#202124] dark:text-text-primary">
                {t("courseElement.grades.noStudentsTitle")}
              </h3>
              <p className="mt-1 text-sm text-[#5f6368] dark:text-text-secondary">
                {t("courseElement.grades.noStudentsDescription")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            color="primary"
            onClick={onCopyJoinCode}
            disabled={!joinCode}
            className="shrink-0 rounded-full"
          >
            <Copy size={16} aria-hidden="true" />
            {t("courseElement.news.copyClassCode")}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#dadce0] bg-white dark:border-other-outlined-border dark:bg-background-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eaed] px-5 py-4 dark:border-other-divider">
          <div>
            <h3 className="font-medium text-[#202124] dark:text-text-primary">
              {t("courseElement.grades.assignedTests")}
            </h3>
            <p className="mt-1 text-sm text-[#5f6368] dark:text-text-secondary">
              {t("courseElement.grades.assignedTestsHint")}
            </p>
          </div>
          <span className="rounded-full bg-[#e8f0fe] px-3 py-1 text-sm font-medium text-[#1967d2] dark:bg-primary-background dark:text-primary-main">
            {t("courseElement.grades.testCount", { count: exams.length })}
          </span>
        </div>

        {exams.length === 0 ? (
          <Empty
            className="py-12"
            description={t("courseElement.grades.empty")}
          />
        ) : (
          <div className="divide-y divide-[#e8eaed] dark:divide-other-divider">
            {exams.map((exam) => {
              const status = getTestsStatus(
                exam.startTime,
                exam.endTime,
                now
              ).status;
              const statusKey =
                status === "UPCOMING"
                  ? "notOpen"
                  : status === "OPENING"
                    ? "open"
                    : "closed";
              const statusColor =
                status === "UPCOMING"
                  ? "gold"
                  : status === "OPENING"
                    ? "blue"
                    : "default";

              return (
                <article
                  key={exam.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f8f9fa] dark:hover:bg-action-hover sm:gap-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f0fe] text-[#1967d2] dark:bg-primary-background dark:text-primary-main">
                    <ClipboardList size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-medium text-[#202124] dark:text-text-primary">
                      {exam.examName}
                    </h4>
                    <p className="mt-1 text-sm text-[#5f6368] dark:text-text-secondary">
                      {t("courseElement.classwork.durationText", {
                        minutes: exam.durationMinutes,
                        unit: t("courseElement.common.minuteUnit"),
                      })}
                      <span className="mx-2" aria-hidden="true">
                        ·
                      </span>
                      {new Date(exam.endTime).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <Tag color={statusColor} className="m-0">
                    {t(`courseElement.classwork.status.${statusKey}`)}
                  </Tag>
                  <Link
                    to={`/tests/${exam.id}/result/${courseGroupId}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dadce0] px-4 text-sm font-medium text-[#1a73e8] transition-colors hover:bg-[#f8faff] dark:border-other-outlined-border dark:hover:bg-action-hover"
                  >
                    {t("courseElement.grades.viewResults")}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

interface SummaryCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  accent: "blue" | "orange" | "green";
}

function SummaryCard({ icon, label, value, accent }: SummaryCardProps) {
  const accentClasses = {
    blue: "bg-[#e8f0fe] text-[#1967d2] dark:bg-primary-background dark:text-primary-main",
    orange:
      "bg-[#fff1e8] text-[#b45309] dark:bg-warning-main/10 dark:text-warning-main",
    green:
      "bg-[#e6f4ea] text-[#188038] dark:bg-success-main/10 dark:text-success-main",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#dadce0] bg-white p-4 dark:border-other-outlined-border dark:bg-background-paper">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm text-[#5f6368] dark:text-text-secondary">
          {label}
        </p>
        <p className="mt-0.5 text-xl font-semibold text-[#202124] dark:text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}
