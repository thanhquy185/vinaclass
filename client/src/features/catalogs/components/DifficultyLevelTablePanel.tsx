import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FunctionAction } from "@/features/authorization/hooks/useFunctionActions";
import DataTable, { type TableColumn } from "@/shared/components/DataTable";
import {
  AdminTablePanel,
  ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS,
  ADMIN_TABLE_ROW_ACTION_ICON_SIZE,
} from "@/shared/components/admin";
import { Button, Icon } from "@/shared/components/ui";
import type { Difficulty } from "@/shared/types";

type DifficultyRowAction = "detail" | "edit" | "remove";

interface DifficultyLevelTablePanelProps {
  difficulties: Difficulty[];
  actions: FunctionAction[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  searchTerm: string;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
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

export function DifficultyLevelTablePanel({
  difficulties,
  actions,
  isLoading,
  isFetching,
  isError,
  searchTerm,
  pagination,
  onRetry,
  onAdd,
  onAction,
}: DifficultyLevelTablePanelProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const columns = useMemo<TableColumn<Difficulty>[]>(
    () => [
      {
        title: t("difficultyLevelPage.table.id"),
        key: "id",
        fixed: "left",
        width: 110,
        render: (_value, difficulty) => (
          <span className="font-mono text-sm font-medium text-text-secondary">
            #{String(difficulty.id).padStart(3, "0")}
          </span>
        ),
      },
      {
        title: t("difficultyLevelPage.table.name"),
        key: "difficultyName",
        width: 280,
        render: (_value, difficulty) => (
          <span className="block min-w-0 truncate font-semibold text-text-primary">
            {difficulty.difficultyName}
          </span>
        ),
      },
      {
        title: t("difficultyLevelPage.table.questionCount"),
        key: "questionsCount",
        width: 180,
        render: (_value, difficulty) => (
          <span className="inline-flex rounded-full bg-action-hover px-2.5 py-1 text-sm font-medium text-text-primary">
            {(difficulty.questionsCount ?? 0).toLocaleString(locale)}
          </span>
        ),
      },
      {
        title: t("difficultyLevelPage.table.createdAt"),
        key: "createdAt",
        width: 180,
        render: (_value, difficulty) =>
          formatDate(difficulty.createdAt, locale),
      },
    ],
    [locale, t],
  );

  return (
    <AdminTablePanel
      title={t("difficultyLevelPage.tableTitle")}
      description={t("difficultyLevelPage.tableDescription")}
      createAction={
        actions.includes("create")
          ? { label: t("difficultyLevelPage.addNew"), onClick: onAdd }
          : undefined
      }
    >
      <DataTable
        columns={columns}
        data={difficulties}
        rowKey="id"
        hasColumnActions={
          actions.includes("view") ||
          actions.includes("update") ||
          actions.includes("delete")
        }
        actionsColumnTitle=""
        actionsColumnFixed="right"
        actionsColumnWidth={144}
        checkActions={actions}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={t("difficultyLevelPage.loadFailed")}
        onRetry={onRetry}
        pagination={pagination}
        className="user-management-table"
        emptyText={
          searchTerm.trim()
            ? t("difficultyLevelPage.empty.filtered")
            : t("difficultyLevelPage.empty.list")
        }
        renderActions={(difficulty) => {
          const isInUse = (difficulty.questionsCount ?? 0) > 0;
          const deleteTooltip = isInUse
            ? t("difficultyLevelPage.cannotDeleteInUse")
            : t("tableActions.remove");

          return (
            <div className="flex justify-center gap-1.5">
              {actions.includes("view") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.detail")}
                  aria-label={t("tableActions.detail")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("detail", difficulty)}
                >
                  <Icon
                    name="eye"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.view}
                  />
                </Button>
              )}
              {actions.includes("update") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={t("tableActions.edit")}
                  aria-label={t("tableActions.edit")}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  onClick={() => onAction("edit", difficulty)}
                >
                  <Icon
                    name="edit"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.edit}
                  />
                </Button>
              )}
              {actions.includes("delete") && (
                <Button
                  isButtonIcon
                  size="medium"
                  tooltip={deleteTooltip}
                  aria-label={deleteTooltip}
                  className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                  disabled={isInUse}
                  onClick={() => onAction("remove", difficulty)}
                >
                  <Icon
                    name="remove"
                    size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.remove}
                  />
                </Button>
              )}
            </div>
          );
        }}
      />
    </AdminTablePanel>
  );
}
