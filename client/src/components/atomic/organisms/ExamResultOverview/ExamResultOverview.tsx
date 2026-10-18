import { useState, useMemo } from "react";
import { Printer } from "lucide-react";
import { Button, Icon } from "@/components/atomic/atoms";
import QuestionCard from "@/components/atomic/molecules/QuestionCard/QuestionCard";
import {
  calculateDuration,
  getTextProgress,
  getTextProgressColor,
} from "@/utils";
import Tabs from "../../molecules/Tabs/Tabs";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { useExamStore } from "@/stores/useExamStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useTranslation } from "react-i18next";

interface ExamResultContentProps {
  onCancel?: () => void;
}

export default function ExamResultContent({
  onCancel,
}: ExamResultContentProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  // 1. Chỉ lấy examResult - Đây là "Source of Truth" duy nhất
  const { examResult, mode, answers } = useExamStore();
  const { testData } = useDeThiStore();

  const isPreview = mode === "PREVIEW";
  const config = testData?.examConfiguration;

  const [showDetail, setShowDetail] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"all" | "success" | "error">(
    "all"
  );

  // 2. Clean Logic: Lấy stats trực tiếp từ examResult
  const stats = useMemo(() => {
    if (!examResult) return null;
    const { examAttempt } = examResult;

    return {
      score: examAttempt.totalScore || 0,
      percentage: Math.round(((examAttempt.totalScore || 0) / 10) * 100),
      totalPoints: 10,
      durationText: calculateDuration(
        examAttempt.startTime,
        examAttempt.submissionTime
      ),
      violationCount: examAttempt.examAttemptLog?.tabSwitchCount || 0,
      dateStarted: examAttempt.startTime
        ? new Date(examAttempt.startTime).toLocaleString(locale)
        : t("examResultOverview.notAvailable"),
      dateFinished: examAttempt.submissionTime
        ? new Date(examAttempt.submissionTime).toLocaleString(locale)
        : t("examResultOverview.notAvailable"),
    };
  }, [examResult, locale, t]);

  // 3. Clean Logic: Lọc dựa trên mảng cauHois đã được Server/Store chấm điểm
  const filteredQuestions = useMemo(() => {
    if (!examResult?.questions) return [];

    return examResult.questions.filter((q) => {
      // Tìm đáp án đúng trong list answers của câu hỏi
      const correctAnsId = q.answerOptions.find((a) => a.isCorrectAnswer)?.id;
      const isCorrect = q.selectedAnswer === correctAnsId;

      if (selectedTab === "success") return isCorrect;
      if (selectedTab === "error") return !isCorrect;
      return true;
    });
  }, [selectedTab, examResult]);

  if (!examResult || !stats)
    return (
      <div className="p-10 text-center">{t("examResultOverview.loading")}</div>
    );

  const handleBackHome = () => {
    if (isPreview) {
      navigate(-2); // Nếu là preview thường mở tab mới, hoặc điều hướng về trang quản trị
    } else {
      navigate(-2);
      // navigate("/courses");
    } // Hoặc dashboard route của bạn
  };

  return (
    <div className="w-[668px] max-w-[668px] space-y-6">
      {/* Thông báo chế độ Preview */}
      {/* 1. Card Kết quả chính (Overview) */}
      <div className="flex items-center overflow-hidden rounded-lg bg-background-body-background shadow-custom">
        <div className="flex-1 px-8 py-6">
          <h1 className="text-h5 mb-2 font-bold text-text-primary">
            {testData?.examName}
          </h1>
          <div className="text-body-2 mb-6 flex items-center gap-2">
            <span className="flex items-center">
              <Icon name="user" size={16} className="mr-1" /> {user?.fullName}
            </span>
            <Button size="small" color="primary" onClick={() => window.print()}>
              <Printer size={14} /> {t("examResultOverview.actions.print")}
            </Button>
          </div>
          <div className="space-y-4">
            {config?.showScore || isPreview ? (
              <InfoRow
                label={t("examResultOverview.labels.score")}
                value={`${stats.score} / ${stats.totalPoints}`}
                highlight
              />
            ) : (
              <div className="text-body-2 italic text-text-disabled">
                {t("examResultOverview.scoreHidden")}
              </div>
            )}
            {/* Thêm dòng này ở đây */}
            <InfoRow
              label={t("examResultOverview.labels.duration")}
              value={stats.durationText}
            />
            <InfoRow
              label={t("examResultOverview.labels.startedAt")}
              value={stats.dateStarted}
            />
            <InfoRow
              label={t("examResultOverview.labels.finishedAt")}
              value={stats.dateFinished}
            />
            <div className="text-body-2 flex items-center">
              <span className="w-32 font-bold text-text-secondary">
                {t("examResultOverview.labels.violations")}
              </span>
              <span
                className={`rounded px-2 py-0.5 ${stats.violationCount > 0 ? "bg-error-background text-alert-error-content" : "bg-action-hover text-text-disabled"}`}
              >
                {stats.violationCount} /{" "}
                {testData?.examConfiguration?.tabSwitchLimit || 3}
              </span>
            </div>
          </div>
        </div>
        {config?.showScore && (
          <div
            className={`flex min-h-[280px] w-64 flex-col items-center justify-center bg-background-body-background p-8 ${getTextProgressColor(stats.percentage)}`}
          >
            <div className="relative flex items-center justify-center">
              <svg className="h-32 w-32 -rotate-90 transform">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * stats.percentage) / 100}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-3xl font-bold">
                {stats.percentage}%
              </span>
            </div>
            <p className="mt-4 font-bold uppercase tracking-wider">
              {getTextProgress(stats.percentage)}
            </p>
          </div>
        )}
      </div>
      {/* 3. Section Chi tiết câu hỏi (Ẩn/Hiện) */}
      {showDetail && (
        <div
          id="details-section"
          className="overflow-hidden rounded-xl border border-other-outlined-border bg-background-body-background shadow-custom"
        >
          <div className="px-6 pt-4">
            <Tabs
              small
              value={selectedTab}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(val) => setSelectedTab(val as any)}
              tabs={[
                {
                  value: "all",
                  label: t("examResultOverview.tabs.all", {
                    count: testData?.questions?.length || 0,
                  }),
                },
                {
                  value: "success",
                  label: t("examResultOverview.tabs.success"),
                },
                { value: "error", label: t("examResultOverview.tabs.error") },
              ]}
            />
          </div>
          <div className="divide-y divide-other-outlined-border">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={
                    testData?.questions?.findIndex(
                      (orig) => orig.id === q.id
                    ) ?? idx
                  }
                  totalQuestions={testData?.questions?.length || 0}
                  userAnswer={answers[q.id]}
                  isReviewMode={true}
                  isFlatMode={true}
                />
              ))
            ) : (
              <div className="py-20 text-center text-text-disabled">
                {t("examResultOverview.emptyFiltered")}
              </div>
            )}
          </div>
        </div>
      )}
      {/* 2. Nút hành động */}
      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" onClick={onCancel ?? handleBackHome}>
          {t("examResultOverview.actions.exit")}
        </Button>
        {(config?.showDetailResults ||
          (!config?.showDetailResults &&
            !isPreview &&
            [1, 2].includes(user?.roleId || 3))) && (
          <Button
            color="primary"
            variant="contained"
            onClick={() => setShowDetail(!showDetail)}
          >
            {showDetail
              ? t("examResultOverview.actions.hideDetail")
              : t("examResultOverview.actions.showDetail")}
          </Button>
        )}
      </div>
    </div>
  );
}

const InfoRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="text-body-2 flex items-center">
    <span className="w-32 font-bold text-text-secondary">{label}</span>
    <span
      className={`rounded px-2 py-0.5 ${highlight ? "bg-warning-background font-medium text-text-primary" : "text-text-secondary"}`}
    >
      {value}
    </span>
  </div>
);
