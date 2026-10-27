import { Button, Icon } from "@/shared/components/ui";
import type { GroupDisplay } from "@/features/classrooms/types/courseGroupList";
import { ConfirmationModal } from "@/shared/components/ui/ConfirmationModal/ConfirmationModal";
import { Dropdown as AntDropdown } from "antd";
import {
  BookOpenCheck,
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  Trash2,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CourseGroupDetailsDialog } from "@/features/classrooms/components/CourseGroupDetailsDialog";

interface CourseGroupManagementCardProps {
  group: GroupDisplay;
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

const CARD_COLORS = ["#596f7a", "#008f83", "#3367d6", "#e77b5a", "#7955ba"];

export function CourseGroupManagementCard({
  group,
  openMenu,
  isProcessing,
  canViewStudentList,
  canUpdateGroup,
  canDeleteGroup,
  onToggleMenu,
  onEdit,
  onToggleStatus,
  onDelete,
}: CourseGroupManagementCardProps) {
  const { t, i18n } = useTranslation("common");
  const color = CARD_COLORS[Math.abs(group.id) % CARD_COLORS.length];
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isVisibilityConfirmOpen, setIsVisibilityConfirmOpen] = useState(false);
  const teacherName = group.teacher
    ? group.teacher.profile.fullName ||
      group.teacher.username ||
      t("courseGroup.teacherUnavailable")
    : t("courseGroup.teacherUnassigned");
  const teacherInitials = group.teacher
    ? teacherName
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toLocaleUpperCase(i18n.language)
    : "—";

  const closeMenu = () => {
    if (openMenu) onToggleMenu();
  };

  const openDetails = () => {
    closeMenu();
    setIsDetailsOpen(true);
  };

  const requestVisibilityChange = () => {
    closeMenu();
    setIsVisibilityConfirmOpen(true);
  };

  return (
    <article className="group relative flex min-h-[260px] min-w-0 flex-col overflow-visible rounded-2xl border border-other-outlined-border bg-background-paper shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <header
        className="relative min-h-[132px] overflow-visible rounded-t-2xl p-4 text-white"
        style={{ backgroundColor: color }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-2xl">
          <div
            aria-hidden="true"
            className="absolute -right-7 -top-12 h-40 w-40 rotate-12 rounded-[2rem] border-[18px] border-white/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 right-20 h-28 w-28 rounded-full bg-black/10"
          />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <BookOpenCheck size={20} aria-hidden="true" />
            </span>
            <span className="max-w-[150px] truncate rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium ring-1 ring-white/25">
              {t(
                group.status === "hidden"
                  ? "courseGroup.status.hidden"
                  : "courseGroup.status.active"
              )}
            </span>
          </div>

          <div className="relative z-20 shrink-0">
            <AntDropdown
              open={openMenu}
              trigger={["click"]}
              placement="bottomRight"
              getPopupContainer={() => document.body}
              popupRender={() => (
                <div
                  className="max-h-[min(320px,calc(100dvh-16px))] w-56 overflow-y-auto rounded-xl border border-other-outlined-border bg-background-paper p-1 text-text-primary shadow-lg"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MenuAction
                    icon={<Eye size={16} />}
                    label={t("courseGroup.viewDetails")}
                    disabled={isProcessing}
                    onClick={openDetails}
                  />
                  {canViewStudentList && (
                    <Link
                      to={`/course-group/${group.subjectId}/groups/${group.id}/students`}
                      className="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-[13px] leading-5 text-text-secondary hover:bg-action-hover hover:text-text-primary"
                      onClick={closeMenu}
                    >
                      <UserRoundCog size={16} aria-hidden="true" />
                      {t("courseGroup.manageMembers")}
                    </Link>
                  )}
                  {canUpdateGroup && (
                    <>
                      <MenuAction
                        icon={<Pencil size={16} />}
                        label={t("courseGroup.editInfo")}
                        disabled={isProcessing}
                        onClick={onEdit}
                      />
                      <MenuAction
                        icon={
                          group.status === "hidden" ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )
                        }
                        label={
                          group.status === "hidden"
                            ? t("courseGroup.showGroup")
                            : t("courseGroup.hideGroup")
                        }
                        disabled={isProcessing}
                        onClick={requestVisibilityChange}
                      />
                    </>
                  )}
                  {canDeleteGroup && (
                    <MenuAction
                      icon={<Trash2 size={16} />}
                      label={t("courseGroup.deleteGroup")}
                      disabled={isProcessing}
                      onClick={() => {
                        closeMenu();
                        onDelete();
                      }}
                      destructive
                    />
                  )}
                </div>
              )}
            >
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
                <Icon name="moreVertical" size={19} />
              </Button>
            </AntDropdown>
          </div>
        </div>

        <div className="relative z-10 mt-2.5 pr-2">
          <h3 className="line-clamp-2 min-h-10 break-words text-base font-semibold leading-5">
            {group.groupName}
          </h3>
          <p className="mt-1 line-clamp-1 text-[11px] text-white/85">
            {group.subject?.subjectName || t("courseGroup.subjectUnavailable")}
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="bg-custom-background-primary-background max-w-full truncate rounded-full px-3 py-1 text-[11px] font-semibold text-primary-main">
            {group.subject?.subjectCode || `#${group.subjectId}`}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-primary">
            <UsersRound
              size={16}
              className="text-text-secondary"
              aria-hidden="true"
            />
            {group.studentCount == null
              ? t("courseItem.classSizeUnavailable")
              : t("courseItem.classSize", {
                  count: group.studentCount,
                })}
          </span>
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-2.5">
          {group.teacher?.profile.avatarUrl ? (
            <img
              src={group.teacher.profile.avatarUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : group.teacher ? (
            <span className="bg-custom-background-primary-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-primary-main">
              {teacherInitials || "?"}
            </span>
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-action-hover text-text-secondary">
              <GraduationCap size={16} aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[9px] font-medium uppercase tracking-wide text-text-secondary">
              {t("courseGroup.teacherLabel")}
            </span>
            <span className="block truncate text-[11px] font-medium text-text-primary">
              {teacherName}
            </span>
          </span>
        </div>

        <div className="mt-auto border-t border-other-divider pt-3.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <CalendarDays size={15} aria-hidden="true" />
              {t("courseItem.academicInfo", {
                year: group.academicYear,
                semester: group.semester,
              })}
            </span>
          </div>
        </div>
      </div>

      <CourseGroupDetailsDialog
        group={group}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      <ConfirmationModal
        isOpen={isVisibilityConfirmOpen}
        onClose={() => setIsVisibilityConfirmOpen(false)}
        onConfirm={async () => {
          await onToggleStatus();
          setIsVisibilityConfirmOpen(false);
        }}
        title={t(
          group.status === "hidden"
            ? "courseGroup.confirmShowTitle"
            : "courseGroup.confirmHideTitle"
        )}
        message={t(
          group.status === "hidden"
            ? "courseGroup.confirmShowMessage"
            : "courseGroup.confirmHideMessage",
          { groupName: group.groupName }
        )}
        confirmLabel={t(
          group.status === "hidden"
            ? "courseGroup.showGroup"
            : "courseGroup.hideGroup"
        )}
        type="warning"
        isLoading={isProcessing}
      />
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
      className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] leading-5 text-text-secondary transition-colors hover:bg-action-hover hover:text-text-primary disabled:opacity-50 ${destructive ? "!text-alert-error-content" : ""}`}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
