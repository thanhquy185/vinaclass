import { useEffect, useMemo, useState } from "react";
import type { Exam } from "@/shared/types";
import { getTestsStatus } from "@/features/assessments/utils/exam";
import { usePaginatedList } from "@/shared/hooks/usePaginatedList";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";
import type {
  ExamSearchCriterion,
  ExamStatusFilter,
  ExamSubjectOption,
  ExamDateTimeRange,
} from "@/features/assessments/types/examList";

const EXAMS_PER_PAGE = 10;

interface UseExamListStateOptions {
  exams: Exam[];
}

export function useExamListState({ exams }: UseExamListStateOptions) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<ExamSearchCriterion>("name");
  const [selectedSubject, setSelectedSubject] = useState(-1);
  const [statusFilter, setStatusFilter] = useState<ExamStatusFilter>(1);
  const [dateTimeRange, setDateTimeRange] = useState<ExamDateTimeRange>(null);
  const [isNewestFirst, setIsNewestFirst] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleExams = useMemo(
    () => exams.filter((exam) => !exam.isDeleted),
    [exams],
  );

  const subjects = useMemo<ExamSubjectOption[]>(() => {
    const subjectById = new Map<number, string>();
    visibleExams.forEach((exam) => {
      if (exam.subject) {
        subjectById.set(exam.subjectId, exam.subject.subjectName);
      }
    });

    return [...subjectById.entries()]
      .map(([id, subjectName]) => ({ id, subjectName }))
      .sort((first, second) =>
        first.subjectName.localeCompare(second.subjectName, "vi", {
          sensitivity: "base",
        }),
      );
  }, [visibleExams]);

  const filteredExams = useMemo(() => {
    const keyword = normalizeSearchText(searchTerm.trim());
    const currentDate = new Date(now);

    return visibleExams
      .filter((exam) => {
        if (!keyword) return true;

        const subjectName = normalizeSearchText(
          exam.subject?.subjectName ?? "",
        );
        const subjectCode = normalizeSearchText(
          exam.subject?.subjectCode ?? "",
        );

        if (searchBy === "subject") {
          return subjectName.includes(keyword) || subjectCode.includes(keyword);
        }

        return normalizeSearchText(exam.examName ?? "").includes(keyword);
      })
      .filter(
        (exam) => selectedSubject === -1 || exam.subjectId === selectedSubject,
      )
      .filter((exam) => {
        if (statusFilter === 1) return true;

        const status = getTestsStatus(
          exam.startTime,
          exam.endTime,
          currentDate,
        ).status;

        if (statusFilter === 2) return status === "OPENING";
        if (statusFilter === 3) return status === "CLOSED";
        return status === "UPCOMING";
      })
      .filter((exam) => {
        if (!dateTimeRange) return true;
        const examStart = new Date(exam.startTime).getTime();
        const examEnd = new Date(exam.endTime).getTime();

        if (!Number.isFinite(examStart) || !Number.isFinite(examEnd)) {
          return false;
        }

        return examStart <= dateTimeRange[1] && examEnd >= dateTimeRange[0];
      })
      .sort((first, second) => {
        const firstCreatedAt = new Date(first.createdAt).getTime();
        const secondCreatedAt = new Date(second.createdAt).getTime();
        const firstTime = Number.isFinite(firstCreatedAt) ? firstCreatedAt : 0;
        const secondTime = Number.isFinite(secondCreatedAt)
          ? secondCreatedAt
          : 0;

        return isNewestFirst ? secondTime - firstTime : firstTime - secondTime;
      });
  }, [
    visibleExams,
    searchTerm,
    searchBy,
    now,
    selectedSubject,
    statusFilter,
    dateTimeRange,
    isNewestFirst,
  ]);

  const { currentPage, totalPages, pageItems, setCurrentPage } =
    usePaginatedList(filteredExams, EXAMS_PER_PAGE);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    searchBy !== "name" ||
    selectedSubject !== -1 ||
    statusFilter !== 1 ||
    dateTimeRange !== null ||
    !isNewestFirst;

  const resetFilters = () => {
    setSearchTerm("");
    setSearchBy("name");
    setSelectedSubject(-1);
    setStatusFilter(1);
    setDateTimeRange(null);
    setIsNewestFirst(true);
    setCurrentPage(1);
  };

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const updateSearchBy = (value: ExamSearchCriterion) => {
    setSearchBy(value);
    setCurrentPage(1);
  };

  const updateSelectedSubject = (value: number) => {
    setSelectedSubject(value);
    setCurrentPage(1);
  };

  const updateStatusFilter = (value: ExamStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const updateDateTimeRange = (value: ExamDateTimeRange) => {
    setDateTimeRange(value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setIsNewestFirst((value) => !value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    searchBy,
    now,
    selectedSubject,
    statusFilter,
    dateTimeRange,
    isNewestFirst,
    subjects,
    filteredExams,
    currentExams: pageItems,
    currentPage,
    totalPages,
    hasActiveFilters,
    setCurrentPage,
    resetFilters,
    updateSearchTerm,
    updateSearchBy,
    updateSelectedSubject,
    updateStatusFilter,
    updateDateTimeRange,
    toggleSortOrder,
  };
}
