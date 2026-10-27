export interface CourseGroupFormData {
  subjectId: number;
  groupName: string;
  note: string;
  subject: string;
  academicYear: number;
  semester: number;
  teacherId: number | null;
  joinCode: string | null;
  siSo: number | null;
}

export interface CourseGroupFormValues {
  subjectId?: number;
  groupName: string;
  note: string;
  academicYear?: number;
  semester?: number;
  teacherId?: number | null;
}

export interface CourseGroupEditFormState {
  data: Partial<CourseGroupFormData>;
  groupId?: number;
}
