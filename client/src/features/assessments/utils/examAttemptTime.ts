import type { ExamAttempt } from "@/shared/types";

export function getAttemptDeadline(
  attempt: ExamAttempt | null,
  durationMinutes?: number,
  examEndTime?: string
): number {
  const persistedDeadline = attempt?.deadlineAt
    ? Date.parse(attempt.deadlineAt)
    : Number.NaN;

  if (Number.isFinite(persistedDeadline)) return persistedDeadline;

  const startTime = attempt?.startTime
    ? Date.parse(attempt.startTime)
    : Number.NaN;
  const durationMs = (durationMinutes ?? 0) * 60_000;

  if (Number.isFinite(startTime) && durationMs > 0) {
    const examEnd = examEndTime ? Date.parse(examEndTime) : Number.NaN;
    return Math.min(
      startTime + durationMs,
      Number.isFinite(examEnd) ? examEnd : Number.POSITIVE_INFINITY
    );
  }

  const fallbackSeconds =
    attempt?.remainingSeconds ?? (durationMinutes ?? 0) * 60;
  return Date.now() + fallbackSeconds * 1000;
}

export function getAttemptRemainingSeconds(
  attempt: ExamAttempt | null,
  durationMinutes?: number,
  examEndTime?: string
): number {
  return Math.max(
    0,
    Math.ceil(
      (getAttemptDeadline(attempt, durationMinutes, examEndTime) - Date.now()) /
        1000
    )
  );
}
