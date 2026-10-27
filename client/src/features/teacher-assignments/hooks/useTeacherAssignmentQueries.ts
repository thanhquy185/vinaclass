import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { teacherAssignmentService } from "@/features/teacher-assignments/api/teacher-assignment.service";
import { teacherAssignmentQueryKeys } from "@/features/teacher-assignments/queryKeys";
import { selectApiData } from "@/shared/query/selectApiData";
import type { AssignmentOverviewParams } from "@/features/teacher-assignments/types/teacherAssignment";

export const useTeacherAssignmentOverview = (
  params: AssignmentOverviewParams,
  enabled = true,
) => {
  const query = useEntityQuery({
    queryKey: teacherAssignmentQueryKeys.overview(params),
    queryFn: () => teacherAssignmentService.getOverview(params),
    enabled,
    select: selectApiData,
  });

  return {
    overview: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useTeacherAssignments = (enabled = true) => {
  const query = useEntityQuery({
    queryKey: teacherAssignmentQueryKeys.root,
    queryFn: teacherAssignmentService.getAllAssignments,
    enabled,
    select: selectApiData,
  });

  return {
    assignments: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useTeacherSubjects = (teacherId: number, enabled = true) => {
  const query = useEntityQuery({
    queryKey: teacherAssignmentQueryKeys.byTeacher(teacherId),
    queryFn: () => teacherAssignmentService.getSubjectsByTeacher(teacherId),
    enabled: enabled && teacherId > 0,
    select: selectApiData,
  });

  return {
    subjects: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
