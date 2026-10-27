import { Card, Input, InputNumber, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { ExamConfiguration } from "@/shared/types";
import ExamConfigurationSwitch from "@/features/assessments/components/exam-settings/ExamConfigurationSwitch";

interface ExamSecuritySettingsProps {
  data?: ExamConfiguration;
  disabled: boolean;
  onChange: (updates: Partial<ExamConfiguration>) => void;
}

export default function ExamSecuritySettings({
  data,
  disabled,
  onChange,
}: ExamSecuritySettingsProps) {
  const { t } = useTranslation();

  const handleMonitoringChange = (enabled: boolean) => {
    onChange(
      enabled
        ? {
            hasMonitoring: true,
            allowCopy: false,
            isLimitSwitchTab: true,
            tabSwitchLimit: 3,
          }
        : {
            hasMonitoring: false,
            isLimitSwitchTab: false,
            allowCopy: true,
            allowPrint: true,
          },
    );
  };

  const handleQuestionLimitChange = (enabled: boolean) => {
    onChange(
      enabled
        ? { limitQuestionsPerPage: 1, allowBackLastQuestion: 0 }
        : { limitQuestionsPerPage: -1, allowBackLastQuestion: 1 },
    );
  };

  return (
    <Card size="small" title={t("testConfigSidebar.sections.antiCheat")}>
      <Space direction="vertical" className="w-full" size="middle">
        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.monitoring")}
          checked={!!data?.hasMonitoring}
          disabled={disabled}
          onChange={handleMonitoringChange}
        />

        {data?.hasMonitoring && (
          <div className="border-primary-main/20 flex flex-col gap-4 border-l-2 pl-4">
            <ExamConfigurationSwitch
              label={t("testConfigSidebar.toggles.blockCopy")}
              checked={data.allowCopy === false}
              disabled={disabled}
              onChange={(checked) => onChange({ allowCopy: !checked })}
            />
            <ExamConfigurationSwitch
              label={t("testConfigSidebar.toggles.blockPrint")}
              checked={data.allowPrint === false}
              disabled={disabled}
              onChange={(checked) => onChange({ allowPrint: !checked })}
            />
            <ExamConfigurationSwitch
              label={t("testConfigSidebar.toggles.limitSwitchTab")}
              checked={!!data.isLimitSwitchTab}
              disabled={disabled}
              onChange={(checked) => onChange({ isLimitSwitchTab: checked })}
            />
            {data.isLimitSwitchTab && (
              <label className="flex flex-col gap-1 text-sm">
                <span>{t("testConfigSidebar.labels.maxSwitches")}</span>
                <InputNumber
                  min={0}
                  precision={0}
                  className="w-full"
                  value={data.tabSwitchLimit ?? 3}
                  placeholder={t("testConfigSidebar.placeholders.maxSwitches")}
                  disabled={disabled}
                  onChange={(value) => onChange({ tabSwitchLimit: value ?? 0 })}
                />
              </label>
            )}
          </div>
        )}

        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.limitQuestionsPerPage")}
          checked={data?.limitQuestionsPerPage !== -1}
          disabled={disabled}
          onChange={handleQuestionLimitChange}
        />
        {data?.limitQuestionsPerPage !== -1 && (
          <div className="border-primary-main/20 flex flex-col gap-2 border-l-2 pl-4">
            <label className="flex flex-col gap-1 text-sm">
              <span>{t("testConfigSidebar.labels.questionsPerPage")}</span>
              <InputNumber
                min={1}
                precision={0}
                className="w-full"
                value={Math.max(1, data?.limitQuestionsPerPage ?? 1)}
                disabled={disabled}
                onChange={(value) =>
                  onChange({ limitQuestionsPerPage: Math.max(1, value ?? 1) })
                }
              />
            </label>
            <Typography.Text type="secondary" className="text-xs">
              {t("testConfigSidebar.hints.questionLimit")}
            </Typography.Text>
          </div>
        )}

        <ExamConfigurationSwitch
          label={t("testConfigSidebar.toggles.allowBack")}
          checked={Number(data?.allowBackLastQuestion) === 1}
          disabled={disabled}
          onChange={(checked) =>
            onChange({ allowBackLastQuestion: checked ? 1 : 0 })
          }
        />

        <label className="flex flex-col gap-1 text-sm">
          <span>{t("testConfigSidebar.labels.warningMessage")}</span>
          <Input.TextArea
            rows={3}
            value={data?.messageOnWarning ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({ messageOnWarning: event.target.value })
            }
          />
        </label>
      </Space>
    </Card>
  );
}
