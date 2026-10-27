import { Link } from "react-router-dom";
import { Icon } from "@/shared/components/ui";
import type { CourseGroup } from "@/shared/types";
import { useTranslation } from "react-i18next";

export interface ClassResultItemProps {
  data: CourseGroup;
  testId: number;
}

export const ClassResultItem = ({ data, testId }: ClassResultItemProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 border-t border-other-outlined-border px-4 py-2 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <Icon name="groupUser" size={18} className="shrink-0 text-text-secondary" />
        <span className="text-body-2-semibold text-text-secondary">
          {data.groupName}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="text-sm text-text-secondary">
          {t("courseElement.classResult.studentCount", {
            count: data.studentCount ?? 0,
          })}
        </span>
        <span className="rounded-full bg-success-background px-2.5 py-0.5 text-xs font-medium text-alert-success-content">
          {data.academicYear}
        </span>

        <Link
          to={`/tests/${testId}/result/${data.id}`}
          className="inline-flex h-8 items-center rounded-lg bg-primary-main px-2.5 text-xs font-normal text-primary-contrast transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2"
        >
          {t("testItem.actions.viewResults")}
        </Link>
      </div>
    </div>
  );
};
