import { Button, Empty, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { QueryErrorAlert } from "@/shared/components/ui";

export type TableColumn<T> = {
  title: string | ReactNode;
  key: keyof T | "actions" | "selection";
  id?: string;
  render?: (value: T[keyof T] | undefined, item: T) => ReactNode;
  headerRender?: () => ReactNode;
  className?: string;
  fixed?: boolean | "left" | "right";
  width?: number | string;
};

type TableAction = "detail" | "edit" | "remove";

type Props<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: keyof T | ((item: T) => string | number);
  hasColumnActions?: boolean;
  actionsColumnTitle?: ReactNode;
  actionsColumnFixed?: boolean | "left" | "right";
  actionsColumnWidth?: number | string;
  renderActions?: (item: T) => ReactNode;
  checkActions?: string[];
  hasView?: boolean;
  onAction?: (action: TableAction, item: T) => void;
  className?: string;
  getRowClassName?: (item: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: ReactNode;
  onRetry?: () => void | Promise<unknown>;
  emptyText?: ReactNode;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
};

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  hasColumnActions,
  actionsColumnTitle,
  actionsColumnFixed,
  actionsColumnWidth,
  renderActions,
  checkActions,
  hasView = true,
  onAction,
  className = "",
  getRowClassName,
  isLoading = false,
  isFetching,
  isError = false,
  errorMessage,
  onRetry,
  emptyText,
  pagination,
}: Props<T>) {
  const { t, i18n } = useTranslation("common");
  const tableColumns = useMemo<TableColumnsType<T>>(() => {
    const mappedColumns: TableColumnsType<T> = columns.map((column) => ({
      title: column.headerRender ? column.headerRender() : column.title,
      key: column.id ?? String(column.key),
      dataIndex:
        column.key === "actions" || column.key === "selection"
          ? undefined
          : (column.key as Exclude<keyof T, symbol>),
      className: column.className,
      fixed: column.fixed,
      width: column.width,
      render: (_value, item) => {
        const value =
          column.key === "actions" || column.key === "selection"
            ? undefined
            : item[column.key];

        return column.render
          ? column.render(value, item)
          : (value as ReactNode);
      },
    }));

    if (hasColumnActions) {
      mappedColumns.push({
        title: actionsColumnTitle ?? t("tableActions.header"),
        key: "actions",
        align: "center",
        fixed: actionsColumnFixed,
        width: actionsColumnWidth,
        render: (_value, item) => {
          if (renderActions) return renderActions(item);

          return (
            <div className="flex justify-center gap-1">
              {hasView && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => onAction?.("detail", item)}
                >
                  {t("tableActions.detail")}
                </Button>
              )}
              {(!checkActions || checkActions.includes("update")) && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => onAction?.("edit", item)}
                >
                  {t("tableActions.edit")}
                </Button>
              )}
              {(!checkActions || checkActions.includes("delete")) && (
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => onAction?.("remove", item)}
                >
                  {t("tableActions.remove")}
                </Button>
              )}
            </div>
          );
        },
      });
    }

    return mappedColumns;
  }, [
    checkActions,
    columns,
    actionsColumnFixed,
    actionsColumnTitle,
    actionsColumnWidth,
    hasColumnActions,
    hasView,
    onAction,
    renderActions,
    t,
  ]);

  const getRowKey = (item: T, index?: number) => {
    if (!rowKey) return index ?? 0;
    if (typeof rowKey === "function") return rowKey(item);
    return String(item[rowKey]);
  };

  const shouldShowTable = !isError || data.length > 0;

  return (
    <div className="w-full overflow-hidden rounded-xl bg-background-paper">
      {isError && (
        <QueryErrorAlert
          className="mb-3"
          message={errorMessage ?? t("tableActions.loadError")}
          onRetry={onRetry}
          isRetrying={isFetching ?? isLoading}
        />
      )}
      {shouldShowTable && (
        <Table<T>
          className={className}
          columns={tableColumns}
          dataSource={data}
          rowKey={getRowKey}
          loading={isLoading}
          rowClassName={(item) => getRowClassName?.(item) ?? ""}
          pagination={
            pagination
              ? {
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showTotal: (total, range) =>
                    t("pagination.showTotal", {
                      start: range[0].toLocaleString(i18n.language),
                      end: range[1].toLocaleString(i18n.language),
                      total: total.toLocaleString(i18n.language),
                    }),
                  onChange: pagination.onChange,
                  showSizeChanger: false,
                  hideOnSinglePage: true,
                }
              : false
          }
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: emptyText ?? (
              <Empty description={t("tableActions.noData")} />
            ),
          }}
        />
      )}
    </div>
  );
}
