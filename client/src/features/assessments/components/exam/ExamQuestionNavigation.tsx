import { Button } from "@/shared/components/ui";
import { AdminPanel } from "@/shared/components/admin";
import { useTranslation } from "react-i18next";

interface ExamQuestionNavigationProps {
  isQuestionOrderReady: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onSubmit: () => void;
}

export function ExamQuestionNavigation({
  isQuestionOrderReady,
  currentQuestionIndex,
  totalQuestions,
  canGoPrevious,
  canGoNext,
  onPreviousQuestion,
  onNextQuestion,
  onSubmit,
}: ExamQuestionNavigationProps) {
  const { t } = useTranslation("common");

  return (
    <AdminPanel className="mb-28 mt-5 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <span className="text-caption text-text-disabled">
        {t("examTaking.questionIndex", {
          current: currentQuestionIndex + 1,
          total: totalQuestions,
        })}
      </span>

      <div className="ml-auto flex gap-3">
        {canGoPrevious && (
          <Button
            variant="outline"
            disabled={!isQuestionOrderReady}
            onClick={onPreviousQuestion}
          >
            {t("examTaking.previous")}
          </Button>
        )}
        {canGoNext ? (
          <Button
            color="primary"
            variant="contained"
            disabled={!isQuestionOrderReady}
            onClick={onNextQuestion}
          >
            {t("examTaking.next")}
          </Button>
        ) : (
          <Button
            color="primary"
            variant="contained"
            disabled={!isQuestionOrderReady}
            onClick={onSubmit}
          >
            {t("examTaking.submit")}
          </Button>
        )}
      </div>
    </AdminPanel>
  );
}
