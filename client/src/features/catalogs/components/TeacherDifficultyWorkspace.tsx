import { Button, Empty, Input, Select, Spin } from "antd";
import {
  ArrowUpDown,
  BookOpenCheck,
  Eye,
  Gauge,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { QueryErrorAlert } from "@/shared/components/ui";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import type { Difficulty } from "@/shared/types";
import type { FunctionAction } from "@/features/authorization/hooks/useFunctionActions";

type DifficultySearchBy = "name" | "id";
type DifficultyRowAction = "detail" | "edit" | "remove";

interface TeacherDifficultyWorkspaceProps {
  difficulties: Difficulty[];
  filteredDifficulties: Difficulty[];
  actions: FunctionAction[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  searchTerm: string;
  searchBy: DifficultySearchBy;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSearchTermChange: (value: string) => void;
  onSearchByChange: (value: DifficultySearchBy) => void;
  onReset: () => void;
  onRetry: () => void | Promise<unknown>;
  onAdd: () => void;
  onAction: (action: DifficultyRowAction, difficulty: Difficulty) => void;
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export function TeacherDifficultyWorkspace({
  difficulties,
  filteredDifficulties,
  actions,
  isLoading,
  isFetching,
  isError,
  searchTerm,
  searchBy,
  pagination,
  onSearchTermChange,
  onSearchByChange,
  onReset,
  onRetry,
  onAdd,
  onAction,
}: TeacherDifficultyWorkspaceProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const inUseCount = difficulties.filter(
    (difficulty) => (difficulty.questionsCount ?? 0) > 0
  ).length;
  const questionCount = difficulties.reduce(
    (total, difficulty) => total + (difficulty.questionsCount ?? 0),
    0
  );
  const pageDifficulties = filteredDifficulties.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );
  const searchByLabel = t("difficultyLevelPage.teacher.searchByCriteria");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-4 px-1 pt-1">
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-text-primary">
            {t("difficultyLevelPage.teacher.title")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("difficultyLevelPage.teacher.description")}
          </p>
        </div>
        <div className="max-w-sm rounded-2xl bg-background-paper px-4 py-3 text-sm leading-6 text-text-secondary shadow-[0_1px_3px_rgba(60,64,67,.12)]">
          <Gauge
            size={16}
            className="mr-2 inline text-primary-main"
            aria-hidden="true"
          />
          {t("difficultyLevelPage.teacher.scopeHint")}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <TeacherStat
          icon={<Gauge size={19} aria-hidden="true" />}
          label={t("difficultyLevelPage.stats.total")}
          value={difficulties.length}
          locale={locale}
        />
        <TeacherStat
          icon={<ArrowUpDown size={19} aria-hidden="true" />}
          label={t("difficultyLevelPage.stats.inUse")}
          value={inUseCount}
          locale={locale}
        />
        <TeacherStat
          icon={<BookOpenCheck size={19} aria-hidden="true" />}
          label={t("difficultyLevelPage.stats.questions")}
          value={questionCount}
          locale={locale}
        />
      </section>

      <section className="rounded-3xl bg-background-paper p-4 shadow-[0_1px_3px_rgba(60,64,67,.12)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-normal text-text-primary">
              {t("difficultyLevelPage.teacher.listTitle")}
            </h2>
            <span className="rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main">
              {t("difficultyLevelPage.teacher.resultCount", {
                count: filteredDifficulties.length,
              })}
            </span>
          </div>
          {actions.includes("create") && (
            <Button
              type="primary"
              icon={<Plus size={17} />}
              className="!rounded-full !shadow-none"
              onClick={onAdd}
            >
              {t("difficultyLevelPage.addNew")}
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-background-body-background p-3 sm:flex-row sm:items-center">
          <label className="shrink-0 text-sm font-medium text-text-secondary">
            {searchByLabel}
          </label>
          <Select
            aria-label={searchByLabel}
            value={searchBy}
            className="min-w-40 sm:w-44"
            options={[
              {
                value: "name",
                label: t("difficultyLevelPage.searchBy.name"),
              },
              {
                value: "id",
                label: t("difficultyLevelPage.searchBy.id"),
              },
            ]}
            onChange={onSearchByChange}
          />
          <Input
            allowClear
            aria-label={t("difficultyLevelPage.searchPlaceholder")}
            prefix={<Search size={17} className="text-text-disabled" />}
            placeholder={t(
              searchBy === "name"
                ? "difficultyLevelPage.searchBy.namePlaceholder"
                : "difficultyLevelPage.searchBy.idPlaceholder"
            )}
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="min-w-0 flex-1"
          />
          <Button
            aria-label={t("difficultyLevelPage.resetFilters")}
            title={t("difficultyLevelPage.resetFilters")}
            icon={<RotateCcw size={16} />}
            disabled={!searchTerm && searchBy === "name"}
            onClick={onReset}
          />
        </div>

        {isError && (
          <QueryErrorAlert
            className="mt-4"
            message={t("difficultyLevelPage.loadFailed")}
            retryLabel={t("difficultyLevelPage.retry")}
            onRetry={onRetry}
            isRetrying={isFetching}
          />
        )}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : isError ? null : filteredDifficulties.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pageDifficulties.map((difficulty) => (
              <article
                key={difficulty.id}
                className="flex min-h-48 flex-col justify-between rounded-2xl border border-other-outlined-border bg-background-paper p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(60,64,67,.16)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
                    <Gauge size={21} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-background-body-background px-2.5 py-1 text-xs font-medium text-text-secondary">
                    #{String(difficulty.id).padStart(3, "0")}
                  </span>
                </div>
                <div className="mt-5 min-w-0">
                  <h3 className="truncate text-lg font-medium text-text-primary">
                    {difficulty.difficultyName}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                    <BookOpenCheck size={16} aria-hidden="true" />
                    {t("difficultyLevelPage.teacher.questionCount", {
                      count: difficulty.questionsCount ?? 0,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-text-disabled">
                    {t("difficultyLevelPage.table.createdAt")}:{" "}
                    {formatDate(difficulty.createdAt, locale)}
                  </p>
                </div>
                <div className="mt-3 flex justify-end gap-1 border-t border-other-divider pt-2">
                  {actions.includes("view") && (
                    <TeacherActionButton
                      label={t("tableActions.detail")}
                      onClick={() => onAction("detail", difficulty)}
                    >
                      <Eye size={17} aria-hidden="true" />
                    </TeacherActionButton>
                  )}
                  {actions.includes("update") && (
                    <TeacherActionButton
                      label={t("tableActions.edit")}
                      onClick={() => onAction("edit", difficulty)}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </TeacherActionButton>
                  )}
                  {actions.includes("delete") && (
                    <TeacherActionButton
                      label={t("tableActions.remove")}
                      disabled={(difficulty.questionsCount ?? 0) > 0}
                      onClick={() => onAction("remove", difficulty)}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </TeacherActionButton>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            className="my-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t(
              searchTerm.trim()
                ? "difficultyLevelPage.empty.filtered"
                : "difficultyLevelPage.empty.list"
            )}
          />
        )}

        {!isLoading && !isError && filteredDifficulties.length > 0 && (
          <Pagination
            currentPage={pagination.current}
            totalPages={Math.ceil(pagination.total / pagination.pageSize)}
            onPageChange={(page) =>
              pagination.onChange(page, pagination.pageSize)
            }
          />
        )}
      </section>
    </div>
  );
}

function TeacherStat({
  icon,
  label,
  value,
  locale,
}: {
  icon: ReactNode;
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

function TeacherActionButton({
  children,
  label,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="text"
      aria-label={label}
      title={label}
      disabled={disabled}
      icon={children}
      className="!flex !h-9 !w-9 !items-center !justify-center !rounded-full !text-text-secondary hover:!bg-action-hover hover:!text-primary-main"
      onClick={onClick}
    />
  );
}
