import {
  AdminFilterField,
  AdminFilterPanel,
  AdminSearchField,
} from "@/shared/components/admin";
import { Button, Icon, SelectField } from "@/shared/components/ui";
import type {
  PermissionGroupKind,
  PermissionGroupSearchCriterion,
} from "@/features/authorization/utils/permissionGroupList";
import type { RoleNameSortDirection } from "@/shared/types";
import { useTranslation } from "react-i18next";

interface PermissionGroupFiltersPanelProps {
  searchTerm: string;
  searchBy: PermissionGroupSearchCriterion;
  kind: PermissionGroupKind;
  sortDirection: RoleNameSortDirection | null;
  canReset: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (value: PermissionGroupSearchCriterion) => void;
  onKindChange: (value: PermissionGroupKind) => void;
  onToggleSort: () => void;
  onReset: () => void;
}

export function PermissionGroupFiltersPanel({
  searchTerm,
  searchBy,
  kind,
  sortDirection,
  canReset,
  onSearchChange,
  onSearchByChange,
  onKindChange,
  onToggleSort,
  onReset,
}: PermissionGroupFiltersPanelProps) {
  const { t } = useTranslation("common");

  return (
    <AdminFilterPanel
      title={t("permissionGroupPage.filter.panelTitle")}
      description={t("permissionGroupPage.filter.panelDescription")}
      resetLabel={t("permissionGroupPage.resetFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <AdminSearchField<PermissionGroupSearchCriterion>
          className="flex-1"
          label={t("permissionGroupPage.filter.searchLabel")}
          criteriaLabel={t("common.searchByCriteria")}
          criteria={[
            {
              label: t("permissionGroupPage.searchBy.name"),
              value: "name",
              placeholder: t("permissionGroupPage.searchBy.namePlaceholder"),
            },
            {
              label: t("permissionGroupPage.searchBy.code"),
              value: "code",
              placeholder: t("permissionGroupPage.searchBy.codePlaceholder"),
            },
          ]}
          searchBy={searchBy}
          searchTerm={searchTerm}
          onSearchByChange={onSearchByChange}
          onSearchTermChange={onSearchChange}
        />
        <SelectField
          label={t("permissionGroupPage.filter.kindLabel")}
          placeholder={t("permissionGroupPage.filter.kindPlaceholder")}
          className="w-full md:max-w-[230px]"
          options={[
            { label: t("permissionGroupPage.filter.all"), value: "all" },
            { label: t("permissionGroupPage.filter.system"), value: "system" },
            { label: t("permissionGroupPage.filter.custom"), value: "custom" },
          ]}
          value={kind}
          onSelect={(value) =>
            onKindChange(
              value === "system" || value === "custom" ? value : "all",
            )
          }
        />
        <AdminFilterField
          label={t("permissionGroupPage.filter.sortLabel")}
          className="shrink-0"
        >
          <Button
            variant="outline"
            size="medium"
            className="!mt-0.5 !h-11 !shrink-0 !rounded-xl px-3"
            aria-label={t(
              sortDirection === "asc"
                ? "permissionGroupPage.sortDescending"
                : "permissionGroupPage.sortAscending",
            )}
            title={t(
              sortDirection === "asc"
                ? "permissionGroupPage.sortDescending"
                : "permissionGroupPage.sortAscending",
            )}
            onClick={onToggleSort}
          >
            <Icon name="arrowUpDown" size={18} />
            {t(
              sortDirection === "desc"
                ? "permissionGroupPage.sortNameDescending"
                : "permissionGroupPage.sortNameAscending",
            )}
          </Button>
        </AdminFilterField>
      </div>
    </AdminFilterPanel>
  );
}
