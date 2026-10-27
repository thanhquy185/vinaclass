import { useCallback, useEffect, useMemo, useState } from "react";
import type { Exam, ExamAttempt } from "@/shared/types";
import { usePaginatedList } from "@/shared/hooks/usePaginatedList";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

const EXAMS_PER_PAGE = 8;

interface UseStudentExamListStateOptions {
  exams: Exam[];
  examAttempts?: ExamAttempt[];
}

export function useStudentExamListState({
  exams,
  examAttempts,
}: UseStudentExamListStateOptions) {
  const [now, setNow] = useState(() => new Date());
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const visibleExams = useMemo(() => {
    const keyword = normalizeSearchText(searchValue, { trim: true });

    return exams.filter((exam) => {
      const attempt = examAttempts?.find(
        (examAttempt) => examAttempt.examId === exam.id,
      );
      const isAvailable =
        !attempt ||
        (attempt.status !== "SUBMITTED" &&
          !!attempt.exam?.examConfiguration?.isEnableResume);
      const matchesSearch =
        !keyword ||
        normalizeSearchText(exam.examName).includes(keyword) ||
        normalizeSearchText(exam.subject?.subjectName ?? "").includes(keyword);

      return isAvailable && matchesSearch;
    });
  }, [exams, examAttempts, searchValue]);

  const {
    currentPage,
    totalPages,
    pageItems: currentExams,
    setCurrentPage,
  } = usePaginatedList(visibleExams, EXAMS_PER_PAGE);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      setCurrentPage(1);
    },
    [setCurrentPage],
  );

  return {
    now,
    searchValue,
    visibleExams,
    currentExams,
    currentPage,
    totalPages,
    setCurrentPage,
    handleSearchChange,
  };
}
