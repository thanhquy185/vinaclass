import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Logo from "@/shared/components/ui/Logo/Logo";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useExamActions } from "@/features/assessments/hooks/useExamActions";
import { useExamMonitoring } from "@/features/assessments/hooks/useExamMonitoring";
import { useTranslation } from "react-i18next";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useExamAttemptSubmission } from "@/features/assessments/hooks/useExamAttemptSubmission";
import { useExamSessionState } from "@/features/assessments/hooks/useExamSessionState";
import { useExamQuestionPaging } from "@/features/assessments/hooks/useExamQuestionPaging";
import { ExamSessionSummary } from "@/features/assessments/components/exam/ExamSessionSummary";
import { ExamQuestionList } from "@/features/assessments/components/exam/ExamQuestionList";
import { ExamQuestionNavigation } from "@/features/assessments/components/exam/ExamQuestionNavigation";
import { ExamInfoNavigation } from "@/features/assessments/components/exam/ExamInfoNavigation";
import { ExamViolationModal } from "./ExamViolationModal";

export const ExamDoing = () => {
  const navigate = useNavigate();
  const { id: examRouteId } = useParams();
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);

  const {
    mode,
    currentExam,
    answers,
    updateAnswer: updateStoreAnswer,
    addViolation,
    finishExam,
    startExam,
    setFinalResult,
  } = useExamSessionStore();

  const { user } = useAuthStore();
  const { testData } = useExamDraftStore();
  const violationCount = currentExam?.examAttemptLog?.tabSwitchCount || 0;
  const finishHandlerRef = useRef<() => Promise<void>>(async () => {});
  const {
    updateAnswer: syncAnswerToApi,
    submitExam: apiSubmit,
    updateViolation,
    reviewExam,
  } = useExamActions();
  const { showWarning, showKicked, setShowWarning } = useExamMonitoring({
    configuration: testData?.examConfiguration,
    mode,
    attemptId: currentExam?.id,
    violationCount,
    onViolation: addViolation,
    updateViolation,
  });

  const { shuffledQuestions, timeLeft, isQuestionOrderReady } =
    useExamSessionState({
      currentExam,
      testData,
      mode,
      navigate,
      startExam,
      finishHandlerRef,
    });

  const { handleFinish } = useExamAttemptSubmission({
    currentExam,
    examRouteId,
    answers,
    mode,
    testData,
    shuffledQuestions,
    finishExam,
    setFinalResult,
    submitExam: apiSubmit,
    reviewExam,
    navigate,
  });
  useLayoutEffect(() => {
    finishHandlerRef.current = handleFinish;
  }, [handleFinish]);

  const handleAnswerChange = (questionId: number, answerId: number) => {
    updateStoreAnswer(questionId, answerId);

    if (currentExam?.id && mode === "STUDENT") {
      syncAnswerToApi({
        examAttemptId: currentExam.id,
        answers: [{ questionId, answerId }],
      });
    }
  };

  const hasUnansweredQuestions = useMemo(
    () =>
      shuffledQuestions.some(
        (question) =>
          answers[question.id] === undefined || answers[question.id] === null
      ),
    [answers, shuffledQuestions]
  );

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      showToast(t("examTaking.fullscreenError"), "error");
    }
  };

  const config = testData?.examConfiguration;
  const {
    currentPage,
    limitPerPage,
    canNavigateBack,
    currentQuestion,
    currentQuestionIndex,
    handleNextQuestion,
    handleSubmitConfirmation,
    handlePreviousQuestion,
    goToQuestion,
  } = useExamQuestionPaging({
    questions: shuffledQuestions,
    answers,
    configuration: config,
    hasUnansweredQuestions,
    onSubmit: handleFinish,
  });

  const canGoPrevious =
    currentQuestionIndex > 0 &&
    (canNavigateBack ||
      limitPerPage === -1 ||
      Math.floor((currentQuestionIndex - 1) / limitPerPage) === currentPage);
  const canGoNext = currentQuestionIndex < shuffledQuestions.length - 1;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden text-text-secondary">
      <header className="shrink-0 border-b border-other-outlined-border bg-background-paper">
        <div className="mx-auto flex w-full max-w-[1180px] items-center px-4 py-4 sm:px-6 lg:px-8">
          <Logo className="font-bold text-text-secondary" />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1480px]">
          <ExamSessionSummary
            examName={testData?.examName}
            studentName={user?.profile.fullName}
            isPreview={mode === "PREVIEW"}
            timeLeft={timeLeft}
            questionCount={testData?.questions?.length ?? 0}
            onToggleFullscreen={handleToggleFullscreen}
          />

          <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="order-last min-w-0 xl:order-first">
              <ExamQuestionList
                question={currentQuestion}
                answers={answers}
                questionIndex={currentQuestionIndex}
                totalQuestions={shuffledQuestions.length}
                onAnswerChange={handleAnswerChange}
              />

              <ExamQuestionNavigation
                isQuestionOrderReady={isQuestionOrderReady}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={shuffledQuestions.length}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                onPreviousQuestion={handlePreviousQuestion}
                onNextQuestion={handleNextQuestion}
                onSubmit={handleSubmitConfirmation}
              />
            </div>

            <ExamInfoNavigation
              exam={testData}
              questions={shuffledQuestions}
              answers={answers}
              currentPage={currentPage}
              limitPerPage={limitPerPage}
              currentQuestionIndex={currentQuestionIndex}
              canNavigateBack={canNavigateBack}
              onNavigateToQuestion={goToQuestion}
            />
          </div>
        </div>
      </main>

      {showKicked ? (
        <ExamViolationModal
          maxCount={testData?.examConfiguration?.tabSwitchLimit ?? 3}
          type="kicked"
          count={violationCount}
          onConfirm={handleFinish}
        />
      ) : showWarning ? (
        <ExamViolationModal
          maxCount={testData?.examConfiguration?.tabSwitchLimit ?? 3}
          type="warning"
          count={violationCount}
          onConfirm={() => setShowWarning(false)}
        />
      ) : null}
    </div>
  );
};
