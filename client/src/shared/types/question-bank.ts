import type { Chapter, Difficulty, Subject } from "./catalogs";
import type { User } from "./identity";

export interface AnswerOptionInput {
  id?: number;
  optionContent: string;
  isCorrectAnswer: boolean;
}

export interface QuestionBase {
  subjectId: number;
  chapterId?: number | null;
  difficultyId?: number | null;
  creatorId: number;
  questionContent: string;
  answerExplanation?: string;
  defaultScore?: number;
  answerOptions: AnswerOptionInput[];
}

export type QuestionCreate = QuestionBase;

export type QuestionUpdate = Partial<QuestionBase>;

export type QuestionStatus = "public" | "private" | "archive";

export interface Question {
  id: number;
  questionContent: string;
  imageUrl: string | null;
  answerExplanation: string;
  defaultScore: string;
  usageCount: number;
  status: QuestionStatus;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;

  difficultyId: number;
  subjectId: number;
  chapterId: number | null;
  creatorId: number;

  examsCount: number;

  // Related records.
  subject: Subject | null;
  chapter: Chapter | null;
  difficulty: Difficulty | null;
  creator: User | null;
  answerOptions: AnswerOption[];
  pivot?: {
    score?: number | string;
  };

  selectedAnswer?: number | null;
}

export interface AnswerOption {
  id: number;
  optionContent: string;
  isCorrectAnswer: boolean;
  questionId: number | null;
}
