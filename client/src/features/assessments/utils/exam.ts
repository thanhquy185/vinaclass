import type { CreateExamPayload, Exam, StatusResult } from "@/shared/types";

/** Compare an exam window with the current time. */
export const getTestsStatus = (
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  now: Date
): StatusResult => {
  if (!startTime || !endTime) {
    return { labelKey: "examResultOverview.notAvailable", status: "CLOSED" };
  }
  const currentTime = now.getTime();

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return { labelKey: "examResultOverview.notAvailable", status: "CLOSED" };
  }

  if (currentTime < start) {
    return { labelKey: "testPage.filter.notOpened", status: "UPCOMING" };
  }

  if (currentTime >= start && currentTime < end) {
    return { labelKey: "testPage.filter.opening", status: "OPENING" };
  }

  return { labelKey: "testPage.filter.closed", status: "CLOSED" };
};

export const getExamVariantWithStatus = (status: string) => {
  switch (status) {
    case "UPCOMING":
      return "success";
    case "OPENING":
      return "warning";
    case "CLOSED":
      return "error";
  }
};

export const checkTimeValid = (
  startTime: string,
  endTime: string,
  now: Date
): boolean => {
  // Parse both timestamps safely.
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const current = now.getTime();

  // Reject invalid timestamps.
  if (isNaN(start) || isNaN(end)) {
    console.error("Invalid time format:", { startTime, endTime });
    return false;
  }

  // Allow a one-second tolerance for timer drift.
  return current >= start - 1000 && current <= end;
};

/** Format a duration in minutes as HH:mm:ss. */
export const formatMinutesToTime = (minutes: number): string => {
  if (isNaN(minutes) || minutes < 0) return "00:00:00";

  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = 0; // The input contains whole minutes, so seconds are zero.

  const hh = String(hours).padStart(2, "0");
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/** Format the duration between two timestamps using Vietnamese units. */
export const calculateDuration = (
  start: string | number | Date | undefined | null,
  end: string | number | Date | undefined | null,
  locale = "vi-VN"
): string => {
  if (!start || !end) return "N/A";

  const minuteFormatter = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "minute",
    unitDisplay: "long",
  });
  const secondFormatter = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "second",
    unitDisplay: "long",
  });
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return "N/A";

  const durationMs = endTime - startTime;

  if (durationMs <= 0) {
    return secondFormatter.format(0);
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  // Format units with the active locale so English and Vietnamese screens match.
  if (minutes > 0) {
    parts.push(minuteFormatter.format(minutes));
  }

  if (seconds > 0) {
    parts.push(secondFormatter.format(seconds));
  }

  return parts.join(" ");
};

/** Convert an exam model into the exam creation API payload. */
export const mapExamToCreatePayload = (
  exam: Partial<Exam>
): CreateExamPayload | null => {
  const source = exam;
  const questions = source.questions ?? [];
  const subjectId = source.subject?.id ?? source.subjectId;
  const courseGroupIds = source.courseGroups?.map((group) => group.id) ?? [];

  if (
    !subjectId ||
    !source.creatorId ||
    !source.examName?.trim() ||
    !source.startTime ||
    !source.endTime ||
    !Number.isInteger(source.durationMinutes) ||
    !source.durationMinutes ||
    courseGroupIds.length === 0 ||
    questions.length === 0
  ) {
    return null;
  }

  const totalQuestions = questions.length;
  const existingScores = questions.map((question) =>
    Number(
      (question as typeof question & { pivot?: { score?: number | string } })
        .pivot?.score
    )
  );
  const hasValidExistingScores =
    existingScores.every((score) => Number.isFinite(score) && score >= 0) &&
    Math.abs(existingScores.reduce((sum, score) => sum + score, 0) - 10) <
      0.001;
  const equalScores = getEqualExamQuestionScores(totalQuestions);
  const selectedScores = hasValidExistingScores ? existingScores : equalScores;
  if (
    selectedScores.length !== totalQuestions ||
    Math.abs(selectedScores.reduce((sum, score) => sum + score, 0) - 10) > 0.001
  ) {
    return null;
  }

  return {
    subjectId,
    creatorId: source.creatorId,
    examName: source.examName.trim(),
    startTime: source.startTime,
    endTime: source.endTime,
    durationMinutes: source.durationMinutes,

    courseGroupIds,

    questions: questions.map((q, index) => ({
      id: q.id,
      order: index + 1,
      score: selectedScores[index],
    })),

    configuration: {
      hasMonitoring: source.examConfiguration?.hasMonitoring ?? false,
      allowCopy: source.examConfiguration?.allowCopy ?? true,
      allowPrint: source.examConfiguration?.allowPrint ?? true,
      isEnableResume: source.examConfiguration?.isEnableResume ?? false,
      shuffleQuestions: source.examConfiguration?.shuffleQuestions ?? true,
      shuffleAnswers: source.examConfiguration?.shuffleAnswers ?? true,
      showScore: source.examConfiguration?.showScore ?? true,
      showDetailResults: source.examConfiguration?.showDetailResults ?? false,
      isLimitSwitchTab: source.examConfiguration?.isLimitSwitchTab ?? false,
      tabSwitchLimit: source.examConfiguration?.tabSwitchLimit ?? 0,
      messageOnWarning:
        source.examConfiguration?.messageOnWarning ??
        "Bạn đã vi phạm quy chế thi!",
      limitQuestionsPerPage: Number(
        source.examConfiguration?.limitQuestionsPerPage ?? -1
      ),
      allowBackLastQuestion: Number(
        source.examConfiguration?.allowBackLastQuestion ?? 1
      ),
    },
  };
};

export const getEqualExamQuestionScores = (questionCount: number): number[] => {
  if (!Number.isInteger(questionCount) || questionCount <= 0) return [];

  const baseScoreCents = Math.floor(1000 / questionCount);
  const remainingScoreCents = 1000 % questionCount;
  return Array.from(
    { length: questionCount },
    (_, index) => (baseScoreCents + (index < remainingScoreCents ? 1 : 0)) / 100
  );
};
