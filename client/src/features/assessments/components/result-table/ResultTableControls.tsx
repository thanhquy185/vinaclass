import { Button, Icon } from "@/shared/components/ui";
import { AdminPanel, AdminSearchField } from "@/shared/components/admin";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type {
  AttemptStatusFilter,
  ResultSearchCriterion,
  ResultSortOrder,
  ResultViewMode,
} from "@/features/assessments/utils/buildResultTableData";
import { useTranslation } from "react-i18next";

interface ResultTableControlsProps {
  viewMode: ResultViewMode;
  sortOrder: ResultSortOrder;
  attemptStatusFilter: AttemptStatusFilter;
  searchBy: ResultSearchCriterion;
  searchTerm: string;
  canExportScores: boolean;
  hasActiveFilters: boolean;
  onAttemptStatusFilterChange: (filter: AttemptStatusFilter) => void;
  onSearchByChange: (criterion: ResultSearchCriterion) => void;
  onSearchTermChange: (searchTerm: string) => void;
  onSortOrderChange: (sortOrder: ResultSortOrder) => void;
  onViewModeChange: (viewMode: ResultViewMode) => void;
  onResetFilters: () => void;
  onExportScores: () => void;
}

export default function ResultTableControls({
  viewMode,
  sortOrder,
  attemptStatusFilter,
  searchBy,
  searchTerm,
  canExportScores,
  hasActiveFilters,
  onAttemptStatusFilterChange,
  onSearchByChange,
  onSearchTermChange,
  onSortOrderChange,
  onViewModeChange,
  onResetFilters,
  onExportScores,
}: ResultTableControlsProps) {
  const { t } = useTranslation("common");

  const viewModes: { id: ResultViewMode; label: string }[] = [
    { id: "user", label: t("resultPage.viewModes.user") },
    { id: "question", label: t("resultPage.viewModes.question") },
    { id: "difficulty", label: t("resultPage.viewModes.difficulty") },
  ];

  return (
    <AdminPanel className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="shrink-0 text-sm font-medium text-text-secondary">
              {t("resultPage.viewModes.label")}
            </span>
            <div
              role="group"
              aria-label={t("resultPage.viewModes.label")}
              className="inline-flex h-11 max-w-full flex-wrap items-center gap-1 rounded-lg bg-background-body-background p-1"
            >
              {viewModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={viewMode === mode.id}
                  className={`h-9 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 sm:px-4 ${
                    viewMode === mode.id
                      ? "bg-primary-background text-primary-main"
                      : "text-text-secondary hover:bg-background-paper"
                  }`}
                  onClick={() => onViewModeChange(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <Button
              variant="contained"
              color="primary"
              size="medium"
              className="!h-11 !w-fit !shrink-0 !rounded-lg"
              onClick={onExportScores}
              disabled={!canExportScores}
            >
              <Icon name="document" size={18} />
              {t("resultPage.actions.exportScores")}
            </Button>
            <Button
              variant="outline"
              size="medium"
              className="!h-11 !shrink-0 !rounded-lg px-3"
              disabled={!hasActiveFilters}
              onClick={onResetFilters}
            >
              <Icon name="refresh" size={17} />
              {t("resultPage.filters.reset")}
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)] xl:grid-cols-[minmax(0,1fr)_260px_240px]">
          <AdminSearchField<ResultSearchCriterion>
            label={t("resultPage.search.label")}
            className="min-w-0 md:col-span-1"
            criteriaLabel={t("common.searchByCriteria")}
            criteria={[
              {
                label: t("resultPage.search.criteria.studentId"),
                value: "studentId",
                placeholder: t("resultPage.search.placeholders.studentId"),
              },
              {
                label: t("resultPage.search.criteria.fullName"),
                value: "fullName",
                placeholder: t("resultPage.search.placeholders.fullName"),
              },
            ]}
            searchBy={searchBy}
            searchTerm={searchTerm}
            onSearchByChange={onSearchByChange}
            onSearchTermChange={onSearchTermChange}
            disabled={viewMode !== "user"}
          />

          <SelectField
            label={t("resultPage.filters.statusLabel")}
            placeholder={t("resultPage.filters.statusPlaceholder")}
            className="!w-full md:col-span-1"
            options={[
              { label: t("resultPage.filters.statuses.all"), value: "all" },
              {
                label: t("resultPage.filters.statuses.submitted"),
                value: "SUBMITTED",
              },
              {
                label: t("resultPage.filters.statuses.inProgress"),
                value: "IN_PROGRESS",
              },
              {
                label: t("resultPage.filters.statuses.notJoined"),
                value: "NOT_JOINED",
              },
            ]}
            value={attemptStatusFilter}
            onSelect={(value) =>
              onAttemptStatusFilterChange(value as AttemptStatusFilter)
            }
            disabled={viewMode !== "user"}
          />

          <SelectField
            label={t("resultPage.sort.label")}
            placeholder={t("resultPage.sort.label")}
            className="!w-full md:col-span-2 xl:col-span-1"
            options={[
              { label: t("resultPage.sort.default"), value: "none" },
              { label: t("resultPage.sort.ascending"), value: "asc" },
              { label: t("resultPage.sort.descending"), value: "desc" },
            ]}
            value={sortOrder ?? "none"}
            onSelect={(value) =>
              onSortOrderChange(
                value === "none" ? null : (value as ResultSortOrder),
              )
            }
          />
        </div>
      </div>
    </AdminPanel>
  );
}
