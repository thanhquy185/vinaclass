import { useTranslation } from "react-i18next";
import type {
  CourseGroup,
  CourseGroupUpdate,
} from "@/features/classrooms/types/classrooms";
import { useConfirmation } from "@/hooks/shared/useConfirmation";
import { useToastStore } from "@/shared/stores/useToastStore";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface UseCourseGroupLifecycleActionsOptions {
  courseGroups: CourseGroup[];
  updateCourseGroup: (input: {
    id: number;
    data: CourseGroupUpdate;
  }) => Promise<unknown>;
  deleteCourseGroup: (id: number) => Promise<unknown>;
  onCloseMenu: () => void;
}

export function useCourseGroupLifecycleActions({
  courseGroups,
  updateCourseGroup,
  deleteCourseGroup,
  onCloseMenu,
}: UseCourseGroupLifecycleActionsOptions) {
  const { t } = useTranslation();
  const showToast = useToastStore((state) => state.showToast);
  const openConfirm = useConfirmation();

  const setGroupVisibility = async (groupId: number, isHidden: boolean) => {
    try {
      await updateCourseGroup({ id: groupId, data: { isHidden } });
      onCloseMenu();
      showToast(t("message.success.update"), "success");
    } catch (error: unknown) {
      showToast(
        getApiErrorMessage(error) ?? t("message.error.update"),
        "error"
      );
    }
  };

  const confirmRemoveGroup = (groupId: number) => {
    const group = courseGroups.find((item) => item.id === groupId);
    if (!group) return;

    openConfirm({
      title: t("courseGroup.confirmDeleteTitle"),
      message: t("courseGroup.confirmDeleteGroup", {
        groupName: group.groupName,
      }),
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteCourseGroup(groupId);
          onCloseMenu();
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

  return { setGroupVisibility, confirmRemoveGroup };
}
