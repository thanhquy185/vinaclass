import { useState } from "react";
import { Dropdown, Empty, Spin } from "antd";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ClipboardCheck,
  ClipboardList,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryErrorAlert } from "@/shared/components/ui";
import type { StudentExam } from "@/shared/types";
import { getTestsStatus } from "@/features/assessments/utils/exam";

interface StudentCourseGroupClassworkProps {
  exams: StudentExam[];
  now: Date;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onStartExam: (examId: number) => void;
  onViewResult: (examAttemptId: number) => void;
  onRetry: () => void;
}

export default function StudentCourseGroupClasswork({
  exams,
  now,
  isLoading,
  isFetching,
  isError,
  onStartExam,
  onViewResult,
  onRetry,
}: StudentCourseGroupClassworkProps) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi-VN" : "en-US";
  const numberFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });

  return (
    <section className="mt-8 w-full duration-300 animate-in fade-in">
      <div className="mb-7 flex flex-wrap items-center justify-end gap-3">
        <Link
          to="/exams"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dadce0] px-4 text-sm font-medium text-[#1a73e8] transition-colors hover:bg-[#f8faff] dark:border-other-outlined-border dark:hover:bg-action-hover"
        >
          <ClipboardCheck size={17} aria-hidden="true" />
          {t("courseElement.classwork.viewYourWork")}
        </Link>
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
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

      <section className="w-full border-y border-[#dadce0] dark:border-other-divider">
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          className="flex min-h-[60px] w-full items-center justify-between gap-4 py-3 text-left"
        >
          <span className="text-xl font-normal text-[#202124] dark:text-text-primary">
            {t("courseElement.classwork.noTopic")}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} aria-hidden="true" />
          ) : (
            <ChevronDown size={20} aria-hidden="true" />
          )}
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
                className="py-10"
                description={t("courseElement.classwork.empty")}
              />
            ) : (
              exams.map((exam) => {
                const testStatus = getTestsStatus(
                  exam.startTime,
                  exam.endTime,
                  now
                ).status;
                const attempt = exam.examAttempt;
                const canStart =
                  testStatus === "OPENING" &&
                  (!attempt ||
                    (exam.canResume && attempt.status !== "SUBMITTED"));
                const canViewResult =
                  attempt?.status === "SUBMITTED" && Boolean(attempt.id);
                const hasScore =
                  attempt?.totalScore !== null &&
                  attempt?.totalScore !== undefined;

                const statusKey = hasScore
                  ? "graded"
                  : attempt?.status === "SUBMITTED"
                    ? "submitted"
                    : attempt?.status === "IN_PROGRESS" ||
                        attempt?.status === "SAVED"
                      ? "inProgress"
                      : attempt?.status === "CANCELLED"
                        ? "cancelled"
                        : testStatus === "UPCOMING"
                          ? "notOpen"
                          : testStatus === "CLOSED"
                            ? "closed"
                            : "notStarted";
                const statusText = t(
                  `courseElement.classwork.status.${statusKey}`
                );
                const menuItems = [
                  ...(canStart
                    ? [
                        {
                          key: "start",
                          label: t(
                            attempt
                              ? "courseElement.classwork.status.resume"
                              : "courseElement.classwork.status.start"
                          ),
                        },
                      ]
                    : []),
                  ...(canViewResult
                    ? [
                        {
                          key: "result",
                          label: t("courseElement.classwork.viewResult"),
                        },
                      ]
                    : []),
                  ...(!canStart && !canViewResult
                    ? [{ key: "status", label: statusText, disabled: true }]
                    : []),
                ];

                return (
                  <article
                    key={exam.id}
                    className="grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-[#dadce0] py-3 last:border-b-0 dark:border-other-divider sm:gap-5"
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        canStart
                          ? "bg-[#b2ebf2] text-[#006064]"
                          : "border-2 border-[#80868b] text-[#5f6368] dark:border-other-outlined-border dark:text-text-secondary"
                      }`}
                    >
                      {hasScore ? (
                        <Check size={21} aria-hidden="true" />
                      ) : (
                        <ClipboardList size={21} aria-hidden="true" />
                      )}
                    </span>

                    <div className="min-w-0 py-1">
                      <h3 className="truncate text-base font-medium text-[#202124] dark:text-text-primary">
                        {exam.examName}
                      </h3>
                      <p className="mt-1 truncate text-sm text-[#5f6368] dark:text-text-secondary">
                        {t("courseElement.classwork.durationText", {
                          minutes: exam.durationMinutes,
                          unit: t("courseElement.common.minuteUnit"),
                        })}
                      </p>
                    </div>

                    <div className="min-w-[100px] text-right">
                      {hasScore ? (
                        <>
                          <p className="text-xs text-[#5f6368] dark:text-text-secondary">
                            {t("courseElement.classwork.scoreLabel")}
                          </p>
                          <p className="font-medium text-[#202124] dark:text-text-primary">
                            {numberFormatter.format(
                              Number(attempt?.totalScore)
                            )}
                            /10
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-[#5f6368] dark:text-text-secondary">
                          {statusText}
                        </p>
                      )}
                    </div>

                    <Dropdown
                      trigger={["click"]}
                      menu={{
                        items: menuItems,
                        onClick: ({ key }) => {
                          if (key === "start") onStartExam(exam.id);
                          if (key === "result" && attempt?.id) {
                            onViewResult(attempt.id);
                          }
                        },
                      }}
                    >
                      <button
                        type="button"
                        aria-label={t("courseElement.classwork.moreActions")}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] dark:text-text-secondary dark:hover:bg-action-hover"
                      >
                        <MoreVertical size={19} aria-hidden="true" />
                      </button>
                    </Dropdown>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>
    </section>
  );
}
