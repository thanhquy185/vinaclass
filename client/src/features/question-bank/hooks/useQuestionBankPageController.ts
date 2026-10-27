import { useEffect, useState } from "react";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useDifficultyQueries } from "@/features/catalogs/hooks/useDifficultyQueries";
import { useRoleScopedSubjectQueries } from "@/features/catalogs/hooks/useRoleScopedSubjectQueries";
import { useQuestionBankActions } from "@/features/question-bank/hooks/useQuestionBankActions";
import { useQuestionBankList } from "@/features/question-bank/hooks/useQuestionBankList";
import { useQuestionBank } from "@/features/question-bank/hooks/useQuestionQueries";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedUserRoleCode } from "@/shared/utils/role";
import type { Question } from "@/shared/types";

interface QuestionModalState {
  open: boolean;
  mode: "create" | "update" | "none";
  selectedItem: Question | null;
}

const createClosedModalState = (): QuestionModalState => ({
  open: false,
  mode: "none",
  selectedItem: null,
});

export function useQuestionBankPageController() {
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const permission = useFunctionActions("cau_hoi");
  const canView = roleCode !== "STUDENT" && permission.hasAction("view");
  const canCreate = permission.hasAction("create");

  const questionList = useQuestionBankList();
  const questionBankQuery = useQuestionBank(
    {
      status: questionList.selectedTab,
      keyword: questionList.searchQuery,
      searchBy: questionList.searchBy,
      subjectId: questionList.filterSubjectId,
      chapterId: questionList.filterChapterId,
      difficultyId: questionList.filterDifficultyId,
      sortOrder: questionList.sortOrder,
      page: questionList.currentPage,
      perPage: questionList.pageSize,
    },
    { enabled: canView }
  );
  const bankData = questionBankQuery.data;
  const questions = bankData?.questions ?? [];
  const totalPages = Math.max(1, bankData?.pagination.lastPage ?? 1);
  const pagination = {
    currentPage: bankData?.pagination.currentPage ?? questionList.currentPage,
    total: bankData?.pagination.total ?? 0,
    totalPages,
  };

  useEffect(() => {
    document
      .getElementById("question-list-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [questionList.currentPage, questionList.selectedTab]);

  useEffect(() => {
    if (!bankData) return;
    if (questionList.currentPage > totalPages) {
      questionList.setCurrentPage(totalPages);
    }
  }, [
    bankData,
    questionList.currentPage,
    questionList.setCurrentPage,
    totalPages,
  ]);

  const difficultyQuery = useDifficultyQueries({ enabled: canView });
  const subjectQuery = useRoleScopedSubjectQueries({ enabled: canView });

  const [modalState, setModalState] = useState<QuestionModalState>(
    createClosedModalState
  );

  const closeModal = () => setModalState(createClosedModalState());
  const openCreateModal = () =>
    setModalState({ open: true, mode: "create", selectedItem: null });
  const openUpdateModal = (question: Question) =>
    setModalState({ open: true, mode: "update", selectedItem: question });

  const questionActions = useQuestionBankActions({
    creatorId: user?.id,
    onQuestionSaved: closeModal,
    onQuestionCreated: () => {
      closeModal();
      questionList.handleTabSelect("private");
    },
  });

  const hasFilterError = difficultyQuery.isError || subjectQuery.isError;
  const isFetchingFilterData =
    difficultyQuery.isFetching || subjectQuery.isFetching;

  const retryFilterData = async () => {
    const retries: Promise<unknown>[] = [];
    if (difficultyQuery.isError) retries.push(difficultyQuery.refetch());
    if (subjectQuery.isError) retries.push(subjectQuery.refetch());

    await Promise.all(retries);
  };

  return {
    actions: permission.actions,
    canView,
    canCreate,
    isPermissionLoading: permission.isLoading,
    isPermissionFetching: permission.isFetching,
    isPermissionError: permission.isError,
    refetchPermissions: permission.refetch,
    ...questionList,
    filteredQuestions: questions,
    paginatedQuestions: questions,
    totalPages,
    filteredQuestionCount: pagination.total,
    stats: bankData?.stats ?? {
      total: 0,
      public: 0,
      private: 0,
      archive: 0,
    },
    pagination,
    subjects: subjectQuery.subjects,
    difficulties: difficultyQuery.difficulties,
    isLoadingSubjects: subjectQuery.isLoading,
    isLoadingDifficulties: difficultyQuery.isLoading,
    hasFilterError,
    isFetchingFilterData,
    retryFilterData,
    isLoadingQuestions: questionBankQuery.isLoading,
    isQuestionError: questionBankQuery.isError,
    isFetchingQuestions: questionBankQuery.isFetching,
    refetchQuestions: questionBankQuery.refetch,
    isProcessing: questionActions.isProcessing,
    modalState,
    closeModal,
    openCreateModal,
    openUpdateModal,
    handleCreate: questionActions.handleCreate,
    handleUpdate: questionActions.handleUpdate,
    onDeleteQuestion: (question: Question) =>
      questionActions.handleDelete(question.id),
    onAddQuestionToBank: (question: Question) =>
      questionActions.handleCopyToBank(question.id),
    onPublishQuestion: (question: Question) =>
      questionActions.handlePublicQuestion(question.id),
    onArchiveQuestion: (question: Question) =>
      questionActions.handleArchiveQuestion(question.id),
    onRestoreQuestion: (question: Question) =>
      questionActions.handleRestoreQuestion(question.id),
    onMoveToPrivateQuestion: (question: Question) =>
      questionActions.handleMoveToPrivateQuestion(question.id),
  };
}
