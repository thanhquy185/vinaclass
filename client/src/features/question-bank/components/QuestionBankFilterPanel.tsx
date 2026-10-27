import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AdminFilterPanel, AdminSearchField } from "@/shared/components/admin";
import { QueryErrorAlert } from "@/shared/components/ui";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type { Difficulty, Subject } from "@/shared/types";
import type {
  QuestionSearchCriterion,
  QuestionSortOrder,
} from "@/features/question-bank/types/questionBank";

export type { QuestionSortOrder } from "@/features/question-bank/types/questionBank";

interface QuestionBankFilterPanelProps {
  subjects: Subject[];
  difficulties: Difficulty[];
  isLoadingSubjects: boolean;
  isLoadingDifficulties: boolean;
  hasFilterError: boolean;
  isRetryingFilterData: boolean;
  onRetryFilterData: () => Promise<unknown>;
  filterSubjectId: number;
  filterChapterId: number;
  filterDifficultyId: number;
  searchQuery: string;
  searchBy: QuestionSearchCriterion;
  sortOrder: QuestionSortOrder;
  resultCount: number;
  hasActiveFilters: boolean;
  onSubjectChange: (subjectId: number) => void;
  onChapterChange: (chapterId: number) => void;
  onDifficultyChange: (difficultyId: number) => void;
  onSearchChange: (searchQuery: string) => void;
  onSearchByChange: (searchBy: QuestionSearchCriterion) => void;
  onSortChange: (sortOrder: QuestionSortOrder) => void;
  onResetFilters: () => void;
}

export function QuestionBankFilterPanel({
  subjects,
  difficulties,
  isLoadingSubjects,
  isLoadingDifficulties,
  hasFilterError,
  isRetryingFilterData,
  onRetryFilterData,
  filterSubjectId,
  filterChapterId,
  filterDifficultyId,
  searchQuery,
  searchBy,
  sortOrder,
  resultCount,
  hasActiveFilters,
  onSubjectChange,
  onChapterChange,
  onDifficultyChange,
  onSearchChange,
  onSearchByChange,
  onSortChange,
  onResetFilters,
}: QuestionBankFilterPanelProps) {
  const { t } = useTranslation();
  const selectedSubject = subjects.find(
    (subject) => subject.id === filterSubjectId,
  );
  const chapterOptions = useMemo(
    () =>
      (selectedSubject?.chapters ?? []).map((chapter) => ({
        label: chapter.chapterName,
        value: chapter.id,
      })),
    [selectedSubject],
  );
  const canReset = hasActiveFilters || searchBy !== "content";

  return (
    <AdminFilterPanel
      title={t("questionPage.filter.panelTitle")}
      description={t("questionPage.filter.panelDescription")}
      resetLabel={t("questionPage.clearFilters")}
      resetDisabled={!canReset}
      onReset={onResetFilters}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] xl:grid-cols-3">
          <AdminSearchField<QuestionSearchCriterion>
            label={t("questionPage.filter.searchLabel")}
            criteriaLabel={t("common.searchByCriteria")}
            criteria={[
              {
                value: "content",
                label: t("questionPage.searchBy.content"),
                placeholder: t("questionPage.searchBy.contentPlaceholder"),
              },
              {
                value: "answer",
                label: t("questionPage.searchBy.answer"),
                placeholder: t("questionPage.searchBy.answerPlaceholder"),
              },
            ]}
            searchBy={searchBy}
            searchTerm={searchQuery}
            onSearchByChange={onSearchByChange}
            onSearchTermChange={onSearchChange}
            className="xl:col-span-2"
          />
          <SelectField
            label={t("questionPage.sort.label")}
            placeholder={t("questionPage.sort.label")}
            className="w-full min-w-0"
            options={[
              { label: t("questionPage.sort.default"), value: "none" },
              { label: t("questionPage.sort.usageAsc"), value: "asc" },
              { label: t("questionPage.sort.usageDesc"), value: "desc" },
            ]}
            value={sortOrder}
            onSelect={(value) => onSortChange(value as QuestionSortOrder)}
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label={t("questionPage.filters.subject.label")}
            placeholder={t("questionPage.filters.subject.placeholder")}
            className="w-full min-w-0"
            disabled={isLoadingSubjects}
            options={[
              { label: t("questionPage.filters.subject.all"), value: -1 },
              ...subjects.map((subject) => ({
                label: `${subject.subjectCode} · ${subject.subjectName}`,
                value: subject.id,
              })),
            ]}
            value={filterSubjectId}
            onSelect={(value) => onSubjectChange(Number(value))}
          />
          <SelectField
            label={t("questionPage.filters.chapter.label")}
            placeholder={t("questionPage.filters.chapter.placeholder")}
            className="w-full min-w-0"
            disabled={filterSubjectId === -1}
            options={[
              { label: t("questionPage.filters.chapter.all"), value: -1 },
              ...chapterOptions,
            ]}
            value={filterChapterId}
            onSelect={(value) => onChapterChange(Number(value))}
          />
          <SelectField
            label={t("questionPage.filters.difficulty.label")}
            placeholder={t("questionPage.filters.difficulty.placeholder")}
            className="w-full min-w-0"
            disabled={isLoadingDifficulties}
            options={[
              { label: t("questionPage.filters.difficulty.all"), value: -1 },
              ...difficulties.map((difficulty) => ({
                label: difficulty.difficultyName,
                value: difficulty.id,
              })),
            ]}
            value={filterDifficultyId}
            onSelect={(value) => onDifficultyChange(Number(value))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-body-2 text-text-secondary" aria-live="polite">
          {t("questionPage.resultCount", {
            count: resultCount,
          })}
        </span>
        {hasFilterError && (
          <QueryErrorAlert
            className="w-full"
            message={t("questionPage.filterLoadError")}
            onRetry={onRetryFilterData}
            isRetrying={isRetryingFilterData}
          />
        )}
      </div>
    </AdminFilterPanel>
  );
}
