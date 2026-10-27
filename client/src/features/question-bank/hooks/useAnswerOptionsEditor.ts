import { useState } from "react";
import type { FormInstance } from "antd";
import type { AnswerOption } from "@/shared/types";
import { QuestionValidate } from "@/features/question-bank/utils/question.validate";

type AnswerValidationField = "answerOptions" | "answerDraft";

interface UseAnswerOptionsEditorOptions {
  answers: AnswerOption[];
  form: FormInstance;
  onAnswersChange: (answers: AnswerOption[]) => void;
}

export function useAnswerOptionsEditor({
  answers,
  form,
  onAnswersChange,
}: UseAnswerOptionsEditorOptions) {
  const [currentAnswerText, setCurrentAnswerText] = useState("");
  const [currentIsCorrect, setCurrentIsCorrect] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);

  const setFieldError = (field: AnswerValidationField, error?: string) => {
    form.setFields([{ name: field, errors: error ? [error] : [] }]);
  };

  const clearAnswerErrors = () => {
    setFieldError("answerOptions");
    setFieldError("answerDraft");
  };

  const handleSaveAnswer = () => {
    if (!QuestionValidate.hasMeaningfulContent(currentAnswerText)) {
      setFieldError("answerDraft", "addQuestionForm.validation.answerRequired");
      return;
    }

    if (editingAnswerId !== null) {
      const updatedAnswers = answers.map((answer) => {
        if (answer.id === editingAnswerId) {
          return {
            ...answer,
            optionContent: currentAnswerText,
            isCorrectAnswer: currentIsCorrect,
          };
        }
        return currentIsCorrect
          ? { ...answer, isCorrectAnswer: false }
          : answer;
      });
      onAnswersChange(updatedAnswers);
    } else {
      const nextTemporaryId =
        Math.min(0, ...answers.map((answer) => answer.id)) - 1;
      const newAnswer: AnswerOption = {
        id: nextTemporaryId,
        optionContent: currentAnswerText,
        isCorrectAnswer: currentIsCorrect,
        questionId: null,
      };
      const currentAnswers = currentIsCorrect
        ? answers.map((answer) => ({ ...answer, isCorrectAnswer: false }))
        : answers;
      onAnswersChange([...currentAnswers, newAnswer]);
    }

    setEditingAnswerId(null);
    setCurrentAnswerText("");
    setCurrentIsCorrect(false);
    clearAnswerErrors();
  };

  const handleEditAnswer = (answer: AnswerOption) => {
    setEditingAnswerId(answer.id);
    setCurrentAnswerText(answer.optionContent);
    setCurrentIsCorrect(answer.isCorrectAnswer);
    setFieldError("answerDraft");
  };

  const handleSetCorrectAnswer = (answerId: number) => {
    onAnswersChange(
      answers.map((answer) => ({
        ...answer,
        isCorrectAnswer: answer.id === answerId,
      }))
    );
    clearAnswerErrors();
  };

  const handleDeleteAnswer = (answerId: number) => {
    onAnswersChange(answers.filter((answer) => answer.id !== answerId));
    clearAnswerErrors();

    if (editingAnswerId === answerId) {
      setEditingAnswerId(null);
      setCurrentAnswerText("");
      setCurrentIsCorrect(false);
    }
  };

  const cancelAnswerEdit = () => {
    setEditingAnswerId(null);
    setCurrentAnswerText("");
    setCurrentIsCorrect(false);
    setFieldError("answerDraft");
  };

  const handleAnswerTextChange = (content: string) => {
    setCurrentAnswerText(content);
    setFieldError("answerDraft");
  };

  return {
    currentAnswerText,
    currentIsCorrect,
    editingAnswerId,
    handleAnswerTextChange,
    handleDeleteAnswer,
    handleEditAnswer,
    handleSaveAnswer,
    handleSetCorrectAnswer,
    setCurrentIsCorrect,
    setFieldError,
    cancelAnswerEdit,
  };
}
