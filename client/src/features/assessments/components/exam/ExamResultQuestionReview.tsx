import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import QuestionCard from "@/features/assessments/components/QuestionCard";
import Tabs from "@/shared/components/ui/Tabs/Tabs";
import type { Question } from "@/shared/types";

type ResultQuestionFilter = "all" | "success" | "error";

interface ExamResultQuestionReviewProps {
  isVisible: boolean;
  resultQuestions: Question[];
  examQuestions?: Question[];
  answers: Record<number, number | null>;
}

export default function ExamResultQuestionReview({
  isVisible,
  resultQuestions,
  examQuestions,
  answers,
}: ExamResultQuestionReviewProps) {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] =
    useState<ResultQuestionFilter>("all");

  const filteredQuestions = useMemo(
    () =>
      resultQuestions.filter((question) => {
        const correctAnswerId = question.answerOptions?.find(
          (answer) => answer.isCorrectAnswer,
        )?.id;
        const isCorrect = question.selectedAnswer === correctAnswerId;

        if (selectedFilter === "success") return isCorrect;
        if (selectedFilter === "error") return !isCorrect;
        return true;
      }),
    [resultQuestions, selectedFilter],
  );

  if (!isVisible) return null;

  return (
    <div
      id="details-section"
      className="overflow-hidden rounded-xl border border-other-outlined-border bg-background-body-background shadow-custom"
    >
      <div className="px-6 pt-4">
        <Tabs
          small
          value={selectedFilter}
          onChange={(value) => setSelectedFilter(value as ResultQuestionFilter)}
          tabs={[
            {
              value: "all",
              label: t("examResultOverview.tabs.all", {
                count: examQuestions?.length ?? 0,
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
          filteredQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={
                examQuestions?.findIndex(
                  (examQuestion) => examQuestion.id === question.id,
                ) ?? index
              }
              totalQuestions={examQuestions?.length || 0}
              userAnswer={answers[question.id]}
              isReviewMode
              isFlatMode
            />
          ))
        ) : (
          <div className="py-20 text-center text-text-disabled">
            {t("examResultOverview.emptyFiltered")}
          </div>
        )}
      </div>
    </div>
  );
}
