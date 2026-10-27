import type { IconName } from "@/assets";
import type { AdminStatistics } from "@/features/admin/api/dashboard.service";
import { AdminStatisticsCharts } from "@/features/admin/components/AdminStatisticsCharts";
import { AdminStatisticsPeriodFilter } from "@/features/admin/components/AdminStatisticsPeriodFilter";
import { useAdminStatistics } from "@/features/admin/hooks/useAdminStatistics";
import {
  currentStatisticsDateRange,
  currentStatisticsPeriod,
  formatStatisticsPeriod,
  getStatisticsPeriodOptions,
  isValidStatisticsDateRange,
  type StatisticsPeriodType,
} from "@/features/admin/utils/statisticsPeriod";
import type { StatisticsReport } from "@/features/admin/types/statistics";
import PermissionRoute from "@/features/authorization/components/PermissionRoute";
import { QueryErrorAlert, Icon, Button } from "@/shared/components/ui";
import { AdminHeaderPanel, AdminPanel } from "@/shared/components/admin";
import MainContentLayout from "@/shared/layout/MainContentLayout";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";
import { Spin } from "antd";
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

const REPORTS: Record<
  string,
  { functionName: string; kind: StatisticsReport }
> = {
  "learning-outcomes": {
    functionName: "thong_ke_ket_qua",
    kind: "learningOutcomes",
  },
  exams: { functionName: "thong_ke_de_thi", kind: "examActivity" },
  classes: { functionName: "thong_ke_lop_hoc", kind: "classEnrollment" },
  questions: { functionName: "thong_ke_cau_hoi", kind: "questionBank" },
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  color: string;
  isLoading: boolean;
  isError: boolean;
}

function MetricCard({
  title,
  value,
  icon,
  color,
  isLoading,
  isError,
}: MetricCardProps) {
  return (
    <AdminPanel
      as="article"
      className="flex min-h-[112px] items-center gap-4 p-5"
    >
      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon name={icon} className="text-primary-contrast" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-2 font-medium text-text-secondary">{title}</p>
        <p className="mt-1 text-[26px] font-semibold leading-8 text-text-primary">
          {isLoading ? <Spin size="small" /> : isError ? "—" : value}
        </p>
      </div>
    </AdminPanel>
  );
}

function buildMetricCards(
  kind: StatisticsReport,
  statistics: AdminStatistics | undefined,
  locale: string,
  t: (key: string) => string
): Omit<MetricCardProps, "isLoading" | "isError">[] {
  const number = (value: number | undefined) =>
    (value ?? 0).toLocaleString(locale);
  const averageScore = (value: number | null | undefined) =>
    value === null || value === undefined
      ? "—"
      : `${value.toLocaleString(locale, { maximumFractionDigits: 2 })} / 10`;

  const metric = (
    title: string,
    value: string | number,
    icon: IconName,
    color: string
  ) => ({ title, value, icon, color });

  switch (kind) {
    case "learningOutcomes":
      return [
        metric(
          t("statistics.metrics.averageScore"),
          averageScore(statistics?.summary.averageScore),
          "testsOverview",
          "bg-alert-info-content"
        ),
        metric(
          t("statistics.metrics.submittedAttempts"),
          number(statistics?.summary.submittedAttempts),
          "document",
          "bg-alert-success-content"
        ),
        metric(
          t("statistics.metrics.completionRate"),
          `${(statistics?.summary.completionRate ?? 0).toLocaleString(locale, { maximumFractionDigits: 1 })}%`,
          "checkCircle",
          "bg-alert-warning-content"
        ),
        metric(
          t("statistics.metrics.studentsWithSubmissions"),
          number(statistics?.summary.studentsWithSubmissions),
          "users",
          "bg-alert-error-content"
        ),
      ];
    case "examActivity":
      return [
        metric(
          t("statistics.metrics.totalExams"),
          number(statistics?.summary.totalExams),
          "documentDuplicate",
          "bg-alert-info-content"
        ),
        metric(
          t("statistics.metrics.ongoingExams"),
          number(statistics?.summary.activeExams),
          "play",
          "bg-alert-success-content"
        ),
        metric(
          t("statistics.metrics.upcomingExams"),
          number(statistics?.summary.upcomingExams),
          "calendar",
          "bg-alert-warning-content"
        ),
        metric(
          t("statistics.metrics.inProgressAttempts"),
          number(statistics?.summary.inProgressAttempts),
          "clock",
          "bg-alert-error-content"
        ),
      ];
    case "classEnrollment":
      return [
        metric(
          t("statistics.metrics.activeClasses"),
          number(statistics?.classStats.activeClasses),
          "clipboard",
          "bg-alert-info-content"
        ),
        metric(
          t("statistics.metrics.totalEnrollments"),
          number(statistics?.classStats.totalEnrollments),
          "users",
          "bg-alert-success-content"
        ),
        metric(
          t("statistics.metrics.averageClassSize"),
          number(statistics?.classStats.averageClassSize),
          "groupUser",
          "bg-alert-warning-content"
        ),
        metric(
          t("statistics.metrics.subjects"),
          number(statistics?.classStats.activeSubjects),
          "folder",
          "bg-alert-error-content"
        ),
      ];
    case "questionBank":
      return [
        metric(
          t("statistics.metrics.totalQuestions"),
          number(statistics?.questionStats.totalQuestions),
          "question",
          "bg-alert-info-content"
        ),
        metric(
          t("statistics.metrics.publishedQuestions"),
          number(statistics?.questionStats.publicQuestions),
          "success",
          "bg-alert-success-content"
        ),
        metric(
          t("statistics.metrics.privateQuestions"),
          number(statistics?.questionStats.privateQuestions),
          "lock",
          "bg-alert-warning-content"
        ),
        metric(
          t("statistics.metrics.archivedQuestions"),
          number(statistics?.questionStats.archivedQuestions),
          "pause",
          "bg-alert-info-content"
        ),
        metric(
          t("statistics.metrics.questionUsage"),
          number(statistics?.questionStats.totalUsage),
          "refresh",
          "bg-alert-error-content"
        ),
      ];
  }
}

export default function AdminStatisticsPage() {
  const { report } = useParams();
  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const config = report ? REPORTS[report] : undefined;

  if (!config) {
    return <Navigate to="/statistics/learning-outcomes" replace />;
  }

  if (roleKind !== "ADMIN" && roleKind !== "CUSTOM") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PermissionRoute functionName={config.functionName}>
      <AdminStatisticsReport
        key={report}
        kind={config.kind}
        report={report!}
      />
    </PermissionRoute>
  );
}

function AdminStatisticsReport({
  kind,
  report,
}: {
  kind: StatisticsReport;
  report: string;
}) {
  const { t, i18n } = useTranslation("common");
  const [periodType, setPeriodType] = useState<StatisticsPeriodType>("month");
  const [periodValue, setPeriodValue] = useState(() =>
    currentStatisticsPeriod("month")
  );
  const [customDateRange, setCustomDateRange] = useState(() =>
    currentStatisticsDateRange()
  );
  const periodTypeOptions = useMemo(
    () => [
      { label: t("statistics.period.month"), value: "month" },
      { label: t("statistics.period.quarter"), value: "quarter" },
      { label: t("statistics.period.year"), value: "year" },
      { label: t("statistics.period.custom"), value: "custom" },
    ],
    [t]
  );
  const language = i18n.resolvedLanguage ?? i18n.language;
  const periodValueOptions = useMemo(
    () =>
      periodType === "custom"
        ? []
        : getStatisticsPeriodOptions(periodType, language),
    [periodType, language]
  );
  const isPeriodValid =
    periodType !== "custom" ||
    isValidStatisticsDateRange(
      customDateRange.startDate,
      customDateRange.endDate
    );
  const selectedPeriod = formatStatisticsPeriod(
    { type: periodType, value: periodValue, ...customDateRange },
    language
  );
  const printedAt = new Intl.DateTimeFormat(language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const printStatistics = () => {
    document.body.classList.add("printing-statistics");

    let fallbackTimeout = 0;
    const restorePage = () => {
      document.body.classList.remove("printing-statistics");
      window.clearTimeout(fallbackTimeout);
      window.removeEventListener("afterprint", restorePage);
    };

    window.addEventListener("afterprint", restorePage, { once: true });
    fallbackTimeout = window.setTimeout(restorePage, 60_000);
    window.print();
  };
  const { statistics, isLoading, isFetching, isError, refetch } =
    useAdminStatistics(
      report,
      periodType,
      periodValue,
      customDateRange.startDate,
      customDateRange.endDate,
      isPeriodValid
    );
  const metrics = buildMetricCards(kind, statistics, i18n.language, t);

  return (
    <MainContentLayout width="wide" hasFooter={false}>
      <section className="statistics-print-root flex flex-col gap-6 lg:gap-7">
        <AdminHeaderPanel
          title={t(`statistics.reports.${kind}.title`)}
          description={t(`statistics.reports.${kind}.description`)}
          actions={
            <Button
              variant="contained"
              color="primary"
              size="medium"
              className="statistics-print-hide !h-11 !rounded-xl !px-4 !font-medium !shadow-sm"
              disabled={isLoading || !isPeriodValid}
              icon={<Printer size={16} />}
              onClick={printStatistics}
            >
              {t("statistics.period.print")}
            </Button>
          }
        />

        <div className="statistics-print-only text-body-2 text-text-secondary">
          <p>
            {t("statistics.period.printedPeriod", { period: selectedPeriod })}
          </p>
          <p>{t("statistics.period.printedAt", { date: printedAt })}</p>
        </div>

        <div className="statistics-print-hide">
          <AdminStatisticsPeriodFilter
            report={kind}
            periodType={periodType}
            periodValue={periodValue}
            periodStartDate={customDateRange.startDate}
            periodEndDate={customDateRange.endDate}
            isRangeInvalid={!isPeriodValid}
            periodTypeOptions={periodTypeOptions}
            periodValueOptions={periodValueOptions}
            onPeriodTypeChange={(nextType) => {
              setPeriodType(nextType);
              setPeriodValue(
                nextType === "custom" ? "" : currentStatisticsPeriod(nextType)
              );
            }}
            onPeriodValueChange={setPeriodValue}
            onPeriodStartDateChange={(startDate) =>
              setCustomDateRange((range) => ({ ...range, startDate }))
            }
            onPeriodEndDateChange={(endDate) =>
              setCustomDateRange((range) => ({ ...range, endDate }))
            }
          />
        </div>

        {isError && (
          <div className="statistics-print-hide">
            <QueryErrorAlert
              message={t("statistics.loadError")}
              onRetry={refetch}
              isRetrying={isFetching}
              retryLabel={t("tableActions.retry")}
            />
          </div>
        )}

        {isPeriodValid && (
          <div
            className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 ${kind === "questionBank" ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
          >
            {metrics.map((item) => (
              <MetricCard
                key={item.title}
                {...item}
                isLoading={isLoading}
                isError={isError}
              />
            ))}
          </div>
        )}

        {isPeriodValid && statistics && (
          <AdminStatisticsCharts
            kind={kind}
            statistics={statistics}
            isLoading={isLoading}
            locale={i18n.language}
          />
        )}
      </section>
    </MainContentLayout>
  );
}
