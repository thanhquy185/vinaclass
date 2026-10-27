import { useMemo, useState } from "react";
import { Button, Empty, Input, Spin } from "antd";
import {
  Archive,
  BookOpenCheck,
  CopyPlus,
  Eye,
  Layers3,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FunctionAction } from "@/features/authorization/hooks/useFunctionActions";
import type { QuestionSortOrder } from "@/features/question-bank/types/questionBank";
import { AdminFilterField } from "@/shared/components/admin/AdminFilterField";
import { BodyQuestionItem } from "@/shared/components/questions/QuestionBody";
import { QueryErrorAlert } from "@/shared/components/ui/QueryErrorAlert/QueryErrorAlert";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type {
  Difficulty,
  Question,
  QuestionStatus,
  Subject,
} from "@/shared/types";
import { formatDateTimeVN } from "@/shared/utils";
import { useAuthStore } from "@/shared/stores/useAuthStore";

interface TeacherQuestionWorkspaceProps {
  subjects: Subject[];
  difficulties: Difficulty[];
  isLoadingSubjects: boolean;
  isLoadingDifficulties: boolean;
  hasFilterError: boolean;
  isRetryingFilterData: boolean;
  retryFilterData: () => Promise<unknown>;
  actions: FunctionAction[];
  canView: boolean;
  canCreate: boolean;
  isPermissionLoading: boolean;
  isLoadingQuestions: boolean;
  isQuestionError: boolean;
  isFetchingQuestions: boolean;
  refetchQuestions: () => Promise<unknown>;
  selectedTab: QuestionStatus;
  searchQuery: string;
  sortOrder: QuestionSortOrder;
  filterSubjectId: number;
  filterChapterId: number;
  filterDifficultyId: number;
  filteredQuestions: Question[];
  filteredQuestionCount: number;
  paginatedQuestions: Question[];
  currentPage: number;
  totalPages: number;
  hasActiveFilters: boolean;
  setCurrentPage: (page: number) => void;
  handleTabSelect: (tab: QuestionStatus) => void;
  handleSubjectChange: (subjectId: number) => void;
  handleChapterChange: (chapterId: number) => void;
  handleDifficultyChange: (difficultyId: number) => void;
  handleSearchChange: (value: string) => void;
  handleSortChange: (sortOrder: QuestionSortOrder) => void;
  resetFilters: () => void;
  onCreate: () => void;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  onAddToBank: (question: Question) => void;
  onPublish: (question: Question) => void;
  onArchive: (question: Question) => void;
  onRestore: (question: Question) => void;
  onMoveToPrivate: (question: Question) => void;
}

export function TeacherQuestionWorkspace({
  subjects,
  difficulties,
  isLoadingSubjects,
  isLoadingDifficulties,
  hasFilterError,
  isRetryingFilterData,
  retryFilterData,
  actions,
  canView,
  canCreate,
  isPermissionLoading,
  isLoadingQuestions,
  isQuestionError,
  isFetchingQuestions,
  refetchQuestions,
  selectedTab,
  searchQuery,
  sortOrder,
  filterSubjectId,
  filterChapterId,
  filterDifficultyId,
  filteredQuestions,
  filteredQuestionCount,
  paginatedQuestions,
  currentPage,
  totalPages,
  hasActiveFilters,
  setCurrentPage,
  handleTabSelect,
  handleSubjectChange,
  handleChapterChange,
  handleDifficultyChange,
  handleSearchChange,
  handleSortChange,
  resetFilters,
  onCreate,
  onEdit,
  onDelete,
  onAddToBank,
  onPublish,
  onArchive,
  onRestore,
  onMoveToPrivate,
}: TeacherQuestionWorkspaceProps) {
  const { t } = useTranslation();
  const activeSubject = subjects.find(
    (subject) => subject.id === filterSubjectId
  );
  const chapterOptions = useMemo(
    () =>
      (activeSubject?.chapters ?? []).map((chapter) => ({
        value: chapter.id,
        label: chapter.chapterName,
      })),
    [activeSubject]
  );
  const tabs: QuestionStatus[] = ["public", "private", "archive"];

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1 pt-1">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-text-primary">
            {t("questionPage.teacher.title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("questionPage.teacher.description")}
          </p>
        </div>
        <div className="max-w-sm rounded-2xl bg-background-paper px-4 py-3 text-sm leading-6 text-text-secondary shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <BookOpenCheck
            size={16}
            className="mr-2 inline text-primary-main"
            aria-hidden="true"
          />
          {t("questionPage.teacher.scopeHint")}
        </div>
      </header>

      <section className="grid gap-3 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
        <div className="flex items-center gap-3 rounded-3xl bg-background-paper p-5 shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
            <BookOpenCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs text-text-secondary">
              {t("questionPage.teacher.stats.questions")}
            </p>
            <p className="mt-0.5 text-xl font-semibold text-text-primary">
              {filteredQuestionCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-background-paper p-5 shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Layers3
              size={18}
              className="text-primary-main"
              aria-hidden="true"
            />
            {t("questionPage.teacher.stats.subjects", {
              count: subjects.length,
            })}
          </div>
          {subjects.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {subjects.slice(0, 6).map((subject) => (
                <span
                  key={subject.id}
                  className="max-w-full truncate rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main"
                  title={`${subject.subjectCode} · ${subject.subjectName}`}
                >
                  {subject.subjectCode} · {subject.subjectName}
                </span>
              ))}
              {subjects.length > 6 && (
                <span className="rounded-full bg-background-body-background px-3 py-1 text-xs text-text-secondary">
                  {t("questionPage.teacher.moreSubjects", {
                    count: subjects.length - 6,
                  })}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-secondary">
              {t("questionPage.teacher.noSubjects")}
            </p>
          )}
        </div>
      </section>

      <section
        id="question-list-top"
        className="flex min-w-0 flex-col gap-4 rounded-3xl bg-background-paper p-4 shadow-[0_1px_3px_rgba(60,64,67,.12)] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-other-divider pb-3">
          <div
            className="flex flex-wrap gap-1 rounded-full bg-background-body-background p-1"
            role="tablist"
            aria-label={t("questionPage.title")}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selectedTab === tab}
                onClick={() => handleTabSelect(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-primary-main text-primary-contrast shadow-sm"
                    : "text-text-secondary hover:bg-action-hover hover:text-text-primary"
                }`}
              >
                {t(`questionPage.tabs.${tab}`)}
              </button>
            ))}
          </div>
          {selectedTab === "private" && canCreate && (
            <Button
              type="primary"
              icon={<Plus size={17} />}
              className="!rounded-full !shadow-none"
              onClick={onCreate}
            >
              {t("questionPage.actions.addQuestion")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label={t("questionPage.filters.subject.label")}
            placeholder={t("questionPage.filters.subject.placeholder")}
            value={filterSubjectId}
            loading={isLoadingSubjects}
            options={[
              { value: -1, label: t("questionPage.filters.subject.all") },
              ...subjects.map((subject) => ({
                value: subject.id,
                label: `${subject.subjectCode} · ${subject.subjectName}`,
              })),
            ]}
            onSelect={(value) => handleSubjectChange(Number(value))}
          />
          <SelectField
            label={t("questionPage.filters.chapter.label")}
            placeholder={t("questionPage.filters.chapter.placeholder")}
            value={filterChapterId}
            disabled={filterSubjectId === -1 || isLoadingSubjects}
            options={[
              { value: -1, label: t("questionPage.filters.chapter.all") },
              ...chapterOptions,
            ]}
            onSelect={(value) => handleChapterChange(Number(value))}
          />
          <SelectField
            label={t("questionPage.filters.difficulty.label")}
            placeholder={t("questionPage.filters.difficulty.placeholder")}
            value={filterDifficultyId}
            loading={isLoadingDifficulties}
            disabled={
              filterSubjectId === -1 ||
              filterChapterId === -1 ||
              isLoadingDifficulties
            }
            options={[
              { value: -1, label: t("questionPage.filters.difficulty.all") },
              ...difficulties.map((difficulty) => ({
                value: difficulty.id,
                label: difficulty.difficultyName,
              })),
            ]}
            onSelect={(value) => handleDifficultyChange(Number(value))}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-other-divider pt-4 lg:flex-row lg:items-end">
          <AdminFilterField
            label={t("questionPage.search.label")}
            htmlFor="teacher-question-search"
            className="min-w-0 flex-1"
          >
            <Input
              id="teacher-question-search"
              allowClear
              size="large"
              className="!h-11 min-w-0 !rounded-xl"
              aria-label={t("questionPage.search.label")}
              placeholder={t("questionPage.search.placeholder", {
                count: filteredQuestionCount,
              })}
              prefix={<Search size={17} className="text-text-disabled" />}
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </AdminFilterField>
          <SelectField
            label={t("questionPage.sort.label")}
            placeholder={t("questionPage.sort.label")}
            className="w-full sm:w-64 sm:flex-none"
            value={sortOrder}
            options={[
              { value: "none", label: t("questionPage.sort.default") },
              { value: "asc", label: t("questionPage.sort.usageAsc") },
              { value: "desc", label: t("questionPage.sort.usageDesc") },
            ]}
            onSelect={(value) => handleSortChange(value as QuestionSortOrder)}
          />
          <Button
            aria-label={t("questionPage.clearFilters")}
            title={t("questionPage.clearFilters")}
            icon={<RotateCcw size={17} />}
            disabled={!hasActiveFilters}
            className="!h-11 !w-11 !shrink-0 !rounded-full"
            onClick={resetFilters}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-text-secondary" aria-live="polite">
            {t("questionPage.resultCount", { count: filteredQuestionCount })}
          </span>
          {hasFilterError && (
            <QueryErrorAlert
              message={t("questionPage.filterLoadError")}
              onRetry={retryFilterData}
              isRetrying={isRetryingFilterData}
            />
          )}
        </div>
      </section>

      {isQuestionError && canView && (
        <QueryErrorAlert
          message={t("questionPage.loadError")}
          onRetry={refetchQuestions}
          isRetrying={isFetchingQuestions}
        />
      )}

      {isPermissionLoading || isLoadingQuestions ? (
        <div className="flex min-h-56 items-center justify-center rounded-3xl bg-background-paper shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <Spin size="large" />
        </div>
      ) : !canView ? (
        <div className="rounded-3xl bg-background-paper px-4 py-16 text-center text-text-secondary shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          {t("questionPage.noViewPermission")}
        </div>
      ) : isQuestionError &&
        filteredQuestions.length === 0 ? null : paginatedQuestions.length ? (
        <div className="flex min-w-0 flex-col gap-4">
          {paginatedQuestions.map((question) => (
            <TeacherQuestionCard
              key={question.id}
              question={question}
              selectedTab={selectedTab}
              actions={actions}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToBank={onAddToBank}
              onPublish={onPublish}
              onArchive={onArchive}
              onRestore={onRestore}
              onMoveToPrivate={onMoveToPrivate}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-background-paper px-4 py-14 shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              hasActiveFilters
                ? t("questionPage.emptyFiltered")
                : t("questionPage.emptyByTab", {
                    tab: t(`questionPage.tabs.${selectedTab}`),
                  })
            }
          />
          {hasActiveFilters && (
            <Button
              type="link"
              className="mx-auto block text-primary-main"
              onClick={resetFilters}
            >
              {t("questionPage.clearFilters")}
            </Button>
          )}
        </div>
      )}

      {canView && totalPages > 1 && (
        <div className="rounded-3xl bg-background-paper py-2 shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

interface TeacherQuestionCardProps {
  question: Question;
  selectedTab: QuestionStatus;
  actions: FunctionAction[];
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
  onAddToBank: (question: Question) => void;
  onPublish: (question: Question) => void;
  onArchive: (question: Question) => void;
  onRestore: (question: Question) => void;
  onMoveToPrivate: (question: Question) => void;
}

function TeacherQuestionCard({
  question,
  selectedTab,
  actions,
  onEdit,
  onDelete,
  onAddToBank,
  onPublish,
  onArchive,
  onRestore,
  onMoveToPrivate,
}: TeacherQuestionCardProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <article className="flex min-w-0 flex-col rounded-3xl bg-background-paper p-4 shadow-[0_1px_3px_rgba(60,64,67,.12)] transition-shadow hover:shadow-[0_2px_10px_rgba(60,64,67,.16)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-other-divider pb-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          <span className="rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main">
            {question.difficulty?.difficultyName ??
              t("questionItem.unknownDifficulty")}
          </span>
          {question.chapter?.chapterName && (
            <span className="rounded-full bg-background-body-background px-3 py-1 text-xs font-medium text-text-secondary">
              {question.chapter.chapterName}
            </span>
          )}
        </div>
        <span className="max-w-full truncate text-sm font-medium text-text-secondary">
          {question.subject?.subjectName ?? t("questionItem.unknownSubject")}
        </span>
      </div>

      {question.imageUrl && (
        <img
          src={question.imageUrl}
          alt=""
          className="mt-4 max-h-52 w-full rounded-2xl object-contain"
          loading="lazy"
        />
      )}
      <BodyQuestionItem
        data={question}
        showAnswer={showAnswer}
        className="min-h-24 px-1"
      />

      <div className="mt-auto flex flex-col gap-3 border-t border-other-divider pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span>
            {question.createdAt
              ? formatDateTimeVN(question.createdAt)
              : t("questionItem.unknownDate")}
          </span>
          <span>{t("questionItem.usage", { count: question.usageCount })}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="text"
            icon={<Eye size={16} />}
            className="!rounded-full !text-primary-main hover:!bg-primary-background"
            aria-expanded={showAnswer}
            onClick={() => setShowAnswer((current) => !current)}
          >
            {showAnswer
              ? t("questionItem.hideAnswer")
              : t("questionItem.showAnswer")}
          </Button>
          {selectedTab === "private" && actions.includes("update") && (
            <Button
              type="text"
              icon={<Pencil size={16} />}
              className="!rounded-full !text-primary-main hover:!bg-primary-background"
              onClick={() => onEdit(question)}
            >
              {t("questionItem.edit")}
            </Button>
          )}
          {selectedTab === "private" && actions.includes("update") && (
            <Button
              type="text"
              icon={<Archive size={16} />}
              className="!rounded-full !text-primary-main hover:!bg-primary-background"
              onClick={() => onArchive(question)}
            >
              {t("questionItem.archive")}
            </Button>
          )}
          {selectedTab === "private" && actions.includes("publish") && (
            <Button
              type="text"
              icon={<Send size={16} />}
              className="!rounded-full !text-primary-main hover:!bg-primary-background"
              onClick={() => onPublish(question)}
            >
              {t("questionItem.makePublic")}
            </Button>
          )}
          {selectedTab === "public" &&
            question.creatorId !== user?.id &&
            actions.includes("create") && (
            <Button
              type="text"
              icon={<CopyPlus size={16} />}
              className="!rounded-full !text-primary-main hover:!bg-primary-background"
              onClick={() => onAddToBank(question)}
            >
              {t("questionItem.addToBank")}
            </Button>
          )}
          {selectedTab === "public" &&
            question.creatorId === user?.id &&
            actions.includes("update") && (
              <Button
                type="text"
                icon={<Undo2 size={16} />}
                className="!rounded-full !text-primary-main hover:!bg-primary-background"
                onClick={() => onMoveToPrivate(question)}
              >
                {t("questionItem.moveToPrivate")}
              </Button>
            )}
          {selectedTab === "archive" && actions.includes("update") && (
            <Button
              type="text"
              icon={<Undo2 size={16} />}
              className="!rounded-full !text-primary-main hover:!bg-primary-background"
              onClick={() => onRestore(question)}
            >
              {t("questionItem.restoreToBank")}
            </Button>
          )}
          {selectedTab === "archive" && actions.includes("delete") && (
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              className="!rounded-full"
              onClick={() => onDelete(question)}
            >
              {t("questionItem.delete")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
