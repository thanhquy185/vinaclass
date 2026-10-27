import type { ApiResponse, User, EmptyResponse, Exam } from "@/shared/types";
import type {
  CourseGroup,
  AssignedTeachingResponse,
  CourseGroupCreate,
  CourseGroupUpdate,
  CourseGroupJoinRequest,
  CourseGroupStudentsResponse,
  CourseGroupStudentImportResult,
  CourseGroupDetailStudent,
  CourseGroupMaterial,
} from "@/features/classrooms/types/classrooms";
import axiosClient from "@/shared/api/axios";
import {
  mapCourseGroupCreatePayload,
  mapCourseGroupJoinPayload,
  mapCourseGroupUpdatePayload,
  mapStudentRemovalPayload,
} from "./course-group.mapper";

export const courseGroupService = {
  getAllCourseGroups: (): Promise<ApiResponse<CourseGroup[]>> =>
    axiosClient.get("/course-groups"),

  getCourseGroupById: (
    courseGroupId: number
  ): Promise<ApiResponse<CourseGroup>> =>
    axiosClient.get(`/course-groups/${courseGroupId}`),

  createCourseGroup: (
    data: CourseGroupCreate
  ): Promise<ApiResponse<CourseGroup>> =>
    axiosClient.post("/course-groups", mapCourseGroupCreatePayload(data)),

  updateCourseGroup: (
    courseGroupId: number,
    data: CourseGroupUpdate
  ): Promise<ApiResponse<CourseGroup>> =>
    axiosClient.put(
      `/course-groups/${courseGroupId}`,
      mapCourseGroupUpdatePayload(data)
    ),

  deleteCourseGroup: (courseGroupId: number): Promise<EmptyResponse> =>
    axiosClient.delete(`/course-groups/${courseGroupId}`),

  hideCourseGroup: (courseGroupId: number): Promise<EmptyResponse> =>
    axiosClient.patch(`/course-groups/hidden/${courseGroupId}`),

  getCourseGroupsByStudent: (studentId: number): Promise<ApiResponse<User>> =>
    axiosClient.get(`/course-groups/student/${studentId}`),

  getCourseGroupsByTeacher: (
    teacherId: number
  ): Promise<ApiResponse<CourseGroup[]>> =>
    axiosClient.get(`/course-groups/teacher/${teacherId}`),

  getAssignedTeaching: (
    teacherId: number,
    includeHidden = false
  ): Promise<ApiResponse<AssignedTeachingResponse>> =>
    axiosClient.get(`/course-groups/assigned/${teacherId}`, {
      params: { includeHidden },
    }),

  getTeacherByCourseGroup: (
    courseGroupId: number
  ): Promise<ApiResponse<User>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/teacher-subject`),

  getExamsByCourseGroup: (
    courseGroupId: number
  ): Promise<ApiResponse<Exam[]>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/exams`),

  joinCourseGroup: (data: CourseGroupJoinRequest): Promise<EmptyResponse> =>
    axiosClient.post("/course-groups/join", mapCourseGroupJoinPayload(data)),

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
      data: mapStudentRemovalPayload(studentId),
    }),

  exportStudents: (courseGroupId: number): Promise<Blob> =>
    axiosClient.get(`/course-groups/${courseGroupId}/students/export`, {
      responseType: "blob",
    }),

  importStudents: (
    courseGroupId: number,
    file: File
  ): Promise<ApiResponse<CourseGroupStudentImportResult>> => {
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
  getCourseGroupStudentDetail: (
    courseGroupId: number
  ): Promise<ApiResponse<CourseGroupDetailStudent>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/student-detail`),

  getMaterials: (
    courseGroupId: number
  ): Promise<ApiResponse<CourseGroupMaterial[]>> =>
    axiosClient.get(`/course-groups/${courseGroupId}/materials`),

  createMaterial: (
    courseGroupId: number,
    data: { title: string; description?: string; file: File }
  ): Promise<ApiResponse<CourseGroupMaterial>> => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("file", data.file);
    return axiosClient.post(
      `/course-groups/${courseGroupId}/materials`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  updateMaterial: (
    courseGroupId: number,
    materialId: number,
    data: { title: string; description?: string; file?: File }
  ): Promise<ApiResponse<CourseGroupMaterial>> => {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("title", data.title);
    formData.append("description", data.description ?? "");
    if (data.file) formData.append("file", data.file);
    return axiosClient.post(
      `/course-groups/${courseGroupId}/materials/${materialId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  deleteMaterial: (
    courseGroupId: number,
    materialId: number
  ): Promise<EmptyResponse> =>
    axiosClient.delete(
      `/course-groups/${courseGroupId}/materials/${materialId}`
    ),

  downloadMaterial: (
    courseGroupId: number,
    materialId: number
  ): Promise<Blob> =>
    axiosClient.get(
      `/course-groups/${courseGroupId}/materials/${materialId}/download`,
      {
        responseType: "blob",
      }
    ),
};
