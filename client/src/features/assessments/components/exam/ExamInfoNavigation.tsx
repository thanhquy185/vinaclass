import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Circle,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AdminPanel } from "@/shared/components/admin";
import type { Exam, Question } from "@/shared/types";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import { formatMinutesToTime } from "@/features/assessments/utils/exam";

interface ExamInfoNavigationProps {
  exam?: Partial<Exam> | null;
  questions: Question[];
  answers: Record<number, number | null>;
  currentPage: number;
  limitPerPage: number;
  currentQuestionIndex: number;
  canNavigateBack: boolean;
  onNavigateToQuestion: (index: number) => void;
}

export function ExamInfoNavigation({
  exam,
  questions,
  answers,
  currentPage,
  limitPerPage,
  currentQuestionIndex,
  canNavigateBack,
  onNavigateToQuestion,
}: ExamInfoNavigationProps) {
  const { t } = useTranslation("common");
  const answeredCount = questions.reduce(
    (count, question) => count + (answers[question.id] == null ? 0 : 1),
    0
  );

  return (
    <aside className="order-first min-w-0 xl:order-last">
      <div className="space-y-4 xl:sticky xl:top-4">
        <AdminPanel className="p-4 sm:p-5">
          <h2 className="text-body-1 font-semibold text-text-primary">
            {t("examTaking.examInformation")}
          </h2>
          <p className="mt-2 break-words text-sm font-medium text-text-secondary">
            {exam?.examName || t("examTaking.untitledExam")}
          </p>
          <div className="mt-4 space-y-3 text-sm text-text-secondary">
            <InfoRow
              icon={<BookOpen size={17} aria-hidden="true" />}
              label={t("examTaking.subject")}
              value={exam?.subject?.subjectName || "—"}
            />
            <InfoRow
              icon={<CalendarClock size={17} aria-hidden="true" />}
              label={t("examTaking.schedule")}
              value={
                <span className="block leading-5">
                  {formatFullDateTimeVN(exam?.startTime)}
                  <span className="block text-xs text-text-disabled">
                    {formatFullDateTimeVN(exam?.endTime)}
                  </span>
                </span>
              }
            />
            <InfoRow
              icon={<Timer size={17} aria-hidden="true" />}
              label={t("examTaking.duration")}
              value={formatMinutesToTime(exam?.durationMinutes ?? 0)}
            />
          </div>
        </AdminPanel>

        <AdminPanel className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-body-1 font-semibold text-text-primary">
                {t("examTaking.questionNavigation")}
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                {t("examTaking.answeredCount", {
                  answered: answeredCount,
                  total: questions.length,
                })}
              </p>
            </div>
            <span className="bg-custom-background-primary-background shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-main">
              {answeredCount}/{questions.length}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 xl:grid-cols-5">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id] != null;
              const questionPage =
                limitPerPage === -1
                  ? currentPage
                  : Math.floor(index / limitPerPage);
              const isLocked =
                !canNavigateBack &&
                (questionPage < currentPage || questionPage > currentPage + 1);
              const isActive = index === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  aria-label={t("examTaking.goToQuestion", {
                    number: index + 1,
                  })}
                  aria-current={isActive ? "step" : undefined}
                  disabled={isLocked}
                  onClick={() => onNavigateToQuestion(index)}
                  className={`relative flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-primary-main bg-primary-main text-primary-contrast"
                      : isAnswered
                        ? "border-primary-main/30 bg-custom-background-primary-background text-primary-main hover:border-primary-main"
                        : "border-other-outlined-border bg-background-paper text-text-secondary hover:border-primary-main hover:text-primary-main"
                  } ${isLocked ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {index + 1}
                  <span className="sr-only">
                    {isAnswered
                      ? t("examTaking.answered")
                      : t("examTaking.notAnswered")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-other-divider pt-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2
                size={14}
                className="text-primary-main"
                aria-hidden="true"
              />
              {t("examTaking.answered")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Circle
                size={14}
                className="text-text-disabled"
                aria-hidden="true"
              />
              {t("examTaking.notAnswered")}
            </span>
          </div>
        </AdminPanel>
      </div>
    </aside>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-primary-main">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-text-disabled">{label}</p>
        <div className="mt-0.5 break-words font-medium text-text-secondary">
          {value}
        </div>
      </div>
    </div>
  );
}
