import type {
  ApiResponse,
  TeacherSubject,
  AssignmentRequest,
  Subject,
} from "@/types";
import axiosClient from "./axios";

export const assignService = {
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