export const adminQueryKeys = {
  dashboardSummary: (userId?: number) =>
    ["dashboard", "admin-summary", userId] as const,
  statistics: (
    userId: number | undefined,
    report: string,
    periodType: string,
    periodValue: string,
    periodStartDate?: string,
    periodEndDate?: string
  ) =>
    [
      "dashboard",
      "admin-statistics",
      userId,
      report,
      periodType,
      periodValue,
      periodStartDate,
      periodEndDate,
    ] as const,
};
