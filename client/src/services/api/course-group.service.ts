import type {
  ApiResponse,
  CourseGroup,
  User,
  CourseGroupCreate,
  CourseGroupUpdate,
  EmptyResponse,
  Exam,
  CourseGroupJoinGroup,
  CourseGroupStudentsResponse,
  CourseGroupDetailStudent,
} from "@/types";
import axiosClient from "./axios";

export const courseGroupService = {
  getAllCourseGroups: (): Promise<ApiResponse<CourseGroup[]>> =>
    axiosClient.get("/course-groups"),

  getCourseGroupById: (courseGroupId: number): Promise<ApiResponse<CourseGroup>> =>
    axiosClient.get(`/course-groups/${courseGroupId}`),

  createCourseGroup: (data: CourseGroupCreate): Promise<ApiResponse<CourseGroup>> =>
    axiosClient.post("/course-groups", {
      subject_id: data.subjectId,
      group_name: data.groupName,
      notes: data.notes,
      semester: data.semester,
      academic_year: data.academicYear,
      teacher_id: data.teacherId,
      is_hidden: data.isHidden,
      is_deleted: data.isDeleted,
    }),

  updateCourseGroup: (
    courseGroupId: number,
    data: CourseGroupUpdate
  ): Promise<ApiResponse<CourseGroup>> =>
    axiosClient.put(`/course-groups/${courseGroupId}`, {
      ...(data.subjectId !== undefined && { subject_id: data.subjectId }),
      ...(data.groupName !== undefined && { group_name: data.groupName }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.semester !== undefined && { semester: data.semester }),
      ...(data.academicYear !== undefined && { academic_year: data.academicYear }),
      ...(data.teacherId !== undefined && { teacher_id: data.teacherId }),
      ...(data.isHidden !== undefined && { is_hidden: data.isHidden }),
      ...(data.isDeleted !== undefined && { is_deleted: data.isDeleted }),
    }),

  deleteCourseGroup: (courseGroupId: number): Promise<EmptyResponse> =>
    axiosClient.delete(`/course-groups/${courseGroupId}`),

  hideCourseGroup: (courseGroupId: number): Promise<EmptyResponse> =>
    axiosClient.patch(`/course-groups/hidden/${courseGroupId}`),

  getCourseGroupsByStudent: (studentId: number): Promise<ApiResponse<User>> =>
    axiosClient.get(`/course-groups/student/${studentId}`),

  getCourseGroupsByTeacher: (teacherId: number): Promise<ApiResponse<CourseGroup[]>> =>
    axiosClient.get(`/course-groups/teacher/${teacherId}`),

  getTeacherByCourseGroup: (courseGroupId: number): Promise<ApiResponse<User>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/teacher-subject`),

  getExamsByCourseGroup: (courseGroupId: number): Promise<ApiResponse<Exam[]>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/exams`),

  joinCourseGroup: (data: CourseGroupJoinGroup): Promise<EmptyResponse> =>
    axiosClient.post("/course-groups/join", {
      student_id: data.studentId,
      join_code: data.joinCode,
    }),

  resetInviteCode: (courseGroupId: number): Promise<EmptyResponse> =>
    axiosClient.patch(`/course-groups/invite-code/${courseGroupId}`),

  getStudentsByCourseGroup: (
    courseGroupId: number
  ): Promise<ApiResponse<CourseGroupStudentsResponse>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/students`),

  addStudentToCourseGroup: (
    courseGroupId: number,
    data: { username: string }
  ): Promise<EmptyResponse> =>
    axiosClient.post(`/course-groups/${courseGroupId}/students`, data),

  removeStudentFromCourseGroup: (
    courseGroupId: number,
    studentId: number
  ): Promise<EmptyResponse> =>
    axiosClient.delete(`/course-groups/${courseGroupId}/students`, {
      data: { student_id: studentId },
    }),

  exportStudents: (courseGroupId: number): Promise<Blob> =>
    axiosClient.get(`/course-groups/${courseGroupId}/students/export`, {
      responseType: "blob",
    }),

  importStudents: (
    courseGroupId: number,
    file: File
  ): Promise<EmptyResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(
      `/course-groups/${courseGroupId}/students/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  //   delete: (id: number): Promise<ApiResponse<boolean>> =>
  //     axiosClient.delete(`/monhocs/${id}`),

  getCourseGroupStudentDetail: (
    courseGroupId: number
  ): Promise<ApiResponse<CourseGroupDetailStudent>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/student-detail`),
};
