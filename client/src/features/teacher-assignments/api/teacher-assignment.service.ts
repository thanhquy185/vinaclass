import type { ApiResponse, Subject } from "@/shared/types";
import type {
  AssignmentOverviewParams,
  AssignmentOverviewResponse,
  TeacherSubject,
  AssignmentRequest,
} from "@/features/teacher-assignments/types/teacherAssignment";
import axiosClient from "@/shared/api/axios";

export const teacherAssignmentService = {
  getOverview: (
    params: AssignmentOverviewParams,
  ): Promise<ApiResponse<AssignmentOverviewResponse>> =>
    axiosClient.get("/teacher-assignments/overview", {
      params: {
        search_by: params.searchBy,
        search: params.searchTerm || undefined,
        page: params.page,
        per_page: params.pageSize,
      },
    }),

  getAllAssignments: (): Promise<ApiResponse<TeacherSubject[]>> =>
    axiosClient.get("/teacher-assignments"),

  getSubjectsByTeacher: (teacherId: number): Promise<ApiResponse<Subject[]>> =>
    axiosClient.get(`/teacher-assignments/teacher/${teacherId}`),

  syncAssignments: (data: AssignmentRequest) =>
    axiosClient.post("/teacher-assignments/sync", {
      teacher_id: data.teacherId,
      subject_ids: data.subjectIds,
    }),

  deleteAssignment: ({
    teacherId,
    subjectId,
  }: {
    teacherId: number;
    subjectId: number;
  }): Promise<ApiResponse<number>> =>
    axiosClient.delete(`/teacher-assignments/${teacherId}/${subjectId}`),
};
