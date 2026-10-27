import { Button, Empty, Spin } from "antd";
import {
  BookOpen,
  BarChart3,
  CalendarClock,
  ClipboardList,
  Clock3,
  Eye,
  FileQuestion,
  BookOpenCheck,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import type { Exam } from "@/shared/types";
import { StatusLabel } from "@/shared/components/ui/StatusLabel/StatusLabel";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import { QueryErrorAlert, SelectField } from "@/shared/components/ui";
import { useExamListItemController } from "@/features/assessments/hooks/useExamListItemController";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import { AdminSearchField } from "@/shared/components/admin";
import type {
  ExamSearchCriterion,
  ExamStatusFilter,
} from "@/features/assessments/types/examList";

interface TeacherExamWorkspaceProps {
  exams: Exam[];
  filteredExams: Exam[];
  currentExams: Exam[];
  actions: string[];
  canCreate: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  searchTerm: string;
  searchBy: ExamSearchCriterion;
  selectedSubject: number;
  statusFilter: ExamStatusFilter;
  subjects: Array<{ id: number; subjectName: string }>;
  currentPage: number;
  totalPages: number;
  now: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (value: ExamSearchCriterion) => void;
  onSubjectChange: (value: number) => void;
  onStatusChange: (value: ExamStatusFilter) => void;
  onPageChange: (page: number) => void;
  onReset: () => void;
  onRetry: () => Promise<unknown>;
}

export function TeacherExamWorkspace({
  exams,
  filteredExams,
  currentExams,
  actions,
  canCreate,
  isLoading,
  isFetching,
  isError,
  searchTerm,
  searchBy,
  selectedSubject,
  statusFilter,
  subjects,
  currentPage,
  totalPages,
  now,
  hasActiveFilters,
  onSearchChange,
  onSearchByChange,
  onSubjectChange,
  onStatusChange,
  onPageChange,
  onReset,
  onRetry,
}: TeacherExamWorkspaceProps) {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const activeCount = exams.filter(
    (exam) =>
      getTestsStatus(exam.startTime, exam.endTime, new Date(now)).status ===
      "OPENING"
  ).length;
  const upcomingCount = exams.filter(
    (exam) =>
      getTestsStatus(exam.startTime, exam.endTime, new Date(now)).status ===
      "UPCOMING"
  ).length;
  const assignedClassCount = new Set(
    exams.flatMap((exam) => (exam.courseGroups ?? []).map((group) => group.id))
  ).size;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1 pt-1">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-text-primary">
            {t("teacherExamWorkspace.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            {t("teacherExamWorkspace.description")}
          </p>
        </div>
        <div className="max-w-sm rounded-2xl bg-background-paper px-4 py-3 text-sm leading-6 text-text-secondary shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <BookOpenCheck
            size={16}
            className="mr-2 inline text-primary-main"
            aria-hidden="true"
          />
          {t("teacherExamWorkspace.scopeHint")}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <TeacherExamStat
          icon={<ClipboardList size={19} />}
          label={t("testPage.stats.total")}
          value={exams.length}
          locale={locale}
        />
        <TeacherExamStat
          icon={<CalendarClock size={19} />}
          label={t("testPage.stats.upcoming")}
          value={upcomingCount}
          locale={locale}
        />
        <TeacherExamStat
          icon={<UsersRound size={19} />}
          label={t("teacherExamWorkspace.classes")}
          value={assignedClassCount}
          locale={locale}
        />
      </section>

      <section className="rounded-3xl bg-background-paper p-4 shadow-[0_1px_3px_rgba(60,64,67,.12)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-normal text-text-primary">
              {t("teacherExamWorkspace.listTitle")}
            </h2>
            <span className="rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main">
              {t("teacherExamWorkspace.resultCount", {
                count: filteredExams.length,
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              {t("testPage.stats.opening")}: {activeCount}
            </span>
            {canCreate && (
              <Button
                type="primary"
                icon={<Plus size={17} />}
                className="!rounded-full !shadow-none"
                onClick={() => navigate("/tests/add")}
              >
                {t("teacherExamWorkspace.create")}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-other-divider pt-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("testPage.filter.panelTitle")}
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              {t("testPage.filter.panelDescription")}
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              <AdminSearchField<ExamSearchCriterion>
                label={t("testPage.filter.searchLabel")}
                criteriaLabel={t("common.searchByCriteria")}
                criteria={[
                  {
                    value: "name",
                    label: t("testPage.searchBy.name"),
                    placeholder: t("testPage.searchBy.namePlaceholder"),
                  },
                  {
                    value: "subject",
                    label: t("testPage.searchBy.subject"),
                    placeholder: t("testPage.searchBy.subjectPlaceholder"),
                  },
                ]}
                searchBy={searchBy}
                searchTerm={searchTerm}
                onSearchByChange={onSearchByChange}
                onSearchTermChange={onSearchChange}
                className="xl:col-span-2"
              />
              <SelectField
                label={t("testPage.filter.statusLabel")}
                value={statusFilter}
                placeholder={t("testPage.filter.all")}
                options={[
                  { label: t("testPage.filter.all"), value: 1 },
                  { label: t("testPage.filter.opening"), value: 2 },
                  { label: t("testPage.filter.closed"), value: 3 },
                  { label: t("testPage.filter.notOpened"), value: 4 },
                ]}
                onSelect={(value) =>
                  onStatusChange(Number(value) as ExamStatusFilter)
                }
              />
              <SelectField
                label={t("testPage.subject")}
                placeholder={t("testPage.selectSubjectPlaceholder")}
                options={[
                  { label: t("testPage.filter.allSubjects"), value: -1 },
                  ...subjects.map((subject) => ({
                    label: subject.subjectName,
                    value: subject.id,
                  })),
                ]}
                value={selectedSubject}
                onSelect={(value) => onSubjectChange(Number(value))}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="text-body-2 text-text-secondary"
                aria-live="polite"
              >
                {t("teacherExamWorkspace.resultCount", {
                  count: filteredExams.length,
                })}
              </span>
              <Button
                type="text"
                icon={<RotateCcw size={16} />}
                disabled={!hasActiveFilters}
                className="!rounded-full !text-primary-main hover:!bg-primary-background"
                onClick={onReset}
              >
                {t("teacherExamWorkspace.reset")}
              </Button>
            </div>
          </div>
        </div>

        {isError && (
          <QueryErrorAlert
            className="mt-4"
            message={t("testPage.loadError")}
            retryLabel={t("testPage.retry")}
            onRetry={onRetry}
            isRetrying={isFetching}
          />
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : isError ? null : currentExams.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2" aria-live="polite">
            {currentExams.map((exam) => (
              <TeacherExamCard key={exam.id} exam={exam} actions={actions} />
            ))}
          </div>
        ) : (
          <Empty
            className="my-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t(
              searchTerm.trim() || selectedSubject !== -1 || statusFilter !== 1
                ? "testPage.empty"
                : "teacherExamWorkspace.empty"
            )}
          >
            {!exams.length && canCreate && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => navigate("/tests/add")}
              >
                {t("teacherExamWorkspace.createFirst")}
              </Button>
            )}
          </Empty>
        )}

        {!isLoading && !isError && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </section>
    </div>
  );
}

function TeacherExamCard({ exam, actions }: { exam: Exam; actions: string[] }) {
  const { t } = useTranslation("common");
  const {
    statusLabel,
    statusVariant,
    handleJoinTest,
    handleEditTest,
    handleOpenDetails,
    handleDelete,
  } = useExamListItemController({ exam });

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-other-outlined-border bg-background-paper p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(60,64,67,.12)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
            <FileQuestion size={21} />
          </span>
          <div className="min-w-0">
            {actions.includes("view") ? (
              <button
                type="button"
                className="line-clamp-2 text-left text-lg font-medium text-text-primary hover:text-primary-main"
                onClick={handleOpenDetails}
              >
                {exam.examName}
              </button>
            ) : (
              <h3 className="line-clamp-2 text-lg font-medium text-text-primary">
                {exam.examName}
              </h3>
            )}
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
              <BookOpen size={15} />{" "}
              {exam.subject?.subjectName ?? t("testItem.unknownSubject")}
            </p>
          </div>
        </div>
        <StatusLabel variant={statusVariant}>{statusLabel}</StatusLabel>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <CalendarClock size={16} className="shrink-0 text-text-disabled" />
          {formatFullDateTimeVN(exam.startTime)}
        </p>
        <p className="flex items-center gap-2">
          <Clock3 size={16} className="shrink-0 text-text-disabled" />
          {t("testItem.durationMinutes", {
            count: Number(exam.durationMinutes ?? 0),
          })}
        </p>
        <p className="flex items-center gap-2">
          <FileQuestion size={16} className="shrink-0 text-text-disabled" />
          {t("testItem.questionCount", {
            count: (exam.questions ?? []).length,
          })}
        </p>
        <p className="flex items-center gap-2">
          <UsersRound size={16} className="shrink-0 text-text-disabled" />
          {t("testItem.classCount", {
            count: (exam.courseGroups ?? []).length,
          })}
        </p>
      </div>

      <div className="mt-4 border-t border-other-divider pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-disabled">
          {t("teacherExamWorkspace.assignedClasses")}
        </p>
        {(exam.courseGroups ?? []).length ? (
          <div className="flex flex-wrap gap-2">
            {(exam.courseGroups ?? []).map((group) => (
              <Link
                key={group.id}
                to={`/tests/${exam.id}/result/${group.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-other-outlined-border bg-background-body-background px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary-main hover:bg-primary-background hover:text-primary-main"
              >
                {group.groupName}
                <span className="inline-flex items-center gap-1 text-primary-main">
                  <BarChart3 size={15} aria-hidden="true" />
                  {t("testItem.actions.viewResults")}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <span className="text-sm text-text-disabled">
            {t("testItem.noClasses")}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-end gap-1 border-t border-other-divider pt-3">
        {actions.includes("view") && (
          <Button
            type="text"
            icon={<Eye size={16} />}
            className="!rounded-full !text-primary-main hover:!bg-primary-background"
            onClick={handleJoinTest}
          >
            {t("testItem.actions.viewDetail")}
          </Button>
        )}
        {actions.includes("update") && (
          <Button
            type="text"
            icon={<Pencil size={16} />}
            className="!rounded-full !text-primary-main hover:!bg-primary-background"
            onClick={handleEditTest}
          >
            {t("testItem.actions.edit")}
          </Button>
        )}
        {actions.includes("delete") && (
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            className="!rounded-full"
            onClick={handleDelete}
          >
            {t("testItem.actions.delete")}
          </Button>
        )}
      </div>
    </article>
  );
}

function TeacherExamStat({
  icon,
  label,
  value,
  locale,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  locale: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-background-paper p-4 shadow-[0_1px_3px_rgba(60,64,67,.12)] sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-background text-primary-main">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-text-secondary">{label}</p>
        <p className="mt-0.5 text-xl font-semibold text-text-primary">
          {value.toLocaleString(locale)}
        </p>
      </div>
    </div>
  );
}
