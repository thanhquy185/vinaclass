import type { ApiResponse } from "@/shared/types";
import axiosClient from "@/shared/api/axios";
import type { StatisticsPeriodType } from "@/features/admin/utils/statisticsPeriod";

export interface AdminDashboardSummary {
  stats: {
    totalStudents: number;
    activeClasses: number;
    activeExams: number;
    questionBank: number;
  };
  recentClasses: Array<{
    id: number;
    groupName: string;
    subjectName: string | null;
    studentCount: number;
  }>;
  upcomingExams: Array<{
    id: number;
    examName: string;
    startTime: string;
  }>;
}

export interface AdminStatistics {
  period: {
    type: StatisticsPeriodType;
    value: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalStudents: number;
    totalTeachers: number;
    activeClasses: number;
    activeExams: number;
    upcomingExams: number;
    totalExams: number;
    questionBank: number;
    submittedAttempts: number;
    studentsWithSubmissions: number;
    inProgressAttempts: number;
    completionRate: number;
    averageScore: number | null;
  };
  classStats: {
    activeClasses: number;
    activeSubjects: number;
    totalEnrollments: number;
    averageClassSize: number;
  };
  questionStats: {
    totalQuestions: number;
    publicQuestions: number;
    privateQuestions: number;
    archivedQuestions: number;
    totalUsage: number;
  };
  attemptTrend: Array<{
    bucket: string;
    attemptCount: number;
    averageScore: number | null;
  }>;
  subjectEnrollment: Array<{
    subjectId: number;
    subjectName: string;
    classCount: number;
    studentCount: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    attemptCount: number;
  }>;
  largestClasses: Array<{
    id: number;
    className: string;
    subjectName: string | null;
    studentCount: number;
  }>;
  averageScoreBySubject: Array<{
    subjectId: number;
    subjectName: string;
    attemptCount: number;
    averageScore: number;
  }>;
  topExams: Array<{
    id: number;
    examName: string;
    subjectName: string | null;
    attemptCount: number;
    submittedCount: number;
    averageScore: number | null;
  }>;
  difficultyDistribution: Array<{
    difficultyName: string | null;
    questionCount: number;
  }>;
  subjectQuestionBank: Array<{
    subjectId: number;
    subjectName: string;
    questionCount: number;
    usageCount: number;
  }>;
  mostUsedQuestions: Array<{
    id: number;
    subjectName: string | null;
    difficultyName: string | null;
    usageCount: number;
  }>;
}

export const dashboardService = {
  getAdminSummary: (): Promise<ApiResponse<AdminDashboardSummary>> =>
    axiosClient.get("/dashboard/admin-summary"),
  getAdminStatistics: (
    report: string,
    periodType: StatisticsPeriodType,
    periodValue: string,
    periodStartDate?: string,
    periodEndDate?: string
  ): Promise<ApiResponse<AdminStatistics>> =>
    axiosClient.get("/dashboard/admin-statistics", {
      params: {
        report,
        period_type: periodType,
        ...(periodType !== "custom" ? { period_value: periodValue } : {}),
        ...(periodType === "custom"
          ? { start_date: periodStartDate, end_date: periodEndDate }
          : {}),
      },
    }),
};
