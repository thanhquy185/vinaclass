import type { Question } from "@/shared/types";
import QuestionCard from "@/features/assessments/components/QuestionCard";

interface ExamQuestionListProps {
  question?: Question;
  answers: Record<number, number | null>;
  questionIndex: number;
  totalQuestions: number;
  onAnswerChange: (questionId: number, answerId: number) => void;
}

export function ExamQuestionList({
  question,
  answers,
  questionIndex,
  totalQuestions,
  onAnswerChange,
}: ExamQuestionListProps) {
  return (
    <div id="active-exam-question" className="min-w-0">
      {question && (
        <QuestionCard
          question={question}
          index={questionIndex}
          totalQuestions={totalQuestions}
          userAnswer={answers[question.id]}
          onAnswerChange={onAnswerChange}
        />
      )}
    </div>
  );
}
