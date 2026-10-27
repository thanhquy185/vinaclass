import { useTranslation } from "react-i18next";
import type { ExamConfiguration } from "@/shared/types";
import { AdminPanel } from "@/shared/components/admin";
import ExamShuffleSettings from "@/features/assessments/components/exam-settings/ExamShuffleSettings";
import ExamSecuritySettings from "@/features/assessments/components/exam-settings/ExamSecuritySettings";
import ExamResultSettings from "@/features/assessments/components/exam-settings/ExamResultSettings";

interface ExamSettingsSidebarProps {
  data?: ExamConfiguration;
  onChange?: (newData: Partial<ExamConfiguration>) => void;
  readOnly?: boolean;
}

export default function ExamSettingsSidebar({
  data,
  onChange,
  readOnly = false,
}: ExamSettingsSidebarProps) {
  const { t } = useTranslation();
  const disabled = readOnly || !data;

  const updateConfig = (updates: Partial<ExamConfiguration>) => {
    if (disabled) return;
    onChange?.(updates);
  };

  return (
    <AdminPanel as="aside" className="min-w-0 p-4 sm:p-5 xl:sticky xl:top-4">
      <div className="mb-4 border-b border-other-outlined-border pb-4">
        <h2 className="text-sm font-semibold text-text-primary">
          {t("testConfigSidebar.title")}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t("testConfigSidebar.description")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <ExamShuffleSettings
          data={data}
          disabled={disabled}
          onChange={updateConfig}
        />
        <ExamSecuritySettings
          data={data}
          disabled={disabled}
          onChange={updateConfig}
        />
        <ExamResultSettings
          data={data}
          disabled={disabled}
          onChange={updateConfig}
        />
      </div>
    </AdminPanel>
  );
}
