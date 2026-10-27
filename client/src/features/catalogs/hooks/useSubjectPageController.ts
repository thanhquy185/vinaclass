import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useUpdateSubjectChapters } from "@/features/catalogs/hooks/useChapterMutations";
import { useSubjectActions } from "@/features/catalogs/hooks/useSubjectActions";
import { useSubjectMutations } from "@/features/catalogs/hooks/useSubjectMutations";
import { useSubjectQueries } from "@/features/catalogs/hooks/useSubjectQueries";
import { useTablePagination } from "@/shared/hooks/useTablePagination";
import type {
  ChapterListRequest,
  Subject,
  SubjectRequest,
  SubjectUpdateRequest,
} from "@/shared/types";
import { useToastStore } from "@/shared/stores/useToastStore";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

const ITEMS_PER_PAGE = 10;

export type SubjectDialogMode = "create" | "view" | "update" | "delete";

interface SubjectModalState {
  open: boolean;
  mode: SubjectDialogMode | "none";
  subject: Subject | null;
}

const CLOSED_MODAL_STATE: SubjectModalState = {
  open: false,
  mode: "none",
  subject: null,
};

type SubjectRowAction = "detail" | "edit" | "remove";
type SubjectSearchCriterion = "name" | "code";

export function useSubjectPageController() {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const subjectPermission = useFunctionActions("mon_hoc");
  const chapterPermission = useFunctionActions("chuong");
  const canView = subjectPermission.hasAction("view");
  const canUpdateSubject = subjectPermission.hasAction("update");
  const canCreateChapters = chapterPermission.hasAction("create");
  const canUpdateChapters = chapterPermission.hasAction("update");

  const subjectQuery = useSubjectQueries({
    enabled:
      canView && !subjectPermission.isLoading && !subjectPermission.isError,
  });
  const subjectMutations = useSubjectMutations();
  const chapterMutation = useUpdateSubjectChapters();
  const [modalState, setModalState] = useState<SubjectModalState>(
    CLOSED_MODAL_STATE,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<SubjectSearchCriterion>("name");

  const filteredSubjects = useMemo(() => {
    const term = normalizeSearchText(searchTerm.trim());
    if (!term) return subjectQuery.subjects;

    return subjectQuery.subjects.filter((subject) =>
      normalizeSearchText(
        searchBy === "name" ? subject.subjectName : subject.subjectCode,
      ).includes(term),
    );
  }, [searchBy, searchTerm, subjectQuery.subjects]);

  const paginationState = useTablePagination(
    filteredSubjects.length,
    ITEMS_PER_PAGE,
  );

  const actions = useSubjectActions({
    createSubject: subjectMutations.createSubject,
    updateSubject: subjectMutations.updateSubject,
    deleteSubject: subjectMutations.deleteSubject,
    updateSubjectChapters: chapterMutation.updateSubjectChapters,
  });

  const openCreateModal = () =>
    setModalState({ open: true, mode: "create", subject: null });
  const closeModal = () => setModalState(CLOSED_MODAL_STATE);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    paginationState.setCurrentPage(1);
  };
  const handleSearchByChange = (value: SubjectSearchCriterion) => {
    setSearchBy(value);
    paginationState.setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchBy("name");
    paginationState.setCurrentPage(1);
  };

  const handleAction = (action: SubjectRowAction, subject: Subject) => {
    if (action === "detail") {
      if (!subjectPermission.hasAction("view")) return;
      setModalState({ open: true, mode: "view", subject });
      return;
    }

    if (action === "edit") {
      if (!canUpdateSubject && !canUpdateChapters) return;
      setModalState({ open: true, mode: "update", subject });
      return;
    }

    if (!subjectPermission.hasAction("delete")) return;
    setModalState({ open: true, mode: "delete", subject });
  };

  const handleCreate = async (data: SubjectRequest) => {
    if (!subjectPermission.hasAction("create")) return false;
    return actions.handleCreate(data);
  };

  const handleUpdate = async (
    subjectId: number,
    data: SubjectUpdateRequest,
  ) => {
    if (!subjectPermission.hasAction("update")) return false;
    return actions.handleUpdate(subjectId, data);
  };

  const handleSaveChapters = async (
    subjectId: number,
    data: ChapterListRequest,
  ) => {
    if (!chapterPermission.hasAction("update")) {
      showToast(t("subjectPage.chapters.noUpdatePermission"), "error");
      return null;
    }
    return actions.handleSaveChapters(subjectId, data);
  };

  const handleDelete = async () => {
    if (!subjectPermission.hasAction("delete") || !modalState.subject) {
      return false;
    }
    return actions.handleDelete(modalState.subject.id);
  };

  return {
    actions: subjectPermission.actions,
    canView,
    canUpdateSubject,
    canCreateChapters,
    canUpdateChapters,
    isPermissionLoading: subjectPermission.isLoading,
    isPermissionFetching: subjectPermission.isFetching,
    isPermissionError: subjectPermission.isError,
    refetchPermissions: subjectPermission.refetch,
    subjects: subjectQuery.subjects,
    filteredSubjects,
    isLoading: subjectQuery.isLoading,
    isFetching: subjectQuery.isFetching,
    isError: subjectQuery.isError,
    retrySubjects: subjectQuery.refetch,
    isSaving: subjectMutations.isProcessing,
    isSavingChapters: chapterMutation.isUpdating,
    searchTerm,
    searchBy,
    handleSearchChange,
    handleSearchByChange,
    resetFilters,
    pagination: paginationState.pagination,
    modalState,
    openCreateModal,
    closeModal,
    handleAction,
    handleCreate,
    handleUpdate,
    handleSaveChapters,
    handleDelete,
  };
}
