import { Alert } from "antd";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CourseGroupInviteCodePanelProps {
  inviteCode?: string;
}

export default function CourseGroupInviteCodePanel({
  inviteCode,
}: CourseGroupInviteCodePanelProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-3">
      <section className="min-w-0">
        <div>
          <h2 className="text-body-1 font-semibold text-text-primary">
            {t("courseGroupStudent.inviteDialog.codeLabel")}
          </h2>
          <p className="text-caption mt-1 text-text-secondary">
            {t("courseGroupStudent.inviteDialog.codeDescription")}
          </p>
        </div>

        {inviteCode ? (
          <div className="bg-custom-background-primary-background mt-4 flex min-h-20 items-center justify-center overflow-hidden rounded-xl px-4 py-5">
            <code className="max-w-full overflow-x-auto whitespace-nowrap font-mono text-2xl font-bold tracking-[0.22em] text-text-primary sm:text-3xl">
              {inviteCode}
            </code>
          </div>
        ) : (
          <Alert
            className="mt-4"
            type="warning"
            showIcon
            message={t("courseGroupStudent.form.inviteCodeUnavailable")}
          />
        )}
      </section>

      <p className="bg-custom-background-warning-background text-caption flex items-start gap-2 rounded-lg px-3 py-2.5 text-warning-main">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{t("courseGroupStudent.inviteDialog.regenerateNote")}</span>
      </p>
    </div>
  );
}
