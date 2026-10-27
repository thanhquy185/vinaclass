import { useTranslation } from "react-i18next";
import type {
  User,
  UserCreate,
  UserResetPass,
  UserUpdate,
} from "@/features/identity/types/identity";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

interface UseUserActionsOptions {
  createUser: (data: UserCreate) => Promise<unknown>;
  updateUser: (variables: {
    userId: number;
    data: UserUpdate;
  }) => Promise<unknown>;
  updateUserLock: (variables: {
    userId: number;
    isLocked: boolean;
  }) => Promise<unknown>;
  deleteUser: (userId: number) => Promise<unknown>;
  resetUserPassword: (variables: {
    userId: number;
    data: UserResetPass;
  }) => Promise<unknown>;
  closeModal: () => void;
  closePasswordDialog: () => void;
}

export const useUserActions = ({
  createUser,
  updateUser,
  updateUserLock,
  deleteUser,
  resetUserPassword,
  closeModal,
  closePasswordDialog,
}: UseUserActionsOptions) => {
  const { t } = useTranslation("common");
  const { startLoading, stopLoading } = useLoadingStore();
  const showToast = useToastStore((state) => state.showToast);

  const handleCreate = async (data: UserCreate) => {
    startLoading();
    try {
      await createUser(data);
      closeModal();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleUpdate = async (userId: number, data: UserUpdate) => {
    startLoading();
    try {
      await updateUser({ userId, data });
      showToast(t("message.success.update"), "success");
      closeModal();
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (userId: number) => {
    startLoading();
    try {
      await deleteUser(userId);
      showToast(t("message.success.delete"), "success");
      closeModal();
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.delete"),
        "error"
      );
    } finally {
      stopLoading();
    }
  };

  const handleResetPassword = async (
    userId: number,
    data: UserResetPass,
  ): Promise<boolean> => {
    startLoading();
    try {
      await resetUserPassword({ userId, data });
      closePasswordDialog();
      showToast(t("userPage.passwordDialog.success"), "success");
      return true;
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("userPage.passwordDialog.error"),
        "error",
      );
      return false;
    } finally {
      stopLoading();
    }
  };

  const handleToggleLock = async (user: User): Promise<boolean> => {
    const isLocking = !user.isLocked;

    startLoading();
    try {
      await updateUserLock({
        userId: user.id,
        isLocked: isLocking,
      });
      showToast(
        t(isLocking ? "userPage.lockSuccess" : "userPage.unlockSuccess"),
        "success"
      );
      return true;
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error"
      );
      return false;
    } finally {
      stopLoading();
    }
  };

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleResetPassword,
    handleToggleLock,
  };
};
