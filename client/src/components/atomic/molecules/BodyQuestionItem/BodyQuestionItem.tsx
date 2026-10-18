import { Icon } from "@/components/atomic/atoms"; // Giả định đường dẫn Icon của bạn
import type { Question } from "@/types";

interface BodyQuestionItemProps {
  data: Question;
  showAnswer?: boolean;
  className?: string;
  index?: number; // Số thứ tự câu hỏi (nếu cần)
}

export const BodyQuestionItem = ({
  data,
  showAnswer = false,
  className = "",
  index,
}: BodyQuestionItemProps) => {
  return (
    <div
      className={`flex flex-col border-other-outlined-border px-2 py-4 ${
        showAnswer ? "" : ""
      } ${className}`}
    >
      {/* Nội dung câu hỏi */}
      <div className="flex gap-2">
        {index !== undefined && (
          <span className="text-body-2-semibold text-text-primary">
            Câu {index}:
          </span>
        )}
        <span
          className="text-body-2 font-medium text-text-primary"
          dangerouslySetInnerHTML={{ __html: data.questionContent }}
        ></span>
      </div>

      {/* Danh sách đáp án */}
      {showAnswer && data.answerOptions && (
        <div className="mt-4 flex flex-col gap-1">
          {data.answerOptions.map((ans, idx) => {
            const label = String.fromCharCode(65 + idx); // A, B, C, D...

            return (
              <div
                key={ans.id || idx}
                className={`text-body-2 flex max-w-[700px] items-center justify-between gap-10 rounded-md px-3 py-2 transition-colors ${
                  ans.isCorrectAnswer
                    ? "bg-action-hover text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                <span>
                  <strong className="mr-1">{label}.</strong>
                  {ans.optionContent}
                </span>

                {ans.isCorrectAnswer && (
                  <Icon
                    name="success" // Đảm bảo tên icon khớp với thư viện của bạn
                    size={20}
                    className="text-alert-success-content"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
