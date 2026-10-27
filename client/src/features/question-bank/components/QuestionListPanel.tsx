import { useTranslation } from "react-i18next";
import { Button, QueryErrorAlert } from "@/shared/components/ui";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import QuestionItem from "@/features/question-bank/components/QuestionItem";
import type { FunctionAction } from "@/features/authorization/hooks/useFunctionActions";
import type { Question, QuestionStatus } from "@/shared/types";

interface QuestionListPanelProps {
  selectedTab: QuestionStatus;
  isTeacher?: boolean;
  actions: FunctionAction[];
  canView: boolean;
  isPermissionLoading: boolean;
  isLoadingQuestions: boolean;
  isQuestionError: boolean;
  isFetchingQuestions: boolean;
  refetchQuestions: () => Promise<unknown>;
  filteredQuestions: Question[];
  paginatedQuestions: Question[];
  hasActiveFilters: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (question: Question) => void;
  onAddQuestionToBank: (question: Question) => void;
  onPublishQuestion: (question: Question) => void;
  onArchiveQuestion: (question: Question) => void;
  onRestoreQuestion: (question: Question) => void;
  onMoveToPrivateQuestion: (question: Question) => void;
}

export default function QuestionListPanel({
  selectedTab,
  isTeacher = false,
  actions,
  canView,
  isPermissionLoading,
  isLoadingQuestions,
  isQuestionError,
  isFetchingQuestions,
  refetchQuestions,
  filteredQuestions,
  paginatedQuestions,
  hasActiveFilters,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestionToBank,
  onPublishQuestion,
  onArchiveQuestion,
  onRestoreQuestion,
  onMoveToPrivateQuestion,
}: QuestionListPanelProps) {
  const { t } = useTranslation();

  const renderQuestionContent = () => {
    if (isPermissionLoading || isLoadingQuestions) {
      return (
        <div
          className={`p-10 text-center text-text-secondary ${isTeacher ? "rounded-3xl bg-background-paper shadow-[0_1px_3px_rgba(60,64,67,.12)]" : "rounded-md bg-background-body-background"}`}
        >
          {isPermissionLoading
            ? t("testPage.permissionLoading")
            : t("questionPage.loading")}
        </div>
      );
    }

    if (!canView) {
      return (
        <div
          className={`p-10 text-center text-text-secondary ${isTeacher ? "rounded-3xl bg-background-paper shadow-[0_1px_3px_rgba(60,64,67,.12)]" : "rounded-md bg-background-body-background"}`}
        >
          {t("questionPage.noViewPermission")}
        </div>
      );
    }

    if (isQuestionError && filteredQuestions.length === 0) return null;

    if (paginatedQuestions.length > 0) {
      return (
        <div className="flex min-w-0 flex-col gap-3" aria-live="polite">
          {paginatedQuestions.map((question) => (
            <QuestionItem
              key={question.id}
              data={question}
              onEdit={onEditQuestion}
              onDelete={onDeleteQuestion}
              onAddToBank={onAddQuestionToBank}
              onPublicQuestion={onPublishQuestion}
              onArchiveQuestion={onArchiveQuestion}
              onRestoreQuestion={onRestoreQuestion}
              onMoveToPrivateQuestion={onMoveToPrivateQuestion}
              tab={selectedTab}
              actions={actions}
              isTeacher={isTeacher}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        className={`border-2 border-dashed border-other-outlined-border px-4 py-16 text-center text-text-secondary ${isTeacher ? "rounded-3xl bg-background-paper shadow-[0_1px_3px_rgba(60,64,67,.12)]" : "rounded-md bg-background-body-background"}`}
      >
        <p>
          {hasActiveFilters
            ? t("questionPage.emptyFiltered")
            : t("questionPage.emptyByTab", {
                tab: t(`questionPage.tabs.${selectedTab}`),
              })}
        </p>
        {hasActiveFilters && (
          <Button
            variant="text"
            color="primary"
            className="mx-auto mt-2"
            onClick={onResetFilters}
          >
            {t("questionPage.clearFilters")}
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {isQuestionError && canView && (
        <QueryErrorAlert
          className="mb-4"
          message={t("questionPage.loadError")}
          onRetry={refetchQuestions}
          isRetrying={isFetchingQuestions}
        />
      )}

      {renderQuestionContent()}

      {canView && totalPages > 1 && (
        <div
          className={`py-2 ${isTeacher ? "rounded-3xl bg-background-paper shadow-[0_1px_3px_rgba(60,64,67,.12)]" : "rounded-md bg-background-body-background"}`}
        >
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
