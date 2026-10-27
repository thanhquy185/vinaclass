import { Empty } from "antd";
import { useTranslation } from "react-i18next";
import { QueryErrorAlert } from "@/shared/components/ui";
import DynamicTable, { type TableColumn } from "@/shared/components/DataTable";
import type { StudentExam } from "@/shared/types";
import {
  CourseGroupExamDurationCell,
  CourseGroupExamNameCell,
  CourseGroupExamPercentageCell,
  CourseGroupExamScoreCell,
} from "@/features/classrooms/components/CourseGroupClassworkCells";

interface CourseGroupClassworkProps {
  exams: StudentExam[];
  isStudent: boolean;
  now: Date;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onStartExam: (examId: number) => void;
  onViewResult: (examAttemptId: number) => void;
  onRetry: () => void;
}

export default function CourseGroupClasswork({
  exams,
  isStudent,
  now,
  isLoading,
  isFetching,
  isError,
  onStartExam,
  onViewResult,
  onRetry,
}: CourseGroupClassworkProps) {
  const { t } = useTranslation();

  const columns: TableColumn<StudentExam>[] = [
    {
      title: t("courseElement.classwork.columns.testName"),
      key: "examName",
      className: "w-[45%]",
      render: (_, item) => (
        <CourseGroupExamNameCell
          exam={item}
          isStudent={isStudent}
          now={now}
          onStartExam={onStartExam}
        />
      ),
    },
    {
      title: t("courseElement.classwork.columns.percentage"),
      key: "examAttempt",
      id: "exam-percentage",
      className: "text-center",
      render: (_, item) => <CourseGroupExamPercentageCell exam={item} />,
    },
    {
      title: t("courseElement.classwork.columns.score"),
      key: "examAttempt",
      id: "exam-score",
      className: "text-center",
      render: (_, item) => <CourseGroupExamScoreCell exam={item} />,
    },
    {
      title: t("courseElement.classwork.columns.duration"),
      key: "examAttempt",
      id: "exam-duration",
      className: "text-center",
      render: (_, item) => (
        <CourseGroupExamDurationCell exam={item} onViewResult={onViewResult} />
      ),
    },
  ];

  return (
    <>
      <DynamicTable
        columns={isStudent ? columns : columns.slice(0, 1)}
        data={exams}
        rowKey="id"
        isLoading={isStudent && isLoading}
        emptyText={<Empty description={t("courseElement.classwork.empty")} />}
      />
      {isStudent && isError && (
        <QueryErrorAlert
          className="m-4"
          message={t("courseElement.classwork.loadError")}
          retryLabel={t("courseElement.retry")}
          onRetry={onRetry}
          isRetrying={isFetching}
        />
      )}
    </>
  );
}
