import { useTranslation } from "react-i18next";
import { Button, Input, InputNumber, Space } from "antd";
import type { Exam } from "@/shared/types";
import type { TestFieldRuleFactory } from "@/features/assessments/types/testForm";
import { DateTimePicker } from "@/features/assessments/components/DateTimePicker";
import {
  AdminFormSection,
  AdminFormField,
  AdminPanel,
  AdminReadOnlyField,
} from "@/shared/components/admin";
import { FormField } from "@/shared/components/ui";
import { formatFullDateTimeVN } from "@/shared/utils/date-time";

interface TestDetailsFieldsProps {
  isViewMode: boolean;
  validateTestField: TestFieldRuleFactory;
  data?: Partial<Exam> | null;
}

const parseDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
};

export function TestDetailsFields({
  isViewMode,
  validateTestField,
  data,
}: TestDetailsFieldsProps) {
  const { t } = useTranslation();

  return (
    <AdminPanel className="p-4 sm:p-5">
      <AdminFormSection
        title={t("testFormPage.sections.details")}
        description={t("testFormPage.sections.detailsDescription")}
      >
        {isViewMode ? (
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminReadOnlyField
              label={t("testFormPage.fields.name.label")}
              value={data?.examName}
              className="sm:col-span-2"
            />
            <AdminReadOnlyField
              label={t("testFormPage.fields.startTime")}
              value={formatFullDateTimeVN(data?.startTime)}
            />
            <AdminReadOnlyField
              label={t("testFormPage.fields.endTime")}
              value={formatFullDateTimeVN(data?.endTime)}
            />
            <AdminReadOnlyField
              label={t("testFormPage.fields.duration.label")}
              value={
                data?.durationMinutes
                  ? t("testItem.durationMinutes", {
                      count: data.durationMinutes,
                    })
                  : undefined
              }
            />
          </dl>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <AdminFormField
              name="examName"
              label={t("testFormPage.fields.name.label")}
              required
              rules={[validateTestField("examName")]}
              className="mb-0"
            >
              <Input
                maxLength={255}
                showCount
                placeholder={t("testFormPage.fields.name.placeholder")}
                disabled={isViewMode}
                size="large"
                variant="outlined"
                className="!h-10 !w-full !rounded-lg !bg-background-paper !px-3 !text-sm !text-text-primary placeholder:!text-text-disabled"
              />
            </AdminFormField>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AdminFormField
                name="startTime"
                label={t("testFormPage.fields.startTime")}
                required
                trigger="onSelect"
                validateTrigger="onSelect"
                getValueFromEvent={(date: Date | undefined) =>
                  date?.toISOString() ?? ""
                }
                getValueProps={(value: string) => ({
                  selected: parseDate(value),
                })}
                rules={[validateTestField("startTime")]}
                className="mb-0"
              >
                <DateTimePicker
                  disabled={isViewMode}
                  onSelect={() => undefined}
                />
              </AdminFormField>

              <AdminFormField
                name="endTime"
                label={t("testFormPage.fields.endTime")}
                required
                trigger="onSelect"
                validateTrigger="onSelect"
                dependencies={["startTime"]}
                getValueFromEvent={(date: Date | undefined) =>
                  date?.toISOString() ?? ""
                }
                getValueProps={(value: string) => ({
                  selected: parseDate(value),
                })}
                rules={[validateTestField("endTime")]}
                className="mb-0"
              >
                <DateTimePicker
                  disabled={isViewMode}
                  onSelect={() => undefined}
                />
              </AdminFormField>
            </div>

            <AdminFormField
              label={t("testFormPage.fields.duration.label")}
              required
              className="mb-0"
            >
              <Space.Compact className="w-full">
                <FormField
                  name="durationMinutes"
                  noStyle
                  rules={[validateTestField("durationMinutes")]}
                >
                  <InputNumber
                    min={1}
                    precision={0}
                    size="large"
                    className="!h-10 !w-full !rounded-l-lg !bg-background-paper !text-sm"
                    placeholder={t("testFormPage.fields.duration.placeholder")}
                    disabled={isViewMode}
                  />
                </FormField>
                <Button
                  disabled
                  size="large"
                  className="!h-10 !rounded-r-lg !bg-action-hover !px-3 !text-sm !text-text-secondary"
                >
                  {t("testFormPage.fields.duration.unit")}
                </Button>
              </Space.Compact>
            </AdminFormField>
          </div>
        )}
      </AdminFormSection>
    </AdminPanel>
  );
}
