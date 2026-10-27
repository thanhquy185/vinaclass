import { Tag } from "antd";
import { BookOpenCheck } from "lucide-react";

interface QuestionDraftSummaryProps {
  title: string;
  classification: string;
  classificationPlaceholder: string;
  answerCountLabel: string;
  statusLabel: string;
  isPublic: boolean;
}

export function QuestionDraftSummary({
  title,
  classification,
  classificationPlaceholder,
  answerCountLabel,
  statusLabel,
  isPublic,
}: QuestionDraftSummaryProps) {
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-other-divider bg-background-paper p-4 shadow-sm sm:p-5">
      <span className="bg-custom-background-primary-background flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-primary-main">
        <BookOpenCheck size={23} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-text-primary sm:text-lg">
          {title}
        </h3>
        <p className="mt-1 truncate text-sm text-text-secondary">
          {classification || classificationPlaceholder}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Tag color={isPublic ? "green" : "default"}>{statusLabel}</Tag>
          <span className="rounded-full bg-action-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
            {answerCountLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
