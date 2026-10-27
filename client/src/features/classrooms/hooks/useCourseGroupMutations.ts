import { useEntityMutation } from "@/hooks/shared/useEntityMutation";
import { courseGroupService } from "@/features/classrooms/api/course-group.service";
import { courseGroupQueryKeys } from "@/features/classrooms/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";
import type { CourseGroupUpdate } from "@/features/classrooms/types/classrooms";

const useCourseGroupListMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) =>
  useInvalidatingMutation(mutationFn, () => [courseGroupQueryKeys.root], {
    waitForInvalidation: true,
  });

export const useCreateCourseGroup = () =>
  useCourseGroupListMutation(courseGroupService.createCourseGroup);

export const useUpdateCourseGroup = () => {
  return useCourseGroupListMutation(
    ({ id, data }: { id: number; data: CourseGroupUpdate }) =>
      courseGroupService.updateCourseGroup(id, data)
  );
};

export const useDeleteCourseGroup = () =>
  useCourseGroupListMutation(courseGroupService.deleteCourseGroup);

export const useJoinCourseGroup = () =>
  useCourseGroupListMutation(courseGroupService.joinCourseGroup);

export const useResetInviteCode = () => {
  return useCourseGroupListMutation(({ groupId }: { groupId: number }) =>
    courseGroupService.resetInviteCode(groupId)
  );
};

export const useAddStudentToCourseGroup = () => {
  return useInvalidatingMutation(
    ({ id, data }: { id: number; data: { username: string } }) =>
      courseGroupService.addStudentToCourseGroup(id, data),
    (_, { id }) => [courseGroupQueryKeys.studentsForGroup(id)],
    { waitForInvalidation: true }
  );
};

export const useRemoveStudentFromCourseGroup = () => {
  return useInvalidatingMutation(
    ({ groupId, studentId }: { groupId: number; studentId: number }) =>
      courseGroupService.removeStudentFromCourseGroup(groupId, studentId),
    (_, { groupId }) => [courseGroupQueryKeys.studentsForGroup(groupId)],
    { waitForInvalidation: true }
  );
};

export const useExportCourseGroupStudents = () =>
  useEntityMutation({
    mutationFn: ({ groupId }: { groupId: number }) =>
      courseGroupService.exportStudents(groupId),
    onSuccess: (blob, { groupId }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `danh-sach-sinh-vien-nhom-${groupId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });

export const useImportCourseGroupStudents = () => {
  return useInvalidatingMutation(
    ({ groupId, file }: { groupId: number; file: File }) =>
      courseGroupService.importStudents(groupId, file),
    (_, { groupId }) => [courseGroupQueryKeys.studentsForGroup(groupId)],
    { waitForInvalidation: true }
  );
};
