import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Exam } from "@/shared/types";
import type { Notification } from "@/features/classrooms/types/classrooms";
import { useExamsByCourseGroupAndStudent } from "@/features/assessments/hooks/useExamQueries";
import { useCourseGroupStudentDetail } from "@/features/classrooms/hooks/useCourseGroupQueries";
import { useCourseGroupAnnouncementActions } from "@/features/classrooms/hooks/useCourseGroupAnnouncementActions";
import { useCourseStudentExamActions } from "@/features/classrooms/hooks/useCourseStudentExamActions";
import { useCourseElementPermissions } from "@/features/classrooms/hooks/useCourseElementPermissions";
import { useToastStore } from "@/shared/stores/useToastStore";
import {
  buildCourseGroupClasswork,
  findNearestUpcomingExam,
  mergeCourseGroupFeed,
} from "@/features/classrooms/utils/courseElementFeed";

const EMPTY_ANNOUNCEMENTS: Notification[] = [];
const EMPTY_EXAMS: Exam[] = [];

export function useCourseElementController() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("news");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { id } = useParams();
  const courseGroupId = Number(id);
  const isValidCourseGroupId =
    Number.isInteger(courseGroupId) && courseGroupId > 0;
  const {
    courseGroup,
    isLoading: isCourseGroupLoading,
    isFetching: isCourseGroupFetching,
    isError: isCourseGroupError,
    refetch: refetchCourseGroup,
  } = useCourseGroupStudentDetail(isValidCourseGroupId ? courseGroupId : 0);
  const announcements = courseGroup?.notifications ?? EMPTY_ANNOUNCEMENTS;
  const assignedExams = courseGroup?.exams ?? EMPTY_EXAMS;
  const students = courseGroup ? courseGroup.students : [];
  const teacher = courseGroup ? courseGroup.teacher : null;

  const {
    userId,
    isStudent,
    isTeacher,
    canViewMaterials,
    canCreateMaterials,
    canUpdateMaterials,
    canDeleteMaterials,
    canCreateAnnouncement,
    canCreateExam,
    canViewGrades,
    canDeleteAnnouncement,
  } = useCourseElementPermissions();
  const canPreviewExam = canViewGrades;
  const {
    exams,
    isLoading: isStudentExamsLoading,
    isFetching: isStudentExamsFetching,
    isError: isStudentExamsError,
    refetch: refetchStudentExams,
  } = useExamsByCourseGroupAndStudent(
    isStudent ? courseGroup?.id : undefined,
    isStudent ? userId : undefined
  );
  const {
    isResultModalOpen,
    closeResultModal,
    handleStartExam,
    handleViewResult,
    handlePreviewExam,
  } = useCourseStudentExamActions({
    isStudent,
    canPreviewExam,
  });
  const {
    isAnnouncementFormOpen,
    toggleAnnouncementForm,
    closeAnnouncementForm,
    handleSaveCreate,
    handleDeleteAnnouncement,
  } = useCourseGroupAnnouncementActions({ courseGroupId });

  const combinedFeed = useMemo(
    () => mergeCourseGroupFeed(announcements, assignedExams),
    [announcements, assignedExams]
  );
  const sortedClasswork = useMemo(
    () =>
      buildCourseGroupClasswork(isStudent, exams?.exams ?? [], assignedExams),
    [assignedExams, exams, isStudent]
  );
  const nearestUpcomingExam = findNearestUpcomingExam(sortedClasswork, now);

  const handleCreateExam = () =>
    navigate("/tests/add", { state: { courseGroup } });
  const retryStudentExams = () => void refetchStudentExams();
  const handleCopyJoinCode = async () => {
    if (!courseGroup?.joinCode) return;

    try {
      await navigator.clipboard.writeText(courseGroup.joinCode);
      showToast(t("courseElement.news.codeCopied"), "success");
    } catch {
      showToast(t("courseElement.news.codeCopyError"), "error");
    }
  };

  return {
    t,
    selectedTab,
    setSelectedTab,
    now,
    courseGroupId,
    isValidCourseGroupId,
    courseGroup,
    isCourseGroupLoading,
    isCourseGroupFetching,
    isCourseGroupError,
    refetchCourseGroup,
    students,
    teacher,
    isStudent,
    isTeacher,
    canViewMaterials,
    canCreateMaterials,
    canUpdateMaterials,
    canDeleteMaterials,
    canCreateAnnouncement,
    canCreateExam,
    canViewGrades,
    canPreviewExam,
    canDeleteAnnouncement,
    isStudentExamsLoading,
    isStudentExamsFetching,
    isStudentExamsError,
    isResultModalOpen,
    closeResultModal,
    handleStartExam,
    handleViewResult,
    handlePreviewExam,
    combinedFeed,
    sortedClasswork,
    nearestUpcomingExam,
    isAnnouncementFormOpen,
    toggleAnnouncementForm,
    closeAnnouncementForm,
    handleSaveCreate,
    handleDeleteAnnouncement,
    handleCreateExam,
    handleCopyJoinCode,
    retryStudentExams,
  };
}
