import { Button, Form, Input, Modal } from "antd";
import type { NotificationCreate } from "@/features/classrooms/types/classrooms";
import {
  getCourseGroupNotificationFieldError,
  type CourseGroupNotificationField,
} from "@/features/classrooms/utils/notification.validate";
import { useTranslation } from "react-i18next";
import { FormField } from "@/shared/components/ui";
import {
  maxLengthRule,
  translatedFormValidationRule,
} from "@/shared/utils/validation";

interface NotiThisCourseFormProps {
  courseGroupId: number;
  onClose: () => void;
  onSaveCreate: (data: NotificationCreate) => void;
}

interface AnnouncementFormValues {
  title: string;
  content: string;
}

export default function NotiThisCourseForm({
  courseGroupId,
  onClose,
  onSaveCreate,
}: NotiThisCourseFormProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<AnnouncementFormValues>();
  const courseGroupIds = [courseGroupId];

  const validateField = (field: CourseGroupNotificationField) =>
    translatedFormValidationRule(
      field,
      () => form.getFieldsValue(),
      (currentField, value, values) =>
        getCourseGroupNotificationFieldError(
          currentField,
          value,
          values,
          courseGroupIds
        ),
      t
    );

  const handleSubmit = ({ title, content }: AnnouncementFormValues) => {
    onSaveCreate({
      title: title.trim(),
      content: content.trim(),
      courseGroupIds,
    });
  };

  return (
    <Modal
      open
      title={t("notificationForm.title.create")}
      onCancel={onClose}
      footer={null}
      width="min(720px, calc(100vw - 24px))"
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ title: "", content: "" }}
        onFinish={handleSubmit}
        className="flex flex-col"
      >
        <div className="flex flex-col gap-4 px-1 py-4">
          <FormField
            name="title"
            label={t("notificationForm.fields.title.label")}
            rules={[
              validateField("title"),
              maxLengthRule(
                200,
                t("notificationForm.validation.titleMaxLength")
              ),
            ]}
            className="mb-0"
          >
            <Input
              maxLength={200}
              placeholder={t("notificationForm.fields.title.placeholder")}
            />
          </FormField>

          <FormField
            name="content"
            label={t("notificationForm.fields.content.label")}
            rules={[validateField("content")]}
            className="mb-0"
          >
            <Input.TextArea
              autoSize={{ minRows: 4, maxRows: 10 }}
              placeholder={t("notificationForm.fields.content.placeholder")}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 border-t border-other-outlined-border pt-4">
          <Button htmlType="button" onClick={onClose}>
            {t("notificationForm.actions.back")}
          </Button>
          <Button type="primary" htmlType="submit">
            {t("notificationForm.actions.send")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
