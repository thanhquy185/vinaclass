import type { AnswerOptionInput } from "@/shared/types";

export interface QuestionInput {
  subjectId: number;
  questionContent: string;
  answerOptions: AnswerOptionInput[];
  answerDraftContent: string;
}

export type QuestionError = Partial<
  Record<
    "subjectId" | "questionContent" | "answerOptions" | "answerDraft",
    string
  >
>;

export class QuestionValidate {
  static getSubjectIdError(value: unknown): string | undefined {
    if (!Number.isInteger(value) || Number(value) <= 0) {
      return "addQuestionForm.validation.subjectRequired";
    }

    return undefined;
  }

  static getChapterIdError(value: unknown): string | undefined {
    if (!Number.isInteger(value) || Number(value) <= 0) {
      return "questionPage.validation.chapterRequired";
    }

    return undefined;
  }

  static getDifficultyIdError(value: unknown): string | undefined {
    if (!Number.isInteger(value) || Number(value) <= 0) {
      return "questionPage.validation.difficultyRequired";
    }

    return undefined;
  }

  static hasMeaningfulContent(content: string): boolean {
    const text = content
      .replace(/<img\b[^>]*>/gi, " image ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
      .replace(/[\u200B-\u200D\uFEFF]/g, " ");

    return text.trim().length > 0;
  }

  static getQuestionContentError(value: unknown): string | undefined {
    const content = typeof value === "string" ? value : "";

    return QuestionValidate.hasMeaningfulContent(content)
      ? undefined
      : "addQuestionForm.validation.questionRequired";
  }

  static create(data: QuestionInput): QuestionError {
    const errors: QuestionError = {};

    const subjectIdError = this.getSubjectIdError(data.subjectId);
    if (subjectIdError) errors.subjectId = subjectIdError;

    const questionContentError = this.getQuestionContentError(
      data.questionContent
    );
    if (questionContentError) errors.questionContent = questionContentError;

    if (data.answerOptions.length < 2) {
      errors.answerOptions = "addQuestionForm.validation.minimumAnswers";
    } else if (
      data.answerOptions.some(
        (answer) => !this.hasMeaningfulContent(answer.optionContent)
      )
    ) {
      errors.answerOptions = "addQuestionForm.validation.answerRequired";
    } else if (
      data.answerOptions.filter((answer) => answer.isCorrectAnswer).length !== 1
    ) {
      errors.answerOptions =
        "addQuestionForm.validation.singleCorrectAnswerRequired";
    }

    if (this.hasMeaningfulContent(data.answerDraftContent)) {
      errors.answerDraft = "addQuestionForm.validation.saveAnswerDraft";
    }

    return errors;
  }
}
