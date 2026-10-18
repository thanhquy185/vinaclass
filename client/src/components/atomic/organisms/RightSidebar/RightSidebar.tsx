import type { ExamConfiguration } from "@/types";
import { Toggle } from "../../atoms/Toggle/Toggle";
import { TextField } from "../../molecules/TextField/TextField";
import { useTranslation } from "react-i18next";

interface RightSidebarProps {
  data?: ExamConfiguration;
  onChange?: (newData: Partial<ExamConfiguration>) => void;
  readOnly?: boolean;
}

export default function RightSidebar({
  data,
  onChange,
  readOnly,
}: RightSidebarProps) {
  const { t } = useTranslation();
  // Hàm update linh hoạt cho cả Boolean và Number
  const updateConfig = (updates: Partial<ExamConfiguration>) => {
    if (readOnly || !data) return;
    onChange?.(updates);
  };

  // Logic xử lý riêng cho Giám sát thi để đồng bộ các con
  const handleToggleMonitoring = () => {
    const isMonitoring = !data?.hasMonitoring;

    if (isMonitoring) {
      // KHI BẬT: Tự động kích hoạt các cấu hình mặc định
      updateConfig({
        hasMonitoring: true,
        allowCopy: false, // Bật chặn (allowCopy = false)
        isLimitSwitchTab: true, // Bật giới hạn tab
        tabSwitchLimit: 3, // Mặc định là 3 lần
      });
    } else {
      // KHI TẮT: Trả về trạng thái tự do
      updateConfig({
        hasMonitoring: false,
        isLimitSwitchTab: false,
        allowCopy: true, // Tắt chặn (cho phép copy)
      });
    }
  };

  return (
    <div className="h-full w-[320px] overflow-y-auto border-l border-other-outlined-border bg-background-body-background">
      <div className="text-h6 border-b border-other-outlined-border px-5 py-4 font-bold text-text-primary">
        {t("testConfigSidebar.title")}
      </div>

      <div className="flex flex-col gap-6 px-5 py-6">
        {/* NHÓM: XÁO TRỘN */}
        <section className="flex flex-col gap-3">
          <p className="text-caption font-bold uppercase text-text-disabled">
            {t("testConfigSidebar.sections.shuffle")}
          </p>
          <Toggle
            label={t("testConfigSidebar.toggles.shuffleQuestions")}
            checked={!!data?.shuffleQuestions}
            onChange={() =>
              updateConfig({ shuffleQuestions: !data?.shuffleQuestions })
            }
            disabled={readOnly}
          />
          <Toggle
            label={t("testConfigSidebar.toggles.shuffleAnswers")}
            checked={!!data?.shuffleAnswers}
            onChange={() =>
              updateConfig({ shuffleAnswers: !data?.shuffleAnswers })
            }
            disabled={readOnly}
          />
        </section>

        {/* NHÓM: BẢO MẬT (ANTI-CHEAT) */}
        <section className="flex flex-col gap-3">
          <p className="text-caption font-bold uppercase text-text-disabled">
            {t("testConfigSidebar.sections.antiCheat")}
          </p>

          {/* Toggle Cha */}
          <Toggle
            label={t("testConfigSidebar.toggles.monitoring")}
            checked={!!data?.hasMonitoring}
            onChange={handleToggleMonitoring}
            disabled={readOnly}
          />

          {/* Các tùy chọn con - Chỉ hiện khi bật Giám sát */}
          {data?.hasMonitoring && (
            <div className="border-primary-main/20 ml-2 flex flex-col gap-4 border-l-2 pl-4 duration-200 animate-in slide-in-from-left-2">
              <Toggle
                label={t("testConfigSidebar.toggles.blockCopy")}
                checked={data?.allowCopy === false}
                onChange={() => updateConfig({ allowCopy: !data?.allowCopy })}
                disabled={readOnly}
              />

              <div className="flex flex-col gap-2">
                <Toggle
                  label={t("testConfigSidebar.toggles.limitSwitchTab")}
                  checked={!!data?.isLimitSwitchTab}
                  onChange={() =>
                    updateConfig({ isLimitSwitchTab: !data?.isLimitSwitchTab })
                  }
                  disabled={readOnly}
                />

                {data?.isLimitSwitchTab && (
                  <div className="pl-9 duration-200 animate-in slide-in-from-top-2">
                    <TextField
                      type="number"
                      label={t("testConfigSidebar.labels.maxSwitches")}
                      value={data?.tabSwitchLimit ?? 3}
                      onChange={(e) =>
                        updateConfig({ tabSwitchLimit: Number(e.target.value) })
                      }
                      disabled={readOnly}
                      classNameParent={`!gap-1 ${readOnly && "opacity-50"}`}
                      placeholder={t(
                        "testConfigSidebar.placeholders.maxSwitches"
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Toggle
              label="Giới hạn số câu mỗi trang"
              checked={data?.limitQuestionsPerPage !== -1}
              onChange={() => {
                const isActivating = data?.limitQuestionsPerPage === -1;
                if (isActivating) {
                  // KHI BẬT: Gợi ý tắt luôn việc quay lại (nhưng Admin vẫn có thể bật lại sau đó)
                  updateConfig({
                    limitQuestionsPerPage: 1,
                    allowBackLastQuestion: 0, // Gợi ý chặn quay lại
                  });
                } else {
                  // KHI TẮT: Trả về trạng thái mặc định cho phép quay lại
                  updateConfig({
                    limitQuestionsPerPage: -1,
                    allowBackLastQuestion: 1,
                  });
                }
              }}
              disabled={readOnly}
            />

            {data?.limitQuestionsPerPage !== -1 && (
              <div className="border-primary-main/20 ml-2 border-l-2 pl-9 animate-in slide-in-from-top-2">
                <TextField
                  type="number"
                  label="Số lượng câu/trang"
                  value={data?.limitQuestionsPerPage ?? 1}
                  onChange={(e) =>
                    updateConfig({
                      limitQuestionsPerPage: Math.max(
                        1,
                        Number(e.target.value)
                      ),
                    })
                  }
                  disabled={readOnly}
                  classNameParent="!gap-1"
                />
                {/* Dòng nhắc nhở */}
                <p className="text-caption italic text-alert-warning-content">
                  * Thường kết hợp với "Chặn quay lại" để tăng tính bảo mật.
                </p>
              </div>
            )}
          </div>

          <Toggle
            label="Cho phép quay lại câu trước"
            checked={Number(data?.allowBackLastQuestion) === 1}
            onChange={() =>
              updateConfig({
                allowBackLastQuestion:
                  data?.allowBackLastQuestion === 1 ? 0 : 1,
              })
            }
            disabled={readOnly}
          />
        </section>

        {/* NHÓM: KẾT QUẢ */}
        <section className="flex flex-col gap-3">
          <p className="text-caption font-bold uppercase text-text-disabled">
            {t("testConfigSidebar.sections.afterExam")}
          </p>
          <Toggle
            label={t("testConfigSidebar.toggles.showScore")}
            checked={!!data?.showScore}
            onChange={() => updateConfig({ showScore: !data?.showScore })}
            disabled={readOnly}
          />
          <Toggle
            label={t("testConfigSidebar.toggles.showDetail")}
            checked={!!data?.showDetailResults}
            onChange={() =>
              updateConfig({ showDetailResults: !data?.showDetailResults })
            }
            disabled={readOnly}
          />
          <Toggle
            label={t("testConfigSidebar.toggles.enableResume")}
            checked={!!data?.isEnableResume}
            onChange={() =>
              updateConfig({ isEnableResume: !data?.isEnableResume })
            }
            disabled={readOnly}
          />
        </section>
      </div>
    </div>
  );
}
