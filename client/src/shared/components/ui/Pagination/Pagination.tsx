import { Pagination as AntPagination } from "antd";
import { cn } from "@/shared/utils/cn";
import { useTranslation } from "react-i18next";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn("flex items-center justify-between px-4 py-3", className)}
    >
      {/* Current page information */}
      <span className="text-helper-text text-text-secondary">
        {t("pagination.pageLabel", { currentPage })}{" "}
        <span className="font-semibold text-text-primary">{currentPage}</span>{" "}
        {t("pagination.pageOf", { totalPages })} {totalPages}
      </span>

      <AntPagination
        current={currentPage}
        total={totalPages}
        pageSize={1}
        onChange={onPageChange}
        showSizeChanger={false}
        hideOnSinglePage
        showTitle={false}
      />
    </div>
  );
}
