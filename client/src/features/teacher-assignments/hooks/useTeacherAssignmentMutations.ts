import { teacherAssignmentService } from "@/features/teacher-assignments/api/teacher-assignment.service";
import { teacherAssignmentQueryKeys } from "@/features/teacher-assignments/queryKeys";
import { useInvalidatingMutation } from "@/shared/query/useInvalidatingMutation";

export const useSyncTeacherAssignments = () => {
  const mutation = useInvalidatingMutation(
    teacherAssignmentService.syncAssignments,
    () => [teacherAssignmentQueryKeys.root]
  );

  return {
    syncAssignments: mutation.mutate,
    syncAssignmentsAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isCreateError: mutation.isError,
    isCreateSuccess: mutation.isSuccess,
  };
};

export const useDeleteTeacherAssignment = () => {
  const mutation = useInvalidatingMutation(
    teacherAssignmentService.deleteAssignment,
    () => [teacherAssignmentQueryKeys.root]
  );

  return {
    deleteAssignment: mutation.mutate,
    deleteAssignmentAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isDeleteError: mutation.isError,
    isDeleteSuccess: mutation.isSuccess,
  };
};
