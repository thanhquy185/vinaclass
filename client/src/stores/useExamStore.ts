import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ExamAttempt,
  Question,
  ExamResponseData,
  ExamAttemptLog,
  Exam,
} from "@/types";

interface ExamState {
  currentExam: ExamAttempt | null;
  uiStatus: "INSTRUCTION" | "DOING" | "RESULT";
  mode: "STUDENT" | "PREVIEW";
  // Map hỗ trợ truy vấn nhanh ID đáp án đã chọn theo ID câu hỏi
  answers: Record<number, number | null>;
  examResult: ExamResponseData | null;
}

interface ExamActions {
  // Khởi tạo bài thi & đồng bộ đáp án nếu là bài thi đang làm dở
  initExam: (baiThi: ExamAttempt, mode?: "STUDENT" | "PREVIEW") => void;

  // Bắt đầu làm bài: Cập nhật status & thời gian bắt đầu
  startExam: () => void;

  // Cập nhật đáp án: Vừa cập nhật Map answers, vừa cập nhật mảng chitiet_bailams
  updateAnswer: (cauHoiId: number, dapAnId: number) => void;

  // Ghi nhận vi phạm chuyển Tab vào LogBaiLam
  addViolation: () => void;

  // Kết thúc bài thi: Tự động tính điểm hệ 10, số câu đúng và đánh dấu đúng/sai từng câu
  finishExam: (questions: Question[]) => void;

  setFinalResult: (result: ExamResponseData) => void;

  // Xóa sạch dữ liệu (dùng khi thoát hẳn hoặc làm bài mới)
  resetExam: () => void;
}

export const useExamStore = create<ExamState & ExamActions>()(
  persist(
    (set, get) => ({
      currentExam: null,
      uiStatus: "INSTRUCTION",
      mode: "STUDENT",
      answers: {},
      examResult: null,

      initExam: (baiThi, mode = "STUDENT") => {
        const initialAnswers: Record<number, number | null> = {};

        // Nếu bài thi đã có chi tiết (trường hợp làm dở rồi quay lại)
        baiThi.examAttemptAnswers?.forEach((detail) => {
          initialAnswers[detail.questionId] = detail.answerOptionId;
        });

        set({
          currentExam: baiThi,
          mode,
          answers: initialAnswers,
          examResult: null, // Reset kết quả cũ nếu có
          uiStatus: baiThi.status === "SUBMITTED" ? "RESULT" : "INSTRUCTION",
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

      updateAnswer: (cauHoiId, dapAnId) =>
        set((state) => {
          if (!state.currentExam) return state;

          const timestamp = new Date().toISOString();
          const details = [...(state.currentExam.examAttemptAnswers || [])];
          const idx = details.findIndex((d) => d.questionId === cauHoiId);

          // Cập nhật mảng chitiet_bailams để sẵn sàng gửi lên server nếu cần
          if (idx > -1) {
            details[idx] = {
              ...details[idx],
              answerOptionId,
              updatedAt: timestamp,
            };
          } else {
            details.push({
              examAttemptId: state.currentExam.id,
              questionId,
              answerOptionId,
              isSelectedCorrect: false,
              score: 0,
              updatedAt: timestamp,
            });
          }

          return {
            answers: { ...state.answers, [cauHoiId]: dapAnId },
            currentExam: { ...state.currentExam, examAttemptAnswers: details },
          };
        }),

      addViolation: () =>
        set((state) => {
          if (!state.currentExam) return state;

          // Xử lý logic logBaiLam (Object thay vì mảng để dễ dùng ở FE)
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

          // 1. Nếu server có trả về danh sách câu hỏi (có kèm đáp án đã chọn ghi nhận trên server)
          if (result.questions && result.questions.length > 0) {
            result.questions.forEach((q) => {
              serverAnswers[q.id] = q.selectedAnswer ?? null;
            });
          } else {
            // 2. Nếu server ẩn chi tiết (cauHois trống), ta dùng lại answers hiện tại trong Store
            // để người dùng vẫn thấy được mình đã tích vào đâu (nếu cần hiển thị ở màn hình kết quả)
            Object.assign(serverAnswers, state.answers);
          }

          return {
            examResult: result, // Chứa thông tin tổng điểm, số câu đúng từ Server
            currentExam: result.examAttempt, // Thông tin bài làm (thời gian nộp, trạng thái DA_NOP)
            answers: serverAnswers,
            uiStatus: "RESULT",
          };
        });
      },

      finishExam: (questions: Question[]) => {
        const { currentExam, answers } = get();
        if (!currentExam) return;

        // 1. Tính toán kết quả ngay tại Client cho mode Preview
        let soCauDung = 0;
        const processedQuestions = questions.map((q) => {
          const selectedAnswerId = answers[q.id];
          // Tìm đáp án đúng trong danh sách câu trả lời của câu hỏi
          const correctAnswer = q.answerOptions.find((a) => a.isCorrectAnswer);
          const isCorrect = selectedAnswerId === correctAnswer?.id;

          if (isCorrect) soCauDung++;

          return {
            ...q,
            dapAnDaChon: selectedAnswerId, // Gán vào để trang Result hiển thị được
          };
        });

        const tongDiem = (soCauDung / questions.length) * 10;

        const mockBaiLam: ExamAttempt = {
          ...currentExam,
          status: "SUBMITTED",
          totalScore: Number(tongDiem.toFixed(2)),
          correctAnswerCount,
          submissionTime: new Date().toISOString(),
        };

        set({
          uiStatus: "RESULT",
          currentExam: mockBaiLam,
          // Tạo examResult giả lập để trang Result dùng chung 1 logic render
          examResult: {
            examAttempt: mockBaiLam,
            exam: get().examResult?.exam || ({} as Exam), // Lấy deThi hiện tại
            questions: processedQuestions,
          },
        });
      },

      resetExam: () =>
        set({
          currentExam: null,
          examResult: null,
          answers: {},
          uiStatus: "INSTRUCTION",
          mode: "STUDENT",
        }),
    }),
    {
      name: "mahi-exam-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
