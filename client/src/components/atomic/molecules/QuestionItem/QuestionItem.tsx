import { useState } from "react";
import { Button, Icon } from "@/components/atomic/atoms";
import type { Question, QuestionStatus } from "@/types";
import { formatDateTimeVN } from "@/utils";
import { BodyQuestionItem } from "../BodyQuestionItem/BodyQuestionItem";
import { useTranslation } from "react-i18next";

interface QuestionItemProps {
  data: Question;
  onEdit?: (data: Question) => void;
  onDelete?: (data: Question) => void;
  onAddToBank?: (data: Question) => void;
  onPublicQuestion?: (data: Question) => void;
  onArchiveQuestion?: (data: Question) => void;
  onRestoreQuestion?: (data: Question) => void;
  tab: QuestionStatus;
  actions: string[];
}

const QuestionItem = ({
  data,
  onEdit,
  onDelete,
  onAddToBank,
  onPublicQuestion,
  onArchiveQuestion,
  onRestoreQuestion,
  tab,
  actions,
}: QuestionItemProps) => {
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(false);
  const isPublic = tab === "public";
  const isPrivate = tab === "private";
  const isArchive = tab === "archive";

  return (
    <div className="flex flex-col rounded-md bg-background-body-background px-3">
      {/* Header */}
      <div className="flex justify-between border-b border-other-outlined-border p-5">
        <span className="text-caption rounded-sm border border-text-secondary px-2 py-1 text-text-secondary">
          {data.difficulty?.difficultyName}
        </span>
        <span className="text-body-1 text-text-secondary">
          {data.subject?.subjectName}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col px-2">
        <BodyQuestionItem data={data} showAnswer={showAnswer} />

        {/* Actions */}
        <div className="flex items-center justify-between py-2">
          <div className="flex gap-2">
            <Button
              variant="text"
              color="primary"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer
                ? t("questionItem.hideAnswer")
                : t("questionItem.showAnswer")}
            </Button>

            {isPrivate && actions.includes("update") && (
              <Button
                variant="text"
                color="primary"
                onClick={() => onEdit?.(data)}
              >
                {t("questionItem.edit")}
              </Button>
            )}

            {isPrivate && (
              <Button
                variant="text"
                color="primary"
                onClick={() => onArchiveQuestion?.(data)}
              >
                {t("questionItem.archive")}
              </Button>
            )}

            {isArchive && actions.includes("delete") && (
              <Button
                variant="text"
                color="primary"
                onClick={() => onDelete?.(data)}
              >
                {t("questionItem.delete")}
              </Button>
            )}

            {isPublic && (
              <Button
                variant="text"
                color="primary"
                onClick={() => onAddToBank?.(data)}
              >
                {t("questionItem.addToBank")}
              </Button>
            )}

            {isPrivate && (
              <Button
                variant="text"
                color="primary"
                onClick={() => onPublicQuestion?.(data)}
              >
                {t("questionItem.makePublic")}
              </Button>
            )}

            {isArchive && (
              <Button
                variant="text"
                color="primary"
                onClick={() => onRestoreQuestion?.(data)}
              >
                {t("questionItem.restoreToBank")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 text-text-secondary">
            <span>{formatDateTimeVN(data.createdAt || "")} ·</span>
            {data.status === "public" ? (
              <Icon name="word" size={16} />
            ) : data.status === "private" ? (
              <Icon name="user" size={16} />
            ) : (
              <Icon name="lock" size={16} />
            )}
            <span>· {t("questionItem.usage", { count: data.usageCount })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionItem;
