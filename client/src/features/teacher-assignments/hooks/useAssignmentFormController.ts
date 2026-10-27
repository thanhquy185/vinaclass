import { useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import type {
  AssignmentRequest,
  TeacherSubject,
} from "@/features/teacher-assignments/types/teacherAssignment";
import { useSubjectQueries } from "@/features/catalogs/hooks/useSubjectQueries";
import { useTeachers } from "@/features/identity/hooks/useUserQueries";
import { normalizeSearchText } from "@/shared/utils/normalizeSearchText";

interface UseAssignmentFormControllerParams {
  isOpen: boolean;
  assignments: TeacherSubject[];
  onSave: (data: AssignmentRequest) => Promise<void>;
}

export function useAssignmentFormController({
  isOpen,
  assignments,
  onSave,
}: UseAssignmentFormControllerParams) {
  const [form] = Form.useForm<AssignmentRequest>();
  const [searchTerm, setSearchTerm] = useState("");
  const teacherId = Form.useWatch("teacherId", form) ?? null;
  const subjectIds = Form.useWatch("subjectIds", form) ?? [];

  const {
    subjects,
    isLoading: isLoadingSubjects,
    isFetching: isFetchingSubjects,
    isError: isSubjectsError,
    refetch: refetchSubjects,
  } = useSubjectQueries();
  const {
    users: teachers,
    isLoading: isLoadingTeachers,
    isFetching: isFetchingTeachers,
    isError: isTeachersError,
    refetch: refetchTeachers,
  } = useTeachers();

  useEffect(() => {
    if (!isOpen) return;

    form.resetFields();
    form.setFieldsValue({ teacherId: null, subjectIds: [] });
  }, [form, isOpen]);

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm.trim());
    if (!normalizedSearch) return subjects;

    return subjects.filter((subject) =>
      normalizeSearchText(
        `${subject.subjectCode} ${subject.subjectName}`
      ).includes(normalizedSearch)
    );
  }, [subjects, searchTerm]);

  const visibleSubjectIds = filteredSubjects.map((subject) => subject.id);
  const allVisibleSelected =
    visibleSubjectIds.length > 0 &&
    visibleSubjectIds.every((id) => subjectIds.includes(id));
  const someVisibleSelected = visibleSubjectIds.some((id) =>
    subjectIds.includes(id)
  );

  const handleTeacherSelect = (selectedTeacherId?: number) => {
    const assignedSubjectIds = selectedTeacherId
      ? assignments
          .filter((assignment) => assignment.teacherId === selectedTeacherId)
          .map((assignment) => assignment.subjectId)
      : [];

    form.setFields([
      { name: "teacherId", errors: [] },
      {
        name: "subjectIds",
        value: Array.from(new Set(assignedSubjectIds)),
        errors: [],
      },
    ]);
  };

  const handleSubjectCheck = (subjectId: number, checked: boolean) => {
    const nextSubjectIds = checked
      ? Array.from(new Set([...subjectIds, subjectId]))
      : subjectIds.filter((id) => id !== subjectId);

    form.setFields([{ name: "subjectIds", value: nextSubjectIds, errors: [] }]);
  };

  const handleVisibleSubjectsCheck = (checked: boolean) => {
    const nextSubjectIds = checked
      ? Array.from(new Set([...subjectIds, ...visibleSubjectIds]))
      : subjectIds.filter((id) => !visibleSubjectIds.includes(id));

    form.setFields([{ name: "subjectIds", value: nextSubjectIds, errors: [] }]);
  };

  const handleSubmit = async (values: AssignmentRequest) => {
    await onSave({
      teacherId: values.teacherId ?? null,
      subjectIds: values.subjectIds ?? [],
    });
  };

  return {
    form,
    teacherId,
    subjectIds,
    searchTerm,
    setSearchTerm,
    teachers,
    filteredSubjects,
    allVisibleSelected,
    someVisibleSelected,
    isLoadingSubjects,
    isFetchingSubjects,
    isSubjectsError,
    refetchSubjects,
    isLoadingTeachers,
    isFetchingTeachers,
    isTeachersError,
    refetchTeachers,
    handleTeacherSelect,
    handleSubjectCheck,
    handleVisibleSubjectsCheck,
    handleSubmit,
  };
}
