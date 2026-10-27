import { useEntityMutation } from "@/hooks/shared/useEntityMutation";
import { saveAs } from "file-saver";
import { courseGroupService } from "@/features/classrooms/api/course-group.service";
import { courseGroupQueryKeys } from "@/features/classrooms/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import type { CourseGroupMaterial } from "@/features/classrooms/types/classrooms";

export const useCourseGroupMaterialMutations = (courseGroupId: number) => {
  const getMaterialQueryKeys = () => [
    courseGroupQueryKeys.materialsForGroup(courseGroupId),
  ];

  const createMutation = useInvalidatingMutation(
    (data: { title: string; description?: string; file: File }) =>
      courseGroupService.createMaterial(courseGroupId, data),
    getMaterialQueryKeys,
    { waitForInvalidation: true }
  );

  const updateMutation = useInvalidatingMutation(
    (input: {
      materialId: number;
      data: { title: string; description?: string; file?: File };
    }) =>
      courseGroupService.updateMaterial(
        courseGroupId,
        input.materialId,
        input.data
      ),
    getMaterialQueryKeys,
    { waitForInvalidation: true }
  );

  const deleteMutation = useInvalidatingMutation(
    (materialId: number) =>
      courseGroupService.deleteMaterial(courseGroupId, materialId),
    getMaterialQueryKeys,
    { waitForInvalidation: true }
  );
  const downloadMutation = useEntityMutation({
    mutationFn: async (material: CourseGroupMaterial) => {
      const file = await courseGroupService.downloadMaterial(
        courseGroupId,
        material.id
      );
      saveAs(file, material.fileName);
    },
  });

  return {
    createMaterial: createMutation.mutateAsync,
    updateMaterial: updateMutation.mutateAsync,
    deleteMaterial: deleteMutation.mutateAsync,
    downloadMaterial: downloadMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
