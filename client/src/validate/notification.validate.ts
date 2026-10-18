export interface NotificationInput {
  title: string;
  content: string;
  courseGroupIds: number[];
}

export type NotificationError = Partial<Record<keyof NotificationInput, string>>;

export class NotificationValidate {
  static create(data: NotificationInput): NotificationError {
    const errors: NotificationError = {};

    // tiêu đề
    if (!data.title || data.title.trim() === "") {
      errors.title = "Tiêu đề không được để trống";
    }

    // nội dung
    if (!data.content || data.content.trim() === "") {
      errors.content = "Nội dung không được để trống";
    }

    // nhóm học phần
    if (!data.courseGroupIds || data.courseGroupIds.length === 0) {
      errors.courseGroupIds = "Phải chọn ít nhất 1 nhóm học phần";
    }

    return errors;
  }
}

export class CourseGroupNotificationValidate {
  static create(data: NotificationInput): NotificationError {
    const errors: NotificationError = {};

    // tiêu đề
    if (!data.title || data.title.trim() === "") {
      errors.title = "Tiêu đề không được để trống";
    }

    // nội dung
    if (!data.content || data.content.trim() === "") {
      errors.content = "Nội dung không được để trống";
    }

    return errors;
  }
}
