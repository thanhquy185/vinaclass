import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import type { ExamConfiguration, Question } from "@/shared/types";

interface UseExamQuestionPagingOptions {
  questions: Question[];
  answers: Record<number, number | null>;
  configuration?: Partial<ExamConfiguration> | null;
  hasUnansweredQuestions: boolean;
  onSubmit: () => void | Promise<void>;
}

export function useExamQuestionPaging({
  questions,
  answers,
  configuration,
  hasUnansweredQuestions,
  onSubmit,
}: UseExamQuestionPagingOptions) {
  const { t } = useTranslation("common");
  const openConfirm = useConfirmation();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const configuredLimit = Number(configuration?.limitQuestionsPerPage ?? -1);
  const limitPerPage = configuredLimit > 0 ? configuredLimit : -1;
  const currentQuestionIndex = Math.min(
    selectedQuestionIndex,
    Math.max(questions.length - 1, 0)
  );
  const currentQuestion = questions[currentQuestionIndex];
  const currentPage =
    limitPerPage === -1 ? 0 : Math.floor(currentQuestionIndex / limitPerPage);
  const canNavigateBack =
    configuration?.allowBackLastQuestion === true ||
    Number(configuration?.allowBackLastQuestion ?? 1) === 1;

  const unansweredOnCurrentPage = useMemo(() => {
    if (limitPerPage === -1) return false;
    const pageStart = currentPage * limitPerPage;
    return questions
      .slice(pageStart, pageStart + limitPerPage)
      .some((question) => answers[question.id] == null);
  }, [answers, currentPage, limitPerPage, questions]);

  const setQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;

      const targetPage =
        limitPerPage === -1 ? 0 : Math.floor(index / limitPerPage);
      if (!canNavigateBack && targetPage < currentPage) return;
      if (!canNavigateBack && targetPage > currentPage + 1) return;

      const moveToNextPage = targetPage > currentPage;
      if (!canNavigateBack && moveToNextPage && unansweredOnCurrentPage) {
        openConfirm({
          title: t("examTaking.incomplete.title"),
          message: t("examTaking.incomplete.continueMessage"),
          type: "warning",
          confirmLabel: t("examTaking.incomplete.continue"),
          cancelLabel: t("examTaking.incomplete.stay"),
          onConfirm: () => setSelectedQuestionIndex(index),
        });
        return;
      }

      setSelectedQuestionIndex(index);
    },
    [
      canNavigateBack,
      currentPage,
      limitPerPage,
      openConfirm,
      questions.length,
      t,
      unansweredOnCurrentPage,
    ]
  );

  const handlePreviousQuestion = useCallback(() => {
    setQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, setQuestion]);

  const handleNextQuestion = useCallback(() => {
    setQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, setQuestion]);

  const handleSubmitConfirmation = useCallback(() => {
    openConfirm({
      title: hasUnansweredQuestions
        ? t("examTaking.incomplete.title")
        : t("examTaking.submission.completeTitle"),
      message: hasUnansweredQuestions
        ? t("examTaking.incomplete.submitMessage")
        : t("examTaking.submission.completeMessage"),
      type: hasUnansweredQuestions ? "warning" : "info",
      confirmLabel: hasUnansweredQuestions
        ? t("examTaking.submission.submitNow")
        : t("examTaking.submission.confirm"),
      cancelLabel: t("examTaking.submission.review"),
      onConfirm: onSubmit,
    });
  }, [hasUnansweredQuestions, onSubmit, openConfirm, t]);

  return {
    currentQuestion,
    currentQuestionIndex,
    currentPage,
    limitPerPage,
    canNavigateBack,
    handlePreviousQuestion,
    handleNextQuestion,
    handleSubmitConfirmation,
    goToQuestion: setQuestion,
  };
}
