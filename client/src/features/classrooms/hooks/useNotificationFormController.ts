import { useMemo } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { useCourseGroups } from "@/features/classrooms/hooks/useCourseGroupQueries";
import { getNotificationFieldError } from "@/features/classrooms/utils/notification.validate";
import { toNotificationSubjectGroups } from "@/features/classrooms/utils/notification-form";
import {
  type NotificationFieldRuleFactory,
  type NotificationFormValues,
} from "@/features/classrooms/types/notificationForm";
import { translatedFormValidationRule } from "@/shared/utils/validation";
import type {
  NotificationCreate,
  NotificationResponse,
  NotificationUpdate,
} from "@/features/classrooms/types/classrooms";

interface UseNotificationFormControllerOptions {
  onSaveCreate: (data: NotificationCreate) => void;
  onSaveUpdate: (id: number, data: NotificationUpdate) => void;
  selectedItem: NotificationResponse | null;
  mode: "create" | "view" | "update" | "none";
}

export function useNotificationFormController({
  onSaveCreate,
  onSaveUpdate,
  selectedItem,
  mode,
}: UseNotificationFormControllerOptions) {
  const { t } = useTranslation();
  const {
    courseGroups: availableCourseGroups,
    isLoading: isLoadingSubjects,
    isFetching: isFetchingSubjects,
    isError: isSubjectsError,
    refetch: retrySubjects,
  } = useCourseGroups(mode !== "view");
  const [form] = Form.useForm<NotificationFormValues>();
  const isView = mode === "view";
  const isCreate = mode === "create" || mode === "none";
  const canSubmit = isCreate || mode === "update";

  const subjectGroups = useMemo(
    () => toNotificationSubjectGroups(availableCourseGroups),
    [availableCourseGroups]
  );

  const validateField: NotificationFieldRuleFactory = (field) =>
    translatedFormValidationRule(
      field,
      () => form.getFieldsValue(),
      getNotificationFieldError,
      t
    );

  const handleSubmit = (values: NotificationFormValues) => {
    const payload: NotificationCreate = {
      title: values.title.trim(),
      content: values.content.trim(),
      courseGroupIds: values.courseGroupIds,
    };

    if (mode === "update") {
      if (selectedItem) onSaveUpdate(selectedItem.id, payload);
      return;
    }

    if (isCreate) onSaveCreate(payload);
  };

  return {
    form,
    isView,
    isCreate,
    canSubmit,
    title: t(`notificationForm.title.${mode === "none" ? "create" : mode}`),
    subjectGroups,
    isLoadingSubjects,
    isFetchingSubjects,
    isSubjectsError,
    retrySubjects,
    validateField,
    handleSubmit,
  };
}
