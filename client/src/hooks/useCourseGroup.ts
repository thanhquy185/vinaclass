import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseGroupService } from "@/services/api/course-group.service";
import type { CourseGroupUpdate } from "@/types";

export const useCourseGroups = () => {
  // Lấy danh sách
  const query = useQuery({
    queryKey: ["course-groups"],
    queryFn: courseGroupService.getAllCourseGroups,
    select: (res) => res.data.filter((item) => !item.isDeleted),
  });

  return {
    courseGroups: query.data || [],
    isLoading: query.isLoading,
  };
};

export const useStudentCourseGroups = (studentId: number | null) => {
  const query = useQuery({
    // QueryKey chứa ID để khi đổi sinh viên dữ liệu sẽ tự làm mới
    queryKey: ["course-groups", "student", studentId],
    queryFn: () => {
      return studentId ? courseGroupService.getCourseGroupsByStudent(studentId) : null;
    },
    select: (res) => res?.data,
    enabled: !!studentId, // Chỉ chạy khi có studentId
  });

  return {
    courseGroups: query.data?.courseGroups,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCourseGroupDetail = (courseGroupId: number) => {
  const query = useQuery({
    queryKey: ["course-groups", courseGroupId],
    queryFn: () => courseGroupService.getCourseGroupById(courseGroupId),
    select: (res) => res.data,
    enabled: !!courseGroupId,
  });

  return {
    courseGroup: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useCourseGroupsByTeacher = (teacherId?: number) => {
  const query = useQuery({
    queryKey: ["course-groups", "teacher", teacherId],
    queryFn: () => courseGroupService.getCourseGroupsByTeacher(teacherId!),
    enabled: !!teacherId,
    select: (res) => res.data.filter((item) => !item.isDeleted),
  });

  return {
    courseGroups: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useCourseGroupTeacher = (courseGroupId: number) => {
  const query = useQuery({
    queryKey: ["course-groups", "teacher", courseGroupId],
    queryFn: () => courseGroupService.getTeacherByCourseGroup(courseGroupId),
    select: (res) => res.data,
    enabled: !!courseGroupId,
  });

  return {
    teacher: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useCourseGroupExams = (courseGroupId: number) => {
  const query = useQuery({
    queryKey: ["course-groups", "exams", courseGroupId],
    queryFn: () => courseGroupService.getExamsByCourseGroup(courseGroupId),
    select: (res) => res.data,
    enabled: !!courseGroupId,
  });

  return {
    exams: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useCourseGroupStudents = (courseGroupId: number) => {
  const query = useQuery({
    queryKey: ["course-groups", "students", courseGroupId],
    queryFn: () => courseGroupService.getStudentsByCourseGroup(courseGroupId),
    select: (res) => ({
      students: res.success ? res.data?.students || [] : [],
      message: res.message,
      success: res.success,
    }),
    enabled: !!courseGroupId,
  });

  return {
    students: query.data?.students || [],
    message: query.data?.message,
    success: query.data?.success ?? true,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

// Mutations
export const useCreateCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseGroupService.createCourseGroup,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-groups"] }),
  });
};

export const useUpdateCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseGroupUpdate }) =>
      courseGroupService.updateCourseGroup(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-groups"] }),
  });
};

export const useDeleteCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseGroupService.deleteCourseGroup,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-groups"] }),
  });
};

export const useJoinCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseGroupService.joinCourseGroup,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-groups"] }),
  });
};

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId }: { groupId: number }) =>
      courseGroupService.resetInviteCode(groupId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["course-groups"] }),
  });
};

export const useAddStudentToCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { username: string } }) =>
      courseGroupService.addStudentToCourseGroup(id, data),
    onSuccess: (_, { id }) =>
      queryClient.invalidateQueries({
        queryKey: ["course-groups", "students", id],
      }),
  });
};

export const useRemoveStudentFromCourseGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      studentId,
    }: {
      groupId: number;
      studentId: number;
    }) => courseGroupService.removeStudentFromCourseGroup(groupId, studentId),
    onSuccess: (_, { groupId }) =>
      queryClient.invalidateQueries({
        queryKey: ["course-groups", "students", groupId],
      }),
  });
};

export const useExportCourseGroupStudents = () => {
  return useMutation({
    mutationFn: ({ groupId }: { groupId: number }) =>
      courseGroupService.exportStudents(groupId),
    onSuccess: (blob, { groupId }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `danh-sach-sinh-vien-nhom-${groupId}.xlsx`; // Assuming Excel format
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

export const useImportCourseGroupStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, file }: { groupId: number; file: File }) =>
      courseGroupService.importStudents(groupId, file),
    onSuccess: (_, { groupId }) =>
      queryClient.invalidateQueries({
        queryKey: ["course-groups", "students", groupId],
      }),
  });
};
export const useCourseGroupStudentDetail = (courseGroupId: number) => {
  const query = useQuery({
    queryKey: ["course-groups", "student-detail", courseGroupId],
    queryFn: () => courseGroupService.getCourseGroupStudentDetail(courseGroupId),
    select: (res) => res.data,
  });

  return {
    courseGroup: query.data || null,
    isLoading: query.isLoading,
  };
};
