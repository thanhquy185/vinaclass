import type {
  Difficulty,
  ExamAttempt,
  ExamReviewResponse,
  Question,
  User,
} from "@/shared/types";

export type ResultViewMode = "user" | "question" | "difficulty";
export type ResultSortOrder = "asc" | "desc" | null;
export type ResultSearchCriterion = "studentId" | "fullName";
export type AttemptStatusFilter =
  | "all"
  | "SUBMITTED"
  | "IN_PROGRESS"
  | "NOT_JOINED";

type ResultAttempt = Pick<ExamAttempt, "totalScore"> & Partial<ExamAttempt>;
type AttemptResult = ExamReviewResponse["examAttempts"][number];

export interface StudentResultRow {
  id: number;
  rowType: "student";
  username: string;
  fullName: string;
  examAttempt?: ResultAttempt;
  isAverage: boolean;
}

export interface StatisticResultRow {
  id: number | string;
  rowType: "statistic";
  questionNumber: number;
  content: string;
  correctRate: number;
  averageScore: string;
}

export interface ResultTableRow {
  id: number | string;
  rowType: "student" | "statistic";
  username?: string;
  fullName?: string;
  examAttempt?: ResultAttempt;
  isAverage?: boolean;
  questionNumber?: number;
  content?: string;
  correctRate?: number;
  averageScore?: string;
}

interface BuildResultTableDataOptions {
  viewMode: ResultViewMode;
  sortOrder: ResultSortOrder;
  students: User[];
  examQuestions: Question[];
  examAttempts: AttemptResult[];
  difficulties: Difficulty[];
  averageLabel: string;
}

export const buildResultTableData = ({
  viewMode,
  sortOrder,
  students,
  examQuestions,
  examAttempts,
  difficulties,
  averageLabel,
}: BuildResultTableDataOptions): ResultTableRow[] => {
  const submittedAttempts = examAttempts.filter(
    ({ examAttempt }) => examAttempt.status === "SUBMITTED"
  );

  if (viewMode === "user") {
    let submittedScoreTotal = 0;
    const studentRows: StudentResultRow[] = students.map((student) => {
      const attempt = examAttempts.find(
        ({ examAttempt }) => examAttempt.studentId === student.id
      )?.examAttempt;
      const submittedAttempt = submittedAttempts.find(
        ({ examAttempt }) => examAttempt.studentId === student.id
      )?.examAttempt;

      submittedScoreTotal += Number(submittedAttempt?.totalScore) || 0;

      return {
        id: student.id,
        rowType: "student",
        username: student.username,
        fullName: student.profile.fullName,
        isAverage: false,
        examAttempt: attempt,
      };
    });

    if (sortOrder) {
      studentRows.sort((first, second) => {
        const firstScore = Number(first.examAttempt?.totalScore) || 0;
        const secondScore = Number(second.examAttempt?.totalScore) || 0;

        return sortOrder === "asc"
          ? firstScore - secondScore
          : secondScore - firstScore;
      });
    }

    const averageRow: StudentResultRow = {
      id: -1,
      rowType: "student",
      username: "",
      fullName: averageLabel,
      isAverage: true,
      examAttempt: {
        totalScore: submittedScoreTotal / (students.length || 1),
      },
    };

    return [averageRow, ...studentRows];
  }

  if (viewMode === "question") {
    const questionRows: StatisticResultRow[] = examQuestions.map(
      (question, index) => {
        const correctAnswerId = question.answerOptions.find(
          (answer) => answer.isCorrectAnswer
        )?.id;
        const correctCount =
          correctAnswerId == null
            ? 0
            : submittedAttempts.filter(({ questions }) => {
                const submittedQuestion = questions.find(
                  (candidate) => candidate.id === question.id
                );

                return submittedQuestion?.selectedAnswer === correctAnswerId;
              }).length;
        const correctRate = (correctCount / (students.length || 1)) * 100;
        const questionScore = Number(
          question.pivot?.score ?? question.defaultScore ?? 1
        );

        return {
          id: question.id,
          rowType: "statistic",
          questionNumber: index + 1,
          content: question.questionContent,
          correctRate,
          averageScore: ((correctRate / 100) * questionScore).toFixed(2),
        };
      }
    );

    if (sortOrder) {
      questionRows.sort((first, second) =>
        sortOrder === "asc"
          ? first.correctRate - second.correctRate
          : second.correctRate - first.correctRate
      );
    }

    return questionRows;
  }

  const difficultyRows: StatisticResultRow[] = difficulties.map(
    (difficulty, index) => {
      const questionCount =
        examQuestions.filter(
          (question) => question.difficultyId === difficulty.id
        ).length * students.length;
      const correctAnswerCount = submittedAttempts.reduce(
        (total, attempt) =>
          total +
          attempt.questions.filter((question) => {
            const correctAnswerId = question.answerOptions.find(
              (answer) => answer.isCorrectAnswer
            )?.id;

            return (
              correctAnswerId != null &&
              question.difficultyId === difficulty.id &&
              question.selectedAnswer === correctAnswerId
            );
          }).length,
        0
      );
      const correctRate = (correctAnswerCount / (questionCount || 1)) * 100;

      return {
        id: `dk-${difficulty.id}`,
        rowType: "statistic",
        questionNumber: index + 1,
        content: difficulty.difficultyName,
        correctRate,
        averageScore: (correctRate / 10).toFixed(2),
      };
    }
  );

  if (sortOrder) {
    difficultyRows.sort((first, second) =>
      sortOrder === "asc"
        ? first.correctRate - second.correctRate
        : second.correctRate - first.correctRate
    );
  }

  return difficultyRows;
};
