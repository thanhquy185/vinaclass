import type { StatisticsPeriodType } from "@/features/admin/utils/statisticsPeriod";
import { AdminPanel } from "@/shared/components/admin";
import { AdminFilterField } from "@/shared/components/admin/AdminFilterField";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type { StatisticsReport } from "@/features/admin/types/statistics";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface AdminStatisticsPeriodFilterProps {
  report: StatisticsReport;
  periodType: StatisticsPeriodType;
  periodValue: string;
  periodStartDate: string;
  periodEndDate: string;
  isRangeInvalid: boolean;
  periodTypeOptions: Array<{ label: string; value: string }>;
  periodValueOptions: Array<{ label: string; value: string }>;
  onPeriodTypeChange: (value: StatisticsPeriodType) => void;
  onPeriodValueChange: (value: string) => void;
  onPeriodStartDateChange: (value: string) => void;
  onPeriodEndDateChange: (value: string) => void;
}

export function AdminStatisticsPeriodFilter({
  report,
  periodType,
  periodValue,
  periodStartDate,
  periodEndDate,
  isRangeInvalid,
  periodTypeOptions,
  periodValueOptions,
  onPeriodTypeChange,
  onPeriodValueChange,
  onPeriodStartDateChange,
  onPeriodEndDateChange,
}: AdminStatisticsPeriodFilterProps) {
  const { t } = useTranslation("common");
  const isCustomPeriod = periodType === "custom";

  const renderDateField = (
    label: string,
    value: string,
    onChange: (value: string) => void
  ) => (
    <AdminFilterField label={label} className="min-w-0">
      <DatePicker
        aria-label={label}
        className="!h-11 !w-full !rounded-xl !bg-background-paper !px-3 [&_.ant-picker-input>input]:!text-text-primary"
        format="DD/MM/YYYY"
        placeholder="DD/MM/YYYY"
        size="large"
        value={value ? dayjs(value) : null}
        onChange={(date) => onChange(date?.format("YYYY-MM-DD") ?? "")}
      />
    </AdminFilterField>
  );

  return (
    <AdminPanel className="p-4 sm:p-5">
      <div
        className={`grid grid-cols-1 gap-3 ${isCustomPeriod ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        <SelectField
          label={t("statistics.period.granularity")}
          placeholder={t("statistics.period.granularity")}
          options={periodTypeOptions}
          value={periodType}
          onSelect={(value) =>
            onPeriodTypeChange(value as StatisticsPeriodType)
          }
        />
        {isCustomPeriod ? (
          <>
            {renderDateField(
              t("statistics.period.fromDate"),
              periodStartDate,
              onPeriodStartDateChange
            )}
            {renderDateField(
              t("statistics.period.toDate"),
              periodEndDate,
              onPeriodEndDateChange
            )}
          </>
        ) : (
          <SelectField
            label={t("statistics.period.specificPeriod")}
            placeholder={t("statistics.period.specificPeriod")}
            options={periodValueOptions}
            value={periodValue}
            onSelect={(value) => onPeriodValueChange(String(value))}
          />
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        {isRangeInvalid && (
          <p className="text-caption text-alert-error-content" role="alert">
            {t("statistics.period.invalidRange")}
          </p>
        )}
        <p className="text-caption text-text-secondary">
          {t(`statistics.period.basis.${report}`)}
        </p>
      </div>
    </AdminPanel>
  );
}
