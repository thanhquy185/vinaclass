import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CourseGroupMaterial } from "@/features/classrooms/types/classrooms";
import { useCourseGroupMaterials } from "@/features/classrooms/hooks/useCourseGroupMaterials";
import type { CourseGroupMaterialFormValues } from "@/features/classrooms/types/courseGroupMaterialForm";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { useToastStore } from "@/shared/stores/useToastStore";
import { useConfirmation } from "@/hooks/shared/useConfirmation";

interface UseCourseGroupMaterialsControllerOptions {
  courseGroupId: number;
}

export function useCourseGroupMaterialsController({
  courseGroupId,
}: UseCourseGroupMaterialsControllerOptions) {
  const { t } = useTranslation("common");
  const showToast = useToastStore((state) => state.showToast);
  const openConfirm = useConfirmation();
  const materialsData = useCourseGroupMaterials(courseGroupId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<CourseGroupMaterial | null>(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const openCreateForm = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const openUpdateForm = (material: CourseGroupMaterial) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleSave = async (
    values: CourseGroupMaterialFormValues,
    file: File | null
  ) => {
    try {
      if (editingMaterial) {
        await materialsData.updateMaterial({
          materialId: editingMaterial.id,
          data: { ...values, file: file ?? undefined },
        });
        showToast(t("message.success.update"), "success");
      } else {
        if (!file) return;
        await materialsData.createMaterial({ ...values, file });
        showToast(t("message.success.create"), "success");
      }
      closeForm();
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ??
          t(editingMaterial ? "message.error.update" : "message.error.create"),
        "error"
      );
      throw error;
    }
  };

  const handleDownload = async (material: CourseGroupMaterial) => {
    try {
      await materialsData.downloadMaterial(material);
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("courseMaterials.downloadError"),
        "error"
      );
    }
  };

  const handleDelete = (material: CourseGroupMaterial) => {
    openConfirm({
      title: t("courseMaterials.deleteTitle"),
      message: t("courseMaterials.deleteConfirmation", {
        title: material.title,
      }),
      type: "danger",
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: async () => {
        try {
          await materialsData.deleteMaterial(material.id);
          showToast(t("message.success.delete"), "success");
        } catch (error: unknown) {
          showToast(
            getApiErrorMessage(error) ?? t("message.error.delete"),
            "error"
          );
          throw error;
        }
      },
    });
  };

  return {
    ...materialsData,
    isFormOpen,
    editingMaterial,
    closeForm,
    openCreateForm,
    openUpdateForm,
    handleSave,
    handleDownload,
    handleDelete,
  };
}
