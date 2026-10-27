import { useEffect, useMemo, useRef, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import type { Exam, ExamAttempt } from "@/shared/types";
import { shuffleArray } from "@/features/assessments/utils/exam";
import {
  getAttemptDeadline,
  getAttemptRemainingSeconds,
} from "@/features/assessments/utils/examAttemptTime";

interface UseExamSessionStateOptions {
  currentExam: ExamAttempt | null;
  testData: Partial<Exam> | null;
  mode: "STUDENT" | "PREVIEW";
  navigate: NavigateFunction;
  startExam: () => void;
  finishHandlerRef: { current: () => Promise<void> };
}

export function useExamSessionState({
  currentExam,
  testData,
  mode,
  navigate,
  startExam,
  finishHandlerRef,
}: UseExamSessionStateOptions) {
  const examEndTime = mode === "PREVIEW" ? undefined : testData?.endTime;
  const attemptId = currentExam?.id;
  const examQuestions = testData?.questions;
  const shouldShuffleQuestions = testData?.examConfiguration?.shuffleQuestions;
  const shouldShuffleAnswers = testData?.examConfiguration?.shuffleAnswers;
  const initializedAttemptId = useRef<number | null>(null);
  const shuffledQuestions = useMemo(() => {
    if (attemptId === undefined || !examQuestions) return [];

    let questions = [...examQuestions];

    if (shouldShuffleQuestions) {
      questions = shuffleArray(questions);
    }

    if (shouldShuffleAnswers) {
      questions = questions.map((question) => ({
        ...question,
        answerOptions: shuffleArray(question.answerOptions),
      }));
    }

    return questions;
  }, [attemptId, examQuestions, shouldShuffleAnswers, shouldShuffleQuestions]);
  const [timeLeft, setTimeLeft] = useState(
    getAttemptRemainingSeconds(
      currentExam,
      testData?.durationMinutes,
      examEndTime,
    ),
  );
  useEffect(() => {
    if (!currentExam) {
      if (mode === "STUDENT" && testData?.id) {
        navigate(`/tests/${testData.id}/take`, { replace: true });
      }
      return;
    }

    if (currentExam.status === "SUBMITTED") {
      if (mode === "STUDENT" && testData?.id) {
        navigate(`/tests/${testData.id}/take`, { replace: true });
      }
      return;
    }

    if (!testData || initializedAttemptId.current === currentExam.id) return;

    initializedAttemptId.current = currentExam.id;

    if (mode === "STUDENT") startExam();
  }, [currentExam, mode, navigate, startExam, testData]);

  useEffect(() => {
    if (
      !currentExam ||
      currentExam.status === "SUBMITTED" ||
      !testData?.questions
    ) {
      return;
    }

    const deadline = getAttemptDeadline(
      currentExam,
      testData.durationMinutes,
      examEndTime,
    );
    let timer: ReturnType<typeof setInterval> | undefined;
    let submittedOnTimeout = false;

    const updateTimeLeft = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        if (timer) clearInterval(timer);
        if (!submittedOnTimeout) {
          submittedOnTimeout = true;
          void finishHandlerRef.current();
        }
      }
    };

    updateTimeLeft();
    if (deadline > Date.now()) timer = setInterval(updateTimeLeft, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentExam, examEndTime, finishHandlerRef, testData]);

  return {
    shuffledQuestions,
    timeLeft,
    isQuestionOrderReady: currentExam !== null && Boolean(testData?.questions),
  };
}
