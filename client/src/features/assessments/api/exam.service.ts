import type {
  ApiResponse,
  CreateExamPayload,
  Exam,
  StudentExamResponse,
} from "@/shared/types";
import axiosClient from "@/shared/api/axios";

export const examService = {
  getAllExams: (): Promise<ApiResponse<Exam[]>> => axiosClient.get("/exams"),

  getExamById: (examId: number): Promise<ApiResponse<Exam>> =>
    axiosClient.get(`/exams/${examId}`),

  getExamsByStudent: (studentId: number): Promise<ApiResponse<Exam[]>> =>
    axiosClient.get(`/exams/by-student/${studentId}`),

  getExamByCourseGroupAndStudent: (
    courseGroupId: number,
    studentId: number
  ): Promise<ApiResponse<StudentExamResponse>> =>
    axiosClient.get(
      `/exams/by-course-group-and-student/${courseGroupId}/${studentId}`
    ),

  createExam: (payload: CreateExamPayload): Promise<ApiResponse<Exam>> =>
    axiosClient.post("/exams", payload),

  updateExam: (
    examId: number,
    payload: CreateExamPayload
  ): Promise<ApiResponse<Exam>> => axiosClient.put(`/exams/${examId}`, payload),

  deleteExam: (examId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/exams/${examId}`),
};
