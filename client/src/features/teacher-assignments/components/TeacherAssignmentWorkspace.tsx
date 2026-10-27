import { Button, Empty, Input, Spin, Tag } from "antd";
import { BookOpenCheck, RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  AssignmentOverviewStats,
  AssignmentSubjectSummary,
} from "@/features/teacher-assignments/types/teacherAssignment";
import { AssignmentStats } from "@/features/teacher-assignments/components/AssignmentStats";
import { QueryErrorAlert } from "@/shared/components/ui";

interface TeacherAssignmentWorkspaceProps {
  subjects: AssignmentSubjectSummary[];
  stats: AssignmentOverviewStats;
  searchTerm: string;
  canReset: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onSearch: (value: string) => void;
  onReset: () => void;
  onRetry: () => void | Promise<unknown>;
}

export function TeacherAssignmentWorkspace({
  subjects,
  stats,
  searchTerm,
  canReset,
  isLoading,
  isFetching,
  isError,
  onSearch,
  onReset,
  onRetry,
}: TeacherAssignmentWorkspaceProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-main">
          {t("assignmentPage.teacherWorkspace.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-text-primary">
          {t("assignmentPage.teacherWorkspace.title")}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("assignmentPage.teacherWorkspace.description")}
        </p>
      </header>

      <AssignmentStats stats={stats} isLoading={isLoading} />

      <section className="rounded-3xl bg-background-paper p-4 shadow-[0_1px_3px_rgba(60,64,67,.12)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium text-text-primary">
              {t("assignmentPage.teacherWorkspace.listTitle")}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t("assignmentPage.teacherWorkspace.subjectCount", {
                count: subjects.length,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-background-body-background p-3 sm:flex-row sm:items-center">
          <Input
            allowClear
            aria-label={t("assignmentPage.searchBy.subjectPlaceholder")}
            prefix={<Search size={17} className="text-text-disabled" />}
            placeholder={t("assignmentPage.searchBy.subjectPlaceholder")}
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
            className="min-w-0 flex-1"
          />
          <Button
            aria-label={t("assignmentPage.resetFilters")}
            title={t("assignmentPage.resetFilters")}
            icon={<RotateCcw size={16} />}
            disabled={!canReset}
            onClick={onReset}
          >
            {t("assignmentPage.resetFilters")}
          </Button>
        </div>

        {isError && (
          <QueryErrorAlert
            className="mt-4"
            message={t("assignmentPage.loadFailed")}
            retryLabel={t("assignmentPage.retry")}
            onRetry={onRetry}
            isRetrying={isFetching}
          />
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : isError ? null : subjects.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <article
                key={subject.id}
                className="flex min-h-40 flex-col justify-between rounded-2xl border border-other-outlined-border bg-background-paper p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(60,64,67,.16)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
                    <BookOpenCheck size={21} aria-hidden="true" />
                  </span>
                  <Tag className="!m-0 !rounded-full !border-0 !bg-background-body-background !font-mono !text-text-secondary">
                    {subject.subjectCode}
                  </Tag>
                </div>
                <h3 className="mt-5 font-medium text-text-primary">
                  {subject.subjectName}
                </h3>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            className="my-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t(
              searchTerm.trim()
                ? "assignmentPage.empty.filtered"
                : "assignmentPage.empty.list",
            )}
          />
        )}
      </section>
    </div>
  );
}
