import { Form, Input, Upload } from "antd";
import type { FormInstance, UploadFile, UploadProps } from "antd";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { AdminFormField } from "@/shared/components/admin";
import { requiredFieldRule } from "@/shared/utils/validation";
import type { StudentRosterImportValues } from "@/features/classrooms/types/courseRoster";

interface StudentRosterImportFormProps {
  form: FormInstance<StudentRosterImportValues>;
  selectedFile: File | null;
  isBusy: boolean;
  sampleFileUrl: string;
  onBeforeUpload: UploadProps["beforeUpload"];
  onRemoveFile: () => void;
  onFinish: () => void;
}

export default function StudentRosterImportForm({
  form,
  selectedFile,
  isBusy,
  sampleFileUrl,
  onBeforeUpload,
  onRemoveFile,
  onFinish,
}: StudentRosterImportFormProps) {
  const { t } = useTranslation("common");

  return (
    <Form
      id="student-roster-import-form"
      form={form}
      onFinish={onFinish}
      disabled={isBusy}
      className="flex flex-col gap-4 pt-3"
    >
      <Form.Item
        name="studentFile"
        hidden
        rules={[
          requiredFieldRule(t("courseGroupStudent.form.importFileRequired"), {
            whitespace: true,
          }),
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {() => {
          const fileErrors = form.getFieldError("studentFile");

          return (
            <AdminFormField
              label={t("courseGroupStudent.form.content")}
              help={fileErrors[0]}
              validateStatus={fileErrors.length ? "error" : undefined}
              className="bg-transparent !p-0"
            >
              <Upload
                accept=".xlsx,.xls,.csv"
                maxCount={1}
                beforeUpload={onBeforeUpload}
                onRemove={() => {
                  onRemoveFile();
                  return true;
                }}
                fileList={
                  selectedFile
                    ? [
                        {
                          uid: "student-list",
                          name: selectedFile.name,
                          status: "done",
                        } satisfies UploadFile,
                      ]
                    : []
                }
                disabled={isBusy}
              >
                <Button disabled={isBusy}>
                  {t("courseGroupStudent.form.chooseFile")}
                </Button>
              </Upload>
            </AdminFormField>
          );
        }}
      </Form.Item>
      <p className="text-sm text-text-secondary">
        {t("courseGroupStudent.form.formatInstruction")}{" "}
        <a
          href={sampleFileUrl}
          download="danhsachSVmau.xlsx"
          className="font-medium text-primary-main hover:underline"
        >
          {t("courseGroupStudent.form.downloadSampleFile")}
        </a>
      </p>
    </Form>
  );
}
