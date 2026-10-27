import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/shared/components/ui/Logo/Logo";
import { Button } from "@/shared/components/ui";
import { AdminPanel } from "@/shared/components/admin";
import { useExamSessionStore } from "@/features/assessments/stores/useExamSessionStore";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";
import { formatMinutesToTime } from "@/features/assessments/utils/exam";
import type { ExamAttempt } from "@/shared/types";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { useExamActions } from "@/features/assessments/hooks/useExamActions";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import { useTranslation } from "react-i18next";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import { useExamPreviewController } from "@/features/assessments/hooks/useExamPreviewController";
import { useToastStore } from "@/shared/stores/useToastStore";

export const ExamInstruction = () => {
  const { t } = useTranslation();
  const { initExam, mode } = useExamSessionStore();
  const navigate = useNavigate();
  const { startExam } = useExamActions();
  const { handleExitPreview } = useExamPreviewController();

  const { testData } = useExamDraftStore();
  const { user } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const { startLoading, stopLoading } = useLoadingStore();

  const handleStart = async () => {
    // Initialize a local attempt for teacher and admin previews.
    if (mode === "PREVIEW") {
      if (!testData?.questions?.length) {
        showToast(t("examInstruction.noQuestionsToPreview"), "warning");
        return;
      }

      const previewExam: ExamAttempt = {
        id: -1, // Use a local-only ID for the preview attempt.
        examId: testData?.id || 0,
        studentId: user?.id || 0,
        status: "IN_PROGRESS",
        examAttemptAnswers: [],
        startTime: new Date().toISOString(),
        totalScore: 0,
        correctAnswerCount: 0,
      };

      initExam(previewExam, "PREVIEW");
      navigate("doing");
      return;
    }

    startLoading();

    // Start a persisted attempt for the student.
    try {
      await startExam({
        studentId: user?.id || 0,
        examId: testData?.id || 0,
      });

      // The mutation synchronizes the attempt store before navigation.
      navigate("doing");
    } catch (error) {
      console.error("Failed to start exam:", error);
    } finally {
      stopLoading();
    }
  };

  const examOptions = [
    testData?.examConfiguration?.shuffleQuestions &&
      t("examInstruction.shuffleQuestions"),
    testData?.examConfiguration?.shuffleAnswers &&
      t("examInstruction.shuffleAnswers"),
    testData?.examConfiguration?.hasMonitoring &&
      t("examInstruction.monitoring"),
  ].filter((option): option is string => Boolean(option));

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-background-body-background text-text-secondary">
      <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Logo className="font-bold text-text-secondary" />
        {mode === "PREVIEW" && (
          <Button variant="outline" size="small" onClick={handleExitPreview}>
            <ArrowLeft size={16} aria-hidden="true" />
            {t("assessmentPreview.exit")}
          </Button>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-4 pb-28 sm:px-6 lg:px-8">
        <AdminPanel className="min-w-0 overflow-hidden">
          <header className="flex items-start gap-3 border-b border-other-divider px-4 py-5 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-custom-background-primary-background text-primary-main">
              <ClipboardCheck size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption font-medium uppercase tracking-wide text-primary-main">
                  {t("examInstruction.title")}
                </span>
                {mode === "PREVIEW" && (
                  <span className="rounded-full bg-custom-background-primary-background px-2.5 py-1 text-xs font-semibold text-primary-main">
                    {t("assessmentPreview.badge")}
                  </span>
                )}
              </div>
              <h1 className="text-h5 mt-1 break-words font-semibold text-text-primary sm:text-h4">
                {testData?.examName}
              </h1>
              <p className="text-body-2 mt-1 max-w-3xl text-text-secondary sm:text-body-1">
                {t("examInstruction.welcome", { testName: testData?.examName })}
              </p>
            </div>
          </header>

          <div className="grid min-w-0 gap-4 p-4 sm:gap-5 sm:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <section className="min-w-0">
              <h2 className="text-body-1 font-semibold text-text-primary">
                {t("examInstruction.overviewTitle")}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SummaryCard
                  icon={<BookOpen size={18} />}
                  label={t("testDetailPage.overview.assignTo")}
                  value={
                    testData?.subject?.subjectName ??
                    t("testItem.unknownSubject")
                  }
                />
                <SummaryCard
                  icon={<CalendarClock size={18} />}
                  label={t("testDetailPage.overview.schedule")}
                  value={
                    <span className="block">
                      <span className="block">
                        {formatFullDateTimeVN(testData?.startTime)}
                      </span>
                      <span className="mt-1 block text-text-secondary">
                        {formatFullDateTimeVN(testData?.endTime)}
                      </span>
                    </span>
                  }
                />
                <SummaryCard
                  icon={<Timer size={18} />}
                  label={t("examInstruction.timeLimit")}
                  value={formatMinutesToTime(testData?.durationMinutes || 0)}
                />
                <SummaryCard
                  icon={<ClipboardList size={18} />}
                  label={t("examInstruction.questionCount")}
                  value={String(testData?.questions?.length ?? 0)}
                />
              </div>

              <div className="mt-5 rounded-xl border border-other-outlined-border bg-background-body-background p-4 sm:mt-6 sm:p-5">
                <h3 className="text-body-2 font-semibold text-text-primary">
                  {t("examInstruction.rulesTitle")}
                </h3>
                <ul className="mt-3 divide-y divide-other-divider">
                  {testData?.examConfiguration?.limitQuestionsPerPage &&
                    testData.examConfiguration.limitQuestionsPerPage > 0 && (
                      <ItemSetting
                        textLeft={t("examInstruction.pagination")}
                        textRight={`${testData.examConfiguration.limitQuestionsPerPage} ${t("examInstruction.questionsPerPage")}`}
                      />
                    )}
                  {testData?.examConfiguration?.allowBackLastQuestion ===
                    false ||
                  testData?.examConfiguration?.allowBackLastQuestion === 0 ? (
                    <ItemSetting
                      warning
                      textLeft={t("examInstruction.noBackWarning")}
                    />
                  ) : null}
                  {examOptions.map((option) => (
                    <ItemSetting key={option} textLeft={option} />
                  ))}
                  {testData?.examConfiguration?.isLimitSwitchTab && (
                    <ItemSetting
                      textLeft={t("examInstruction.limitSwitchTab", {
                        count: testData.examConfiguration.tabSwitchLimit,
                      })}
                    />
                  )}
                  {examOptions.length === 0 &&
                    !testData?.examConfiguration?.isLimitSwitchTab &&
                    !testData?.examConfiguration?.limitQuestionsPerPage && (
                      <li className="py-3 text-sm text-text-disabled">
                        {t("examInstruction.noAdditionalRules")}
                      </li>
                    )}
                </ul>
              </div>
            </section>

            <section className="flex min-w-0 flex-col rounded-xl border border-other-outlined-border bg-background-body-background p-4 sm:p-5">
              <h2 className="text-body-1 font-semibold text-text-primary">
                {t("examInstruction.beforeStartTitle")}
              </h2>
              <p className="text-body-2 mt-2 text-text-secondary">
                {t("examInstruction.beforeStartDescription")}
              </p>
              <ul className="text-body-2 mt-4 space-y-3 text-text-secondary">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-main" />
                  {t("examInstruction.beforeStartNetwork")}
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-main" />
                  {t("examInstruction.beforeStartTime")}
                </li>
              </ul>
              {mode === "PREVIEW" && (
                <div className="mt-auto pt-6">
                  <div className="rounded-lg border border-primary-main/20 bg-background-paper p-3 text-sm text-text-secondary">
                    {t("assessmentPreview.description")}
                  </div>
                </div>
              )}
            </section>
          </div>
        </AdminPanel>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-other-outlined-border bg-background-paper/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3">
          <span className="text-caption hidden text-text-disabled sm:inline">
            {t("examInstruction.footerHint")}
          </span>
          <Button
            color="primary"
            variant="contained"
            size="large"
            className="ml-auto min-w-40"
            onClick={handleStart}
          >
            {t("examInstruction.start")}
          </Button>
        </div>
      </footer>
    </div>
  );
};

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-background-body-background p-3">
      <div className="flex items-center gap-2 text-text-disabled">
        {icon}
        <span className="text-caption truncate">{label}</span>
      </div>
      <div className="text-body-1 mt-2 font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}

function ItemSetting({
  textLeft,
  textRight,
  warning = false,
}: {
  textLeft: string;
  textRight?: string;
  warning?: boolean;
}) {
  return (
    <li
      className={`flex flex-wrap items-start justify-between gap-3 py-3 text-sm ${warning ? "text-alert-error-content" : "text-text-secondary"}`}
    >
      <span className="flex min-w-0 items-start gap-2">
        <span
          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${warning ? "bg-alert-error-content" : "bg-primary-main"}`}
        />
        <span>{textLeft}</span>
      </span>
      {textRight && (
        <span className="shrink-0 font-medium text-text-primary">
          {textRight}
        </span>
      )}
    </li>
  );
}
