import { usePaginationState } from "@/shared/hooks/usePaginationState";

interface UseTablePaginationResult {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export function useTablePagination(
  total: number,
  pageSize: number
): UseTablePaginationResult {
  const {
    currentPage,
    pageSize: safePageSize,
    total: safeTotal,
    setCurrentPage,
  } = usePaginationState(total, pageSize);

  return {
    currentPage,
    setCurrentPage,
    pagination: {
      current: currentPage,
      pageSize: safePageSize,
      total: safeTotal,
      onChange: setCurrentPage,
    },
  };
}
