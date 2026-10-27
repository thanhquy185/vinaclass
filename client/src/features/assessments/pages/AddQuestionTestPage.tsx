import { Alert, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon, QueryErrorAlert } from "@/shared/components/ui";
import { QuestionSelectionPanel } from "@/features/assessments/components/exam/QuestionSelectionPanel";
import { SelectedExamQuestionList } from "@/features/assessments/components/exam/SelectedExamQuestionList";
import { TestInfoSummary } from "@/features/assessments/components/exam/TestInfoSummary";
import { useAddQuestionTestPageController } from "@/features/assessments/hooks/useAddQuestionTestPageController";
import { isNamedExamDifficulty } from "@/features/assessments/utils/isNamedExamDifficulty";

export default function AddQuestionTestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isEditMode,
    isViewMode,
    isPersistedExamMode,
    isValidExamId,
    examData,
    isLoadingExam,
    isFetchingExam,
    isExamError,
    isExamNotFound,
    refetchExam,
    validQuestions,
    difficulties,
    isLoadingQuestions,
    isFetchingQuestions,
    isQuestionsError,
    refetchQuestions,
    isLoadingDifficulties,
    isFetchingDifficulties,
    isDifficultiesError,
    refetchDifficulties,
    examQuestions,
    selectedQuestionIds,
    difficultyCounts,
    selectedQuestionCount,
    formError,
    isSaving,
    handleSave,
    handleBack,
    handlePreview,
    handleToggleQuestion,
    moveQuestion,
    removeQuestion,
  } = useAddQuestionTestPageController();
  const namedDifficulties = difficulties.filter(isNamedExamDifficulty);
  const otherDifficultyCount = difficulties
    .filter((difficulty) => !isNamedExamDifficulty(difficulty))
    .reduce(
      (count, difficulty) => count + (difficultyCounts[difficulty.id] || 0),
      0,
    );

  if (isPersistedExamMode && !isValidExamId) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background-body-background p-5">
        <Alert
          type="error"
          showIcon
          message={t("testFormPage.notFound")}
          action={
            <Button
              variant="outline"
              size="small"
              onClick={() => navigate("/tests")}
            >
              {t("testFormPage.actions.backToList")}
            </Button>
          }
        />
      </div>
    );
  }

  if (isPersistedExamMode && !examData && isLoadingExam) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background-body-background">
        <Spin tip={t("tableActions.loading")} />
      </div>
    );
  }

  if (isPersistedExamMode && !examData && isExamError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background-body-background p-5">
        <QueryErrorAlert
          message={t("testFormPage.loadError")}
          retryLabel={t("testFormPage.actions.retry")}
          onRetry={refetchExam}
          isRetrying={isFetchingExam}
        />
      </div>
    );
  }

  if (isPersistedExamMode && !examData && isExamNotFound) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background-body-background p-5">
        <Alert
          type="warning"
          showIcon
          message={t("testFormPage.notFound")}
          action={
            <Button
              variant="outline"
              size="small"
              onClick={() => navigate("/tests")}
            >
              {t("testFormPage.actions.backToList")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-dvh min-h-0 flex-col bg-background-body">
      <div className="flex shrink-0 justify-center bg-other-tooltip px-4 py-2">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Button
            variant="contained"
            color="standard"
            className="w-fit justify-self-start whitespace-nowrap"
            onClick={handleBack}
          >
            <Icon name="out" />
            {t("addQuestionTestPage.actions.back")}
          </Button>
          <strong className="text-body-1 text-center font-semibold text-primary-contrast">
            {isEditMode
              ? t("addQuestionTestPage.title.edit")
              : isViewMode
                ? t("addQuestionTestPage.title.view")
                : t("addQuestionTestPage.title.create")}
          </strong>
          <div className="flex justify-end">
            <Button
              variant="contained"
              color="standard"
              disabled={examQuestions.length === 0}
              onClick={handlePreview}
            >
              <Icon name="eye" />
              {t("addQuestionTestPage.actions.preview")}
            </Button>
          </div>
        </div>
      </div>

      {(isQuestionsError || isDifficultiesError) && (
        <div className="flex flex-col gap-2 px-5 pt-3">
          {isQuestionsError && (
            <QueryErrorAlert
              message={t("addQuestionTestPage.errors.questionBank")}
              onRetry={refetchQuestions}
              isRetrying={isFetchingQuestions}
            />
          )}
          {isDifficultiesError && (
            <QueryErrorAlert
              message={t("addQuestionTestPage.errors.difficulties")}
              onRetry={refetchDifficulties}
              isRetrying={isFetchingDifficulties}
            />
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col items-stretch gap-4 overflow-y-auto bg-background-body p-4 sm:p-5 xl:flex-row">
        {!isViewMode && (
          <QuestionSelectionPanel
            questions={validQuestions}
            difficulties={difficulties}
            isLoadingQuestions={isLoadingQuestions}
            isLoadingDifficulties={isLoadingDifficulties}
            selectedQuestionIds={selectedQuestionIds}
            isViewMode={isViewMode}
            onToggleQuestion={handleToggleQuestion}
          />
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-md bg-background-body-background">
          <div className="grid grid-cols-1 items-start gap-3 border-b border-other-outlined-border px-4 py-3 sm:px-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-text-secondary">
              <div className="flex shrink-0 items-center gap-2">
                <span>{t("addQuestionTestPage.count.label")}</span>
                <span className="inline-flex h-10 items-center rounded-md bg-action-selected px-2">
                  <span className="text-body-2 inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-primary-main px-2 font-semibold text-primary-contrast">
                    {selectedQuestionCount}
                  </span>
                </span>
              </div>
              <div className="flex min-w-0 flex-wrap gap-2">
                {namedDifficulties.map((difficulty) => {
                  const count = difficultyCounts[difficulty.id] || 0;

                  return (
                    <div
                      key={difficulty.id}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-action-selected px-2 transition-all"
                    >
                      <span className="text-body-2 whitespace-nowrap">
                        {difficulty.difficultyName}
                      </span>
                      <span className="text-body-2 inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-primary-main px-2 font-semibold text-primary-contrast">
                        {count}
                      </span>
                    </div>
                  );
                })}
                {otherDifficultyCount > 0 && (
                  <div className="inline-flex h-10 items-center gap-2 rounded-md bg-action-selected px-2">
                    <span className="text-body-2 whitespace-nowrap">
                      {t("addQuestionTestPage.count.other")}
                    </span>
                    <span className="text-body-2 inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-primary-main px-2 font-semibold text-primary-contrast">
                      {otherDifficultyCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isViewMode && (
              <Button
                variant="contained"
                color="primary"
                className="w-fit justify-self-end"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Icon name="clipboard" />
                {isEditMode
                  ? t("addQuestionTestPage.actions.saveEdit")
                  : t("addQuestionTestPage.actions.addTest")}
              </Button>
            )}
          </div>

          {formError && (
            <div className="px-5 pt-3">
              <Alert type="error" showIcon message={t(formError)} />
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <div className="flex justify-center border-b border-other-outlined-border pb-4">
              <TestInfoSummary data={examData} />
            </div>
            <SelectedExamQuestionList
              questions={examQuestions}
              isViewMode={isViewMode}
              onMoveQuestion={moveQuestion}
              onRemoveQuestion={removeQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
