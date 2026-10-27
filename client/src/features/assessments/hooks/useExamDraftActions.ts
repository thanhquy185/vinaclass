import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Exam, Question } from "@/shared/types";
import {
  useCreateExam,
  useUpdateExam,
} from "@/features/assessments/hooks/useExamMutations";
import { mapExamToCreatePayload } from "@/features/assessments/utils/exam";
import { TestFormValidate } from "@/features/assessments/utils/test-form.validate";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseExamDraftActionsOptions {
  testData: Partial<Exam> | null;
  examQuestions: Question[];
  userId?: number;
  examId?: string;
  isAddMode: boolean;
  navigate: NavigateFunction;
}

export function useExamDraftActions({
  testData,
  examQuestions,
  userId,
  examId,
  isAddMode,
  navigate,
}: UseExamDraftActionsOptions) {
  const { t } = useTranslation();
  const { mutate: createExam, isPending: isCreatingExam } = useCreateExam();
  const { mutate: updateExam, isPending: isUpdatingExam } = useUpdateExam();
  const { startLoading, stopLoading } = useLoadingStore();
  const showToast = useToastStore((state) => state.showToast);
  const [formError, setFormError] = useState<string | null>(null);

  const clearFormError = () => setFormError(null);

  const handleSave = () => {
    if (!testData) {
      setFormError("addQuestionTestPage.validation.examDataRequired");
      return;
    }

    if (examQuestions.length === 0) {
      setFormError("addQuestionTestPage.validation.questionsRequired");
      return;
    }

    const validationErrors = TestFormValidate.create({
      examName: testData.examName ?? "",
      startTime: testData.startTime ?? "",
      endTime: testData.endTime ?? "",
      durationMinutes: testData.durationMinutes ?? 0,
      subjectId: testData.subject?.id ?? testData.subjectId ?? 0,
      courseGroupIds: testData.courseGroups?.map((group) => group.id) ?? [],
      creatorId: testData.creatorId ?? userId ?? 0,
    });
    const firstValidationError = Object.values(validationErrors)[0];
    if (firstValidationError) {
      setFormError(firstValidationError);
      return;
    }

    const payload = mapExamToCreatePayload(testData);
    if (!payload) {
      setFormError("addQuestionTestPage.validation.payloadInvalid");
      return;
    }

    const totalScore = payload.questions.reduce(
      (sum, question) => sum + question.score,
      0
    );
    if (Math.abs(totalScore - 10) > 0.001) {
      setFormError("addQuestionTestPage.validation.totalScoreInvalid");
      return;
    }

    const resolvedExamId = testData.id ?? Number(examId);
    if (
      !isAddMode &&
      (!Number.isInteger(resolvedExamId) || resolvedExamId <= 0)
    ) {
      setFormError("addQuestionTestPage.validation.examIdRequired");
      return;
    }

    setFormError(null);
    startLoading(
      isAddMode
        ? t("addQuestionTestPage.loading.create")
        : t("addQuestionTestPage.loading.update")
    );

    if (isAddMode) {
      createExam(payload, {
        onSuccess: (response) => {
          navigate(`/tests/${response.data.id}`);
        },
        onError: () =>
          showToast(t("addQuestionTestPage.toast.saveError"), "error"),
        onSettled: () => stopLoading(),
      });
      return;
    }

    updateExam(
      { payload, id: resolvedExamId },
      {
        onSuccess: (response) => {
          showToast(t("addQuestionTestPage.toast.saveSuccess"), "success");
          navigate(`/tests/${response.data.id}`);
        },
        onError: () =>
          showToast(t("addQuestionTestPage.toast.saveError"), "error"),
        onSettled: () => stopLoading(),
      }
    );
  };

  return {
    formError,
    isSaving: isCreatingExam || isUpdatingExam,
    clearFormError,
    handleSave,
  };
}
