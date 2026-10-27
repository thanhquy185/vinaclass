import { useCourseGroupMaterialMutations } from "@/features/classrooms/hooks/useCourseGroupMaterialMutations";
import { useCourseGroupMaterialQueries } from "@/features/classrooms/hooks/useCourseGroupMaterialQueries";

export const useCourseGroupMaterials = (courseGroupId: number) => {
  const queries = useCourseGroupMaterialQueries(courseGroupId);
  const mutations = useCourseGroupMaterialMutations(courseGroupId);
  return {
    ...queries,
    ...mutations,
  };
};
