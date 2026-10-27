export type StatisticsPeriodType = "month" | "quarter" | "year" | "custom";

export interface StatisticsPeriodSelection {
  type: StatisticsPeriodType;
  value: string;
  startDate?: string;
  endDate?: string;
}

const MAX_CUSTOM_PERIOD_DAYS = 3660;

const formatLocalDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const currentStatisticsDateRange = (now = new Date()) => ({
  startDate: formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  endDate: formatLocalDate(now),
});

export const isValidStatisticsDateRange = (
  startDate: string,
  endDate: string
): boolean => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(startDate) || !datePattern.test(endDate)) return false;

  const parseDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (year < 1000 || year > 9998) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
      ? date
      : null;
  };
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end || end < start) return false;
  return (
    (end.getTime() - start.getTime()) / 86_400_000 <= MAX_CUSTOM_PERIOD_DAYS
  );
};

const formatYearMonth = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const currentStatisticsPeriod = (
  type: StatisticsPeriodType,
  now = new Date()
): string => {
  const year = now.getFullYear();

  if (type === "custom") return "";
  if (type === "year") return String(year);
  if (type === "quarter")
    return `${year}-Q${Math.floor(now.getMonth() / 3) + 1}`;

  return formatYearMonth(now);
};

export const getStatisticsPeriodOptions = (
  type: StatisticsPeriodType,
  locale: string,
  now = new Date()
): Array<{ label: string; value: string }> => {
  const language = locale === "vi" ? "vi-VN" : "en-US";
  const currentYear = now.getFullYear();

  if (type === "month") {
    return Array.from({ length: 36 }, (_, index) => {
      const date = new Date(currentYear, now.getMonth() + 12 - index, 1);
      return {
        label: new Intl.DateTimeFormat(language, {
          month: "long",
          year: "numeric",
        }).format(date),
        value: formatYearMonth(date),
      };
    });
  }

  if (type === "quarter") {
    return Array.from({ length: 20 }, (_, index) => {
      const quarterIndex = Math.floor(now.getMonth() / 3) + 4 - index;
      const date = new Date(currentYear, quarterIndex * 3, 1);
      const quarter = Math.floor(date.getMonth() / 3) + 1;

      return {
        label:
          locale === "vi"
            ? `Quý ${quarter}, ${date.getFullYear()}`
            : `Q${quarter} ${date.getFullYear()}`,
        value: `${date.getFullYear()}-Q${quarter}`,
      };
    });
  }

  if (type === "year")
    return Array.from({ length: 12 }, (_, index) => {
      const year = currentYear + 2 - index;
      return { label: String(year), value: String(year) };
    });

  return [];
};

export const formatStatisticsPeriod = (
  { type, value, startDate, endDate }: StatisticsPeriodSelection,
  locale: string
): string => {
  const language = locale === "vi" ? "vi-VN" : "en-US";

  if (type === "custom") {
    const formatDate = (value?: string) => {
      if (!value) return "";
      const [year, month, day] = value.split("-").map(Number);
      return new Intl.DateTimeFormat(language, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(year, month - 1, day));
    };
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }

  if (type === "year") return value;
  if (type === "quarter") {
    const [, year, quarter] = /^(\d{4})-Q([1-4])$/.exec(value) ?? [];
    if (!year || !quarter) return value;
    return locale === "vi" ? `Quý ${quarter}, ${year}` : `Q${quarter} ${year}`;
  }

  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;

  return new Intl.DateTimeFormat(language, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
};
