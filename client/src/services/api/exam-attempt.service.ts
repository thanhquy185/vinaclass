import axiosClient from "./axios";
import type {
  ApiResponse,
  ExamAttempt,
  ExamResponseData,
  ExamReviewResponse,
} from "@/types";

export const examAttemptService = {
  startExam: ({
    studentId,
    examId,
  }: {
    studentId: number;
    examId: number;
  }): Promise<ApiResponse<ExamAttempt>> => {
    return axiosClient.post("/exam-attempts/start-test", {
      student_id: studentId,
      exam_id: examId,
    });
  },

  updateAnswers: (
    examAttemptId: number,
    answers: { questionId: number; answerId: number }[]
  ): Promise<ApiResponse<null>> => {
    return axiosClient.put(`/exam-attempts/update-student-test/${examAttemptId}`, {
      answers: answers.map(({ questionId, answerId }) => ({
        question_id: questionId,
        answer_id: answerId,
      })),
    });
  },

  submitExam: (
    examAttemptId: number,
    answers: { questionId: number; answerId: number }[]
  ): Promise<ApiResponse<ExamResponseData>> => {
    return axiosClient.put(`/exam-attempts/submit-test/${examAttemptId}`, {
      answers: answers.map(({ questionId, answerId }) => ({
        question_id: questionId,
        answer_id: answerId,
      })),
    });
  },

  updateAttemptLog: (
    examAttemptId: number,
    payload: { tabSwitchCount: number }
  ): Promise<ApiResponse<number>> => {
    return axiosClient.put(`/exam-attempt-logs/${examAttemptId}`, {
      tab_switch_count: payload.tabSwitchCount,
    });
  },

  getReviewResult: (
    examAttemptId: number
  ): Promise<ApiResponse<ExamResponseData>> => {
    return axiosClient.get(`/exam-attempts/review-result/${examAttemptId}`);
  },

  getAllAttempts: (): Promise<ApiResponse<ExamAttempt[]>> =>
    axiosClient.get("/exam-attempts"),

  getAttemptsByCourseGroupAndExam: (
    courseGroupId: number,
    examId: number
  ): Promise<ApiResponse<ExamReviewResponse>> => {
    return axiosClient.get(
      `/exam-attempts/get-by-course-group-exam/${courseGroupId}/${examId}`
    );
  },
};
