import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { BodyQuestionItem } from "@/shared/components/questions/QuestionBody";
import type { Question } from "@/shared/types";
import { useTranslation } from "react-i18next";

interface SelectedExamQuestionListProps {
  questions: Question[];
  isViewMode: boolean;
  onMoveQuestion: (index: number, direction: "up" | "down") => void;
  onRemoveQuestion: (questionId: number) => void;
}

export function SelectedExamQuestionList({
  questions,
  isViewMode,
  onMoveQuestion,
  onRemoveQuestion,
}: SelectedExamQuestionListProps) {
  const { t } = useTranslation();

  return (
    <div className="px-5">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="flex min-w-0 items-start gap-4 border-b border-other-outlined-border py-4"
        >
          <BodyQuestionItem
            data={question}
            showAnswer
            index={index + 1}
            uniformAnswerBackground
            className="w-full min-w-0 flex-1"
          />

          {!isViewMode && (
            <div className="mt-4 flex shrink-0 flex-col gap-0">
              <Button
                variant="contained"
                color="primary"
                size="medium"
                className="!h-9 !w-9 !rounded-none !p-0 !shadow-none"
                aria-label={t("addQuestionTestPage.tooltips.moveUp")}
                disabled={isViewMode || index === 0}
                onClick={() => onMoveQuestion(index, "up")}
                tooltip={t("addQuestionTestPage.tooltips.moveUp")}
                isToolTipLeft
              >
                <ArrowUp size={18} />
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                className="!h-9 !w-9 !rounded-none !p-0 !shadow-none"
                aria-label={t("addQuestionTestPage.tooltips.moveDown")}
                disabled={isViewMode || index === questions.length - 1}
                onClick={() => onMoveQuestion(index, "down")}
                tooltip={t("addQuestionTestPage.tooltips.moveDown")}
                isToolTipLeft
              >
                <ArrowDown size={18} />
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                className="!h-9 !w-9 !rounded-none !p-0 !shadow-none"
                aria-label={t("addQuestionTestPage.tooltips.removeFromTest")}
                disabled={isViewMode}
                onClick={() => onRemoveQuestion(question.id)}
                tooltip={t("addQuestionTestPage.tooltips.removeFromTest")}
                isToolTipLeft
              >
                <Trash2 size={18} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
