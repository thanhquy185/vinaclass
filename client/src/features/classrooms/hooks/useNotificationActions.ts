import { useTranslation } from "react-i18next";
import type {
  NotificationCreate,
  NotificationUpdate,
} from "@/features/classrooms/types/classrooms";
import {
  getApiErrorMessage,
  getApiValidationMessage,
} from "@/shared/utils/apiError";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseNotificationActionsOptions {
  createNotification: (data: NotificationCreate) => Promise<unknown>;
  updateNotification: (variables: {
    notificationId: number;
    data: NotificationUpdate;
  }) => Promise<unknown>;
  deleteNotification: (notificationId: number) => Promise<unknown>;
  onNotificationSaved: () => void;
}

export const useNotificationActions = ({
  createNotification,
  updateNotification,
  deleteNotification,
  onNotificationSaved,
}: UseNotificationActionsOptions) => {
  const { t } = useTranslation();
  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();
  const openConfirm = useConfirmation();

  const handleCreate = async (data: NotificationCreate) => {
    startLoading();
    try {
      await createNotification(data);
      onNotificationSaved();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      showToast(
        getApiValidationMessage(error) ?? t("message.error.create"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleUpdate = async (id: number, data: NotificationUpdate) => {
    startLoading();
    try {
      await updateNotification({ notificationId: id, data });
      onNotificationSaved();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      showToast(
        getApiValidationMessage(error) ?? t("message.error.update"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleDelete = (id: number) => {
    openConfirm({
      title: t("notificationPage.confirmDeleteTitle"),
      message: t("notificationPage.confirmDeleteMessage"),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteNotification(id);
          showToast(t("message.success.delete"), "success");
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error"
          );
        } finally {
          stopLoading();
        }
      },
    });
  };

  return { handleCreate, handleUpdate, handleDelete };
};
