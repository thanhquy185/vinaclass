import type { AdminStatistics } from "@/features/admin/api/dashboard.service";
import type { StatisticsReport } from "@/features/admin/types/statistics";
import { Empty, Spin } from "antd";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { AdminPanel } from "@/shared/components/admin";

interface AdminStatisticsChartsProps {
  kind: StatisticsReport;
  statistics: AdminStatistics;
  isLoading: boolean;
  locale: string;
}

interface ChartPanelProps {
  title: string;
  children: ReactNode;
}

function ChartPanel({ title, children }: ChartPanelProps) {
  return (
    <AdminPanel className="min-w-0 p-5 sm:p-6">
      <h2 className="text-body-1 font-semibold text-text-primary">{title}</h2>
      <div className="mt-5">{children}</div>
    </AdminPanel>
  );
}

function ChartState({
  isLoading,
  hasData,
}: {
  isLoading: boolean;
  hasData: boolean;
}) {
  const { t } = useTranslation("common");

  if (isLoading) {
    return (
      <div className="flex h-[260px] items-center justify-center" role="status">
        <Spin />
      </div>
    );
  }

  if (!hasData) {
    return (
      <Empty
        className="flex h-[260px] flex-col justify-center"
        description={t("statistics.empty")}
      />
    );
  }

  return null;
}

const formatMonth = (
  month: string,
  locale: string,
  includeYear = false
): string => {
  const date = new Date(`${month}-01T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    ...(includeYear ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(date);
};

const formatBucket = (
  bucket: string,
  locale: string,
  includeMonthYear = false
): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bucket)) {
    return formatMonth(bucket, locale, includeMonthYear);
  }

  const date = new Date(`${bucket}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatDailyBucket = (
  bucket: string,
  locale: string,
  includeYear: boolean
): string => {
  const date = new Date(`${bucket}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(date);
};

function HorizontalBarChart({
  data,
  nameKey,
  valueKey,
  color,
  locale,
  valueLabel,
  domain,
}: {
  data: Array<Record<string, string | number | null>>;
  nameKey: string;
  valueKey: string;
  color: string;
  locale: string;
  valueLabel: string;
  domain?: [number, number];
}) {
  if (data.length === 0) {
    return <ChartState isLoading={false} hasData={false} />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 18, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          stroke="var(--color-other-divider)"
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={domain}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={125}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => [
            Number(value).toLocaleString(locale),
            valueLabel,
          ]}
        />
        <Bar
          dataKey={valueKey}
          fill={color}
          radius={[0, 6, 6, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RankedList<T extends { id: number }>({
  rows,
  emptyLabel,
  children,
  columns = false,
}: {
  rows: T[];
  emptyLabel: string;
  children: (row: T, index: number) => ReactNode;
  columns?: boolean;
}) {
  if (rows.length === 0) {
    return <Empty description={emptyLabel} />;
  }

  return (
    <ol
      className={
        columns
          ? "grid grid-cols-1 gap-x-6 md:grid-cols-2"
          : "divide-y divide-other-divider"
      }
    >
      {rows.map((row, index) => (
        <li
          key={row.id}
          className={
            columns
              ? "border-b border-other-divider py-3 first:pt-1"
              : "py-3 first:pt-1 last:pb-1"
          }
        >
          {children(row, index)}
        </li>
      ))}
    </ol>
  );
}

function LearningOutcomeCharts({
  statistics,
  locale,
}: {
  statistics: AdminStatistics;
  locale: string;
}) {
  const { t } = useTranslation("common");
  const hasScores = statistics.scoreDistribution.some(
    (item) => item.attemptCount > 0
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartPanel title={t("statistics.charts.scoreDistribution")}>
        {!hasScores ? (
          <ChartState isLoading={false} hasData={false} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={statistics.scoreDistribution}
              margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-other-divider)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="range"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString(locale),
                  t("statistics.charts.attempts"),
                ]}
              />
              <Bar
                dataKey="attemptCount"
                fill="var(--color-primary-main)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartPanel>

      <ChartPanel title={t("statistics.charts.averageBySubject")}>
        <HorizontalBarChart
          data={statistics.averageScoreBySubject.map((item) => ({
            subjectName: item.subjectName,
            averageScore: item.averageScore,
          }))}
          nameKey="subjectName"
          valueKey="averageScore"
          color="var(--color-alert-info-content)"
          locale={locale}
          valueLabel={t("statistics.charts.averageScore")}
          domain={[0, 10]}
        />
      </ChartPanel>
    </div>
  );
}

function ExamActivityCharts({
  statistics,
  locale,
}: {
  statistics: AdminStatistics;
  locale: string;
}) {
  const { t } = useTranslation("common");
  const hasAttemptData = statistics.attemptTrend.some(
    (item) => item.attemptCount > 0
  );
  const spansCalendarYears =
    statistics.period.startDate.slice(0, 4) !==
    statistics.period.endDate.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartPanel title={t("statistics.charts.attemptTrend")}>
        {!hasAttemptData ? (
          <ChartState isLoading={false} hasData={false} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
              data={statistics.attemptTrend}
              margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-other-divider)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="bucket"
                interval={statistics.attemptTrend.length > 16 ? 4 : 0}
                tickFormatter={(value: string) => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return statistics.period.type === "month"
                      ? String(Number(value.slice(-2)))
                      : formatDailyBucket(value, locale, spansCalendarYears);
                  }
                  return formatMonth(value, locale, spansCalendarYears);
                }}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              />
              <YAxis
                yAxisId="attempts"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              />
              <YAxis
                yAxisId="score"
                orientation="right"
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(value) =>
                  formatBucket(String(value), locale, spansCalendarYears)
                }
                formatter={(value, name) => [
                  Number(value).toLocaleString(locale, {
                    maximumFractionDigits: 2,
                  }),
                  String(name),
                ]}
              />
              <Legend />
              <Bar
                dataKey="attemptCount"
                name={t("statistics.charts.attempts")}
                yAxisId="attempts"
                fill="var(--color-primary-main)"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              />
              <Line
                dataKey="averageScore"
                name={t("statistics.charts.averageScore")}
                yAxisId="score"
                type="monotone"
                stroke="var(--color-alert-info-content)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartPanel>

      <ChartPanel title={t("statistics.charts.mostAttemptedExams")}>
        <RankedList
          rows={statistics.topExams}
          emptyLabel={t("statistics.empty")}
        >
          {(exam) => {
            return (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-body-2 truncate font-medium text-text-primary">
                    {exam.examName}
                  </p>
                  <p className="text-caption mt-1 truncate text-text-secondary">
                    {exam.subjectName ?? t("statistics.subjectUnavailable")}
                  </p>
                  <p className="text-caption mt-1 text-text-secondary">
                    {t("statistics.charts.submittedOfAttempts", {
                      submitted: exam.submittedCount,
                      attempts: exam.attemptCount,
                    })}
                  </p>
                </div>
                <span className="text-body-2 shrink-0 font-semibold text-text-primary">
                  {exam.averageScore === null
                    ? "—"
                    : `${exam.averageScore.toLocaleString(locale, { maximumFractionDigits: 2 })} / 10`}
                </span>
              </div>
            );
          }}
        </RankedList>
      </ChartPanel>
    </div>
  );
}

function ClassEnrollmentCharts({
  statistics,
  locale,
}: {
  statistics: AdminStatistics;
  locale: string;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartPanel title={t("statistics.charts.studentsBySubject")}>
        <HorizontalBarChart
          data={statistics.subjectEnrollment.map((item) => ({
            subjectName: item.subjectName,
            studentCount: item.studentCount,
          }))}
          nameKey="subjectName"
          valueKey="studentCount"
          color="var(--color-success-main)"
          locale={locale}
          valueLabel={t("statistics.charts.students")}
        />
      </ChartPanel>

      <ChartPanel title={t("statistics.charts.largestClasses")}>
        <RankedList
          rows={statistics.largestClasses}
          emptyLabel={t("statistics.empty")}
        >
          {(courseGroup) => {
            return (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-body-2 truncate font-medium text-text-primary">
                    {courseGroup.className}
                  </p>
                  <p className="text-caption mt-1 truncate text-text-secondary">
                    {courseGroup.subjectName ??
                      t("statistics.subjectUnavailable")}
                  </p>
                </div>
                <span className="text-body-2 shrink-0 font-semibold text-text-primary">
                  {t("statistics.studentCount", {
                    count: courseGroup.studentCount,
                  })}
                </span>
              </div>
            );
          }}
        </RankedList>
      </ChartPanel>
    </div>
  );
}

function QuestionBankCharts({
  statistics,
  locale,
}: {
  statistics: AdminStatistics;
  locale: string;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartPanel title={t("statistics.charts.questionsByDifficulty")}>
        <HorizontalBarChart
          data={statistics.difficultyDistribution.map((item) => ({
            difficultyName:
              item.difficultyName ?? t("statistics.unassignedDifficulty"),
            questionCount: item.questionCount,
          }))}
          nameKey="difficultyName"
          valueKey="questionCount"
          color="var(--color-alert-warning-content)"
          locale={locale}
          valueLabel={t("statistics.charts.questions")}
        />
      </ChartPanel>

      <ChartPanel title={t("statistics.charts.questionsBySubject")}>
        <HorizontalBarChart
          data={statistics.subjectQuestionBank.map((item) => ({
            subjectName: item.subjectName,
            questionCount: item.questionCount,
          }))}
          nameKey="subjectName"
          valueKey="questionCount"
          color="var(--color-alert-info-content)"
          locale={locale}
          valueLabel={t("statistics.charts.questions")}
        />
      </ChartPanel>

      <div className="xl:col-span-2">
        <ChartPanel title={t("statistics.charts.mostUsedQuestions")}>
          <RankedList
            rows={statistics.mostUsedQuestions}
            emptyLabel={t("statistics.empty")}
            columns
          >
            {(question) => {
              return (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-body-2 truncate font-medium text-text-primary">
                      {t("statistics.questionNumber", { id: question.id })}
                    </p>
                    <p className="text-caption mt-1 truncate text-text-secondary">
                      {question.subjectName ??
                        t("statistics.subjectUnavailable")}
                      {question.difficultyName
                        ? ` · ${question.difficultyName}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-body-2 shrink-0 font-semibold text-text-primary">
                    {t("statistics.usageCount", {
                      count: question.usageCount,
                    })}
                  </span>
                </div>
              );
            }}
          </RankedList>
        </ChartPanel>
      </div>
    </div>
  );
}

export function AdminStatisticsCharts({
  kind,
  statistics,
  isLoading,
  locale,
}: AdminStatisticsChartsProps) {
  if (isLoading) {
    return (
      <div
        className="flex min-h-[280px] items-center justify-center"
        role="status"
      >
        <Spin />
      </div>
    );
  }

  if (kind === "learningOutcomes") {
    return <LearningOutcomeCharts statistics={statistics} locale={locale} />;
  }

  if (kind === "examActivity") {
    return <ExamActivityCharts statistics={statistics} locale={locale} />;
  }

  if (kind === "classEnrollment") {
    return <ClassEnrollmentCharts statistics={statistics} locale={locale} />;
  }

  return <QuestionBankCharts statistics={statistics} locale={locale} />;
}
