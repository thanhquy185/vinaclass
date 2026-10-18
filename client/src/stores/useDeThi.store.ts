import type { ExamConfiguration, Exam, Question } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DeThiState {
  testData: Partial<Exam> | null;
}

interface DeThiActions {
  initTestData: () => void;

  setTestData: (data: Partial<Exam> | null) => void;

  updateTestData: (fields: Partial<Exam>) => void;

  updateCauHinh: (config: Partial<ExamConfiguration>) => void;

  // Actions cho Questions
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (questionId: number) => void;
  moveQuestion: (index: number, direction: "up" | "down") => void;

  resetStore: () => void;
}

const initialState: DeThiState = {
  testData: null,
};

export const useDeThiStore = create<DeThiState & DeThiActions>()(
  persist(
    (set) => ({
      ...initialState,

      initTestData: () => {
        const defaultData: Partial<Exam> = {
          examName: "",
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Mặc định sau 1 tiếng
          durationMinutes: 60,
          courseGroups: [],
          questions: [],
          examConfiguration: {
            examConfigurationId: -1,
            examId: -1,
            hasMonitoring: false,
            allowCopy: true,
            allowPrint: true,
            isEnableResume: false,
            shuffleQuestions: true,
            shuffleAnswers: true,
            showScore: true,
            showDetailResults: false,
            isLimitSwitchTab: false,
            tabSwitchLimit: 3,
            messageOnWarning: "Bạn đã vi phạm quy chế thi!",
            limitQuestionsPerPage: -1,
            allowBackLastQuestion: 1,
          },
        };
        set({ testData: defaultData });
      },

      setTestData: (data) => set({ testData: data }),

      updateTestData: (fields) =>
        set((state) => ({
          testData: state.testData ? { ...state.testData, ...fields } : fields,
        })),

      updateCauHinh: (newConfig) =>
        set((state) => {
          if (!state.testData) return state;

          // Đảm bảo các giá trị số luôn là number (tránh lỗi string từ input)
          const sanitizedConfig = { ...newConfig };

          if (sanitizedConfig.limitQuestionsPerPage !== undefined) {
            sanitizedConfig.limitQuestionsPerPage = Number(
              sanitizedConfig.limitQuestionsPerPage
            );
          }

          if (sanitizedConfig.allowBackLastQuestion !== undefined) {
            sanitizedConfig.allowBackLastQuestion = Number(
              sanitizedConfig.allowBackLastQuestion
            );
          }

          return {
            testData: {
              ...state.testData,
              examConfiguration: {
                // Fallback về object rỗng nếu cau_hinh_thi chưa tồn tại
                ...(state.testData.examConfiguration || {}),
                ...sanitizedConfig,
              } as ExamConfiguration,
            },
          };
        }),

      // Quản lý danh sách câu hỏi
      setQuestions: (questions) =>
        set((state) => ({
          testData: state.testData
            ? { ...state.testData, questions: questions }
            : state.testData,
        })),

      addQuestion: (question) =>
        set((state) => {
          if (!state.testData) return state;
          const currentQuestions = state.testData.questions || [];

          // Tránh thêm trùng câu hỏi dựa trên ID
          if (currentQuestions.some((q) => q.id === question.id)) {
            return state;
          }

          return {
            testData: {
              ...state.testData,
              questions: [...currentQuestions, question],
            },
          };
        }),

      removeQuestion: (questionId) =>
        set((state) => ({
          testData: state.testData
            ? {
                ...state.testData,
                questions: state.testData.questions?.filter(
                  (q) => q.id !== questionId
                ),
              }
            : state.testData,
        })),

      moveQuestion: (index, direction) =>
        set((state) => {
          if (!state.testData?.questions) return state;

          const newQuestions = [...state.testData.questions];
          const targetIndex = direction === "up" ? index - 1 : index + 1;

          // Kiểm tra điều kiện biên
          if (targetIndex < 0 || targetIndex >= newQuestions.length) {
            return state;
          }

          // Tráo đổi vị trí (Swap)
          [newQuestions[index], newQuestions[targetIndex]] = [
            newQuestions[targetIndex],
            newQuestions[index],
          ];

          return {
            testData: { ...state.testData, questions: newQuestions },
          };
        }),

      // Xóa sạch bách khi xong việc hoặc thoát luồng
      resetStore: () => set(initialState),
    }),
    {
      name: "dethi-storage",
      storage: createJSONStorage(() => localStorage),
      // Bạn có thể chọn chỉ lưu ID thay vì lưu cả Object to đùng nếu muốn:
      // partialize: (state) => ({ currentDeThiId: state.currentDeThiId }),
    }
  )
);
