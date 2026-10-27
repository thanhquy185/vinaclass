import { CheckCircle2, XCircle } from "lucide-react";
import { RadioButton } from "@/shared/components/ui";
import type { Question } from "@/shared/types";
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml";
import { useTranslation } from "react-i18next";

export interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  userAnswer: number | null;
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
  const { t } = useTranslation("common");

  return (
    <div
      className={`min-w-0 overflow-hidden border-other-outlined-border bg-background-paper text-text-secondary ${!isFlatMode ? "rounded-xl border shadow-sm" : "border-b"}`}
    >
      {/* Header */}
      {!isReviewMode && (
        <div className="flex items-center justify-between gap-3 border-b border-other-outlined-border bg-background-body-background px-4 py-3 sm:px-5">
          <span className="text-body-2 font-semibold text-text-primary">
            {t("examTaking.questionIndex", {
              current: index + 1,
              total: totalQuestions,
            })}
          </span>
        </div>
      )}

      <div className="text-body-2 p-4 sm:p-6">
        <div className="mb-5 break-words font-medium leading-relaxed text-text-primary">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(question.questionContent),
            }}
          />
        </div>

        <div className="space-y-2">
          {question.answerOptions.map((opt, i) => {
            const isSelected = opt.id === userAnswer;
            const isCorrectOpt = opt.isCorrectAnswer;

            // Apply review-state colors.
            let rowStyle = "";
            let textStyle = "text-text-secondary";

            if (isReviewMode) {
              if (isCorrectOpt) {
                // Correct answers use a green highlight.
                rowStyle = "bg-success-background border border-green-200";
                textStyle = "text-green-700 font-bold";
              } else if (isSelected && !isCorrectOpt) {
                // Incorrect selected answers use a red highlight.
                rowStyle = "bg-error-background border border-red-200";
                textStyle = "text-red-700 font-bold";
              }
            } else {
              // Apply active-attempt colors.
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
                className={`group flex min-w-0 items-center justify-between gap-3 rounded-lg p-3 transition-colors ${rowStyle} ${
                  !isReviewMode
                    ? "cursor-pointer hover:bg-action-hover"
                    : "cursor-default"
                }`}
                onClick={() =>
                  !isReviewMode && onAnswerChange?.(question.id, opt.id)
                }
              >
                <div className="flex min-w-0 items-start gap-3">
                  <RadioButton
                    name={question.id.toString()}
                    checked={isSelected}
                    disabled={isReviewMode}
                    onChange={() =>
                      !isReviewMode && onAnswerChange?.(question.id, opt.id)
                    }
                  />

                  <div
                    className={`flex min-w-0 items-start gap-1 ${textStyle}`}
                  >
                    <span className="mr-1 font-bold uppercase">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <div
                      className="min-w-0"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(opt.optionContent),
                      }}
                    />
                  </div>
                </div>

                {/* Review status icon */}
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
