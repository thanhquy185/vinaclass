import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useDifficultyLevelActions } from "@/features/catalogs/hooks/useDifficultyLevelActions";
import { useDifficultyMutations } from "@/features/catalogs/hooks/useDifficultyMutations";
import { useDifficultyQueries } from "@/features/catalogs/hooks/useDifficultyQueries";
import { useTablePagination } from "@/shared/hooks/useTablePagination";
import type { Difficulty, DifficultyRequest } from "@/shared/types";
import { useToastStore } from "@/shared/stores/useToastStore";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

const ITEMS_PER_PAGE = 10;

type DifficultyDialogMode = "create" | "view" | "update" | "delete" | "none";

interface DifficultyModalState {
  open: boolean;
  mode: DifficultyDialogMode;
  difficulty: Difficulty | null;
}

const createClosedModalState = (): DifficultyModalState => ({
  open: false,
  mode: "none",
  difficulty: null,
});

type DifficultyRowAction = "detail" | "edit" | "remove";
type DifficultySearchCriterion = "name" | "id";

export function useDifficultyLevelPageController() {
  const { t } = useTranslation("common");
  const permission = useFunctionActions("do_kho");
  const showToast = useToastStore((state) => state.showToast);
  const canView = permission.hasAction("view");
  const difficultyQuery = useDifficultyQueries({
    enabled: canView && !permission.isLoading && !permission.isError,
  });
  const difficultyMutations = useDifficultyMutations();
  const [modalState, setModalState] = useState<DifficultyModalState>(
    createClosedModalState,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<DifficultySearchCriterion>("name");

  const filteredDifficulties = useMemo(() => {
    const normalizedTerm = normalizeSearchText(searchTerm.trim());
    if (!normalizedTerm) return difficultyQuery.difficulties;

    return difficultyQuery.difficulties.filter((difficulty) =>
      normalizeSearchText(
        searchBy === "name"
          ? difficulty.difficultyName
          : `#${difficulty.id} ${difficulty.id}`,
      ).includes(normalizedTerm),
    );
  }, [difficultyQuery.difficulties, searchBy, searchTerm]);

  const paginationState = useTablePagination(
    filteredDifficulties.length,
    ITEMS_PER_PAGE,
  );

  const closeModal = () => setModalState(createClosedModalState());
  const openCreateModal = () =>
    setModalState({ open: true, mode: "create", difficulty: null });

  const difficultyActions = useDifficultyLevelActions({
    createDifficulty: difficultyMutations.createDifficulty,
    updateDifficulty: difficultyMutations.updateDifficulty,
    deleteDifficulty: difficultyMutations.deleteDifficulty,
    onSaved: closeModal,
  });

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    paginationState.setCurrentPage(1);
  };
  const handleSearchByChange = (value: DifficultySearchCriterion) => {
    setSearchBy(value);
    paginationState.setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchBy("name");
    paginationState.setCurrentPage(1);
  };

  const handleAction = (
    action: DifficultyRowAction,
    difficulty: Difficulty,
  ) => {
    if (action === "detail") {
      if (!permission.hasAction("view")) return;
      setModalState({ open: true, mode: "view", difficulty });
      return;
    }

    if (action === "edit") {
      if (!permission.hasAction("update")) return;
      setModalState({ open: true, mode: "update", difficulty });
      return;
    }

    if (!permission.hasAction("delete")) return;
    if ((difficulty.questionsCount ?? 0) > 0) {
      showToast(t("difficultyLevelPage.cannotDeleteInUse"), "warning");
      return;
    }
    setModalState({ open: true, mode: "delete", difficulty });
  };

  const handleCreate = (data: DifficultyRequest) =>
    difficultyActions.handleCreate(data);
  const handleUpdate = (id: number, data: DifficultyRequest) =>
    difficultyActions.handleUpdate(id, data);
  const handleDelete = () => {
    if (modalState.difficulty) {
      return difficultyActions.handleDelete(modalState.difficulty.id);
    }
    return Promise.resolve(false);
  };

  return {
    actions: permission.actions,
    canView,
    isPermissionLoading: permission.isLoading,
    isPermissionFetching: permission.isFetching,
    isPermissionError: permission.isError,
    refetchPermissions: permission.refetch,
    difficulties: difficultyQuery.difficulties,
    filteredDifficulties,
    isLoading: difficultyQuery.isLoading,
    isFetching: difficultyQuery.isFetching,
    isError: difficultyQuery.isError,
    retryDifficulties: difficultyQuery.refetch,
    isProcessing: difficultyMutations.isProcessing,
    searchTerm,
    searchBy,
    handleSearchTermChange,
    handleSearchByChange,
    resetFilters,
    pagination: paginationState.pagination,
    modalState,
    closeModal,
    openCreateModal,
    handleAction,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
