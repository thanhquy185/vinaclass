import { useTranslation } from "react-i18next";
import { AdminFilterPanel, AdminSearchField } from "@/shared/components/admin";
import type { AssignmentFilterCriteria } from "@/features/teacher-assignments/types/assignmentList";

interface AssignmentFiltersPanelProps {
  isTeacher: boolean;
  searchBy: AssignmentFilterCriteria;
  searchTerm: string;
  canReset: boolean;
  onSearchByChange: (criteria: AssignmentFilterCriteria) => void;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
}

export default function AssignmentFiltersPanel({
  isTeacher,
  searchBy,
  searchTerm,
  canReset,
  onSearchByChange,
  onSearchTermChange,
  onReset,
}: AssignmentFiltersPanelProps) {
  const { t } = useTranslation("common");
  const criteria = isTeacher
    ? [
        {
          label: t("assignmentPage.filter.bySubject"),
          value: "subject" as const,
          placeholder: t("assignmentPage.searchBy.subjectPlaceholder"),
        },
      ]
    : [
        {
          label: t("assignmentPage.filter.byTeacher"),
          value: "teacher" as const,
          placeholder: t("assignmentPage.searchBy.teacherPlaceholder"),
        },
        {
          label: t("assignmentPage.filter.bySubject"),
          value: "subject" as const,
          placeholder: t("assignmentPage.searchBy.subjectPlaceholder"),
        },
      ];

  return (
    <AdminFilterPanel
      title={t("assignmentPage.filter.panelTitle")}
      description={t("assignmentPage.filter.panelDescription")}
      resetLabel={t("assignmentPage.resetFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <AdminSearchField<AssignmentFilterCriteria>
        label={t("assignmentPage.filter.searchLabel")}
        criteriaLabel={t("common.searchByCriteria")}
        criteria={criteria}
        searchBy={searchBy}
        searchTerm={searchTerm}
        onSearchByChange={onSearchByChange}
        onSearchTermChange={onSearchTermChange}
      />
    </AdminFilterPanel>
  );
}
