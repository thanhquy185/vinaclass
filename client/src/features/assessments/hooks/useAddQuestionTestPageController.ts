import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useExamDetail } from "@/features/assessments/hooks/useExamQueries";
import { useDifficultyQueries } from "@/features/catalogs/hooks/useDifficultyQueries";
import {
  useQuestionsOfUser,
  useQuestionsPublic,
} from "@/features/question-bank/hooks/useQuestionQueries";
import { useExamDraftActions } from "@/features/assessments/hooks/useExamDraftActions";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import type { Question } from "@/shared/types";

export function useAddQuestionTestPageController() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);

  const isEditMode = pathname.includes("/edit");
  const isViewMode = pathname.includes("/view");
  const isAddMode = pathname.includes("/add");
  const isPersistedExamMode = isEditMode || isViewMode;
  const examId = id ? Number(id) : null;
  const isValidExamId =
    examId !== null && Number.isInteger(examId) && examId > 0;
  const testData = useExamDraftStore((state) => state.testData);
  const setTestData = useExamDraftStore((state) => state.setTestData);
  const hasMatchingDraft = testData?.id === examId;
  const shouldLoadExam =
    isPersistedExamMode && isValidExamId && (isViewMode || !hasMatchingDraft);
  const examQuery = useExamDetail(examId, {
    enabled: shouldLoadExam,
  });

  const isTeacher = roleCode === "TEACHER";
  const canLoadQuestions = Boolean(user?.id) && !isViewMode;
  const teacherQuestionQuery = useQuestionsOfUser(user?.id, {
    enabled: canLoadQuestions && isTeacher,
  });
  const publicQuestionQuery = useQuestionsPublic({
    enabled: canLoadQuestions && !isTeacher,
  });
  const questions = isTeacher
    ? teacherQuestionQuery.personalQuestions
    : publicQuestionQuery.publicQuestions;
  const isLoadingQuestions = isTeacher
    ? teacherQuestionQuery.isLoading
    : publicQuestionQuery.isLoading;
  const isFetchingQuestions = isTeacher
    ? teacherQuestionQuery.isFetching
    : publicQuestionQuery.isFetching;
  const isQuestionsError = isTeacher
    ? teacherQuestionQuery.isError
    : publicQuestionQuery.isError;
  const refetchQuestions = isTeacher
    ? teacherQuestionQuery.refetch
    : publicQuestionQuery.refetch;
  const validQuestions = questions.filter(
    (question) => question.status !== "archive",
  );
  const difficultyQuery = useDifficultyQueries();

  const shouldPreserveEditDraft = isEditMode && hasMatchingDraft;
  const examData = shouldPreserveEditDraft
    ? testData
    : isPersistedExamMode
      ? (examQuery.exam ?? null)
      : testData;

  useEffect(() => {
    if (examQuery.exam && (isViewMode || testData?.id !== examQuery.exam.id)) {
      setTestData(examQuery.exam);
    }
  }, [examQuery.exam, isViewMode, setTestData, testData?.id]);

  const addQuestion = useExamDraftStore((state) => state.addQuestion);
  const removeQuestion = useExamDraftStore((state) => state.removeQuestion);
  const moveQuestion = useExamDraftStore((state) => state.moveQuestion);
  const examQuestions = useMemo(
    () => examData?.questions || [],
    [examData?.questions],
  );

  const { formError, isSaving, clearFormError, handleSave } =
    useExamDraftActions({
      testData: examData,
      examQuestions,
      userId: user?.id,
      examId: id,
      isAddMode,
      navigate,
    });

  const selectedQuestionIds = useMemo(
    () => new Set(examQuestions.map((question) => question.id)),
    [examQuestions],
  );
  const difficultyCounts = useMemo(() => {
    const counts: Record<number, number> = {};

    examQuestions.forEach((question) => {
      const difficultyId = question.difficultyId ?? question.difficulty?.id;

      if (difficultyId === undefined || difficultyId === null) return;

      const normalizedDifficultyId = Number(difficultyId);
      if (!Number.isFinite(normalizedDifficultyId)) return;

      counts[normalizedDifficultyId] =
        (counts[normalizedDifficultyId] || 0) + 1;
    });

    return counts;
  }, [examQuestions]);
  const selectedQuestionCount = examQuestions.length;

  const handleBack = () => {
    if (id) {
      navigate(-1);
      return;
    }

    navigate("/tests/add", {
      state: { fromQuestions: true },
      replace: true,
    });
  };

  const handlePreview = () => {
    if (!examData?.questions?.length) return;

    setTestData(examData);
    const examSession = useExamSessionStore.getState();
    examSession.resetExam();
    examSession.setMode("PREVIEW");
    examSession.setPreviewReturnTo(`${pathname}${search}`);
    navigate(`/tests/${examData.id || "draft"}/take?mode=preview`);
  };

  const handleToggleQuestion = (question: Question, checked: boolean) => {
    if (checked) {
      addQuestion(question);
    } else {
      removeQuestion(question.id);
    }

    clearFormError();
  };

  return {
    isEditMode,
    isViewMode,
    isPersistedExamMode,
    isValidExamId,
    examData,
    isLoadingExam: isPersistedExamMode && !examData && examQuery.isLoading,
    isFetchingExam: examQuery.isFetching,
    isExamError: isPersistedExamMode && !examData && examQuery.isError,
    isExamNotFound:
      isPersistedExamMode &&
      isValidExamId &&
      !examData &&
      !examQuery.isLoading &&
      !examQuery.isError,
    refetchExam: examQuery.refetch,
    validQuestions,
    difficulties: difficultyQuery.difficulties,
    isLoadingQuestions,
    isFetchingQuestions,
    isQuestionsError,
    refetchQuestions,
    isLoadingDifficulties: difficultyQuery.isLoading,
    isFetchingDifficulties: difficultyQuery.isFetching,
    isDifficultiesError: difficultyQuery.isError,
    refetchDifficulties: difficultyQuery.refetch,
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
  };
}
