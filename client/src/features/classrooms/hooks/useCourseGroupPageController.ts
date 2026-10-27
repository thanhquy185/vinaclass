import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { CourseGroup } from "@/features/classrooms/types/classrooms";
import { useCourseGroupListState } from "@/features/classrooms/hooks/useCourseGroupListState";
import { useCourseGroupManagement } from "@/features/classrooms/hooks/useCourseGroupManagement";
import { useCourseGroupPageData } from "@/features/classrooms/hooks/useCourseGroupPageData";

export function useCourseGroupPageController() {
  const { t } = useTranslation();
  const pageData = useCourseGroupPageData();
  const getSectionTitle = useCallback(
    (group: CourseGroup) => {
      const subjectCode = group.subject?.subjectCode || "#" + group.subjectId;
      const subjectName =
        group.subject?.subjectName || t("courseGroup.subjectUnavailable");
      return t("courseGroup.sectionTitle", {
        subjectCode,
        subjectName,
        academicYear: group.academicYear,
        semester: group.semester,
      });
    },
    [t]
  );
  const listState = useCourseGroupListState({
    courseGroups: pageData.courseGroupDisplay,
    getSectionTitle,
  });
  const management = useCourseGroupManagement({
    courseGroups: pageData.courseGroupDisplay,
    onCloseMenu: listState.closeMenu,
  });

  return {
    ...pageData,
    t,
    ...listState,
    isProcessing: management.isProcessing,
    isFormOpen: management.isFormOpen,
    editFormData: management.editFormData,
    openCreateForm: management.openCreateForm,
    closeForm: management.closeForm,
    openEditForm: management.openEditForm,
    confirmRemoveGroup: management.confirmRemoveGroup,
    setGroupVisibility: management.setGroupVisibility,
    saveForm: management.saveForm,
  };
}
