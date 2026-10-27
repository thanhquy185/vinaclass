import { Empty, Select, Spin } from "antd";
import {
  BookOpenCheck,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QueryErrorAlert } from "@/shared/components/ui";
import type {
  StudentTask,
  StudentTaskTab,
} from "@/features/assessments/types/studentTask";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import { useStudentTasks } from "@/features/assessments/hooks/useStudentTasks";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface StudentTasksWorkspaceProps {
  exams: Parameters<typeof useStudentTasks>[0]["exams"];
  attempts?: Parameters<typeof useStudentTasks>[0]["attempts"];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => Promise<unknown>;
  onStartExam: (examId: number) => void;
}

const TABS: StudentTaskTab[] = ["assigned", "missing", "done"];

export default function StudentTasksWorkspace({
  exams,
  attempts,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  onStartExam,
}: StudentTasksWorkspaceProps) {
  const { t, i18n } = useTranslation();
  const tasks = useStudentTasks({ exams, attempts });
  const locale = i18n.resolvedLanguage?.startsWith("vi") ? "vi-VN" : "en-US";
  const allCoursesOption = {
    value: "all",
    label: t("studentTasks.allCourses"),
  };

  return (
    <div className="-mx-4 w-auto bg-white text-[#202124] dark:bg-background-paper dark:text-text-primary md:-mx-6 lg:-mx-8">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <BookOpenCheck
          size={21}
          className="text-[#1a73e8]"
          aria-hidden="true"
        />
        <Link
          to="/courses"
          className="text-lg text-[#5f6368] hover:text-[#1a73e8] dark:text-text-secondary"
        >
          {t("coursePage.title")}
        </Link>
        <ChevronRight
          size={18}
          className="text-[#5f6368] dark:text-text-secondary"
          aria-hidden="true"
        />
        <h1 className="truncate text-lg font-medium text-[#3c4043] dark:text-text-primary">
          {t("studentTasks.title")}
        </h1>
      </div>

      <div className="border-y border-[#dadce0] dark:border-other-divider">
        <nav
          role="tablist"
          aria-label={t("studentTasks.title")}
          className="mx-auto flex max-w-[1440px] gap-1 px-4 md:gap-2 md:px-6 lg:px-8"
        >
          {TABS.map((tab) => {
            const isActive = tasks.activeTab === tab;
            return (
              <button
                key={tab}
                id={`student-tasks-tab-${tab}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="student-tasks-panel"
                onClick={() => tasks.changeTab(tab)}
                className={`relative min-h-[62px] min-w-28 px-4 text-sm font-medium transition-colors md:px-6 ${
                  isActive
                    ? "text-[#1a73e8]"
                    : "text-[#5f6368] hover:bg-[#f8f9fa] dark:text-text-secondary dark:hover:bg-action-hover"
                }`}
              >
                {t(`studentTasks.tabs.${tab}`)}
                {isActive && (
                  <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-[#1a73e8]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <section
        id="student-tasks-panel"
        role="tabpanel"
        aria-labelledby={`student-tasks-tab-${tasks.activeTab}`}
        className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-6 md:px-6 lg:px-8"
      >
        <div className="mb-5 max-w-[452px]">
          <Select
            aria-label={t("studentTasks.filterByCourse")}
            size="large"
            value={tasks.selectedCourseGroupId}
            onChange={tasks.setSelectedCourseGroupId}
            className="w-full [&_.ant-select-selector]:!rounded-md"
            options={[
              allCoursesOption,
              ...tasks.courseGroups.map((courseGroup) => ({
                value: String(courseGroup.id),
                label: courseGroup.groupName,
              })),
            ]}
          />
        </div>

        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <QueryErrorAlert
            className="mt-6"
            message={t("examPage.loadError")}
            description={getApiErrorMessage(error)}
            retryLabel={t("examPage.retry")}
            onRetry={onRetry}
            isRetrying={isFetching}
          />
        ) : tasks.sections.length === 0 ? (
          <Empty
            className="py-16"
            description={t(`studentTasks.empty.${tasks.activeTab}`)}
          />
        ) : (
          <div className="divide-y divide-[#dadce0] dark:divide-other-divider">
            {tasks.sections.map((section) => {
              const isExpanded = tasks.expandedSections.includes(section.key);
              return (
                <section key={section.key}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => tasks.toggleSection(section.key)}
                    className="flex min-h-[66px] w-full items-center justify-between gap-4 py-3 text-left"
                  >
                    <span className="text-xl font-normal text-[#202124] dark:text-text-primary">
                      {t(section.titleKey)}
                    </span>
                    <span className="flex shrink-0 items-center gap-5">
                      <span
                        className={`text-sm ${
                          section.key === "thisWeek" ||
                          section.key === "nextWeek"
                            ? "text-[#1a73e8]"
                            : "text-[#5f6368] dark:text-text-secondary"
                        }`}
                      >
                        {section.tasks.length}
                      </span>
                      {isExpanded ? (
                        <ChevronUp
                          size={19}
                          className="text-[#5f6368] dark:text-text-secondary"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDown
                          size={19}
                          className="text-[#5f6368] dark:text-text-secondary"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-2">
                      {section.tasks.map((task) => (
                        <StudentTaskRow
                          key={task.key}
                          task={task}
                          now={tasks.now}
                          locale={locale}
                          onStartExam={onStartExam}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

interface StudentTaskRowProps {
  task: StudentTask;
  now: Date;
  locale: string;
  onStartExam: (examId: number) => void;
}

function StudentTaskRow({
  task,
  now,
  locale,
  onStartExam,
}: StudentTaskRowProps) {
  const { t } = useTranslation();
  const testStatus = getTestsStatus(task.startsAt, task.dueAt, now).status;
  const canResume = Boolean(
    task.attempt &&
    task.attempt.status !== "SUBMITTED" &&
    task.attempt.exam?.examConfiguration?.isEnableResume
  );
  const canStart = testStatus === "OPENING" && (!task.attempt || canResume);
  const hasScore =
    task.attempt?.totalScore !== null && task.attempt?.totalScore !== undefined;
  const parsedDueDate = task.dueAt ? new Date(task.dueAt) : null;
  const dueDate =
    parsedDueDate && Number.isFinite(parsedDueDate.getTime())
      ? parsedDueDate
      : null;
  const isToday =
    dueDate !== null &&
    dueDate.getFullYear() === now.getFullYear() &&
    dueDate.getMonth() === now.getMonth() &&
    dueDate.getDate() === now.getDate();
  const isOverdue = dueDate !== null && dueDate.getTime() < now.getTime();
  const numberFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });
  const dueValue = dueDate
    ? isToday
      ? t("studentTasks.dueToday", {
          time: dueDate.toLocaleTimeString(locale, {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      : dueDate.toLocaleString(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        })
    : t("studentTasks.noDueDate");
  const taskStatusText = task.attempt
    ? task.attempt.status === "SUBMITTED"
      ? t("studentTasks.status.submitted")
      : task.attempt.status === "IN_PROGRESS" || task.attempt.status === "SAVED"
        ? t("studentTasks.status.inProgress")
        : t("studentTasks.status.notStarted")
    : testStatus === "UPCOMING"
      ? t("studentTasks.status.notOpen")
      : testStatus === "CLOSED"
        ? t("studentTasks.status.closed")
        : t("studentTasks.status.notStarted");
  const courseLabel =
    task.courseGroup?.groupName ?? task.exam.subject?.subjectName ?? "";

  return (
    <article className="flex min-h-[76px] items-center gap-4 border-b border-[#dadce0] py-3 last:border-0 dark:border-other-divider sm:gap-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffe0c2] text-[#a64b00]">
        <ClipboardList size={21} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        {canStart ? (
          <button
            type="button"
            onClick={() => onStartExam(task.exam.id)}
            aria-label={`${task.exam.examName} · ${t(
              task.attempt
                ? "studentTasks.status.resume"
                : "studentTasks.status.start"
            )}`}
            className="block max-w-full truncate text-left text-base font-medium text-[#3c4043] hover:text-[#1a73e8] hover:underline dark:text-text-primary"
          >
            {task.exam.examName}
          </button>
        ) : (
          <h3 className="truncate text-base font-medium text-[#3c4043] dark:text-text-primary">
            {task.exam.examName}
          </h3>
        )}
        {task.courseGroup ? (
          <Link
            to={`/courses/${task.courseGroup.id}`}
            className="mt-0.5 block truncate text-sm text-[#5f6368] hover:text-[#1a73e8] dark:text-text-secondary"
          >
            {courseLabel}
          </Link>
        ) : (
          <p className="mt-0.5 truncate text-sm text-[#5f6368] dark:text-text-secondary">
            {courseLabel}
          </p>
        )}
        <p className="mt-1 text-xs text-[#5f6368] dark:text-text-secondary sm:hidden">
          {task.status === "done" ? taskStatusText : dueValue}
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 text-right sm:flex">
        {task.status === "done" ? (
          <div>
            {hasScore ? (
              <p className="font-medium text-[#3c4043] dark:text-text-primary">
                {numberFormatter.format(Number(task.attempt?.totalScore))}/10
                <span className="ml-1 text-sm font-normal text-[#5f6368] dark:text-text-secondary">
                  {t("studentTasks.score")}
                </span>
              </p>
            ) : (
              <p className="text-sm text-[#5f6368] dark:text-text-secondary">
                {t("studentTasks.status.waitingForScore")}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <CalendarClock
              size={17}
              className="mb-0.5 text-[#5f6368] dark:text-text-secondary"
              aria-hidden="true"
            />
            <p
              className={`text-sm ${
                isOverdue
                  ? "text-[#b3261e]"
                  : isToday
                    ? "font-medium text-[#188038]"
                    : "text-[#5f6368] dark:text-text-secondary"
              }`}
            >
              {dueValue}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
