import {
  CalendarDays,
  Clock3,
  FileQuestion,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { ClassResultItem } from "@/features/assessments/components/ClassResultItem";
import { useExamListItemController } from "@/features/assessments/hooks/useExamListItemController";
import { StatusLabel } from "@/shared/components/ui/StatusLabel/StatusLabel";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import type { Exam } from "@/shared/types";

interface ExamListItemProps {
  data: Exam;
  actions: string[];
}

export default function ExamListItem({ data, actions }: ExamListItemProps) {
  const { t } = useTranslation("common");
  const {
    statusLabel,
    statusVariant,
    handleJoinTest,
    handleEditTest,
    handleOpenDetails,
    handleDelete,
  } = useExamListItemController({ exam: data });
  const courseGroups = data.courseGroups ?? [];

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-other-outlined-border bg-background-paper transition-shadow hover:shadow-sm">
      <header className="flex flex-col justify-between gap-3 border-b border-other-outlined-border bg-background-paper px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <StatusLabel variant={statusVariant}>{statusLabel}</StatusLabel>
          <span className="text-caption text-text-disabled">
            {t("testItem.examCode", { id: data.id })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:justify-end">
          {actions.includes("view") && (
            <Button
              variant="text"
              color="primary"
              size="small"
              className="!h-9 !rounded-lg"
              onClick={handleJoinTest}
            >
              {t("testItem.actions.viewDetail")}
            </Button>
          )}
          {actions.includes("update") && (
            <Button
              variant="text"
              color="primary"
              size="small"
              className="!h-9 !rounded-lg"
              onClick={handleEditTest}
            >
              {t("testItem.actions.edit")}
            </Button>
          )}
          {actions.includes("delete") && (
            <Button
              variant="text"
              color="error"
              size="small"
              className="!h-9 !rounded-lg"
              onClick={handleDelete}
            >
              {t("testItem.actions.delete")}
            </Button>
          )}
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-4 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {actions.includes("view") ? (
            <button
              type="button"
              className="text-body-1-semibold min-w-0 cursor-pointer text-left text-text-primary hover:text-primary-main hover:underline"
              onClick={handleOpenDetails}
            >
              {data.examName}
            </button>
          ) : (
            <h3 className="text-body-1-semibold min-w-0 text-text-primary">
              {data.examName}
            </h3>
          )}
        </div>

        <div className="text-body-2 grid min-w-0 grid-cols-1 gap-x-6 gap-y-3 text-text-secondary sm:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.8fr)_minmax(0,0.65fr)_minmax(0,1.05fr)]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-text-disabled" aria-hidden="true">
              <FileQuestion size={17} />
            </span>
            <span className="truncate">
              {data.subject?.subjectName ?? t("testItem.unknownSubject")}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:col-span-2 xl:col-span-1">
            <span className="shrink-0 text-text-disabled" aria-hidden="true">
              <CalendarDays size={17} />
            </span>
            <span className="min-w-0 whitespace-nowrap">
              {t("testItem.schedule", {
                start: formatFullDateTimeVN(data.startTime),
                end: formatFullDateTimeVN(data.endTime),
              })}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-text-disabled" aria-hidden="true">
              <Clock3 size={17} />
            </span>
            <span>
              {t("testItem.durationMinutes", {
                count: Number(data.durationMinutes ?? 0),
              })}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-text-disabled" aria-hidden="true">
              <UsersRound size={17} />
            </span>
            <span>
              {t("testItem.classCount", {
                count: (data.courseGroups ?? []).length,
              })}
            </span>
            <span className="text-text-disabled">·</span>
            <span className="truncate">
              {t("testItem.questionCount", {
                count: (data.questions ?? []).length,
              })}
            </span>
          </div>
        </div>
      </div>

      {actions.includes("view") && (
        <div className="border-t border-other-outlined-border bg-background-paper">
          {courseGroups.map((courseGroup) => (
            <ClassResultItem
              key={courseGroup.id}
              data={courseGroup}
              testId={data.id}
            />
          ))}
          {courseGroups.length === 0 && (
            <p className="px-5 py-4 text-sm text-text-disabled">
              {t("testItem.noClasses")}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
