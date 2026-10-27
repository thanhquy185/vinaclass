import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Exam,
  ExamAttempt,
  ExamAttemptLog,
  ExamResponseData,
  Question,
} from "@/shared/types";
import { getEqualExamQuestionScores } from "@/features/assessments/utils/exam";

interface ExamSessionState {
  currentExam: ExamAttempt | null;
  uiStatus: "INSTRUCTION" | "DOING" | "RESULT";
  mode: "STUDENT" | "PREVIEW";
  previewReturnTo: string | null;
  /** Fast lookup of the selected answer option by question ID. */
  answers: Record<number, number | null>;
  examResult: ExamResponseData | null;
}

interface ExamSessionActions {
  initExam: (examAttempt: ExamAttempt, mode?: "STUDENT" | "PREVIEW") => void;
  startExam: () => void;
  updateAnswer: (questionId: number, answerOptionId: number) => void;
  addViolation: () => void;
  finishExam: (questions: Question[]) => void;
  setFinalResult: (result: ExamResponseData) => void;
  setMode: (mode: "STUDENT" | "PREVIEW") => void;
  setPreviewReturnTo: (path: string | null) => void;
  resetExam: () => void;
}

export const useExamSessionStore = create<
  ExamSessionState & ExamSessionActions
>()(
  persist(
    (set, get) => ({
      currentExam: null,
      uiStatus: "INSTRUCTION",
      mode: "STUDENT",
      previewReturnTo: null,
      answers: {},
      examResult: null,

      initExam: (examAttempt, mode = "STUDENT") => {
        const initialAnswers: Record<number, number | null> = {};

        examAttempt.examAttemptAnswers?.forEach((answer) => {
          initialAnswers[answer.questionId] = answer.answerOptionId;
        });

        set({
          currentExam: examAttempt,
          mode,
          answers: initialAnswers,
          examResult: null,
          uiStatus:
            examAttempt.status === "SUBMITTED" ? "RESULT" : "INSTRUCTION",
        });
      },

      startExam: () => {
        const { currentExam } = get();
        if (!currentExam) return;

        set({
          uiStatus: "DOING",
          currentExam: {
            ...currentExam,
            status: "IN_PROGRESS",
            startTime: currentExam.startTime || new Date().toISOString(),
          },
        });
      },

      updateAnswer: (questionId, answerOptionId) =>
        set((state) => {
          if (!state.currentExam) return state;

          const timestamp = new Date().toISOString();
          const attemptAnswers = [
            ...(state.currentExam.examAttemptAnswers || []),
          ];
          const answerIndex = attemptAnswers.findIndex(
            (answer) => answer.questionId === questionId,
          );

          if (answerIndex > -1) {
            attemptAnswers[answerIndex] = {
              ...attemptAnswers[answerIndex],
              answerOptionId,
              updatedAt: timestamp,
            };
          } else {
            attemptAnswers.push({
              examAttemptId: state.currentExam.id,
              questionId,
              answerOptionId,
              isSelectedCorrect: false,
              score: 0,
              updatedAt: timestamp,
            });
          }

          return {
            answers: { ...state.answers, [questionId]: answerOptionId },
            currentExam: {
              ...state.currentExam,
              examAttemptAnswers: attemptAnswers,
            },
          };
        }),

      addViolation: () =>
        set((state) => {
          if (!state.currentExam) return state;

          const currentLog: ExamAttemptLog = state.currentExam
            .examAttemptLog || {
            examAttemptLogId: 0,
            examAttemptId: state.currentExam.id,
            tabSwitchCount: 0,
            createdAt: new Date().toISOString(),
          };

          return {
            currentExam: {
              ...state.currentExam,
              examAttemptLog: {
                ...currentLog,
                tabSwitchCount: currentLog.tabSwitchCount + 1,
              },
            },
          };
        }),

      setFinalResult: (result) => {
        set((state) => {
          const serverAnswers: Record<number, number | null> = {};

          if (result.questions && result.questions.length > 0) {
            result.questions.forEach((question) => {
              serverAnswers[question.id] = question.selectedAnswer ?? null;
            });
          } else {
            Object.assign(serverAnswers, state.answers);
          }

          return {
            examResult: result,
            currentExam: result.examAttempt,
            answers: serverAnswers,
            uiStatus: "RESULT",
          };
        });
      },

      finishExam: (questions) => {
        const { currentExam, answers, examResult } = get();
        if (!currentExam) return;

        let correctAnswerCount = 0;
        let totalScore = 0;
        const existingScores = questions.map((question) =>
          Number(
            (question as Question & { pivot?: { score?: number | string } })
              .pivot?.score,
          ),
        );
        const hasValidExistingScores =
          existingScores.every(
            (score) => Number.isFinite(score) && score >= 0,
          ) &&
          Math.abs(existingScores.reduce((sum, score) => sum + score, 0) - 10) <
            0.001;
        const equalScores = getEqualExamQuestionScores(questions.length);

        const processedQuestions = questions.map((question, index) => {
          const selectedAnswerId = answers[question.id];
          const correctAnswer = question.answerOptions.find(
            (answer) => answer.isCorrectAnswer,
          );
          const isCorrect = selectedAnswerId === correctAnswer?.id;

          if (isCorrect) {
            correctAnswerCount++;
            totalScore += hasValidExistingScores
              ? existingScores[index]
              : equalScores[index];
          }

          return {
            ...question,
            // Retained for the existing result view's data contract.
            dapAnDaChon: selectedAnswerId,
          };
        });

        const previewAttempt: ExamAttempt = {
          ...currentExam,
          status: "SUBMITTED",
          totalScore: Number(totalScore.toFixed(2)),
          correctAnswerCount,
          submissionTime: new Date().toISOString(),
        };

        set({
          uiStatus: "RESULT",
          currentExam: previewAttempt,
          examResult: {
            examAttempt: previewAttempt,
            exam: examResult?.exam || ({} as Exam),
            questions: processedQuestions,
          },
        });
      },

      setMode: (mode) => set({ mode }),

      setPreviewReturnTo: (previewReturnTo) => set({ previewReturnTo }),

      resetExam: () =>
        set({
          currentExam: null,
          examResult: null,
          answers: {},
          uiStatus: "INSTRUCTION",
          mode: "STUDENT",
          previewReturnTo: null,
        }),
    }),
    {
      name: "mahi-exam-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
