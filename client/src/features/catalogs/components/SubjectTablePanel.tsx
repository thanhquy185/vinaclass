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
import type { Subject } from "@/shared/types";

type SubjectRowAction = "detail" | "edit" | "remove";

interface SubjectTablePanelProps {
  subjects: Subject[];
  actions: FunctionAction[];
  canUpdateChapters: boolean;
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
  onAction: (action: SubjectRowAction, subject: Subject) => void;
}

export function SubjectTablePanel({
  subjects,
  actions,
  canUpdateChapters,
  isLoading,
  isFetching,
  isError,
  searchTerm,
  pagination,
  onRetry,
  onAdd,
  onAction,
}: SubjectTablePanelProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const canUpdate = actions.includes("update") || canUpdateChapters;
  const columns = useMemo<TableColumn<Subject>[]>(
    () => [
      {
        title: t("subjectPage.table.id"),
        key: "id",
        fixed: "left",
        width: 100,
        render: (_value, subject) => (
          <span className="font-mono text-sm font-medium text-text-secondary">
            #{String(subject.id).padStart(3, "0")}
          </span>
        ),
      },
      {
        title: t("subjectPage.table.code"),
        key: "subjectCode",
        width: 150,
        render: (_value, subject) => (
          <span className="font-mono text-sm font-semibold text-text-primary">
            {subject.subjectCode}
          </span>
        ),
      },
      {
        title: t("subjectPage.table.name"),
        key: "subjectName",
        width: 280,
        render: (_value, subject) => (
          <span className="block min-w-0 truncate font-semibold text-text-primary">
            {subject.subjectName}
          </span>
        ),
      },
      {
        title: t("subjectPage.table.chapters"),
        key: "chaptersCount",
        width: 130,
        render: (_value, subject) => (
          <span className="inline-flex rounded-full bg-action-hover px-2.5 py-1 text-sm font-medium text-text-primary">
            {(subject.chaptersCount ?? subject.chapters?.length ?? 0).toLocaleString(
              locale,
            )}
          </span>
        ),
      },
      {
        title: t("subjectPage.table.courseGroups"),
        key: "courseGroupsCount",
        width: 160,
        render: (_value, subject) => (
          <span className="inline-flex rounded-full bg-action-hover px-2.5 py-1 text-sm font-medium text-text-primary">
            {(subject.courseGroupsCount ?? 0).toLocaleString(locale)}
          </span>
        ),
      },
      {
        title: t("subjectPage.table.credits"),
        key: "creditCount",
        width: 110,
        render: (_value, subject) => subject.creditCount,
      },
      {
        title: t("subjectPage.table.theoryPeriods"),
        key: "theoryHours",
        width: 150,
        render: (_value, subject) => subject.theoryHours ?? 0,
      },
      {
        title: t("subjectPage.table.practicePeriods"),
        key: "practiceHours",
        width: 160,
        render: (_value, subject) => subject.practiceHours ?? 0,
      },
    ],
    [locale, t],
  );

  return (
    <AdminTablePanel
      title={t("subjectPage.tableTitle")}
      description={t("subjectPage.tableDescription")}
      createAction={
        actions.includes("create")
          ? { label: t("subjectPage.addNew"), onClick: onAdd }
          : undefined
      }
    >
      <DataTable
        columns={columns}
        data={subjects}
        rowKey="id"
        hasColumnActions={
          actions.includes("view") || canUpdate || actions.includes("delete")
        }
        actionsColumnTitle=""
        actionsColumnFixed="right"
        actionsColumnWidth={144}
        checkActions={actions}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={t("subjectPage.loadFailed")}
        onRetry={onRetry}
        pagination={pagination}
        className="user-management-table"
        emptyText={
          searchTerm.trim()
            ? t("subjectPage.empty.filtered")
            : t("subjectPage.empty.list")
        }
        renderActions={(subject) => (
          <div className="flex justify-center gap-1.5">
            {actions.includes("view") && (
              <Button
                isButtonIcon
                size="medium"
                tooltip={t("tableActions.detail")}
                aria-label={t("tableActions.detail")}
                className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                onClick={() => onAction("detail", subject)}
              >
                <Icon
                  name="eye"
                  size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.view}
                />
              </Button>
            )}
            {canUpdate && (
              <Button
                isButtonIcon
                size="medium"
                tooltip={t("tableActions.edit")}
                aria-label={t("tableActions.edit")}
                className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                onClick={() => onAction("edit", subject)}
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
                tooltip={t("tableActions.remove")}
                aria-label={t("tableActions.remove")}
                className={ADMIN_TABLE_ROW_ACTION_BUTTON_CLASS}
                onClick={() => onAction("remove", subject)}
              >
                <Icon
                  name="remove"
                  size={ADMIN_TABLE_ROW_ACTION_ICON_SIZE.remove}
                />
              </Button>
            )}
          </div>
        )}
      />
    </AdminTablePanel>
  );
}
