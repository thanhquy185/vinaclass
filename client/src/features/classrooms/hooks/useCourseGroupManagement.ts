import {
  useCreateCourseGroup,
  useDeleteCourseGroup,
  useUpdateCourseGroup,
} from "@/features/classrooms/hooks/useCourseGroupMutations";
import { useCourseGroupFormActions } from "@/features/classrooms/hooks/useCourseGroupFormActions";
import { useCourseGroupLifecycleActions } from "@/features/classrooms/hooks/useCourseGroupLifecycleActions";
import type { CourseGroup } from "@/features/classrooms/types/classrooms";

interface UseCourseGroupManagementOptions {
  courseGroups: CourseGroup[];
  onCloseMenu: () => void;
}

export function useCourseGroupManagement({
  courseGroups,
  onCloseMenu,
}: UseCourseGroupManagementOptions) {
  const createMutation = useCreateCourseGroup();
  const updateMutation = useUpdateCourseGroup();
  const deleteMutation = useDeleteCourseGroup();
  const formActions = useCourseGroupFormActions({
    createCourseGroup: createMutation.mutateAsync,
    updateCourseGroup: updateMutation.mutateAsync,
  });
  const lifecycleActions = useCourseGroupLifecycleActions({
    courseGroups,
    updateCourseGroup: updateMutation.mutateAsync,
    deleteCourseGroup: deleteMutation.mutateAsync,
    onCloseMenu,
  });

  return {
    ...formActions,
    ...lifecycleActions,
    isProcessing:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
