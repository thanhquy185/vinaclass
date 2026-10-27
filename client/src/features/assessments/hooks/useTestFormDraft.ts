import { useEffect, useMemo } from "react";
import { Form } from "antd";
import type { CourseGroup, Exam, Subject } from "@/shared/types";
import type { TestFormValues } from "@/features/assessments/types/testForm";
import { useExamDraftStore } from "@/features/assessments/stores/useExamDraftStore";

interface UseTestFormDraftOptions {
  isAddMode: boolean;
  isEditMode: boolean;
  isViewMode: boolean;
  fromQuestions: boolean;
  urlId: number | null;
  exam?: Exam;
  testData: Partial<Exam> | null;
  contextualCourseGroup?: CourseGroup;
  availableSubjects: Subject[];
  availableCourseGroups: CourseGroup[];
  isLoadingSubjectOptions: boolean;
}

export function useTestFormDraft({
  isAddMode,
  isEditMode,
  isViewMode,
  fromQuestions,
  urlId,
  exam,
  testData,
  contextualCourseGroup,
  availableSubjects,
  availableCourseGroups,
  isLoadingSubjectOptions,
}: UseTestFormDraftOptions) {
  const initTestData = useExamDraftStore((store) => store.initTestData);
  const setTestData = useExamDraftStore((store) => store.setTestData);
  const updateTestData = useExamDraftStore((store) => store.updateTestData);
  const updateConfiguration = useExamDraftStore(
    (store) => store.updateExamConfiguration,
  );
  const resetStore = useExamDraftStore((store) => store.resetStore);
  const [form] = Form.useForm<TestFormValues>();

  const selectedSubjectId =
    testData?.subject?.id ?? testData?.subjectId ?? undefined;
  const selectedCourseGroupIds = useMemo(
    () => testData?.courseGroups?.map((group) => group.id) ?? [],
    [testData?.courseGroups],
  );

  useEffect(() => {
    if (!isAddMode || fromQuestions) return;

    resetStore();
    initTestData();
  }, [fromQuestions, initTestData, isAddMode, resetStore]);

  useEffect(() => {
    if (!exam || (!isEditMode && !isViewMode)) return;

    const isDifferentExam = testData?.id !== urlId;
    const hasNoExamName = !testData?.examName;
    if (isViewMode || isDifferentExam || hasNoExamName) setTestData(exam);
  }, [
    exam,
    isEditMode,
    isViewMode,
    setTestData,
    testData?.examName,
    testData?.id,
    urlId,
  ]);

  useEffect(() => {
    if (!isAddMode || !contextualCourseGroup || isLoadingSubjectOptions) return;

    const subject = availableSubjects.find(
      (item) => item.id === contextualCourseGroup.subjectId,
    );
    if (!subject) return;

    updateTestData({
      subjectId: subject.id,
      subject,
      courseGroups: [contextualCourseGroup],
    });
  }, [
    availableSubjects,
    contextualCourseGroup,
    isAddMode,
    isLoadingSubjectOptions,
    updateTestData,
  ]);

  useEffect(() => {
    form.setFieldsValue({
      examName: testData?.examName ?? "",
      startTime: testData?.startTime ?? "",
      endTime: testData?.endTime ?? "",
      durationMinutes: testData?.durationMinutes ?? null,
      subjectId: selectedSubjectId,
      courseGroupIds: selectedCourseGroupIds,
    });
  }, [
    form,
    selectedCourseGroupIds,
    selectedSubjectId,
    testData?.durationMinutes,
    testData?.endTime,
    testData?.examName,
    testData?.startTime,
  ]);

  const handleFormValuesChange = (
    changedValues: Record<string, unknown>,
    values: Record<string, unknown>,
  ) => {
    const updates: Partial<Exam> = {};

    if ("examName" in changedValues) {
      updates.examName = String(values.examName ?? "");
    }
    if ("startTime" in changedValues) {
      updates.startTime = String(values.startTime ?? "");
    }
    if ("endTime" in changedValues) {
      updates.endTime = String(values.endTime ?? "");
    }
    if ("durationMinutes" in changedValues) {
      updates.durationMinutes = Number(values.durationMinutes ?? 0);
    }
    if ("subjectId" in changedValues) {
      const subject = availableSubjects.find(
        (item) => item.id === Number(values.subjectId),
      );
      updates.subjectId = subject?.id ?? 0;
      updates.subject = subject;
      updates.courseGroups = [];
      form.setFieldsValue({ courseGroupIds: [] });
      form.setFields([{ name: "courseGroupIds", errors: [] }]);
    } else if ("courseGroupIds" in changedValues) {
      const selectedIds = Array.isArray(values.courseGroupIds)
        ? values.courseGroupIds.map(Number)
        : [];
      updates.courseGroups = availableCourseGroups.filter((group) =>
        selectedIds.includes(group.id),
      );
    }

    if (Object.keys(updates).length > 0) updateTestData(updates);
  };

  return {
    testData,
    updateConfiguration,
    updateTestData,
    form,
    handleFormValuesChange,
  };
}
