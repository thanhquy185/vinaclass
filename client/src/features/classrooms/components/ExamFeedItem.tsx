import { Icon } from "@/shared/components/ui";
import type { Exam } from "@/shared/types";
import { useTranslation } from "react-i18next";

interface ExamFeedItemProps {
  data: Exam;
}

export default function ExamFeedItem({ data }: ExamFeedItemProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  return (
    <div className="flex items-center justify-between rounded-md border border-other-outlined-border bg-background-body-background p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text-secondary text-primary-contrast">
          <Icon name="clipboard" />
        </div>
        <div>
          <p className="text-body-2 text-text-primary">
            {t("courseElement.feed.newExamPosted")}
            <span className="font-bold">{data.examName}</span>
          </p>
          <p className="text-caption text-text-secondary">
            {new Date(data.createdAt || "").toLocaleDateString(locale)} •{" "}
            {data.durationMinutes} {t("courseElement.common.minuteUnit")}
          </p>
        </div>
      </div>
    </div>
  );
}
