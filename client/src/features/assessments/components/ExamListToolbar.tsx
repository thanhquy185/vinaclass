import { useTranslation } from "react-i18next";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
  AdminFilterField,
  AdminFilterPanel,
  AdminSearchField,
} from "@/shared/components/admin";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type {
  ExamDateTimeRange,
  ExamSearchCriterion,
  ExamStatusFilter,
  ExamSubjectOption,
} from "@/features/assessments/types/examList";

interface ExamListToolbarProps {
  searchTerm: string;
  searchBy: ExamSearchCriterion;
  selectedSubject: number;
  statusFilter: ExamStatusFilter;
  dateTimeRange: ExamDateTimeRange;
  isNewestFirst: boolean;
  subjects: ExamSubjectOption[];
  resultCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (value: ExamSearchCriterion) => void;
  onSubjectChange: (value: number) => void;
  onStatusChange: (value: ExamStatusFilter) => void;
  onDateTimeRangeChange: (value: ExamDateTimeRange) => void;
  onToggleSort: () => void;
  onResetFilters: () => void;
}

export default function ExamListToolbar({
  searchTerm,
  searchBy,
  selectedSubject,
  statusFilter,
  dateTimeRange,
  isNewestFirst,
  subjects,
  resultCount,
  hasActiveFilters,
  onSearchChange,
  onSearchByChange,
  onSubjectChange,
  onStatusChange,
  onDateTimeRangeChange,
  onToggleSort,
  onResetFilters,
}: ExamListToolbarProps) {
  const { t } = useTranslation("common");

  return (
    <div id="test-page-toolbar">
      <AdminFilterPanel
        title={t("testPage.filter.panelTitle")}
        description={t("testPage.filter.panelDescription")}
        resetLabel={t("testPage.clearFilters")}
        resetDisabled={!hasActiveFilters}
        onReset={onResetFilters}
      >
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            <AdminSearchField<ExamSearchCriterion>
              label={t("testPage.filter.searchLabel")}
              criteriaLabel={t("common.searchByCriteria")}
              criteria={[
                {
                  value: "name",
                  label: t("testPage.searchBy.name"),
                  placeholder: t("testPage.searchBy.namePlaceholder"),
                },
                {
                  value: "subject",
                  label: t("testPage.searchBy.subject"),
                  placeholder: t("testPage.searchBy.subjectPlaceholder"),
                },
              ]}
              searchBy={searchBy}
              searchTerm={searchTerm}
              onSearchByChange={onSearchByChange}
              onSearchTermChange={onSearchChange}
              className="xl:col-span-2"
            />
            <SelectField
              label={t("testPage.filter.statusLabel")}
              value={statusFilter}
              placeholder={t("testPage.filter.all")}
              options={[
                { label: t("testPage.filter.all"), value: 1 },
                { label: t("testPage.filter.opening"), value: 2 },
                { label: t("testPage.filter.closed"), value: 3 },
                { label: t("testPage.filter.notOpened"), value: 4 },
              ]}
              onSelect={(value) =>
                onStatusChange(Number(value) as ExamStatusFilter)
              }
            />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label={t("testPage.subject")}
              placeholder={t("testPage.selectSubjectPlaceholder")}
              options={[
                { label: t("testPage.filter.allSubjects"), value: -1 },
                ...subjects.map((subject) => ({
                  label: subject.subjectName,
                  value: subject.id,
                })),
              ]}
              value={selectedSubject}
              onSelect={(value) => onSubjectChange(Number(value))}
            />
            <AdminFilterField label={t("testPage.filter.dateTimeLabel")}>
              <DatePicker.RangePicker
                allowEmpty={[false, false]}
                allowClear
                showTime={{ format: "HH:mm" }}
                format="DD/MM/YYYY HH:mm"
                placeholder={[
                  t("testPage.filter.dateTimeStart"),
                  t("testPage.filter.dateTimeEnd"),
                ]}
                value={
                  dateTimeRange
                    ? [dayjs(dateTimeRange[0]), dayjs(dateTimeRange[1])]
                    : null
                }
                onChange={(dates: [Dayjs | null, Dayjs | null] | null) => {
                  if (!dates?.[0]?.isValid() || !dates[1]?.isValid()) {
                    onDateTimeRangeChange(null);
                    return;
                  }
                  onDateTimeRangeChange([
                    dates[0].valueOf(),
                    dates[1].valueOf(),
                  ]);
                }}
                className="!h-11 !w-full !rounded-lg !bg-background-paper !text-sm"
                size="large"
              />
            </AdminFilterField>
            <SelectField
              label={t("testPage.sort.label")}
              placeholder={t("testPage.sort.label")}
              options={[
                { label: t("testPage.sort.newest"), value: "newest" },
                { label: t("testPage.sort.oldest"), value: "oldest" },
              ]}
              value={isNewestFirst ? "newest" : "oldest"}
              onSelect={onToggleSort}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="text-body-2 text-text-secondary"
              aria-live="polite"
            >
              {t("testPage.resultCount", {
                count: resultCount,
              })}
            </span>
          </div>
        </div>
      </AdminFilterPanel>
    </div>
  );
}
