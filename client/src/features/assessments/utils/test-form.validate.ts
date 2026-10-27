import type { TestFormValues } from "@/features/assessments/types/testForm";

export interface TestFormInput {
  examName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subjectId: number;
  courseGroupIds: number[];
  creatorId: number;
}

export type TestFormErrors = Partial<
  Record<
    | "examName"
    | "startTime"
    | "endTime"
    | "durationMinutes"
    | "subjectId"
    | "courseGroupIds"
    | "creatorId",
    string
  >
>;

export class TestFormValidate {
  static create(data: TestFormInput): TestFormErrors {
    const errors: TestFormErrors = {};

    if (!data.examName.trim()) {
      errors.examName = "testFormPage.validation.nameRequired";
    } else if (data.examName.trim().length > 255) {
      errors.examName = "testFormPage.validation.nameMaxLength";
    }

    const startTime = Date.parse(data.startTime);
    const endTime = Date.parse(data.endTime);
    if (!data.startTime) {
      errors.startTime = "testFormPage.validation.startTimeRequired";
    } else if (!Number.isFinite(startTime)) {
      errors.startTime = "testFormPage.validation.startTimeInvalid";
    }

    if (!data.endTime) {
      errors.endTime = "testFormPage.validation.endTimeRequired";
    } else if (!Number.isFinite(endTime)) {
      errors.endTime = "testFormPage.validation.endTimeInvalid";
    } else if (Number.isFinite(startTime) && endTime <= startTime) {
      errors.endTime = "testFormPage.validation.endTimeAfterStart";
    }

    if (!Number.isInteger(data.durationMinutes) || data.durationMinutes < 1) {
      errors.durationMinutes = "testFormPage.validation.durationMinimum";
    }

    if (!Number.isInteger(data.subjectId) || data.subjectId <= 0) {
      errors.subjectId = "testFormPage.validation.subjectRequired";
    }

    if (data.courseGroupIds.length === 0) {
      errors.courseGroupIds = "testFormPage.validation.courseGroupRequired";
    }

    if (!Number.isInteger(data.creatorId) || data.creatorId <= 0) {
      errors.creatorId = "testFormPage.validation.creatorRequired";
    }

    return errors;
  }
}

export function getTestFormFieldError(
  field: keyof TestFormValues,
  value: unknown,
  currentValues: Partial<TestFormValues>,
  creatorId: number,
): string | undefined {
  const input: TestFormInput = {
    examName: currentValues.examName ?? "",
    startTime: currentValues.startTime ?? "",
    endTime: currentValues.endTime ?? "",
    durationMinutes: currentValues.durationMinutes ?? 0,
    subjectId: currentValues.subjectId ?? 0,
    courseGroupIds: currentValues.courseGroupIds ?? [],
    creatorId,
  };

  switch (field) {
    case "examName":
      input.examName = typeof value === "string" ? value : "";
      break;
    case "startTime":
      input.startTime = typeof value === "string" ? value : "";
      break;
    case "endTime":
      input.endTime = typeof value === "string" ? value : "";
      break;
    case "durationMinutes":
      input.durationMinutes = Number(value ?? 0);
      break;
    case "subjectId":
      input.subjectId = Number(value ?? 0);
      break;
    case "courseGroupIds":
      input.courseGroupIds = Array.isArray(value) ? value.map(Number) : [];
      break;
  }

  return TestFormValidate.create(input)[field];
}
