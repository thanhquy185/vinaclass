import { Bookmark, CheckCircle2, XCircle } from "lucide-react";
import { RadioButton } from "../../atoms/RadioButton/RadioButton";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  userAnswer: number | null; // Store lưu ID hoặc null
  isReviewMode?: boolean;
  onAnswerChange?: (questionId: number, answerId: number) => void;
  isFlatMode?: boolean;
}

export default function QuestionCard({
  question,
  index,
  totalQuestions,
  userAnswer,
  isReviewMode = false,
  onAnswerChange,
  isFlatMode = false,
}: QuestionCardProps) {
  return (
    <div
      className={`min-w-[600px] overflow-hidden border-other-outlined-border text-text-secondary ${!isFlatMode ? "rounded-xl border bg-background-body-background shadow-custom" : "border-b"}`}
    >
      {/* Header */}
      {!isReviewMode && (
        <div
          className={`flex items-center justify-between border-b border-other-outlined-border bg-action-hover px-6 py-4`}
        >
          <span className="text-body-1 font-bold text-text-primary">
            Câu hỏi {index + 1} / {totalQuestions}
          </span>
          <div className="flex items-center gap-4">
            {!isReviewMode && (
              <Bookmark
                size={18}
                className="cursor-pointer text-text-disabled transition-colors hover:text-primary-main"
              />
            )}
          </div>
        </div>
      )}

      <div className="text-body-2 p-8">
        <p className="mb-6 font-medium leading-relaxed text-text-primary">
          <span className="font-bold"></span> {question.questionContent}
        </p>

        <div className="space-y-2">
          {question.answerOptions.map((opt, i) => {
            const isSelected = opt.id === userAnswer;
            const isCorrectOpt = opt.isCorrectAnswer;

            // --- Logic hiển thị màu sắc khi Review ---
            let rowStyle = "";
            let textStyle = "text-text-secondary";

            if (isReviewMode) {
              if (isCorrectOpt) {
                // Đáp án đúng luôn có màu xanh nhẹ
                rowStyle = "bg-success-background border border-green-200";
                textStyle = "text-green-700 font-bold";
              } else if (isSelected && !isCorrectOpt) {
                // Mạnh chọn sai -> Màu đỏ nhẹ
                rowStyle = "bg-error-background border border-red-200";
                textStyle = "text-red-700 font-bold";
              }
            } else {
              // Chế độ đang làm bài
              if (isSelected) {
                rowStyle = "bg-primary-50 border border-primary-200";
                textStyle = "text-primary-main font-bold";
              } else {
                rowStyle = "hover:bg-action-hover border border-transparent";
              }
            }

            return (
              <div
                key={opt.id}
                className={`*: group -ml-2 flex items-center justify-between rounded-lg p-3 transition-all ${rowStyle} ${
                  !isReviewMode
                    ? "cursor-pointer hover:bg-action-hover"
                    : "cursor-default"
                }`}
                onClick={() =>
                  !isReviewMode && onAnswerChange?.(question.id, opt.id)
                }
              >
                <div className="flex items-center gap-4">
                  <RadioButton
                    name={question.id.toString()}
                    checked={isSelected}
                    disabled={isReviewMode} // Không cho click khi đang xem kết quả
                    onChange={() =>
                      !isReviewMode && onAnswerChange?.(question.id, opt.id)
                    }
                  />

                  <span className={textStyle}>
                    <span className="mr-1 font-bold uppercase">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt.optionContent}
                  </span>
                </div>

                {/* Icon trạng thái ở cuối dòng */}
                {isReviewMode && (
                  <div className="flex items-center">
                    {isCorrectOpt && (
                      <CheckCircle2
                        size={20}
                        className="text-alert-success-content"
                      />
                    )}
                    {isSelected && !isCorrectOpt && (
                      <XCircle size={20} className="text-alert-error-content" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
