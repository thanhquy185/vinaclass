import { Empty, Spin, Tag } from "antd";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ClipboardList,
  Play,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, QueryErrorAlert } from "@/shared/components/ui";
import type { StudentExam } from "@/shared/types";
import { getTestsStatus } from "@/features/assessments/utils/exam";

interface TeacherCourseGroupClassworkProps {
  exams: StudentExam[];
  canCreateExam: boolean;
  canPreviewExam: boolean;
  now: Date;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onCreateExam: () => void;
  onPreviewExam: (examId: number) => void;
  onRetry: () => void;
}

export default function TeacherCourseGroupClasswork({
  exams,
  canCreateExam,
  canPreviewExam,
  now,
  isLoading,
  isFetching,
  isError,
  onCreateExam,
  onPreviewExam,
  onRetry,
}: TeacherCourseGroupClassworkProps) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi-VN" : "en-US";

  const toggleExpanded = () => setIsExpanded((expanded) => !expanded);

  return (
    <section className="mt-8 w-full duration-300 animate-in fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-normal text-[#202124] dark:text-text-primary">
            {t("courseElement.classwork.teacherTitle")}
          </h2>
          <p className="mt-1 text-sm text-[#5f6368] dark:text-text-secondary">
            {t("courseElement.classwork.teacherDescription", {
              count: exams.length,
            })}
          </p>
        </div>
        {canCreateExam && (
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
      </div>

      <section className="w-full border-y border-[#dadce0] dark:border-other-divider">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          className="flex min-h-[62px] w-full items-center justify-between gap-4 py-3 text-left"
        >
          <span className="text-xl font-normal text-[#202124] dark:text-text-primary">
            {t("courseElement.classwork.noTopic")}
          </span>
          <span className="flex items-center gap-3 text-sm text-[#5f6368] dark:text-text-secondary">
            {exams.length}
            {isExpanded ? (
              <ChevronUp size={20} aria-hidden="true" />
            ) : (
              <ChevronDown size={20} aria-hidden="true" />
            )}
          </span>
        </button>

        {isExpanded && (
          <div className="border-t border-[#dadce0] dark:border-other-divider">
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Spin />
              </div>
            ) : isError ? (
              <QueryErrorAlert
                className="my-4"
                message={t("courseElement.classwork.loadError")}
                retryLabel={t("courseElement.retry")}
                onRetry={onRetry}
                isRetrying={isFetching}
              />
            ) : exams.length === 0 ? (
              <Empty
                className="py-12"
                description={t("courseElement.classwork.empty")}
              />
            ) : (
              exams.map((exam) => {
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
                const dateRange = `${new Date(exam.startTime).toLocaleString(
                  locale,
                  { dateStyle: "medium", timeStyle: "short" }
                )} – ${new Date(exam.endTime).toLocaleString(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`;

                return (
                  <article
                    key={exam.id}
                    className="flex min-h-[88px] flex-wrap items-center gap-4 border-b border-[#dadce0] py-4 last:border-b-0 dark:border-other-divider sm:gap-5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1f3f4] text-[#5f6368] dark:bg-action-hover dark:text-text-secondary">
                      <ClipboardList size={21} aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-medium text-[#202124] dark:text-text-primary">
                        {exam.examName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5f6368] dark:text-text-secondary">
                        <span>
                          {t("courseElement.classwork.durationText", {
                            minutes: exam.durationMinutes,
                            unit: t("courseElement.common.minuteUnit"),
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock size={14} aria-hidden="true" />
                          {dateRange}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                      <Tag color={statusColor} className="m-0">
                        {t(`courseElement.classwork.status.${statusKey}`)}
                      </Tag>
                      {canPreviewExam && (
                        <Button
                          variant="outline"
                          color="primary"
                          size="medium"
                          onClick={() => onPreviewExam(exam.id)}
                          className="rounded-full"
                        >
                          <Play size={16} aria-hidden="true" />
                          {t("courseElement.classwork.practice")}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={toggleExpanded}
          className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[#1a73e8] transition-colors hover:bg-[#f8faff] dark:hover:bg-action-hover"
        >
          <ChevronsUpDown size={17} aria-hidden="true" />
          {t(
            isExpanded
              ? "courseElement.classwork.collapseAll"
              : "courseElement.classwork.expandAll"
          )}
        </button>
      </div>
    </section>
  );
}
