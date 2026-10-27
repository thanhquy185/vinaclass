import type {
  Exam,
  ExamAttempt,
  ExamResponseData,
  Question,
} from "@/shared/types";
import type { useExamActions } from "@/features/assessments/hooks/useExamActions";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  getApiErrorDetails,
  getApiErrorMessage,
} from "@/shared/utils/apiError";
import { useRef } from "react";
import type { NavigateFunction } from "react-router-dom";
import { useTranslation } from "react-i18next";

type ExamActions = ReturnType<typeof useExamActions>;

interface UseExamAttemptSubmissionOptions {
  currentExam: ExamAttempt | null;
  examRouteId?: string;
  answers: Record<number, number | null>;
  mode: "STUDENT" | "PREVIEW";
  testData: Partial<Exam> | null;
  shuffledQuestions: Question[];
  finishExam: (questions: Question[]) => void;
  setFinalResult: (result: ExamResponseData) => void;
  submitExam: ExamActions["submitExam"];
  reviewExam: ExamActions["reviewExam"];
  navigate: NavigateFunction;
}

export function useExamAttemptSubmission({
  currentExam,
  examRouteId,
  answers,
  mode,
  testData,
  shuffledQuestions,
  finishExam,
  setFinalResult,
  submitExam,
  reviewExam,
  navigate,
}: UseExamAttemptSubmissionOptions) {
  const { t } = useTranslation("common");
  const { startLoading, stopLoading } = useLoadingStore();
  const showToast = useToastStore((state) => state.showToast);
  const isFinishing = useRef(false);
  const resultExamId = testData?.id ?? examRouteId;

  const handleFinish = async () => {
    if (!currentExam?.id || isFinishing.current) return;

    isFinishing.current = true;
    startLoading();
    try {
      const formattedAnswers = (testData?.questions ?? []).map((question) => ({
        questionId: question.id,
        answerId: answers[question.id] ?? null,
      }));

      if (mode === "STUDENT") {
        const response = await submitExam({
          examAttemptId: currentExam.id,
          answers: formattedAnswers,
        });

        if (response.success) {
          setFinalResult(response.data);

          if (document.fullscreenElement) {
            await document.exitFullscreen().catch(() => {});
          }

          navigate(`/tests/${resultExamId}/take/result/${currentExam.id}`, {
            replace: true,
          });
        } else {
          showToast(response.message || t("examTaking.submitError"), "error");
        }
      } else {
        finishExam(shuffledQuestions);

        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }

        navigate(`/tests/${resultExamId}/take/result/${currentExam.id}`, {
          replace: true,
        });
      }
    } catch (error) {
      if (mode === "STUDENT" && getApiErrorDetails(error).status === 409) {
        try {
          const response = await reviewExam(currentExam.id);
          if (response.success) {
            setFinalResult(response.data);
            if (document.fullscreenElement) {
              await document.exitFullscreen().catch(() => {});
            }
            navigate(`/tests/${resultExamId}/take/result/${currentExam.id}`, {
              replace: true,
            });
            return;
          }
          showToast(response.message || t("examTaking.submitError"), "error");
          return;
        } catch (reviewError) {
          showToast(
            getApiErrorMessage(reviewError) ?? t("examTaking.submitError"),
            "error",
          );
          return;
        }
      }
      showToast(
        getApiErrorMessage(error) ?? t("examTaking.submitError"),
        "error",
      );
    } finally {
      stopLoading();
      isFinishing.current = false;
    }
  };

  return { handleFinish };
}
