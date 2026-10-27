import { useState } from "react";
import { Form } from "antd";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import type {
  AnswerOptionInput,
  Question,
  QuestionCreate,
  QuestionUpdate,
} from "@/shared/types";
import { stripParagraphTags } from "@/features/question-bank/utils/richText";
import { QuestionValidate } from "@/features/question-bank/utils/question.validate";
import { useAnswerOptionsEditor } from "@/features/question-bank/hooks/useAnswerOptionsEditor";
import { useQuestionEditorCatalogs } from "@/features/question-bank/hooks/useQuestionEditorCatalogs";

interface QuestionEditorFormControllerOptions {
  onSaveCreate: (data: QuestionCreate) => void;
  onSaveUpdate: (id: number, data: QuestionUpdate) => void;
  selectedItem: Question | null;
  mode: "create" | "view" | "update" | "none";
  requireClassification?: boolean;
}

const createDefaultQuestion = (creatorId: number): Question => ({
  id: 0,
  questionContent: "",
  imageUrl: null,
  answerExplanation: "",
  defaultScore: "0",
  usageCount: 0,
  status: "private",
  isDeleted: false,
  difficultyId: 0,
  subjectId: 0,
  chapterId: null,
  creatorId,
  examsCount: 0,
  subject: null,
  chapter: null,
  difficulty: null,
  creator: null,
  answerOptions: [],
  createdAt: null,
  updatedAt: null,
});

export function useQuestionEditorFormController({
  onSaveCreate,
  onSaveUpdate,
  selectedItem,
  mode,
  requireClassification = false,
}: QuestionEditorFormControllerOptions) {
  const { user } = useAuthStore();
  const isView = mode === "view";
  const isUpdate = mode === "update";
  const isCreate = mode === "create" || mode === "none";
  const initialQuestion = selectedItem ?? createDefaultQuestion(user?.id ?? 0);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Question>(initialQuestion);
  const {
    subjectOptions,
    chapterOptions,
    difficultyOptions,
    isLoadingSubjectsForRole,
    isLoadingChapters,
    isLoadingDifficulties,
    hasCatalogError,
    isRetryingCatalogs,
    retryCatalogs,
  } = useQuestionEditorCatalogs({
    subjectId: formData.subjectId,
  });

  const {
    currentAnswerText,
    currentIsCorrect,
    editingAnswerId,
    handleAnswerTextChange,
    handleDeleteAnswer,
    handleEditAnswer,
    handleSaveAnswer,
    handleSetCorrectAnswer,
    setCurrentIsCorrect,
    setFieldError: setAnswerFieldError,
    cancelAnswerEdit,
  } = useAnswerOptionsEditor({
    answers: formData.answerOptions,
    form,
    onAnswersChange: (answerOptions) =>
      setFormData((previous) => ({ ...previous, answerOptions })),
  });

  const handleFormValuesChange = (
    changedValues: Record<string, unknown>,
    values: Record<string, unknown>
  ) => {
    const updates: Partial<Question> = {};

    if ("subjectId" in changedValues) {
      updates.subjectId = Number(values.subjectId ?? 0);
      updates.chapterId = null;
      updates.difficultyId = 0;
      form.setFieldsValue({ chapterId: null, difficultyId: null });
    }
    if ("chapterId" in changedValues) {
      const chapterId = values.chapterId ? Number(values.chapterId) : null;
      updates.chapterId = chapterId;

      if (!chapterId) {
        updates.difficultyId = 0;
        form.setFieldsValue({ difficultyId: null });
      }
    }
    if ("difficultyId" in changedValues) {
      updates.difficultyId = Number(values.difficultyId ?? 0);
    }
    if ("questionContent" in changedValues) {
      updates.questionContent = String(values.questionContent ?? "");
    }

    if (Object.keys(updates).length > 0) {
      setFormData((previous) => ({ ...previous, ...updates }));
    }
  };

  const handleSubmit = async () => {
    if (isView) return;

    const classificationFields = requireClassification
      ? ["subjectId", "chapterId", "difficultyId"]
      : ["subjectId"];

    try {
      await form.validateFields(classificationFields);
    } catch {
      return;
    }

    if (
      requireClassification &&
      (!form.getFieldValue("subjectId") ||
        !form.getFieldValue("chapterId") ||
        !form.getFieldValue("difficultyId"))
    ) {
      return;
    }

    try {
      await form.validateFields(["questionContent"]);
    } catch {
      return;
    }

    const validationErrors = QuestionValidate.create({
      subjectId: formData.subjectId,
      questionContent: formData.questionContent,
      answerOptions: formData.answerOptions,
      answerDraftContent: currentAnswerText,
    });
    setAnswerFieldError("answerOptions", validationErrors.answerOptions);
    setAnswerFieldError("answerDraft", validationErrors.answerDraft);
    if (validationErrors.answerOptions || validationErrors.answerDraft) return;

    const answerOptions: AnswerOptionInput[] = formData.answerOptions.map(
      (answer) => ({
        ...(answer.questionId !== null ? { id: answer.id } : {}),
        optionContent: stripParagraphTags(answer.optionContent),
        isCorrectAnswer: answer.isCorrectAnswer,
      })
    );
    const payload = {
      subjectId: formData.subjectId,
      chapterId: formData.chapterId ?? null,
      difficultyId: formData.difficultyId || null,
      creatorId: formData.creatorId || user?.id || 0,
      questionContent: stripParagraphTags(formData.questionContent),
      answerExplanation: formData.answerExplanation || "",
      defaultScore: Number(formData.defaultScore) || 0,
      answerOptions,
    };

    if (isUpdate && selectedItem) {
      onSaveUpdate(selectedItem.id, payload);
    } else if (isCreate) {
      onSaveCreate(payload);
    }
  };

  return {
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
  };
}
