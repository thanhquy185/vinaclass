import {
  AdminFilterField,
  AdminFilterPanel,
  AdminSearchField,
} from "@/shared/components/admin";
import { Button, Icon } from "@/shared/components/ui";
import { QueryErrorAlert } from "@/shared/components/ui/QueryErrorAlert/QueryErrorAlert";
import SelectField from "@/shared/components/ui/Select/SelectField";
import type { Role } from "@/shared/types";
import { getSystemRoleCode } from "@/shared/utils/role";
import { useTranslation } from "react-i18next";
import {
  STUDENT_FILTER_VALUE,
  type UserSearchCriterion,
} from "@/features/identity/utils/userList";

interface UserFiltersPanelProps {
  roles: Role[];
  canViewRoles: boolean;
  isRolesLoading: boolean;
  isRolesFetching: boolean;
  isRolesError: boolean;
  hasActiveRoles: boolean;
  canReset: boolean;
  searchTerm: string;
  searchBy: UserSearchCriterion;
  filterRole: number;
  sortDirection: "asc" | "desc";
  onSearchTermChange: (value: string) => void;
  onSearchByChange: (value: UserSearchCriterion) => void;
  onFilterRoleChange: (value: number) => void;
  onReset: () => void;
  onToggleSort: () => void;
  onRetryRoles: () => Promise<unknown>;
}

export default function UserFiltersPanel({
  roles,
  canViewRoles,
  isRolesLoading,
  isRolesFetching,
  isRolesError,
  hasActiveRoles,
  canReset,
  searchTerm,
  searchBy,
  filterRole,
  sortDirection,
  onSearchTermChange,
  onSearchByChange,
  onFilterRoleChange,
  onReset,
  onToggleSort,
  onRetryRoles,
}: UserFiltersPanelProps) {
  const { t } = useTranslation("common");

  return (
    <AdminFilterPanel
      title={t("userPage.filter.panelTitle")}
      description={t("userPage.filter.panelDescription")}
      resetLabel={t("userPage.resetFilters")}
      resetDisabled={!canReset}
      onReset={onReset}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <AdminSearchField<UserSearchCriterion>
            className="flex-1"
            label={t("userPage.filter.searchLabel")}
            criteriaLabel={t("common.searchByCriteria")}
            criteria={[
              {
                label: t("userPage.searchBy.fullName"),
                value: "fullName",
                placeholder: t("userPage.searchBy.fullNamePlaceholder"),
              },
              {
                label: t("userPage.searchBy.username"),
                value: "username",
                placeholder: t("userPage.searchBy.usernamePlaceholder"),
              },
              {
                label: t("userPage.searchBy.email"),
                value: "email",
                placeholder: t("userPage.searchBy.emailPlaceholder"),
              },
            ]}
            searchBy={searchBy}
            searchTerm={searchTerm}
            onSearchByChange={onSearchByChange}
            onSearchTermChange={onSearchTermChange}
          />
          <SelectField
            label={t("userPage.filter.roleLabel")}
            placeholder={t("userPage.filter.rolePlaceholder")}
            className="w-full md:max-w-[260px]"
            disabled={!canViewRoles || isRolesLoading || isRolesError}
            options={[
              { label: t("userPage.filter.all"), value: 0 },
              {
                label: t("userPage.roles.student"),
                value: STUDENT_FILTER_VALUE,
              },
              ...roles
                .filter(
                  (role) =>
                    !role.isDeleted && getSystemRoleCode(role) !== "STUDENT"
                )
                .map((role) => ({
                  label:
                    getSystemRoleCode(role) === "ADMIN"
                      ? t("userPage.roles.admin")
                      : getSystemRoleCode(role) === "TEACHER"
                        ? t("userPage.roles.teacher")
                        : role.roleName,
                  value: role.id,
                })),
            ]}
            value={filterRole}
            onSelect={(value) => onFilterRoleChange(Number(value))}
          />
          <AdminFilterField
            label={t("userPage.filter.sortLabel")}
            className="shrink-0"
          >
            <Button
              variant="outline"
              size="medium"
              className="!mt-0.5 !h-11 !shrink-0 !rounded-xl px-3"
              aria-label={t(
                sortDirection === "asc"
                  ? "userPage.sortDescending"
                  : "userPage.sortAscending"
              )}
              title={t(
                sortDirection === "asc"
                  ? "userPage.sortDescending"
                  : "userPage.sortAscending"
              )}
              onClick={onToggleSort}
            >
              <Icon name="arrowUpDown" size={18} />
              {t(
                sortDirection === "asc"
                  ? "userPage.sortNameAscending"
                  : "userPage.sortNameDescending"
              )}
            </Button>
          </AdminFilterField>
        </div>

        {canViewRoles &&
          (isRolesError || (!isRolesLoading && !hasActiveRoles)) && (
            <QueryErrorAlert
              type={isRolesError ? "error" : "warning"}
              message={t(
                isRolesError
                  ? "userPage.roleCatalogLoadFailed"
                  : "userPage.roleCatalogEmpty"
              )}
              onRetry={isRolesError ? onRetryRoles : undefined}
              isRetrying={isRolesFetching}
              retryLabel={t("userPage.retry")}
            />
          )}
      </div>
    </AdminFilterPanel>
  );
}
