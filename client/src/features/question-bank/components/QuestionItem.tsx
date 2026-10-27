import { useState } from "react";
import { Button, Icon } from "@/shared/components/ui";
import { BodyQuestionItem } from "@/shared/components/questions/QuestionBody";
import type { Question, QuestionStatus } from "@/shared/types";
import { formatDateTimeVN } from "@/shared/utils";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/stores/useAuthStore";

export interface QuestionItemProps {
  data: Question;
  onEdit?: (data: Question) => void;
  onDelete?: (data: Question) => void;
  onAddToBank?: (data: Question) => void;
  onPublicQuestion?: (data: Question) => void;
  onArchiveQuestion?: (data: Question) => void;
  onRestoreQuestion?: (data: Question) => void;
  onMoveToPrivateQuestion?: (data: Question) => void;
  tab: QuestionStatus;
  actions: string[];
  isTeacher?: boolean;
}

const QuestionItem = ({
  data,
  onEdit,
  onDelete,
  onAddToBank,
  onPublicQuestion,
  onArchiveQuestion,
  onRestoreQuestion,
  onMoveToPrivateQuestion,
  tab,
  actions,
  isTeacher = false,
}: QuestionItemProps) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showAnswer, setShowAnswer] = useState(false);
  const isPublic = tab === "public";
  const isPrivate = tab === "private";
  const isArchive = tab === "archive";
  const canUpdate = actions.includes("update");
  const canPublish = actions.includes("publish");
  const canMoveToPrivate =
    actions.includes("update") &&
    (!isTeacher || data.creatorId === user?.id);
  const actionSize = isTeacher ? "large" : "medium";
  const actionClassName = isTeacher ? undefined : "!px-2";

  return (
    <article
      className={
        isTeacher
          ? "flex min-w-0 flex-col overflow-hidden rounded-2xl bg-background-paper px-3 shadow-[0_1px_3px_rgba(60,64,67,.12)] transition-shadow hover:shadow-[0_2px_8px_rgba(60,64,67,.16)]"
          : "flex min-w-0 flex-col overflow-hidden rounded-md border border-other-outlined-border bg-background-body-background px-3"
      }
    >
      <header
        className={
          isTeacher
            ? "flex flex-col justify-between gap-2 border-b border-other-outlined-border bg-primary-background p-4 sm:flex-row sm:items-center sm:p-5"
            : "flex flex-col justify-between gap-1 border-b border-other-outlined-border bg-background-body-background p-3 sm:flex-row sm:items-center sm:gap-2"
        }
      >
        <span
          className={
            isTeacher
              ? "inline-flex w-fit items-center rounded-full bg-background-paper px-3 py-1 text-xs font-medium text-primary-main"
              : "text-caption inline-flex w-fit items-center rounded-sm border border-text-secondary px-2 py-1 text-text-secondary"
          }
        >
          {data.difficulty?.difficultyName ??
            t("questionItem.unknownDifficulty")}
        </span>
        <span
          className={
            isTeacher
              ? "text-body-1 font-medium text-text-secondary"
              : "text-body-2 text-text-secondary"
          }
        >
          {data.subject?.subjectName ?? t("questionItem.unknownSubject")}
        </span>
      </header>

      <div className="flex min-w-0 flex-col px-2">
        <BodyQuestionItem
          data={data}
          showAnswer={showAnswer}
          className={isTeacher ? undefined : "py-2 [&_p]:my-0"}
        />

        <div
          className={
            isTeacher
              ? "flex flex-col gap-3 py-2 xl:flex-row xl:items-center xl:justify-between"
              : "flex flex-wrap items-center justify-between gap-1 py-1"
          }
        >
          <div
            className={
              isTeacher
                ? "flex flex-wrap gap-2"
                : "flex flex-wrap items-center gap-1"
            }
          >
            <Button
              variant="text"
              color="primary"
              size={actionSize}
              className={actionClassName}
              aria-expanded={showAnswer}
              onClick={() => setShowAnswer((current) => !current)}
            >
              {showAnswer
                ? t("questionItem.hideAnswer")
                : t("questionItem.showAnswer")}
            </Button>

            {isPrivate && canUpdate && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onEdit?.(data)}
              >
                {t("questionItem.edit")}
              </Button>
            )}

            {isPrivate && canUpdate && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onArchiveQuestion?.(data)}
              >
                {t("questionItem.archive")}
              </Button>
            )}

            {isArchive && actions.includes("delete") && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onDelete?.(data)}
              >
                {t("questionItem.delete")}
              </Button>
            )}

            {isPublic &&
              data.creatorId !== user?.id &&
              actions.includes("create") && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onAddToBank?.(data)}
              >
                {t("questionItem.addToBank")}
              </Button>
            )}

            {isPublic && canMoveToPrivate && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onMoveToPrivateQuestion?.(data)}
              >
                {t("questionItem.moveToPrivate")}
              </Button>
            )}

            {isPrivate && canPublish && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onPublicQuestion?.(data)}
              >
                {t("questionItem.makePublic")}
              </Button>
            )}

            {isArchive && canUpdate && (
              <Button
                variant="text"
                color="primary"
                size={actionSize}
                className={actionClassName}
                onClick={() => onRestoreQuestion?.(data)}
              >
                {t("questionItem.restoreToBank")}
              </Button>
            )}
          </div>

          <div
            className={
              isTeacher
                ? "flex flex-wrap items-center gap-1 text-text-secondary"
                : "text-caption flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap text-text-secondary"
            }
          >
            <span>
              {data.createdAt
                ? formatDateTimeVN(data.createdAt)
                : t("questionItem.unknownDate")}{" "}
              ·
            </span>
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
    </article>
  );
};

export default QuestionItem;
