import { useTranslation } from "react-i18next";
import { AdminFilterPanel, AdminSearchField } from "@/shared/components/admin";

interface SubjectFiltersPanelProps {
  searchTerm: string;
  searchBy: "name" | "code";
  canReset: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (value: "name" | "code") => void;
  onReset: () => void;
}

export function SubjectFiltersPanel({
  searchTerm,
  searchBy,
  canReset,
  onSearchChange,
  onSearchByChange,
  onReset,
}: SubjectFiltersPanelProps) {
  const { t } = useTranslation("common");

  return (
    <AdminFilterPanel
      title={t("subjectPage.filter.panelTitle")}
      description={t("subjectPage.filter.panelDescription")}
      resetLabel={t("subjectPage.resetFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <AdminSearchField<"name" | "code">
        label={t("subjectPage.filter.searchLabel")}
        criteriaLabel={t("common.searchByCriteria")}
        criteria={[
          {
            label: t("subjectPage.searchBy.name"),
            value: "name",
            placeholder: t("subjectPage.searchBy.namePlaceholder"),
          },
          {
            label: t("subjectPage.searchBy.code"),
            value: "code",
            placeholder: t("subjectPage.searchBy.codePlaceholder"),
          },
        ]}
        searchBy={searchBy}
        searchTerm={searchTerm}
        onSearchByChange={onSearchByChange}
        onSearchTermChange={onSearchChange}
      />
    </AdminFilterPanel>
  );
}
