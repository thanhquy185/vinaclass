import { useTranslation } from "react-i18next";
import {
  AdminFilterPanel,
  AdminSearchField,
  type AdminSearchCriterion,
} from "@/shared/components/admin";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type {
  CourseGroupSearchCriterion,
  CourseStatus,
} from "@/features/classrooms/types/courseGroupList";

interface CourseGroupFiltersPanelProps {
  isTeacher: boolean;
  statusFilter: CourseStatus;
  searchValue: string;
  searchBy: CourseGroupSearchCriterion;
  canReset: boolean;
  onStatusChange: (status: CourseStatus) => void;
  onSearchChange: (value: string) => void;
  onSearchByChange: (criterion: CourseGroupSearchCriterion) => void;
  onReset: () => void;
}

export default function CourseGroupFiltersPanel({
  isTeacher,
  statusFilter,
  searchValue,
  searchBy,
  canReset,
  onStatusChange,
  onSearchChange,
  onSearchByChange,
  onReset,
}: CourseGroupFiltersPanelProps) {
  const { t } = useTranslation("common");
  const allCriteria: AdminSearchCriterion<CourseGroupSearchCriterion>[] = [
    {
      value: "groupName",
      label: t("courseGroup.adminWorkspace.searchCriteria.groupName"),
      placeholder: t("courseGroup.adminWorkspace.searchPlaceholder.groupName"),
    },
    {
      value: "teacher",
      label: t("courseGroup.adminWorkspace.searchCriteria.teacher"),
      placeholder: t("courseGroup.adminWorkspace.searchPlaceholder.teacher"),
    },
    {
      value: "subject",
      label: t("courseGroup.adminWorkspace.searchCriteria.subject"),
      placeholder: t("courseGroup.adminWorkspace.searchPlaceholder.subject"),
    },
  ];
  const criteria = isTeacher
    ? allCriteria.filter((criterion) => criterion.value !== "teacher")
    : allCriteria;
  const statusOptions: { value: CourseStatus; label: string }[] = [
    { value: "active", label: t("courseGroup.status.active") },
    { value: "hidden", label: t("courseGroup.status.hidden") },
  ];

  return (
    <AdminFilterPanel
      title={t("courseGroup.adminWorkspace.filterTitle")}
      description={t(
        isTeacher
          ? "courseGroup.teacherWorkspace.filterDescription"
          : "courseGroup.adminWorkspace.filterDescription"
      )}
      resetLabel={t("courseGroup.adminWorkspace.resetFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
        <AdminSearchField<CourseGroupSearchCriterion>
          label={t("courseGroup.adminWorkspace.searchLabel")}
          criteriaLabel={t("common.searchByCriteria")}
          criteria={criteria}
          searchBy={searchBy}
          searchTerm={searchValue}
          onSearchByChange={onSearchByChange}
          onSearchTermChange={onSearchChange}
          className="min-w-0 flex-1"
        />
        <SelectField
          label={t("courseGroup.status.label")}
          placeholder={t("courseGroup.status.label")}
          className="w-full md:max-w-[260px]"
          options={statusOptions}
          value={statusFilter}
          onSelect={(value) => onStatusChange(String(value) as CourseStatus)}
        />
      </div>
    </AdminFilterPanel>
  );
}
