import { Button, Icon } from "@/components/atomic/atoms";
import { cn } from "@/utils/cn";

interface PaginationProps {
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
  const getVisiblePages = () => {
    const pages = [];
    const range = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn("flex items-center justify-between px-4 py-3", className)}
    >
      {/* Thông tin số trang */}
      <span className="text-helper-text text-text-secondary">
        Đang xem trang{" "}
        <span className="font-semibold text-text-primary">{currentPage}</span>{" "}
        trên {totalPages}
      </span>

      {/* Cụm điều hướng */}
      <div className="flex items-center gap-1.5">
        {/* Nút Previous */}
        <Button
          variant="text"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Icon name="chevronLeft" size={18} />
        </Button>

        {/* Các con số trang */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => {
            const isCurrent = currentPage === page;
            const isEllipsis = page === "...";

            return (
              <Button
                key={index}
                variant={isCurrent ? "contained" : "text"}
                color={isCurrent ? "primary" : "standard"}
                size="small"
                onClick={() => !isEllipsis && onPageChange(page as number)}
                disabled={isEllipsis}
                className="px-3"
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Nút Next */}
        <Button
          variant="text"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Icon name="chevronRight" size={18} />
        </Button>
      </div>
    </div>
  );
}
