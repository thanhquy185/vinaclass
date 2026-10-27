import { useTranslation } from "react-i18next";
import { Button, QueryErrorAlert } from "@/shared/components/ui";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import ExamListItem from "@/features/assessments/components/ExamListItem";
import type { Exam } from "@/shared/types";

interface ExamListContentProps {
  canView: boolean;
  actions: string[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetchExams: () => Promise<unknown>;
  filteredExams: Exam[];
  currentExams: Exam[];
  hasActiveFilters: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

export default function ExamListContent({
  canView,
  actions,
  isLoading,
  isFetching,
  isError,
  refetchExams,
  filteredExams,
  currentExams,
  hasActiveFilters,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters,
}: ExamListContentProps) {
  const { t } = useTranslation();

  const renderExamList = () => {
    if (isLoading) {
      return (
        <div className="rounded-lg bg-background-body-background p-10 text-center text-text-secondary">
          {t("testPage.loading")}
        </div>
      );
    }

    if (!canView) {
      return (
        <div className="rounded-lg bg-background-body-background p-10 text-center text-text-secondary">
          {t("testPage.noViewPermission")}
        </div>
      );
    }

    if (isError && filteredExams.length === 0) return null;

    if (currentExams.length > 0) {
      return (
        <div className="flex flex-col gap-3" aria-live="polite">
          {currentExams.map((exam) => (
            <ExamListItem key={exam.id} data={exam} actions={actions} />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border-2 border-dashed border-other-outlined-border bg-background-body-background p-10 text-center text-text-secondary">
        <p>{t("testPage.empty")}</p>
        {hasActiveFilters && (
          <Button
            variant="text"
            color="primary"
            className="mx-auto mt-2"
            onClick={onResetFilters}
          >
            {t("testPage.clearFilters")}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {isError && (
        <QueryErrorAlert
          className="mb-4"
          message={t("testPage.loadError")}
          onRetry={refetchExams}
          isRetrying={isFetching}
        />
      )}

      {renderExamList()}

      {canView && totalPages > 1 && (
        <div className="rounded-lg bg-background-body-background py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
