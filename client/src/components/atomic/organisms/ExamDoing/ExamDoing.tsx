import { useNavigate } from "react-router-dom";
import Logo from "../../molecules/Logo/Logo";
import { Button, Icon } from "../../atoms";
import { useExamStore } from "@/stores/useExamStore";
import { useState, useEffect, useRef, useMemo } from "react";
import { AlertTriangle, ShieldAlert, List, Maximize2 } from "lucide-react";
import QuestionCard from "../../molecules/QuestionCard/QuestionCard";
import { useDeThiStore } from "@/stores/useDeThi.store";
import type { Question } from "@/types";
import { shuffleArray } from "@/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useExamActions } from "@/hooks/useExamActions";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useConfirmStore } from "@/stores/useConfirm.store";

export const ExamDoing = () => {
  const navigate = useNavigate();
  const { openConfirm } = useConfirmStore(); // Lấy hàm openConfirm

  // 1. Kết nối Final Store
  const {
    mode,
    currentExam,
    answers,
    updateAnswer: updateStoreAnswer,
    addViolation,
    finishExam,
    startExam,
    setFinalResult,
  } = useExamStore();

  const { user } = useAuthStore();

  const { testData } = useDeThiStore();
  // State mới để lưu danh sách câu hỏi đã qua xử lý đảo
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  // Lấy số lần vi phạm từ Store
  const violationCount = currentExam?.examAttemptLog?.tabSwitchCount || 0;

  const [timeLeft, setTimeLeft] = useState(
    (testData?.durationMinutes || 0) * 60
  );
  const [showWarning, setShowWarning] = useState(false);
  const [showKicked, setShowKicked] = useState(false);
  const isTabOut = useRef(false);
  const {
    updateAnswer: syncAnswerToApi,
    submitExam: apiSubmit,
    updateViolation,
  } = useExamActions();
  // const [isMouseOut, setIsMouseOut] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const config = testData?.examConfiguration;

    // CHỈ CHẠY NẾU CÓ CẤU HÌNH GIÁM SÁT
    if (config?.hasMonitoring) {
      const enterFullscreen = async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (err) {
          console.error("Không thể bật chế độ toàn màn hình:", err);
        }
      };

      enterFullscreen();

      // (Tùy chọn) Chặn phím Esc hoặc cảnh báo khi thoát Fullscreen
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          // Nếu người dùng thoát Fullscreen khi đang bị giám sát:
          // Bạn có thể hiện Modal bắt buộc quay lại hoặc tính là 1 lần vi phạm
          setShowWarning(true);
        }
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      };
    }
  }, [testData?.examConfiguration]);

  // 1. Guard & Timer & Start Exam
  useEffect(() => {
    // Nếu chưa có dữ liệu bài làm hoặc đã nộp, đá về trang hướng dẫn
    if (!currentExam || currentExam.status === "SUBMITTED") {
      navigate(`/tests/${testData?.id}/take`, { replace: true });
      return;
    }
    // --- LOGIC ĐẢO DỮ LIỆU ---
    const config = testData?.examConfiguration;
    let finalQuestions = testData?.questions ? [...testData.questions] : [];

    // 1. Đảo câu hỏi
    if (config?.shuffleQuestions) {
      finalQuestions = shuffleArray(finalQuestions);
    }

    // 2. Đảo đáp án trong từng câu hỏi
    if (config?.shuffleAnswers) {
      finalQuestions = finalQuestions.map((q) => ({
        ...q,
        cau_tra_lois: shuffleArray(q.answerOptions),
      }));
    }

    setShuffledQuestions(finalQuestions);

    // Ghi nhận thời gian bắt đầu làm bài vào Store
    if (mode === "STUDENT") startExam();

    const timer = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(timer);
          handleFinish(); // Hết giờ tự động nộp
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Anti-cheat Logic
  useEffect(() => {
    const config = testData?.examConfiguration;

    // Nếu không yêu cầu giám sát hoặc giới hạn tab thì không chạy logic này
    if (!config?.hasMonitoring && !config?.isLimitSwitchTab) return;

    const handleAction = () => {
      if (document.hidden || !document.hasFocus()) {
        isTabOut.current = true;
      } else if (isTabOut.current) {
        isTabOut.current = false;

        // Chỉ cộng vi phạm nếu có bật tính năng giới hạn tab
        if (config.isLimitSwitchTab) {
          addViolation();

          const newCount = violationCount + 1;
          const examId = currentExam?.id; // Lấy ID của bản ghi log

          if (examId && mode === "STUDENT") {
            updateViolation({ examAttemptId: examId, count: newCount });
          }

          const limit = config.tabSwitchLimit || 3;

          if (violationCount + 1 >= limit) {
            setShowKicked(true);
          } else {
            setShowWarning(true);
          }
        }
      }
    };

    window.addEventListener("visibilitychange", handleAction);
    window.addEventListener("focus", handleAction);
    return () => {
      window.removeEventListener("visibilitychange", handleAction);
      window.removeEventListener("focus", handleAction);
    };
  }, [
    violationCount,
    addViolation,
    testData?.examConfiguration,
    currentExam?.id,
    mode,
    updateViolation,
  ]);

  useEffect(() => {
    const config = testData?.examConfiguration;

    // Nếu allowCopy là false (nghĩa là đang BẬT chế độ chặn)
    if (config?.allowCopy === false) {
      const handlePrevent = (e: Event) => {
        e.preventDefault();
        // Tùy chọn: Hiển thị một toast thông báo "Hành động này bị cấm"
      };

      // 1. Chặn Chuột phải (Context Menu)
      document.addEventListener("contextmenu", handlePrevent);

      // 2. Chặn Copy & Paste
      document.addEventListener("copy", handlePrevent);
      document.addEventListener("paste", handlePrevent);

      // 3. Chặn các tổ hợp phím tắt (Ctrl+C, Ctrl+V, Ctrl+P, F12, v.v.)
      const handleKeyDown = (e: KeyboardEvent) => {
        const isControl = e.ctrlKey || e.metaKey; // metaKey cho Macbook

        if (
          (isControl &&
            ["c", "v", "p", "s", "u"].includes(e.key.toLowerCase())) ||
          e.key === "F12"
        ) {
          e.preventDefault();
        }
      };
      document.addEventListener("keydown", handleKeyDown);

      // 4. Chặn Print (Sử dụng CSS để ẩn nội dung khi in)
      const style = document.createElement("style");
      style.innerHTML = "@media print { body { display: none !important; } }";
      document.head.appendChild(style);

      // Cleanup khi unmount
      return () => {
        document.removeEventListener("contextmenu", handlePrevent);
        document.removeEventListener("copy", handlePrevent);
        document.removeEventListener("paste", handlePrevent);
        document.removeEventListener("keydown", handleKeyDown);
        document.head.removeChild(style);
      };
    }
  }, [testData?.examConfiguration]);

  const { startLoading, stopLoading } = useLoadingStore();

  const handleFinish = async () => {
    if (!currentExam?.id) return;

    startLoading();
    try {
      // 1. Format đáp án để gửi lên API
      const formattedAnswers = Object.entries(answers).map(([qId, aId]) => ({
        questionId: Number(qId),
        answerId: aId!,
      }));

      if (mode === "STUDENT") {
        // 2. Gọi API và lấy nguyên cục ExamResponseData
        const response = await apiSubmit({
          examAttemptId: currentExam.id,
          answers: formattedAnswers,
        });

        if (response.success) {
          // 3. Đổ nguyên cục data server vào Store qua hàm bạn đã viết
          setFinalResult(response.data);

          // 4. Thoát Fullscreen sau khi đã lưu xong data
          if (document.fullscreenElement) {
            await document.exitFullscreen().catch(() => {});
          }

          // 5. Chuyển trang dùng replace để không Back lại được
          navigate(`/tests/${testData?.id}/take/result/${currentExam.id}`, {
            replace: true,
          });
        }
      } else {
        // Chế độ PREVIEW: Truyền shuffledQuestions vào để Store tự tính toán
        finishExam(shuffledQuestions);

        if (document.fullscreenElement)
          await document.exitFullscreen().catch(() => {});

        // Vẫn chuyển sang trang result để xem thử giao diện kết quả
        navigate(`/tests/${testData?.id}/take/result/${currentExam.id}`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      // Bạn nên thêm thông báo lỗi ở đây (ví dụ: Toast)
    } finally {
      stopLoading();
    }
  };

  const handleAnswerChange = (cauHoiId: number, dapAnId: number) => {
    // 1. Cập nhật local store ngay lập tức (UI update)
    updateStoreAnswer(cauHoiId, dapAnId);

    // 2. Gọi API cập nhật (đã có optimistic update trong useExamActions)
    if (currentExam?.id && mode === "STUDENT") {
      syncAnswerToApi({
        examAttemptId: currentExam.id,
        answers: [{ questionId: cauHoiId, answerId: dapAnId }],
      });
    }
  };

  // Logic phân trang
  const config = testData?.examConfiguration;
  const limitPerPage = config?.limitQuestionsPerPage ?? -1;

  const displayedQuestions = useMemo(() => {
    if (limitPerPage === -1) return shuffledQuestions; // Hiển thị tất cả

    const start = currentPage * limitPerPage;
    const end = start + limitPerPage;
    return shuffledQuestions.slice(start, end);
  }, [shuffledQuestions, currentPage, limitPerPage]);

  const totalPages =
    limitPerPage === -1
      ? 1
      : Math.ceil(shuffledQuestions.length / limitPerPage);
  const isLastPage = currentPage === totalPages - 1;
  const isFirstPage = currentPage === 0;

  // 1. Kiểm tra xem toàn bộ câu hỏi hiển thị trên trang hiện tại đã được trả lời chưa
  const isCurrentPageCompleted = () => {
    return displayedQuestions.every((q) => answers[q.id] !== undefined);
  };

  // 2. Hàm thực hiện chuyển trang (tách riêng để tái sử dụng)
  const goToNextPage = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage((p) => p + 1);
  };

  // 3. Hàm xử lý khi nhấn nút "Tiếp theo"
  const handleNextStep = () => {
    const isNotAllowedBack = config?.allowBackLastQuestion === 0;

    // Nếu KHÔNG cho quay lại và CHƯA làm hết câu hỏi ở trang này
    if (isNotAllowedBack && !isCurrentPageCompleted()) {
      openConfirm({
        title: "Chưa hoàn thành câu hỏi",
        message:
          "Bạn chưa chọn đáp án cho tất cả câu hỏi ở trang này. Nếu tiếp tục, bạn sẽ không thể quay lại để sửa. Bạn có chắc chắn muốn sang trang tiếp theo?",
        type: "warning",
        confirmLabel: "Tiếp tục",
        cancelLabel: "Ở lại làm tiếp",
        onConfirm: goToNextPage, // Nếu xác nhận thì mới cho qua
      });
      return;
    }

    // Nếu cho phép quay lại hoặc đã làm hết thì đi tiếp luôn
    goToNextPage();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden text-text-secondary">
      {/* 1. Logo Header */}
      <header className="flex justify-center px-4">
        <div className="w-[668px] pb-6 pt-6">
          {" "}
          <Logo classname="text-text-secondary font-bold" />
        </div>
      </header>

      <main
        // onMouseLeave={() => setIsMouseOut(true)}
        // onMouseEnter={() => setIsMouseOut(false)}
        className="flex w-fit flex-col items-center px-4 py-5 text-text-secondary"
      >
        <div className="w-full max-w-[668px]">
          {/* 2. Title */}
          <h1 className="text-h5 pb-3">{testData?.examName}</h1>

          <div className="text-body-2 mb-6 flex items-center gap-2">
            <Icon name="user" />
            <span>{user?.fullName}</span>
          </div>

          {/* 3. Status Bar (Timer & Actions) */}
          <div className="flex-bet-center mb-8">
            {/*  */}
            <div className="flex items-center gap-2 rounded-full border border-other-outlined-border bg-background-body-background px-3 py-2">
              <Icon name="user" size={16} />

              <span className="text-body-2">
                <span className="mr-1.5 font-bold"> Time left: </span>
                <span>
                  {Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </span>
            </div>

            {/*  */}
            <div className="text-body-2 flex items-center gap-4">
              <Button
                size={"small"}
                className="flex items-center gap-2 hover:underline"
                color={"primary"}
              >
                <List size={18} /> Xem tất cả câu hỏi
              </Button>
              <Button size={"small"}>
                <Maximize2 size={18} />
              </Button>
            </div>
          </div>

          {/* 4. Questions List */}
          <div className="space-y-8">
            {displayedQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={
                  limitPerPage === -1 ? idx : currentPage * limitPerPage + idx
                }
                totalQuestions={shuffledQuestions.length}
                userAnswer={answers[q.id]}
                onAnswerChange={handleAnswerChange} // Truyền thẳng hàm từ Store vào
              />
            ))}
          </div>

          {/* 5. Navigation & Finish Button */}
          <div className="mb-20 mt-12 flex items-center justify-between border-t border-other-outlined-border pt-8">
            <div className="flex flex-col gap-1">
              <div className="flex gap-3">
                {limitPerPage !== -1 && !isFirstPage && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={config?.allowBackLastQuestion === 0}
                  >
                    Câu trước
                  </Button>
                )}
              </div>
              {/* Hiển thị số trang để sinh viên dễ theo dõi */}
              {limitPerPage !== -1 && (
                <span className="text-caption text-text-disabled">
                  Trang {currentPage + 1} / {totalPages}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {/* Nút Tiếp theo */}
              {limitPerPage !== -1 && !isLastPage && (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleNextStep} // Sử dụng hàm handle mới
                >
                  Tiếp theo
                </Button>
              )}

              {/* Nút Nộp bài */}
              {(limitPerPage === -1 || isLastPage) && (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    // Nếu chưa làm hết mà bấm nộp, hiện cảnh báo Danger
                    if (!isCurrentPageCompleted()) {
                      openConfirm({
                        title: "Xác nhận nộp bài",
                        message:
                          "Bạn vẫn còn câu hỏi chưa hoàn thành. Bạn có chắc chắn muốn nộp bài ngay bây giờ không?",
                        type: "danger",
                        confirmLabel: "Nộp ngay",
                        cancelLabel: "Kiểm tra lại",
                        onConfirm: handleFinish,
                      });
                    } else {
                      // Nếu đã làm hết thì hiện confirm nhẹ nhàng hơn
                      openConfirm({
                        title: "Hoàn tất bài thi",
                        message:
                          "Bạn có chắc chắn muốn nộp bài và kết thúc bài thi tại đây?",
                        type: "info",
                        confirmLabel: "Xác nhận nộp",
                        onConfirm: handleFinish,
                      });
                    }
                  }}
                >
                  Nộp bài
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Overlay nhắc nhở khi chuột ra ngoài */}
        {/* {isMouseOut && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-500/60 backdrop-blur-[4px] transition-all duration-300">
            <div className="animate-in zoom-in flex flex-col items-center gap-4 rounded-2xl bg-[#444] p-10 text-white shadow-2xl duration-200">
              <div className="mb-2 rounded-xl border-2 border-dashed border-white/50 p-4">
                <MousePointer2 size={48} className="animate-pulse" />
              </div>
              <h2 className="text-center text-2xl font-bold tracking-tight">
                Please stay in the Test
              </h2>
            </div>
          </div>
        )} */}
      </main>

      {/* 6. Modals & Popups */}
      {showKicked ? (
        <ViolationModal
          maxCount={testData?.examConfiguration?.tabSwitchLimit || 999}
          type="kicked"
          count={violationCount}
          onConfirm={handleFinish}
        />
      ) : showWarning ? (
        <ViolationModal
          maxCount={testData?.examConfiguration?.tabSwitchLimit || 999}
          type="warning"
          count={violationCount}
          onConfirm={() => setShowWarning(false)}
        />
      ) : null}
    </div>
  );
};

interface ViolationModalProps {
  type: "warning" | "kicked";
  count: number;
  maxCount: number;
  onConfirm: () => void;
}

const ViolationModal = ({
  type,
  count,
  onConfirm,
  maxCount,
}: ViolationModalProps) => {
  const isKicked = type === "kicked";

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm transition-all ${isKicked ? "bg-black/70" : "bg-black/40"}`}
    >
      <div
        className={`flex w-full max-w-sm flex-col items-center rounded-2xl bg-background-body-background p-8 text-center shadow-2xl duration-200 animate-in zoom-in ${isKicked ? "border-t-4 border-error-main" : ""}`}
      >
        {/* Icon thay đổi theo type */}
        {isKicked ? (
          <ShieldAlert size={60} className="mb-4 text-error-main" />
        ) : (
          <AlertTriangle size={50} className="mb-4 text-warning-main" />
        )}

        {/* Tiêu đề */}
        <h2
          className={`text-h5 mb-2 font-bold ${isKicked ? "text-error-main" : "text-text-primary"}`}
        >
          {isKicked ? "Đình chỉ thi!" : "Cảnh báo vi phạm!"}
        </h2>

        {/* Nội dung tin nhắn */}
        <p className="text-body-2 mb-8 text-text-secondary">
          {isKicked
            ? "Bạn đã vi phạm quá 3 lần quy chế thoát màn hình. Hệ thống tự động nộp bài."
            : `Bạn vừa rời khỏi màn hình thi. Vi phạm: ${count}/${maxCount}`}
        </p>

        {/* Nút bấm */}
        <Button
          color={isKicked ? "error" : "primary"}
          variant="contained"
          onClick={onConfirm}
        >
          {isKicked ? "Xem kết quả" : "Tôi đã hiểu"}
        </Button>
      </div>
    </div>
  );
};
