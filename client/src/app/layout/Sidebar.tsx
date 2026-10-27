import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dropdown, Spin } from "antd";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Icon, QueryErrorAlert } from "@/shared/components/ui";
import Logo from "@/shared/components/ui/Logo/Logo";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { usePermissionNavigation } from "@/features/authorization/hooks/usePermissionNavigation";
import {
  getAuthenticatedRoleKind,
  getAuthenticatedUserRoleCode,
} from "@/shared/utils/role";
import { resolveSidebarSections } from "@/app/layout/sidebarNavigation";
import { cn } from "@/shared/utils/cn";
import {
  useAssignedTeaching,
  useStudentCourseGroups,
} from "@/features/classrooms/hooks/useCourseGroupQueries";
import { getFirstCharOfLastName } from "@/shared/utils/avatar";

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState("all");
  const [isClassListExpanded, setIsClassListExpanded] = useState(true);
  const { t, i18n } = useTranslation();
  const { user, role } = useAuthStore();
  const roleCode = getAuthenticatedUserRoleCode(user, role);
  const roleKind = getAuthenticatedRoleKind(user, role);
  const isAdmin = roleKind === "ADMIN";
  const isAdminWorkspace = isAdmin || roleKind === "CUSTOM";
  const isStudent = roleKind === "STUDENT";
  const isTeacher = roleKind === "TEACHER";
  const isPermissionNavigationWorkspace = isAdminWorkspace || isTeacher;
  const permissionNavigation = usePermissionNavigation({
    enabled: isPermissionNavigationWorkspace,
  });
  const { navigation } = permissionNavigation;
  const navigationRoleCode =
    user?.roleCode?.trim().toUpperCase() ||
    role?.code?.trim().toUpperCase() ||
    roleCode ||
    (roleKind === "CUSTOM" ? "CUSTOM" : null);
  const studentCourses = useStudentCourseGroups(
    isStudent ? (user?.id ?? null) : null
  );
  const teacherCourses = useAssignedTeaching(
    isTeacher ? (user?.id ?? null) : null,
    isTeacher
  );
  const classroomItems = isTeacher
    ? teacherCourses.courseGroups
    : (studentCourses.courseGroups ?? []);
  const visibleClassroomItems = classroomItems.filter(
    (group) =>
      !group.isHidden &&
      (!isTeacher ||
        teacherSubjectFilter === "all" ||
        String(group.subjectId) === teacherSubjectFilter)
  );
  const selectedTeacherSubject = teacherCourses.subjects.find(
    (subject) => String(subject.id) === teacherSubjectFilter
  );
  const teacherSubjectFilterLabel = selectedTeacherSubject
    ? `${selectedTeacherSubject.subjectCode} · ${selectedTeacherSubject.subjectName}`
    : t("coursePage.filterAllSubjects");
  const sections = resolveSidebarSections({
    permissionNavigationEnabled: permissionNavigation.isEnabled,
    navigation,
    hasSession: Boolean(user || role),
    roleCode: navigationRoleCode,
    roleDetails: role?.roleDetails ?? [],
    language: i18n.resolvedLanguage ?? i18n.language,
  });
  // Teachers keep the classroom navigation, with their authorized learning
  // management pages added as a separate section below.
  const visibleSections = isAdminWorkspace ? sections : [];
  const visibleTeacherSections = isTeacher ? sections : [];

  return (
    <aside
      className={cn(
        "flex h-dvh shrink-0 flex-col border-r border-other-divider bg-background-paper transition-[width] duration-200 print:hidden",
        isCollapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-center border-b border-other-divider px-3">
        {isCollapsed ? (
          <Icon name="logoIcon" size={32} aria-label="VinaClass" />
        ) : (
          <Logo className="text-h5" />
        )}
      </div>

      {isPermissionNavigationWorkspace &&
        permissionNavigation.isEnabled &&
        permissionNavigation.isLoading && (
          <div
            className={cn(
              "px-4 py-3 text-sm text-text-secondary",
              isCollapsed && "flex justify-center px-2"
            )}
            role="status"
          >
            <Spin size="small" />
            {!isCollapsed && (
              <span className="ml-2">
                {t("authorization.permissionLoading")}
              </span>
            )}
          </div>
        )}

      {isPermissionNavigationWorkspace &&
        permissionNavigation.isEnabled &&
        permissionNavigation.isError && (
          <QueryErrorAlert
            className="mx-3 my-2"
            message={t("authorization.permissionLoadError")}
            retryButtonVariant="link"
            onRetry={permissionNavigation.refetch}
            isRetrying={permissionNavigation.isFetching}
            retryLabel={t("authorization.retry")}
          />
        )}

      <nav
        id="primary-navigation"
        aria-label={t("sidebar.navigationLabel")}
        className="scroll-thin flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4"
      >
        {(isTeacher || isStudent) && (
          <section>
            <NavLink
              to="/courses"
              end
              className={({ isActive }) =>
                cn(
                  "text-body-2 group mb-2 flex min-h-11 items-center gap-3 rounded-full px-3 font-medium transition-colors",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary-background text-primary-main"
                    : "text-text-secondary hover:bg-action-hover hover:text-text-primary"
                )
              }
            >
              <Icon name="home" size={20} className="shrink-0" />
              {!isCollapsed && (
                <span className="min-w-0 flex-1 truncate">
                  {t("coursePage.home")}
                </span>
              )}
            </NavLink>
            {isTeacher &&
              visibleTeacherSections.map((section, sectionIndex) => (
                <section
                  key={`${section.title ?? "teacher-tools"}-${sectionIndex}`}
                  className="mb-4 border-b border-other-divider pb-3"
                >
                  {!isCollapsed && section.title && (
                    <h2 className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-disabled">
                      {section.titleText ?? t(section.title)}
                    </h2>
                  )}
                  <div className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        title={
                          isCollapsed
                            ? (item.labelText ?? t(item.labelKey))
                            : undefined
                        }
                        className={({ isActive }) =>
                          cn(
                            "text-body-2 group flex min-h-11 items-center gap-3 rounded-full px-3 font-medium transition-colors",
                            isCollapsed && "justify-center px-0",
                            isActive
                              ? "bg-primary-background text-primary-main"
                              : "text-text-secondary hover:bg-action-hover hover:text-text-primary"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              name={item.icon}
                              size={20}
                              className={cn(
                                "shrink-0",
                                isActive
                                  ? "text-primary-main"
                                  : "text-text-disabled group-hover:text-text-primary"
                              )}
                            />
                            {!isCollapsed && (
                              <span className="min-w-0 flex-1 truncate">
                                {item.labelText ?? t(item.labelKey)}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </section>
              ))}
            {!isCollapsed && (
              <div className="mb-2 flex items-center justify-between px-3">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-disabled">
                  {t(isTeacher ? "coursePage.teaching" : "coursePage.enrolled")}
                </h2>
                <button
                  type="button"
                  aria-label={t(
                    isClassListExpanded
                      ? "coursePage.collapseClassList"
                      : "coursePage.expandClassList"
                  )}
                  aria-expanded={isClassListExpanded}
                  title={t(
                    isClassListExpanded
                      ? "coursePage.collapseClassList"
                      : "coursePage.expandClassList"
                  )}
                  onClick={() =>
                    setIsClassListExpanded((expanded) => !expanded)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-hover hover:text-text-primary"
                >
                  {isClassListExpanded ? (
                    <ChevronUp size={17} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={17} aria-hidden="true" />
                  )}
                </button>
              </div>
            )}
            {isTeacher &&
              isClassListExpanded &&
              !isCollapsed &&
              teacherCourses.subjects.length > 0 && (
                <div className="mb-2 px-2">
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      selectable: true,
                      selectedKeys: [teacherSubjectFilter],
                      items: [
                        {
                          key: "all",
                          label: t("coursePage.filterAllSubjects"),
                        },
                        ...teacherCourses.subjects.map((subject) => ({
                          key: String(subject.id),
                          label: `${subject.subjectCode} · ${subject.subjectName}`,
                        })),
                      ],
                      onClick: ({ key }) => setTeacherSubjectFilter(key),
                    }}
                  >
                    <button
                      type="button"
                      aria-label={t("coursePage.filterSubject")}
                      title={t("coursePage.filterSubject")}
                      className="flex h-10 w-full items-center gap-2 rounded-xl border border-other-divider bg-background-paper px-3 text-left text-sm text-text-primary shadow-sm transition-colors hover:border-primary-main hover:bg-action-hover"
                    >
                      <Filter
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-primary-main"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {teacherSubjectFilterLabel}
                      </span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-text-disabled"
                      />
                    </button>
                  </Dropdown>
                </div>
              )}
            {isStudent && isClassListExpanded && (
              <NavLink
                to="/exams"
                title={isCollapsed ? t("coursePage.toDo") : undefined}
                className={({ isActive }) =>
                  cn(
                    "text-body-2 group mb-2 flex min-h-11 items-center gap-3 rounded-full px-3 font-medium transition-colors",
                    isCollapsed && "justify-center px-0",
                    isActive
                      ? "bg-primary-background text-primary-main"
                      : "text-text-secondary hover:bg-action-hover hover:text-text-primary"
                  )
                }
              >
                <Icon name="documentDuplicate" size={20} className="shrink-0" />
                {!isCollapsed && (
                  <span className="min-w-0 flex-1 truncate">
                    {t("coursePage.toDo")}
                  </span>
                )}
              </NavLink>
            )}
            {isClassListExpanded && (
              <div className="flex flex-col gap-1">
                {visibleClassroomItems.map((group) => (
                  <NavLink
                    key={group.id}
                    to={`/courses/${group.id}`}
                    title={isCollapsed ? group.groupName : undefined}
                    className={({ isActive }) =>
                      cn(
                        "text-body-2 group flex min-h-11 items-center gap-3 rounded-full px-3 font-medium transition-colors",
                        isCollapsed && "justify-center px-0",
                        isActive
                          ? "bg-primary-background text-primary-main"
                          : "text-text-secondary hover:bg-action-hover hover:text-text-primary"
                      )
                    }
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8eaed] text-xs font-semibold text-[#3c4043] dark:bg-background-body-background dark:text-text-secondary">
                      {getFirstCharOfLastName(group.groupName)}
                    </span>
                    {!isCollapsed && (
                      <span className="min-w-0 flex-1 truncate">
                        {group.groupName}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </section>
        )}

        {visibleSections.map((section, sectionIndex) => (
          <section key={`${section.title ?? "overview"}-${sectionIndex}`}>
            {!isCollapsed && (section.titleText || section.title) && (
              <h2 className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-disabled">
                {section.titleText ?? t(section.title as string)}
              </h2>
            )}

            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={
                    isCollapsed
                      ? (item.labelText ?? t(item.labelKey))
                      : undefined
                  }
                  className={({ isActive }) =>
                    cn(
                      "text-body-2 group flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium transition-colors",
                      isCollapsed && "justify-center px-0",
                      isActive
                        ? "bg-primary-background text-primary-main"
                        : "text-text-secondary hover:bg-action-hover hover:text-text-primary"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        name={item.icon}
                        size={20}
                        className={cn(
                          "shrink-0",
                          isActive
                            ? "text-primary-main"
                            : "text-text-disabled group-hover:text-text-primary"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="min-w-0 flex-1 truncate">
                          {item.labelText ?? t(item.labelKey)}
                        </span>
                      )}
                      {!isCollapsed && isActive && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-main" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
};
