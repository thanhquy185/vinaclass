export interface AssignmentInput {
  teacherId: number | null;
  subjectIds: number[];
}

export type AssignmentError = Partial<Record<keyof AssignmentInput, string>>;

export class AssignmentValidate {
  static getSubjectIdsError(subjectIds?: number[]): string | undefined {
    return subjectIds?.length
      ? undefined
      : "addAssignmentForm.validation.subjectRequired";
  }

  static create(data: AssignmentInput): AssignmentError {
    const errors: AssignmentError = {};

    if (!data.teacherId) {
      errors.teacherId = "addAssignmentForm.validation.teacherRequired";
    }

    const subjectIdsError = this.getSubjectIdsError(data.subjectIds);
    if (subjectIdsError) errors.subjectIds = subjectIdsError;

    return errors;
  }
}
