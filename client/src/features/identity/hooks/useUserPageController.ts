import { useEffect, useMemo, useState } from "react";
import type { User } from "@/features/identity/types/identity";
import {
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useUpdateUserLock,
  useUpdateUser,
} from "@/features/identity/hooks/useUserMutations";
import {
  useAssignableUserRoles,
  useUser,
} from "@/features/identity/hooks/useUserQueries";
import { useUserActions } from "@/features/identity/hooks/useUserActions";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useTablePagination } from "@/shared/hooks/useTablePagination";
import { useUserTableColumns } from "@/features/identity/hooks/useUserTableColumns";
import { useTranslation } from "react-i18next";
import {
  filterUsers,
  type UserSearchCriterion,
} from "@/features/identity/utils/userList";

type UserModalState =
  | { open: false; mode: "none" }
  | { open: true; mode: "create" | "view" | "update" | "delete" };

const ITEMS_PER_PAGE = 10;

export function useUserPageController() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [statusUser, setStatusUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const { createUserAsync, isCreating } = useCreateUser();
  const { updateUserAsync, isUpdating } = useUpdateUser();
  const { updateUserLockAsync, isUpdatingUserLock } = useUpdateUserLock();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<UserSearchCriterion>("fullName");
  const [filterRole, setFilterRole] = useState<number>(0);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { deleteUserAsync, isDeleting } = useDeleteUser();
  const { resetPasswordAsync, isResetting } = useResetUserPassword();

  const {
    actions,
    hasAction,
    isLoading: isPermissionLoading,
    isFetching: isPermissionFetching,
    isError: isPermissionError,
    refetch: refetchPermissions,
  } = useFunctionActions("nguoi_dung");
  const canViewUsers = hasAction("view");
  const canViewRoles = hasAction("create") || hasAction("update");
  const {
    users,
    isLoading,
    isError,
    refetch: refetchUsers,
  } = useUser(canViewUsers && !isPermissionLoading);
  const {
    roles,
    isLoading: isRolesLoading,
    isFetching: isRolesFetching,
    isError: isRolesError,
    refetch: refetchRoles,
  } = useAssignableUserRoles(canViewUsers && !isPermissionLoading);
  const hasActiveRoles = roles.some((role) => !role.isDeleted);
  const isRoleCatalogUnavailable =
    canViewRoles && (isRolesLoading || isRolesError || !hasActiveRoles);
  const filteredUsers = useMemo(
    () =>
      filterUsers({
        users,
        roles,
        searchTerm,
        searchBy,
        filterRole,
        sortDirection,
      }),
    [filterRole, roles, searchBy, searchTerm, sortDirection, users]
  );
  const hasActiveFilters = searchTerm.trim().length > 0 || filterRole !== 0;
  const [modalState, setModalState] = useState<UserModalState>({
    open: false,
    mode: "none",
  });

  const closeModal = () => {
    setModalState({ open: false, mode: "none" });
    setEditingUser(null);
  };
  const closePasswordDialog = () => setPasswordUser(null);
  const openPasswordDialog = (user: User) => setPasswordUser(user);
  const openCreateModal = () => setModalState({ open: true, mode: "create" });
  const openUpdateModal = (user: User) => {
    setModalState({ open: true, mode: "update" });
    setEditingUser(user);
  };
  const openDetailsModal = (user: User) => {
    setModalState({ open: true, mode: "view" });
    setEditingUser(user);
  };

  const handleOpenAdd = () => {
    if (isRoleCatalogUnavailable) return;
    setEditingUser(null);
    openCreateModal();
  };

  const {
    handleCreate: createUser,
    handleUpdate: updateUser,
    handleDelete: deleteUser,
    handleResetPassword: resetPassword,
    handleToggleLock: updateUserLock,
  } = useUserActions({
    createUser: createUserAsync,
    updateUser: updateUserAsync,
    updateUserLock: updateUserLockAsync,
    deleteUser: deleteUserAsync,
    resetUserPassword: resetPasswordAsync,
    closeModal,
    closePasswordDialog,
  });

  const columns = useUserTableColumns(roles);
  const openStatusDialog = (user: User) => setStatusUser(user);
  const closeStatusDialog = () => setStatusUser(null);
  const confirmStatusUpdate = async () => {
    if (!statusUser) return;
    const didUpdate = await updateUserLock(statusUser);
    if (didUpdate) closeStatusDialog();
  };

  const handleUserAction = (
    action: "detail" | "edit" | "remove",
    user: User
  ) => {
    switch (action) {
      case "detail":
        openDetailsModal(user);
        break;
      case "edit":
        if (isRoleCatalogUnavailable) {
          showToast(t("userPage.roleCatalogUnavailable"), "warning");
          return;
        }
        openUpdateModal(user);
        break;
      case "remove":
        setEditingUser(user);
        setModalState({ open: true, mode: "delete" });
        break;
      default:
        break;
    }
  };

  const { setCurrentPage, pagination } = useTablePagination(
    filteredUsers.length,
    ITEMS_PER_PAGE
  );

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  const handleSearchByChange = (value: UserSearchCriterion) => {
    setSearchBy(value);
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setSearchBy("fullName");
    setFilterRole(0);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchBy, searchTerm, setCurrentPage]);

  return {
    t,
    actions,
    users,
    roles,
    filteredUsers,
    columns,
    isLoading,
    isError,
    isPermissionLoading,
    isPermissionFetching,
    isPermissionError,
    canViewUsers,
    canViewRoles,
    isRolesLoading,
    isRolesFetching,
    isRolesError,
    hasActiveRoles,
    isRoleCatalogUnavailable,
    hasActiveFilters,
    searchTerm,
    searchBy,
    filterRole,
    sortDirection,
    handleSearchTermChange,
    handleSearchByChange,
    setFilterRole,
    setSortDirection,
    resetFilters,
    modalState,
    editingUser,
    statusUser,
    passwordUser,
    isSaving: isCreating || isUpdating || isUpdatingUserLock,
    isUpdating: isUpdating || isUpdatingUserLock,
    isDeleting,
    isResetting,
    currentUserId,
    pagination,
    handleOpenAdd,
    handleUserAction,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    openPasswordDialog,
    closePasswordDialog,
    openStatusDialog,
    closeStatusDialog,
    confirmStatusUpdate,
    closeModal,
    refetchPermissions,
    refetchRoles,
    refetchUsers,
  };
}
