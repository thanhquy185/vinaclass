import type { ExamAttempt, User } from "@/shared/types";

export interface ExamScoreDistributionItem {
  name: string;
  students: number;
}

export interface ExamStatisticsMetrics {
  submittedCount: number;
  unsubmittedCount: number;
  totalStudents: number;
  averageScore: number;
  countAtMostOne: number;
  countAtMostFive: number;
  countAtLeastFive: number;
  maxScore: number;
  scoreDistribution: ExamScoreDistributionItem[];
}

export function buildExamStatisticsMetrics(
  students: User[],
  examAttempts: ExamAttempt[],
): ExamStatisticsMetrics {
  const submittedAttempts = examAttempts.filter(
    (attempt) => attempt.status === "SUBMITTED",
  );
  const scores = submittedAttempts.map(
    (attempt) => Number(attempt.totalScore) || 0,
  );
  const scoreDistribution = Array.from({ length: 10 }, (_, index) => ({
    name: `<= ${index + 1}`,
    students: 0,
  }));

  scores.forEach((score) => {
    const index = Math.min(Math.floor(score === 0 ? 0 : score - 0.01), 9);
    if (index >= 0) scoreDistribution[index].students += 1;
  });

  return {
    submittedCount: submittedAttempts.length,
    unsubmittedCount: students.length - submittedAttempts.length,
    totalStudents: students.length,
    averageScore:
      scores.length > 0
        ? scores.reduce((total, score) => total + score, 0) / scores.length
        : 0,
    countAtMostOne: scores.filter((score) => score <= 1).length,
    countAtMostFive: scores.filter((score) => score <= 5).length,
    countAtLeastFive: scores.filter((score) => score >= 5).length,
    maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    scoreDistribution,
  };
}
