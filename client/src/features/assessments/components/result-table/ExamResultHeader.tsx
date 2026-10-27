import { Button, Icon } from "@/shared/components/ui";
import Divider from "@/shared/components/ui/Divider/Divider";
import { StatusLabel } from "@/shared/components/ui/StatusLabel/StatusLabel";
import { getExamVariantWithStatus } from "@/features/assessments/utils/exam";
import type { StatusResult } from "@/shared/types";
import { useTranslation } from "react-i18next";

interface ExamResultHeaderProps {
  examName?: string;
  courseGroupName?: string;
  subjectName?: string;
  questionCount: number;
  status: StatusResult;
  onPreview: () => void;
  canPreview?: boolean;
}

export default function ExamResultHeader({
  examName,
  courseGroupName,
  subjectName,
  questionCount,
  status,
  onPreview,
  canPreview = true,
}: ExamResultHeaderProps) {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-2xl border border-other-outlined-border bg-background-paper shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-background text-primary-main">
            <Icon name="testsOverview" size={23} />
          </span>
          <div className="min-w-0">
            <p className="text-caption mb-1 font-semibold uppercase tracking-wide text-primary-main">
              {t("resultPage.overview.title")}
            </p>
            <h1 className="text-h5 mb-0 break-words font-semibold text-text-primary sm:text-2xl">
              {examName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
              {courseGroupName && (
                <span className="inline-flex items-center gap-2 rounded-full bg-background-body-background px-3 py-1.5">
                  <Icon name="groupUser" size={16} />
                  {courseGroupName}
                </span>
              )}
              {subjectName && (
                <span className="rounded-full bg-background-body-background px-3 py-1.5">
                  {subjectName}
                </span>
              )}
              <span className="rounded-full bg-background-body-background px-3 py-1.5">
                {t("resultPage.overview.questions", { count: questionCount })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <StatusLabel variant={getExamVariantWithStatus(status.status)}>
            {t(status.labelKey)}
          </StatusLabel>
          <Divider orientation="vertical" className="hidden h-8 sm:block" />
          <Button
            variant="outline"
            size="medium"
            onClick={onPreview}
            disabled={!canPreview}
            className="!rounded-xl"
          >
            <Icon name="play" /> {t("resultPage.overview.preview")}
          </Button>
        </div>
      </div>
    </section>
  );
}
