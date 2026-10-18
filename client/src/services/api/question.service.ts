import type {
  ApiResponse,
  QuestionCreate,
  QuestionUpdate,
  Question,
} from "@/types";
import axiosClient from "./axios";

export const questionService = {
  getAllQuestions: (): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get("/questions");
  },

  getQuestionsWithPrivate: (userId: number): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get(`/questions/with-private/${userId}`);
  },

  getPublicQuestions: (): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get("/questions/all-public");
  },

  getQuestionsByTeacher: (teacherId: number): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get(`/questions/teacher/${teacherId}`);
  },

  getQuestionById: (questionId: number): Promise<ApiResponse<Question>> =>
    axiosClient.get(`/questions/${questionId}`),

  createQuestion: (data: QuestionCreate): Promise<ApiResponse<Question>> =>
    axiosClient.post("/questions", {
      subject_id: data.subjectId,
      chapter_id: data.chapterId,
      difficulty_id: data.difficultyId,
      creatorId: data.creatorId,
      question_content: data.questionContent,
      answer_explanation: data.answerExplanation,
      default_score: data.defaultScore,
      status: data.status,
      answerOptions: data.answerOptions.map((option) => ({
        option_content: option.optionContent,
        is_correct_answer: option.isCorrectAnswer,
      })),
    }),

  updateQuestion: ({
    questionId,
    data,
  }: {
    questionId: number;
    data: Partial<QuestionUpdate>;
  }): Promise<ApiResponse<Question>> =>
    axiosClient.put(`/questions/${questionId}`, {
      ...(data.subjectId !== undefined && { subject_id: data.subjectId }),
      ...(data.chapterId !== undefined && { chapter_id: data.chapterId }),
      ...(data.difficultyId !== undefined && { difficulty_id: data.difficultyId }),
      ...(data.creatorId !== undefined && { creator_id: data.creatorId }),
      ...(data.questionContent !== undefined && {
        question_content: data.questionContent,
      }),
      ...(data.answerExplanation !== undefined && {
        answer_explanation: data.answerExplanation,
      }),
      ...(data.defaultScore !== undefined && { default_score: data.defaultScore }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.answerOptions !== undefined && {
        answerOptions: data.answerOptions.map((option) => ({
          option_content: option.optionContent,
          is_correct_answer: option.isCorrectAnswer,
        })),
      }),
    }),

  updateQuestionStatus: ({
    questionId,
    data,
  }: {
    questionId: number;
    data: { status: "public" | "private" | "archive" };
  }): Promise<ApiResponse<Question>> =>
    axiosClient.patch(`/questions/${questionId}/status`, data),

  deleteQuestion: (questionId: number): Promise<ApiResponse<boolean>> =>
    axiosClient.delete(`/questions/${questionId}`),

  copyQuestionFromPublic: ({
    questionId,
    data,
  }: {
    questionId: number;
    data: { creatorId: number };
  }): Promise<ApiResponse<Question>> =>
    axiosClient.post(`/questions/${questionId}/copy`, {
      creator_id: data.creatorId,
    }),
};
