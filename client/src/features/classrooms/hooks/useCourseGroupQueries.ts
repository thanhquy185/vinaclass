import { useEntityQuery } from "@/hooks/shared/useEntityQuery";
import { courseGroupService } from "@/features/classrooms/api/course-group.service";
import { courseGroupQueryKeys } from "@/features/classrooms/queryKeys";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { selectApiData } from "@/shared/query/selectApiData";

export const useCourseGroups = (enabled = true, userId?: number) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.list(userId ?? viewerId),
    queryFn: courseGroupService.getAllCourseGroups,
    enabled,
    select: (response) =>
      selectApiData(response).filter((item) => !item.isDeleted),
  });

  return {
    courseGroups: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useStudentCourseGroups = (studentId: number | null) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.studentList(studentId, viewerId),
    queryFn: () => {
      return studentId
        ? courseGroupService.getCourseGroupsByStudent(studentId)
        : null;
    },
    select: (res) => res?.data,
    enabled: !!studentId,
  });

  return {
    courseGroups: query.data?.courseGroups,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCourseGroupDetail = (
  courseGroupId: number,
  options: { enabled?: boolean } = {}
) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.detail(courseGroupId, viewerId),
    queryFn: () => courseGroupService.getCourseGroupById(courseGroupId),
    select: selectApiData,
    enabled: Boolean(courseGroupId && options.enabled !== false),
  });

  return {
    courseGroup: options.enabled === false ? undefined : query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCourseGroupsByTeacher = (
  teacherId?: number,
  enabled = true
) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.teacherList(teacherId, viewerId),
    queryFn: () => courseGroupService.getCourseGroupsByTeacher(teacherId!),
    enabled: enabled && !!teacherId,
    select: (response) =>
      selectApiData(response).filter((item) => !item.isDeleted),
  });

  return {
    courseGroups: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useAssignedTeaching = (
  teacherId: number | null,
  enabled = true,
  includeHidden = true
) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: [
      ...courseGroupQueryKeys.assignedTeaching(
        teacherId ?? undefined,
        viewerId
      ),
      includeHidden,
    ],
    queryFn: () =>
      courseGroupService.getAssignedTeaching(teacherId!, includeHidden),
    enabled: enabled && Boolean(teacherId),
    select: selectApiData,
  });

  return {
    teaching: query.data,
    courseGroups: query.data?.courseGroups ?? [],
    subjects: query.data?.subjects ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCourseGroupTeacher = (courseGroupId: number) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.teacherDetail(courseGroupId, viewerId),
    queryFn: () => courseGroupService.getTeacherByCourseGroup(courseGroupId),
    select: selectApiData,
    enabled: !!courseGroupId,
  });

  return {
    teacher: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useCourseGroupExams = (courseGroupId: number) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.exams(courseGroupId, viewerId),
    queryFn: () => courseGroupService.getExamsByCourseGroup(courseGroupId),
    select: selectApiData,
    enabled: !!courseGroupId,
  });

  return {
    exams: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useCourseGroupStudents = (
  courseGroupId: number,
  enabled = true
) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.students(courseGroupId, viewerId),
    queryFn: () => courseGroupService.getStudentsByCourseGroup(courseGroupId),
    select: (res) => ({
      students: res.success ? res.data?.students || [] : [],
      message: res.message,
      success: res.success,
    }),
    enabled: !!courseGroupId && enabled,
  });

  return {
    students: enabled ? query.data?.students || [] : [],
    message: query.data?.message,
    success: query.data?.success ?? true,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCourseGroupStudentDetail = (courseGroupId: number) => {
  const viewerId = useAuthStore((state) => state.user?.id);
  const query = useEntityQuery({
    queryKey: courseGroupQueryKeys.studentDetail(courseGroupId, viewerId),
    queryFn: () =>
      courseGroupService.getCourseGroupStudentDetail(courseGroupId),
    select: selectApiData,
    enabled: Number.isInteger(courseGroupId) && courseGroupId > 0,
  });

  return {
    courseGroup: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
};
