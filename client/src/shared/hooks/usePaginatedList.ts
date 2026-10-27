import { useMemo } from "react";
import { usePaginationState } from "@/shared/hooks/usePaginationState";

interface UsePaginatedListResult<T> {
  currentPage: number;
  totalPages: number;
  pageItems: T[];
  setCurrentPage: (page: number) => void;
}

export function usePaginatedList<T>(
  items: readonly T[],
  pageSize: number
): UsePaginatedListResult<T> {
  const {
    currentPage,
    pageSize: safePageSize,
    totalPages,
    setCurrentPage,
  } = usePaginationState(items.length, pageSize);

  const pageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * safePageSize;
    return items.slice(startIndex, startIndex + safePageSize);
  }, [currentPage, items, safePageSize]);

  return {
    currentPage,
    totalPages,
    pageItems,
    setCurrentPage,
  };
}
