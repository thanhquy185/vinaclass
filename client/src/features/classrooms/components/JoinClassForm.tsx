import { Button, Form, Input, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { FormField } from "@/shared/components/ui";
import { requiredFieldRule } from "@/shared/utils/validation";

interface JoinClassFormValues {
  inviteCode: string;
}

interface JoinClassFormProps {
  onSubmit: (inviteCode: string) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function JoinClassForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: JoinClassFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<JoinClassFormValues>();

  const handleSubmit = async (values: JoinClassFormValues) => {
    await onSubmit(values.inviteCode.trim());
  };

  return (
    <Modal
      open
      title={t("joinClassForm.title")}
      okText={t("joinClassForm.actions.join")}
      cancelText={t("joinClassForm.actions.close")}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isSubmitting}
        className="pt-3"
      >
        <FormField
          name="inviteCode"
          label={t("joinClassForm.inviteCodeLabel")}
          rules={[
            requiredFieldRule(t("joinClassForm.validation.inviteRequired"), {
              whitespace: true,
            }),
            {
              pattern: /^[a-zA-Z0-9]{8}$/,
              message: t("joinClassForm.validation.inviteFormat"),
            },
          ]}
        >
          <Input
            autoFocus
            autoComplete="off"
            maxLength={20}
            placeholder={t("joinClassForm.inviteCodePlaceholder")}
          />
        </FormField>
        <p className="mb-2 text-sm text-text-secondary">
          {t("joinClassForm.helperText")}
        </p>
        <p className="whitespace-pre-line text-xs text-text-secondary">
          {t("joinClassForm.guide")}
        </p>
        <Button htmlType="submit" className="hidden" />
      </Form>
    </Modal>
  );
}
