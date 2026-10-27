import StudentCourseGroupClasswork from "@/features/classrooms/components/StudentCourseGroupClasswork";
import TeacherCourseGroupClasswork from "@/features/classrooms/components/TeacherCourseGroupClasswork";
import CourseGroupClasswork from "@/features/classrooms/components/CourseGroupClasswork";
import type { StudentExam } from "@/shared/types";

interface CourseGroupClassworkTabProps {
  exams: StudentExam[];
  isStudent: boolean;
  isTeacher: boolean;
  canCreateExam: boolean;
  canPreviewExam: boolean;
  now: Date;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onCreateExam: () => void;
  onPreviewExam: (examId: number) => void;
  onStartExam: (examId: number) => void;
  onViewResult: (examAttemptId: number) => void;
  onRetry: () => void;
}

export default function CourseGroupClassworkTab({
  exams,
  isStudent,
  isTeacher,
  canCreateExam,
  canPreviewExam,
  now,
  isLoading,
  isFetching,
  isError,
  onCreateExam,
  onPreviewExam,
  onStartExam,
  onViewResult,
  onRetry,
}: CourseGroupClassworkTabProps) {
  if (isStudent) {
    return (
      <StudentCourseGroupClasswork
        exams={exams}
        now={now}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onStartExam={onStartExam}
        onViewResult={onViewResult}
        onRetry={onRetry}
      />
    );
  }

  if (isTeacher) {
    return (
      <TeacherCourseGroupClasswork
        exams={exams}
        canCreateExam={canCreateExam}
        canPreviewExam={canPreviewExam}
        now={now}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onCreateExam={onCreateExam}
        onPreviewExam={onPreviewExam}
        onRetry={onRetry}
      />
    );
  }

  return (
    <CourseGroupClasswork
      exams={exams}
      isStudent={false}
      now={now}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      onStartExam={onStartExam}
      onViewResult={onViewResult}
      onRetry={onRetry}
    />
  );
}
