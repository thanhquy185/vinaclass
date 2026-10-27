import { Card, Space } from "antd";
import { useTranslation } from "react-i18next";
import type { ExamConfiguration } from "@/shared/types";
import ExamConfigurationSwitch from "@/features/assessments/components/exam-settings/ExamConfigurationSwitch";

interface ExamResultSettingsProps {
  data?: ExamConfiguration;
  disabled: boolean;
  onChange: (updates: Partial<ExamConfiguration>) => void;
}

export default function ExamResultSettings({
  data,
  disabled,
  onChange,
}: ExamResultSettingsProps) {
  const { t } = useTranslation();

  return (
    <Card size="small" title={t("testConfigSidebar.sections.afterExam")}>
      <Space direction="vertical" className="w-full" size="middle">
        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.showScore")}
          checked={!!data?.showScore}
          disabled={disabled}
          onChange={(checked) => onChange({ showScore: checked })}
        />
        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.showDetail")}
          checked={!!data?.showDetailResults}
          disabled={disabled}
          onChange={(checked) => onChange({ showDetailResults: checked })}
        />
        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.enableResume")}
          checked={!!data?.isEnableResume}
          disabled={disabled}
          onChange={(checked) => onChange({ isEnableResume: checked })}
        />
      </Space>
    </Card>
  );
}
