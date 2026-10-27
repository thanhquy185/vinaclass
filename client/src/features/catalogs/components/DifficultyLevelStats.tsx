import { BookOpenCheck, Gauge, Layers3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Difficulty } from "@/shared/types";
import { SummaryStatCard } from "@/shared/components/ui";

interface DifficultyLevelStatsProps {
  difficulties: Difficulty[];
  isLoading: boolean;
}

export function DifficultyLevelStats({
  difficulties,
  isLoading,
}: DifficultyLevelStatsProps) {
  const { t, i18n } = useTranslation("common");
  const usedLevels = difficulties.filter(
    (difficulty) => (difficulty.questionsCount ?? 0) > 0,
  ).length;
  const questionCount = difficulties.reduce(
    (total, difficulty) => total + (difficulty.questionsCount ?? 0),
    0,
  );
  const stats = [
    {
      label: t("difficultyLevelPage.stats.total"),
      value: difficulties.length,
      accent: "bg-primary-main",
      icon: <Gauge size={19} />,
    },
    {
      label: t("difficultyLevelPage.stats.inUse"),
      value: usedLevels,
      accent: "bg-alert-info-content",
      icon: <Layers3 size={19} />,
    },
    {
      label: t("difficultyLevelPage.stats.questions"),
      value: questionCount,
      accent: "bg-alert-success-content",
      icon: <BookOpenCheck size={19} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat) => (
        <SummaryStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value.toLocaleString(i18n.language)}
          accentClassName={stat.accent}
          isLoading={isLoading}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
