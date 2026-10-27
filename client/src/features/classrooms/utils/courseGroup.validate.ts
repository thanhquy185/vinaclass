export class CourseGroupValidate {
  static getSubjectAssignmentError(
    subjectId: number | null | undefined,
    assignedSubjectIds: number[]
  ): string | undefined {
    if (subjectId === undefined || subjectId === null) return undefined;

    return assignedSubjectIds.includes(Number(subjectId))
      ? undefined
      : "courseGroup.form.validation.subjectNotAssigned";
  }
}
