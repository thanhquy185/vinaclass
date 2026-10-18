import { Button, Icon, Input } from "@/components/atomic/atoms";
import { Checkbox } from "@/components/atomic/atoms/Checkbox/Checkbox";
import Divider from "@/components/atomic/atoms/Divider/Divider";
import SelectField from "@/components/atomic/atoms/Select/SelectField";
import { BodyQuestionItem } from "@/components/atomic/molecules/BodyQuestionItem/BodyQuestionItem";
import { useCreateExam, useUpdateExam } from "@/hooks/useDeThi";
import { useDifficulties } from "@/hooks/useDifficulty";
import { useQuestionsOfUser } from "@/hooks/useQuestion";
import { useAuthStore } from "@/stores/auth.store";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { useExamStore } from "@/stores/useExamStore";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useToastStore } from "@/stores/useToast.store";
import type { CreateExamPayload, Exam } from "@/types";
import { formatFullDateTimeVN, mapDeThiToCreatePayload } from "@/utils";
import {
  BadgePercent,
  CopyX,
  Eye,
  Info,
  Printer,
  RotateCcw,
  ShieldAlert,
  Shuffle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AddQuestionTestPage() {
  const location = useLocation();
  const { pathname } = location;

  const isEditMode = pathname.includes("/edit");
  const isViewMode = pathname.includes("/view");
  const isAddMode = pathname.includes("/add");

  const { user } = useAuthStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isOpenQuestionForm, setIsOpenQuestionForm] = useState(false);
  const { mutate: createExam } = useCreateExam();
  const { mutate: updateExam } = useUpdateExam();

  // Hooks lấy dữ liệu mẫu từ ngân hàng câu hỏi
  const { personalQuestions } = useQuestionsOfUser(user?.id);
  const validQuestions = personalQuestions.filter(
    (item) => item.status !== "archive"
  );
  const { difficulties } = useDifficulties();

  // 1. Lấy dữ liệu và Actions từ Store duy nhất
  const testData = useDeThiStore((s) => s.testData);
  const addQuestion = useDeThiStore((s) => s.addQuestion);
  const removeQuestion = useDeThiStore((s) => s.removeQuestion);
  const moveQuestion = useDeThiStore((s) => s.moveQuestion);
  const showToast = useToastStore((s) => s.showToast);

  // Selector an toàn cho danh sách câu hỏi trong đề
  const cauHoi_deThi = useMemo(
    () => testData?.questions || [],
    [testData?.questions]
  );

  const handlePreview = () => {
    useExamStore.getState().resetExam();
    useExamStore.getState().mode = "PREVIEW";
    // Sử dụng optional chaining an toàn
    navigate(`/tests/${testData?.id || "draft"}/take?mode=preview`);
  };

  // 2. Tối ưu: Set ID để kiểm tra trạng thái "đã chọn" (O(1))
  const selectedQuestionIds = useMemo(
    () => new Set(cauHoi_deThi.map((q) => q.id)),
    [cauHoi_deThi]
  );

  // 3. Tính toán số lượng câu hỏi theo độ khó
  const difficultyCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    cauHoi_deThi.forEach((q) => {
      counts[q.difficultyId] = (counts[q.difficultyId] || 0) + 1;
    });
    return counts;
  }, [cauHoi_deThi]);

  const { startLoading, stopLoading } = useLoadingStore();
  const handleSave = () => {
    const data = mapDeThiToCreatePayload(testData as Exam) as CreateExamPayload;
    startLoading(
      isAddMode
        ? t("addQuestionTestPage.loading.create")
        : t("addQuestionTestPage.loading.update")
    );

    if (isAddMode) {
      createExam(data, {
        onSuccess: (data) => {
          // Có thể điều hướng người dùng sau khi lưu thành công
          console.log("Tạo bài thi", data.data);
          navigate(`/tests/${data.data.id}`);
        },
        onSettled: () => {
          stopLoading();
        },
      });
    } else {
      updateExam(
        { payload: data, id: testData?.id || Number(id) },
        {
          onSuccess: (data) => {
            // Có thể điều hướng người dùng sau khi lưu thành công
            console.log("Lưu bài thi", testData?.id || Number(id));
            showToast(t("addQuestionTestPage.toast.saveSuccess"), "success");
            navigate(`/tests/${data.data.id}`);
          },
          onSettled: () => {
            stopLoading();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background-body">
      <div className="flex justify-center bg-other-tooltip p-2">
        <div className="flex-bet-center w-[1000px]">
          <Button
            variant={"contained"}
            color={"standard"}
            onClick={() => {
              const backPath = id ? -1 : "/tests/add";

              navigate(backPath as string, {
                state: { fromQuestions: true },
                replace: true, // Dùng replace để không làm rối history stack
              });
            }}
          >
            <Icon name="out" />
            {t("addQuestionTestPage.actions.back")}
          </Button>
          <strong className="text-body-1 font-medium text-primary-contrast">
            {isEditMode
              ? t("addQuestionTestPage.title.edit")
              : isViewMode
                ? t("addQuestionTestPage.title.view")
                : t("addQuestionTestPage.title.create")}
          </strong>
          <Button
            variant={"contained"}
            color={"standard"}
            onClick={handlePreview}
          >
            <Icon name="eye" />
            {t("addQuestionTestPage.actions.preview")}
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-stretch bg-background-body p-5">
        <div className="flex w-[450px] flex-col gap-3 border-r border-other-outlined-border pr-5">
          <div className="flex-bet-center gap-2">
            <Input
              placeholder={t("addQuestionTestPage.filters.search")}
              disabled={isViewMode}
            />
            <Button
              disabled={isViewMode}
              variant={"outline"}
              color={"primary"}
              className="bg-background-body-background"
              onClick={() => setIsOpenQuestionForm(true)}
            >
              <Icon name="question" />{" "}
              {t("addQuestionTestPage.actions.addQuestion")}
            </Button>

            {/* <AddQuestionForm
              isOpen={isOpenQuestionForm}
              onClose={() => setIsOpenQuestionForm(!isOpenQuestionForm)}
            /> */}
          </div>
          <div className="flex-bet-center gap-2">
            <SelectField
              placeholder={t("addQuestionTestPage.filters.chapter")}
              classname="bg-background-body-background"
              options={[{ label: "Chương 1: Đây là chương 1", value: 1 }]}
              onSelect={() => {}}
              disabled={isViewMode}
            />
            <SelectField
              label={t("addQuestionTestPage.filters.difficulty.label")}
              placeholder={t(
                "addQuestionTestPage.filters.difficulty.placeholder"
              )}
              options={difficulties.map((item) => ({
                label: item.difficultyName,
                value: item.id,
              }))}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onSelect={(_val) => {
                // setFilterDifficulty();
              }}
              disabled={isViewMode}
            />
          </div>

          <div className="flex max-h-[80vh] flex-col overflow-auto border-x border-t border-other-outlined-border bg-background-body-background">
            {validQuestions.map((item) => {
              // Kiểm tra xem câu hỏi này đã có trong đề thi chưa
              const isSelected = selectedQuestionIds.has(item.id);

              return (
                <Checkbox
                  disabled={isViewMode}
                  key={item.id}
                  id={`question-item-${item.id}`} // Đảm bảo ID duy nhất cho label
                  classnameParent={`p-4 border-b border-other-outlined-border gap-3 ${isViewMode ? "opacity-80 pointer-events-none " : "hover:bg-action-hover"} transition-colors`}
                  label={item.questionContent}
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      addQuestion(item);
                    } else {
                      removeQuestion(item.id);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="ml-5 flex flex-1 flex-col rounded-md bg-background-body-background">
          {/*  */}
          <div className="flex-bet-center border-b border-other-outlined-border px-5 py-2.5">
            <div className="flex items-center gap-2 text-text-secondary">
              <span>{t("addQuestionTestPage.count.label")} </span>
              <div className="flex gap-2">
                {difficulties.map((difficulty) => {
                  const count = difficultyCounts[difficulty.id] || 0;

                  // Chỉ hiển thị những độ khó có câu hỏi (hoặc hiển thị 0 tùy bạn)
                  return (
                    <div
                      key={difficulty.id}
                      className="flex items-center gap-2 rounded-md bg-action-selected p-1.5 transition-all"
                    >
                      <span className="text text-body-1">
                        {difficulty.difficultyName}
                      </span>
                      <span className="text-body-2 rounded-md bg-primary-main px-2.5 font-semibold text-primary-contrast">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              {!isViewMode && (
                <Button
                  variant={"contained"}
                  color={"primary"}
                  onClick={handleSave}
                >
                  <Icon name="clipboard" />
                  {isEditMode
                    ? t("addQuestionTestPage.actions.saveEdit")
                    : t("addQuestionTestPage.actions.addTest")}
                </Button>
              )}
            </div>
          </div>
          <div className="flex max-h-[90vh] flex-col overflow-auto">
            <div className="flex justify-center border-b border-other-outlined-border pb-4">
              <TestInfoSummary />
            </div>

            {/*  */}
            <div className="px-5">
              {cauHoi_deThi.map((item, index) => (
                <div className="flex justify-between gap-2 border-b border-other-outlined-border p-2.5">
                  {/* infor */}
                  <BodyQuestionItem data={item} showAnswer index={index + 1} />

                  <div
                    className={`flex flex-col justify-center ${isViewMode && "pointer-events-none opacity-60"}`}
                  >
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      className="rounded-none border-b border-other-outlined-border"
                      disabled={index === 0} // Vị trí đầu tiên không thể lên nữa
                      onClick={() => moveQuestion(index, "up")}
                      tooltip={t("addQuestionTestPage.tooltips.moveUp")}
                      isToolTipLeft
                    >
                      <Icon name="arrowUp" />
                    </Button>
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      className="rounded-none border-b border-other-outlined-border"
                      disabled={index === cauHoi_deThi.length - 1} // Vị trí cuối không thể xuống
                      onClick={() => moveQuestion(index, "down")}
                      tooltip={t("addQuestionTestPage.tooltips.moveDown")}
                      isToolTipLeft
                    >
                      <Icon name="up" />
                    </Button>
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      className="rounded-none border-b border-other-outlined-border"
                      onClick={() => removeQuestion(item.id)}
                      tooltip={t("addQuestionTestPage.tooltips.removeFromTest")}
                      isToolTipLeft
                    >
                      <Icon name="remove" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TestInfoSummary = () => {
  const { testData } = useDeThiStore();
  const { t } = useTranslation();

  return (
    <div className="flex justify-center">
      <div className="flex w-full flex-col gap-6 px-8 py-3">
        {/* 1. Tiêu đề và Thông tin cơ bản - Phân chia rõ ràng */}
        <div className="flex flex-col gap-2 px-8 py-3">
          {/* title */}
          <div className="mb-5 flex justify-center">
            <span className="text-h6 text-text-primary hover:underline">
              {testData?.examName}
            </span>
          </div>

          <div className="flex gap-6">
            {/* infor */}
            <div className="flex flex-col gap-2.5">
              <span className="text-caption-semibold uppercase tracking-wider text-text-primary">
                {t("addQuestionTestPage.summary.basicInfo.title")}
              </span>
              <div className="flex flex-col gap-2 text-text-secondary">
                <div className="flex items-center gap-1">
                  <Icon name="documentDuplicate" size={20} />
                  <span className="text-body-2">
                    {t("addQuestionTestPage.summary.basicInfo.assignTo")}
                  </span>
                  <span className="text-body-2-semibold text">
                    {testData?.subject?.subjectName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="pause" size={20} />
                  <span className="text-body-2">
                    {t("addQuestionTestPage.summary.basicInfo.duration", {
                      start: formatFullDateTimeVN(testData?.startTime),
                      end: formatFullDateTimeVN(testData?.endTime),
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="clock" size={20} />
                  <span className="text-body-2">
                    {t("addQuestionTestPage.summary.basicInfo.workTime", {
                      minutes: testData?.durationMinutes,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <Divider orientation="vertical" />

            {/* Nhóm Bảo mật */}
            <div className="flex flex-col gap-2.5">
              <span className="text-caption-semibold uppercase tracking-wider text-text-primary">
                {t("addQuestionTestPage.summary.security.title")}
              </span>
              <ul className="flex flex-col gap-2">
                {testData?.examConfiguration?.hasMonitoring && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Eye size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.security.monitoringOn")}
                  </li>
                )}

                {testData?.examConfiguration?.isLimitSwitchTab && (
                  <li className="text-body-2 flex items-center gap-2 text-alert-error-content">
                    <ShieldAlert size={18} className="mt-0.5" />
                    {t("addQuestionTestPage.summary.security.switchLimit")}{" "}
                    <span className="font-semibold">
                      {t("addQuestionTestPage.summary.security.switchTimes", {
                        count: testData?.examConfiguration?.tabSwitchLimit,
                      })}
                    </span>
                  </li>
                )}

                {testData?.examConfiguration?.allowCopy === false && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <CopyX size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.security.copyBlocked")}
                  </li>
                )}

                {testData?.examConfiguration?.allowPrint === false && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Printer size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.security.printBlocked")}
                  </li>
                )}
              </ul>
            </div>

            <Divider orientation="vertical" />

            {/* Nhóm Quy tắc */}
            <div className="flex flex-col gap-2.5">
              <span className="text-caption-semibold uppercase tracking-wider text-text-primary">
                {t("addQuestionTestPage.summary.rules.title")}
              </span>
              <ul className="flex flex-col gap-2">
                {(testData?.examConfiguration?.shuffleQuestions ||
                  testData?.examConfiguration?.shuffleAnswers) && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Shuffle size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.rules.shuffle")}
                  </li>
                )}

                {testData?.examConfiguration?.isEnableResume && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <RotateCcw
                      size={18}
                      className="text-text-tertiary mt-0.5"
                    />
                    {t("addQuestionTestPage.summary.rules.resume")}
                  </li>
                )}
                {testData?.examConfiguration?.showDetailResults && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <Info size={18} className="text-text-tertiary mt-0.5" />
                    {t("addQuestionTestPage.summary.rules.showDetail")}
                  </li>
                )}

                {testData?.examConfiguration?.showScore && (
                  <li className="text-body-2 flex items-center gap-2 text-text-secondary">
                    <BadgePercent
                      size={18}
                      className="text-text-tertiary mt-0.5"
                    />
                    {t("addQuestionTestPage.summary.rules.showScore")}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
