import { useMemo } from "react";
import { Form } from "antd";
import type {
  CourseGroupFormData,
  CourseGroupFormValues,
} from "@/features/classrooms/types/courseGroupForm";
import { useTeacherSubjects } from "@/features/teacher-assignments/hooks/useTeacherAssignmentQueries";
import { useTeachers } from "@/features/identity/hooks/useUserQueries";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { getAuthenticatedRoleKind } from "@/shared/utils/role";

interface UseCourseGroupFormControllerOptions {
  initialData?: Partial<CourseGroupFormData> | null;
  onSave: (data: CourseGroupFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function useCourseGroupFormController({
  initialData,
  onSave,
  isSubmitting,
}: UseCourseGroupFormControllerOptions) {
  const [form] = Form.useForm<CourseGroupFormValues>();
  const { user, role } = useAuthStore();
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isAdmin = roleKind === "ADMIN" || roleKind === "CUSTOM";
  const isTeacher = roleKind === "TEACHER";
  const isEdit = initialData?.groupName !== undefined;
  const initialTeacherId =
    initialData?.teacherId != null
      ? Number(initialData.teacherId)
      : isTeacher
        ? (user?.id ?? null)
        : null;
  const initialValues: CourseGroupFormValues = {
    subjectId:
      initialData?.subjectId == null
        ? undefined
        : Number(initialData.subjectId),
    groupName: initialData?.groupName ?? "",
    note: initialData?.note ?? "",
    academicYear: initialData?.academicYear ?? new Date().getFullYear(),
    semester: initialData?.semester ?? 1,
    teacherId: initialTeacherId,
  };

  const selectedTeacherId = Form.useWatch("teacherId", form);
  const activeTeacherId = selectedTeacherId ?? initialTeacherId;
  const {
    users: teachers,
    isLoading: isLoadingTeachers,
    isFetching: isFetchingTeachers,
    isError: isTeachersError,
    refetch: refetchTeachers,
  } = useTeachers(isAdmin);
  const {
    subjects: assignedSubjects,
    isFetching: isFetchingSubjects,
    isError: isSubjectsError,
    refetch: refetchSubjects,
  } = useTeacherSubjects(activeTeacherId ?? 0, Boolean(activeTeacherId));

  const subjectOptions = useMemo(
    () =>
      assignedSubjects.map((subject) => ({
        label: `${subject.subjectCode} · ${subject.subjectName}`,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        value: Number(subject.id),
      })),
    [assignedSubjects]
  );

  const handleFinish = async (values: CourseGroupFormValues) => {
    const subjectId = Number(values.subjectId);
    const selectedSubject = assignedSubjects.find(
      (subject) => Number(subject.id) === subjectId
    );

    await onSave({
      subjectId,
      groupName: values.groupName.trim(),
      note: values.note.trim(),
      subject: selectedSubject?.subjectName ?? initialData?.subject ?? "",
      academicYear: Number(values.academicYear),
      semester: Number(values.semester),
      teacherId: values.teacherId ?? null,
      joinCode: initialData?.joinCode ?? "",
      siSo: initialData?.siSo ?? null,
    });
  };

  const handleValuesChange = (
    changedValues: Partial<CourseGroupFormValues>
  ) => {
    if (Object.hasOwn(changedValues, "teacherId")) {
      form.setFieldValue("subjectId", undefined);
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    (isAdmin && (isLoadingTeachers || isTeachersError)) ||
    isFetchingSubjects ||
    isSubjectsError ||
    !activeTeacherId ||
    subjectOptions.length === 0;

  return {
    form,
    user,
    isAdmin,
    isTeacher,
    isEdit,
    initialValues,
    activeTeacherId,
    teachers,
    subjectOptions,
    assignedSubjectIds: assignedSubjects.map((subject) => Number(subject.id)),
    isFetchingTeachers,
    isTeachersError,
    isFetchingSubjects,
    isSubjectsError,
    refetchTeachers,
    refetchSubjects,
    isSubmitDisabled,
    handleFinish,
    handleValuesChange,
  };
}
