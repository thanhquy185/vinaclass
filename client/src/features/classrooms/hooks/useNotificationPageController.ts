import { useEffect, useMemo, useState } from "react";
import { useFunctionActions } from "@/features/authorization/hooks/useFunctionActions";
import { useNotifications } from "@/features/classrooms/hooks/useNotifications";
import { useNotificationActions } from "@/features/classrooms/hooks/useNotificationActions";
import type { NotificationResponse } from "@/features/classrooms/types/classrooms";
import {
  filterNotifications,
  type NotificationSearchCriterion,
  type NotificationStatusFilter,
} from "@/features/classrooms/utils/filterNotifications";
import { useTablePagination } from "@/shared/hooks/useTablePagination";

type NotificationModalMode = "create" | "view" | "update" | "none";

interface NotificationModalState {
  open: boolean;
  mode: NotificationModalMode;
  selectedItem: NotificationResponse | null;
}

const NOTIFICATIONS_PER_PAGE = 10;

const createClosedModalState = (): NotificationModalState => ({
  open: false,
  mode: "none",
  selectedItem: null,
});

export function useNotificationPageController() {
  const {
    actions,
    hasAction,
    isPermissionNavigationEnabled,
    isLoading: isPermissionLoading,
    isFetching: isPermissionFetching,
    isError: isPermissionError,
    refetch: refetchPermissions,
  } = useFunctionActions("thong_bao");
  const canView = hasAction("view");
  const notificationData = useNotifications({
    enabled: canView && !isPermissionLoading && !isPermissionError,
  });
  const canCreateNotification =
    hasAction("create") &&
    (!isPermissionNavigationEnabled || hasAction("publish"));

  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<NotificationSearchCriterion>("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>(1);
  const [newestFirst, setNewestFirst] = useState(true);
  const [modalState, setModalState] = useState<NotificationModalState>(
    createClosedModalState
  );

  const filteredNotifications = useMemo(
    () =>
      filterNotifications({
        notifications: notificationData.notifications,
        searchTerm,
        searchBy,
        statusFilter,
        newestFirst,
      }),
    [notificationData.notifications, searchTerm, searchBy, statusFilter, newestFirst]
  );
  const paginationState = useTablePagination(
    filteredNotifications.length,
    NOTIFICATIONS_PER_PAGE,
  );
  const { setCurrentPage, pagination } = paginationState;
  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchBy, searchTerm, setCurrentPage, statusFilter, newestFirst]);

  const closeModal = () => setModalState(createClosedModalState());
  const openModal = (
    mode: Exclude<NotificationModalMode, "none">,
    selectedItem: NotificationResponse | null = null
  ) => setModalState({ open: true, mode, selectedItem });

  const resetFilters = () => {
    setSearchTerm("");
    setSearchBy("all");
    setStatusFilter(1);
    setNewestFirst(true);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSearchByChange = (value: NotificationSearchCriterion) => {
    setSearchBy(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: NotificationStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const toggleSortDirection = () => {
    setNewestFirst((current) => !current);
    setCurrentPage(1);
  };

  const { handleCreate, handleUpdate, handleDelete } = useNotificationActions({
    createNotification: notificationData.createNotification,
    updateNotification: notificationData.updateNotification,
    deleteNotification: notificationData.deleteNotification,
    onNotificationSaved: closeModal,
  });

  const findNotification = (notificationId: number) =>
    notificationData.notifications.find(
      (notification) => notification.id === notificationId
    ) ?? null;

  const openViewModal = (notificationId: number) =>
    openModal("view", findNotification(notificationId));
  const openUpdateModal = (notificationId: number) =>
    openModal("update", findNotification(notificationId));

  return {
    actions,
    canView,
    canCreateNotification,
    ...notificationData,
    isPermissionLoading,
    isPermissionFetching,
    isPermissionError,
    refetchPermissions,
    searchTerm,
    searchBy,
    statusFilter,
    newestFirst,
    modalState,
    filteredNotifications,
    pagination,
    hasActiveFilters,
    closeModal,
    openModal,
    resetFilters,
    setCurrentPage,
    handleSearchChange,
    handleSearchByChange,
    handleStatusChange,
    toggleSortDirection,
    openViewModal,
    openUpdateModal,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
