import { Card, Space } from "antd";
import { useTranslation } from "react-i18next";
import type { ExamConfiguration } from "@/shared/types";
import ExamConfigurationSwitch from "@/features/assessments/components/exam-settings/ExamConfigurationSwitch";

interface ExamShuffleSettingsProps {
  data?: ExamConfiguration;
  disabled: boolean;
  onChange: (updates: Partial<ExamConfiguration>) => void;
}

export default function ExamShuffleSettings({
  data,
  disabled,
  onChange,
}: ExamShuffleSettingsProps) {
  const { t } = useTranslation();

  return (
    <Card size="small" title={t("testConfigSidebar.sections.shuffle")}>
      <Space direction="vertical" className="w-full" size="middle">
        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.shuffleQuestions")}
          checked={!!data?.shuffleQuestions}
          disabled={disabled}
          onChange={(checked) => onChange({ shuffleQuestions: checked })}
        />
        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.shuffleAnswers")}
          checked={!!data?.shuffleAnswers}
          disabled={disabled}
          onChange={(checked) => onChange({ shuffleAnswers: checked })}
        />
      </Space>
    </Card>
  );
}
