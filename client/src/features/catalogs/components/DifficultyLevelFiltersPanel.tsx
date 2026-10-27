import { useTranslation } from "react-i18next";
import { AdminFilterPanel, AdminSearchField } from "@/shared/components/admin";

interface DifficultyLevelFiltersPanelProps {
  searchTerm: string;
  searchBy: "name" | "id";
  canReset: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (value: "name" | "id") => void;
  onReset: () => void;
}

export function DifficultyLevelFiltersPanel({
  searchTerm,
  searchBy,
  canReset,
  onSearchChange,
  onSearchByChange,
  onReset,
}: DifficultyLevelFiltersPanelProps) {
  const { t } = useTranslation("common");

  return (
    <AdminFilterPanel
      title={t("difficultyLevelPage.filter.panelTitle")}
      description={t("difficultyLevelPage.filter.panelDescription")}
      resetLabel={t("difficultyLevelPage.resetFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <AdminSearchField<"name" | "id">
        label={t("difficultyLevelPage.filter.searchLabel")}
        criteriaLabel={t("common.searchByCriteria")}
        criteria={[
          {
            label: t("difficultyLevelPage.searchBy.name"),
            value: "name",
            placeholder: t("difficultyLevelPage.searchBy.namePlaceholder"),
          },
          {
            label: t("difficultyLevelPage.searchBy.id"),
            value: "id",
            placeholder: t("difficultyLevelPage.searchBy.idPlaceholder"),
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
