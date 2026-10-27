import { Empty } from "antd";
import {
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui";
import { AdminPanel } from "@/shared/components/admin";
import Pagination from "@/shared/components/ui/Pagination/Pagination";
import CourseGroupFiltersPanel from "@/features/classrooms/components/CourseGroupFiltersPanel";
import type {
  CourseGroupSearchCriterion,
  CourseStatus,
  GroupDisplay,
  GroupSection,
} from "@/features/classrooms/types/courseGroupList";

interface TeacherCourseGroupWorkspaceProps {
  sections: GroupSection[];
  visibleGroups: GroupDisplay[];
  collapsedSections: Record<string, boolean>;
  openMenu: number | null;
  isProcessing: boolean;
  canCreateGroup: boolean;
  canViewStudentList: boolean;
  canUpdateGroup: boolean;
  canDeleteGroup: boolean;
  currentPage: number;
  totalPages: number;
  hasSections: boolean;
  hasGroups: boolean;
  statusFilter: CourseStatus;
  searchValue: string;
  searchBy: CourseGroupSearchCriterion;
  onStatusChange: (status: CourseStatus) => void;
  onSearchChange: (value: string) => void;
  onSearchByChange: (criterion: CourseGroupSearchCriterion) => void;
  onCreateGroup: () => void;
  onToggleSection: (sectionKey: string) => void;
  onToggleMenu: (groupId: number) => void;
  onEditGroup: (group: GroupDisplay) => void;
  onToggleGroupStatus: (group: GroupDisplay) => void;
  onDeleteGroup: (groupId: number) => void;
  onPageChange: (page: number) => void;
}

const CARD_COLORS = ["#536d79", "#128c82", "#3473d9", "#ed8067", "#7155aa"];

export default function TeacherCourseGroupWorkspace({
  sections,
  visibleGroups,
  collapsedSections,
  openMenu,
  isProcessing,
  canCreateGroup,
  canViewStudentList,
  canUpdateGroup,
  canDeleteGroup,
  currentPage,
  totalPages,
  hasSections,
  hasGroups,
  statusFilter,
  searchValue,
  searchBy,
  onStatusChange,
  onSearchChange,
  onSearchByChange,
  onCreateGroup,
  onToggleSection,
  onToggleMenu,
  onEditGroup,
  onToggleGroupStatus,
  onDeleteGroup,
  onPageChange,
}: TeacherCourseGroupWorkspaceProps) {
  const { t } = useTranslation();
  const subjectCount = new Set(visibleGroups.map((group) => group.subjectId))
    .size;
  const studentCount = visibleGroups.reduce(
    (sum, group) => sum + (group.studentCount ?? 0),
    0
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <AdminPanel as="header" className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="bg-custom-background-primary-background inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary-main">
              <BookOpenCheck size={15} aria-hidden="true" />
              {t("courseGroup.teacherWorkspace.eyebrow")}
            </span>
            <h1 className="text-h4 mt-3 font-semibold tracking-tight text-text-primary">
              {t("courseGroup.teacherWorkspace.title")}
            </h1>
            <p className="text-body-2 mt-2 leading-6 text-text-secondary">
              {t("courseGroup.teacherWorkspace.description")}
            </p>
          </div>
          {canCreateGroup && (
            <Button
              variant="contained"
              color="primary"
              onClick={onCreateGroup}
              className="!rounded-lg !px-5"
            >
              <Plus size={18} aria-hidden="true" />
              {t("coursePage.createClass")}
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={<BookOpenCheck size={18} aria-hidden="true" />}
            label={t("courseGroup.teacherWorkspace.stats.classes")}
            value={visibleGroups.length}
          />
          <SummaryCard
            icon={<ShieldCheck size={18} aria-hidden="true" />}
            label={t("courseGroup.teacherWorkspace.stats.subjects")}
            value={subjectCount}
          />
          <SummaryCard
            icon={<UsersRound size={18} aria-hidden="true" />}
            label={t("courseGroup.teacherWorkspace.stats.students")}
            value={studentCount}
          />
        </div>
      </AdminPanel>

      <CourseGroupFiltersPanel
        isTeacher
        statusFilter={statusFilter}
        searchValue={searchValue}
        searchBy={searchBy}
        canReset={
          statusFilter !== "active" ||
          searchValue.length > 0 ||
          searchBy !== "groupName"
        }
        onStatusChange={onStatusChange}
        onSearchChange={onSearchChange}
        onSearchByChange={onSearchByChange}
        onReset={() => {
          onStatusChange("active");
          onSearchChange("");
          onSearchByChange("groupName");
        }}
      />

      {hasSections ? (
        <div className="space-y-5">
          {sections.map((section) => {
            const isCollapsed = collapsedSections[section.key] ?? false;
            const toggleLabel = isCollapsed
              ? t("courseGroup.showGroup")
              : t("courseGroup.hideGroup");

            return (
              <section
                key={section.key}
                className="rounded-xl border border-other-outlined-border bg-background-paper p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-other-divider pb-3">
                  <div>
                    <h2 className="text-body-1 font-semibold text-text-primary">
                      {section.title}
                    </h2>
                    <p className="text-caption mt-0.5 text-text-secondary">
                      {t("courseGroup.teacherWorkspace.classCount", {
                        count: section.groups.length,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    color="standard"
                    size="small"
                    isButtonIcon
                    aria-label={toggleLabel}
                    aria-expanded={!isCollapsed}
                    tooltip={toggleLabel}
                    onClick={() => onToggleSection(section.key)}
                  >
                    {isCollapsed ? (
                      <ChevronDown size={18} aria-hidden="true" />
                    ) : (
                      <ChevronUp size={18} aria-hidden="true" />
                    )}
                  </Button>
                </div>

                {!isCollapsed && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {section.groups.map((group) => (
                      <TeacherCourseGroupCard
                        key={group.id}
                        group={group}
                        color={CARD_COLORS[group.id % CARD_COLORS.length]}
                        openMenu={openMenu === group.id}
                        isProcessing={isProcessing}
                        canViewStudentList={canViewStudentList}
                        canUpdateGroup={canUpdateGroup}
                        canDeleteGroup={canDeleteGroup}
                        onToggleMenu={() => onToggleMenu(group.id)}
                        onEdit={() => onEditGroup(group)}
                        onToggleStatus={() => onToggleGroupStatus(group)}
                        onDelete={() => onDeleteGroup(group.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-other-outlined-border bg-background-paper px-5 py-14 text-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("courseGroup.teacherWorkspace.empty")}
          />
          {canCreateGroup && (
            <Button
              variant="outline"
              color="primary"
              onClick={onCreateGroup}
              className="mt-2 rounded-lg"
            >
              <Plus size={17} aria-hidden="true" />
              {t("coursePage.createClass")}
            </Button>
          )}
        </div>
      )}

      {hasGroups && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
      {!hasGroups && searchValue.trim() && (
        <p className="text-center text-sm text-text-secondary">
          {t("courseGroup.noGroupsFound")}
        </p>
      )}
      {isProcessing && (
        <p className="text-right text-xs text-text-secondary">
          {t("tableActions.loading")}
        </p>
      )}
    </div>
  );
}

interface TeacherCourseGroupCardProps {
  group: GroupDisplay;
  color: string;
  openMenu: boolean;
  isProcessing: boolean;
  canViewStudentList: boolean;
  canUpdateGroup: boolean;
  canDeleteGroup: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function TeacherCourseGroupCard({
  group,
  color,
  openMenu,
  isProcessing,
  canViewStudentList,
  canUpdateGroup,
  canDeleteGroup,
  onToggleMenu,
  onEdit,
  onToggleStatus,
  onDelete,
}: TeacherCourseGroupCardProps) {
  const { t } = useTranslation();

  return (
    <article className="group relative overflow-visible rounded-xl border border-other-outlined-border bg-background-paper shadow-sm transition-shadow hover:shadow-md">
      <div
        className="relative min-h-36 overflow-hidden rounded-t-xl p-5 text-white"
        style={{ backgroundColor: color }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-5 -top-10 h-36 w-36 rotate-12 rounded-[2rem] border-[18px] border-white/10"
        />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <Link to={`/courses/${group.id}`} className="min-w-0 flex-1">
            <h3 className="line-clamp-2 break-words pr-2 text-xl font-semibold leading-7 hover:underline">
              {group.groupName}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-white/85">
              {group.subject?.subjectName ||
                t("courseGroup.subjectUnavailable")}
            </p>
          </Link>
          <div className="relative z-20 shrink-0">
            <Button
              variant="text"
              color="standard"
              isButtonIcon
              aria-label={t("courseGroup.groupActions", {
                groupName: group.groupName,
              })}
              aria-expanded={openMenu}
              className="!text-white hover:!bg-white/15"
              onClick={(event) => {
                event.stopPropagation();
                onToggleMenu();
              }}
            >
              <EllipsisVertical size={20} aria-hidden="true" />
            </Button>

            {openMenu && (
              <div
                className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-other-outlined-border bg-background-paper p-1 text-text-primary shadow-lg"
                onClick={(event) => event.stopPropagation()}
              >
                {canViewStudentList && (
                  <Link
                    to={`/course-group/${group.subjectId}/groups/${group.id}/students`}
                    className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-action-hover hover:text-text-primary"
                  >
                    {t("courseGroup.manageMembers")}
                  </Link>
                )}
                {canUpdateGroup && (
                  <>
                    <MenuAction
                      icon={<Pencil size={16} aria-hidden="true" />}
                      label={t("courseGroup.editInfo")}
                      disabled={isProcessing}
                      onClick={onEdit}
                    />
                    <MenuAction
                      icon={<ShieldCheck size={16} aria-hidden="true" />}
                      label={
                        group.status === "hidden"
                          ? t("courseGroup.showGroup")
                          : t("courseGroup.hideGroup")
                      }
                      disabled={isProcessing}
                      onClick={onToggleStatus}
                    />
                  </>
                )}
                {canDeleteGroup && (
                  <MenuAction
                    icon={<Trash2 size={16} aria-hidden="true" />}
                    label={t("courseGroup.deleteGroup")}
                    disabled={isProcessing}
                    onClick={onDelete}
                    destructive
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link to={`/courses/${group.id}`} className="block p-5">
        <div className="flex items-center justify-between gap-3 text-sm text-text-secondary">
          <span className="truncate font-medium text-text-primary">
            {group.subject?.subjectCode || `#${group.subjectId}`}
          </span>
          {group.status === "hidden" && (
            <span className="shrink-0 rounded-full bg-action-hover px-2.5 py-1 text-xs">
              {t("courseGroup.status.hidden")}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-other-divider pt-4 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <UsersRound size={16} aria-hidden="true" />
            {group.studentCount == null
              ? t("courseItem.classSizeUnavailable")
              : t("courseItem.classSize", { count: group.studentCount })}
          </span>
          <span>
            {group.academicYear} ·{" "}
            {t("courseItem.semesterShort", { semester: group.semester })}
          </span>
        </div>
      </Link>
    </article>
  );
}

function MenuAction({
  icon,
  label,
  disabled,
  onClick,
  destructive = false,
}: {
  icon: ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-action-hover hover:text-text-primary disabled:opacity-50 ${destructive ? "!text-alert-error-content" : ""}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-other-outlined-border bg-background-body-background p-4">
      <span className="bg-custom-background-primary-background flex h-10 w-10 items-center justify-center rounded-lg text-primary-main">
        {icon}
      </span>
      <div>
        <p className="text-caption text-text-secondary">{label}</p>
        <p className="text-h6 mt-0.5 font-semibold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}
