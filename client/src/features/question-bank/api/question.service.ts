import type {
  ApiResponse,
  QuestionCreate,
  QuestionUpdate,
  Question,
} from "@/shared/types";
import axiosClient from "@/shared/api/axios";
import type {
  QuestionBankFilters,
  QuestionBankPageData,
} from "@/features/question-bank/types/questionBank";

export const questionService = {
  getQuestionBank: (
    filters: QuestionBankFilters
  ): Promise<ApiResponse<QuestionBankPageData>> =>
    axiosClient.get("/questions/bank", {
      params: {
        status: filters.status,
        keyword: filters.keyword,
        search_by: filters.searchBy,
        subject_id: filters.subjectId > 0 ? filters.subjectId : undefined,
        chapter_id: filters.chapterId > 0 ? filters.chapterId : undefined,
        difficulty_id:
          filters.difficultyId > 0 ? filters.difficultyId : undefined,
        sort_order: filters.sortOrder,
        page: filters.page,
        per_page: filters.perPage,
      },
    }),

  getAllQuestions: (): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get("/questions");
  },

  getQuestionsWithPrivate: (
    userId: number
  ): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get(`/questions/with-private/${userId}`);
  },

  getPublicQuestions: (): Promise<ApiResponse<Question[]>> => {
    return axiosClient.get("/questions/all-public");
  },

  getQuestionsByTeacher: (
    teacherId: number
  ): Promise<ApiResponse<Question[]>> => {
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
      ...(data.difficultyId !== undefined && {
        difficulty_id: data.difficultyId,
      }),
      ...(data.creatorId !== undefined && { creator_id: data.creatorId }),
      ...(data.questionContent !== undefined && {
        question_content: data.questionContent,
      }),
      ...(data.answerExplanation !== undefined && {
        answer_explanation: data.answerExplanation,
      }),
      ...(data.defaultScore !== undefined && {
        default_score: data.defaultScore,
      }),
      ...(data.answerOptions !== undefined && {
        answerOptions: data.answerOptions.map((option) => ({
          ...(option.id !== undefined && { id: option.id }),
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
