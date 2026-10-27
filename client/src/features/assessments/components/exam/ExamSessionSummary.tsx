import { Button, Icon } from "@/shared/components/ui";
import { AdminPanel } from "@/shared/components/admin";
import { Clock3, List, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExamSessionSummaryProps {
  examName?: string;
  studentName?: string;
  isPreview?: boolean;
  timeLeft: number;
  questionCount: number;
  onToggleFullscreen: () => void | Promise<void>;
}

export function ExamSessionSummary({
  examName,
  studentName,
  isPreview = false,
  timeLeft,
  questionCount,
  onToggleFullscreen,
}: ExamSessionSummaryProps) {
  const { t } = useTranslation("common");

  return (
    <AdminPanel className="mb-5 flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h5 break-words font-semibold text-text-primary">
            {examName}
          </h1>
          {isPreview && (
            <span className="rounded-full bg-custom-background-primary-background px-2.5 py-1 text-xs font-semibold text-primary-main">
              {t("assessmentPreview.badge")}
            </span>
          )}
        </div>
        <div className="text-body-2 mt-2 flex items-center gap-2 text-text-secondary">
          <Icon name="user" size={16} />
          <span className="truncate">{studentName}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex items-center gap-2 rounded-lg border border-other-outlined-border bg-background-body-background px-3 py-2">
          <Clock3 aria-hidden="true" size={17} className="text-primary-main" />
          <span className="text-body-2">
            <span className="mr-1.5 font-medium text-text-secondary">
              {t("examTaking.timeLeft")}
            </span>
            <span className="font-semibold tabular-nums text-text-primary">
              {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-other-outlined-border bg-background-body-background px-3 py-2 text-text-secondary">
          <List aria-hidden="true" size={17} />
          <span className="text-body-2">
            {t("examTaking.questionCount", { count: questionCount })}
          </span>
        </div>

        <Button
          aria-label={t("examTaking.fullscreenToggle")}
          onClick={onToggleFullscreen}
          size="small"
          title={t("examTaking.fullscreenToggle")}
          className="!h-10 !w-10 !rounded-lg !p-0"
        >
          <Maximize2 size={18} />
        </Button>
      </div>
    </AdminPanel>
  );
}
