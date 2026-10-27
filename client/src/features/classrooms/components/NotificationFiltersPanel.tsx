import { useTranslation } from "react-i18next";
import {
  AdminFilterField,
  AdminFilterPanel,
  AdminSearchField,
  type AdminSearchCriterion,
} from "@/shared/components/admin";
import { Button, Icon, SelectField } from "@/shared/components/ui";
import type {
  NotificationSearchCriterion,
  NotificationStatusFilter,
} from "@/features/classrooms/utils/filterNotifications";

interface NotificationFiltersPanelProps {
  searchTerm: string;
  searchBy: NotificationSearchCriterion;
  statusFilter: NotificationStatusFilter;
  newestFirst: boolean;
  canReset: boolean;
  onSearchChange: (value: string) => void;
  onSearchByChange: (criterion: NotificationSearchCriterion) => void;
  onStatusChange: (status: NotificationStatusFilter) => void;
  onToggleSort: () => void;
  onReset: () => void;
}

export function NotificationFiltersPanel({
  searchTerm,
  searchBy,
  statusFilter,
  newestFirst,
  canReset,
  onSearchChange,
  onSearchByChange,
  onStatusChange,
  onToggleSort,
  onReset,
}: NotificationFiltersPanelProps) {
  const { t } = useTranslation("common");
  const criteria: AdminSearchCriterion<NotificationSearchCriterion>[] = [
    {
      value: "all",
      label: t("notificationPage.search.criteria.all"),
      placeholder: t("notificationPage.search.placeholders.all"),
    },
    {
      value: "title",
      label: t("notificationPage.search.criteria.title"),
      placeholder: t("notificationPage.search.placeholders.title"),
    },
    {
      value: "content",
      label: t("notificationPage.search.criteria.content"),
      placeholder: t("notificationPage.search.placeholders.content"),
    },
    {
      value: "class",
      label: t("notificationPage.search.criteria.class"),
      placeholder: t("notificationPage.search.placeholders.class"),
    },
    {
      value: "sender",
      label: t("notificationPage.search.criteria.sender"),
      placeholder: t("notificationPage.search.placeholders.sender"),
    },
  ];

  return (
    <AdminFilterPanel
      title={t("notificationPage.filter.panelTitle")}
      description={t("notificationPage.filter.panelDescription")}
      resetLabel={t("notificationPage.clearFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <AdminSearchField<NotificationSearchCriterion>
          className="flex-1"
          criteria={criteria}
          searchBy={searchBy}
          searchTerm={searchTerm}
          criteriaLabel={t("common.searchByCriteria")}
          label={t("notificationPage.search.label")}
          onSearchByChange={onSearchByChange}
          onSearchTermChange={onSearchChange}
        />
        <SelectField
          label={t("notificationPage.filter.label")}
          placeholder={t("notificationPage.filter.label")}
          className="w-full md:max-w-[230px]"
          value={statusFilter}
          options={[
            { label: t("notificationPage.filter.all"), value: 1 },
            { label: t("notificationPage.filter.sent"), value: 2 },
            { label: t("notificationPage.filter.draft"), value: 3 },
          ]}
          onSelect={(value) =>
            onStatusChange(value as NotificationStatusFilter)
          }
        />
        <AdminFilterField
          label={t("notificationPage.filter.sortLabel")}
          className="shrink-0"
        >
          <Button
            variant="outline"
            size="medium"
            className="!mt-0.5 !h-11 !shrink-0 !rounded-xl px-3"
            aria-label={t(
              newestFirst
                ? "notificationPage.sortOldestFirst"
                : "notificationPage.sortNewestFirst",
            )}
            title={t(
              newestFirst
                ? "notificationPage.sortOldestFirst"
                : "notificationPage.sortNewestFirst",
            )}
            onClick={onToggleSort}
          >
            <Icon name="arrowUpDown" size={18} />
            {t(
              newestFirst
                ? "notificationPage.sortNewestFirst"
                : "notificationPage.sortOldestFirst",
            )}
          </Button>
        </AdminFilterField>
      </div>
    </AdminFilterPanel>
  );
}
