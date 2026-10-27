import { Form, Input } from "antd";
import { BellRing } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  NotificationCreate,
  NotificationResponse,
  NotificationUpdate,
} from "@/features/classrooms/types/classrooms";
import { NotificationCourseGroupSelection } from "@/features/classrooms/components/NotificationCourseGroupSelection";
import { useNotificationFormController } from "@/features/classrooms/hooks/useNotificationFormController";
import {
  AdminFormField,
  AdminFormSection,
  AdminReadOnlyField,
} from "@/shared/components/admin";
import { AppDialog, Button, QueryErrorAlert } from "@/shared/components/ui";
import { maxLengthRule } from "@/shared/utils/validation";

interface AddNotificationFormProps {
  onClose: () => void;
  onSaveCreate: (data: NotificationCreate) => void;
  onSaveUpdate: (id: number, data: NotificationUpdate) => void;
  selectedItem: NotificationResponse | null;
  mode: "create" | "view" | "update" | "none";
  isSaving?: boolean;
}

function formatSentAt(value: string | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AddNotificationForm({
  onClose,
  onSaveCreate,
  onSaveUpdate,
  selectedItem,
  mode,
  isSaving = false,
}: AddNotificationFormProps) {
  const { t, i18n } = useTranslation();
  const {
    form,
    isView,
    isCreate,
    canSubmit,
    title,
    subjectGroups,
    isLoadingSubjects,
    isFetchingSubjects,
    isSubjectsError,
    retrySubjects,
    validateField,
    handleSubmit,
  } = useNotificationFormController({
    onSaveCreate,
    onSaveUpdate,
    selectedItem,
    mode,
  });

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="medium"
        onClick={onClose}
        disabled={isSaving}
      >
        {t("notificationForm.actions.back")}
      </Button>
      {canSubmit && (
        <Button
          variant="contained"
          color="primary"
          size="medium"
          htmlType="submit"
          form="notification-form"
          loading={isSaving}
          disabled={isSaving || isLoadingSubjects}
        >
          {t(
            isCreate
              ? "notificationForm.actions.send"
              : "notificationForm.actions.save"
          )}
        </Button>
      )}
    </div>
  );

  return (
    <AppDialog
      open
      onClose={onClose}
      title={title}
      description={t(
        `notificationForm.description.${isView ? "view" : isCreate ? "create" : "update"}`
      )}
      icon={<BellRing size={20} />}
      tone="primary"
      width="min(800px, calc(100vw - 32px))"
      busy={isSaving}
      footer={footer}
    >
      {isView ? (
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <AdminFormSection title={t("notificationForm.sections.message")}>
            <dl className="grid grid-cols-1 gap-3">
              <AdminReadOnlyField
                label={t("notificationForm.fields.title.label")}
                value={selectedItem?.title}
              />
              <AdminReadOnlyField
                label={t("notificationForm.fields.content.label")}
                value={selectedItem?.content}
                valueClassName="whitespace-pre-wrap break-words"
              />
            </dl>
          </AdminFormSection>

          <AdminFormSection title={t("notificationForm.sections.recipients")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminReadOnlyField
                className="sm:col-span-2"
                label={t("notificationForm.assign.label")}
                value={
                  selectedItem?.courseGroups.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.courseGroups.map((group) => (
                        <span
                          key={group.id}
                          className="inline-flex max-w-full items-center rounded-full bg-background-paper px-2.5 py-1 text-xs font-medium text-text-primary ring-1 ring-inset ring-other-outlined-border"
                        >
                          <span className="truncate">{group.groupName}</span>
                          <span className="ml-1.5 shrink-0 text-text-secondary">
                            {group.academicYear}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    t("notificationForm.noGroups")
                  )
                }
              />
              <AdminReadOnlyField
                label={t("notificationForm.metadata.sender")}
                value={selectedItem?.sender?.profile?.fullName}
              />
              <AdminReadOnlyField
                label={t("notificationForm.metadata.sentAt")}
                value={formatSentAt(selectedItem?.sentAt, i18n.language)}
              />
            </div>
          </AdminFormSection>
        </div>
      ) : (
        <Form
          id="notification-form"
          form={form}
          layout="vertical"
          initialValues={{
            title: selectedItem?.title ?? "",
            content: selectedItem?.content ?? "",
            courseGroupIds:
              selectedItem?.courseGroups.map((group) => group.id) ?? [],
          }}
          onFinish={handleSubmit}
        >
          <div className="space-y-5 px-5 py-5 sm:px-6">
            {isSubjectsError && (
              <QueryErrorAlert
                message={t("notificationForm.subjectsLoadError")}
                onRetry={retrySubjects}
                isRetrying={isFetchingSubjects}
                retryLabel={t("tableActions.retry")}
              />
            )}

            <AdminFormSection
              title={t("notificationForm.sections.message")}
              description={t("notificationForm.description.messageFields")}
            >
              <div className="space-y-3">
                <AdminFormField
                  name="title"
                  label={t("notificationForm.fields.title.label")}
                  rules={[
                    validateField("title"),
                    maxLengthRule(
                      200,
                      t("notificationForm.validation.titleMaxLength")
                    ),
                  ]}
                >
                  <Input
                    autoComplete="off"
                    autoFocus={isCreate}
                    maxLength={200}
                    placeholder={t("notificationForm.fields.title.placeholder")}
                    disabled={isSaving}
                    className="!h-10 !rounded-lg !bg-background-paper !text-sm"
                  />
                </AdminFormField>

                <AdminFormField
                  name="content"
                  label={t("notificationForm.fields.content.label")}
                  rules={[validateField("content")]}
                >
                  <Input.TextArea
                    autoSize={{ minRows: 4, maxRows: 10 }}
                    placeholder={t(
                      "notificationForm.fields.content.placeholder"
                    )}
                    disabled={isSaving}
                    className="!rounded-lg !bg-background-paper !text-sm"
                  />
                </AdminFormField>
              </div>
            </AdminFormSection>

            <AdminFormSection
              title={t("notificationForm.assign.label")}
              description={t("notificationForm.description.recipients")}
            >
              <AdminFormField
                name="courseGroupIds"
                label={t("notificationForm.assign.placeholder")}
                rules={[validateField("courseGroupIds")]}
              >
                <NotificationCourseGroupSelection
                  subjectGroups={subjectGroups}
                  disabled={isSaving}
                  loading={isLoadingSubjects}
                  loadingLabel={t("tableActions.loading")}
                  selectAllLabel={t("notificationForm.selectAll")}
                  emptyLabel={t("notificationForm.noGroups")}
                />
              </AdminFormField>
            </AdminFormSection>
          </div>
        </Form>
      )}
    </AppDialog>
  );
}
