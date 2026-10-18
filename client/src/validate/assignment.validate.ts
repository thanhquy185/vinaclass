export interface AssignmentInput {
  subjectIds: number[];
}

export type AssignmentError = Partial<Record<keyof AssignmentInput, string>>;

export class AssignmentValidate {
  static create(data: AssignmentInput): AssignmentError {
    const errors: AssignmentError = {};

    // kiểm tra danh sách môn học
    if (!data.subjectIds || data.subjectIds.length === 0) {
      errors.subjectIds = "Vui lòng chọn ít nhất 1 môn học";
    }

    return errors;
  }
}
