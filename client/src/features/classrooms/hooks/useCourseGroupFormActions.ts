import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CourseGroupCreate,
  CourseGroupUpdate,
} from "@/features/classrooms/types/classrooms";
import type {
  CourseGroupEditFormState,
  CourseGroupFormData,
} from "@/features/classrooms/types/courseGroupForm";
import type { GroupDisplay } from "@/features/classrooms/types/courseGroupList";
import {
  toCourseGroupCreatePayload,
  toCourseGroupEditFormState,
  toCourseGroupUpdatePayload,
} from "@/features/classrooms/utils/courseGroupPayload";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface UseCourseGroupFormActionsOptions {
  createCourseGroup: (data: CourseGroupCreate) => Promise<unknown>;
  updateCourseGroup: (input: {
    id: number;
    data: CourseGroupUpdate;
  }) => Promise<unknown>;
}

export function useCourseGroupFormActions({
  createCourseGroup,
  updateCourseGroup,
}: UseCourseGroupFormActionsOptions) {
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editFormData, setEditFormData] =
    useState<CourseGroupEditFormState | null>(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditFormData(null);
  };

  const openCreateForm = () => {
    setEditFormData(null);
    setIsFormOpen(true);
  };

  const openEditForm = (group: GroupDisplay) => {
    setEditFormData(toCourseGroupEditFormState(group));
    setIsFormOpen(true);
  };

  const saveForm = async (data: CourseGroupFormData) => {
    if (editFormData?.groupId) {
      try {
        await updateCourseGroup({
          id: editFormData.groupId,
          data: toCourseGroupUpdatePayload(data),
        });
        closeForm();
        showToast(t("message.success.update"), "success");
      } catch (error: unknown) {
        showToast(
          getApiErrorMessage(error) ?? t("message.error.update"),
          "error"
        );
      }
      return;
    }

    try {
      await createCourseGroup(toCourseGroupCreatePayload(data));
      showToast(t("message.success.create"), "success");
      closeForm();
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.create"),
        "error"
      );
    }
  };

  return {
    editFormData,
    isFormOpen,
    closeForm,
    openCreateForm,
    openEditForm,
    saveForm,
  };
}
