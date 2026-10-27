export interface NotificationInput {
  title: string;
  content: string;
  courseGroupIds: number[];
}

export type NotificationError = Partial<
  Record<keyof NotificationInput, string>
>;

export type CourseGroupNotificationField = "title" | "content";

function mergeNotificationValues(
  field: keyof NotificationInput,
  value: unknown,
  currentValues: Partial<NotificationInput>,
  courseGroupIds: number[] = currentValues.courseGroupIds ?? []
): NotificationInput {
  return {
    title:
      field === "title"
        ? String(value ?? "")
        : String(currentValues.title ?? ""),
    content:
      field === "content"
        ? String(value ?? "")
        : String(currentValues.content ?? ""),
    courseGroupIds:
      field === "courseGroupIds" && Array.isArray(value)
        ? value.map(Number)
        : courseGroupIds,
  };
}

export class NotificationValidate {
  static titleAndContent(
    data: Pick<NotificationInput, "title" | "content">
  ): NotificationError {
    const errors: NotificationError = {};

    if (!data.title || data.title.trim() === "") {
      errors.title = "notificationForm.validation.titleRequired";
    }

    if (!data.content || data.content.trim() === "") {
      errors.content = "notificationForm.validation.contentRequired";
    }

    return errors;
  }

  static create(data: NotificationInput): NotificationError {
    const errors = this.titleAndContent(data);

    if (!data.courseGroupIds || data.courseGroupIds.length === 0) {
      errors.courseGroupIds = "notificationForm.validation.courseGroupRequired";
    }

    return errors;
  }
}

export class CourseGroupNotificationValidate {
  static create(data: NotificationInput): NotificationError {
    return NotificationValidate.titleAndContent(data);
  }
}

export function getNotificationFieldError(
  field: keyof NotificationInput,
  value: unknown,
  currentValues: Partial<NotificationInput>
): string | undefined {
  return NotificationValidate.create(
    mergeNotificationValues(field, value, currentValues)
  )[field];
}

export function getCourseGroupNotificationFieldError(
  field: CourseGroupNotificationField,
  value: unknown,
  currentValues: Partial<NotificationInput>,
  courseGroupIds: number[]
): string | undefined {
  return CourseGroupNotificationValidate.create(
    mergeNotificationValues(field, value, currentValues, courseGroupIds)
  )[field];
}
