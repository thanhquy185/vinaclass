import { useNavigate } from "react-router-dom";
import Logo from "../../molecules/Logo/Logo";
import { Button } from "../../atoms";
import { useExamStore } from "@/stores/useExamStore";
import { useDeThiStore } from "@/stores/useDeThi.store";
import { formatMinutesToTime } from "@/utils";
import type { ExamAttempt } from "@/types";
import { useAuthStore } from "@/stores/auth.store";
import { useExamActions } from "@/hooks/useExamActions";
import { useLoadingStore } from "@/stores/useLoading.store";
import { useTranslation } from "react-i18next";

export const ExamInstruction = () => {
  const { t } = useTranslation();
  const { initExam, mode } = useExamStore();
  const navigate = useNavigate();
  const { startExam } = useExamActions();

  const { testData } = useDeThiStore();
  const { user } = useAuthStore();
  const { startLoading, stopLoading } = useLoadingStore();

  const handleStart = async () => {
    // TRƯỜNG HỢP 1: CHẾ ĐỘ PREVIEW (Dành cho Admin/Giáo viên xem thử)
    if (mode === "PREVIEW") {
      const previewExam: ExamAttempt = {
        id: -1, // ID giả
        examId: testData?.id || 0,
        studentId: user?.id || 0,
        status: "IN_PROGRESS",
        examAttemptAnswers: [], // Hoặc map từ testData.cau_hois nếu muốn có sẵn hàng
        startTime: new Date().toISOString(),
        totalScore: 0,
        correctAnswerCount: 0,
      };

      initExam(previewExam, "PREVIEW");
      navigate("doing");
      return;
    }

    startLoading();

    // TRƯỜNG HỢP 2: THI THẬT (STUDENT)
    try {
      // 1. Gọi API qua Hook (Hook này đã lo việc fetch Detail và startTest rồi)
      // Bạn KHÔNG nên tạo newExam thủ công ở đây vì API startTest sẽ trả về dữ liệu chuẩn

      await startExam({
        studentId: user?.id || 0,
        examId: testData?.id || 0,
      });

      // 2. navigate sang trang làm bài
      // (Lưu ý: Logic lưu vào Store đã nằm trong onSuccess của useExamActions rồi)
      navigate("doing");
    } catch (error) {
      console.error("Lỗi khi bắt đầu thi:", error);
      // Có thể hiện thông báo lỗi bằng Toast ở đây
    } finally {
      stopLoading();
    }
  };

  return (
    <>
      {/* 1. Logo Header */}
      <header className="flex justify-center px-4">
        <div className="w-[668px] pb-6 pt-6">
          {" "}
          <Logo classname="text-text-secondary font-bold" />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-5 text-text-secondary">
        <div className="w-full max-w-[668px]">
          {/* 2. Title */}
          <h1 className="text-h5 pb-6">{testData?.examName}</h1>

          {/* 3. Instructions Box */}
          <div className="mb-6 rounded-md bg-background-body px-8 py-6">
            <h2 className="text-body-2 mb-4 font-bold">
              {t("examInstruction.title")}
            </h2>
            <ul className="text-body-2 space-y-2">
              <ItemSetting
                textLeft={t("examInstruction.timeLimit")}
                textRight={formatMinutesToTime(testData?.durationMinutes || 0)}
              />
              <ItemSetting
                textLeft={t("examInstruction.attempts")}
                textRight="1"
              />
              <ItemSetting
                textLeft={t("examInstruction.questionCount")}
                textRight={testData?.questions?.length.toString()}
              />
              {testData?.examConfiguration?.limitQuestionsPerPage &&
                testData?.examConfiguration?.limitQuestionsPerPage > 0 && (
                  <ItemSetting
                    textLeft={t("examInstruction.pagination")}
                    textRight={`${testData.examConfiguration.limitQuestionsPerPage} ${t("examInstruction.questionsPerPage")}`}
                  />
                )}
              {testData?.examConfiguration?.allowBackLastQuestion === 0 && (
                <ItemSetting
                  classname="text-alert-error-content font-bold" // Cho màu đỏ để gây chú ý
                  textLeft={t("examInstruction.noBackWarning")}
                />
              )}
              {testData?.examConfiguration?.shuffleQuestions && (
                <ItemSetting textLeft={t("examInstruction.shuffleQuestions")} />
              )}
              {testData?.examConfiguration?.shuffleAnswers && (
                <ItemSetting textLeft={t("examInstruction.shuffleAnswers")} />
              )}
              {testData?.examConfiguration?.hasMonitoring && (
                <ItemSetting textLeft={t("examInstruction.monitoring")} />
              )}
              {testData?.examConfiguration?.isLimitSwitchTab && (
                <ItemSetting
                  classname="text-primary-main"
                  textLeft={t("examInstruction.limitSwitchTab", {
                    count: testData?.examConfiguration.tabSwitchLimit,
                  })}
                />
              )}
            </ul>
          </div>

          <p className="text-body-2">
            {t("examInstruction.welcome", { testName: testData?.examName })}
          </p>

          {/* 4. Start Button */}
          <div className="flex justify-end">
            <Button
              color={"primary"}
              variant={"contained"}
              onClick={handleStart}
            >
              {t("examInstruction.start")}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

function ItemSetting({
  textLeft,
  textRight,
  classname,
}: {
  textLeft?: string;
  textRight?: string;
  classname?: string;
}) {
  return (
    <li className={`flex items-center gap-2 ${classname}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-action-active"></span>
      {textLeft}
      <span className="ml-1 font-bold">{textRight}</span>
    </li>
  );
}
