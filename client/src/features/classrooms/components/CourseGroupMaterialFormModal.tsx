import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { useTranslation } from "react-i18next";
import type { CourseGroupMaterial } from "@/features/classrooms/types/classrooms";
import type { CourseGroupMaterialFormValues } from "@/features/classrooms/types/courseGroupMaterialForm";
import {
  getCourseGroupMaterialFileError,
  getCourseGroupMaterialRequiredFileError,
} from "@/features/classrooms/utils/course-group-material.validate";
import { FormField } from "@/shared/components/ui";
import {
  maxLengthRule,
  requiredFieldRule,
  translatedValidationRule,
} from "@/shared/utils/validation";

interface MaterialModalFormValues extends CourseGroupMaterialFormValues {
  uploadFileName?: string;
}

interface CourseGroupMaterialFormModalProps {
  initialMaterial: CourseGroupMaterial | null;
  isBusy: boolean;
  onCancel: () => void;
  onSave: (
    values: CourseGroupMaterialFormValues,
    file: File | null
  ) => Promise<void>;
}

export default function CourseGroupMaterialFormModal({
  initialMaterial,
  isBusy,
  onCancel,
  onSave,
}: CourseGroupMaterialFormModalProps) {
  const { t } = useTranslation("common");
  const [form] = Form.useForm<MaterialModalFormValues>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    form.setFieldsValue({
      title: initialMaterial?.title ?? "",
      description: initialMaterial?.description ?? "",
    });
  }, [form, initialMaterial]);

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const validationError = getCourseGroupMaterialFileError(file);
    if (validationError) {
      setSelectedFile(null);
      setFileList([]);
      form.resetFields(["uploadFileName"]);
      form.setFields([
        { name: "uploadFileName", errors: [t(validationError)] },
      ]);
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    setFileList([file]);
    form.setFieldValue("uploadFileName", file.name);
    form.setFields([{ name: "uploadFileName", errors: [] }]);
    return false;
  };

  const handleFinish = async (values: MaterialModalFormValues) => {
    if (isBusy) return;

    await onSave(
      {
        title: values.title.trim(),
        description: values.description?.trim(),
      },
      selectedFile
    );
  };

  return (
    <Modal
      open
      title={
        initialMaterial ? t("courseMaterials.edit") : t("courseMaterials.add")
      }
      onCancel={onCancel}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isBusy}>
          {t("common.cancel")}
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={isBusy}
          onClick={() => form.submit()}
        >
          {t("common.save")}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <FormField
          name="title"
          label={t("courseMaterials.form.title")}
          rules={[
            requiredFieldRule(t("courseMaterials.titleRequired"), {
              whitespace: true,
            }),
            maxLengthRule(180, t("courseMaterials.titleTooLong")),
          ]}
        >
          <Input maxLength={180} showCount />
        </FormField>
        <FormField
          name="description"
          label={t("courseMaterials.form.description")}
          rules={[maxLengthRule(5000, t("courseMaterials.descriptionTooLong"))]}
        >
          <Input.TextArea rows={4} maxLength={5000} showCount />
        </FormField>
        <FormField
          name="uploadFileName"
          hidden
          rules={[
            translatedValidationRule(
              () =>
                getCourseGroupMaterialRequiredFileError(
                  Boolean(initialMaterial),
                  Boolean(selectedFile)
                ),
              t
            ),
          ]}
        >
          <Input />
        </FormField>
        {initialMaterial && (
          <p className="mb-2 break-all text-sm text-text-secondary">
            {t("courseMaterials.form.currentFile", {
              fileName: initialMaterial.fileName,
            })}
          </p>
        )}
        <FormField noStyle shouldUpdate>
          {() => {
            const fileErrors = form.getFieldError("uploadFileName");

            return (
              <FormField
                label={t("courseMaterials.form.file")}
                required={!initialMaterial}
                help={fileErrors[0] || t("courseMaterials.fileHelp")}
                validateStatus={fileErrors.length ? "error" : undefined}
              >
                <Upload
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip,.png,.jpg,.jpeg"
                  beforeUpload={beforeUpload}
                  fileList={fileList}
                  maxCount={1}
                  onRemove={() => {
                    setSelectedFile(null);
                    setFileList([]);
                    form.resetFields(["uploadFileName"]);
                    return true;
                  }}
                >
                  <Button>{t("courseMaterials.form.chooseFile")}</Button>
                </Upload>
              </FormField>
            );
          }}
        </FormField>
      </Form>
    </Modal>
  );
}
