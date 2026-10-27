import { Form, Input } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from "react-i18next";
import { AdminFormField } from "@/shared/components/admin";
import { requiredFieldRule } from "@/shared/utils/validation";
import type { StudentEnrollmentFormValues } from "@/features/classrooms/types/courseRoster";

interface ManualStudentEnrollmentFormProps {
  form: FormInstance<StudentEnrollmentFormValues>;
  isBusy: boolean;
  onFinish: (values: StudentEnrollmentFormValues) => void;
}

export default function ManualStudentEnrollmentForm({
  form,
  isBusy,
  onFinish,
}: ManualStudentEnrollmentFormProps) {
  const { t } = useTranslation("common");

  return (
    <Form
      id="manual-student-enrollment-form"
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={isBusy}
      className="flex flex-col gap-4 pt-3"
    >
      <AdminFormField
        name="studentCode"
        label={t("courseGroupStudent.form.studentCode")}
        rules={[
          requiredFieldRule(t("courseGroupStudent.form.studentCodeRequired"), {
            whitespace: true,
          }),
        ]}
      >
        <Input
          autoFocus
          size="large"
          maxLength={100}
          placeholder={t("courseGroupStudent.form.studentCodePlaceholder")}
          className="!h-10 !rounded-lg !bg-background-paper !text-sm"
        />
      </AdminFormField>
    </Form>
  );
}
