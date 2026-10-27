import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateCourseGroupNotification,
  useDeleteCourseGroupNotification,
} from "@/features/classrooms/hooks/useNotificationMutations";
import type {
  Notification,
  NotificationCreate,
} from "@/features/classrooms/types/classrooms";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseCourseGroupAnnouncementActionsOptions {
  courseGroupId: number;
}

export const useCourseGroupAnnouncementActions = ({
  courseGroupId,
}: UseCourseGroupAnnouncementActionsOptions) => {
  const { t } = useTranslation();
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const { startLoading, stopLoading } = useLoadingStore();
  const { showToast } = useToastStore();
  const openConfirm = useConfirmation();
  const { createNotification } = useCreateCourseGroupNotification();
  const { deleteNotificationAsync } =
    useDeleteCourseGroupNotification(courseGroupId);

  const toggleAnnouncementForm = () =>
    setIsAnnouncementFormOpen((isOpen) => !isOpen);
  const closeAnnouncementForm = () => setIsAnnouncementFormOpen(false);

  const handleSaveCreate = async (formData: NotificationCreate) => {
    const payload = { ...formData, courseGroupIds: [courseGroupId] };
    startLoading();
    try {
      await createNotification(payload);
      showToast(t("message.success.create"), "success");
      closeAnnouncementForm();
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleDeleteAnnouncement = (notification: Notification) => {
    openConfirm({
      title: t("notificationPage.confirmDeleteTitle"),
      message: t("notificationPage.confirmDeleteSpecificMessage", {
        title: notification.title,
      }),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        try {
          await deleteNotificationAsync(notification.id);
          showToast(t("message.success.delete"), "success");
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error"
          );
          throw error;
        } finally {
          stopLoading();
        }
      },
    });
  };

  return {
    isAnnouncementFormOpen,
    toggleAnnouncementForm,
    closeAnnouncementForm,
    handleSaveCreate,
    handleDeleteAnnouncement,
  };
};
