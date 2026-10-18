import { Button, Icon, Input } from "@/components/atomic/atoms";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import NotificationItem from "@/components/atomic/molecules/NotificationItem/NotificationItem";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import { useEffect, useMemo, useState } from "react";
import AddNotificationForm from "@/components/atomic/organisms/AddNotificationForm/AddNotificationForm";
import { useNotifications } from "@/hooks/useNotification";
import type {
  ErrorResponse,
  RoleDetailItem,
  NotificationCreate,
  NotificationResponse,
  NotificationUpdate,
} from "@/types";
import { useTranslation } from "react-i18next";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useToastStore } from "@/stores/useToast.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import Pagination from "@/components/atomic/molecules/Pagination/Pagination";

export const NotificationPage = () => {
  const { notifications } = useNotifications();
  const { t } = useTranslation();
  const { createNotification, updateNotification, deleteNotification, isProcessing } =
    useNotifications();
  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();

  const pageName = "thong_bao";

  const { role, user } = useAuthStore();
  const myNotifications = notifications.filter((item) => item.senderId === user?.id);
  const roleDetails = !role ? [] : role.roleDetails;
  const actions = roleDetails
    .filter((item: RoleDetailItem) => item.functionName === pageName)
    .flatMap((item) => {
      const result: string[] = [];

      if (item.canView) result.push("view");
      if (item.canCreate) result.push("create");
      if (item.canUpdate) result.push("update");
      if (item.canDelete) result.push("delete");

      return result;
    });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    // 1. Lọc dữ liệu theo Search Term
    const filtered = myNotifications.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const content = item.content?.toLowerCase() ?? "";
      const sender = item.sender?.fullName?.toLowerCase() ?? "";
      const subjectName =
        item.courseGroups?.[0]?.subject?.subjectName?.toLowerCase() ?? "";

      return (
        title.includes(term) ||
        content.includes(term) ||
        sender.includes(term) ||
        subjectName.includes(term)
      );
    });

    // 2. Sắp xếp: Thời gian mới nhất (thoiGianGui) lên đầu
    // Sử dụng slice() để tạo bản sao mảng trước khi sort (tránh mutate mảng gốc)
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.sentAt).getTime();
      const dateB = new Date(b.sentAt).getTime();
      return dateB - dateA; // Giảm dần: B lớn hơn (mới hơn) sẽ đứng trước
    });
  }, [searchTerm, myNotifications]);

  const defaultModalState = {
    open: false,
    mode: "none",
    id: undefined,
    selectedItem: null,
  } as const;

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "create" | "view" | "update" | "none";
    id: number | undefined;
    selectedItem: NotificationResponse | null;
  }>(defaultModalState);

  const closeModal = () => {
    setModalState(defaultModalState);
  };

  const openInsertModal = () => {
    setModalState({
      open: true,
      mode: "create",
      id: undefined,
      selectedItem: null,
    });
  };

  const openUpdateModal = (id: number) => {
    const selectedNotification =
      myNotifications.find((notification) => notification.id === id) ?? null;
    setModalState({
      open: true,
      mode: "update",
      id: id,
      selectedItem: selectedNotification,
    });
  };

  const insert = async (data: NotificationCreate) => {
    if (!validateCreate(data)) return;

    startLoading();
    try {
      await createNotification(data);
      closeModal();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response?.data?.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          showToast(firstError[0], "error");
        }
      } else {
        showToast(t("message.error.create"), "error");
      }
    } finally {
      stopLoading();
    }
  };

  const updateTB = async (id: number, data: NotificationUpdate) => {
    if (!validateUpdate(data)) {
      return;
    }
    startLoading();
    try {
      await updateNotification({ notificationId: id, data });
      closeModal();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.status === 422) {
        //lỗi validate backend
        const errors = err.response.data.errors;

        const firstError = Object.values(errors)?.[0];

        if (Array.isArray(firstError)) {
          showToast(firstError[0], "success");
        }
      } else {
        showToast(t("message.error.update"), "success");
      }
    } finally {
      stopLoading();
    }
  };

  const detailTB = (id: number) => {
    const selectedNotification =
      myNotifications.find((notification) => notification.id === id) ?? null;
    setModalState({
      open: true,
      mode: "view",
      id: id,
      selectedItem: selectedNotification,
    });
  };

  const { openConfirm } = useConfirmStore();
  const deleteTB = (id: number) => {
    openConfirm({
      title: t("notificationPage.confirmDeleteTitle"),
      message: t("notificationPage.confirmDeleteMessage"),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteNotification(id);
          showToast(t("message.success.delete"), "success");
          if (typeof closeModal === "function") closeModal();
        } catch (error: unknown) {
          showToast(t("message.error.delete"), "error");
          throw error;
        } finally {
          stopLoading();
        }
      },
    });
  };

  const validateCreate = (request: NotificationCreate): boolean => {
    if (!request.title || request.title.trim() === "") {
      alert(t("notificationPage.validation.titleRequired"));
      return false;
    }

    if (!request.content || request.content.trim() === "") {
      alert(t("notificationPage.validation.contentRequired"));
      return false;
    }

    if (!request.courseGroupIds || request.courseGroupIds.length === 0) {
      alert(t("notificationPage.validation.courseGroupRequired"));
      return false;
    }

    return true;
  };

  const validateUpdate = (request: NotificationUpdate): boolean => {
    if (!request.title || request.title.trim() === "") {
      alert(t("notificationPage.validation.titleRequired"));
      return false;
    }

    if (!request.content || request.content.trim() === "") {
      alert(t("notificationPage.validation.contentRequired"));
      return false;
    }

    if (!request.courseGroupIds || request.courseGroupIds.length === 0) {
      alert(t("notificationPage.validation.courseGroupRequired"));
      return false;
    }

    return true;
  };

  const itemsPerPage = 6; // Thông báo thường chiếm diện tích lớn, nên để 6-8 item
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Tính toán dữ liệu phân trang
  const { currentData, totalPages } = useMemo(() => {
    const total = filteredNotifications.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return {
      currentData: filteredNotifications.slice(
        startIndex,
        startIndex + itemsPerPage
      ),
      totalPages: pages,
    };
  }, [filteredNotifications, currentPage]);

  // 2. Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. Logic cuộn lên đầu danh sách khi đổi trang
  useEffect(() => {
    const listTop = document.getElementById("notification-list-top");
    if (listTop) {
      listTop.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  return (
    <MainContentLayout>
      {/* Xử lý loading ở đây nhen */}
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          {t("tableActions.loading")}
        </div>
      )}
      {/* Toolbar: Search & Action */}
      <div
        id="notification-list-top"
        className="flex justify-between rounded-md bg-background-body-background px-2 py-2"
      >
        {/* Left */}

        <div className="flex gap-2">
          <SelectField
            placeholder={t("notificationPage.filter.placeholder")}
            defaultIndex={0}
            options={[
              { label: t("notificationPage.filter.all"), value: 1 },
              { label: t("notificationPage.filter.sent"), value: 2 },
              { label: t("notificationPage.filter.draft"), value: 3 },
            ]}
            onSelect={() => {}}
          />
          <Input
            hasBoder={true}
            placeholder={t("notificationPage.searchPlaceholder")}
            icon={<Icon name="search" className="text-text-disabled" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Right */}
        <div className="flex gap-2">
          <Button variant={"outline"}>
            <Icon name="arrowUpDown" />
          </Button>

          {actions.includes("create") && (
            <Button
              variant={"contained"}
              color={"primary"}
              onClick={() => openInsertModal()}
            >
              <Icon name="plus" size={20} />
              {t("notificationPage.addNew")}
            </Button>
          )}

          {modalState.open && (
            <AddNotificationForm
              onClose={closeModal}
              onSaveCreate={insert}
              onSaveUpdate={updateTB}
              mode={modalState.mode}
              selectedItem={modalState.selectedItem}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          {currentData.length > 0 ? (
            currentData.map((note) => (
              <NotificationItem
                key={note.id} // Đừng quên key nhé nhen
                data={note}
                onView={(id) => detailTB(id)}
                onEdit={(id) => openUpdateModal(id)}
                onDelete={(id) => deleteTB(id)}
                actions={actions}
              />
            ))
          ) : (
            <div className="rounded-md bg-background-body-background p-10 text-center text-text-disabled">
              {t("common.noData")}
            </div>
          )}
        </div>
        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="rounded-md bg-background-body-background py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </MainContentLayout>
  );
};
