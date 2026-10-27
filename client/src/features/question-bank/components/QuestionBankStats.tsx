import { Archive, BookOpenCheck, FileQuestion, Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SummaryStatCard } from "@/shared/components/ui";
import type { QuestionBankPageData } from "@/features/question-bank/types/questionBank";

interface QuestionBankStatsProps {
  stats: QuestionBankPageData["stats"];
  isLoading: boolean;
}

export function QuestionBankStats({
  stats,
  isLoading,
}: QuestionBankStatsProps) {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const items = [
    {
      label: t("questionPage.stats.total"),
      value: stats.total,
      accent: "bg-primary-main",
      icon: <BookOpenCheck size={19} />,
    },
    {
      label: t("questionPage.stats.public"),
      value: stats.public,
      accent: "bg-alert-info-content",
      icon: <Globe2 size={19} />,
    },
    {
      label: t("questionPage.stats.private"),
      value: stats.private,
      accent: "bg-alert-success-content",
      icon: <FileQuestion size={19} />,
    },
    {
      label: t("questionPage.stats.archive"),
      value: stats.archive,
      accent: "bg-alert-warning-content",
      icon: <Archive size={19} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => (
        <SummaryStatCard
          key={item.label}
          label={item.label}
          value={item.value.toLocaleString(locale)}
          accentClassName={item.accent}
          isLoading={isLoading}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
