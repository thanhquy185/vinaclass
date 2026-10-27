import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Role, RoleCreate, RoleUpdate } from "@/shared/types";
import {
  useCreateRole,
  useDeleteRole,
  useUpdateRole,
} from "@/features/authorization/hooks/useRoleMutations";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useToastStore } from "@/shared/stores/useToastStore";

export type PermissionGroupAction = "detail" | "edit" | "remove";
export type PermissionGroupModalMode =
  | "create"
  | "view"
  | "update"
  | "delete"
  | "none";

interface PermissionGroupModalState {
  open: boolean;
  mode: PermissionGroupModalMode;
  id: number | undefined;
}

const CLOSED_MODAL_STATE: PermissionGroupModalState = {
  open: false,
  mode: "none",
  id: undefined,
};

export function usePermissionGroupActions() {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const { startLoading, stopLoading } = useLoadingStore();
  const { createRoleAsync, isCreating } = useCreateRole();
  const { updateRoleAsync, isUpdating } = useUpdateRole();
  const { deleteRoleAsync, isDeleting } = useDeleteRole();
  const [modalState, setModalState] =
    useState<PermissionGroupModalState>(CLOSED_MODAL_STATE);

  const closeModal = () => setModalState(CLOSED_MODAL_STATE);
  const openCreateModal = () =>
    setModalState({ open: true, mode: "create", id: undefined });

  const createRole = async (data: RoleCreate) => {
    startLoading();
    try {
      await createRoleAsync(data);
      closeModal();
      showToast(t("message.success.create"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error",
      );
    } finally {
      stopLoading();
    }
  };

  const updateRole = async (id: number, data: RoleUpdate) => {
    startLoading();
    try {
      await updateRoleAsync({ id, data });
      closeModal();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error",
      );
    } finally {
      stopLoading();
    }
  };

  const removeRole = async (role: Role) => {
    startLoading();
    try {
      await deleteRoleAsync(role.id);
      closeModal();
      showToast(t("message.success.delete"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.delete"),
        "error",
      );
    } finally {
      stopLoading();
    }
  };

  const handleAction = (action: PermissionGroupAction, role: Role) => {
    const mode =
      action === "detail" ? "view" : action === "edit" ? "update" : "delete";
    setModalState({ open: true, mode, id: role.id });
  };

  return {
    modalState,
    isProcessing: isCreating || isUpdating || isDeleting,
    isSaving: isCreating || isUpdating,
    isDeleting,
    closeModal,
    createRole,
    handleAction,
    openCreateModal,
    removeRole,
    updateRole,
  };
}
