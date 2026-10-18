import { useEffect, useState } from "react";
import { Button, Icon } from "../../atoms";
import { useNavigate } from "react-router-dom";
import type { Exam } from "@/types";
import {
  formatFullDateTimeVN,
  getTestsStatus,
  getVariantDeThiWithStatus,
} from "@/utils";
import { ClassResultItem } from "../../molecules/ClassResultItem/ClassResultItem";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { StatusLabel } from "../../atoms/StatusLabel/StatusLabel";
import { useDeleteExam } from "@/hooks/useDeThi";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useConfirmStore } from "@/stores/useConfirm.store";
import { useToastStore } from "@/stores/useToast.store";
import { useTranslation } from "react-i18next";

interface TestItemProps {
  data: Exam;
  onEdit?: (item: Exam) => void;
  onDelete?: (item: Exam) => void;
  actions: string[];
}

export default function TestItem({ data, actions }: TestItemProps) {
  const [isCollapse, setIsCollapse] = useState(true);
  const navigate = useNavigate();

  const updateTestData = useDeThiStore((state) => state.updateTestData);
  const { mutateAsync: deleteExam } = useDeleteExam();

  const handleJoinTest = () => {
    // 1. Lưu ID vào Zustand Persist (Nó sẽ tự động vào LocalStorage)
    updateTestData({ ...data });

    // 2. Chuyển hướng sang trang chi tiết bài thi
    navigate(`${data.id}/view`);
  };

  const handleEditTest = () => {
    updateTestData({ ...data });
    navigate(`${data.id}/edit`);
  };

  const [now, setNow] = useState(new Date());

  // Cập nhật thời gian mỗi phút để cập nhật trạng thái nút "Bắt đầu"
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const status = getTestsStatus(data.startTime, data.endTime, now);

  const { startLoading, stopLoading } = useLoadingStore();
  const { openConfirm } = useConfirmStore();
  const { showToast } = useToastStore();
  const { t } = useTranslation();

  const handleDelete = () => {
    openConfirm({
      title: t("testItem.confirmDeleteTitle"),
      message: t("testItem.confirmDelete"),
      type: "danger",
      onConfirm: async () => {
        startLoading();
        await deleteExam(data.id, {
          onSuccess: () => {
            showToast(t("message.success.delete"), "success");
          },
          onSettled: () => stopLoading(),
          onError: () => showToast(t("message.error.delete"), "error"),
        });
      },
    });
  };

  return (
    <div className="flex flex-col rounded-md bg-background-body-background">
      {/* header */}
      <div className="flex items-center justify-between border-b border-other-outlined-border px-10 py-2">
        <StatusLabel variant={getVariantDeThiWithStatus(status.status)}>
          {status.label}{" "}
        </StatusLabel>

        <div className="flex gap-2">
          <Button color={"primary"} onClick={handleJoinTest}>
            {t("testItem.actions.viewDetail")}
          </Button>
          {actions.includes("update") && (
            <Button color={"primary"} onClick={handleEditTest}>
              {t("testItem.actions.edit")}
            </Button>
          )}
          {actions.includes("delete") && (
            <Button color={"primary"} onClick={handleDelete}>
              {t("testItem.actions.delete")}
            </Button>
          )}
        </div>
      </div>

      {/* Thong tin co ban */}
      <div className="flex flex-col gap-2 px-8 py-3">
        {/* title */}
        <div className="flex-bet-center">
          <span
            className="text-h6 cursor-pointer font-bold text-text-secondary hover:underline"
            onClick={() => navigate(`${data.id}`)}
          >
            {data.examName}
          </span>

          <Button
            variant={"outline"}
            onClick={() => setIsCollapse(!isCollapse)}
          >
            <Icon
              name="collapse"
              className={`${!isCollapse && "rotate-180 transition-all"}`}
            />
          </Button>
        </div>

        {/* infor */}
        <div className="flex flex-col gap-2 text-text-secondary">
          <div className="flex items-center gap-1">
            <Icon name="documentDuplicate" size={20} />
            <span className="text-body-1">{t("testItem.assignTo")}</span>
            <span className="text-body-1-semibold text">
              {data.subject.subjectName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="clock" size={20} />
            <span className="text-body-1">
              {t("testItem.duration", {
                start: formatFullDateTimeVN(data.startTime),
                end: formatFullDateTimeVN(data.endTime),
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Danh sach bai lam */}
      {!isCollapse && (
        <div className="flex flex-col text-text-secondary">
          {data.courseGroups.map((item) => (
            <ClassResultItem data={item} testId={data.id} />
          ))}
        </div>
      )}
    </div>
  );
}
