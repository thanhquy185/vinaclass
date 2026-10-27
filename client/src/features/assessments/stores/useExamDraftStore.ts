import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Exam, ExamConfiguration, Question } from "@/shared/types";

interface ExamDraftState {
  /** Legacy persisted property. Keep its name to preserve existing local drafts. */
  testData: Partial<Exam> | null;
}

interface ExamDraftActions {
  initTestData: () => void;
  setTestData: (data: Partial<Exam> | null) => void;
  updateTestData: (fields: Partial<Exam>) => void;
  updateExamConfiguration: (config: Partial<ExamConfiguration>) => void;
  /** @deprecated Use updateExamConfiguration. Kept for existing integrations. */
  updateCauHinh: (config: Partial<ExamConfiguration>) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (questionId: number) => void;
  moveQuestion: (index: number, direction: "up" | "down") => void;
  resetStore: () => void;
}

const initialState: ExamDraftState = {
  testData: null,
};

export const useExamDraftStore = create<ExamDraftState & ExamDraftActions>()(
  persist(
    (set) => {
      const updateExamConfiguration = (
        newConfiguration: Partial<ExamConfiguration>,
      ) =>
        set((state) => {
          if (!state.testData) return state;

          const sanitizedConfiguration = { ...newConfiguration };

          if (sanitizedConfiguration.limitQuestionsPerPage !== undefined) {
            sanitizedConfiguration.limitQuestionsPerPage = Number(
              sanitizedConfiguration.limitQuestionsPerPage,
            );
          }

          if (sanitizedConfiguration.allowBackLastQuestion !== undefined) {
            sanitizedConfiguration.allowBackLastQuestion = Number(
              sanitizedConfiguration.allowBackLastQuestion,
            );
          }

          return {
            testData: {
              ...state.testData,
              examConfiguration: {
                ...(state.testData.examConfiguration || {}),
                ...sanitizedConfiguration,
              } as ExamConfiguration,
            },
          };
        });

      return {
        ...initialState,

        initTestData: () => {
          const defaultData: Partial<Exam> = {
            examName: "",
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
            testData: state.testData
              ? { ...state.testData, ...fields }
              : fields,
          })),

        updateExamConfiguration,
        updateCauHinh: updateExamConfiguration,

        setQuestions: (questions) =>
          set((state) => ({
            testData: state.testData
              ? { ...state.testData, questions }
              : state.testData,
          })),

        addQuestion: (question) =>
          set((state) => {
            if (!state.testData) return state;
            const currentQuestions = state.testData.questions || [];

            if (currentQuestions.some((item) => item.id === question.id)) {
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
                    (question) => question.id !== questionId,
                  ),
                }
              : state.testData,
          })),

        moveQuestion: (index, direction) =>
          set((state) => {
            if (!state.testData?.questions) return state;

            const questions = [...state.testData.questions];
            const targetIndex = direction === "up" ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= questions.length) {
              return state;
            }

            [questions[index], questions[targetIndex]] = [
              questions[targetIndex],
              questions[index],
            ];

            return {
              testData: { ...state.testData, questions },
            };
          }),

        resetStore: () => set(initialState),
      };
    },
    {
      name: "dethi-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
