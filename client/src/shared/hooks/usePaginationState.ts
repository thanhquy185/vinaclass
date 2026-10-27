import { useCallback, useEffect, useState } from "react";

interface UsePaginationStateResult {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

function normalizePositiveInteger(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) || 1 : 1;
}

export function usePaginationState(
  total: number,
  pageSize: number
): UsePaginationStateResult {
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;
  const safePageSize = normalizePositiveInteger(pageSize);
  const totalPages = Math.ceil(safeTotal / safePageSize);
  const lastPage = Math.max(1, totalPages);
  const [requestedPage, setRequestedPage] = useState(1);
  const currentPage = Math.min(Math.max(1, requestedPage), lastPage);

  useEffect(() => {
    setRequestedPage((page) => Math.min(Math.max(1, page), lastPage));
  }, [lastPage]);

  const setCurrentPage = useCallback(
    (page: number) => {
      const normalizedPage = Number.isFinite(page) ? Math.floor(page) : 1;
      setRequestedPage(Math.min(Math.max(1, normalizedPage), lastPage));
    },
    [lastPage]
  );

  return {
    currentPage,
    pageSize: safePageSize,
    total: safeTotal,
    totalPages,
    setCurrentPage,
  };
}
