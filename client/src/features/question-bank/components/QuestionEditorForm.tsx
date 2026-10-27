import { Button as AntButton, Form, Input, Modal, Tag } from "antd";
import { BookOpenCheck } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AnswerOptionsEditor from "@/features/question-bank/components/AnswerOptionsEditor";
import QuestionCoreFields from "@/features/question-bank/components/QuestionCoreFields";
import { QuestionDraftSummary } from "@/features/question-bank/components/QuestionDraftSummary";
import { useQuestionEditorFormController } from "@/features/question-bank/hooks/useQuestionEditorFormController";
import type { Question, QuestionCreate, QuestionUpdate } from "@/shared/types";
import { AdminFormSection } from "@/shared/components/admin";
import {
  AppDialog,
  Button as UiButton,
  FormField,
  QueryErrorAlert,
} from "@/shared/components/ui";

interface QuestionEditorFormProps {
  onClose: () => void;
  onSaveCreate: (data: QuestionCreate) => void;
  onSaveUpdate: (id: number, data: QuestionUpdate) => void;
  selectedItem: Question | null;
  mode: "create" | "view" | "update" | "none";
  variant?: "admin" | "teacher";
  isSaving?: boolean;
}

export default function QuestionEditorForm({
  onClose,
  onSaveCreate,
  onSaveUpdate,
  selectedItem,
  mode,
  variant = "admin",
  isSaving = false,
}: QuestionEditorFormProps) {
  const { t } = useTranslation();
  const isTeacher = variant === "teacher";
  const {
    form,
    formData,
    isView,
    subjectOptions,
    chapterOptions,
    difficultyOptions,
    isLoadingSubjectsForRole,
    isLoadingChapters,
    isLoadingDifficulties,
    hasCatalogError,
    isRetryingCatalogs,
    retryCatalogs,
    currentAnswerText,
    currentIsCorrect,
    editingAnswerId,
    handleFormValuesChange,
    handleSubmit,
    handleAnswerTextChange,
    handleDeleteAnswer,
    handleEditAnswer,
    handleSaveAnswer,
    handleSetCorrectAnswer,
    setCurrentIsCorrect,
    cancelAnswerEdit,
  } = useQuestionEditorFormController({
    onSaveCreate,
    onSaveUpdate,
    selectedItem,
    mode,
    requireClassification: true,
  });

  const titleKey = isView ? "view" : mode === "update" ? "update" : "create";
  const title = t(`addQuestionForm.title.${titleKey}`);
  const hasCompleteClassification =
    !!formData.subjectId && !!formData.chapterId && !!formData.difficultyId;
  const isQuestionContentLocked = !isView && !hasCompleteClassification;

  useEffect(() => {
    if (!isQuestionContentLocked) return;

    form.setFields([
      { name: "questionContent", errors: [] },
      { name: "answerOptions", errors: [] },
      { name: "answerDraft", errors: [] },
    ]);
  }, [form, isQuestionContentLocked]);

  const coreFieldsProps = {
    subjectOptions,
    chapterOptions,
    difficultyOptions,
    isLoadingSubjects: isLoadingSubjectsForRole,
    isLoadingChapters,
    isLoadingDifficulties,
    isView,
    hasSelectedSubject: !!formData.subjectId,
    hasSelectedChapter: !!formData.chapterId,
    isLocked: isQuestionContentLocked,
    variant,
  };

  const classificationSummary = [
    subjectOptions.find((option) => option.value === formData.subjectId)?.label,
    chapterOptions.find((option) => option.value === formData.chapterId)?.label,
    difficultyOptions.find((option) => option.value === formData.difficultyId)
      ?.label,
  ]
    .filter(Boolean)
    .join(" · ");

  const answerEditorProps = {
    form,
    answers: formData.answerOptions,
    isView,
    currentAnswerText,
    currentIsCorrect,
    editingAnswerId,
    onSetCorrectAnswer: handleSetCorrectAnswer,
    onEditAnswer: handleEditAnswer,
    onDeleteAnswer: handleDeleteAnswer,
    onCurrentCorrectChange: setCurrentIsCorrect,
    onCurrentAnswerTextChange: handleAnswerTextChange,
    onCancelAnswerEdit: cancelAnswerEdit,
    onSaveAnswer: handleSaveAnswer,
    isLocked: isQuestionContentLocked && !isView,
    variant,
  };

  const formContent = (
    <Form
      form={form}
      layout="vertical"
      requiredMark
      initialValues={{
        subjectId: formData.subjectId || undefined,
        chapterId: formData.chapterId ?? undefined,
        difficultyId: formData.difficultyId || undefined,
        questionContent: formData.questionContent,
      }}
      onValuesChange={handleFormValuesChange}
    >
      <div className="hidden" aria-hidden="true">
        <FormField name="answerOptions" hidden>
          <Input />
        </FormField>
        <FormField name="answerDraft" hidden>
          <Input />
        </FormField>
      </div>

      {hasCatalogError && (
        <QueryErrorAlert
          className={isTeacher ? "mb-4" : "mx-5 mt-5 sm:mx-6"}
          message={t("addQuestionForm.errors.catalogLoadError")}
          onRetry={retryCatalogs}
          isRetrying={isRetryingCatalogs}
        />
      )}

      {isTeacher ? (
        <div className="flex flex-col gap-5 px-4 py-4 sm:px-5">
          <QuestionCoreFields {...coreFieldsProps} />
          <AnswerOptionsEditor {...answerEditorProps} />
          <div className="mt-1 flex justify-end gap-2 border-t border-other-divider pt-4">
            <AntButton onClick={onClose} disabled={isSaving}>
              {t("addQuestionForm.footer.back")}
            </AntButton>
            {!isView && (
              <AntButton
                type="primary"
                loading={isSaving}
                onClick={handleSubmit}
              >
                {t("addQuestionForm.footer.saveAll")}
              </AntButton>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <QuestionDraftSummary
            title={
              selectedItem
                ? t("addQuestionForm.summary.existingQuestion", {
                    id: selectedItem.id,
                  })
                : t("addQuestionForm.summary.newQuestion")
            }
            classification={classificationSummary}
            classificationPlaceholder={t(
              "addQuestionForm.summary.classificationPlaceholder"
            )}
            answerCountLabel={t("addQuestionForm.answers.count", {
              count: formData.answerOptions.length,
            })}
            statusLabel={t(
              formData.status === "public"
                ? "questionPage.tabs.public"
                : "questionPage.tabs.private"
            )}
            isPublic={formData.status === "public"}
          />

          <AdminFormSection
            title={t("addQuestionForm.sections.classification")}
            description={t(
              "addQuestionForm.sections.classificationDescription"
            )}
          >
            <QuestionCoreFields {...coreFieldsProps} section="classification" />
          </AdminFormSection>

          <AdminFormSection
            title={t("addQuestionForm.sections.contentTitle")}
            description={t("addQuestionForm.sections.contentDescription")}
          >
            <QuestionCoreFields {...coreFieldsProps} section="content" />
          </AdminFormSection>

          <AdminFormSection
            title={
              <span className="flex items-center gap-2">
                {t("addQuestionForm.answers.title")}
                <Tag
                  color={
                    formData.answerOptions.length >= 2 ? "blue" : "default"
                  }
                >
                  {t("addQuestionForm.answers.count", {
                    count: formData.answerOptions.length,
                  })}
                </Tag>
              </span>
            }
            description={t("addQuestionForm.sections.answersDescription")}
          >
            <AnswerOptionsEditor {...answerEditorProps} showHeading={false} />
          </AdminFormSection>

        </div>
      )}
    </Form>
  );

  if (isTeacher) {
    return (
      <Modal
        open
        title={
          <div className="flex items-center gap-3 py-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
              <BookOpenCheck size={21} aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold text-text-primary">
              {title}
            </span>
          </div>
        }
        onCancel={onClose}
        width="min(880px, calc(100vw - 24px))"
        centered
        destroyOnHidden
        maskClosable={!isSaving}
        closable={!isSaving}
        className="teacher-question-dialog"
        styles={{
          header: { margin: 0, padding: "12px 16px 8px" },
          body: {
            maxHeight: "calc(100vh - 190px)",
            overflowY: "auto",
            padding: "4px 0 0",
          },
        }}
        footer={null}
      >
        {formContent}
      </Modal>
    );
  }

  return (
    <AppDialog
      open
      onClose={onClose}
      title={title}
      description={
        isView
          ? t("addQuestionForm.viewDescription")
          : mode === "update"
            ? t("addQuestionForm.updateDescription")
            : t("addQuestionForm.dialogDescription")
      }
      icon={<BookOpenCheck size={22} />}
      tone="primary"
      width="min(1000px, calc(100vw - 24px))"
      busy={isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <UiButton
            variant="outline"
            size="medium"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("addQuestionForm.footer.back")}
          </UiButton>
          {!isView && (
            <UiButton
              variant="contained"
              color="primary"
              size="medium"
              onClick={() => void handleSubmit()}
              loading={isSaving}
              disabled={isSaving}
              className="min-w-32"
            >
              {t(
                mode === "update"
                  ? "addQuestionForm.footer.update"
                  : "addQuestionForm.footer.create"
              )}
            </UiButton>
          )}
        </div>
      }
    >
      {formContent}
    </AppDialog>
  );
}
