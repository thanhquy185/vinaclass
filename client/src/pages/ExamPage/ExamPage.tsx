import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Input, Button } from "@/components/atomic/atoms";
import MainContentLayout from "@/components/atomic/templates/MainContentLayout/MainContentLayout";
import DynamicTable, {
  type TableColumn,
} from "@/components/atomic/organisms/DynamicTable/DynamicTable";
import type { Exam } from "@/types";
import { useStudentExams } from "@/hooks/useDeThi";
import { formatFullDateTimeVN, getTestsStatus } from "@/utils";
import { examService } from "@/services/api/exam.service";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { useAuthStore } from "@/stores/auth.store";
import { useExamActions } from "@/hooks/useExamActions";
import { useTranslation } from "react-i18next";

export const ExamPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { exams } = useStudentExams(user ? user.id : null);
  const { examAttempts } = useExamActions();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  // Cập nhật thời gian mỗi phút để cập nhật trạng thái nút "Bắt đầu"
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // --- Logic kiểm tra thời gian hợp lệ ---

  // --- Cấu hình Columns cho DynamicTable ---
  const columns: TableColumn<Exam>[] = [
    {
      title: t("examPage.table.stt"),
      key: "id",
      render: (_, item) => examDisplay.indexOf(item) + 1,
      className: "w-16 text-center",
    },
    {
      title: t("examPage.table.className"),
      key: "subject",
      render: (_, item) => item.subject.subjectName,
    },
    { title: t("examPage.table.testName"), key: "examName" },
    {
      title: t("examPage.table.startTime"),
      key: "startTime",
      render: (_, item) => formatFullDateTimeVN(item.startTime),
    },
    {
      title: t("examPage.table.endTime"),
      key: "endTime",
      render: (_, item) => formatFullDateTimeVN(item.endTime),
    },
    {
      title: t("examPage.table.duration"),
      key: "durationMinutes",
      render: (i) => `${i} ${t("examPage.table.minuteUnit")}`,
    },
  ];

  const handleStartExam = async (deThiId: number) => {
    try {
      // 1. Gọi trực tiếp Service hoặc dùng queryClient để lấy data đề thi
      // Chúng ta lấy chi tiết đề để đổ vào Store
      const res = await examService.getExamById(deThiId);

      if (res.data) {
        // 2. Cập nhật vào DeThiStore để trang Introduction có data hiển thị
        useDeThiStore.getState().updateTestData(res.data);

        // 3. Sau khi Store đã có data, mới chuyển trang
        navigate(`/tests/${deThiId}/take`);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin đề thi:", error);
      // Toast: "Không thể tải thông tin đề thi. Vui lòng thử lại."
    }
  };

  const examDisplay = (exams || []).filter((dt) => {
    //hiển thị bài chưa làm
    const examAttempt = examAttempts?.find((i) => i.examId === dt.id);
    return !examAttempt;
  });

  return (
    <MainContentLayout classname="w-full">
      {/* 1. Toolbar Section */}
      <div className="flex justify-between rounded-md bg-background-body-background px-2 py-2">
        {/* Left */}
        <div className="flex gap-2">
          <Input
            hasBoder={true}
            placeholder={t("examPage.searchPlaceholder")}
            icon={<Icon name="search" className="text-text-disabled" />}
          />
        </div>
      </div>

      {/* 2. Table Section */}
      <div className="mt-6 flex flex-col gap-2 rounded-md bg-background-body-background p-2 shadow-sm">
        <DynamicTable
          columns={columns}
          data={examDisplay}
          rowKey="id"
          hasColumnActions={true}
          renderActions={(item) => {
            const status = getTestsStatus(item.startTime, item.endTime, now);
            return (
              <Button
                variant={status.status === "OPENING" ? "contained" : "outline"}
                color={status.status === "CLOSED" ? "standard" : "primary"}
                size="small"
                disabled={status.status !== "OPENING"}
                onClick={() => {
                  handleStartExam(item.id);
                }}
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
      </div>
    </MainContentLayout>
  );
};
