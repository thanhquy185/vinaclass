import { Alert, Button, Card, Checkbox, Empty, Radio, Space, Tag } from "antd";
import type { FormInstance } from "antd";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { AnswerOption } from "@/shared/types";
import { RichTextEditor } from "@/features/question-bank/components/RichTextEditor";
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml";
import { FormField } from "@/shared/components/ui";

interface AnswerOptionsEditorProps {
  form: FormInstance;
  answers: AnswerOption[];
  isView: boolean;
  currentAnswerText: string;
  currentIsCorrect: boolean;
  editingAnswerId: number | null;
  onSetCorrectAnswer: (answerId: number) => void;
  onEditAnswer: (answer: AnswerOption) => void;
  onDeleteAnswer: (answerId: number) => void;
  onCurrentCorrectChange: (isCorrect: boolean) => void;
  onCurrentAnswerTextChange: (content: string) => void;
  onCancelAnswerEdit: () => void;
  onSaveAnswer: () => void;
  isLocked?: boolean;
  variant?: "admin" | "teacher";
  showHeading?: boolean;
}

export default function AnswerOptionsEditor({
  form,
  answers,
  isView,
  currentAnswerText,
  currentIsCorrect,
  editingAnswerId,
  onSetCorrectAnswer,
  onEditAnswer,
  onDeleteAnswer,
  onCurrentCorrectChange,
  onCurrentAnswerTextChange,
  onCancelAnswerEdit,
  onSaveAnswer,
  isLocked = false,
  variant = "admin",
  showHeading = true,
}: AnswerOptionsEditorProps) {
  const { t } = useTranslation();
  const isTeacher = variant === "teacher";

  return (
    <section
      className={
        isTeacher
          ? "flex flex-col gap-3 border-t border-other-divider pt-4"
          : "flex flex-col gap-3"
      }
    >
      {showHeading && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-base font-semibold text-text-primary">
              {t("addQuestionForm.answers.title")}
            </h3>
          </div>
          {isTeacher ? (
            <span className="shrink-0 rounded-full bg-primary-background px-3 py-1 text-xs font-medium text-primary-main">
              {t("addQuestionForm.answers.count", { count: answers.length })}
            </span>
          ) : (
            <Tag color={answers.length >= 2 ? "blue" : "default"}>
              {t("addQuestionForm.answers.count", { count: answers.length })}
            </Tag>
          )}
        </div>
      )}

      <FormField noStyle shouldUpdate>
        {() => {
          const error = form.getFieldError("answerOptions")[0];

          return error ? (
            <Alert type="error" showIcon message={t(error)} />
          ) : null;
        }}
      </FormField>

      {answers.length === 0 ? (
        isTeacher ? (
          <p className="mb-0 text-sm text-text-secondary">
            {t("addQuestionForm.answers.empty")}
          </p>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("addQuestionForm.answers.empty")}
          />
        )
      ) : (
        <div
          className={
            isTeacher
              ? "divide-y divide-other-divider border-y border-other-divider"
              : "flex flex-col gap-2"
          }
        >
          {answers.map((answer, index) => {
            const content = (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="font-semibold text-primary-main">
                  {String.fromCharCode(65 + index)}.
                </span>
                <div
                  className="prose prose-sm max-w-none flex-1"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(answer.optionContent),
                  }}
                />
                <Space wrap>
                  <Radio
                    checked={answer.isCorrectAnswer}
                    disabled={isView || isLocked}
                    onChange={() => onSetCorrectAnswer(answer.id)}
                  >
                    {t("addQuestionForm.answers.chooseCorrect")}
                  </Radio>
                  {!isView && (
                    <>
                      <Button
                        type="link"
                        disabled={isLocked}
                        onClick={() => onEditAnswer(answer)}
                      >
                        {t("addQuestionForm.answers.edit")}
                      </Button>
                      <Button
                        type="link"
                        danger
                        disabled={isLocked}
                        onClick={() => onDeleteAnswer(answer.id)}
                      >
                        {t("addQuestionForm.answers.delete")}
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            );

            return isTeacher ? (
              <div key={answer.id} className="py-3 first:pt-0 last:pb-0">
                {content}
              </div>
            ) : (
              <Card key={answer.id} size="small" className="shadow-none">
                {content}
              </Card>
            );
          })}
        </div>
      )}

      {!isView && (
        <div
          className={
            isTeacher
              ? `space-y-3 border-t border-other-divider pt-4 ${isLocked ? "opacity-60" : ""}`
              : undefined
          }
        >
          {isTeacher && (
            <h4 className="m-0 text-sm font-semibold text-text-primary">
              {editingAnswerId !== null
                ? t("addQuestionForm.answers.editing")
                : t("addQuestionForm.answers.addNew")}
            </h4>
          )}
          {isTeacher ? (
            <AnswerDraftFields
              currentIsCorrect={currentIsCorrect}
              currentAnswerText={currentAnswerText}
              form={form}
              editingAnswerId={editingAnswerId}
              onCurrentCorrectChange={onCurrentCorrectChange}
              onCurrentAnswerTextChange={onCurrentAnswerTextChange}
              onCancelAnswerEdit={onCancelAnswerEdit}
              onSaveAnswer={onSaveAnswer}
              isLocked={isLocked}
              t={t}
            />
          ) : (
            <Card
              size="small"
              title={
                editingAnswerId !== null
                  ? t("addQuestionForm.answers.editing")
                  : t("addQuestionForm.answers.addNew")
              }
            >
              <AnswerDraftFields
                currentIsCorrect={currentIsCorrect}
                currentAnswerText={currentAnswerText}
                form={form}
                editingAnswerId={editingAnswerId}
                onCurrentCorrectChange={onCurrentCorrectChange}
                onCurrentAnswerTextChange={onCurrentAnswerTextChange}
                onCancelAnswerEdit={onCancelAnswerEdit}
                onSaveAnswer={onSaveAnswer}
                isLocked={isLocked}
                t={t}
              />
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

interface AnswerDraftFieldsProps {
  currentIsCorrect: boolean;
  currentAnswerText: string;
  form: FormInstance;
  editingAnswerId: number | null;
  onCurrentCorrectChange: (isCorrect: boolean) => void;
  onCurrentAnswerTextChange: (content: string) => void;
  onCancelAnswerEdit: () => void;
  onSaveAnswer: () => void;
  isLocked: boolean;
  t: TFunction;
}

function AnswerDraftFields({
  currentIsCorrect,
  currentAnswerText,
  form,
  editingAnswerId,
  onCurrentCorrectChange,
  onCurrentAnswerTextChange,
  onCancelAnswerEdit,
  onSaveAnswer,
  isLocked,
  t,
}: AnswerDraftFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        checked={currentIsCorrect}
        disabled={isLocked}
        onChange={(event) => onCurrentCorrectChange(event.target.checked)}
      >
        {t("addQuestionForm.answers.markCorrect")}
      </Checkbox>
      <div>
        <RichTextEditor
          content={currentAnswerText}
          editable={!isLocked}
          locked={isLocked}
          onChange={onCurrentAnswerTextChange}
        />
        <FormField noStyle shouldUpdate>
          {() => {
            const error = form.getFieldError("answerDraft")[0];

            return error ? (
              <div className="mt-1 text-sm text-error-main">{t(error)}</div>
            ) : null;
          }}
        </FormField>
      </div>
      <Space className="justify-end" wrap>
        {editingAnswerId !== null && (
          <Button onClick={onCancelAnswerEdit} disabled={isLocked}>
            {t("addQuestionForm.answers.cancelEdit")}
          </Button>
        )}
        <Button type="primary" onClick={onSaveAnswer} disabled={isLocked}>
          {editingAnswerId !== null
            ? t("addQuestionForm.answers.update")
            : t("addQuestionForm.answers.saveNew")}
        </Button>
      </Space>
    </div>
  );
}
