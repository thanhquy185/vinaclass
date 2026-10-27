import { useEffect, useState } from "react";
import type { TeacherAssignmentRemoval } from "@/features/teacher-assignments/types/teacherAssignment";
import {
  useDeleteTeacherAssignment,
  useSyncTeacherAssignments,
} from "@/features/teacher-assignments/hooks/useTeacherAssignmentMutations";
import {
  useTeacherAssignmentOverview,
  useTeacherAssignments,
} from "@/features/teacher-assignments/hooks/useTeacherAssignmentQueries";
import { useTeacherAssignmentActions } from "@/features/teacher-assignments/hooks/useTeacherAssignmentActions";
import type { AssignmentFilterCriteria } from "@/features/teacher-assignments/types/assignmentList";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";

const DEFAULT_PAGE_SIZE = 10;

export function useAssignmentPageController() {
  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isTeacher = roleKind === "TEACHER";
  const isAdmin = roleKind === "ADMIN" || roleKind === "CUSTOM";
  const permission = useFunctionActions("phan_cong");
  const canView = (isAdmin || isTeacher) && permission.hasAction("view");
  const canAssign = isAdmin && (
    permission.isPermissionNavigationEnabled
      ? permission.hasAction("assign")
      : permission.hasAction("assign") || permission.hasAction("update")
  );
  const canDelete = isAdmin && permission.hasAction("delete");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<AssignmentFilterCriteria>("teacher");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const defaultSearchBy = isTeacher ? "subject" : "teacher";
    setSearchBy(defaultSearchBy);
    setCurrentPage(1);
  }, [isAdmin, isTeacher]);

  const overviewQuery = useTeacherAssignmentOverview(
    {
      searchBy,
      searchTerm: searchTerm.trim(),
      page: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    canView && !permission.isLoading && !permission.isError,
  );
  const formAssignmentsQuery = useTeacherAssignments(
    canAssign && !permission.isLoading && !permission.isError,
  );
  const { syncAssignmentsAsync, isCreating } = useSyncTeacherAssignments();
  const { deleteAssignmentAsync } = useDeleteTeacherAssignment();

  const { handleSave, handleDelete } = useTeacherAssignmentActions({
    syncAssignments: syncAssignmentsAsync,
    deleteAssignment: deleteAssignmentAsync,
    onSaved: () => setIsModalOpen(false),
  });

  const assignments = formAssignmentsQuery.assignments;
  const groups = overviewQuery.overview?.groups ?? [];
  const stats = overviewQuery.overview?.stats ?? {
    assignmentCount: 0,
    teacherCount: 0,
    subjectCount: 0,
  };
  const apiPagination = overviewQuery.overview?.pagination;
  const pagination = {
    current: apiPagination?.currentPage ?? currentPage,
    pageSize: apiPagination?.pageSize ?? DEFAULT_PAGE_SIZE,
    total: apiPagination?.total ?? 0,
    onChange: (page: number) => setCurrentPage(page),
  };

  const handleSearchByChange = (value: AssignmentFilterCriteria) => {
    setSearchBy(value);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchBy(isTeacher ? "subject" : "teacher");
    setCurrentPage(1);
  };

  const handleRemoveAssignment = (assignment: TeacherAssignmentRemoval) => {
    if (!canDelete) return;
    handleDelete(assignment);
  };

  const retryLoading = () => {
    void overviewQuery.refetch();
  };

  return {
    isAdmin,
    isTeacher,
    canView,
    canAssign,
    canDelete,
    isPermissionLoading: permission.isLoading,
    isPermissionFetching: permission.isFetching,
    isPermissionError: permission.isError,
    refetchPermissions: permission.refetch,
    groups,
    stats,
    assignments,
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching,
    isError: overviewQuery.isError,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    isCreating,
    searchBy,
    searchTerm,
    handleSearchByChange,
    handleSearchTermChange,
    resetFilters,
    pagination,
    handleSave,
    handleRemoveAssignment,
    retryLoading,
  };
}
