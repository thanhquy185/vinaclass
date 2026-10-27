import {
  BadgePercent,
  CalendarDays,
  CopyX,
  Eye,
  Info,
  Printer,
  RotateCcw,
  ShieldAlert,
  Shuffle,
} from "lucide-react";
import { Icon } from "@/shared/components/ui";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import { useTranslation } from "react-i18next";
import type { Exam } from "@/shared/types";

interface TestInfoSummaryProps {
  data?: Partial<Exam> | null;
}

export const TestInfoSummary = ({ data }: TestInfoSummaryProps) => {
  const storedTestData = useExamDraftStore((state) => state.testData);
  const testData = data ?? storedTestData;
  const { t } = useTranslation();
  const examConfiguration = testData?.examConfiguration;
  const hasSecuritySettings = Boolean(
    examConfiguration?.hasMonitoring ||
    examConfiguration?.isLimitSwitchTab ||
    examConfiguration?.allowCopy === false ||
    examConfiguration?.allowPrint === false,
  );

  return (
    <div className="flex justify-center">
      <div className="flex w-full flex-col gap-6 px-5 py-3 sm:px-8">
        {/* Keep exam metadata separate from its question list. */}
        <div className="flex min-w-0 flex-col gap-2 px-3 py-3 sm:px-8">
          {/* title */}
          <div className="mb-5 flex justify-center text-center">
            <span className="text-h6 break-words text-text-primary">
              {testData?.examName}
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-6">
            {/* infor */}
            <div className="flex min-w-0 flex-col gap-2.5">
              <span className="text-caption-semibold uppercase tracking-wider text-text-primary">
                {t("addQuestionTestPage.summary.basicInfo.title")}
              </span>
              <div className="flex flex-col gap-2 text-text-secondary">
                <div className="flex min-w-0 items-start gap-2">
                  <Icon
                    name="documentDuplicate"
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-body-2 min-w-0 leading-6">
                    {t("addQuestionTestPage.summary.basicInfo.assignTo")}{" "}
                    <strong className="text-body-2-semibold">
                      {testData?.subject?.subjectName}
                    </strong>
                  </span>
                </div>
                <div className="flex min-w-0 items-start gap-2">
                  <CalendarDays
                    size={20}
                    className="mt-0.5 shrink-0 text-text-tertiary"
                  />
                  <span className="text-body-2 flex min-w-0 flex-col leading-6">
                    <span>
                      {t("addQuestionTestPage.summary.basicInfo.startsAt", {
                        time: formatFullDateTimeVN(testData?.startTime),
                      })}
                    </span>
                    <span>
                      {t("addQuestionTestPage.summary.basicInfo.endsAt", {
                        time: formatFullDateTimeVN(testData?.endTime),
                      })}
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 items-start gap-2">
                  <Icon name="clock" size={20} className="mt-0.5 shrink-0" />
                  <span className="text-body-2 min-w-0 leading-6">
                    {t("addQuestionTestPage.summary.basicInfo.workTime", {
                      minutes: testData?.durationMinutes,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Security settings. */}
            <div className="flex min-w-0 flex-col gap-2.5 lg:border-l lg:border-other-outlined-border lg:pl-6">
              <span className="text-caption-semibold uppercase tracking-wider text-text-primary">
                {t("addQuestionTestPage.summary.security.title")}
              </span>
              <ul className="flex flex-col gap-2">
                {testData?.examConfiguration?.hasMonitoring && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Eye size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.security.monitoringOn")}
                  </li>
                )}

                {testData?.examConfiguration?.isLimitSwitchTab && (
                  <li className="text-body-2 flex items-center gap-2 text-alert-error-content">
                    <ShieldAlert size={18} className="mt-0.5" />
                    {t("addQuestionTestPage.summary.security.switchLimit")}{" "}
                    <span className="font-semibold">
                      {t("addQuestionTestPage.summary.security.switchTimes", {
                        count: testData?.examConfiguration?.tabSwitchLimit,
                      })}
                    </span>
                  </li>
                )}

                {testData?.examConfiguration?.allowCopy === false && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <CopyX size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.security.copyBlocked")}
                  </li>
                )}

                {testData?.examConfiguration?.allowPrint === false && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Printer size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.security.printBlocked")}
                  </li>
                )}
                {examConfiguration && !hasSecuritySettings && (
                  <li className="text-body-2 text-text-secondary">
                    {t("addQuestionTestPage.summary.security.noneActive")}
                  </li>
                )}
              </ul>
            </div>

            {/* Exam rules. */}
            <div className="flex min-w-0 flex-col gap-2.5 lg:border-l lg:border-other-outlined-border lg:pl-6">
              <span className="text-caption-semibold uppercase tracking-wider text-text-primary">
                {t("addQuestionTestPage.summary.rules.title")}
              </span>
              <ul className="flex flex-col gap-2">
                {(testData?.examConfiguration?.shuffleQuestions ||
                  testData?.examConfiguration?.shuffleAnswers) && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Shuffle size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.rules.shuffle")}
                  </li>
                )}

                {testData?.examConfiguration?.isEnableResume && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <RotateCcw
                      size={18}
                      className="text-text-tertiary mt-0.5"
                    />
                    {t("addQuestionTestPage.summary.rules.resume")}
                  </li>
                )}
                {testData?.examConfiguration?.showDetailResults && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Info size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.rules.showDetail")}
                  </li>
                )}

                {testData?.examConfiguration?.showScore && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <BadgePercent
                      size={18}
                      className="text-text-tertiary mt-0.5"
                    />
                    {t("addQuestionTestPage.summary.rules.showScore")}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
