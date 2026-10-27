import { Select } from "antd";
import type { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";
import { RichTextEditor } from "@/features/question-bank/components/RichTextEditor";
import { QuestionValidate } from "@/features/question-bank/utils/question.validate";
import { AdminFormField, AdminSelectField } from "@/shared/components/admin";
import { FormField } from "@/shared/components/ui";
import { translatedValidationRule } from "@/shared/utils/validation";

export interface QuestionSelectOption {
  label: string;
  value: number;
}

interface QuestionCoreFieldsProps {
  subjectOptions: QuestionSelectOption[];
  chapterOptions: QuestionSelectOption[];
  difficultyOptions: QuestionSelectOption[];
  isLoadingSubjects: boolean;
  isLoadingChapters: boolean;
  isLoadingDifficulties: boolean;
  isView: boolean;
  hasSelectedSubject: boolean;
  hasSelectedChapter: boolean;
  isLocked?: boolean;
  variant?: "admin" | "teacher";
  section?: "all" | "classification" | "content";
}

export default function QuestionCoreFields({
  subjectOptions,
  chapterOptions,
  difficultyOptions,
  isLoadingSubjects,
  isLoadingChapters,
  isLoadingDifficulties,
  isView,
  hasSelectedSubject,
  hasSelectedChapter,
  isLocked = false,
  variant = "admin",
  section = "all",
}: QuestionCoreFieldsProps) {
  const { t } = useTranslation();
  const isTeacher = variant === "teacher";
  const showClassification = section === "all" || section === "classification";
  const showContent = section === "all" || section === "content";
  const questionContentRules: Rule[] = isLocked
    ? []
    : [translatedValidationRule(QuestionValidate.getQuestionContentError, t)];

  const classificationFields = [
    {
      name: "subjectId" as const,
      label: t("addQuestionForm.fields.subject.label"),
      placeholder: t("addQuestionForm.fields.subject.placeholder"),
      options: subjectOptions,
      loading: isLoadingSubjects,
      disabled: isView,
      required: true,
      rules: [translatedValidationRule(QuestionValidate.getSubjectIdError, t)],
    },
    {
      name: "chapterId" as const,
      label: t("addQuestionForm.fields.chapter.label"),
      placeholder: t("addQuestionForm.fields.chapter.placeholder"),
      options: chapterOptions,
      loading: isLoadingChapters,
      disabled: isView || !hasSelectedSubject || isLoadingChapters,
      required: true,
      allowClear: true,
      rules: [translatedValidationRule(QuestionValidate.getChapterIdError, t)],
    },
    {
      name: "difficultyId" as const,
      label: t("addQuestionForm.fields.difficulty.label"),
      placeholder: t("addQuestionForm.fields.difficulty.placeholder"),
      options: difficultyOptions,
      loading: isLoadingDifficulties,
      disabled: isView || !hasSelectedChapter || isLoadingDifficulties,
      required: true,
      allowClear: true,
      rules: [
        translatedValidationRule(QuestionValidate.getDifficultyIdError, t),
      ],
    },
  ];

  const renderClassificationFields = () => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {classificationFields.map((field) =>
        isTeacher ? (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            required={field.required}
            rules={field.rules}
            className="mb-0"
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={field.placeholder}
              options={field.options}
              loading={field.loading}
              disabled={field.disabled}
              allowClear={field.allowClear}
              size="large"
              className="!h-11 w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-xl"
            />
          </FormField>
        ) : (
          <AdminSelectField
            key={field.name}
            name={field.name}
            label={field.label}
            required={field.required}
            rules={field.rules}
            options={field.options}
            placeholder={field.placeholder}
            loading={field.loading}
            disabled={field.disabled}
            allowClear={field.allowClear}
            showSearch
            optionFilterProp="label"
          />
        )
      )}
    </div>
  );

  return (
    <>
      {showClassification && <section>{renderClassificationFields()}</section>}

      {showContent && (
        <section
          className={
            isTeacher ? "border-t border-other-divider pt-4" : undefined
          }
        >
          {isLocked && !isView && (
            <p className="mb-3 text-sm text-text-secondary">
              {t("addQuestionForm.classificationRequiredHint")}
            </p>
          )}
          {isTeacher ? (
            <FormField
              name="questionContent"
              label={t("addQuestionForm.content.label")}
              required={!isLocked}
              valuePropName="content"
              rules={questionContentRules}
              className="mb-0"
            >
              <RichTextEditor
                content=""
                onChange={() => undefined}
                editable={!isView && !isLocked}
                locked={isLocked && !isView}
              />
            </FormField>
          ) : (
            <AdminFormField
              name="questionContent"
              label={t("addQuestionForm.content.label")}
              required={!isLocked}
              valuePropName="content"
              rules={questionContentRules}
              className="bg-transparent !p-0"
            >
              <RichTextEditor
                content=""
                onChange={() => undefined}
                editable={!isView && !isLocked}
                locked={isLocked && !isView}
              />
            </AdminFormField>
          )}
        </section>
      )}
    </>
  );
}
