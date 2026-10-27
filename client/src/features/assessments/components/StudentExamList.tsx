import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Empty } from "antd";
import { Button } from "@/shared/components/ui";
import DataTable, { type TableColumn } from "@/shared/components/DataTable";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import type { Exam } from "@/shared/types";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";
import { getTestsStatus } from "@/features/assessments/utils/exam";

interface StudentExamListProps {
  visibleExams: Exam[];
  currentExams: Exam[];
  now: Date;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => Promise<unknown>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStartExam: (examId: number) => void;
}

export default function StudentExamList({
  visibleExams,
  currentExams,
  now,
  isLoading,
  isFetching,
  isError,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  onStartExam,
}: StudentExamListProps) {
  const { t } = useTranslation();

  const columns = useMemo<TableColumn<Exam>[]>(
    () => [
      {
        title: t("examPage.table.stt"),
        key: "id",
        render: (_, exam) => visibleExams.indexOf(exam) + 1,
        className: "w-16 text-center",
      },
      {
        title: t("examPage.table.className"),
        key: "subject",
        render: (_, exam) => exam.subject?.subjectName ?? "---",
      },
      { title: t("examPage.table.testName"), key: "examName" },
      {
        title: t("examPage.table.startTime"),
        key: "startTime",
        render: (_, exam) => formatFullDateTimeVN(exam.startTime),
      },
      {
        title: t("examPage.table.endTime"),
        key: "endTime",
        render: (_, exam) => formatFullDateTimeVN(exam.endTime),
      },
      {
        title: t("examPage.table.duration"),
        key: "durationMinutes",
        render: (duration) => `${duration} ${t("examPage.table.minuteUnit")}`,
      },
    ],
    [t, visibleExams],
  );

  return (
    <div className="flex flex-col gap-2 rounded-md bg-background-body-background p-3 sm:p-4">
      <DataTable
        columns={columns}
        data={currentExams}
        rowKey="id"
        hasColumnActions
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={onRetry}
        emptyText={<Empty description={t("examPage.empty")} />}
        renderActions={(exam) => {
          const status = getTestsStatus(exam.startTime, exam.endTime, now);

          return (
            <Button
              variant={status.status === "OPENING" ? "contained" : "outline"}
              color={status.status === "CLOSED" ? "standard" : "primary"}
              size="small"
              disabled={status.status !== "OPENING"}
              onClick={() => onStartExam(exam.id)}
            >
              {status.status !== "OPENING"
                ? status.status === "UPCOMING"
                  ? t("examPage.actions.upcoming")
                  : t("examPage.actions.late")
                : t("examPage.actions.startNow")}
            </Button>
          );
        }}
      />
      {totalPages > 1 && (
        <div className="mt-3 rounded-md border border-other-outlined-border bg-background-body-background py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
