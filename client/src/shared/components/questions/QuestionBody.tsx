import { Icon } from "@/shared/components/ui";
import type { Question } from "@/shared/types";
import { cn } from "@/shared/utils/cn";
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml";

export interface BodyQuestionItemProps {
  data: Question;
  showAnswer?: boolean;
  className?: string;
  index?: number;
  uniformAnswerBackground?: boolean;
}

export const BodyQuestionItem = ({
  data,
  showAnswer = false,
  className = "",
  index,
  uniformAnswerBackground = false,
}: BodyQuestionItemProps) => {
  return (
    <div
      className={cn(
        "flex flex-col border-other-outlined-border px-2 py-4",
        className,
      )}
    >
      {/* Question content */}
      <div className="flex min-w-0 items-start gap-2">
        {index !== undefined && (
          <span className="text-body-2-semibold shrink-0 text-text-primary">
            Câu {index}:
          </span>
        )}
        <span
          className="text-body-2 min-w-0 font-medium text-text-primary"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(data.questionContent),
          }}
        ></span>
      </div>

      {/* Answer options */}
      {showAnswer && data.answerOptions && (
        <div
          className={cn(
            "mt-4 flex flex-col",
            uniformAnswerBackground ? "w-full gap-2" : "gap-1",
          )}
        >
          {data.answerOptions.map((ans, idx) => {
            const label = String.fromCharCode(65 + idx);

            return (
              <div
                key={ans.id || idx}
                className={cn(
                  "text-body-2 flex max-w-[700px] items-center justify-between gap-10 rounded-md px-3 py-2 transition-colors",
                  uniformAnswerBackground && "w-full bg-action-hover",
                  ans.isCorrectAnswer
                    ? "bg-action-hover text-text-primary"
                    : "text-text-secondary",
                )}
              >
                <span>
                  <strong className="mr-1">{label}.</strong>
                  {ans.optionContent}
                </span>

                {ans.isCorrectAnswer && (
                  <Icon
                    name="success"
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
