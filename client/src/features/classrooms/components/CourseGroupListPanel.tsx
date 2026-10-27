import { Empty } from "antd";
import { useTranslation } from "react-i18next";
import { CourseGroupManagementCard } from "@/features/classrooms/components/CourseGroupManagementCard";
import type { GroupDisplay } from "@/features/classrooms/types/courseGroupList";
import { AdminTablePanel } from "@/shared/components/admin";
import Pagination from "@/shared/components/ui/Pagination/Pagination";

interface CourseGroupListPanelProps {
  groups: GroupDisplay[];
  openMenu: number | null;
  isProcessing: boolean;
  canCreateGroup: boolean;
  canViewStudentList: boolean;
  canUpdateGroup: boolean;
  canDeleteGroup: boolean;
  currentPage: number;
  totalPages: number;
  hasGroups: boolean;
  totalGroupCount: number;
  onToggleMenu: (groupId: number) => void;
  onEditGroup: (group: GroupDisplay) => void;
  onToggleGroupStatus: (group: GroupDisplay) => void;
  onDeleteGroup: (groupId: number) => void;
  onCreateGroup: () => void;
  onPageChange: (page: number) => void;
}

export default function CourseGroupListPanel({
  groups,
  openMenu,
  isProcessing,
  canCreateGroup,
  canViewStudentList,
  canUpdateGroup,
  canDeleteGroup,
  currentPage,
  totalPages,
  hasGroups,
  totalGroupCount,
  onToggleMenu,
  onEditGroup,
  onToggleGroupStatus,
  onDeleteGroup,
  onCreateGroup,
  onPageChange,
}: CourseGroupListPanelProps) {
  const { t } = useTranslation("common");

  return (
    <AdminTablePanel
      title={
        <span className="flex flex-wrap items-center gap-2">
          {t("courseGroup.adminWorkspace.listTitle")}
          <span className="rounded-full bg-custom-background-primary-background px-2.5 py-0.5 text-xs font-semibold text-primary-main">
            {t("courseGroup.adminWorkspace.classCount", {
              count: totalGroupCount,
            })}
          </span>
        </span>
      }
      description={t("courseGroup.adminWorkspace.listDescription")}
      createAction={
        canCreateGroup
          ? {
              label: t("courseGroup.addGroup"),
              onClick: onCreateGroup,
              disabled: isProcessing,
            }
          : undefined
      }
    >
      {hasGroups ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {groups.map((group) => (
            <CourseGroupManagementCard
              key={group.id}
              group={group}
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
      ) : (
        <Empty
          className="my-8"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("courseGroup.noGroupsFound")}
        />
      )}
      {hasGroups && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </AdminTablePanel>
  );
}
