import { useEffect, useMemo, useState } from "react";
import type { Exam, ExamAttempt } from "@/shared/types";
import type { StudentTaskTab } from "@/features/assessments/types/studentTask";
import {
  buildStudentTasks,
  filterStudentTasks,
  groupStudentTasksByDueDate,
} from "@/features/assessments/utils/studentTasks";

interface UseStudentTasksOptions {
  exams: Exam[];
  attempts?: ExamAttempt[];
}

export function useStudentTasks({
  exams,
  attempts = [],
}: UseStudentTasksOptions) {
  const [now, setNow] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<StudentTaskTab>("assigned");
  const [selectedCourseGroupId, setSelectedCourseGroupId] = useState("all");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "thisWeek",
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const tasks = useMemo(
    () => buildStudentTasks(exams, attempts, now),
    [exams, attempts, now]
  );
  const courseGroups = useMemo(() => {
    const groups = new Map<number, string>();
    tasks.forEach((task) => {
      if (task.courseGroup) {
        groups.set(task.courseGroup.id, task.courseGroup.groupName);
      }
    });

    return [...groups.entries()]
      .map(([id, groupName]) => ({ id, groupName }))
      .sort((first, second) =>
        first.groupName.localeCompare(second.groupName, "vi", {
          sensitivity: "base",
        })
      );
  }, [tasks]);
  const tabCounts = useMemo(
    () => ({
      assigned: tasks.filter((task) => task.status === "assigned").length,
      missing: tasks.filter((task) => task.status === "missing").length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [tasks]
  );
  const visibleTasks = useMemo(
    () => filterStudentTasks(tasks, activeTab, selectedCourseGroupId),
    [tasks, activeTab, selectedCourseGroupId]
  );
  const sections = useMemo(
    () => groupStudentTasksByDueDate(visibleTasks, now),
    [visibleTasks, now]
  );

  const changeTab = (tab: StudentTaskTab) => {
    setActiveTab(tab);
    setExpandedSections(["thisWeek"]);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((current) =>
      current.includes(sectionKey)
        ? current.filter((key) => key !== sectionKey)
        : [...current, sectionKey]
    );
  };

  return {
    activeTab,
    changeTab,
    selectedCourseGroupId,
    setSelectedCourseGroupId,
    courseGroups,
    tabCounts,
    sections,
    expandedSections,
    toggleSection,
    now,
  };
}
